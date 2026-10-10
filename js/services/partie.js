// ==========================================================
// LA PARTIE DU JOUEUR
// Tout ce que le joueur possede tient dans un seul objet,
// sauvegarde dans le navigateur a chaque changement.
// Le numero de version permettra de convertir les anciennes
// sauvegardes lors des futures mises a jour.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID, PERSOS_SECRETS } from "../donnees/persos.js";
import { estSecret, ANCIENS_IDS_SECRETS } from "../donnees/persos-secrets.js";
import { PALIERS } from "../donnees/ennemis.js";
import {
  ENCRE_DE_DEPART,
  xpCombat, encreCombat, PART_XP_RESERVE,
  EXPEDITION_COMBATS_PAR_HEURE, EXPEDITION_HEURES_MAX, MISSIONS_PAR_JOUR, BONUS_TOUTES_MISSIONS,
} from "../donnees/progression.js";
import { nouvelleProgression, ajouterXp, ajouterDoublon } from "../moteur/progression.js";
import { doublonsPourEtoile, ASCENSION_MAX, coutAscension } from "../donnees/progression.js";
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
import { bossDeLaSemaine, NIVEAU_BOSS_RAID, TENTATIVES_PAR_JOUR, PALIERS_RAID, PALIERS_COLLECTIFS } from "../donnees/raid.js";
import { LIENS, niveauLien, BONUS_PAR_NIVEAU_LIEN, VICTOIRES_DECOUVERTE } from "../donnees/liens.js";
import { TAMPONS, PAGES, TITRE_DE_DEPART } from "../donnees/tampons.js";
import { serieDeLaSemaine, BONUS_HONNEUR, BUTIN_HONNEUR, MISSIONS_SEMAINE, SERIES } from "../donnees/hebdo.js";
import {
  ENERGIE_MAX, MINUTES_PAR_ENERGIE, ENERGIE_PLAFOND, COUT_ENERGIE, RECHARGE_ENCRE, ENERGIE_BONUS_MISSIONS,
  DEFI_DU_JOUR, CALENDRIER, PALIERS_TOURNOI,
} from "../donnees/evenements.js";
import { GUIDE } from "../donnees/guide.js";
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
  EDITIONS, EDITIONS_PAR_ID, PRIX_BOOSTER, MINUTES_BOOSTER_GRATUIT, STOCK_GRATUIT_MAX, TICKETS_DEPART,
  POUSSIERE_PAR_BOOSTER, POUSSIERE_DOUBLON, COUT_FABRICATION, PITIE_BOOSTER, TICKETS_CHAPITRE,
} from "../donnees/boosters.js";
import { invoquer, phaseAutel, phaseRelancee, definitionPhase } from "../moteur/invocations.js";
import { CODES_CADEAUX } from "../donnees/codes.js";
import {
  INVOCATIONS_MAX, MINUTES_PAR_INVOCATION, INVOCATIONS_DEPART, INVOCATIONS_VICTOIRE, CHANCE_INVOCATION_VICTOIRE, INVOCATIONS_PLAFOND,
  NIVEAUX_AUTEL, INVOCATIONS_PAR_NIVEAU_EN_PLUS, POINTS_PAR_NIVEAU, BRANCHES_AUTEL, CHANCE_PAR_POINT, VITESSE_PAR_POINT,
  POTIONS_PAR_POINT, BORDURE_PAR_POINT, COUT_REDISTRIBUTION, FUSION,
  CHANCE_BOSS_ARENE, CHANCE_MONDE_FINI, CHANCE_MONDE_DIFFICILE, CHANCE_PAR_10_ETAGES, CHANCE_TOUR_MAX, CHANCE_PAR_EVEIL, CHANCE_EVEIL_MAX,
  CHANCE_SERIE_COMPLETE, CHANCE_EDITION_COMPLETE, CHANCE_PAR_BORDURE, CHANCE_PAR_SECRET,
  POTIONS_PAR_ID, MULT_POTION_CHANCE, MULT_POTION_BORDURE, MINUTES_POTION_MAX, POTIONS_DEPART, CHANCE_POTION_VICTOIRE,
  POUSSIERE_DOUBLON_INVOCATION, MONDES, PITIE_INVOCATION, ORDRE_BORDURES, DELAI_TIRAGE_MS, DELAI_RAPIDE_MS, FACTEUR_POTION_VITESSE,
  BONUS_STATS_BORDURE,
} from "../donnees/invocations.js";
import {
  BOSS_ARENE, BOSS_ARENE_PAR_ID, recompensePremierKo, recompenseKo, CHANCE_CARTE_BOSS_REJOUE, CHANCE_POTION_REJOUE, INVOCATIONS_SANS_PERSO_BOSS,
  DIFFICULTES, DIFFICULTES_PAR_ID, cleBoss,
} from "../donnees/arene.js";
import { PALIERS_PASSE, XP_PAR_PALIER, XP_INVOCATION, XP_VICTOIRE, XP_MISSION } from "../donnees/passe.js";
import {
  DESCENTES_PAR_JOUR, VIES_DEPART, ETAGES_PAR_BENEDICTION, PART_GARDEE_SI_KO, butinEtage, typeEtage,
  BENEDICTIONS, BENEDICTIONS_PAR_ID, MAITRISES_PAR_ID, CHANCE_PAR_10_ETAGES_DONJON, CHANCE_DONJON_MAX,
} from "../donnees/donjon.js";
import { adversaireEtage, bonusDescente, facteurRarete } from "../moteur/donjon.js";
import {
  ACTES, RANGS_PAR_ACTE, ETOILES_MAX_PARTIE, TERRAIN_MAX, RESERVE_MAX, OR_DEPART, OFFRE_DEPART, CHOIX_DEPART,
  RECRUES_PROPOSEES, OR_SI_ON_PASSE, PV_APRES_KO, SOIN_APRES_COMBAT, SOIN_REPOS, SOIN_BOSS, PARTIES_RECOMPENSEES_PAR_JOUR,
  orCombat, PRIX_PERSOS, PRIX_RELIQUES, PRIX_SOIN, PRIX_ENTRAINEMENT, SOIN_BOUTIQUE, RECOMPENSES,
  RELIQUES_PAR_ID, EVENEMENTS_PAR_ID,
} from "../donnees/encrier.js";
import {
  genererCarte, caseDe, offrePersos, hasardDe, adversaireCase, tirerReliques, effetsReliques, tirerEvenement, reussite, equipeDeCombat, persoExiste,
} from "../moteur/encrier.js";
import {
  EQUIPES_EXPLORATION, BONUS_SERIE_EXPLORATION, PERSOS_SERIE_BONUS, MISSIONS_EXPLORATION, MISSIONS_EXPLORATION_PAR_ID,
} from "../donnees/explorations.js";
import { ETAPES_QUETE } from "../donnees/quetes.js";
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

// Etat de l'autel ; une ancienne sauvegarde recoit la reserve et les potions de depart
function validerInvocations(v) {
  const entier = (x, d = 0) => Math.max(0, Math.floor(Number(x ?? d)) || 0);
  const potions = {};
  const actives = {};
  for (const id of Object.keys(POTIONS_PAR_ID)) {
    potions[id] = entier(v?.potions?.[id], POTIONS_DEPART[id]);   // une potion nouvelle arrive avec sa dotation de depart
    actives[id] = Number(v?.actives?.[id]) || 0;
  }
  return {
    reserve: Math.min(INVOCATIONS_PLAFOND, entier(v?.reserve, INVOCATIONS_DEPART)),
    maj: Number(v?.maj) || Date.now(),
    total: entier(v?.total),
    pitie: entier(v?.pitie),
    monde: MONDES.some((m) => m.edition === v?.monde) ? v.monde : MONDES[0].edition,
    potions, actives,
    points: Object.fromEntries(BRANCHES_AUTEL.map((b) => [b.id, Math.min(b.max, entier(v?.points?.[b.id]))])),
    phaseForcee: v?.phaseForcee && typeof v.phaseForcee.id === "string" && definitionPhase(v.phaseForcee.id) ? v.phaseForcee : null,
  };
}

// Le donjon : record, cristaux, maitrises, descentes du jour, descente en cours
function validerDonjon(d) {
  const entier = (x) => Math.max(0, Math.floor(Number(x) || 0));
  const maitrises = {};
  for (const [id, n] of Object.entries(d?.maitrises ?? {})) if (MAITRISES_PAR_ID[id]) maitrises[id] = Math.min(MAITRISES_PAR_ID[id].max, entier(n));
  const r = d?.run;
  const run = r && Array.isArray(r.deck) && r.deck.length === 5 && r.deck.every((id) => PERSOS_PAR_ID[id]) ? {
    graine: entier(r.graine), etage: Math.max(1, entier(r.etage)), vies: entier(r.vies), niveauDeck: Math.max(1, entier(r.niveauDeck)),
    deck: r.deck, benedictions: Array.isArray(r.benedictions) ? r.benedictions.filter((id) => BENEDICTIONS_PAR_ID[id]) : [],
    choix: Array.isArray(r.choix) ? r.choix.filter((id) => BENEDICTIONS_PAR_ID[id]) : null,
    sac: { encre: entier(r.sac?.encre), cristaux: entier(r.sac?.cristaux), invocations: entier(r.sac?.invocations) },
    journal: Array.isArray(r.journal) ? r.journal.slice(-30) : [],
  } : null;
  return { record: entier(d?.record), cristaux: entier(d?.cristaux), maitrises, jour: d?.jour ?? null, descentes: entier(d?.descentes), run };
}

// Une fenetre de l'Encrier en cours : on ne garde que ce qui est complet
function offreValide(o) {
  if (!o || typeof o !== "object") return false;
  const ids = (l) => Array.isArray(l) && l.length > 0 && l.every((x) => typeof x === "string");
  switch (o.type) {
    case "depart": case "recrue": return ids(o.persos) && o.persos.every(persoExiste);
    case "combat": return typeof o.caseId === "string" && ["combat", "elite", "boss"].includes(o.typeCase);
    case "tresor": case "relique": return ids(o.reliques) && o.reliques.every((id) => RELIQUES_PAR_ID[id]);
    case "evenement": return Boolean(EVENEMENTS_PAR_ID[o.id]) && typeof o.caseId === "string";
    case "boutique": return Array.isArray(o.persos) && Array.isArray(o.reliques) && Array.isArray(o.achetes) && o.persos.every((x) => persoExiste(x?.id)) && o.reliques.every((x) => RELIQUES_PAR_ID[x?.id]);
    case "repos": return true;
    default: return false;
  }
}

// L'Encrier (roguelite) : record, parties du jour, partie en cours
function validerEncrier(e) {
  const entier = (x) => Math.max(0, Math.floor(Number(x) || 0));
  const r = e?.run;
  let run = null;
  if (r && typeof r === "object" && r.persos && typeof r.persos === "object") {
    const persos = {};
    for (const [id, v] of Object.entries(r.persos)) {
      if (persoExiste(id)) persos[id] = { etoiles: Math.max(1, Math.min(ETOILES_MAX_PARTIE, entier(v?.etoiles) || 1)), pv: Math.max(0, Math.min(1, Number(v?.pv) || 0)) };
    }
    const ids = (l) => (Array.isArray(l) ? l.filter((id) => persos[id]) : []);
    const terrain = ids(r.terrain).slice(0, TERRAIN_MAX);
    const reserve = ids(r.reserve).filter((id) => !terrain.includes(id)).slice(0, RESERVE_MAX);
    run = {
      graine: entier(r.graine), acte: Math.max(1, Math.min(ACTES, entier(r.acte) || 1)),
      position: typeof r.position === "string" ? r.position : null,
      visitees: Array.isArray(r.visitees) ? r.visitees.filter((x) => typeof x === "string") : [],
      persos, terrain, reserve, or: entier(r.or),
      reliques: Array.isArray(r.reliques) ? r.reliques.filter((id) => RELIQUES_PAR_ID[id]) : [],
      malus: Math.max(1, Math.min(2, Number(r.malus) || 1)),
      evenementsVus: Array.isArray(r.evenementsVus) ? r.evenementsVus.filter((id) => EVENEMENTS_PAR_ID[id]) : [],
      offre: offreValide(r.offre) ? r.offre : null,
      bilan: { combats: entier(r.bilan?.combats), elites: entier(r.bilan?.elites), boss: entier(r.bilan?.boss) },
      recompensee: Boolean(r.recompensee),
      dernier: r.dernier ?? null,
    };
    // Une partie sans perso (sauf au moment du draft) n'a pas de sens : on l'abandonne
    if (!terrain.length && run.offre?.type !== "depart") run = null;
  }
  return {
    record: { acte: entier(e?.record?.acte), victoires: entier(e?.record?.victoires), parties: entier(e?.record?.parties) },
    jour: e?.jour ?? null, partiesJour: entier(e?.partiesJour), run,
    dernierBilan: e?.dernierBilan && typeof e.dernierBilan === "object" ? e.dernierBilan : null,
  };
}

// Les Secrets de la premiere version avaient des identifiants parlants : on les convertit partout
function migrerIdsSecrets(p) {
  let texte = JSON.stringify(p);
  for (const [ancien, nouveau] of Object.entries(ANCIENS_IDS_SECRETS)) {
    if (texte.includes(`"${ancien}`)) texte = texte.replaceAll(`"${ancien}"`, `"${nouveau}"`);
  }
  return JSON.parse(texte);
}

// Une sauvegarde abimee ne doit jamais empecher le jeu de demarrer : si la lecture plante,
// on garde une copie de secours (rien n'est perdu) et on repart comme sans sauvegarde.
function valider(p) {
  try {
    return validerSansFilet(p);
  } catch (erreur) {
    console.warn("Sauvegarde illisible, copie gardee sous crossover:partie-secours", erreur);
    try { if (p) ecrire(`${CLE}-secours`, p); } catch { /* rien */ }
    return null;
  }
}

function validerSansFilet(p) {
  if (!p || p.version !== VERSION || typeof p.encre !== "number" || !p.collection || typeof p.collection !== "object") return null;
  p = migrerIdsSecrets(p);
  const collection = {};
  for (const [id, prog] of Object.entries(p.collection)) {
    if (PERSOS_PAR_ID[id]) collection[id] = { ...nouvelleProgression(), ...prog };
  }
  const equipe = Array.isArray(p.equipe) && p.equipe.length === 5 ? p.equipe : [null, null, null, null, null];
  const paliersBattus = Array.isArray(p.paliersBattus) ? p.paliersBattus.filter((n) => PALIERS.some((x) => x.palier === n)) : [];
  for (const prog of Object.values(collection)) {
    prog.variantes = Array.isArray(prog.variantes) ? prog.variantes.filter((v) => ORDRE_BORDURES.includes(v)) : [];
  }
  return {
    version: VERSION,
    encre: Math.max(0, Math.floor(p.encre)),
    collection,
    boosters: validerBoosters(p.boosters),
    invocations: validerInvocations(p.invocations),
    arene: {
      battus: Array.isArray(p.arene?.battus) ? p.arene.battus.filter((cle) => { const [id, diff = "normal"] = String(cle).split("@"); return BOSS_ARENE_PAR_ID[id] && DIFFICULTES_PAR_ID[diff]; }) : [],
      kos: Math.max(0, Math.floor(Number(p.arene?.kos) || 0)),
      // Les bordures Boss gagnees sur un perso pas encore possede : posees le jour ou on l'obtient
      bordures: Array.isArray(p.arene?.bordures) ? [...new Set(p.arene.bordures.filter((id) => PERSOS_PAR_ID[id]))] : [],
    },
    energie: {
      valeur: Math.min(ENERGIE_PLAFOND, Math.max(0, Number(p.energie?.valeur ?? ENERGIE_MAX) || 0)),
      maj: Number(p.energie?.maj) || Date.now(),
      achats: p.energie?.achats ?? null,
    },
    evenements: p.evenements && typeof p.evenements === "object" ? p.evenements : {},
    paliersBattus,
    equipe: equipe.map((id, i) => (collection[id] && equipe.indexOf(id) === i ? id : null)),
    palier: Number(p.palier) || 1,
    heros: p.heros ?? null,
    vedette: collection[p.vedette] ? p.vedette : collection[p.heros] ? p.heros : Object.keys(collection)[0] ?? null,
    stats: { combats: 0, victoires: 0, tirages: 0, legendaires: 0, ...(p.stats ?? {}) },
    missions: p.missions && Array.isArray(p.missions.liste) ? p.missions : null,
    missionsSemaine: p.missionsSemaine ?? null,
    saison: p.saison ?? null,
    expeditionsCiblees: Array.isArray(p.expeditionsCiblees) ? p.expeditionsCiblees : [null, null],
    equipesEnregistrees: Array.isArray(p.equipesEnregistrees)
      ? [0, 1, 2].map((i) => { const e = p.equipesEnregistrees[i]; return e && Array.isArray(e.equipe) ? e : null; })
      : [null, null, null],
    saisonPrecedente: p.saisonPrecedente ?? null,
    cosmetiques: { cadres: Array.isArray(p.cosmetiques?.cadres) ? p.cosmetiques.cadres : ["encre"], cadre: p.cosmetiques?.cadre ?? "encre" },
    equipement: validerEquipement(p.equipement, collection),
    campagne: validerCampagne(p.campagne, paliersBattus),
    histoire: { vues: Array.isArray(p.histoire?.vues) ? p.histoire.vues : [] },
    ressources: { fragments: Number(p.ressources?.fragments) || 0, encreSacree: Number(p.ressources?.encreSacree) || 0 },
    raid: p.raid && typeof p.raid === "object" ? { ...p.raid, records: p.raid.records && typeof p.raid.records === "object" ? p.raid.records : {}, paliers: Array.isArray(p.raid.paliers) ? p.raid.paliers : [] } : null,
    liens: p.liens && typeof p.liens === "object" ? p.liens : {},
    tampons: Array.isArray(p.tampons) ? p.tampons : [],
    guide: Array.isArray(p.guide) ? p.guide : [],
    completions: Array.isArray(p.completions) ? p.completions : [],
    codes: Array.isArray(p.codes) ? p.codes.filter((c) => typeof c === "string") : [],
    donjon: validerDonjon(p.donjon),
    encrier: validerEncrier(p.encrier),
    quetes: p.quetes && typeof p.quetes === "object" ? p.quetes : {},
    explorations: Array.isArray(p.explorations)
      ? p.explorations.filter((x) => x && MISSIONS_EXPLORATION_PAR_ID[x.mission] && Array.isArray(x.ids) && Number(x.debut)).slice(0, EQUIPES_EXPLORATION)
      : [],
    passe: p.passe && typeof p.passe.saison === "string"
      ? { saison: p.passe.saison, xp: Math.max(0, Math.floor(Number(p.passe.xp) || 0)), reclames: Array.isArray(p.passe.reclames) ? p.passe.reclames.filter(Number.isInteger) : [] }
      : null,
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
    return { etoiles: { ...c.etoiles }, coffres: Array.isArray(c.coffres) ? c.coffres : [], deluxe: deluxeValide(c.deluxe) };
  }
  const etoiles = {};
  if (paliersBattus.length) {
    const niveauMax = Math.max(...paliersBattus.map((n) => PALIERS.find((x) => x.palier === n)?.niveau ?? 0));
    for (const et of TOUTES_LES_ETAPES) {
      if (et.niveau > niveauMax - 1) break;
      etoiles[`${et.chapitre}-${et.numero}`] = ETOILE_VICTOIRE;
    }
  }
  return { etoiles, coffres: [], deluxe: deluxeValide(c?.deluxe) };
}

// L'Edition deluxe : { "chapitre-numero": masque d'etoiles } (elle etait perdue a chaque rechargement)
function deluxeValide(d) {
  const r = {};
  if (d && typeof d === "object") for (const [k, v] of Object.entries(d)) if (/^\d+-\d+$/.test(k) && Number.isInteger(v) && v >= 0 && v < 64) r[k] = v;
  return r;
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
// Le compteur de la collection (« 142 sur 160 ») : les Secrets sont comptes a part
export const nbPersosCollection = () => idsPossedes().filter((id) => !estSecret(id)).length;
export const secretsPossedes = () => PERSOS_SECRETS.filter((p) => partie?.collection[p.id]).map((p) => p.id);
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
// Une variante holo ou doree s'ajoute a la collection du perso (la plus belle donne un petit bonus de stats).
function ajouterCarte({ id, rarete, variante = null }, tablePoussiere = POUSSIERE_DOUBLON) {
  let resultat;
  if (!partie.collection[id]) {
    partie.collection[id] = { ...nouvelleProgression(), variantes: [] };
    resultat = { id, rarete, variante, nouveau: true };
    // Une bordure Boss gagnee a l'Arene avant d'avoir le perso
    const attente = partie.arene?.bordures ?? [];
    if (attente.includes(id)) {
      partie.collection[id].variantes.push("boss");
      partie.arene.bordures = attente.filter((x) => x !== id);
      resultat.bordureBoss = true;
    }
  } else {
    const doublon = ajouterDoublon(partie.collection[id]);
    const poussiere = doublon.encreRendue ? tablePoussiere[rarete] : 0;
    if (doublon.encreRendue) partie.collection[id].surplus = (partie.collection[id].surplus ?? 0) + 1;   // compte pour la fusion
    partie.boosters.poussiere += poussiere;
    resultat = { id, rarete, variante, nouveau: false, ...doublon, encreRendue: 0, poussiere };
  }
  const variantes = partie.collection[id].variantes ?? (partie.collection[id].variantes = []);
  resultat.nouvelleVariante = Boolean(variante && !variantes.includes(variante));
  if (resultat.nouvelleVariante) variantes.push(variante);
  return resultat;
}

// ---------- Boosters ----------

// Les tickets gratuits arrivent avec le temps (un toutes les 30 min, reserve de 16 : 8 h d'absence)
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
  const completions = verifierCompletions();
  sauver();
  return { cartes, dore: r.dore, paiement, poussiereBooster: POUSSIERE_PAR_BOOSTER, completions };
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
  const completions = verifierCompletions();
  sauver();
  return { ok: true, cout, carte, completions };
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

// Gratuit : la premiere victoire d'une etape de campagne et les etages de la Tour
// pas encore battus cette semaine. Progresser ne coute rien, seul le farm coute.
export function combatGratuit({ campagne = null, tour = null, arene = null, difficulte = "normal" } = {}) {
  if (!partie) return false;
  if (campagne && !campagne.deluxe) return !etapeBattue(campagne.chapitre, campagne.numero);
  if (tour) return !assurerSemaine().etagesSemaine.includes(tour.etage);
  if (arene) return !bossAreneBattu(arene, difficulte);
  return false;
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
  if (r.invocations) donnerInvocations(r.invocations);
  for (const [id, n] of Object.entries(r.potions ?? {})) if (partie.invocations.potions[id] !== undefined) partie.invocations.potions[id] += n;
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
  const modeOuvert = { chasse: chapitreTermine(1), tour: tourOuverte(), raid: raidOuvert(), deluxe: deluxeOuverte() };
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
  gagnerXpPasse(XP_MISSION);
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
  partie.invocations.potions.chance += 1;
  donnerInvocations(20);
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
  return mission || Boolean(expedition && expedition.heures >= 1) || evenementsAReclamer() > 0 || Boolean(etatGuide()?.atteint) || etatPasse().aReclamer > 0 || explorationsFinies() > 0;
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

// ---------- Puissance : un seul chiffre pour comparer les cartes (comme un jeu de cartes) ----------
// Base : ATQ x 4 + PV / 3 + DEF x 5, avec les stats finales (niveau, etoiles, eveil, rarete, equipement, bordure).
// Le chiffre affiche monte plus vite que les stats (base^1,5) : chaque progres se voit,
// de quelques milliers au debut a des centaines de milliers. Purement affiche : les combats n'en dependent pas.
// Sans bonus d'equipe : la meme carte affiche la meme puissance partout.
export const formulePuissance = (s) => Math.round(100 * Math.pow(Math.max(0, s.atq * 4 + s.pv / 3 + s.def * 5) / 100, 1.5));

// Bonus de la plus belle bordure du perso (en %, sur PV et ATQ)
export const bonusBordure = (prog) => Math.max(0, ...(prog?.variantes ?? []).map((v) => BONUS_STATS_BORDURE[v] ?? 0));

export function statsCarte(perso, prog = progressionDe(perso.id)) {
  const s = calculerStatsFinales(perso, {
    niveau: prog?.niveau ?? 1, etoiles: prog?.etoiles ?? 1, eveil: prog?.eveil ?? 0, talents: prog?.talents ?? [], ascension: prog?.ascension ?? 0,
    equipement: possede(perso.id) ? piecesDe(perso.id) : [], bonusPct: bonusBordure(prog),
  });
  return { puissance: formulePuissance(s), pv: s.pv, atq: s.atq, def: s.def, vit: s.vit };
}
export const puissancePerso = (id) => (PERSOS_PAR_ID[id] ? statsCarte(PERSOS_PAR_ID[id]).puissance : 0);
export const puissanceDeMonEquipe = (ids = equipeSauvee()) => ids.filter(Boolean).reduce((t, id) => t + puissancePerso(id), 0);

// Ce que le moteur de combat doit savoir d'un de tes persos
export const entreeCombat = (id, _index, equipe = []) => ({ id, ...progressionDe(id), equipement: piecesDe(id), bonusPct: bonusCombat(id, equipe) + bonusBordure(progressionDe(id)) });

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

// ---------- Ascension : les etoiles rouges, au-dela de 5 etoiles ----------

export function prochaineAscension(id) {
  const prog = partie?.collection[id];
  const perso = PERSOS_PAR_ID[id];
  if (!prog || !perso) return null;
  const palier = prog.ascension ?? 0;
  if (palier >= ASCENSION_MAX) return { palier, max: true };
  const cout = coutAscension(perso.rarete, palier);
  return {
    palier, max: false, cout,
    surplus: prog.surplus ?? 0, poussiere: partie.boosters.poussiere,
    etoilesOk: prog.etoiles >= 5,
    pret: prog.etoiles >= 5 && (prog.surplus ?? 0) >= cout.doublons && partie.boosters.poussiere >= cout.poussiere,
  };
}

export function ascensionner(id) {
  const a = prochaineAscension(id);
  if (!a || a.max) return { ok: false, erreur: "Ascension déjà complète." };
  if (!a.etoilesOk) return { ok: false, erreur: "Il faut d'abord 5 étoiles." };
  if (!a.pret) return { ok: false, erreur: "Il manque des doublons ou de la poussière." };
  const prog = partie.collection[id];
  prog.surplus -= a.cout.doublons;
  partie.boosters.poussiere -= a.cout.poussiere;
  prog.ascension = a.palier + 1;
  partie.stats.ascensions = (partie.stats.ascensions ?? 0) + 1;
  sauver();
  return { ok: true, palier: prog.ascension };
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
  if (partie.raid.semaine !== semaine) Object.assign(partie.raid, { semaine, meilleur: 0, paliers: [], contribue: false, collectifs: [] });
  partie.raid.collectifs ??= [];
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
  compterVictoiresQuete(ids);
  gagnerXpPasse(XP_VICTOIRE);
  gainsVictoireAutel();
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
    collection: ids.filter((id) => !estSecret(id)).length,
    cinqEtoiles: progs.some((p) => p.etoiles >= 5),
    serieComplete: [...new Set(PERSOS.map((p) => p.serie))].some((serie) => PERSOS.filter((p) => p.serie === serie).every((p) => possede(p.id))),
    legendaires: PERSOS.filter((p) => p.rarete === "legendaire" && possede(p.id)).length,
    secrets: PERSOS_SECRETS.filter((p) => possede(p.id)).length,
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
    encrierActe: partie.encrier?.record?.acte ?? 0,
    encrierVictoires: partie.encrier?.record?.victoires ?? 0,
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
  if (!partie) return { collection: 0, etoiles: 0, tour: 0, raid: 0, boss_semaine: 0, semaine: numeroSemaine() };
  const progs = Object.values(partie.collection);
  const r = partie.raid;
  return {
    boss_semaine: r && r.semaine === numeroSemaine() ? r.meilleur : 0,
    semaine: numeroSemaine(),
    collection: progs.length,
    etoiles: progs.reduce((s, p) => s + (p.etoiles ?? 0), 0),
    tour: partie.tour.record,
    raid: Math.max(0, ...Object.values(partie.raid?.records ?? {})),
    donjon: partie.donjon?.record ?? 0,
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

// ---------- Guide du debutant ----------

function objectifAtteint(si) {
  const progs = Object.values(partie.collection);
  const ev = assurerEvenements();
  switch (si) {
    case "etape1": return etapeBattue(1, 1);
    case "booster": return (partie.stats.boosters ?? 0) >= 1;
    case "niveau5": return progs.some((p) => p.niveau >= 5);
    case "mission": return (partie.stats.missions ?? 0) >= 1;
    case "chapitre1": return chapitreTermine(1);
    case "chasse": return (partie.stats.victoiresChasse ?? 0) >= 1;
    case "equiper": return partie.equipement.pieces.some((p) => p.porteur);
    case "etoile2": return progs.some((p) => p.etoiles >= 2);
    case "chapitre2": return chapitreTermine(2);
    case "tour5": return partie.tour.record >= 5;
    case "raid": return (partie.stats.raids ?? 0) >= 1;
    case "chapitre3": return chapitreTermine(3);
    case "calendrier": return ev.calendrier.case >= 0;
    case "invoquer10": return partie.invocations.total >= 10;
    case "arene1": return partie.arene.battus.length >= 1;
    case "point-autel": return Object.values(partie.invocations.points).some((n) => n > 0);
    case "exploration": return (partie.stats.explorationsLancees ?? 0) >= 1 || partie.explorations.length > 0;
    case "potion": return (partie.stats.potions ?? 0) >= 1;
    case "donjon5": return (partie.donjon?.record ?? 0) >= 5;
    case "passe": return (partie.passe?.reclames?.length ?? 0) >= 1;
    default: return false;
  }
}

// Le premier objectif pas encore reclame (ou null quand le guide est fini)
export function etatGuide() {
  if (!partie) return null;
  const i = GUIDE.findIndex((o) => !partie.guide.includes(o.id));
  if (i < 0) return null;
  return { objectif: GUIDE[i], numero: i + 1, total: GUIDE.length, atteint: objectifAtteint(GUIDE[i].si) };
}

export function reclamerGuide() {
  const e = etatGuide();
  if (!e?.atteint) return null;
  donnerRecompense(e.objectif.recompense);
  partie.guide.push(e.objectif.id);
  sauver();
  return e.objectif;
}

// ---------- Hotel des ventes : ce qui touche a la partie locale ----------

// La copie d'une piece qu'on envoie au serveur (sans uid, porteur ni verrou)
export function objetAVendre(uid) {
  const p = pieceParUid(uid);
  if (!p) return { ok: false, erreur: "Objet introuvable." };
  if (p.verrou) return { ok: false, erreur: "Cet objet est verrouillé : déverrouille-le d'abord." };
  if (retoucheEnCours()?.uid === uid) return { ok: false, erreur: "Termine d'abord la retouche de cet objet." };
  const objet = { objet: p.objet, emplacement: p.emplacement, rarete: p.rarete, panoplie: p.panoplie ?? null, niveau: p.niveau, lignes: p.lignes.map((l) => ({ stat: l.stat, valeur: l.valeur })) };
  if (p.sublime !== undefined) objet.sublime = p.sublime;
  if (p.retouches) objet.retouches = p.retouches;
  return { ok: true, objet, porteur: p.porteur };
}

// Retire une piece de l'inventaire (mise en vente reussie)
export function enleverPiece(uid) {
  const i = partie.equipement.pieces.findIndex((p) => p.uid === uid);
  if (i < 0) return false;
  partie.equipement.pieces.splice(i, 1);
  sauver();
  return true;
}

// Ajoute une piece venue de l'hotel des ventes (achat, ou annonce retiree)
export function recevoirPiece(objet) {
  const o = OBJETS_PAR_ID[objet?.objet];
  if (!o || !Array.isArray(objet.lignes)) return null;
  // Un objet venu du serveur (hotel, echange) est ramene aux lignes et aux bornes de son modele :
  // une stat inconnue, une valeur absente ou trop forte ne peuvent pas entrer dans l'inventaire.
  const sublime = Number.isInteger(objet.sublime) && objet.sublime >= 0 && objet.sublime < o.lignes.length ? objet.sublime : undefined;
  const piece = {
    uid: `e${partie.equipement.prochainUid++}`,
    objet: o.id, emplacement: o.emplacement, rarete: o.rarete, panoplie: o.panoplie,
    niveau: Math.max(0, Math.min(NIVEAU_MAX_PIECE, Math.floor(Number(objet.niveau) || 0))),
    lignes: o.lignes.map(([stat, min, max], i) => {
      const brute = objet.lignes[i];
      const v = brute?.stat === stat ? Number(brute.valeur) : NaN;
      const plafond = sublime === i ? Math.round(max * (1 + BONUS_SUBLIMAGE) * 10) / 10 : max;
      return { stat, valeur: Number.isFinite(v) ? Math.max(min, Math.min(plafond, v)) : min };
    }),
    verrou: false, porteur: null,
  };
  if (sublime !== undefined) piece.sublime = sublime;
  if (objet.retouches) piece.retouches = Math.max(0, Math.min(999, Math.floor(Number(objet.retouches) || 0)));
  partie.equipement.pieces.push(piece);
  if (!partie.chasse.decouverts.includes(o.id)) partie.chasse.decouverts.push(o.id);
  sauver();
  return piece;
}

export function depenserEncre(n) {
  if (!partie || partie.encre < n) return false;
  partie.encre -= n;
  sauver();
  return true;
}

export function gagnerEncre(n) {
  if (!partie || !(n > 0)) return;
  partie.encre += Math.floor(n);
  sauver();
}

// ---------- Collection : series et editions completes ----------

// (plus de boosters dores ici : ils donnaient des dizaines de Legendaires gratuits)
export const RECOMPENSE_SERIE = { invocations: 30, encre: 300 };
export const RECOMPENSE_EDITION = { invocations: 100, encre: 1000 };

export function progressionSerie(serie) {
  const membres = PERSOS.filter((p) => p.serie === serie);
  return { n: membres.filter((p) => partie?.collection[p.id]).length, total: membres.length };
}

// Donne les recompenses des series (8/8) et editions (40/40) tout juste completees
function verifierCompletions() {
  const nouvelles = [];
  const donner = (cle, nom, type, r) => {
    if (partie.completions.includes(cle)) return;
    partie.completions.push(cle);
    donnerInvocations(r.invocations);
    partie.encre += r.encre;
    nouvelles.push({ type, nom, recompense: r });
  };
  for (const serie of new Set(PERSOS.map((p) => p.serie))) {
    const { n, total } = progressionSerie(serie);
    if (n === total) donner(`serie:${serie}`, serie, "serie", RECOMPENSE_SERIE);
  }
  for (const e of EDITIONS) {
    const membres = PERSOS.filter((p) => e.series.includes(p.serie));
    if (membres.every((p) => partie.collection[p.id])) donner(`edition:${e.id}`, e.nom, "edition", RECOMPENSE_EDITION);
  }
  return nouvelles;
}

export const completionFaite = (cle) => Boolean(partie?.completions.includes(cle));

// ==========================================================
// AUTEL D'INVOCATION
// Une carte a la fois, tant qu'il reste des invocations en reserve.
// La reserve remonte avec le temps (MINUTES_PAR_INVOCATION, INVOCATIONS_MAX dans invocations.js)
// et avec les victoires. Chance = (1 + niveau d'autel + Index) x potion.
// ==========================================================

function assurerInvocations(maintenant = Date.now()) {
  const v = partie.invocations;
  const periode = MINUTES_PAR_INVOCATION * 60000;
  if (v.reserve >= INVOCATIONS_MAX) { v.maj = maintenant; return v; }
  const gagnees = Math.floor((maintenant - v.maj) / periode);
  if (gagnees > 0) {
    v.reserve = Math.min(INVOCATIONS_MAX, v.reserve + gagnees);
    v.maj = v.reserve >= INVOCATIONS_MAX ? maintenant : v.maj + gagnees * periode;
  }
  return v;
}

function donnerInvocations(n) {
  const v = assurerInvocations();
  v.reserve = Math.min(INVOCATIONS_PLAFOND, v.reserve + n);
}

// A chaque victoire : des invocations, et parfois une potion
let derniereRecolteAutel = null;
function gainsVictoireAutel() {
  const gagne = Math.random() < CHANCE_INVOCATION_VICTOIRE ? INVOCATIONS_VICTOIRE : 0;
  if (gagne) donnerInvocations(gagne);
  const r = { invocations: gagne };
  if (Math.random() < CHANCE_POTION_VICTOIRE) {
    const ids = Object.keys(POTIONS_PAR_ID);
    const id = ids[Math.floor(Math.random() * ids.length)];
    partie.invocations.potions[id] += 1;
    r.potion = id;
  }
  derniereRecolteAutel = r;
}
// Ce que la derniere victoire a rapporte a l'autel (affiche en fin de combat)
export const recolteAutelDerniereVictoire = () => { const r = derniereRecolteAutel; derniereRecolteAutel = null; return r; };

// Le niveau d'autel : la liste des paliers, puis un niveau toutes les 5 000 invocations
export function seuilNiveauAutel(n) {
  if (n < NIVEAUX_AUTEL.length) return NIVEAUX_AUTEL[n].invocations;
  return NIVEAUX_AUTEL.at(-1).invocations + (n - NIVEAUX_AUTEL.length + 1) * INVOCATIONS_PAR_NIVEAU_EN_PLUS;
}
export function niveauAutel(total = partie?.invocations.total ?? 0) {
  let n = 0;
  while (total >= seuilNiveauAutel(n + 1)) n += 1;
  return n;
}
export const pouvoirAutel = (pouvoir) => {
  const i = NIVEAUX_AUTEL.findIndex((x) => x.pouvoir === pouvoir);
  return i >= 0 && niveauAutel() >= i;
};

// ---------- Points d'autel ----------
export const pointsAutel = () => ({ ...(partie?.invocations.points ?? {}) });
export function pointsAutelLibres() {
  if (!partie) return 0;
  const places = Object.values(partie.invocations.points).reduce((a, b) => a + b, 0);
  return niveauAutel() * POINTS_PAR_NIVEAU - places;
}
export function placerPointAutel(branche) {
  const def = BRANCHES_AUTEL.find((b) => b.id === branche);
  if (!partie || !def || pointsAutelLibres() <= 0 || partie.invocations.points[branche] >= def.max) return false;
  partie.invocations.points[branche] += 1;
  sauver();
  return true;
}
export function redistribuerPointsAutel() {
  if (!partie || partie.boosters.poussiere < COUT_REDISTRIBUTION) return false;
  partie.boosters.poussiere -= COUT_REDISTRIBUTION;
  for (const b of BRANCHES_AUTEL) partie.invocations.points[b.id] = 0;
  sauver();
  return true;
}

const potionActive = (id, maintenant = Date.now()) => (partie?.invocations.actives[id] ?? 0) > maintenant;

// ---------- Phase de l'autel (commune a tous, ou relancee par une potion de lune) ----------
export function phaseActuelle(maintenant = Date.now()) {
  const base = phaseAutel(maintenant);
  const forcee = partie?.invocations.phaseForcee;
  const p = forcee && forcee.fenetre === base.fenetre ? { ...definitionPhase(forcee.id), rangSerie: forcee.rangSerie, debut: base.debut, fin: base.fin, fenetre: base.fenetre, relancee: true } : base;
  const monde = partie?.invocations.monde ?? MONDES[0].edition;
  return { ...p, serie: p.rangSerie != null ? EDITIONS_PAR_ID[monde].series[p.rangSerie] : null };
}

// L'Index : la collection (series, editions, bordures) et les combats (arene, Tour, eveils)
export function chanceIndex() {
  if (!partie) return { series: 0, editions: 0, bordures: 0, combats: 0, secrets: 0, total: 0, nbSeries: 0, nbEditions: 0, nbSecrets: 0 };
  const series = [...new Set(PERSOS.map((p) => p.serie))].filter((x) => { const { n, total } = progressionSerie(x); return n === total; }).length;
  const editions = EDITIONS.filter((e) => PERSOS.filter((p) => e.series.includes(p.serie)).every((p) => partie.collection[p.id])).length;
  let bordures = 0;
  for (const prog of Object.values(partie.collection)) for (const v of prog.variantes ?? []) bordures += CHANCE_PAR_BORDURE[v] ?? 0;
  const boss = partie.arene.battus.filter((cle) => !cle.includes("@")).length;
  const finis = (diff) => MONDES.filter((m) => BOSS_ARENE.filter((b) => b.monde === m.edition).every((b) => bossAreneBattu(b.id, diff))).length;
  const mondesFinis = finis("normal");
  const mondesDifficiles = DIFFICULTES.slice(1).reduce((t, d) => t + finis(d.id), 0);
  const tour = Math.min(CHANCE_TOUR_MAX, Math.floor((partie.tour.record || 0) / 10) * CHANCE_PAR_10_ETAGES);
  const eveils = Math.min(CHANCE_EVEIL_MAX, Object.values(partie.collection).reduce((t, p) => t + (p.eveil || 0), 0) * CHANCE_PAR_EVEIL);
  const donjon = Math.min(CHANCE_DONJON_MAX, Math.floor((partie.donjon?.record || 0) / 10) * CHANCE_PAR_10_ETAGES_DONJON);
  const nbSecrets = PERSOS_SECRETS.filter((p) => partie.collection[p.id]).length;
  const combats = boss * CHANCE_BOSS_ARENE + mondesFinis * CHANCE_MONDE_FINI + mondesDifficiles * CHANCE_MONDE_DIFFICILE + tour + eveils + donjon;
  const pts = { series: series * CHANCE_SERIE_COMPLETE, editions: editions * CHANCE_EDITION_COMPLETE, bordures, combats, secrets: nbSecrets * CHANCE_PAR_SECRET };
  return { ...pts, nbSeries: series, nbEditions: editions, nbBoss: boss, nbMondes: mondesFinis, nbSecrets, total: pts.series + pts.editions + pts.bordures + pts.combats + pts.secrets };
}

// Le detail de l'Index pour sa page de la Collection : ce qui est acquis et ce qui reste a prendre
export function detailIndex() {
  if (!partie) return null;
  const toutesSeries = [...new Set(PERSOS.map((p) => p.serie))];
  const series = toutesSeries.map((serie) => ({
    serie, ...progressionSerie(serie),
    manquants: PERSOS.filter((p) => p.serie === serie && !partie.collection[p.id]).map((p) => p.id),
  }));
  const editions = EDITIONS.map((e) => {
    const membres = PERSOS.filter((p) => e.series.includes(p.serie));
    return { id: e.id, nom: e.nom, n: membres.filter((p) => partie.collection[p.id]).length, total: membres.length };
  });
  const bordures = {};
  for (const prog of Object.values(partie.collection)) for (const v of prog.variantes ?? []) bordures[v] = (bordures[v] ?? 0) + 1;
  const mondes = MONDES.map((m) => {
    const boss = BOSS_ARENE.filter((b) => b.monde === m.edition);
    return { edition: m.edition, nom: m.nom, total: boss.length, difficultes: DIFFICULTES.map((d) => ({ id: d.id, nom: d.nom, n: boss.filter((b) => bossAreneBattu(b.id, d.id)).length })) };
  });
  return {
    index: chanceIndex(), series, editions, bordures, mondes,
    secrets: { n: PERSOS_SECRETS.filter((p) => partie.collection[p.id]).length, total: PERSOS_SECRETS.length },
    tour: partie.tour.record || 0,
    eveils: Object.values(partie.collection).reduce((t, p) => t + (p.eveil || 0), 0),
    donjon: partie.donjon?.record || 0,
  };
}

export function chanceActuelle(maintenant = Date.now()) {
  const points = partie?.invocations.points ?? { chance: 0, bordure: 0 };
  const niveau = points.chance * CHANCE_PAR_POINT;
  const index = chanceIndex();
  const phase = phaseActuelle(maintenant);
  const potion = potionActive("chance", maintenant) ? MULT_POTION_CHANCE : 1;
  const multPhase = phase.chance ?? 1;
  return {
    niveau, index, potion, phase: multPhase,
    total: (1 + niveau + index.total) * potion * multPhase,
    bordure: (potionActive("bordure", maintenant) ? MULT_POTION_BORDURE : 1) * (phase.bordure ?? 1) * (1 + points.bordure * BORDURE_PAR_POINT),
  };
}

export const mondeOuvert = (edition) => {
  const m = MONDES.find((x) => x.edition === edition);
  return Boolean(m) && (m.chapitre === 0 || chapitreTermine(m.chapitre));
};

export function etatInvocations(maintenant = Date.now()) {
  if (!partie) return null;
  const v = assurerInvocations(maintenant);
  const niveau = niveauAutel();
  const phase = phaseActuelle(maintenant);
  const vitesse = potionActive("vitesse", maintenant);
  const delai = (pouvoirAutel("rapide") ? DELAI_RAPIDE_MS : DELAI_TIRAGE_MS) * (vitesse ? FACTEUR_POTION_VITESSE : 1)
    * (phase.vitesse ?? 1) * (1 - v.points.vitesse * VITESSE_PAR_POINT);
  const prochainNiveau = NIVEAUX_AUTEL[niveau + 1] ?? { invocations: seuilNiveauAutel(niveau + 1) };
  return {
    reserve: v.reserve, max: INVOCATIONS_MAX,
    prochaine: v.reserve >= INVOCATIONS_MAX ? null : v.maj + MINUTES_PAR_INVOCATION * 60000,
    total: v.total, niveau, prochainNiveau,
    seuilNiveau: seuilNiveauAutel(niveau),
    avantLegendaire: PITIE_INVOCATION - v.pitie,
    monde: v.monde, delai, phase,
    points: { ...v.points }, pointsLibres: pointsAutelLibres(),
    pouvoirs: { auto: pouvoirAutel("auto"), rapide: pouvoirAutel("rapide"), triple: pouvoirAutel("triple") },
    chance: chanceActuelle(maintenant),
    potions: { ...v.potions },
    actives: Object.fromEntries(Object.keys(v.actives).map((id) => [id, v.actives[id] > maintenant ? v.actives[id] : 0])),
    poussiere: partie.boosters.poussiere,
  };
}

export function choisirMonde(edition) {
  if (!partie || !mondeOuvert(edition)) return false;
  partie.invocations.monde = edition;
  sauver();
  return true;
}

// Invoque "nombre" cartes (1, ou 3 avec le pouvoir x3) dans le monde choisi.
// Renvoie null s'il ne reste pas assez d'invocations.
export function invoquerJoueur(nombre = 1) {
  if (!partie) return null;
  const v = assurerInvocations();
  if (nombre === 3 && !pouvoirAutel("triple")) nombre = 1;
  if (v.reserve < nombre || !mondeOuvert(v.monde)) return null;
  const niveauAvant = niveauAutel();
  const avant = idsPossedes().length;
  const chance = chanceActuelle();
  const phase = phaseActuelle();
  const vedettes = [serieDeLaSemaine(), phase.serie].filter(Boolean);
  const cartes = [];
  for (let k = 0; k < nombre; k++) {
    const r = invoquer(Math.random, v.monde, {
      chance: chance.total, multBordure: chance.bordure, pitie: v.pitie,
      serieVedette: vedettes, poidsVedette: phase.serie ? 3 : 2,
    });
    v.pitie = r.pitie;
    v.reserve -= 1;
    v.total += 1;
    cartes.push(ajouterCarte(r, POUSSIERE_DOUBLON_INVOCATION));
  }
  partie.stats.tirages += cartes.length;
  partie.stats.invocations = (partie.stats.invocations ?? 0) + cartes.length;
  partie.stats.legendaires += cartes.filter((c) => c.rarete === "legendaire").length;
  partie.stats.secrets = (partie.stats.secrets ?? 0) + cartes.filter((c) => c.rarete === "secret").length;
  signaler("invocation", cartes.length);
  gagnerXpPasse(XP_INVOCATION * cartes.length);
  signalerSemaine("invocation", cartes.length);
  const completions = verifierCompletions();
  const niveau = niveauAutel();
  sauver();
  return {
    cartes, completions, avant,
    niveauGagne: niveau > niveauAvant ? { niveau, ...(NIVEAUX_AUTEL[niveau] ?? {}), points: (niveau - niveauAvant) * POINTS_PAR_NIVEAU } : null,
  };
}

// Boire une potion : elle agit tout de suite (ou rallonge celle en cours).
// La potion de lune relance la phase de l'autel jusqu'a la fin de la phase en cours.
export function boirePotion(id) {
  const def = POTIONS_PAR_ID[id];
  if (!partie || !def || partie.invocations.potions[id] <= 0) return false;
  const maintenant = Date.now();
  if (id === "lune") {
    partie.invocations.potions.lune -= 1;
    partie.stats.potions = (partie.stats.potions ?? 0) + 1;
    partie.invocations.phaseForcee = phaseRelancee(Math.random, phaseAutel(maintenant).fenetre);
    sauver();
    return true;
  }
  const duree = def.minutes * 60000 * (1 + partie.invocations.points.potions * POTIONS_PAR_POINT);
  const depart = Math.max(maintenant, partie.invocations.actives[id] || 0);
  const fin = Math.min(maintenant + MINUTES_POTION_MAX * 60000, depart + duree);
  if (fin <= depart) return false;
  partie.invocations.potions[id] -= 1;
  partie.invocations.actives[id] = fin;
  partie.stats.potions = (partie.stats.potions ?? 0) + 1;
  sauver();
  return true;
}

// Distiller une potion avec de la poussiere
export function fabriquerPotion(id) {
  const def = POTIONS_PAR_ID[id];
  if (!partie || !def || partie.boosters.poussiere < def.poussiere) return false;
  partie.boosters.poussiere -= def.poussiere;
  partie.invocations.potions[id] += 1;
  sauver();
  return true;
}

// ---------- Fusion : les doublons en trop forgent une bordure ----------
// La prochaine bordure que la fusion peut donner a ce perso, ou null
export function prochaineFusion(id) {
  const prog = partie?.collection[id];
  if (!prog) return null;
  const etape = FUSION.find((f) => !(prog.variantes ?? []).includes(f.bordure));
  return etape ? { ...etape, surplus: prog.surplus ?? 0, pret: (prog.surplus ?? 0) >= etape.doublons } : null;
}

export function fusionner(id) {
  const f = prochaineFusion(id);
  if (!f || !f.pret) return null;
  const prog = partie.collection[id];
  prog.surplus -= f.doublons;
  prog.variantes = [...(prog.variantes ?? []), f.bordure];
  sauver();
  return f.bordure;
}

// ---------- Codes cadeaux ----------
// Le jeu ne garde que l'empreinte (SHA-256) des codes : on ne peut pas les lire dans le code source.
export const codesUtilises = () => [...(partie?.codes ?? [])];
export async function utiliserCode(texte) {
  if (!partie) return { ok: false, erreur: "Pas de partie." };
  const propre = String(texte ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (!propre) return { ok: false, erreur: "Écris un code." };
  const octets = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`crossover:${propre}`));
  const empreinte = [...new Uint8Array(octets)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const code = CODES_CADEAUX.find((c) => c.empreinte === empreinte);
  if (!code) return { ok: false, erreur: "Ce code n'existe pas (ou plus)." };
  if (partie.codes.includes(empreinte)) return { ok: false, erreur: "Tu as déjà utilisé ce code." };
  if (code.invocationsMin && partie.invocations.total < code.invocationsMin) return { ok: false, erreur: `Ce code demande ${code.invocationsMin.toLocaleString("fr-FR")} invocations à l'autel.` };
  if (code.bossMin && partie.arene.battus.length < code.bossMin) return { ok: false, erreur: `Ce code demande d'avoir vaincu ${code.bossMin} boss de l'Arène.` };
  partie.codes.push(empreinte);
  donnerRecompense(code.recompense);
  sauver();
  return { ok: true, recompense: code.recompense };
}
// ==========================================================
// ARENE DES BOSS
// Ton equipe (le deck) contre un boss geant. 8 boss par monde, a
// battre dans l'ordre. Le premier KO donne la bordure Boss du perso (jamais le perso lui-meme)
// (la bordure Boss, introuvable ailleurs), de l'encre, des
// invocations et une potion ; les KO suivants coutent de l'energie.
// ==========================================================

export const bossAreneBattu = (id, diff = "normal") => Boolean(partie?.arene.battus.includes(cleBoss(id, diff)));

// Une difficulte est ouverte pour un monde quand ses 8 boss sont tombes dans la difficulte d'avant
export function difficulteOuverte(edition, diff = "normal") {
  const i = DIFFICULTES.findIndex((d) => d.id === diff);
  if (i < 0 || !mondeOuvert(edition)) return false;
  if (i === 0) return true;
  return BOSS_ARENE.filter((b) => b.monde === edition).every((b) => bossAreneBattu(b.id, DIFFICULTES[i - 1].id));
}

export function bossAreneOuvert(id, diff = "normal") {
  const b = BOSS_ARENE_PAR_ID[id];
  if (!b || !difficulteOuverte(b.monde, diff)) return false;
  if (b.rang === 0) return true;
  return bossAreneBattu(BOSS_ARENE.find((x) => x.monde === b.monde && x.rang === b.rang - 1).id, diff);
}

// Le prochain boss a battre dans l'Arene : tous les mondes en Normal d'abord, puis les difficultes
export function prochainBossArene() {
  if (!partie) return null;
  for (const d of DIFFICULTES) for (const m of MONDES) {
    if (!difficulteOuverte(m.edition, d.id)) continue;
    const b = BOSS_ARENE.find((x) => x.monde === m.edition && !bossAreneBattu(x.id, d.id));
    if (b) return { boss: b, difficulte: d, monde: m, battus: BOSS_ARENE.filter((x) => x.monde === m.edition && bossAreneBattu(x.id, d.id)).length };
  }
  return null;
}

export function etatArene() {
  if (!partie) return null;
  return { battus: [...partie.arene.battus], kos: partie.arene.kos, total: BOSS_ARENE.length };
}

const potionAuHasard = () => { const ids = Object.keys(POTIONS_PAR_ID); return ids[Math.floor(Math.random() * ids.length)]; };

export function appliquerResultatArene({ bossId, difficulte = "normal", victoire, ids, duree = 90, ultimesManuels = 0, koAllies = 5, degats = 0 }) {
  const b = BOSS_ARENE_PAR_ID[bossId];
  const d = DIFFICULTES_PAR_ID[difficulte];
  if (!partie || !b || !d) return null;
  const premier = victoire && !bossAreneBattu(bossId, difficulte);
  const r = { premier, encre: 0, invocations: 0, potion: null, carte: null, xp: [] };
  // XP : comme une etape de campagne du meme niveau
  const niveau = b.niveau + d.niveau;
  // (une defaite ne donne qu'un peu d'XP, comme en campagne : sinon perdre en boucle, gratuitement, faisait monter l'equipe)
  const gain = victoire ? 45 + 12 * niveau : 8;
  r.xp = ids.filter(possede).map((id) => donnerXp(id, gain));
  for (const id of idsPossedes()) if (!ids.includes(id)) donnerXp(id, Math.round(gain * PART_XP_RESERVE));
  partie.stats.combats += 1;
  if (victoire) {
    const rec = premier ? recompensePremierKo(b, d) : recompenseKo(b, d);
    r.encre = rec.encre;
    r.invocations = rec.invocations;
    partie.encre += rec.encre;
    donnerInvocations(rec.invocations);
    if (rec.potion || Math.random() < CHANCE_POTION_REJOUE) {
      r.potion = potionAuHasard();
      partie.invocations.potions[r.potion] += 1;
    }
    // Le boss ne donne jamais le perso : seulement sa bordure Boss (et une etoile si on l'a deja).
    // Pas encore possede : la bordure attend, et quelques invocations compensent.
    const perso = PERSOS_PAR_ID[b.perso];
    if (possede(perso.id)) {
      if (premier || Math.random() < CHANCE_CARTE_BOSS_REJOUE) r.carte = ajouterCarte({ id: perso.id, rarete: perso.rarete, variante: "boss" });
    } else if (premier) {
      if (!partie.arene.bordures.includes(perso.id)) partie.arene.bordures.push(perso.id);
      r.bordureEnAttente = perso.id;
      r.invocations += INVOCATIONS_SANS_PERSO_BOSS;
      donnerInvocations(INVOCATIONS_SANS_PERSO_BOSS);
    }
    if (premier) partie.arene.battus.push(cleBoss(bossId, difficulte));
    partie.arene.kos += 1;
    partie.stats.victoires += 1;
    signaler("victoire");
    if (duree < 30) signaler("victoire-rapide");
    noterInsolites(ids, duree, koAllies, "appliquerResultatArene");
    if (ids.some(estALHonneur)) { signalerSemaine("victoire-honneur"); signaler("victoire-honneur"); }
    r.liens = compterLiens(ids);
    r.completions = verifierCompletions();
  }
  signaler("ultime-manuel", ultimesManuels);
  signaler("niveau", r.xp.reduce((t, x) => t + (x.niveauApres - x.niveauAvant), 0));
  r.degats = degats;
  sauver();
  return r;
}

// ==========================================================
// PASSE DE SAISON : il avance en jouant (invocations, victoires,
// missions) et repart a zero chaque mois avec la saison.
// ==========================================================

function assurerPasse() {
  const id = saisonActuelle();
  if (!partie.passe || partie.passe.saison !== id) partie.passe = { saison: id, xp: 0, reclames: [] };
  return partie.passe;
}

function gagnerXpPasse(n) {
  if (!partie || n <= 0) return;
  assurerPasse().xp += n;
}

export function etatPasse() {
  if (!partie) return null;
  const p = assurerPasse();
  const atteints = Math.min(PALIERS_PASSE.length, Math.floor(p.xp / XP_PAR_PALIER));
  return {
    saison: p.saison, xp: p.xp, atteints, total: PALIERS_PASSE.length, xpParPalier: XP_PAR_PALIER,
    paliers: PALIERS_PASSE.map((r, i) => ({ recompense: r, atteint: i < atteints, reclame: p.reclames.includes(i) })),
    aReclamer: PALIERS_PASSE.filter((_, i) => i < atteints && !p.reclames.includes(i)).length,
  };
}

// Reclame tous les paliers atteints ; renvoie le total des recompenses
export function reclamerPasse() {
  if (!partie) return null;
  const p = assurerPasse();
  const atteints = Math.min(PALIERS_PASSE.length, Math.floor(p.xp / XP_PAR_PALIER));
  const total = { encre: 0, invocations: 0, tickets: 0, ticketsDores: 0, potions: {} };
  for (let i = 0; i < atteints; i++) {
    if (p.reclames.includes(i)) continue;
    const r = PALIERS_PASSE[i];
    donnerRecompense(r);
    p.reclames.push(i);
    for (const k of ["encre", "invocations", "tickets", "ticketsDores"]) total[k] += r[k] ?? 0;
    for (const [id, n] of Object.entries(r.potions ?? {})) total.potions[id] = (total.potions[id] ?? 0) + n;
  }
  sauver();
  return total;
}

// ---------- Boss collectif (en ligne) ----------
// Le serveur additionne les degats de tous ; ici, on garde seulement si
// le joueur a participe cette semaine et les paliers deja recuperes.
export function noterContributionCollective() {
  if (!partie) return;
  assurerRaid().contribue = true;
  sauver();
}

export function etatCollectif(total = 0) {
  if (!partie) return null;
  const r = assurerRaid();
  return {
    contribue: Boolean(r.contribue),
    paliers: PALIERS_COLLECTIFS.map((p, i) => ({ ...p, atteint: total >= p.total, pris: r.collectifs.includes(i) })),
  };
}

export function reclamerPalierCollectif(index, total) {
  const r = assurerRaid();
  const p = PALIERS_COLLECTIFS[index];
  if (!p || !r.contribue || total < p.total || r.collectifs.includes(index)) return null;
  r.collectifs.push(index);
  donnerRecompense(p.recompense);
  sauver();
  return p.recompense;
}

// ==========================================================
// ECHANGES DE CARTES : on echange une COPIE en trop (un doublon),
// jamais le perso lui-meme. Une copie en trop : un doublon en reserve
// (au-dela de 5 etoiles), un doublon en cours vers l'etoile suivante,
// ou une etoile au-dessus de la premiere.
// ==========================================================

export function copiesEnTrop(id) {
  const prog = partie?.collection[id];
  if (!prog || estSecret(id)) return 0;   // un Secret ne s'echange pas
  let n = (prog.surplus ?? 0) + (prog.doublons ?? 0);
  // Un perso ascensionne garde ses 5 etoiles (l'Ascension les exige) : seules ses copies en reserve s'echangent
  if ((prog.ascension ?? 0) > 0) return n;
  for (let e = 1; e < (prog.etoiles ?? 1); e++) n += doublonsPourEtoile(e);
  return n;
}

// Retire une copie en trop (le surplus d'abord, puis les doublons, puis une etoile)
export function retirerCopie(id) {
  const prog = partie?.collection[id];
  if (!prog || copiesEnTrop(id) <= 0) return false;
  if ((prog.surplus ?? 0) > 0) prog.surplus -= 1;
  else if (prog.doublons > 0) prog.doublons -= 1;
  else {
    prog.etoiles -= 1;
    prog.doublons = doublonsPourEtoile(prog.etoiles) - 1;
  }
  sauver();
  return true;
}

// Recoit une carte par echange : nouveau perso, ou un doublon
export function recevoirCarte(id) {
  const perso = PERSOS_PAR_ID[id];
  if (!partie || !perso || !PERSOS.includes(perso)) return null;
  const r = ajouterCarte({ id, rarete: perso.rarete });
  verifierCompletions();
  sauver();
  return r;
}

// ==========================================================
// DONJON D'ENCRE (roguelite)
// 3 descentes par jour. Le deck enchaine les etages ; tous les 3
// etages, une benediction a choisir. Le butin attend dans le sac :
// sortir le garde, tomber sans vie n'en garde que la moitie.
// ==========================================================

const niveauMaitrise = (id) => partie?.donjon.maitrises[id] ?? 0;

function assurerDonjon() {
  const d = partie.donjon;
  const jour = aujourdhui();
  if (d.jour !== jour) { d.jour = jour; d.descentes = 0; }
  return d;
}

export function etatDonjon() {
  if (!partie) return null;
  const d = assurerDonjon();
  const run = d.run;
  let prochain = null;
  if (run) {
    const b = bonusDescente(run.benedictions, niveauMaitrise("vigueur"));
    prochain = { ...adversaireEtage(run.graine, run.etage, run.niveauDeck, b.ennemis, facteurRarete(run.deck)), type: typeEtage(run.etage), bonus: b };
  }
  return {
    record: d.record, cristaux: d.cristaux, maitrises: { ...d.maitrises },
    descentesRestantes: Math.max(0, DESCENTES_PAR_JOUR - d.descentes),
    run: run ? { ...run, sac: { ...run.sac }, benedictions: [...run.benedictions] } : null,
    prochain,
  };
}

function tirerBenedictions(nombre, sauf = []) {
  const liste = BENEDICTIONS.filter((b) => !sauf.includes(b.id) || b.id === "vigueur" || b.id === "vie");
  const choix = [];
  while (choix.length < nombre && liste.length) choix.push(liste.splice(Math.floor(Math.random() * liste.length), 1)[0].id);
  return choix;
}

export function entrerDonjon() {
  if (!partie) return { ok: false, erreur: "Pas de partie." };
  const d = assurerDonjon();
  if (d.run) return { ok: false, erreur: "Une descente est déjà en cours." };
  if (d.descentes >= DESCENTES_PAR_JOUR) return { ok: false, erreur: "Plus de descente aujourd'hui : reviens demain !" };
  const deck = equipeSauvee();
  if (deck.some((id) => !id || !possede(id))) return { ok: false, erreur: "Ton deck n'est pas complet : choisis 5 persos dans l'écran Équipe." };
  const niveauDeck = Math.round(deck.reduce((t, id) => t + partie.collection[id].niveau, 0) / 5);
  d.descentes += 1;
  d.run = {
    graine: Math.floor(Math.random() * 2147483647), etage: 1, vies: VIES_DEPART + niveauMaitrise("vies"), niveauDeck, deck,
    benedictions: niveauMaitrise("depart") ? tirerBenedictions(1, ["vie"]) : [], choix: null,
    sac: { encre: 0, cristaux: 0, invocations: 0 }, journal: [],
  };
  partie.stats.descentes = (partie.stats.descentes ?? 0) + 1;
  sauver();
  return { ok: true };
}

// La configuration exacte du prochain combat du donjon (le moteur etant
// deterministe, l'affichage en direct rejoue exactement le meme combat)
export function configEtage() {
  const run = partie?.donjon.run;
  if (!run || run.choix) return null;
  const n = run.etage;
  const b = bonusDescente(run.benedictions, niveauMaitrise("vigueur"));
  const deck = run.deck.filter(possede);
  const adv = adversaireEtage(run.graine, n, run.niveauDeck, b.ennemis, facteurRarete(deck));
  return {
    equipeA: deck.map((id, i) => ({ ...entreeCombat(id, i, deck), bonusPct: (entreeCombat(id, i, deck).bonusPct ?? 0) + b.pct })),
    equipeB: adv.equipe, niveauB: adv.niveau, multiplicateurB: adv.multiplicateur,
    graine: (run.graine + n * 7919 + run.vies * 131) >>> 0, journal: false,
    bonusA: { crit: b.crit, esquive: b.esquive, volDeVie: b.volDeVie, energieDepart: b.energieDepart },
    adv, b, deck, n,
  };
}

export function combattreEtage() {
  const d = partie && assurerDonjon();
  const run = d?.run;
  const config = configEtage();
  if (!run || !config) return null;
  const { adv, b, deck, n } = config;
  const r = simulerCombat(config);
  const victoire = r.vainqueur === 0;
  const resultat = { etage: n, victoire, duree: r.duree, type: typeEtage(n), koAllies: r.unites.filter((u) => u.camp === 0 && u.pv <= 0).length };
  partie.stats.combats += 1;
  const gainXp = victoire ? 20 + 4 * adv.niveau : 8 + adv.niveau;
  for (const id of deck) donnerXp(id, gainXp);
  if (victoire) {
    const g = butinEtage(n);
    const mult = 1 + b.butin + niveauMaitrise("fortune") * 0.1;
    resultat.butin = { encre: Math.round(g.encre * mult), cristaux: Math.round(g.cristaux * mult), invocations: g.invocations };
    run.sac.encre += resultat.butin.encre;
    run.sac.cristaux += resultat.butin.cristaux;
    run.sac.invocations += resultat.butin.invocations;
    run.etage += 1;
    compterVictoiresQuete(deck);
    partie.stats.victoires += 1;
    signaler("victoire");
    gagnerXpPasse(XP_VICTOIRE);
    if (n % ETAGES_PAR_BENEDICTION === 0) run.choix = tirerBenedictions(3 + niveauMaitrise("choix"), run.benedictions);
    resultat.choix = run.choix;
  } else {
    run.vies -= 1;
    if (run.vies <= 0) resultat.fin = finirDescente(false);
  }
  if (partie.donjon.run) partie.donjon.run.journal = [...run.journal, resultat].slice(-30);
  sauver();
  return resultat;
}

export function choisirBenediction(id) {
  const run = partie?.donjon.run;
  if (!run?.choix?.includes(id)) return false;
  run.benedictions.push(id);
  if (BENEDICTIONS_PAR_ID[id].vie) run.vies += BENEDICTIONS_PAR_ID[id].vie;
  run.choix = null;
  sauver();
  return true;
}

function finirDescente(sorti) {
  const d = partie.donjon;
  const run = d.run;
  const part = sorti ? 1 : PART_GARDEE_SI_KO;
  const gains = {
    encre: Math.floor(run.sac.encre * part), cristaux: Math.floor(run.sac.cristaux * part), invocations: Math.floor(run.sac.invocations * part),
    etages: run.etage - 1, sorti,
  };
  partie.encre += gains.encre;
  d.cristaux += gains.cristaux;
  if (gains.invocations) donnerInvocations(gains.invocations);
  gains.record = gains.etages > d.record;
  d.record = Math.max(d.record, gains.etages);
  d.run = null;
  return gains;
}

export function sortirDonjon() {
  if (!partie?.donjon.run || partie.donjon.run.choix) return null;
  const g = finirDescente(true);
  sauver();
  return g;
}

export function acheterMaitrise(id) {
  const m = MAITRISES_PAR_ID[id];
  if (!partie || !m) return false;
  const n = niveauMaitrise(id);
  if (n >= m.max || partie.donjon.cristaux < m.cout(n)) return false;
  partie.donjon.cristaux -= m.cout(n);
  partie.donjon.maitrises[id] = n + 1;
  sauver();
  return true;
}

// ==========================================================
// L'ENCRIER (roguelite en draft)
// Tout le monde part a egalite : on recrute en route, les PV restent
// d'un combat a l'autre, perdre un combat termine la partie. Les
// recompenses (encre, invocations, poussiere) ne comptent que pour les
// premieres parties du jour.
// ==========================================================

function assurerEncrier() {
  if (!partie.encrier) partie.encrier = validerEncrier(null);
  const e = partie.encrier;
  const jour = aujourdhui();
  if (e.jour !== jour) { e.jour = jour; e.partiesJour = 0; }
  return e;
}

const runEncrier = () => (partie ? assurerEncrier().run : null);
const carteDuRun = (run) => genererCarte(run.graine, run.acte);
const tousLesPersosDuRun = (run) => [...run.terrain, ...run.reserve];

// Les cases ou l'on peut aller maintenant
function casesAccessibles(run) {
  if (run.offre) return [];
  const carte = carteDuRun(run);
  if (!run.position) return carte.rangs[0].map((c) => c.id);
  return caseDe(carte, run.position)?.liens ?? [];
}

export function etatEncrier() {
  if (!partie) return null;
  const e = assurerEncrier();
  const run = e.run;
  const base = {
    record: { ...e.record },
    partiesRecompensees: Math.max(0, PARTIES_RECOMPENSEES_PAR_JOUR - e.partiesJour),
    bilan: e.dernierBilan ?? null,
  };
  if (!run) return { ...base, run: null };
  const effets = effetsReliques(run.reliques, run.malus);
  const carte = carteDuRun(run);
  return {
    ...base,
    run: JSON.parse(JSON.stringify(run)),
    carte,
    accessibles: casesAccessibles(run),
    effets,
  };
}

export function commencerEncrier() {
  if (!partie) return { ok: false, erreur: "Pas de partie." };
  const e = assurerEncrier();
  if (e.run) return { ok: false, erreur: "Une partie est déjà en cours." };
  const graine = Math.floor(Math.random() * 2147483647);
  const recompensee = e.partiesJour < PARTIES_RECOMPENSEES_PAR_JOUR;
  if (recompensee) e.partiesJour += 1;
  e.dernierBilan = null;
  e.run = {
    graine, acte: 1, position: null, visitees: [], persos: {}, terrain: [], reserve: [], or: OR_DEPART,
    reliques: [], malus: 1, evenementsVus: [], bilan: { combats: 0, elites: 0, boss: 0 }, recompensee, dernier: null,
    offre: { type: "depart", persos: offrePersos(graine, "depart", OFFRE_DEPART, 0, { garantir: ["tank", "soutien", "attaquant"] }) },
  };
  e.record.parties += 1;
  sauver();
  return { ok: true };
}

// Le draft de depart : garder CHOIX_DEPART persos parmi ceux proposes
export function choisirDepartEncrier(ids) {
  const run = runEncrier();
  if (!run || run.offre?.type !== "depart") return { ok: false, erreur: "Rien à choisir." };
  const choix = [...new Set(ids)].filter((id) => run.offre.persos.includes(id));
  if (choix.length !== CHOIX_DEPART) return { ok: false, erreur: `Choisis ${CHOIX_DEPART} persos.` };
  for (const id of choix) run.persos[id] = { etoiles: 1, pv: 1 };
  run.terrain = choix;
  run.offre = null;
  sauver();
  return { ok: true };
}

// Ajoute un perso a l'equipe (terrain, sinon reserve). remplacer : id a liberer si tout est plein.
function ajouterPersoRun(run, id, remplacer = null) {
  if (run.persos[id]) return { ok: false, erreur: "Ce perso est déjà dans l'équipe." };
  if (run.terrain.length >= TERRAIN_MAX && run.reserve.length >= RESERVE_MAX) {
    if (!remplacer || !run.persos[remplacer]) return { ok: false, erreur: "Équipe pleine : choisis qui laisser partir." };
    libererDuRun(run, remplacer);
  }
  run.persos[id] = { etoiles: 1, pv: 1 };
  if (run.terrain.length < TERRAIN_MAX) run.terrain.push(id); else run.reserve.push(id);
  return { ok: true };
}

function libererDuRun(run, id) {
  delete run.persos[id];
  run.terrain = run.terrain.filter((x) => x !== id);
  run.reserve = run.reserve.filter((x) => x !== id);
  if (!run.terrain.length && run.reserve.length) run.terrain.push(run.reserve.shift());
}

// Aller sur une case de la carte
export function allerVersEncrier(caseId) {
  const run = runEncrier();
  if (!run) return { ok: false };
  if (!casesAccessibles(run).includes(caseId)) return { ok: false, erreur: "Cette case n'est pas accessible." };
  const c = caseDe(carteDuRun(run), caseId);
  run.position = caseId;
  run.visitees.push(caseId);
  const g = run.graine;
  const e = effetsReliques(run.reliques, run.malus);
  const remise = 1 - e.remise;
  const niveauTable = run.acte - 1;
  if (["combat", "elite", "boss"].includes(c.type)) run.offre = { type: "combat", caseId, typeCase: c.type };
  if (c.type === "evenement") {
    const id = tirerEvenement(g, caseId, run.evenementsVus);
    run.evenementsVus.push(id);
    run.offre = { type: "evenement", id, caseId, resultat: null };
  }
  if (c.type === "boutique") {
    const persos = offrePersos(g, `boutique-${caseId}`, 3, niveauTable, { exclure: Object.keys(run.persos) });
    run.offre = {
      type: "boutique", caseId, achetes: [],
      persos: persos.map((id) => ({ id, prix: Math.round(PRIX_PERSOS[PERSOS_PAR_ID[id].rarete] * remise) })),
      reliques: tirerReliques(g, `boutique-${caseId}`, 2, ["commune", "rare"], run.reliques)
        .map((id) => ({ id, prix: Math.round(PRIX_RELIQUES[RELIQUES_PAR_ID[id].rang] * remise) })),
      soin: Math.round(PRIX_SOIN * remise), entrainement: Math.round(PRIX_ENTRAINEMENT * remise),
    };
  }
  if (c.type === "repos") run.offre = { type: "repos", caseId };
  if (c.type === "tresor") run.offre = { type: "tresor", caseId, reliques: tirerReliques(g, `tresor-${caseId}`, 2, ["commune", "rare"], run.reliques) };
  sauver();
  return { ok: true, type: c.type };
}

// La configuration exacte du combat en cours (le direct rejoue exactement le combat compte)
export function configCombatEncrier() {
  const run = runEncrier();
  if (!run || run.offre?.type !== "combat") return null;
  const c = caseDe(carteDuRun(run), run.offre.caseId);
  const e = effetsReliques(run.reliques, run.malus);
  const adv = adversaireCase(run.graine, run.acte, c.rang, c.type, c.id, e.ennemis);
  return {
    equipeA: equipeDeCombat(run.terrain, run.persos, e.pct),
    equipeB: adv.equipe, niveauB: adv.niveau, multiplicateurB: adv.multiplicateur,
    graine: (run.graine ^ (run.visitees.length * 2654435761)) >>> 0, journal: false,
    bonusA: { energieDepart: e.energieDepart, stats: e.stats },
    adv, typeCase: c.type, rang: c.rang,
  };
}

function soignerRun(run, part, revivre = false) {
  for (const id of tousLesPersosDuRun(run)) {
    const p = run.persos[id];
    if (p.pv <= 0 && !revivre) continue;
    p.pv = Math.min(1, Math.max(p.pv, 0) + part);
  }
}

export function combattreEncrier() {
  const run = runEncrier();
  const config = configCombatEncrier();
  if (!run || !config) return null;
  const r = simulerCombat(config);
  const victoire = r.vainqueur === 0;
  const type = config.typeCase;
  partie.stats.combats += 1;
  run.dernier = { victoire, duree: r.duree, type };
  if (!victoire) {
    const bilan = finirEncrier(false);
    sauver();
    return { victoire, fin: bilan };
  }
  partie.stats.victoires += 1;
  const e = effetsReliques(run.reliques, run.malus);
  // Les blessures restent ; un perso KO revient avec un peu de PV
  for (const u of r.unites.filter((x) => x.camp === 0)) {
    const p = run.persos[u.id];
    if (p) p.pv = u.pv > 0 ? u.pv / u.pvMax : Math.max(PV_APRES_KO, e.pvApresKo);
  }
  soignerRun(run, SOIN_APRES_COMBAT + e.soinApresCombat);
  const or = Math.round(orCombat(run.acte, type) * (1 + e.orPct));
  run.or += or;
  if (type === "boss") { run.bilan.boss += 1; soignerRun(run, SOIN_BOSS, true); }
  else if (type === "elite") run.bilan.elites += 1;
  else run.bilan.combats += 1;
  const caseId = run.offre.caseId;
  const relique = type === "elite" ? tirerReliques(run.graine, `elite-${caseId}`, 1, ["commune", "rare"], run.reliques)[0] ?? null : null;
  if (relique) run.reliques.push(relique);
  const niveauTable = run.acte - 1 + (type === "combat" ? 0 : 1);
  const persos = offrePersos(run.graine, `recrue-${caseId}`, RECRUES_PROPOSEES + e.recruesEnPlus, niveauTable, { exclure: Object.keys(run.persos) });
  run.offre = { type: "recrue", caseId, typeCase: type, persos, or, relique };
  if (type === "boss") {
    run.offre.ensuite = run.acte >= ACTES
      ? { type: "victoire" }
      : { type: "relique", reliques: tirerReliques(run.graine, `boss-${caseId}`, 3, ["boss", "rare"], run.reliques) };
  }
  sauver();
  return { victoire, or, relique };
}

// Apres une recrue (ou en passant), on enchaine ce qui suit (relique de boss, acte suivant, victoire)
function apresRecrue(run) {
  const ensuite = run.offre?.ensuite ?? null;
  if (!ensuite) { run.offre = null; return null; }
  if (ensuite.type === "victoire") return finirEncrier(true);
  run.offre = ensuite;
  return null;
}

export function recruterEncrier(id, remplacer = null) {
  const run = runEncrier();
  if (!run || run.offre?.type !== "recrue") return { ok: false };
  if (id === null) {
    run.or += OR_SI_ON_PASSE;
  } else {
    if (!run.offre.persos.includes(id)) return { ok: false, erreur: "Ce perso n'est pas proposé." };
    const r = ajouterPersoRun(run, id, remplacer);
    if (!r.ok) return r;
  }
  const fin = apresRecrue(run);
  sauver();
  return { ok: true, fin };
}

// Tresor ou relique de boss : en prendre une
export function prendreReliqueEncrier(id) {
  const run = runEncrier();
  if (!run || !["tresor", "relique"].includes(run.offre?.type) || !run.offre.reliques.includes(id)) return { ok: false };
  run.reliques.push(id);
  if (run.offre.type === "relique") {
    // la relique d'un boss ouvre l'acte suivant
    run.acte += 1;
    run.position = null;
  }
  run.offre = null;
  sauver();
  return { ok: true };
}

// Evenement : appliquer un choix
function appliquerEffetsEncrier(run, effets, cle) {
  const lignes = [];
  if (effets.chance) {
    const ok = reussite(run.graine, cle, effets.chance.p);
    lignes.push(ok ? "Réussite !" : "Raté...");
    return [...lignes, ...appliquerEffetsEncrier(run, ok ? effets.chance.succes : effets.chance.echec, `${cle}-suite`)];
  }
  if (effets.or) { run.or = Math.max(0, run.or + effets.or); lignes.push(`${effets.or > 0 ? "+" : ""}${effets.or} or`); }
  if (effets.revivre) { soignerRun(run, 0.01, true); }
  if (effets.soin) {
    if (effets.soin > 0) soignerRun(run, effets.soin);
    else for (const id of tousLesPersosDuRun(run)) { const p = run.persos[id]; if (p.pv > 0) p.pv = Math.max(0.05, p.pv + effets.soin); }
    lignes.push(effets.soin > 0 ? `Soin de ${Math.round(effets.soin * 100)} %` : `${Math.round(effets.soin * 100)} % de PV`);
  }
  if (effets.relique) {
    const id = tirerReliques(run.graine, `evt-${cle}`, 1, [effets.relique], run.reliques)[0];
    if (id) { run.reliques.push(id); lignes.push(`Relique : ${RELIQUES_PAR_ID[id].nom}`); }
  }
  if (effets.etoile) {
    const candidats = tousLesPersosDuRun(run).filter((id) => run.persos[id].etoiles < ETOILES_MAX_PARTIE);
    if (candidats.length) {
      const id = candidats[Math.floor(hasardDe(run.graine, `etoile-${cle}`).nombre() * candidats.length)];
      run.persos[id].etoiles += 1;
      lignes.push(`${PERSOS_PAR_ID[id].nom} gagne une étoile`);
    }
  }
  if (effets.ennemis) { run.malus = Math.min(2, run.malus * effets.ennemis); lignes.push(`Ennemis +${Math.round((effets.ennemis - 1) * 100)} %`); }
  if (effets.recrue) {
    run.offre = { type: "recrue", caseId: run.offre.caseId, typeCase: "evenement", or: 0, relique: null,
      persos: offrePersos(run.graine, `evt-recrue-${cle}`, RECRUES_PROPOSEES, run.acte, { exclure: Object.keys(run.persos), minRarete: effets.recrue }) };
    lignes.push("Une recrue t'attend");
  }
  return lignes;
}

export function choisirEvenementEncrier(index) {
  const run = runEncrier();
  if (!run || run.offre?.type !== "evenement" || run.offre.resultat) return { ok: false };
  const evt = EVENEMENTS_PAR_ID[run.offre.id];
  const choix = evt?.choix[index];
  if (!choix) return { ok: false };
  if (choix.cout && run.or < choix.cout) return { ok: false, erreur: "Pas assez d'or." };
  const lignes = appliquerEffetsEncrier(run, choix.effets, `${run.offre.caseId}-${index}`);
  if (run.offre.type === "evenement") run.offre.resultat = { choix: index, lignes: lignes.length ? lignes : ["Rien ne se passe."] };
  sauver();
  return { ok: true, lignes };
}

// Boutique
export function acheterEncrier(quoi, id = null, cible = null) {
  const run = runEncrier();
  const o = run?.offre;
  if (!o || o.type !== "boutique") return { ok: false };
  const payer = (prix) => { if (run.or < prix) return false; run.or -= prix; return true; };
  if (quoi === "perso") {
    const art = o.persos.find((x) => x.id === id);
    if (!art || o.achetes.includes(`p-${id}`)) return { ok: false };
    if (run.or < art.prix) return { ok: false, erreur: "Pas assez d'or." };
    const r = ajouterPersoRun(run, id, cible);
    if (!r.ok) return r;
    payer(art.prix);
    o.achetes.push(`p-${id}`);
  } else if (quoi === "relique") {
    const art = o.reliques.find((x) => x.id === id);
    if (!art || o.achetes.includes(`r-${id}`)) return { ok: false };
    if (!payer(art.prix)) return { ok: false, erreur: "Pas assez d'or." };
    run.reliques.push(id);
    o.achetes.push(`r-${id}`);
  } else if (quoi === "soin") {
    if (o.achetes.includes("soin")) return { ok: false };
    if (!payer(o.soin)) return { ok: false, erreur: "Pas assez d'or." };
    soignerRun(run, SOIN_BOUTIQUE);
    o.achetes.push("soin");
  } else if (quoi === "entrainement") {
    const p = run.persos[id];
    if (!p || p.etoiles >= ETOILES_MAX_PARTIE || o.achetes.includes("entrainement")) return { ok: false };
    if (!payer(o.entrainement)) return { ok: false, erreur: "Pas assez d'or." };
    p.etoiles += 1;
    o.achetes.push("entrainement");
  } else return { ok: false };
  sauver();
  return { ok: true };
}

// Repos : se soigner ou entrainer un perso (+1 etoile)
export function reposerEncrier(choix, id = null) {
  const run = runEncrier();
  if (!run || run.offre?.type !== "repos") return { ok: false };
  const e = effetsReliques(run.reliques, run.malus);
  if (choix === "soin") soignerRun(run, Math.max(SOIN_REPOS, e.soinRepos));
  else if (choix === "entrainement") {
    const p = run.persos[id];
    if (!p || p.etoiles >= ETOILES_MAX_PARTIE) return { ok: false };
    p.etoiles += 1;
  } else return { ok: false };
  run.offre = null;
  sauver();
  return { ok: true };
}

// Quitter une boutique ou un evenement termine
export function quitterCaseEncrier() {
  const run = runEncrier();
  if (!run || !run.offre) return false;
  if (run.offre.type === "boutique" || (run.offre.type === "evenement" && run.offre.resultat)) {
    run.offre = null;
    sauver();
    return true;
  }
  return false;
}

// Passer un perso du terrain a la reserve (ou l'inverse)
export function echangerEncrier(id) {
  const run = runEncrier();
  if (!run?.persos[id] || run.offre?.type === "combat") return false;
  if (run.terrain.includes(id)) {
    if (run.terrain.length <= 1 || run.reserve.length >= RESERVE_MAX) return false;
    run.terrain = run.terrain.filter((x) => x !== id);
    run.reserve.push(id);
  } else {
    if (run.terrain.length >= TERRAIN_MAX) return false;
    run.reserve = run.reserve.filter((x) => x !== id);
    run.terrain.push(id);
  }
  sauver();
  return true;
}

export function abandonnerEncrier() {
  if (!runEncrier()) return null;
  const b = finirEncrier(false, true);
  sauver();
  return b;
}

function finirEncrier(victoire, abandon = false) {
  const e = partie.encrier;
  const run = e.run;
  const b = run.bilan;
  const gains = { encre: 0, invocations: 0, poussiere: 0 };
  if (run.recompensee) {
    gains.encre = b.combats * RECOMPENSES.encreParCombat + b.elites * RECOMPENSES.encreParElite + b.boss * RECOMPENSES.encreParBoss;
    gains.invocations = b.boss * RECOMPENSES.invocationsParBoss + (victoire ? RECOMPENSES.invocationsVictoire : 0);
    gains.poussiere = victoire ? RECOMPENSES.poussiereVictoire : 0;
    partie.encre += gains.encre;
    if (gains.invocations) donnerInvocations(gains.invocations);
    if (gains.poussiere) partie.boosters.poussiere += gains.poussiere;
  }
  const acteAtteint = victoire ? ACTES + 1 : run.acte;
  const bilan = {
    victoire, abandon, acte: run.acte, combats: b.combats, elites: b.elites, boss: b.boss, recompensee: run.recompensee, gains,
    record: acteAtteint > e.record.acte || (victoire && e.record.victoires === 0),
    equipe: [...run.terrain, ...run.reserve], reliques: [...run.reliques],
  };
  e.record.acte = Math.max(e.record.acte, acteAtteint);
  if (victoire) e.record.victoires += 1;
  e.dernierBilan = bilan;
  e.run = null;
  bilan.tampons = verifierTampons();
  return bilan;
}

// ==========================================================
// DUELS (PvP) : la meme regle pour tous, sans equipement ni talents
// (niveau, etoiles, eveil seulement), pour que ce soit le deck et le
// placement qui comptent. Le combat se joue ici avec une graine ;
// le serveur ajuste les points.
// ==========================================================

export const RECOMPENSE_DUEL = { encre: 25, invocations: 2 };

// L'equipe telle qu'elle part en defense (ou en attaque)
export function equipeDuel(ids = equipeSauvee()) {
  return ids.filter((id) => id && partie?.collection[id]).map((id) => {
    const p = partie.collection[id];
    return { id, niveau: p.niveau, etoiles: p.etoiles, eveil: p.eveil ?? 0, ascension: p.ascension ?? 0 };
  });
}
export const puissanceEquipe = (equipe) => equipe.reduce((t, e) => t + calculerStatsFinales(PERSOS_PAR_ID[e.id], e).atq * 4 + calculerStatsFinales(PERSOS_PAR_ID[e.id], e).pv / 3, 0);

export const configDuel = (defense, graine) => ({ equipeA: equipeDuel(), equipeB: defense, graine, journal: false });

export function jouerDuel(defense, graine = Math.floor(Math.random() * 2147483647)) {
  const r = simulerCombat(configDuel(defense, graine));
  return {
    victoire: r.vainqueur === 0, duree: r.duree, graine,
    koA: r.unites.filter((u) => u.camp === 0 && u.pv <= 0).length,
    koB: r.unites.filter((u) => u.camp === 1 && u.pv <= 0).length,
  };
}

// La recompense locale d'un duel gagne (le serveur limite a 10 duels par jour)
export function recompenserDuel(victoire) {
  if (!partie) return null;
  partie.stats.duels = (partie.stats.duels ?? 0) + 1;
  partie.stats.combats += 1;
  if (!victoire) { sauver(); return null; }
  partie.stats.victoires += 1;
  compterVictoiresQuete(equipeSauvee().filter(Boolean));
  partie.encre += RECOMPENSE_DUEL.encre;
  donnerInvocations(RECOMPENSE_DUEL.invocations);
  signaler("victoire");
  gagnerXpPasse(XP_VICTOIRE);
  sauver();
  return RECOMPENSE_DUEL;
}

// ==========================================================
// EXPLORATIONS : des persos en mission, meme jeu ferme
// ==========================================================

const ORDRE_RARETE = { commun: 1, peu_commun: 2, rare: 3, epique: 4, legendaire: 5, secret: 6 };
const MS_HEURE = 3600000;

// La serie du jour de chaque mission (la meme pour tous, change chaque jour)
export function serieDuJourExploration(missionId, jour = aujourdhui()) {
  const series = [...new Set(PERSOS.map((p) => p.serie))];
  let h = 0;
  for (const c of `${jour}:${missionId}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return series[h % series.length];
}

export const persosEnExploration = () => new Set((partie?.explorations ?? []).flatMap((x) => x.ids));

// Choisit automatiquement les persos : ceux de la serie du jour d'abord, sans gacher les grosses raretes
export function equipeAutoExploration(missionId) {
  const m = MISSIONS_EXPLORATION_PAR_ID[missionId];
  if (!partie || !m) return null;
  const occupes = persosEnExploration();
  const serie = serieDuJourExploration(missionId);
  const libres = idsPossedes().filter((id) => PERSOS_PAR_ID[id] && !occupes.has(id)).map((id) => PERSOS_PAR_ID[id]);
  const choisis = [];
  if (m.exige) {
    const [rarete, n] = m.exige;
    const ok = libres.filter((p) => ORDRE_RARETE[p.rarete] >= ORDRE_RARETE[rarete])
      .sort((a, b) => Number(b.serie === serie) - Number(a.serie === serie) || ORDRE_RARETE[a.rarete] - ORDRE_RARETE[b.rarete]);
    if (ok.length < n) return null;
    choisis.push(...ok.slice(0, n));
  }
  const reste = libres.filter((p) => !choisis.includes(p))
    .sort((a, b) => Number(b.serie === serie) - Number(a.serie === serie) || ORDRE_RARETE[a.rarete] - ORDRE_RARETE[b.rarete]);
  while (choisis.length < m.persos && reste.length) choisis.push(reste.shift());
  return choisis.length === m.persos ? choisis.map((p) => p.id) : null;
}

export function etatExplorations(maintenant = Date.now()) {
  if (!partie) return null;
  return {
    max: EQUIPES_EXPLORATION,
    enCours: partie.explorations.map((x, i) => {
      const m = MISSIONS_EXPLORATION_PAR_ID[x.mission];
      const fin = x.debut + m.heures * MS_HEURE;
      return { index: i, ...x, mission: m, fin, finie: maintenant >= fin, bonus: x.bonus };
    }),
    missions: MISSIONS_EXPLORATION.map((m) => ({ ...m, serie: serieDuJourExploration(m.id), possible: Boolean(equipeAutoExploration(m.id)) })),
  };
}

export function lancerExploration(missionId) {
  const m = MISSIONS_EXPLORATION_PAR_ID[missionId];
  if (!partie || !m || partie.explorations.length >= EQUIPES_EXPLORATION) return null;
  const ids = equipeAutoExploration(missionId);
  if (!ids) return null;
  const serie = serieDuJourExploration(missionId);
  const bonus = ids.filter((id) => PERSOS_PAR_ID[id].serie === serie).length >= PERSOS_SERIE_BONUS;
  partie.explorations.push({ mission: missionId, ids, debut: Date.now(), bonus });
  partie.stats.explorationsLancees = (partie.stats.explorationsLancees ?? 0) + 1;
  sauver();
  return { ids, bonus };
}

export function recupererExploration(index) {
  const x = partie?.explorations[index];
  if (!x) return null;
  const m = MISSIONS_EXPLORATION_PAR_ID[x.mission];
  if (Date.now() < x.debut + m.heures * MS_HEURE) return null;
  const mult = x.bonus ? 1 + BONUS_SERIE_EXPLORATION : 1;
  const gains = {};
  for (const [k, v] of Object.entries(m.recompense)) gains[k] = Math.round(v * mult);
  if (m.potion && Math.random() < m.potion) {
    const ids = Object.keys(POTIONS_PAR_ID);
    gains.potions = { [ids[Math.floor(Math.random() * ids.length)]]: 1 };
  }
  donnerRecompense(gains);
  partie.explorations.splice(index, 1);
  partie.stats.explorations = (partie.stats.explorations ?? 0) + 1;
  sauver();
  return gains;
}

export const explorationsFinies = () => (partie?.explorations ?? []).filter((x) => Date.now() >= x.debut + MISSIONS_EXPLORATION_PAR_ID[x.mission].heures * MS_HEURE).length;

// ==========================================================
// QUETES DE PERSONNAGE
// ==========================================================

function compterVictoiresQuete(ids) {
  for (const id of ids) {
    if (!partie.collection[id]) continue;
    const q = partie.quetes[id] ?? (partie.quetes[id] = { victoires: 0, faites: 0 });
    q.victoires += 1;
  }
}

function valeurQuete(id, si) {
  const prog = partie.collection[id];
  if (si === "victoires") return partie.quetes[id]?.victoires ?? 0;
  if (si === "niveau") return prog.niveau;
  if (si === "etoiles") return prog.etoiles;
  if (si === "eveil") return prog.eveil ?? 0;
  return 0;
}

// L'etape en cours de la quete d'un perso (null s'il n'est pas possede)
export function etatQuete(id) {
  if (!partie?.collection[id]) return null;
  const faites = partie.quetes[id]?.faites ?? 0;
  const etape = ETAPES_QUETE[faites] ?? null;
  return {
    faites, total: ETAPES_QUETE.length, finie: !etape, etape,
    valeur: etape ? valeurQuete(id, etape.si) : 0,
    prete: etape ? valeurQuete(id, etape.si) >= etape.cible : false,
  };
}

export function reclamerQuete(id) {
  const e = etatQuete(id);
  if (!e?.prete) return null;
  const r = { ...e.etape.recompense };
  if (r.bordure) {
    const prog = partie.collection[id];
    prog.variantes = [...new Set([...(prog.variantes ?? []), r.bordure])];
    delete r.bordure;
  }
  donnerRecompense(r);
  const q = partie.quetes[id] ?? (partie.quetes[id] = { victoires: 0, faites: 0 });
  q.faites += 1;
  partie.stats.quetes = (partie.stats.quetes ?? 0) + 1;
  sauver();
  return e.etape.recompense;
}
