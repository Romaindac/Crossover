// ==========================================================
// LES 6 RARETES (la 6e, Secret, ne se trouve qu'a l'autel)
// bonus : bonus de PV et d'ATQ (une Legendaire vaut 2 fois une Commune, a niveau egal)
// taux  : chance d'apparaitre a chaque tirage
// ==========================================================

export const RARETES = {
  commun:     { nom: "Commun",     ordre: 1, bonus: 0,    taux: 0.40 },
  peu_commun: { nom: "Peu commun", ordre: 2, bonus: 0.15, taux: 0.30 },
  rare:       { nom: "Rare",       ordre: 3, bonus: 0.35, taux: 0.18 },
  epique:     { nom: "Épique",     ordre: 4, bonus: 0.6, taux: 0.09 },
  legendaire: { nom: "Légendaire", ordre: 5, bonus: 1, taux: 0.03 },
  // Secret : un par manga, seulement a l'autel, identite cachee jusqu'au tirage (persos-secrets.js)
  secret:     { nom: "Secret",     ordre: 6, bonus: 1.5, taux: 0 },
};

// Les 5 raretes communes aux persos et aux objets (les filtres d'objets s'en servent)
export const ORDRE_RARETES = ["legendaire", "epique", "rare", "peu_commun", "commun"];
// Les raretes des persos, Secret compris
export const ORDRE_RARETES_PERSOS = ["secret", ...ORDRE_RARETES];
