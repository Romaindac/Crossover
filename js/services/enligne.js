// ==========================================================
// JEU EN LIGNE : comptes, sauvegarde, classement (Supabase)
// Appels HTTP directs, sans bibliotheque. Le compte se fait avec un
// pseudo et un mot de passe : l'adresse mail est fabriquee a partir
// du pseudo et ne recoit jamais rien.
// ==========================================================

import { SUPABASE_URL, SUPABASE_CLE, enLigneDisponible } from "../donnees/config-enligne.js";
import { lire, ecrire } from "./sauvegarde.js";
import { numeroSemaine } from "../donnees/tour.js";

export { enLigneDisponible };

const CLE_SESSION = "session";
// L'adresse technique d'un compte, fabriquee a partir du pseudo. Supabase exige un domaine
// qui existe vraiment (avec un serveur de mail) : un domaine invente est refuse.
// Aucun mail n'y est jamais envoye : la confirmation est desactivee, et le service de mail
// integre de Supabase n'ecrit qu'aux membres du projet. (Si un jour on branche un SMTP
// a soi, il faudra passer a un domaine qui nous appartient.)
const DOMAINE_COMPTES = "gmail.com";
const PREFIXE_COMPTES = "crossoverjeu.";
const ANCIEN_DOMAINE = "joueurs.crossover.jeu";
export const PSEUDO_VALIDE = /^[A-Za-z0-9_-]{3,20}$/;

let session = lire(CLE_SESSION, null);

export const connecte = () => Boolean(session?.jeton);
export const pseudoConnecte = () => session?.pseudo ?? null;
export const monId = () => session?.id ?? null;

function garderSession(donnees, pseudo) {
  session = {
    jeton: donnees.access_token,
    rafraichir: donnees.refresh_token,
    expire: Date.now() + (donnees.expires_in ?? 3600) * 1000,
    id: donnees.user?.id ?? session?.id,
    pseudo: pseudo ?? session?.pseudo,
  };
  ecrire(CLE_SESSION, session);
}

export function deconnecter() {
  session = null;
  ecrire(CLE_SESSION, null);
}

// Traduit les erreurs du serveur en phrases simples
function messageErreur(corps, statut) {
  const brutOriginal = `${corps?.msg ?? corps?.message ?? corps?.error_description ?? corps?.error ?? ""}`.slice(0, 160);
  const brut = brutOriginal.toLowerCase();
  if (brut.includes("already registered") || brut.includes("already exists") || brut.includes("duplicate")) return "Ce pseudo est déjà pris.";
  if (brut.includes("invalid login") || brut.includes("invalid_grant") || brut.includes("invalid credentials")) return "Pseudo ou mot de passe incorrect.";
  if (brut.includes("email") && brut.includes("disabled")) return "Les comptes par mail sont désactivés dans Supabase : Authentication > Sign In / Providers > Email, à activer.";
  if (brut.includes("email") && (brut.includes("invalid") || brut.includes("valid"))) return `Le serveur refuse l'adresse technique du compte. Préviens le créateur du jeu avec ce message : « ${brutOriginal} »`;
  if (brut.includes("signups not allowed") || brut.includes("signup is disabled")) return "Les inscriptions sont fermées dans Supabase (Authentication > Sign In / Providers > Allow new users to sign up).";
  if (brut.includes("password")) return "Mot de passe trop court (6 caractères minimum).";
  if (brut.includes("email not confirmed")) return "Le serveur demande une confirmation par mail : il faut la désactiver dans Supabase.";
  if (brut.includes("objet refuse")) return "Le serveur refuse cet objet : ses stats sont impossibles.";
  if (brut.includes("limite ventes jour")) return "5 mises en vente par jour au maximum.";
  if (brut.includes("limite ventes actives")) return "8 objets en vente en même temps au maximum.";
  if (brut.includes("indisponible")) return "Ce n'est plus disponible (déjà pris, annulé ou expiré).";
  if (brut.includes("limite tentatives")) return "Déjà 3 tentatives comptées aujourd'hui pour le boss collectif.";
  if (brut.includes("degats refuses")) return "Score refusé par le serveur.";
  if (brut.includes("semaine refusee")) return "La semaine du boss a changé : recharge la page.";
  if (brut.includes("raretes differentes")) return "Un échange se fait entre deux cartes de même rareté.";
  if (brut.includes("perso inconnu")) return "Perso inconnu du serveur : recolle le fichier SQL dans Supabase.";
  if (brut.includes("limite echanges jour")) return "10 offres d'échange par jour au maximum.";
  if (brut.includes("limite echanges ouverts")) return "5 offres d'échange ouvertes en même temps au maximum.";
  if (brut.includes("trop rapide")) return "Doucement : un message toutes les 2 secondes.";
  if (brut.includes("bloque")) return "Ce joueur ne reçoit pas tes messages.";
  if (statut === 429) return "Trop d'essais : attends une minute.";
  return `Le serveur ne répond pas comme prévu${brutOriginal ? ` (« ${brutOriginal} »)` : ""}. Réessaie plus tard.`;
}

async function appel(chemin, { methode = "GET", corps, entetes = {}, authentifie = false } = {}) {
  if (!enLigneDisponible()) throw new Error("Le jeu en ligne n'est pas activé.");
  if (authentifie) await jetonFrais();
  let reponse;
  try {
    reponse = await fetch(SUPABASE_URL.replace(/\/$/, "") + chemin, {
      method: methode,
      headers: {
        apikey: SUPABASE_CLE,
        // Connecte : le jeton du joueur. Sinon, seule une ancienne cle « anon » (un jeton eyJ...)
        // va aussi dans Authorization ; les nouvelles cles « publishable » (sb_publishable_...) non.
        ...(authentifie ? { Authorization: `Bearer ${session.jeton}` }
          : SUPABASE_CLE.startsWith("eyJ") ? { Authorization: `Bearer ${SUPABASE_CLE}` } : {}),
        "Content-Type": "application/json",
        ...entetes,
      },
      body: corps === undefined ? undefined : JSON.stringify(corps),
    });
  } catch {
    throw new Error("Pas de connexion au serveur. Vérifie ton internet.");
  }
  const texte = await reponse.text();
  let donnees = null;
  try { donnees = texte ? JSON.parse(texte) : null; } catch { donnees = null; }
  if (!reponse.ok) throw new Error(messageErreur(donnees, reponse.status));
  return donnees;
}

// Renouvelle le jeton une minute avant qu'il expire
async function jetonFrais() {
  if (!session?.jeton) throw new Error("Connecte-toi d'abord.");
  if (Date.now() < session.expire - 60000) return;
  try {
    const d = await appel("/auth/v1/token?grant_type=refresh_token", { methode: "POST", corps: { refresh_token: session.rafraichir } });
    garderSession(d);
  } catch {
    deconnecter();
    throw new Error("Ta session a expiré : reconnecte-toi.");
  }
}

const adresse = (pseudo) => `${PREFIXE_COMPTES}${pseudo.toLowerCase()}@${DOMAINE_COMPTES}`;
const ancienneAdresse = (pseudo) => `${pseudo.toLowerCase()}@${ANCIEN_DOMAINE}`;

export async function inscrire(pseudo, motDePasse) {
  if (!PSEUDO_VALIDE.test(pseudo)) throw new Error("Pseudo : 3 à 20 lettres, chiffres, - ou _.");
  // Pseudo deja pris par un autre joueur ?
  const pris = await appel(`/rest/v1/joueurs?select=id&pseudo=ilike.${encodeURIComponent(pseudo)}`);
  if (pris?.length) throw new Error("Ce pseudo est déjà pris.");
  const d = await appel("/auth/v1/signup", { methode: "POST", corps: { email: adresse(pseudo), password: motDePasse, data: { pseudo } } });
  if (!d?.access_token) throw new Error("Le serveur demande une confirmation par mail : il faut la désactiver dans Supabase.");
  garderSession(d, pseudo);
}

export async function connecter(pseudo, motDePasse) {
  const essai = (email) => appel("/auth/v1/token?grant_type=password", { methode: "POST", corps: { email, password: motDePasse } });
  let d;
  try {
    d = await essai(adresse(pseudo));
  } catch (e) {
    // Un compte cree avec l'ancienne adresse technique ?
    d = await essai(ancienneAdresse(pseudo)).catch(() => { throw e; });
  }
  garderSession(d, pseudo);
  // Le pseudo exact (majuscules) est celui du classement
  const ligne = await appel(`/rest/v1/joueurs?select=pseudo&id=eq.${session.id}`, { authentifie: true }).catch(() => null);
  if (ligne?.[0]?.pseudo) garderSession(d, ligne[0].pseudo);
}

const upsert = { Prefer: "resolution=merge-duplicates,return=minimal" };

export async function envoyerSauvegarde(donnees) {
  await appel("/rest/v1/sauvegardes", { methode: "POST", authentifie: true, entetes: upsert,
    corps: { id: session.id, donnees, maj: new Date().toISOString() } });
}

// Renvoie { donnees, maj } ou null si rien n'est encore sauvegarde
export async function recupererSauvegarde() {
  const lignes = await appel(`/rest/v1/sauvegardes?select=donnees,maj&id=eq.${session.id}`, { authentifie: true });
  return lignes?.[0] ?? null;
}

// Met a jour la ligne publique : scores et vitrine
export async function publierProfil(resume, vitrine) {
  await appel("/rest/v1/joueurs", { methode: "POST", authentifie: true, entetes: upsert,
    corps: { id: session.id, pseudo: session.pseudo, ...resume, vitrine, maj: new Date().toISOString() } });
}

export const CLASSEMENTS = {
  semaine: { nom: "Boss cette semaine", ordre: "boss_semaine.desc", semaine: true, valeur: (j) => `${j.boss_semaine.toLocaleString("fr-FR")} dégâts` },
  tour: { nom: "Tour", ordre: "tour.desc", valeur: (j) => `étage ${j.tour}` },
  raid: { nom: "Record au boss", ordre: "raid.desc", valeur: (j) => `${j.raid.toLocaleString("fr-FR")} dégâts` },
  collection: { nom: "Collection", ordre: "collection.desc,etoiles.desc", valeur: (j) => `${j.collection} persos, ${j.etoiles} étoiles` },
};

export async function classement(cle, limite = 50) {
  const c = CLASSEMENTS[cle];
  const filtre = c.semaine ? `&semaine=eq.${numeroSemaine()}&boss_semaine=gt.0` : "";
  return appel(`/rest/v1/joueurs?select=pseudo,tour,raid,collection,etoiles,boss_semaine,semaine,vitrine&order=${c.ordre}${filtre}&limit=${limite}`);
}

// ---------- Chat ----------

export const CANAUX = [
  { id: "general", nom: "Général", texte: "Discussion libre entre joueurs." },
  { id: "entraide", nom: "Entraide", texte: "Questions, équipes, synergies : on s'aide." },
  { id: "echanges", nom: "Échanges", texte: "Parler des cartes qu'on cherche et qu'on a en trop." },
];

const minimal = { Prefer: "return=minimal" };
const champsMessage = "id,canal,auteur,pseudo,texte,cree";

// Les messages d'un canal, du plus ancien au plus recent (apres l'id donne)
export async function messagesCanal(canal, apresId = 0, limite = 60) {
  const lignes = await appel(`/rest/v1/messages?select=${champsMessage}&canal=eq.${canal}&id=gt.${apresId}&order=id.desc&limit=${limite}`, { authentifie: true });
  return (lignes ?? []).reverse();
}

export async function envoyerMessage(canal, texte) {
  await appel("/rest/v1/messages", { methode: "POST", authentifie: true, entetes: minimal, corps: { canal, texte } });
}

export async function effacerMessage(id) {
  await appel(`/rest/v1/messages?id=eq.${Number(id)}`, { methode: "DELETE", authentifie: true, entetes: minimal });
}

// Tous mes messages prives (envoyes et recus) apres l'id donne
export async function messagesPrives(apresId = 0) {
  const moi = session.id;
  const lignes = await appel(`/rest/v1/prives?select=id,de,a,texte,lu,cree&or=(de.eq.${moi},a.eq.${moi})&id=gt.${apresId}&order=id.desc&limit=300`, { authentifie: true });
  return (lignes ?? []).reverse();
}

export async function envoyerPrive(a, texte) {
  await appel("/rest/v1/prives", { methode: "POST", authentifie: true, entetes: minimal, corps: { a, texte } });
}

export async function marquerLus(de) {
  await appel(`/rest/v1/prives?a=eq.${session.id}&de=eq.${de}&lu=eq.false`, { methode: "PATCH", authentifie: true, entetes: minimal, corps: { lu: true } });
}

export async function nombreNonLus() {
  if (!connecte()) return 0;
  const lignes = await appel(`/rest/v1/prives?select=id&a=eq.${session.id}&lu=eq.false&limit=99`, { authentifie: true });
  return lignes?.length ?? 0;
}

const champsJoueur = "id,pseudo,tour,raid,collection,etoiles,boss_semaine,semaine,vitrine";

export async function joueursParIds(ids) {
  const liste = [...new Set(ids)].filter((id) => /^[0-9a-f-]{36}$/.test(id));
  if (!liste.length) return [];
  return appel(`/rest/v1/joueurs?select=${champsJoueur}&id=in.(${liste.join(",")})`, { authentifie: true });
}

export async function chercherJoueurs(debut) {
  const propre = String(debut).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20);
  if (propre.length < 2) return [];
  return appel(`/rest/v1/joueurs?select=${champsJoueur}&pseudo=ilike.${propre}*&limit=8`, { authentifie: true });
}

export async function mesBlocages() {
  const lignes = await appel("/rest/v1/blocages?select=bloque", { authentifie: true });
  return (lignes ?? []).map((l) => l.bloque);
}

export async function bloquer(id) {
  await appel("/rest/v1/blocages", { methode: "POST", authentifie: true, entetes: { Prefer: "resolution=ignore-duplicates,return=minimal" }, corps: { bloque: id } });
}

export async function debloquer(id) {
  await appel(`/rest/v1/blocages?bloque=eq.${id}`, { methode: "DELETE", authentifie: true, entetes: minimal });
}

export async function signaler({ cible, messageId = null, texte = "", raison = "" }) {
  await appel("/rest/v1/signalements", { methode: "POST", authentifie: true, entetes: minimal,
    corps: { cible, message_id: messageId, texte: String(texte).slice(0, 500), raison: String(raison).slice(0, 300) } });
}

export async function suisModerateur() {
  const lignes = await appel(`/rest/v1/moderateurs?select=id&id=eq.${session.id}`, { authentifie: true }).catch(() => []);
  return Boolean(lignes?.length);
}

// Messages prives non lus : garde en memoire pour la barre de navigation
let nonLus = 0;
export const nonLusEnMemoire = () => nonLus;
export async function rafraichirNonLus() {
  try {
    nonLus = await nombreNonLus();
  } catch {
    return nonLus;
  }
  window.dispatchEvent(new CustomEvent("crossover:non-lus", { detail: nonLus }));
  return nonLus;
}

// ---------- Hotel des ventes ----------

export const DUREE_VENTE_JOURS = 3;
export const TAXE_VENTE = 0.05;
export const PRIX_VENTE = { min: 10, max: 20000 };
const champsVente = "id,vendeur,pseudo,objet,objet_id,rarete,emplacement,prix,statut,cree,vendue,recupere";

// Les annonces en cours (3 derniers jours), filtrees et triees
export async function annonces({ emplacement = "tous", rarete = "toutes", tri = "recent" } = {}) {
  const depuis = new Date(Date.now() - DUREE_VENTE_JOURS * 86400000).toISOString();
  const filtres = [`statut=eq.en_vente`, `cree=gt.${encodeURIComponent(depuis)}`];
  if (emplacement !== "tous") filtres.push(`emplacement=eq.${emplacement}`);
  if (rarete !== "toutes") filtres.push(`rarete=eq.${rarete}`);
  const ordre = { recent: "cree.desc", "prix-bas": "prix.asc", "prix-haut": "prix.desc" }[tri] ?? "cree.desc";
  return appel(`/rest/v1/ventes?select=${champsVente}&${filtres.join("&")}&order=${ordre}&limit=60`, { authentifie: true });
}

export async function mesVentes() {
  return appel(`/rest/v1/ventes?select=${champsVente}&vendeur=eq.${session.id}&order=cree.desc&limit=40`, { authentifie: true });
}

export async function mettreEnVente(objet, prix) {
  await appel("/rest/v1/ventes", { methode: "POST", authentifie: true, entetes: minimal, corps: { objet, prix } });
}

export const acheterVente = (id) => appel("/rest/v1/rpc/acheter_vente", { methode: "POST", authentifie: true, corps: { p_id: Number(id) } });
export const retirerVente = (id) => appel("/rest/v1/rpc/retirer_vente", { methode: "POST", authentifie: true, corps: { p_id: Number(id) } });
export const recupererGains = () => appel("/rest/v1/rpc/recuperer_gains", { methode: "POST", authentifie: true, corps: {} });

// ---------- Boss collectif ----------
// Les degats de tous les joueurs contre le boss de la semaine s'additionnent

export const totalBossCollectif = (semaine) => appel("/rest/v1/rpc/total_boss", { methode: "POST", corps: { p_semaine: Number(semaine) } });
export const contribuerBossCollectif = (semaine, degats) => appel("/rest/v1/rpc/contribuer_boss", { methode: "POST", authentifie: true, corps: { p_semaine: Number(semaine), p_degats: Math.round(degats) } });

// ---------- Echanges de cartes ----------

export const DUREE_ECHANGE_JOURS = 7;
const champsEchange = "id,auteur,pseudo,donne,veut,statut,accepteur,pseudo_accepteur,cree,accepte,recupere";

export async function offresEchange() {
  const depuis = new Date(Date.now() - DUREE_ECHANGE_JOURS * 86400000).toISOString();
  return appel(`/rest/v1/echanges?select=${champsEchange}&statut=eq.ouvert&cree=gt.${encodeURIComponent(depuis)}&order=cree.desc&limit=80`, { authentifie: true });
}
export async function mesEchanges() {
  return appel(`/rest/v1/echanges?select=${champsEchange}&or=(auteur.eq.${session.id},accepteur.eq.${session.id})&order=cree.desc&limit=40`, { authentifie: true });
}
export async function proposerEchange(donne, veut) {
  await appel("/rest/v1/echanges", { methode: "POST", authentifie: true, entetes: minimal, corps: { donne, veut } });
}
export const accepterEchange = (id) => appel("/rest/v1/rpc/accepter_echange", { methode: "POST", authentifie: true, corps: { p_id: Number(id) } });
export const annulerEchange = (id) => appel("/rest/v1/rpc/annuler_echange", { methode: "POST", authentifie: true, corps: { p_id: Number(id) } });
export const recupererEchanges = () => appel("/rest/v1/rpc/recuperer_echanges", { methode: "POST", authentifie: true, corps: {} });
