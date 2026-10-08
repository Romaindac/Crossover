// ==========================================================
// SAISONS ET COSMETIQUES
// Une saison par mois. Le rang depend de l'etage atteint dans
// la Tour pendant la saison et du meilleur score au boss.
// Les cosmetiques se montrent sans rendre plus fort.
// ==========================================================

export const RANGS = [
  { id: "bronze", nom: "Bronze", points: 5, encre: 100, fragments: 1 },
  { id: "argent", nom: "Argent", points: 15, encre: 200, fragments: 2 },
  { id: "or", nom: "Or", points: 30, encre: 300, fragments: 4 },
  { id: "platine", nom: "Platine", points: 50, encre: 450, fragments: 6 },
  { id: "diamant", nom: "Diamant", points: 75, encre: 650, fragments: 9 },
  { id: "legende", nom: "Légende", points: 100, encre: 900, fragments: 12 },
];

export const saisonActuelle = (maintenant = new Date()) => `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;
export const NOMS_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const nomSaison = (id) => `Saison de ${NOMS_MOIS[Number(id.split("-")[1]) - 1]} ${id.split("-")[0]}`;
export const pointsSaison = (recordTour, meilleurRaid) => recordTour + Math.floor(meilleurRaid / 50000);
export const rangDe = (points) => [...RANGS].reverse().find((r) => points >= r.points) ?? null;

// Cadres de la vedette au QG : le cadre d'encre de base, ceux des rangs, et les couvertures deluxe
export const CADRES = [
  { id: "encre", nom: "Encre", origine: "De base" },
  ...RANGS.map((r) => ({ id: r.id, nom: `Cadre ${r.nom}`, origine: `Atteindre le rang ${r.nom} pendant une saison` })),
  ...[1, 2, 3, 4, 5].map((c) => ({ id: `deluxe-${c}`, nom: `Couverture variante ${c}`, origine: `Finir le chapitre ${c} en Édition deluxe` })),
];
