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

// Paliers de recompense selon le meilleur score de la semaine
// (recales apres le plafond de la brulure sur les boss : fin de campagne vers 150k,
// equipe niveau 40 vers 300-500k, equipe au maximum vers 450-750k avant equipement)
export const PALIERS_RAID = [
  { score: 50000, encre: 100, fragments: 0, encreSacree: 0 },
  { score: 150000, encre: 150, fragments: 2, encreSacree: 0 },
  { score: 300000, encre: 200, fragments: 4, encreSacree: 0 },
  { score: 550000, encre: 300, fragments: 6, encreSacree: 1 },
  { score: 900000, encre: 500, fragments: 10, encreSacree: 1 },
];
