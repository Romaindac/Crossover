// ==========================================================
// LE BOSS DE LA SEMAINE (raid)
// Une course aux degats : trois equipes a la suite contre un
// antagoniste aux PV enormes. Le score est le total des degats.
// ==========================================================

import { BOSS_RAID } from "./persos.js";
import { numeroSemaine } from "./tour.js";

export const NIVEAU_BOSS_RAID = 40;
export const TENTATIVES_PAR_JOUR = 3;
export const bossDeLaSemaine = (maintenant = Date.now()) => BOSS_RAID[numeroSemaine(maintenant) % BOSS_RAID.length];

// Boss collectif (en ligne) : les degats de tous les joueurs s'additionnent.
// Chaque palier atteint recompense tous ceux qui ont participe cette semaine.
export const PALIERS_COLLECTIFS = [
  { total: 5000000, recompense: { invocations: 20, potions: { chance: 1 } } },
  { total: 18000000, recompense: { invocations: 30, potions: { bordure: 1, lune: 1 } } },
  { total: 45000000, recompense: { invocations: 40, potions: { chance: 2 } } },
  { total: 90000000, recompense: { invocations: 90, potions: { lune: 2, bordure: 2 } } },
];

// Paliers de recompense selon le meilleur score de la semaine
// (x1,8 apres la mise a jour « puissance des raretes » : les scores ont suivi)
// (recales apres le plafond de la brulure sur les boss : fin de campagne vers 150k,
// equipe niveau 40 vers 300-500k, equipe au maximum vers 450-750k avant equipement)
export const PALIERS_RAID = [
  { score: 90000, encre: 100, fragments: 0, encreSacree: 0 },
  { score: 270000, encre: 150, fragments: 2, encreSacree: 0 },
  { score: 540000, encre: 200, fragments: 4, encreSacree: 0 },
  { score: 1000000, encre: 300, fragments: 6, encreSacree: 1 },
  { score: 1600000, encre: 500, fragments: 10, encreSacree: 1 },
];
