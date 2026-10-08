// ==========================================================
// MISSIONS DU JOUR
// Chaque jour, 3 missions sont tirees dans cette liste.
// evenement : ce que le jeu signale pour les faire avancer.
// ==========================================================

export const MISSIONS = [
  { id: "victoires", texte: "Gagne 3 combats", cible: 3, recompense: 40, evenement: "victoire" },
  { id: "tirage", texte: "Ouvre 1 tome aux tirages", cible: 1, recompense: 30, evenement: "tirage" },
  { id: "ultimes", texte: "Lance 5 ultimes toi-même, en mode manuel", cible: 5, recompense: 50, evenement: "ultime-manuel" },
  { id: "rapide", texte: "Gagne un combat en moins de 30 secondes", cible: 1, recompense: 40, evenement: "victoire-rapide" },
  { id: "serie", texte: "Gagne avec 2 persos de la même série", cible: 1, recompense: 40, evenement: "victoire-serie" },
  { id: "niveaux", texte: "Fais gagner 3 niveaux à tes persos", cible: 3, recompense: 40, evenement: "niveau" },
  { id: "expedition", texte: "Récupère les gains de ton expédition", cible: 1, recompense: 30, evenement: "expedition" },
];

export const MISSIONS_PAR_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
