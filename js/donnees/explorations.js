// ==========================================================
// EXPLORATIONS : envoyer des persos en mission, meme jeu ferme.
// 3 equipes en meme temps. Chaque mission demande un nombre de persos
// et une rarete minimale pour certains d'entre eux ; elle rapporte
// invocations, encre et parfois une potion. Un perso ne part que sur
// une mission a la fois. La serie du jour (une par mission) donne +50 %.
// ==========================================================

export const EQUIPES_EXPLORATION = 3;
export const BONUS_SERIE_EXPLORATION = 0.5;   // 3 persos ou plus de la serie du jour
export const PERSOS_SERIE_BONUS = 3;

// exige : [rarete minimale, nombre] ; recompense : par mission terminee
export const MISSIONS_EXPLORATION = [
  { id: "ruines", nom: "Ruines oubliées", heures: 1, persos: 3, exige: null, recompense: { invocations: 5, encre: 30 } },
  { id: "foret", nom: "Forêt des esprits", heures: 2, persos: 3, exige: ["rare", 1], recompense: { invocations: 10, encre: 50 }, potion: 0.3 },
  { id: "port", nom: "Port des corsaires", heures: 4, persos: 4, exige: ["rare", 2], recompense: { invocations: 15, encre: 90 }, potion: 0.5 },
  { id: "citadelle", nom: "Citadelle d'encre", heures: 6, persos: 4, exige: ["epique", 1], recompense: { invocations: 22, encre: 140 }, potion: 0.8 },
  { id: "abysse", nom: "Abysse sans fond", heures: 8, persos: 5, exige: ["legendaire", 1], recompense: { invocations: 30, encre: 200, poussiere: 60 }, potion: 1 },
];
export const MISSIONS_EXPLORATION_PAR_ID = Object.fromEntries(MISSIONS_EXPLORATION.map((m) => [m.id, m]));
