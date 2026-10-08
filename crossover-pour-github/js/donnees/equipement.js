// ==========================================================
// EQUIPEMENT : regles generales
// Le catalogue des objets est dans objets.js, les panoplies
// dans panoplies.js, les zones de chasse dans zones.js.
// ==========================================================

export const NOMS_STATS = {
  atq: "ATQ",
  pv: "PV",
  vit: "VIT",
  atqPct: "ATQ %",
  pvPct: "PV %",
  defPct: "DEF %",
  critPct: "Critique %",
  energie: "Énergie de départ",
  butin: "Butin %",
};

export const EMPLACEMENTS = {
  arme: { nom: "Arme" },
  tenue: { nom: "Tenue" },
  accessoire: { nom: "Accessoire" },
  relique: { nom: "Relique" },
};
export const ORDRE_EMPLACEMENTS = ["arme", "tenue", "accessoire", "relique"];

export const NIVEAU_MAX_PIECE = 12;
export const BONUS_PAR_NIVEAU = 0.05;   // chaque amelioration : +5 % sur toutes les lignes

// Chance de base qu'un objet tombe apres une victoire, selon sa rarete
export const CHANCE_DROP = { commun: 0.06, peu_commun: 0.04, rare: 0.02, epique: 0.05, legendaire: 0.01 };

// Puissance relative des raretes, utilisee pour les fourchettes des objets
export const MULT_RARETE_OBJET = { commun: 1, peu_commun: 1.12, rare: 1.25, epique: 1.45, legendaire: 1.6 };
