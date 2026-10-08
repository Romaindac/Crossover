// ==========================================================
// LES 5 RARETES
// bonus : bonus de PV, ATQ et DEF
// taux  : chance d'apparaitre a chaque tirage
// ==========================================================

export const RARETES = {
  commun:     { nom: "Commun",     ordre: 1, bonus: 0,    taux: 0.40 },
  peu_commun: { nom: "Peu commun", ordre: 2, bonus: 0.04, taux: 0.30 },
  rare:       { nom: "Rare",       ordre: 3, bonus: 0.08, taux: 0.18 },
  epique:     { nom: "Épique",     ordre: 4, bonus: 0.12, taux: 0.09 },
  legendaire: { nom: "Légendaire", ordre: 5, bonus: 0.16, taux: 0.03 },
};

export const ORDRE_RARETES = ["legendaire", "epique", "rare", "peu_commun", "commun"];
