// ==========================================================
// UNE INVOCATION (logique pure, sans affichage ni sauvegarde)
// "aleatoire" renvoie un nombre entre 0 et 1 : Math.random dans le
// jeu, un hasard reproductible dans les tests et les simulateurs.
// ==========================================================

import { EDITIONS_PAR_ID } from "../donnees/boosters.js";
import {
  TABLE_INVOCATION, RARETES_CHANCEUSES, PITIE_INVOCATION, BORDURES,
} from "../donnees/invocations.js";
import { tirerDansTable, tirerPersoEdition } from "./boosters.js";

// Les chances apres la chance : les raretes Rare et au-dessus sont multipliees,
// le Commun prend ce qui reste (jamais moins de 5 %).
export function tableAvecChance(chance = 1) {
  const table = { ...TABLE_INVOCATION };
  let bonus = 0;
  for (const r of RARETES_CHANCEUSES) {
    const avant = table[r];
    table[r] = avant * chance;
    bonus += table[r] - avant;
  }
  table.commun = Math.max(0.05, table.commun - bonus);
  const total = Object.values(table).reduce((a, b) => a + b, 0);
  for (const r of Object.keys(table)) table[r] /= total;
  return table;
}

export function tirerBordure(aleatoire, multBordure = 1) {
  const x = aleatoire();
  let cumul = 0;
  for (const b of BORDURES) {
    cumul += b.chance * multBordure;
    if (x < cumul) return b.id;
  }
  return null;
}

// Une invocation dans l'autel d'une edition.
// pitie : invocations depuis le dernier Legendaire. Renvoie { id, rarete, variante, pitie }
export function invoquer(aleatoire, editionId, { chance = 1, multBordure = 1, pitie = 0, serieVedette = null, pitieMax = PITIE_INVOCATION } = {}) {
  const edition = EDITIONS_PAR_ID[editionId];
  if (!edition) throw new Error(`Édition inconnue : ${editionId}`);
  const rarete = pitie + 1 >= pitieMax ? "legendaire" : tirerDansTable(aleatoire, tableAvecChance(chance));
  const perso = tirerPersoEdition(aleatoire, edition, rarete, serieVedette);
  return {
    id: perso.id, rarete: perso.rarete, variante: tirerBordure(aleatoire, multBordure),
    pitie: perso.rarete === "legendaire" ? 0 : pitie + 1,
  };
}
