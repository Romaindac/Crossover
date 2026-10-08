// ==========================================================
// OUVERTURE D'UN BOOSTER (logique pure, sans affichage ni sauvegarde)
// "aleatoire" renvoie un nombre entre 0 et 1 : Math.random dans le
// jeu, un hasard reproductible dans les tests et les simulateurs.
// ==========================================================

import { PERSOS } from "../donnees/persos.js";
import {
  EDITIONS_PAR_ID, CASES_BOOSTER, CHANCE_BOOSTER_DORE, CASE_DOREE, PITIE_BOOSTER,
  CHANCE_HOLO, CHANCE_DOREE,
} from "../donnees/boosters.js";

const ORDRE = ["commun", "peu_commun", "rare", "epique", "legendaire"];

function tirerDansTable(aleatoire, table) {
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
  const dansEdition = PERSOS.filter((p) => edition.series.includes(p.serie));
  for (let i = ORDRE.indexOf(rarete); i >= 0; i--) {
    const liste = dansEdition.filter((p) => p.rarete === ORDRE[i]);
    if (liste.length) return liste;
  }
  return dansEdition;
}

function tirerPersoEdition(aleatoire, edition, rarete, serieVedette) {
  const liste = persosDe(edition, rarete);
  const poids = liste.map((p) => (p.serie === serieVedette ? 2 : 1));
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
export function ouvrirBooster(aleatoire, editionId, { pitie = 0, serieVedette = null } = {}) {
  const edition = EDITIONS_PAR_ID[editionId];
  if (!edition) throw new Error(`Édition inconnue : ${editionId}`);
  const dore = aleatoire() < CHANCE_BOOSTER_DORE;
  const tables = dore ? CASES_BOOSTER.map(() => CASE_DOREE) : CASES_BOOSTER;
  const cartes = tables.map((table, i) => {
    const garantie = !dore && i === tables.length - 1 && pitie + 1 >= PITIE_BOOSTER;
    const rarete = garantie ? "legendaire" : tirerDansTable(aleatoire, table);
    const perso = tirerPersoEdition(aleatoire, edition, rarete, serieVedette);
    return { id: perso.id, rarete: perso.rarete, variante: tirerVariante(aleatoire) };
  });
  const legendaire = cartes.some((c) => c.rarete === "legendaire");
  return { cartes, pitie: legendaire ? 0 : pitie + 1, dore };
}
