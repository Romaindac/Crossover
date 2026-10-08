// ==========================================================
// JEU EN LIGNE : comptes, sauvegarde, classement (Supabase)
// Appels HTTP directs, sans bibliotheque. Le compte se fait avec un
// pseudo et un mot de passe : l'adresse mail est fabriquee a partir
// du pseudo et ne recoit jamais rien.
// ==========================================================

import { SUPABASE_URL, SUPABASE_CLE, enLigneDisponible } from "../donnees/config-enligne.js";
import { lire, ecrire } from "./sauvegarde.js";

export { enLigneDisponible };

const CLE_SESSION = "session";
const DOMAINE_COMPTES = "joueurs.crossover.jeu";
export const PSEUDO_VALIDE = /^[A-Za-z0-9_-]{3,20}$/;

let session = lire(CLE_SESSION, null);

export const connecte = () => Boolean(session?.jeton);
export const pseudoConnecte = () => session?.pseudo ?? null;

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
  const brut = `${corps?.msg ?? corps?.message ?? corps?.error_description ?? corps?.error ?? ""}`.toLowerCase();
  if (brut.includes("already registered") || brut.includes("already exists") || brut.includes("duplicate")) return "Ce pseudo est déjà pris.";
  if (brut.includes("invalid login") || brut.includes("invalid_grant") || brut.includes("invalid credentials")) return "Pseudo ou mot de passe incorrect.";
  if (brut.includes("password")) return "Mot de passe trop court (6 caractères minimum).";
  if (brut.includes("email not confirmed")) return "Le serveur demande une confirmation par mail : il faut la désactiver dans Supabase.";
  if (statut === 429) return "Trop d'essais : attends une minute.";
  return "Le serveur ne répond pas comme prévu. Réessaie plus tard.";
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
        Authorization: `Bearer ${authentifie ? session.jeton : SUPABASE_CLE}`,
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

const adresse = (pseudo) => `${pseudo.toLowerCase()}@${DOMAINE_COMPTES}`;

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
  const d = await appel("/auth/v1/token?grant_type=password", { methode: "POST", corps: { email: adresse(pseudo), password: motDePasse } });
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
  tour: { nom: "Tour", ordre: "tour.desc", valeur: (j) => `étage ${j.tour}` },
  raid: { nom: "Boss de la semaine", ordre: "raid.desc", valeur: (j) => `${j.raid.toLocaleString("fr-FR")} dégâts` },
  collection: { nom: "Collection", ordre: "collection.desc,etoiles.desc", valeur: (j) => `${j.collection} persos, ${j.etoiles} étoiles` },
};

export async function classement(cle, limite = 50) {
  return appel(`/rest/v1/joueurs?select=pseudo,tour,raid,collection,etoiles,vitrine&order=${CLASSEMENTS[cle].ordre}&limit=${limite}`);
}
