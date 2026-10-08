// ==========================================================
// LA PARTIE DU JOUEUR
// Tout ce que le joueur possede tient dans un seul objet,
// sauvegarde dans le navigateur a chaque changement.
// Le numero de version permettra de convertir les anciennes
// sauvegardes lors des futures mises a jour.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { PALIERS } from "../donnees/ennemis.js";
import {
  ENCRE_DE_DEPART,
  xpCombat, encreCombat, PART_XP_RESERVE,
  EXPEDITION_COMBATS_PAR_HEURE, EXPEDITION_HEURES_MAX, MISSIONS_PAR_JOUR, BONUS_TOUTES_MISSIONS,
} from "../donnees/progression.js";
import { nouvelleProgression, ajouterXp, ajouterDoublon } from "../moteur/progression.js";
import { creerHasard } from "../moteur/hasard.js";
import { MISSIONS, MISSIONS_PAR_ID } from "../donnees/missions.js";
import { creerPiece, objetAuHasard, tirerButin, coutAmelioration, eclatsInvestis, scorePiece, bonusEquipement, coutRetouche, nouveauJet, peutSublimer, fourchetteLigne, BONUS_SUBLIMAGE } from "../moteur/equipement.js";
import { NIVEAU_MAX_PIECE, ORDRE_EMPLACEMENTS } from "../donnees/equipement.js";
import { OBJETS_PAR_ID } from "../donnees/objets.js";
import { ZONES, tableButin, xpChasse, eclatsChasse, BONUS_DORE } from "../donnees/zones.js";
import {
  CHAPITRES, TOUTES_LES_ETAPES, etapeDe, encreEtape, xpEtape, nombreEtoiles, COFFRES,
  ETOILE_VICTOIRE, ETOILE_SANS_KO, ETOILE_RAPIDE, SECONDES_RAPIDE,
} from "../donnees/campagne.js";
import { OBJETS } from "../donnees/objets.js";
import { EVEILS, niveauMaxDe, COUT_CHANGER_TALENT } from "../donnees/eveil.js";
import { bossDeLaSemaine, NIVEAU_BOSS_RAID, TENTATIVES_PAR_JOUR, PALIERS_RAID } from "../donnees/raid.js";
import { LIENS, niveauLien, BONUS_PAR_NIVEAU_LIEN, VICTOIRES_DECOUVERTE } from "../donnees/liens.js";
import { TAMPONS, PAGES, TITRE_DE_DEPART } from "../donnees/tampons.js";
import { serieDeLaSemaine, BONUS_HONNEUR, BUTIN_HONNEUR, MISSIONS_SEMAINE, SERIES } from "../donnees/hebdo.js";
import {
  ENERGIE_MAX, MINUTES_PAR_ENERGIE, ENERGIE_PLAFOND, COUT_ENERGIE, RECHARGE_ENCRE, ENERGIE_BONUS_MISSIONS,
  DEFI_DU_JOUR, CALENDRIER, PALIERS_TOURNOI,
} from "../donnees/evenements.js";
import { heureFolle, serieDuDefi } from "../moteur/evenements.js";
import { RANGS, saisonActuelle, pointsSaison, detailPointsSaison, rangDe, CADRES } from "../donnees/saisons.js";
import { pieceParfaite, nomPiece } from "../moteur/equipement.js";
import { simulerCombat } from "../moteur/simulation.js";
import { composerEquipe } from "../moteur/composition.js";
import {
  etageTour, arcDeLaSemaine, numeroSemaine, eclatsEtage, encreEtage, fragmentsEtage, xpTour,
  CHANCE_ENCRE_SACREE, COFFRES_SEMAINE,
} from "../donnees/tour.js";
import { COFFRES_SEMAINE as COFFRES_SEMAINE_TOUR } from "../donnees/tour.js";
import { calculerStatsFinales } from "../moteur/stats.js";
import { ouvrirBooster, ouvrirBoosterDepart } from "../moteur/boosters.js";
import {
  EDITIONS_PAR_ID, PRIX_BOOSTER, MINUTES_BOOSTER_GRATUIT, STOCK_GRATUIT_MAX, TICKETS_DEPART,
  POUSSIERE_PAR_BOOSTER, POUSSIERE_DOUBLON, COUT_FABRICATION, PITIE_BOOSTER, TICKETS_CHAPITRE,
} from "../donnees/boosters.js";
import { lire, ecrire } from "./sauvegarde.js";

const CLE = "partie";
const VERSION = 1;

// Verifie une sauvegarde et la nettoie (persos inconnus, equipe invalide...)
// Etat des boosters ; une ancienne sauvegarde (avant les boosters) recoit les tickets de depart
function validerBoosters(b) {
  return {
    tickets: Math.max(0, Math.floor(Number(b?.tickets ?? TICKETS_DEPART)) || 0),
    prochainGratuit: Number(b?.prochainGratuit) || Date.now() + MINUTES_BOOSTER_GRATUIT * 60000,
    pitie: Math.max(0, Math.floor(Number(b?.pitie) || 0)),
    poussiere: Math.max(0, Math.floor(Number(b?.poussiere) || 0)),
    ouverts: Math.max(0, Math.floor(Number(b?.ouverts) || 0)),
    dores: Math.max(0, Math.floor(Number(b?.dores) || 0)),   // tickets de booster dore (evenements)
  };
}

function valider(p) {
  if (!p || p.version !== VERSION || typeof p.encre !== "number" || typeof p.collection !== "object") return null;
  const collection = {};
  for (const [id, prog] of Object.entries(p.collection)) {
    if (PERSOS_PAR_ID[id]) collection[id] = { ...nouvelleProgression(), ...prog };
  }
  const equipe = Array.isArray(p.equipe) && p.equipe.length === 5 ? p.equipe : [null, null, null, null, null];
  const paliersBattus = Array.isArray(p.paliersBattus) ? p.paliersBattus.filter((n) => PALIERS.some((x) => x.palier === n)) : [];
  for (const prog of Object.values(collection)) {
    prog.variantes = Array.isArray(prog.variantes) ? prog.variantes.filter((v) => v === "holo" || v === "doree") : [];
  }
  return {
    version: VERSION,
    encre: Math.max(0, Math.floor(p.encre)),
    collection,
    boosters: validerBoosters(p.boosters),
    energie: {
      valeur: Math.min(ENERGIE_PLAFOND, Math.max(0, Number(p.energie?.valeur ?? ENERGIE_MAX) || 0)),
      maj: Number(p.energie?.maj) || Date.now(),
      achats: p.energie?.achats ?? null,
    },
    evenements: p.evenements ?? {},
    paliersBattus,
    equipe: equipe.map((id, i) => (collection[id] && equipe.indexOf(id) === i ? id : null)),
    palier: Number(p.palier) || 1,
    heros: p.heros ?? null,
    vedette: collection[p.vedette] ? p.vedette : collection[p.heros] ? p.heros : Object.keys(collection)[0] ?? null,
    stats: { combats: 0, victoires: 0, tirages: 0, legendaires: 0, ...(p.stats ?? {}) },
    missions: p.missions ?? null,
    missionsSemaine: p.missionsSemaine ?? null,
    saison: p.saison ?? null,
    expeditionsCiblees: Array.isArray(p.expeditionsCiblees) ? p.expeditionsCiblees : [null, null],
    equipesEnregistrees: Array.isArray(p.equipesEnregistrees) ? p.equipesEnregistrees : [null, null, null],
    saisonPrecedente: p.saisonPrecedente ?? null,
    cosmetiques: { cadres: Array.isArray(p.cosmetiques?.cadres) ? p.cosmetiques.cadres : ["encre"], cadre: p.cosmetiques?.cadre ?? "encre" },
    equipement: validerEquipement(p.equipement, collection),
    campagne: validerCampagne(p.campagne, paliersBattus),
    histoire: { vues: Array.isArray(p.histoire?.vues) ? p.histoire.vues : [] },
    ressources: { fragments: Number(p.ressources?.fragments) || 0, encreSacree: Number(p.ressources?.encreSacree) || 0 },
    raid: p.raid ?? null,
    liens: p.liens && typeof p.liens === "object" ? p.liens : {},
    tampons: Array.isArray(p.tampons) ? p.tampons : [],
    tamponsNouveaux: Array.isArray(p.tamponsNouveaux) ? p.tamponsNouveaux : [],
    titre: p.titre ?? TITRE_DE_DEPART,
    tour: {
      record: Number(p.tour?.record) || 0,
      semaine: Number(p.tour?.semaine) || 0,
      etagesSemaine: Array.isArray(p.tour?.etagesSemaine) ? p.tour.etagesSemaine : [],
      coffresSemaine: Array.isArray(p.tour?.coffresSemaine) ? p.tour.coffresSemaine : [],
    },
    chasse: {
      bossBattus: Array.isArray(p.chasse?.bossBattus) ? p.chasse.bossBattus.filter((z) => ZONES.some((x) => x.id === z)) : [],
      decouverts: Array.isArray(p.chasse?.decouverts) ? p.chasse.decouverts.filter((id) => OBJETS_PAR_ID[id]) : [],
    },
    // Les anciennes sauvegardes avec un palier battu demarrent leur expedition maintenant
    expedition: p.expedition ?? (paliersBattus.length ? { debut: Date.now() } : null),
  };
}

const ECLATS_RECYCLAGE = { commun: 5, peu_commun: 10, rare: 20, epique: 40, legendaire: 80 };

// La campagne remplace les paliers : a la mise a jour, chaque palier battu valide
// les etapes de difficulte equivalente (dans l'ordre, avec une etoile).
function validerCampagne(c, paliersBattus) {
  if (c && typeof c.etoiles === "object") {
    return { etoiles: { ...c.etoiles }, coffres: Array.isArray(c.coffres) ? c.coffres : [] };
  }
  const etoiles = {};
  if (paliersBattus.length) {
    const niveauMax = Math.max(...paliersBattus.map((n) => PALIERS.find((x) => x.palier === n)?.niveau ?? 0));
    for (const et of TOUTES_LES_ETAPES) {
      if (et.niveau > niveauMax - 1) break;
      etoiles[`${et.chapitre}-${et.numero}`] = ETOILE_VICTOIRE;
    }
  }
  return { etoiles, coffres: [] };
}

// Garde les pieces valides. Les pieces de l'ancien systeme (generees au hasard,
// avant le catalogue) sont converties en eclats : le joueur ne perd rien.
function validerEquipement(e, collection) {
  let eclats = Number(e?.eclats) || 0;
  const pieces = [];
  for (const p of Array.isArray(e?.pieces) ? e.pieces : []) {
    if (!p) continue;
    if (p.principale && !p.objet) {
      eclats += (ECLATS_RECYCLAGE[p.rarete] ?? 5) + eclatsInvestis(Number(p.niveau) || 0);
      continue;
    }
    if (!OBJETS_PAR_ID[p.objet] || !Array.isArray(p.lignes)) continue;
    if (p.porteur && !collection[p.porteur]) p.porteur = null;
    pieces.push(p);
  }
  // Retouche payee mais pas encore tranchee : on la garde si la piece existe encore
  const r = e?.retouche;
  const piece = r && pieces.find((p) => p.uid === r.uid);
  const retouche = piece && piece.lignes[r.index] && Number.isFinite(r.valeur)
    ? { uid: r.uid, index: Number(r.index), valeur: r.valeur }
    : null;
  return { pieces, prochainUid: Number(e?.prochainUid) || pieces.length + 1, eclats, retouche };
}

let partie = valider(lire(CLE, null));

function sauver() {
  ecrire(CLE, partie);
}

// ---------- Lecture ----------

export const aUnePartie = () => partie !== null;
export const encre = () => partie?.encre ?? 0;
export const possede = (id) => Boolean(partie?.collection[id]);
export const idsPossedes = () => Object.keys(partie?.collection ?? {});
export const progressionDe = (id) => partie?.collection[id] ?? nouvelleProgression();
export const equipeSauvee = () => [...(partie?.equipe ?? [null, null, null, null, null])];
export const palierSauve = () => partie?.palier ?? 1;
export const estBattu = (palier) => Boolean(partie?.paliersBattus.includes(palier));
export const vedette = () => partie?.vedette ?? null;

export function definirVedette(id) {
  if (!possede(id)) return;
  partie.vedette = id;
  sauver();
}

// Le plus haut palier accessible : celui qui suit le meilleur palier battu
export function palierMaxDebloque() {
  const meilleur = Math.max(0, ...(partie?.paliersBattus ?? []));
  return Math.min(PALIERS.length, meilleur + 1);
}

// ---------- Debut de partie ----------

// Nouvelle partie : un booster de depart offert donne les 5 premiers persos
// (un par role). Renvoie ses cartes pour la mise en scene de l'ouverture.
export function nouvellePartie() {
  const { cartes } = ouvrirBoosterDepart(Math.random);
  const collection = {};
  for (const c of cartes) collection[c.id] = { ...nouvelleProgression(), variantes: [] };

  // Equipe de depart : tanks et attaquants devant, les autres derriere
  const ordreDevant = ["tank", "attaquant", "controle", "soutien", "assassin"];
  const ids = cartes.map((c) => c.id);
  const avant = [...ids].sort((a, b) => ordreDevant.indexOf(PERSOS_PAR_ID[a].role) - ordreDevant.indexOf(PERSOS_PAR_ID[b].role)).slice(0, 2);
  const arriere = ids.filter((id) => !avant.includes(id));
  const heros = cartes.find((c) => c.rarete === "rare")?.id ?? ids[0];

  partie = {
    version: VERSION,
    encre: ENCRE_DE_DEPART,
    collection,
    boosters: validerBoosters(null),
    energie: { valeur: ENERGIE_MAX, maj: Date.now(), achats: null },
    evenements: {},
    paliersBattus: [],
    equipe: [...avant, ...arriere],
    palier: 1,
    heros,
    vedette: heros,
    stats: { combats: 0, victoires: 0, tirages: 0, legendaires: 0 },
    missions: null,
    expedition: null,
    equipement: { pieces: [], prochainUid: 1, eclats: 0 },
    chasse: { bossBattus: [], decouverts: [] },
    campagne: { etoiles: {}, coffres: [] },
    histoire: { vues: [] },
    ressources: { fragments: 0, encreSacree: 0 },
    tour: { record: 0, semaine: 0, etagesSemaine: [], coffresSemaine: [] },
  };
  // On repasse par la validation : tous les champs des versions recentes sont crees
  partie = valider(partie);
  sauver();
  return cartes;
}

// ---------- Modifications ----------

export function definirEquipe(equipe) {
  partie.equipe = equipe.map((id) => (possede(id) ? id : null));
  sauver();
}

export function definirPalier(palier) {
  partie.palier = palier;
  sauver();
}

// Donne de l'experience a un perso (regles dans moteur/progression.js)
function donnerXp(id, gain) {
  return { id, ...ajouterXp(partie.collection[id], gain) };
}

// Applique les recompenses d'un combat termine. A appeler UNE seule fois par combat.
// duree (secondes) et ultimesManuels servent aux missions du jour.
export function appliquerResultatCombat({ palier, victoire, ids, duree = 90, ultimesManuels = 0 }) {
  const premiereVictoire = victoire && !estBattu(palier);
  const gainEncre = encreCombat(palier, victoire, premiereVictoire);
  const avantDeblocage = palierMaxDebloque();

  partie.encre += gainEncre;
  if (premiereVictoire) partie.paliersBattus.push(palier);
  if (victoire && !partie.expedition) partie.expedition = { debut: Date.now() };

  const gain = xpCombat(palier, victoire);
  const xp = ids.filter(possede).map((id) => donnerXp(id, gain));
  // Les persos en reserve s'entrainent aussi un peu
  const gainReserve = Math.round(gain * PART_XP_RESERVE);
  for (const id of idsPossedes()) if (!ids.includes(id)) donnerXp(id, gainReserve);

  // Statistiques et missions
  partie.stats.combats += 1;
  if (victoire) {
    partie.stats.victoires += 1;
    signaler("victoire");
    if (duree < 30) signaler("victoire-rapide");
    const series = ids.map((id) => PERSOS_PAR_ID[id]?.serie);
    if (series.some((s, i) => series.indexOf(s) !== i)) signaler("victoire-serie");
  }
  signaler("ultime-manuel", ultimesManuels);
  signaler("niveau", xp.reduce((total, x) => total + (x.niveauApres - x.niveauAvant), 0));

  // Butin : une piece sure a la premiere victoire, une chance sur 4 ensuite
  const zoneButin = Math.min(5, Math.ceil(palier / 2));
  const butin = premiereVictoire || (victoire && Math.random() < 0.25) ? butinZone(zoneButin, 1) : [];
  sauver();

  const apresDeblocage = palierMaxDebloque();
  return {
    encre: gainEncre,
    premiereVictoire,
    palierDebloque: apresDeblocage > avantDeblocage ? apresDeblocage : null,
    xp,
    xpReserve: gainReserve,
    butin,
  };
}

// ---------- Tirages ----------

// Ajoute un perso tire a la collection, ou le compte comme doublon
// Une carte obtenue : nouveau perso, ou doublon (etoiles, puis poussiere au-dela de 5 etoiles).
// Une variante holo ou doree s'ajoute a la collection du perso (purement cosmetique).
function ajouterCarte({ id, rarete, variante = null }) {
  let resultat;
  if (!partie.collection[id]) {
    partie.collection[id] = { ...nouvelleProgression(), variantes: [] };
    resultat = { id, rarete, variante, nouveau: true };
  } else {
    const doublon = ajouterDoublon(partie.collection[id]);
    const poussiere = doublon.encreRendue ? POUSSIERE_DOUBLON[rarete] : 0;
    partie.boosters.poussiere += poussiere;
    resultat = { id, rarete, variante, nouveau: false, ...doublon, encreRendue: 0, poussiere };
  }
  const variantes = partie.collection[id].variantes ?? (partie.collection[id].variantes = []);
  resultat.nouvelleVariante = Boolean(variante && !variantes.includes(variante));
  if (resultat.nouvelleVariante) variantes.push(variante);
  return resultat;
}

// ---------- Boosters ----------

// Les tickets gratuits arrivent avec le temps (un toutes les 15 min tant qu'on en a moins de 8)
function assurerTickets(maintenant = Date.now()) {
  const b = partie.boosters;
  const periode = MINUTES_BOOSTER_GRATUIT * 60000;
  while (maintenant >= b.prochainGratuit) {
    if (b.tickets < STOCK_GRATUIT_MAX) b.tickets += 1;
    b.prochainGratuit += periode;
  }
  return b;
}

export function etatBoosters(maintenant = Date.now()) {
  if (!partie) return null;
  const b = assurerTickets(maintenant);
  return {
    tickets: b.tickets,
    dores: b.dores,
    prochainGratuit: b.prochainGratuit,
    stockPlein: b.tickets >= STOCK_GRATUIT_MAX,
    poussiere: b.poussiere,
    ouverts: b.ouverts,
    avantLegendaire: PITIE_BOOSTER - b.pitie,
    prix: PRIX_BOOSTER,
  };
}

// Combien de boosters le joueur peut ouvrir tout de suite (tickets + encre)
export const boostersDisponibles = () => {
  if (!partie) return 0;
  const b = assurerTickets();
  return b.dores + b.tickets + Math.floor(partie.encre / PRIX_BOOSTER);
};

// Ouvre un booster d'une edition, avec un ticket si possible, sinon avec de l'encre.
// Renvoie null si on ne peut pas payer.
export function ouvrirBoosterJoueur(editionId) {
  if (!partie || !EDITIONS_PAR_ID[editionId]) return null;
  const b = assurerTickets();
  let paiement;
  if (b.dores > 0) { b.dores -= 1; paiement = "dore"; }
  else if (b.tickets > 0) { b.tickets -= 1; paiement = "ticket"; }
  else if (partie.encre >= PRIX_BOOSTER) { partie.encre -= PRIX_BOOSTER; paiement = "encre"; }
  else return null;
  const r = ouvrirBooster(Math.random, editionId, { pitie: b.pitie, serieVedette: serieDeLaSemaine(), forcerDore: paiement === "dore" });
  b.pitie = r.pitie;
  b.ouverts += 1;
  b.poussiere += POUSSIERE_PAR_BOOSTER;
  const cartes = r.cartes.map(ajouterCarte);
  partie.stats.tirages += cartes.length;
  partie.stats.boosters = (partie.stats.boosters ?? 0) + 1;
  partie.stats.legendaires += cartes.filter((c) => c.rarete === "legendaire").length;
  signaler("tirage");
  signalerSemaine("tirage");
  sauver();
  return { cartes, dore: r.dore, paiement, poussiereBooster: POUSSIERE_PAR_BOOSTER };
}

// Atelier : fabriquer la carte de son choix avec de la poussiere
export const coutFabrication = (id) => COUT_FABRICATION[PERSOS_PAR_ID[id]?.rarete] ?? Infinity;

export function fabriquerCarte(id) {
  const perso = PERSOS.find((p) => p.id === id);
  if (!partie || !perso) return { ok: false, erreur: "Perso inconnu." };
  const cout = coutFabrication(id);
  if (partie.boosters.poussiere < cout) return { ok: false, erreur: `Il te manque ${cout - partie.boosters.poussiere} poussière.` };
  partie.boosters.poussiere -= cout;
  const carte = ajouterCarte({ id, rarete: perso.rarete });
  sauver();
  return { ok: true, cout, carte };
}

// Tickets de booster gagnes en recompense (chapitres, missions)
function donnerTickets(n) {
  partie.boosters.tickets += n;
}


// ---------- Energie ----------
// Les combats coutent de l'energie, payee seulement en cas de victoire.
// Elle remonte seule (+1 toutes les 3 min) jusqu'a 150 ; les cadeaux peuvent depasser.

function assurerEnergie(maintenant = Date.now()) {
  const e = partie.energie;
  const periode = MINUTES_PAR_ENERGIE * 60000;
  if (e.valeur >= ENERGIE_MAX) { e.maj = maintenant; return e; }
  const gagne = Math.floor((maintenant - e.maj) / periode);
  if (gagne > 0) {
    e.valeur = Math.min(ENERGIE_MAX, e.valeur + gagne);
    e.maj = e.valeur >= ENERGIE_MAX ? maintenant : e.maj + gagne * periode;
  }
  return e;
}

export function etatEnergie(maintenant = Date.now()) {
  if (!partie) return null;
  const e = assurerEnergie(maintenant);
  const jour = aujourdhui();
  const achats = e.achats?.jour === jour ? e.achats.n : 0;
  return {
    valeur: e.valeur, max: ENERGIE_MAX,
    prochain: e.valeur >= ENERGIE_MAX ? null : e.maj + MINUTES_PAR_ENERGIE * 60000,
    achatsRestants: RECHARGE_ENCRE.parJour - achats, recharge: RECHARGE_ENCRE,
  };
}

// Le cout d'un combat (l'heure folle peut le reduire)
export function coutEnergie(mode) {
  const base = COUT_ENERGIE[mode] ?? 0;
  return Math.ceil(base * (heureFolle().coutEnergie ?? 1));
}

export const assezDEnergie = (mode) => Boolean(partie) && assurerEnergie().valeur >= coutEnergie(mode);

export function payerEnergie(mode) {
  const e = assurerEnergie();
  const cout = coutEnergie(mode);
  const etaitPlein = e.valeur >= ENERGIE_MAX;
  e.valeur = Math.max(0, e.valeur - cout);
  if (etaitPlein && e.valeur < ENERGIE_MAX) e.maj = Date.now();
  sauver();
  return cout;
}

function donnerEnergie(n) {
  const e = assurerEnergie();
  const etaitPlein = e.valeur >= ENERGIE_MAX;
  e.valeur = Math.min(ENERGIE_PLAFOND, e.valeur + n);
  if (!etaitPlein && e.valeur >= ENERGIE_MAX) e.maj = Date.now();
}

export function rechargerEnergie() {
  const etat = etatEnergie();
  if (etat.achatsRestants <= 0) return { ok: false, erreur: "Plus de recharge possible aujourd'hui." };
  if (partie.encre < RECHARGE_ENCRE.prix) return { ok: false, erreur: `Il te manque ${RECHARGE_ENCRE.prix - partie.encre} d'encre.` };
  partie.encre -= RECHARGE_ENCRE.prix;
  donnerEnergie(RECHARGE_ENCRE.energie);
  const jour = aujourdhui();
  const e = partie.energie;
  e.achats = { jour, n: (e.achats?.jour === jour ? e.achats.n : 0) + 1 };
  sauver();
  return { ok: true };
}

// ---------- Evenements ----------

// Donne une recompense d'evenement : { tickets, ticketsDores, energie, encre, poussiere, eclats }
function donnerRecompense(r) {
  if (r.tickets) donnerTickets(r.tickets);
  if (r.ticketsDores) partie.boosters.dores += r.ticketsDores;
  if (r.energie) donnerEnergie(r.energie);
  if (r.encre) partie.encre += r.encre;
  if (r.poussiere) partie.boosters.poussiere += r.poussiere;
  if (r.eclats) partie.equipement.eclats += r.eclats;
}

function assurerEvenements() {
  const ev = partie.evenements ?? (partie.evenements = {});
  const defi = serieDuDefi(SERIES);
  if (ev.defi?.numero !== defi.numero) ev.defi = { numero: defi.numero, serie: defi.serie, victoires: 0, reclame: false };
  const semaine = numeroSemaine();
  if (ev.tournoi?.semaine !== semaine) ev.tournoi = { semaine, points: 0, paliers: [] };
  ev.calendrier = ev.calendrier ?? { jour: null, case: -1, reclame: true };
  const jour = aujourdhui();
  if (ev.calendrier.jour !== jour) {
    ev.calendrier = { jour, case: (ev.calendrier.case + 1) % CALENDRIER.length, reclame: false };
  }
  return ev;
}

let dernierBonus = null;
// Ce que l'heure folle a rapporte lors de la derniere victoire (affiche en fin de combat)
export const bonusDerniereVictoire = () => {
  const b = dernierBonus;
  dernierBonus = null;
  return b;
};

// Appelee a chaque victoire (campagne, deluxe, chasse, Tour)
function noterVictoireEvenements(ids) {
  const ev = assurerEvenements();
  const persos = ids.map((id) => PERSOS_PAR_ID[id]).filter(Boolean);
  // Defi du jour
  if (persos.filter((p) => p.serie === ev.defi.serie).length >= DEFI_DU_JOUR.persosSerie) {
    ev.defi.victoires = Math.min(DEFI_DU_JOUR.victoires, ev.defi.victoires + 1);
  }
  // Tournoi de la semaine
  const heure = heureFolle();
  const honneur = persos.filter((p) => p.serie === serieDeLaSemaine()).length;
  if (honneur) ev.tournoi.points += (honneur >= 3 ? 2 : 1) * (heure.pointsTournoi ?? 1);
  // Heure folle
  const g = heure.gains;
  if (!g) return null;
  const gains = { nom: heure.nom };
  if (g.encre) { partie.encre += g.encre; gains.encre = g.encre; }
  if (g.poussiere) { partie.boosters.poussiere += g.poussiere; gains.poussiere = g.poussiere; }
  if (g.eclats) { partie.equipement.eclats += g.eclats; gains.eclats = g.eclats; }
  if (g.energie) { donnerEnergie(g.energie); gains.energie = g.energie; }
  if (g.chanceTicket && Math.random() < g.chanceTicket) { donnerTickets(1); gains.tickets = 1; }
  return Object.keys(gains).length > 1 ? gains : null;
}

export function etatEvenements(maintenant = Date.now()) {
  if (!partie) return null;
  const ev = assurerEvenements();
  const defi = serieDuDefi(SERIES, maintenant);
  return {
    heure: heureFolle(maintenant),
    defi: { ...ev.defi, cible: DEFI_DU_JOUR.victoires, persosSerie: DEFI_DU_JOUR.persosSerie, recompense: DEFI_DU_JOUR.recompense, fin: defi.fin },
    calendrier: { ...ev.calendrier, cases: CALENDRIER },
    tournoi: { ...ev.tournoi, serie: serieDeLaSemaine(), paliers: PALIERS_TOURNOI.map((p, i) => ({ ...p, atteint: ev.tournoi.points >= p.points, reclame: ev.tournoi.paliers.includes(i) })) },
  };
}

export function reclamerDefi() {
  const ev = assurerEvenements();
  if (ev.defi.reclame || ev.defi.victoires < DEFI_DU_JOUR.victoires) return false;
  ev.defi.reclame = true;
  donnerRecompense(DEFI_DU_JOUR.recompense);
  sauver();
  return true;
}

export function reclamerCalendrier() {
  const ev = assurerEvenements();
  if (ev.calendrier.reclame) return null;
  ev.calendrier.reclame = true;
  const c = CALENDRIER[ev.calendrier.case];
  donnerRecompense(c.recompense);
  sauver();
  return c;
}

export function reclamerPalierTournoi(i) {
  const ev = assurerEvenements();
  const p = PALIERS_TOURNOI[i];
  if (!p || ev.tournoi.paliers.includes(i) || ev.tournoi.points < p.points) return false;
  ev.tournoi.paliers.push(i);
  donnerRecompense(p.recompense);
  sauver();
  return true;
}

// Combien de recompenses d'evenement attendent (pour le point rouge du QG)
export function evenementsAReclamer() {
  if (!partie) return 0;
  const e = etatEvenements();
  return (e.defi.victoires >= e.defi.cible && !e.defi.reclame ? 1 : 0)
    + (e.calendrier.reclame ? 0 : 1)
    + e.tournoi.paliers.filter((p) => p.atteint && !p.reclame).length;
}

// ---------- Export, import et effacement ----------

const PREFIXE_EXPORT = "CROSSOVER1:";

// Transforme la partie (et les reglages) en un texte a copier
export function exporterPartie(reglages = {}) {
  const json = JSON.stringify({ partie, reglages });
  return PREFIXE_EXPORT + btoa(unescape(encodeURIComponent(json)));
}

// Lit un texte exporte. Renvoie { ok, erreur, reglages }
export function importerPartie(texte) {
  const propre = String(texte ?? "").trim();
  if (!propre.startsWith(PREFIXE_EXPORT)) {
    return { ok: false, erreur: "Ce texte n'est pas une sauvegarde de Crossover." };
  }
  let contenu;
  try {
    contenu = JSON.parse(decodeURIComponent(escape(atob(propre.slice(PREFIXE_EXPORT.length)))));
  } catch {
    return { ok: false, erreur: "La sauvegarde est abîmée : vérifie que tu as copié tout le texte." };
  }
  const nouvelle = valider(contenu?.partie);
  if (!nouvelle) return { ok: false, erreur: "La sauvegarde est incomplète ou d'une version inconnue." };
  partie = nouvelle;
  sauver();
  return { ok: true, reglages: contenu.reglages ?? {} };
}

export function effacerPartie() {
  partie = null;
  ecrire(CLE, null);
}

// ---------- Statistiques ----------

export const statistiques = () => ({ ...(partie?.stats ?? {}) });

// ---------- Missions du jour ----------

// La date du jour, a l'heure du joueur (AAAA-MM-JJ)
const aujourdhui = () => new Date().toLocaleDateString("fr-CA");

// Les missions du jour sont tirees au hasard, mais toujours les memes pour une date donnee
function tirerMissions(jour) {
  let graine = 0;
  for (const c of jour) graine = (graine * 31 + c.charCodeAt(0)) >>> 0;
  const h = creerHasard(graine);
  const modeOuvert = { chasse: true, tour: tourOuverte(), raid: raidOuvert(), deluxe: deluxeOuverte() };
  const ids = MISSIONS.filter((m) => !m.mode || modeOuvert[m.mode]).map((m) => m.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(h.nombre() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, MISSIONS_PAR_JOUR);
}

function assurerMissions() {
  const jour = aujourdhui();
  if (!partie.missions || partie.missions.jour !== jour) {
    partie.missions = {
      jour,
      liste: tirerMissions(jour).map((id) => ({ id, progres: 0, reclamee: false })),
      bonusReclame: false,
    };
  }
  return partie.missions;
}

// Le jeu signale une action ; les missions concernees avancent
function signaler(evenement, quantite = 1) {
  if (!partie || quantite <= 0) return;
  for (const m of assurerMissions().liste) {
    const def = MISSIONS_PAR_ID[m.id];
    if (def?.evenement === evenement) m.progres = Math.min(def.cible, m.progres + quantite);
  }
}

export function missionsDuJour() {
  if (!partie) return null;
  const etat = assurerMissions();
  return {
    liste: etat.liste.map((m) => ({ ...MISSIONS_PAR_ID[m.id], progres: m.progres, reclamee: m.reclamee })),
    bonusReclame: etat.bonusReclame,
    bonus: BONUS_TOUTES_MISSIONS,
  };
}

export function reclamerMission(id) {
  const m = assurerMissions().liste.find((x) => x.id === id);
  const def = MISSIONS_PAR_ID[id];
  if (!m || !def || m.reclamee || m.progres < def.cible) return 0;
  m.reclamee = true;
  partie.encre += def.recompense;
  partie.stats.missions = (partie.stats.missions ?? 0) + 1;
  if (assurerMissions().liste.every((x) => x.reclamee)) {
    const saison = assurerSaison();
    const jour = aujourdhui();
    if (!saison.joursActifs.includes(jour)) saison.joursActifs.push(jour);
    debloquerCadresDeRang();
  }
  sauver();
  return def.recompense;
}

export function reclamerBonusMissions() {
  const etat = assurerMissions();
  if (etat.bonusReclame || !etat.liste.every((m) => m.reclamee)) return 0;
  etat.bonusReclame = true;
  partie.encre += BONUS_TOUTES_MISSIONS;
  donnerTickets(1);   // + un booster gratuit
  donnerEnergie(ENERGIE_BONUS_MISSIONS);
  sauver();
  return BONUS_TOUTES_MISSIONS;
}

// ---------- Expedition ----------

// Apres la campagne, l'expedition continue de progresser : +1 % d'XP par etape
// deluxe gagnee et par 5 etages du record de la Tour (l'encre monte deux fois
// moins vite, pour ne pas inonder les tirages).
export function bonusExpedition() {
  const deluxe = Object.values(partie?.campagne.deluxe ?? {}).filter(Boolean).length;
  const tour = Math.floor((partie?.tour?.record ?? 0) / 5);
  return (deluxe + tour) / 100;
}

// L'equipe s'entraine seule sur le meilleur palier battu, meme jeu ferme
export function etatExpedition(maintenant = Date.now()) {
  const etape = meilleureEtape();
  if (!partie?.expedition || !etape) return null;
  const heures = Math.max(0, Math.min((maintenant - partie.expedition.debut) / 3600000, EXPEDITION_HEURES_MAX));
  const combats = Math.floor(heures * EXPEDITION_COMBATS_PAR_HEURE);
  const bonus = bonusExpedition();
  return {
    etape,
    zone: etape.chapitre,
    heures,
    combats,
    bonus,
    encre: Math.round(combats * encreEtape(etape, false) * (1 + bonus / 2)),
    xp: Math.round(combats * xpEtape(etape, true) * 0.5 * (1 + bonus)),   // la moitie de l'XP d'un vrai combat
    pleine: heures >= EXPEDITION_HEURES_MAX,
    heuresMax: EXPEDITION_HEURES_MAX,
    pieces: Math.floor(heures / 2),   // une piece d'equipement toutes les 2 heures
  };
}

export function recupererExpedition() {
  const etat = etatExpedition();
  if (!etat || etat.combats === 0) return null;
  partie.encre += etat.encre;
  const equipe = partie.equipe.filter((id) => id && possede(id));
  const xp = equipe.map((id) => donnerXp(id, etat.xp));
  const xpReserve = Math.round(etat.xp * PART_XP_RESERVE);
  for (const id of idsPossedes()) if (!equipe.includes(id)) donnerXp(id, xpReserve);
  const butin = butinZone(etat.zone, etat.pieces);
  partie.expedition.debut = Date.now();
  signaler("expedition");
  signaler("niveau", xp.reduce((total, x) => total + (x.niveauApres - x.niveauAvant), 0));
  sauver();
  return { ...etat, xpDetail: xp, xpReserve, butin };
}

// Y a-t-il quelque chose a recuperer au QG ? (pour la pastille du menu)
export function quelqueChoseAReclamer() {
  if (!partie) return false;
  const missions = missionsDuJour();
  const mission = missions.liste.some((m) => !m.reclamee && m.progres >= m.cible)
    || (!missions.bonusReclame && missions.liste.every((m) => m.reclamee));
  const expedition = etatExpedition();
  return mission || Boolean(expedition && expedition.heures >= 1) || evenementsAReclamer() > 0;
}

// ---------- Equipement ----------

const INVENTAIRE_MAX = 150;

export const inventaire = () => [...(partie?.equipement.pieces ?? [])];
export const pieceParUid = (uid) => partie?.equipement.pieces.find((p) => p.uid === uid) ?? null;
export const eclats = () => partie?.equipement.eclats ?? 0;
export const objetsDecouverts = () => [...(partie?.chasse.decouverts ?? [])];

// Les pieces portees par un perso, dans l'ordre des emplacements
export function piecesDe(id) {
  const pieces = (partie?.equipement.pieces ?? []).filter((p) => p.porteur === id);
  return ORDRE_EMPLACEMENTS.map((e) => pieces.find((p) => p.emplacement === e)).filter(Boolean);
}

// Ce que le moteur de combat doit savoir d'un de tes persos
export const entreeCombat = (id, _index, equipe = []) => ({ id, ...progressionDe(id), equipement: piecesDe(id), bonusPct: bonusCombat(id, equipe) });

// Bonus en % (PV et ATQ) : liens actifs avec les coequipiers, et serie a l'honneur cette semaine
function bonusCombat(id, equipe) {
  let bonus = 0;
  for (const lien of LIENS) {
    if ((lien.a === id && equipe.includes(lien.b)) || (lien.b === id && equipe.includes(lien.a))) {
      bonus += niveauLien(partie?.liens[lien.cle] ?? 0) * BONUS_PAR_NIVEAU_LIEN;
    }
  }
  return bonus + bonusHonneur(id);
}
// La serie a l'honneur cette semaine : +15 % de PV et d'ATQ
function bonusHonneur(id) {
  return PERSOS_PAR_ID[id]?.serie === serieDeLaSemaine() ? BONUS_HONNEUR : 0;
}
export const estALHonneur = (id) => PERSOS_PAR_ID[id]?.serie === serieDeLaSemaine();

// Butin % total de l'equipe
export const butinEquipe = (ids) => ids.filter(Boolean).reduce((s, id) => s + bonusEquipement(piecesDe(id)).butin + (estALHonneur(id) ? BUTIN_HONNEUR : 0), 0);

// Ajoute des exemplaires d'objets a l'inventaire (et a l'encyclopedie)
function ajouterObjets(ids) {
  const nouvelles = [];
  for (const objetId of ids) {
    const piece = creerPiece(Math.random, objetId, `e${partie.equipement.prochainUid++}`);
    partie.equipement.pieces.push(piece);
    if (!partie.chasse.decouverts.includes(objetId)) partie.chasse.decouverts.push(objetId);
    nouvelles.push(piece);
  }
  // Inventaire plein : les pieces Communes libres partent au recyclage
  while (partie.equipement.pieces.length > INVENTAIRE_MAX) {
    const commune = partie.equipement.pieces.find((p) => p.rarete === "commun" && !p.porteur && !p.verrou);
    if (!commune) break;
    recyclerSansSauver(commune.uid);
  }
  return nouvelles;
}

// Des objets au hasard d'une zone (hors boss) : expedition et paliers
function butinZone(zoneId, nombre) {
  return ajouterObjets(Array.from({ length: nombre }, () => objetAuHasard(Math.random, zoneId)));
}

export const gainRecyclage = (piece) => ECLATS_RECYCLAGE[piece.rarete] + Math.floor(eclatsInvestis(piece.niveau) * 0.7);

function recyclerSansSauver(uid) {
  const i = partie.equipement.pieces.findIndex((p) => p.uid === uid);
  if (i === -1) return 0;
  const gain = gainRecyclage(partie.equipement.pieces[i]);
  partie.equipement.pieces.splice(i, 1);
  partie.equipement.eclats += gain;
  return gain;
}

// Peut-on porter cette piece ? (niveau requis)
export function peutPorter(persoId, piece) {
  return progressionDe(persoId).niveau >= (OBJETS_PAR_ID[piece.objet]?.niveau ?? 1);
}

// Equipe une piece sur un perso. La piece qu'il portait a cet endroit retourne dans l'inventaire.
export function equiperPiece(uid, persoId) {
  const piece = pieceParUid(uid);
  if (!piece || !possede(persoId)) return { ok: false, erreur: "Impossible." };
  if (!peutPorter(persoId, piece)) {
    return { ok: false, erreur: `Niveau ${OBJETS_PAR_ID[piece.objet].niveau} requis pour porter cet objet.` };
  }
  const actuelle = partie.equipement.pieces.find((p) => p.porteur === persoId && p.emplacement === piece.emplacement);
  if (actuelle && actuelle !== piece) actuelle.porteur = null;
  piece.porteur = persoId;
  sauver();
  return { ok: true };
}

export function retirerPiece(uid) {
  const piece = pieceParUid(uid);
  if (!piece) return;
  piece.porteur = null;
  sauver();
}

export function ameliorerPiece(uid) {
  const piece = pieceParUid(uid);
  if (!piece) return { ok: false, erreur: "Pièce introuvable." };
  if (piece.niveau >= NIVEAU_MAX_PIECE) return { ok: false, erreur: "Cette pièce est déjà au niveau maximum." };
  const cout = coutAmelioration(piece.niveau);
  if (partie.equipement.eclats < cout) return { ok: false, erreur: `Il te manque ${cout - partie.equipement.eclats} éclats.` };
  partie.equipement.eclats -= cout;
  piece.niveau += 1;
  signaler("amelioration");
  sauver();
  return { ok: true, cout };
}

export function recyclerPiece(uid) {
  const piece = pieceParUid(uid);
  if (!piece) return { ok: false, erreur: "Pièce introuvable." };
  if (piece.verrou) return { ok: false, erreur: "Cette pièce est protégée par le cadenas." };
  if (piece.porteur) return { ok: false, erreur: "Retire d'abord cette pièce du perso qui la porte." };
  const gain = recyclerSansSauver(uid);
  sauver();
  return { ok: true, gain };
}

export function recyclerCommunesLibres() {
  const cibles = partie.equipement.pieces.filter((p) => p.rarete === "commun" && !p.porteur && !p.verrou).map((p) => p.uid);
  const gain = cibles.reduce((total, uid) => total + recyclerSansSauver(uid), 0);
  sauver();
  return { nombre: cibles.length, gain };
}

export function basculerVerrou(uid) {
  const piece = pieceParUid(uid);
  if (!piece) return;
  piece.verrou = !piece.verrou;
  sauver();
}

// Pour chaque emplacement, la meilleure piece libre (ou deja portee) que ce perso peut porter
export function equiperMeilleur(persoId) {
  const perso = PERSOS_PAR_ID[persoId];
  if (!possede(persoId)) return 0;
  const prog = progressionDe(persoId);
  const base = calculerStatsFinales(perso, { niveau: prog.niveau, etoiles: prog.etoiles });
  let changements = 0;
  for (const emplacement of ORDRE_EMPLACEMENTS) {
    const possibles = partie.equipement.pieces.filter((p) =>
      p.emplacement === emplacement && (!p.porteur || p.porteur === persoId) && peutPorter(persoId, p));
    if (!possibles.length) continue;
    const meilleure = possibles.reduce((a, b) => (scorePiece(b, perso.role, base) > scorePiece(a, perso.role, base) ? b : a));
    const actuelle = possibles.find((p) => p.porteur === persoId);
    if (meilleure !== actuelle) {
      if (actuelle) actuelle.porteur = null;
      meilleure.porteur = persoId;
      changements++;
    }
  }
  sauver();
  return changements;
}

// ---------- Chasse ----------

export const bossBattu = (zoneId) => Boolean(partie?.chasse.bossBattus.includes(zoneId));
export const zoneOuverte = (zoneId) => zoneId === 1 || bossBattu(zoneId - 1) || chapitreTermine(zoneId - 1);

// Applique le resultat d'un combat de chasse.
// index : 0 a 2 pour les sous-zones, 3 pour le boss.
export function appliquerResultatChasse({ zoneId, index, dore = false, victoire, ids, duree = 90, ultimesManuels = 0 }) {
  const zone = ZONES.find((z) => z.id === zoneId);
  const boss = index === 3;
  const niveau = boss ? zone.boss.niveau : zone.sousZones[index].niveau + (dore ? BONUS_DORE.niveau : 0);

  const gain = xpChasse(niveau, victoire);
  const xp = ids.filter(possede).map((id) => donnerXp(id, gain));
  const gainReserve = Math.round(gain * PART_XP_RESERVE);
  for (const id of idsPossedes()) if (!ids.includes(id)) donnerXp(id, gainReserve);

  const eclatsGagnes = eclatsChasse(niveau, victoire, boss);
  partie.equipement.eclats += eclatsGagnes;

  let butin = [];
  let zoneDebloquee = null;
  if (victoire) {
    const tirage = tirerButin(Math.random, tableButin(zone, index), {
      butinPct: butinEquipe(ids),
      multiplicateur: dore ? BONUS_DORE.butin : 1,
    });
    butin = ajouterObjets(tirage);
    if (boss && !bossBattu(zoneId)) {
      partie.chasse.bossBattus.push(zoneId);
      if (ZONES.some((z) => z.id === zoneId + 1)) zoneDebloquee = zoneId + 1;
    }
  }

  partie.stats.combats += 1;
  if (victoire) {
    partie.stats.victoires += 1;
    signaler("victoire");
    if (duree < 30) signaler("victoire-rapide");
    const series = ids.map((id) => PERSOS_PAR_ID[id]?.serie);
    if (series.some((x, i) => series.indexOf(x) !== i)) signaler("victoire-serie");
  }
  signaler("ultime-manuel", ultimesManuels);
  signaler("niveau", xp.reduce((total, x) => total + (x.niveauApres - x.niveauAvant), 0));
  if (victoire) noterInsolites(ids, duree, arguments[0].koAllies ?? 0, "appliquerResultatChasse");
  if (victoire && ids.some(estALHonneur)) { signalerSemaine("victoire-honneur"); signaler("victoire-honneur"); }
  if (victoire) { partie.stats.victoiresChasse = (partie.stats.victoiresChasse ?? 0) + 1; signaler("victoire-chasse"); if (dore) { partie.stats.dores = (partie.stats.dores ?? 0) + 1; signalerSemaine("chasse-dore"); signaler("chasse-dore"); } }
  const liensDecouverts = victoire ? compterLiens(ids) : [];
  sauver();
  return { liens: liensDecouverts, xp, xpReserve: gainReserve, eclats: eclatsGagnes, butin, zoneDebloquee };
}

// ---------- Campagne ----------

const cleEtape = (chapitre, numero) => `${chapitre}-${numero}`;
export const etoilesEtape = (chapitre, numero) => partie?.campagne.etoiles[cleEtape(chapitre, numero)] ?? 0;
export const etapeBattue = (chapitre, numero) => Boolean(etoilesEtape(chapitre, numero) & ETOILE_VICTOIRE);
export const chapitreTermine = (chapitre) => etapeBattue(chapitre, 8);
export const chapitreOuvert = (chapitre) => chapitre === 1 || chapitreTermine(chapitre - 1);

export function etapeOuverte(chapitre, numero) {
  if (numero === 1) return chapitreOuvert(chapitre);
  return etapeBattue(chapitre, numero - 1);
}

// La premiere etape ouverte pas encore battue (ou la toute derniere si tout est fini)
export function prochaineEtape() {
  return TOUTES_LES_ETAPES.find((et) => etapeOuverte(et.chapitre, et.numero) && !etapeBattue(et.chapitre, et.numero))
    ?? TOUTES_LES_ETAPES[TOUTES_LES_ETAPES.length - 1];
}

// La plus avancee des etapes battues (pour l'expedition)
export function meilleureEtape() {
  return [...TOUTES_LES_ETAPES].reverse().find((et) => etapeBattue(et.chapitre, et.numero)) ?? null;
}

export function etoilesChapitre(chapitre) {
  return CHAPITRES[chapitre - 1].etapes.reduce((s, et) => s + nombreEtoiles(etoilesEtape(chapitre, et.numero)), 0);
}

export const coffreOuvert = (chapitre, index) => Boolean(partie?.campagne.coffres.includes(`${chapitre}-${index}`));

export function ouvrirCoffre(chapitre, index) {
  const coffre = COFFRES[index];
  if (!coffre || coffreOuvert(chapitre, index) || etoilesChapitre(chapitre) < coffre.etoiles) return null;
  partie.campagne.coffres.push(`${chapitre}-${index}`);
  partie.encre += coffre.encre;
  partie.equipement.eclats += coffre.eclats;
  let objets = [];
  if (coffre.objet) {
    const liste = OBJETS.filter((o) => o.zone === chapitre && o.rarete === coffre.objet);
    // Le dernier coffre a 10 % de chance de donner le Legendaire de la zone a la place
    const legendaire = coffre.objet === "epique" && Math.random() < 0.1 ? OBJETS.find((o) => o.zone === chapitre && o.rarete === "legendaire") : null;
    const choix = legendaire ?? liste[Math.floor(Math.random() * liste.length)];
    if (choix) objets = ajouterObjets([choix.id]);
  }
  sauver();
  return { ...coffre, objets };
}

// Applique le resultat d'un combat de campagne. koAllies : nombre de tes persos KO a la fin.
export function appliquerResultatCampagne({ chapitre, numero, victoire, ids, duree = 90, ultimesManuels = 0, koAllies = 5 }) {
  const etape = etapeDe(chapitre, numero);
  const avant = etoilesEtape(chapitre, numero);
  const premiereVictoire = victoire && !(avant & ETOILE_VICTOIRE);

  // Etoiles : on garde le meilleur resultat obtenu sur chaque objectif
  let masque = avant;
  if (victoire) {
    masque |= ETOILE_VICTOIRE;
    if (koAllies === 0) masque |= ETOILE_SANS_KO;
    if (duree < SECONDES_RAPIDE) masque |= ETOILE_RAPIDE;
  }
  partie.campagne.etoiles[cleEtape(chapitre, numero)] = masque;

  const gainEncre = victoire ? encreEtape(etape, premiereVictoire) : 1;
  partie.encre += gainEncre;
  if (victoire && !partie.expedition) partie.expedition = { debut: Date.now() };

  const gain = xpEtape(etape, victoire);
  const xp = ids.filter(possede).map((id) => donnerXp(id, gain));
  const gainReserve = Math.round(gain * PART_XP_RESERVE);
  for (const id of idsPossedes()) if (!ids.includes(id)) donnerXp(id, gainReserve);

  // Butin : sur a la premiere victoire d'une elite ou d'un boss (piece du boss pour le boss),
  // une chance sur 2 a la premiere victoire normale, une sur 7 ensuite
  let butin = [];
  if (victoire) {
    if (premiereVictoire && etape.type === "boss") {
      const pieces = OBJETS.filter((o) => o.zone === chapitre && o.rarete === "epique");
      butin = ajouterObjets([pieces[Math.floor(Math.random() * pieces.length)].id]);
    } else if ((premiereVictoire && (etape.type === "elite" || Math.random() < 0.5)) || Math.random() < 0.15) {
      butin = butinZone(chapitre, 1);
    }
  }

  partie.stats.combats += 1;
  if (victoire) {
    partie.stats.victoires += 1;
    signaler("victoire");
    if (duree < 30) signaler("victoire-rapide");
    const series = ids.map((id) => PERSOS_PAR_ID[id]?.serie);
    if (series.some((x, i) => series.indexOf(x) !== i)) signaler("victoire-serie");
  }
  signaler("ultime-manuel", ultimesManuels);
  signaler("niveau", xp.reduce((total, x) => total + (x.niveauApres - x.niveauAvant), 0));
  if (victoire) noterInsolites(ids, duree, arguments[0].koAllies ?? 0, "appliquerResultatCampagne");
  if (victoire && ids.some(estALHonneur)) { signalerSemaine("victoire-honneur"); signaler("victoire-honneur"); }
  const liensDecouverts = victoire ? compterLiens(ids) : [];
  const ticketsChapitre = premiereVictoire && numero === 8 ? TICKETS_CHAPITRE : 0;
  if (ticketsChapitre) donnerTickets(ticketsChapitre);   // un chapitre fini : des boosters offerts
  sauver();

  const suivante = numero < 8 ? etapeDe(chapitre, numero + 1) : etapeDe(chapitre + 1, 1);
  return { liens: liensDecouverts,
    encre: gainEncre,
    premiereVictoire,
    etoilesAvant: avant,
    etoiles: masque,
    xp,
    xpReserve: gainReserve,
    butin,
    suivante: suivante && etapeOuverte(suivante.chapitre, suivante.numero) ? suivante : null,
    chapitreTermine: premiereVictoire && numero === 8 ? chapitre : null,
    tickets: ticketsChapitre,
  };
}

// ---------- Histoire ----------

export const sceneVue = (cle) => Boolean(partie?.histoire.vues.includes(cle));

export function marquerSceneVue(cle) {
  if (!partie || sceneVue(cle)) return;
  partie.histoire.vues.push(cle);
  sauver();
}

// ---------- Retouche a l'encre ----------

// Le jet propose est garde dans la sauvegarde : recharger la page ne le fait pas perdre,
// et on ne peut pas lancer une autre retouche tant que celle-ci n'est pas tranchee.
function retoucheEnCours() {
  const r = partie?.equipement.retouche;
  if (!r) return null;
  if (!pieceParUid(r.uid)?.lignes[r.index]) {
    partie.equipement.retouche = null;   // la piece a ete recyclee entre-temps
    return null;
  }
  return r;
}

export function retoucherLigne(uid, index) {
  const piece = pieceParUid(uid);
  if (!piece || !piece.lignes[index]) return { ok: false, erreur: "Ligne introuvable." };
  const attente = retoucheEnCours();
  if (attente) {
    const autre = pieceParUid(attente.uid);
    return { ok: false, erreur: attente.uid === uid
      ? "Choisis d'abord entre l'ancien et le nouveau jet."
      : `Choisis d'abord entre l'ancien et le nouveau jet de ${nomPiece(autre)}.` };
  }
  if (piece.sublime === index) return { ok: false, erreur: "Cette ligne est sublimée : la retoucher l'effacerait." };
  const cout = coutRetouche(piece);
  if (partie.equipement.eclats < cout) return { ok: false, erreur: `Il te manque ${cout - partie.equipement.eclats} éclats.` };
  partie.equipement.eclats -= cout;
  piece.retouches = (piece.retouches ?? 0) + 1;
  partie.equipement.retouche = { uid, index, valeur: nouveauJet(Math.random, piece, index) };
  partie.stats.retouches = (partie.stats.retouches ?? 0) + 1;
  signalerSemaine("retouche");
  sauver();
  return { ok: true, cout, ancienne: piece.lignes[index].valeur, nouvelle: partie.equipement.retouche.valeur, index };
}

export const retouchePendante = (uid) => {
  const r = retoucheEnCours();
  return r?.uid === uid ? { ...r } : null;
};

// L'uid de la piece qui attend un choix de retouche (pour le badge de l'inventaire)
export const uidRetouchePendante = () => retoucheEnCours()?.uid ?? null;

// garderNouveau : true pour garder le nouveau jet, false pour l'ancien
export function choisirRetouche(uid, garderNouveau) {
  const r = retoucheEnCours();
  if (!r || r.uid !== uid) return;
  const piece = pieceParUid(uid);
  if (piece && garderNouveau) piece.lignes[r.index].valeur = r.valeur;
  partie.equipement.retouche = null;
  sauver();
}

// Equiper le meilleur pour toute l'equipe, dans l'ordre des places
export function equiperMeilleurEquipe() {
  return partie.equipe.filter(Boolean).reduce((total, id) => total + equiperMeilleur(id), 0);
}

// ---------- Ressources rares ----------

export const ressources = () => ({ ...(partie?.ressources ?? { fragments: 0, encreSacree: 0 }) });

// ---------- La Tour des Mille Volumes ----------

export const tourOuverte = () => chapitreTermine(2);

// Une nouvelle semaine remet a zero les etages et coffres de la semaine
function assurerSemaine() {
  const semaine = numeroSemaine();
  if (partie.tour.semaine !== semaine) {
    partie.tour.semaine = semaine;
    partie.tour.etagesSemaine = [];
    partie.tour.coffresSemaine = [];
  }
  return partie.tour;
}

export function etatTour() {
  if (!partie) return null;
  const t = assurerSemaine();
  return {
    record: t.record,
    etagesSemaine: t.etagesSemaine.length,
    coffresSemaine: [...t.coffresSemaine],
    prochain: t.record + 1,
    arc: arcDeLaSemaine(),
  };
}

export function appliquerResultatTour({ etage, victoire, ids, duree = 90, ultimesManuels = 0 }) {
  const t = assurerSemaine();
  const et = etageTour(etage);
  const arc = arcDeLaSemaine();
  const premiere = victoire && etage > t.record;

  const gain = xpTour(et, victoire, arc);
  const xp = ids.filter(possede).map((id) => donnerXp(id, gain));
  const gainReserve = Math.round(gain * PART_XP_RESERVE);
  for (const id of idsPossedes()) if (!ids.includes(id)) donnerXp(id, gainReserve);

  let eclatsGagnes = 0, encreGagnee = 0, fragments = 0, encreSacree = 0;
  if (victoire) {
    eclatsGagnes = eclatsEtage(etage, premiere);
    if (premiere) {
      encreGagnee = encreEtage(etage);
      fragments = fragmentsEtage(etage);
      if (et.boss && etage >= 30 && Math.random() < CHANCE_ENCRE_SACREE) encreSacree = 1;
      t.record = etage;
    }
    if (!t.etagesSemaine.includes(etage)) t.etagesSemaine.push(etage);
  }
  partie.equipement.eclats += eclatsGagnes;
  partie.encre += encreGagnee;
  partie.ressources.fragments += fragments;
  partie.ressources.encreSacree += encreSacree;

  // Objets de la Tour : a partir de l'etage 30 (un Epique sur 4 victoires, sur a la premiere
  // victoire d'un boss) ; Legendaires des profondeurs sur les boss a partir de l'etage 50
  let butin = [];
  if (victoire && etage >= 30) {
    const eligibles = OBJETS.filter((o) => o.zone === 6 && o.niveau <= et.niveau + 5);
    const epiques = eligibles.filter((o) => o.rarete === "epique");
    const legendaires = eligibles.filter((o) => o.rarete === "legendaire");
    const ids = [];
    if (epiques.length && ((premiere && et.boss) || Math.random() < 0.25)) ids.push(epiques[Math.floor(Math.random() * epiques.length)].id);
    if (legendaires.length && et.boss && etage >= 50 && Math.random() < 0.05) ids.push(legendaires[Math.floor(Math.random() * legendaires.length)].id);
    butin = ajouterObjets(ids);
  }

  partie.stats.combats += 1;
  if (victoire) {
    partie.stats.victoires += 1;
    signaler("victoire");
    if (duree < 30) signaler("victoire-rapide");
  }
  signaler("ultime-manuel", ultimesManuels);
  signaler("niveau", xp.reduce((total, x) => total + (x.niveauApres - x.niveauAvant), 0));
  if (victoire) noterInsolites(ids, duree, arguments[0].koAllies ?? 0, "appliquerResultatTour");
  if (victoire && ids.some(estALHonneur)) { signalerSemaine("victoire-honneur"); signaler("victoire-honneur"); }
  if (victoire) {
    signalerSemaine("etage-tour");
    signaler("etage-tour");
    const saison = assurerSaison();
    saison.recordTour = Math.max(saison.recordTour, etage);
    debloquerCadresDeRang();
  }
  const liensDecouverts = victoire ? compterLiens(ids) : [];
  sauver();
  return { liens: liensDecouverts, premiere, xp, xpReserve: gainReserve, eclats: eclatsGagnes, encre: encreGagnee, fragments, encreSacree, record: t.record, butin };
}

export function ouvrirCoffreSemaine(index) {
  const t = assurerSemaine();
  const coffre = COFFRES_SEMAINE[index];
  if (!coffre || t.coffresSemaine.includes(index) || t.etagesSemaine.length < coffre.etages) return null;
  const mult = arcDeLaSemaine().coffre ?? 1;
  t.coffresSemaine.push(index);
  partie.stats.coffresSemaine = (partie.stats.coffresSemaine ?? 0) + 1;
  const gains = {
    encre: Math.round(coffre.encre * mult),
    fragments: Math.round(coffre.fragments * mult),
    encreSacree: coffre.encreSacree,
  };
  partie.encre += gains.encre;
  partie.ressources.fragments += gains.fragments;
  partie.ressources.encreSacree += gains.encreSacree;
  sauver();
  return gains;
}

// ---------- Sublimage a l'encre sacree ----------
// Une ligne parfaite depasse son maximum de 15 %. Un seul sublimage par objet.
export function sublimerLigne(uid, index) {
  const piece = pieceParUid(uid);
  if (!piece || !piece.lignes[index]) return { ok: false, erreur: "Ligne introuvable." };
  if (!peutSublimer(piece, index)) return { ok: false, erreur: "Seule une ligne parfaite d'un objet jamais sublimé peut l'être." };
  if (partie.ressources.encreSacree < 1) return { ok: false, erreur: "Il te faut une encre sacrée (boss de la Tour, étage 30 et plus)." };
  partie.ressources.encreSacree -= 1;
  const [, max] = fourchetteLigne(piece, index);
  const entiere = Number.isInteger(max);
  const valeur = max * (1 + BONUS_SUBLIMAGE);
  piece.lignes[index].valeur = entiere ? Math.round(valeur) : Math.round(valeur * 10) / 10;
  piece.sublime = index;
  partie.stats.sublimages = (partie.stats.sublimages ?? 0) + 1;
  sauver();
  return { ok: true };
}

// ---------- Eveil ----------

export function eveiller(id) {
  const prog = partie?.collection[id];
  if (!prog) return { ok: false, erreur: "Perso introuvable." };
  const eveil = prog.eveil ?? 0;
  const suivant = EVEILS[eveil];
  if (!suivant) return { ok: false, erreur: "Éveil déjà complet." };
  if (prog.niveau < niveauMaxDe(prog)) return { ok: false, erreur: `Il faut d'abord le niveau ${niveauMaxDe(prog)}.` };
  if (prog.etoiles < suivant.etoiles) return { ok: false, erreur: `Il faut ${suivant.etoiles} étoiles.` };
  if (partie.ressources.fragments < suivant.fragments) return { ok: false, erreur: "Pas assez de fragments d'éveil." };
  if (partie.equipement.eclats < suivant.eclats) return { ok: false, erreur: "Pas assez d'éclats." };
  partie.ressources.fragments -= suivant.fragments;
  partie.equipement.eclats -= suivant.eclats;
  prog.eveil = eveil + 1;
  prog.talents = prog.talents ?? [];
  partie.stats.eveils = (partie.stats.eveils ?? 0) + 1;
  sauver();
  return { ok: true, palier: prog.eveil };
}

export function choisirTalent(id, palier, choix) {
  const prog = partie?.collection[id];
  if (!prog || palier >= (prog.eveil ?? 0) || !["a", "b"].includes(choix)) return { ok: false, erreur: "Talent indisponible." };
  prog.talents = prog.talents ?? [];
  const change = prog.talents[palier] && prog.talents[palier] !== choix;
  if (change) {
    if (partie.equipement.eclats < COUT_CHANGER_TALENT) return { ok: false, erreur: `Changer de talent coûte ${COUT_CHANGER_TALENT} éclats.` };
    partie.equipement.eclats -= COUT_CHANGER_TALENT;
  }
  prog.talents[palier] = choix;
  sauver();
  return { ok: true };
}

// ---------- Boss de la semaine ----------

function assurerRaid() {
  const semaine = numeroSemaine();
  const jour = aujourdhui();
  partie.raid = partie.raid ?? { semaine, jour, tentatives: 0, meilleur: 0, paliers: [], records: {} };
  if (partie.raid.semaine !== semaine) Object.assign(partie.raid, { semaine, meilleur: 0, paliers: [] });
  if (partie.raid.jour !== jour) Object.assign(partie.raid, { jour, tentatives: 0 });
  return partie.raid;
}

export const raidOuvert = () => chapitreTermine(2);

export function etatRaid() {
  if (!partie) return null;
  const r = assurerRaid();
  const boss = bossDeLaSemaine();
  return { boss, tentativesRestantes: TENTATIVES_PAR_JOUR - r.tentatives, meilleur: r.meilleur, paliers: [...r.paliers], record: r.records[boss.id] ?? 0 };
}

// Trois equipes composees automatiquement, sans perso en double
export function equipesRaid() {
  const restants = Object.fromEntries(Object.entries(partie.collection));
  const equipes = [];
  for (let i = 0; i < 3; i++) {
    const ids = composerEquipe(restants).filter(Boolean);
    if (!ids.length) break;
    equipes.push(ids);
    for (const id of ids) delete restants[id];
  }
  return equipes;
}

// Joue une tentative : les trois combats sont calcules d'un coup
export function tenterRaid() {
  const r = assurerRaid();
  if (r.tentatives >= TENTATIVES_PAR_JOUR) return { ok: false, erreur: "Plus de tentative aujourd'hui : reviens demain !" };
  const boss = bossDeLaSemaine();
  const equipes = equipesRaid();
  const resultats = equipes.map((ids, i) => {
    const combat = simulerCombat({
      equipeA: ids.map(entreeCombat), equipeB: [boss.id], niveauB: NIVEAU_BOSS_RAID,
      graine: Math.floor(Math.random() * 2147483647) + i, journal: false,
    });
    const degats = combat.unites.find((u) => u.camp === 1)?.bilan.recu ?? 0;
    return { ids, degats, duree: combat.duree };
  });
  const score = resultats.reduce((s, x) => s + x.degats, 0);
  r.tentatives += 1;
  const nouveauMeilleur = score > r.meilleur;
  r.meilleur = Math.max(r.meilleur, score);
  r.records[boss.id] = Math.max(r.records[boss.id] ?? 0, score);
  const saison = assurerSaison();
  saison.raid = Math.max(saison.raid, score);
  const semaine = numeroSemaine();
  saison.raidSemaines[semaine] = Math.max(saison.raidSemaines[semaine] ?? 0, score);
  debloquerCadresDeRang();
  partie.stats.raids = (partie.stats.raids ?? 0) + 1;
  signaler("raid");
  signalerSemaine("raid");
  signaler("raid");
  sauver();
  return { ok: true, resultats, score, nouveauMeilleur };
}

export function reclamerPalierRaid(index) {
  const r = assurerRaid();
  const palier = PALIERS_RAID[index];
  if (!palier || r.paliers.includes(index) || r.meilleur < palier.score) return null;
  r.paliers.push(index);
  partie.encre += palier.encre;
  partie.ressources.fragments += palier.fragments;
  partie.ressources.encreSacree += palier.encreSacree;
  sauver();
  return palier;
}

// ---------- Liens entre persos ----------

// Compte une victoire pour chaque duo present dans l'equipe ; renvoie les liens decouverts
function compterLiens(ids) {
  const decouverts = [];
  for (const lien of LIENS) {
    if (!ids.includes(lien.a) || !ids.includes(lien.b)) continue;
    const avant = partie.liens[lien.cle] ?? 0;
    partie.liens[lien.cle] = avant + 1;
    if (avant + 1 === VICTOIRES_DECOUVERTE) decouverts.push(lien);
  }
  return decouverts;
}

export const victoiresLien = (cle) => partie?.liens[cle] ?? 0;

// ---------- Carnet de tampons ----------

function noterInsolites(ids, duree, koAllies, mode) {
  if (koAllies === 0) signaler("victoire-sans-ko");
  dernierBonus = noterVictoireEvenements(ids);
  const ins = (partie.stats.insolites = partie.stats.insolites ?? {});
  const persos = ids.map((id) => PERSOS_PAR_ID[id]).filter(Boolean);
  if (new Set(persos.map((p) => p.serie)).size >= 5) ins.cinqSeries = true;
  if (persos.filter((p) => p.serie === "Pokémon").length >= 3) ins.pokemon = true;
  if (duree < 15) ins.eclair = true;
  if (koAllies === persos.length - 1 && persos.length > 1) ins.survivant = true;
  if (mode === "appliquerResultatCampagne" && persos.length === 5 && persos.every((p) => p.rarete === "commun")) ins.communs = true;
}

// Un resume de la partie pour les conditions des tampons
function contexteTampons() {
  const ids = idsPossedes();
  const progs = ids.map((id) => partie.collection[id]);
  const piecesParPerso = {};
  for (const p of partie.equipement.pieces) if (p.porteur) (piecesParPerso[p.porteur] = piecesParPerso[p.porteur] ?? []).push(p);
  const etoilesEtapes = Object.values(partie.campagne.etoiles);
  return {
    chapitres: CHAPITRES.filter((c) => chapitreTermine(c.id)).length,
    etoiles: etoilesEtapes.reduce((s, m) => s + nombreEtoiles(m), 0),
    chapitreParfait: CHAPITRES.some((c) => etoilesChapitre(c.id) >= 24),
    ratureSansKo: Boolean(etoilesEtape(5, 8) & ETOILE_SANS_KO),
    bossChasse: partie.chasse.bossBattus.length,
    dores: partie.stats.dores ?? 0,
    victoiresChasse: partie.stats.victoiresChasse ?? 0,
    boucleMax: partie.stats.boucleMax ?? 0,
    collection: ids.length,
    cinqEtoiles: progs.some((p) => p.etoiles >= 5),
    serieComplete: [...new Set(PERSOS.map((p) => p.serie))].some((serie) => PERSOS.filter((p) => p.serie === serie).every((p) => possede(p.id))),
    legendaires: PERSOS.filter((p) => p.rarete === "legendaire" && possede(p.id)).length,
    tirages: partie.stats.tirages ?? 0,
    boosters: partie.stats.boosters ?? 0,
    dorees: Object.values(partie.collection).filter((p) => p.variantes?.includes("doree")).length,
    objets: partie.chasse.decouverts.length,
    panoplieComplete: Object.values(piecesParPerso).some((liste) => {
      const c = {};
      for (const p of liste) if (p.panoplie) c[p.panoplie] = (c[p.panoplie] ?? 0) + 1;
      return Object.values(c).some((n) => n >= 4);
    }),
    parfaits: partie.equipement.pieces.filter(pieceParfaite).length,
    sublimes: partie.stats.sublimages ?? 0,
    retouches: partie.stats.retouches ?? 0,
    tour: partie.tour.record,
    coffresSemaine: partie.stats.coffresSemaine ?? 0,
    raids: partie.stats.raids ?? 0,
    raidRecord: Math.max(0, ...Object.values(partie.raid?.records ?? {})),
    liens: LIENS.filter((x) => niveauLien(partie.liens[x.cle] ?? 0) >= 1).length,
    lienMax: LIENS.some((x) => niveauLien(partie.liens[x.cle] ?? 0) >= 5),
    eveils: partie.stats.eveils ?? 0,
    eveilIV: progs.some((p) => (p.eveil ?? 0) >= 4),
    insolites: partie.stats.insolites ?? {},
    victoires: partie.stats.victoires ?? 0,
    jours: partie.stats.jours ?? 1,
    missions: partie.stats.missions ?? 0,
  };
}

// Verifie les tampons, donne les recompenses des nouveaux, et les renvoie
export function verifierTampons() {
  if (!partie) return [];
  const x = contexteTampons();
  const nouveaux = TAMPONS.filter((tp) => !partie.tampons.includes(tp.id) && tp.condition(x));
  for (const tp of nouveaux) {
    partie.tampons.push(tp.id);
    partie.tamponsNouveaux.push(tp.id);
    partie.encre += tp.recompense.encre ?? 0;
    partie.equipement.eclats += tp.recompense.eclats ?? 0;
    partie.ressources.fragments += tp.recompense.fragments ?? 0;
  }
  if (nouveaux.length) sauver();
  return nouveaux;
}

export const tamponsObtenus = () => [...(partie?.tampons ?? [])];
export const tamponsNouveaux = () => [...(partie?.tamponsNouveaux ?? [])];
export function marquerTamponsVus() {
  if (!partie) return;
  partie.tamponsNouveaux = [];
  sauver();
}

export function titresObtenus() {
  const obtenus = new Set(partie?.tampons ?? []);
  return [TITRE_DE_DEPART, ...PAGES.filter((pg) => TAMPONS.filter((tp) => tp.page === pg.id).every((tp) => obtenus.has(tp.id))).map((pg) => pg.titre)];
}
export const titreActuel = () => partie?.titre ?? TITRE_DE_DEPART;
export function choisirTitre(titre) {
  if (!titresObtenus().includes(titre)) return;
  partie.titre = titre;
  sauver();
}

// La plus longue serie de victoires dans une boucle (pour un tampon)
export function noterBoucle(victoires) {
  if (!partie) return;
  partie.stats.boucleMax = Math.max(partie.stats.boucleMax ?? 0, victoires);
  sauver();
}

// Jours joues : compte une fois par jour
export function noterJourJoue() {
  if (!partie) return;
  const jour = aujourdhui();
  if (partie.stats.dernierJour !== jour) {
    partie.stats.dernierJour = jour;
    partie.stats.jours = (partie.stats.jours ?? 0) + 1;
    sauver();
  }
}

// ---------- Missions de la semaine ----------

function assurerMissionsSemaine() {
  const semaine = numeroSemaine();
  if (!partie.missionsSemaine || partie.missionsSemaine.semaine !== semaine) {
    // 3 missions tirees parmi 6, toujours les memes pour une semaine donnee
    const h = creerHasard((semaine * 7919) >>> 0);
    const ordre = [...MISSIONS_SEMAINE];
    for (let i = ordre.length - 1; i > 0; i--) {
      const j = Math.floor(h.nombre() * (i + 1));
      [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
    }
    const choisies = ordre.slice(0, 3);
    partie.missionsSemaine = { semaine, liste: choisies.map((m) => ({ id: m.id, progres: 0, reclamee: false })) };
  }
  return partie.missionsSemaine;
}

function signalerSemaine(evenement, quantite = 1) {
  if (!partie) return;
  for (const m of assurerMissionsSemaine().liste) {
    const def = MISSIONS_SEMAINE.find((x) => x.id === m.id);
    if (def?.evenement === evenement) m.progres = Math.min(def.cible, m.progres + quantite);
  }
}

export function missionsDeLaSemaine() {
  if (!partie) return [];
  return assurerMissionsSemaine().liste.map((m) => ({ ...MISSIONS_SEMAINE.find((x) => x.id === m.id), progres: m.progres, reclamee: m.reclamee }));
}

export function reclamerMissionSemaine(id) {
  const m = assurerMissionsSemaine().liste.find((x) => x.id === id);
  const def = MISSIONS_SEMAINE.find((x) => x.id === id);
  if (!m || !def || m.reclamee || m.progres < def.cible) return null;
  m.reclamee = true;
  partie.encre += def.recompense.encre ?? 0;
  partie.equipement.eclats += def.recompense.eclats ?? 0;
  partie.ressources.fragments += def.recompense.fragments ?? 0;
  sauver();
  return def.recompense;
}

// ---------- Saisons et cosmetiques ----------

// Une nouvelle saison chaque mois ; la precedente laisse une recompense a reclamer
function assurerSaison() {
  const id = saisonActuelle();
  if (!partie.saison) partie.saison = { id, recordTour: 0, raid: 0, raidSemaines: {}, joursActifs: [] };
  partie.saison.raidSemaines ??= {};
  partie.saison.joursActifs ??= [];
  if (partie.saison.id !== id) {
    const rang = rangDe(pointsSaison(partie.saison));
    partie.saisonPrecedente = rang ? { id: partie.saison.id, rang: rang.id, reclamee: false } : null;
    partie.saison = { id, recordTour: 0, raid: 0, raidSemaines: {}, joursActifs: [] };
  }
  return partie.saison;
}

function debloquerCadresDeRang() {
  const s = partie.saison;
  const points = pointsSaison(s);
  for (const r of RANGS) if (points >= r.points && !partie.cosmetiques.cadres.includes(r.id)) partie.cosmetiques.cadres.push(r.id);
}

export function etatSaison() {
  if (!partie) return null;
  const s = assurerSaison();
  const points = pointsSaison(s);
  const rang = rangDe(points);
  const suivant = RANGS.find((r) => r.points > points) ?? null;
  return { id: s.id, recordTour: s.recordTour, raid: s.raid, points, detail: detailPointsSaison(s), rang, suivant, precedente: partie.saisonPrecedente };
}

export function reclamerSaisonPrecedente() {
  const p = partie.saisonPrecedente;
  if (!p || p.reclamee) return null;
  const rang = RANGS.find((r) => r.id === p.rang);
  p.reclamee = true;
  partie.encre += rang.encre;
  partie.ressources.fragments += rang.fragments;
  sauver();
  return rang;
}

export const cadresObtenus = () => CADRES.filter((c) => partie?.cosmetiques.cadres.includes(c.id));
export const cadreActuel = () => partie?.cosmetiques.cadre ?? "encre";
export function choisirCadre(id) {
  if (!partie.cosmetiques.cadres.includes(id)) return;
  partie.cosmetiques.cadre = id;
  sauver();
}

// ---------- Edition deluxe ----------

export const deluxeOuverte = () => chapitreTermine(5);
export const etoilesDeluxe = (chapitre, numero) => partie?.campagne.deluxe?.[`${chapitre}-${numero}`] ?? 0;
export const etapeDeluxeBattue = (chapitre, numero) => Boolean(etoilesDeluxe(chapitre, numero) & ETOILE_VICTOIRE);
export function etapeDeluxeOuverte(chapitre, numero) {
  if (!deluxeOuverte()) return false;
  if (numero === 1) return chapitre === 1 || etapeDeluxeBattue(chapitre - 1, 8);
  return etapeDeluxeBattue(chapitre, numero - 1);
}

// Une etape deluxe : memes ennemis, niveaux 40 a 55, un peu plus coriaces
export function etapeDeluxe(chapitre, numero) {
  const et = etapeDe(chapitre, numero);
  return { ...et, deluxe: true, niveau: 40 + Math.round(((et.global - 1) * 15) / 39), multiplicateur: et.multiplicateur * 1.1 };
}

export function appliquerResultatDeluxe({ chapitre, numero, victoire, ids, duree = 90, ultimesManuels = 0, koAllies = 5 }) {
  const et = etapeDeluxe(chapitre, numero);
  partie.campagne.deluxe = partie.campagne.deluxe ?? {};
  const cle = `${chapitre}-${numero}`;
  const avant = partie.campagne.deluxe[cle] ?? 0;
  const premiereVictoire = victoire && !(avant & ETOILE_VICTOIRE);
  let masque = avant;
  if (victoire) signaler("victoire-deluxe");
  if (victoire) {
    masque |= ETOILE_VICTOIRE;
    if (koAllies === 0) masque |= ETOILE_SANS_KO;
    if (duree < SECONDES_RAPIDE) masque |= ETOILE_RAPIDE;
  }
  partie.campagne.deluxe[cle] = masque;

  const gain = xpEtape(et, victoire);
  const xp = ids.filter(possede).map((id) => donnerXp(id, gain));
  let encreGagnee = victoire ? 5 : 1, eclatsGagnes = 0, fragments = 0, butin = [];
  if (premiereVictoire) {
    encreGagnee = 20;
    eclatsGagnes = 50;
    fragments = et.type === "boss" ? 4 : et.type === "elite" ? 2 : 1;
    if (et.type === "boss") {
      const epiques = OBJETS.filter((o) => o.zone === 6 && o.rarete === "epique" && o.niveau <= et.niveau);
      if (epiques.length) butin = ajouterObjets([epiques[Math.floor(Math.random() * epiques.length)].id]);
      if (!partie.cosmetiques.cadres.includes(`deluxe-${chapitre}`)) partie.cosmetiques.cadres.push(`deluxe-${chapitre}`);
    }
  }
  partie.encre += encreGagnee;
  partie.equipement.eclats += eclatsGagnes;
  partie.ressources.fragments += fragments;
  partie.stats.combats += 1;
  if (victoire) {
    partie.stats.victoires += 1;
    signaler("victoire");
    noterInsolites(ids, duree, koAllies, "deluxe");
    if (ids.some(estALHonneur)) { signalerSemaine("victoire-honneur"); signaler("victoire-honneur"); }
  }
  signaler("ultime-manuel", ultimesManuels);
  const liensDecouverts = victoire ? compterLiens(ids) : [];
  sauver();
  const suivante = numero < 8 ? etapeDeluxe(chapitre, numero + 1) : chapitre < 5 ? etapeDeluxe(chapitre + 1, 1) : null;
  return {
    liens: liensDecouverts, encre: encreGagnee, eclats: eclatsGagnes, fragments, butin, premiereVictoire,
    etoilesAvant: avant, etoiles: masque, xp, xpReserve: 0,
    suivante: suivante && etapeDeluxeOuverte(suivante.chapitre, suivante.numero) ? suivante : null,
    chapitreTermine: null,
  };
}

// ---------- Expeditions ciblees (2 emplacements en plus) ----------
// Une equipe de reserve part dans une zone de chasse pour 2, 8 ou 12 h.

export const DUREES_EXPEDITION = [2, 8, 12];

export function emplacementsExpedition() {
  if (!partie) return [];
  const ouverts = [chapitreTermine(3), chapitreTermine(5)];
  return [0, 1].map((i) => {
    const m = partie.expeditionsCiblees[i];
    const fin = m ? m.debut + m.duree * 3600000 : 0;
    return { index: i, ouvert: ouverts[i], condition: i === 0 ? "Termine le chapitre 3" : "Termine le chapitre 5", mission: m, finie: Boolean(m) && Date.now() >= fin, restant: Math.max(0, fin - Date.now()) };
  });
}

export function lancerExpeditionCiblee(index, zoneId, duree) {
  const emplacement = emplacementsExpedition()[index];
  if (!emplacement?.ouvert || emplacement.mission || !zoneOuverte(zoneId) || !DUREES_EXPEDITION.includes(duree)) return { ok: false, erreur: "Impossible de lancer cette expédition." };
  // L'equipe : les meilleurs persos qui ne sont ni dans l'equipe principale ni deja partis
  const occupes = new Set([...partie.equipe.filter(Boolean), ...partie.expeditionsCiblees.filter(Boolean).flatMap((m) => m.equipe)]);
  const libres = Object.fromEntries(Object.entries(partie.collection).filter(([id]) => !occupes.has(id)));
  const equipe = composerEquipe(libres).filter(Boolean);
  if (!equipe.length) return { ok: false, erreur: "Aucun perso de réserve disponible." };
  partie.expeditionsCiblees[index] = { zone: zoneId, duree, debut: Date.now(), equipe };
  sauver();
  return { ok: true, equipe };
}

export function recupererExpeditionCiblee(index) {
  const emplacement = emplacementsExpedition()[index];
  if (!emplacement?.finie) return null;
  const m = emplacement.mission;
  const zone = ZONES.find((z) => z.id === m.zone);
  const combats = m.duree * EXPEDITION_COMBATS_PAR_HEURE;
  const gains = { encre: combats * 2, eclats: combats * 3, xp: Math.round(combats * xpChasse(zone.sousZones[1].niveau, true) * 0.5) };
  partie.encre += gains.encre;
  partie.equipement.eclats += gains.eclats;
  for (const id of m.equipe) if (possede(id)) donnerXp(id, gains.xp);
  gains.butin = butinZone(m.zone, Math.floor(m.duree / 2));
  partie.expeditionsCiblees[index] = null;
  signaler("expedition");
  sauver();
  return gains;
}

// ---------- Equipes enregistrees ----------

export const equipesEnregistrees = () => [...(partie?.equipesEnregistrees ?? [null, null, null])];

export function enregistrerEquipe(index, nom) {
  if (!partie || index < 0 || index > 2) return;
  partie.equipesEnregistrees[index] = { nom: nom || `Équipe ${index + 1}`, equipe: [...partie.equipe] };
  sauver();
}

export function chargerEquipe(index) {
  const e = partie?.equipesEnregistrees[index];
  if (!e) return null;
  partie.equipe = e.equipe.map((id) => (id && possede(id) ? id : null));
  sauver();
  return [...partie.equipe];
}

// ---------- Quoi de neuf : tout ce qui attend le joueur ----------

export function nouveautes() {
  if (!partie) return [];
  const liste = [];
  if (evenementsAReclamer() > 0) liste.push({ texte: "Une récompense d'événement t'attend", nav: "qg" });
  const tickets = assurerTickets().tickets;
  if (tickets > 0) liste.push({ texte: `${tickets} booster${tickets > 1 ? "s" : ""} à ouvrir`, nav: "tirages" });
  const m = missionsDuJour();
  if (m.liste.some((x) => !x.reclamee && x.progres >= x.cible)) liste.push({ texte: "Une mission du jour est à réclamer", nav: "qg" });
  if (missionsDeLaSemaine().some((x) => !x.reclamee && x.progres >= x.cible)) liste.push({ texte: "Une mission de la semaine est à réclamer", nav: "qg" });
  if (CHAPITRES.some((c) => COFFRES.some((cf, i) => !coffreOuvert(c.id, i) && etoilesChapitre(c.id) >= cf.etoiles))) liste.push({ texte: "Un coffre d'étoiles t'attend", nav: "aventure", onglet: "campagne" });
  if (tourOuverte()) {
    const t = etatTour();
    if (COFFRES_SEMAINE_TOUR.some((c, i) => !t.coffresSemaine.includes(i) && t.etagesSemaine >= c.etages)) liste.push({ texte: "Un coffre de la Tour est prêt", nav: "aventure", onglet: "tour" });
    const r = etatRaid();
    if (PALIERS_RAID.some((p, i) => !r.paliers.includes(i) && r.meilleur >= p.score)) liste.push({ texte: "Une récompense du boss de la semaine est prête", nav: "aventure", onglet: "raid" });
    if (r.tentativesRestantes > 0) liste.push({ texte: `${r.tentativesRestantes} tentative${r.tentativesRestantes > 1 ? "s" : ""} contre le boss de la semaine`, nav: "aventure", onglet: "raid" });
  }
  if (emplacementsExpedition().some((e) => e.finie)) liste.push({ texte: "Une expédition ciblée est terminée", nav: "qg" });
  const eveillables = idsPossedes().filter((id) => {
    const p = partie.collection[id];
    const s = EVEILS[p.eveil ?? 0];
    return s && p.niveau >= niveauMaxDe(p) && p.etoiles >= s.etoiles && partie.ressources.fragments >= s.fragments && partie.equipement.eclats >= s.eclats;
  });
  if (eveillables.length) liste.push({ texte: `${PERSOS_PAR_ID[eveillables[0]].nom} peut s'éveiller`, nav: "collection" });
  if (partie.tamponsNouveaux.length) liste.push({ texte: `${partie.tamponsNouveaux.length} nouveau${partie.tamponsNouveaux.length > 1 ? "x" : ""} tampon${partie.tamponsNouveaux.length > 1 ? "s" : ""} dans ton carnet`, nav: "collection", onglet: "carnet" });
  if (partie.saisonPrecedente && !partie.saisonPrecedente.reclamee) liste.push({ texte: "La récompense de la saison passée t'attend", nav: "qg" });
  return liste;
}

// ---------- Jeu en ligne : resume public et sauvegarde brute ----------

// Les chiffres montres au classement et sur la vitrine
export function resumeJoueur() {
  if (!partie) return { collection: 0, etoiles: 0, tour: 0, raid: 0 };
  const progs = Object.values(partie.collection);
  return {
    collection: progs.length,
    etoiles: progs.reduce((s, p) => s + (p.etoiles ?? 0), 0),
    tour: partie.tour.record,
    raid: Math.max(0, ...Object.values(partie.raid?.records ?? {})),
  };
}

export const partieBrute = () => (partie ? JSON.parse(JSON.stringify(partie)) : null);

// Remplace la partie par une sauvegarde venue du serveur. Renvoie true si elle est valide
export function remplacerPartie(brut) {
  const nouvelle = valider(brut);
  if (!nouvelle) return false;
  partie = nouvelle;
  sauver();
  return true;
}
