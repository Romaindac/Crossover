// ==========================================================
// OUVERTURE D'UN BOOSTER (logique pure, sans affichage ni sauvegarde)
// "aleatoire" renvoie un nombre entre 0 et 1 : Math.random dans le
// jeu, un hasard reproductible dans les tests et les simulateurs.
// ==========================================================

import { PERSOS, PERSOS_SECRETS } from "../donnees/persos.js";
import {
  EDITIONS_PAR_ID, CASES_BOOSTER, CHANCE_BOOSTER_DORE, CASE_DOREE, PITIE_BOOSTER,
  CHANCE_HOLO, CHANCE_DOREE,
} from "../donnees/boosters.js";

const ORDRE = ["commun", "peu_commun", "rare", "epique", "legendaire", "secret"];

export function tirerDansTable(aleatoire, table) {
  const raretes = ORDRE.filter((r) => table[r]);
  let x = aleatoire() * raretes.reduce((t, r) => t + table[r], 0);
  for (const r of raretes) {
    x -= table[r];
    if (x < 0) return r;
  }
  return raretes[raretes.length - 1];
}

// Les persos d'une edition dans une rarete (si l'edition n'en a aucun, on prend la rarete voisine)
function persosDe(edition, rarete) {
  if (rarete === "secret") {
    const secrets = PERSOS_SECRETS.filter((p) => edition.series.includes(p.serie));
    if (secrets.length) return secrets;
    rarete = "legendaire";
  }
  const dansEdition = PERSOS.filter((p) => edition.series.includes(p.serie));
  for (let i = ORDRE.indexOf(rarete); i >= 0; i--) {
    const liste = dansEdition.filter((p) => p.rarete === ORDRE[i]);
    if (liste.length) return liste;
  }
  return dansEdition;
}

export function tirerPersoEdition(aleatoire, edition, rarete, serieVedette, poidsVedette = 2) {
  const liste = persosDe(edition, rarete);
  const vedettes = Array.isArray(serieVedette) ? serieVedette : [serieVedette];
  const poids = liste.map((p) => (vedettes.includes(p.serie) ? poidsVedette : 1));
  let x = aleatoire() * poids.reduce((a, b) => a + b, 0);
  for (let i = 0; i < liste.length; i++) {
    x -= poids[i];
    if (x < 0) return liste[i];
  }
  return liste[liste.length - 1];
}

function tirerVariante(aleatoire) {
  const x = aleatoire();
  if (x < CHANCE_DOREE) return "doree";
  if (x < CHANCE_DOREE + CHANCE_HOLO) return "holo";
  return null;
}

// Ouvre un booster. pitie : boosters ouverts depuis le dernier Legendaire.
// Renvoie { cartes: [{ id, rarete, variante }], pitie, dore }
export function ouvrirBooster(aleatoire, editionId, { pitie = 0, serieVedette = null, pitieMax = PITIE_BOOSTER, forcerDore = false } = {}) {
  const edition = EDITIONS_PAR_ID[editionId];
  if (!edition) throw new Error(`Édition inconnue : ${editionId}`);
  const dore = aleatoire() < CHANCE_BOOSTER_DORE || forcerDore;
  const tables = dore ? CASES_BOOSTER.map(() => CASE_DOREE) : CASES_BOOSTER;
  const cartes = tables.map((table, i) => {
    const garantie = !dore && i === tables.length - 1 && pitie + 1 >= pitieMax;
    const rarete = garantie ? "legendaire" : tirerDansTable(aleatoire, table);
    const perso = tirerPersoEdition(aleatoire, edition, rarete, serieVedette);
    return { id: perso.id, rarete: perso.rarete, variante: tirerVariante(aleatoire) };
  });
  const legendaire = cartes.some((c) => c.rarete === "legendaire");
  return { cartes, pitie: legendaire ? 0 : pitie + 1, dore };
}

// ---------- Booster de depart ----------
// Offert une seule fois : 5 persos differents, un par role (tank, soutien,
// controle, attaquant, assassin), pour que la premiere equipe soit jouable.
// Des Communs et Peu communs, dont un Rare garanti ; 5 series differentes.
const ROLES_DEPART = ["tank", "soutien", "controle", "attaquant", "assassin"];

export function ouvrirBoosterDepart(aleatoire) {
  const indexRare = Math.floor(aleatoire() * ROLES_DEPART.length);
  const series = new Set();
  const cartes = ROLES_DEPART.map((role, i) => {
    const raretes = i === indexRare ? ["rare"] : ["commun", "peu_commun"];
    let liste = PERSOS.filter((p) => p.role === role && raretes.includes(p.rarete) && !series.has(p.serie));
    if (!liste.length) liste = PERSOS.filter((p) => p.role === role && raretes.includes(p.rarete));
    const perso = liste[Math.floor(aleatoire() * liste.length)];
    series.add(perso.serie);
    return { id: perso.id, rarete: perso.rarete, variante: null };
  });
  return { cartes };
}
