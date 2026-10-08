// ==========================================================
// SAISONS ET COSMETIQUES
// Une saison par mois. Le rang depend de la Tour, du boss de chaque
// semaine et des jours ou toutes les missions du jour sont faites.
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
// Points de saison, etales sur le mois :
// - Tour : 1 point par 5 etages du record de la saison ;
// - boss de la semaine : 1 point par 50 000 degats, pour CHAQUE semaine du mois (15 au plus par semaine) ;
// - jours actifs : 1 point par jour ou les 3 missions du jour sont reclamees.
// Le rang Legende demande donc de jouer tout le mois, pas une soiree le 1er.
export const POINTS_RAID_MAX_SEMAINE = 15;
export const detailPointsSaison = (s) => ({
  tour: Math.floor((s.recordTour ?? 0) / 5),
  raid: Object.values(s.raidSemaines ?? {}).reduce((t, score) => t + Math.min(POINTS_RAID_MAX_SEMAINE, Math.floor(score / 50000)), 0),
  jours: (s.joursActifs ?? []).length,
});
export const pointsSaison = (s) => {
  const d = detailPointsSaison(s);
  return d.tour + d.raid + d.jours;
};
export const rangDe = (points) => [...RANGS].reverse().find((r) => points >= r.points) ?? null;

// Cadres de la vedette au QG : le cadre d'encre de base, ceux des rangs, et les couvertures deluxe
export const CADRES = [
  { id: "encre", nom: "Encre", origine: "De base" },
  ...RANGS.map((r) => ({ id: r.id, nom: `Cadre ${r.nom}`, origine: `Atteindre le rang ${r.nom} pendant une saison` })),
  ...[1, 2, 3, 4, 5].map((c) => ({ id: `deluxe-${c}`, nom: `Couverture variante ${c}`, origine: `Finir le chapitre ${c} en Édition deluxe` })),
];
