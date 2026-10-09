// ==========================================================
// MISSIONS DU JOUR
// Chaque jour, 3 missions sont tirees dans cette liste.
// evenement : ce que le jeu signale pour les faire avancer.
// mode : la mission n'est tiree qu'une fois ce mode ouvert
//   (chasse : zone 1 ; tour et raid : chapitre 2 fini ; deluxe : chapitre 5 fini).
// ==========================================================

export const MISSIONS = [
  { id: "victoires", texte: "Gagne 3 combats", cible: 3, recompense: 40, evenement: "victoire" },
  { id: "tirage", texte: "Ouvre 1 booster", cible: 1, recompense: 30, evenement: "tirage" },
  { id: "invocations", texte: "Invoque 30 cartes à l'autel", cible: 30, recompense: 40, evenement: "invocation" },
  { id: "ultimes", texte: "Lance 5 ultimes toi-même, en mode manuel", cible: 5, recompense: 50, evenement: "ultime-manuel" },
  { id: "rapide", texte: "Gagne un combat en moins de 30 secondes", cible: 1, recompense: 40, evenement: "victoire-rapide" },
  { id: "serie", texte: "Gagne avec 2 persos de la même série", cible: 1, recompense: 40, evenement: "victoire-serie" },
  { id: "niveaux", texte: "Fais gagner 3 niveaux à tes persos", cible: 3, recompense: 40, evenement: "niveau" },
  { id: "expedition", texte: "Récupère les gains de ton expédition", cible: 1, recompense: 30, evenement: "expedition" },
  { id: "chasse", texte: "Gagne 10 combats de chasse", cible: 10, recompense: 40, evenement: "victoire-chasse", mode: "chasse" },
  { id: "dore", texte: "Vaincs un groupe doré", cible: 1, recompense: 50, evenement: "chasse-dore", mode: "chasse" },
  { id: "amelioration", texte: "Améliore 3 fois une pièce d'équipement", cible: 3, recompense: 40, evenement: "amelioration", mode: "chasse" },
  { id: "honneur", texte: "Gagne 3 combats avec un perso à l'honneur", cible: 3, recompense: 40, evenement: "victoire-honneur" },
  { id: "tour", texte: "Franchis 3 étages de la Tour", cible: 3, recompense: 50, evenement: "etage-tour", mode: "tour" },
  { id: "raid", texte: "Tente le boss de la semaine", cible: 1, recompense: 40, evenement: "raid", mode: "raid" },
  { id: "sans-ko", texte: "Gagne un combat sans perdre aucun perso", cible: 1, recompense: 40, evenement: "victoire-sans-ko" },
  { id: "deluxe", texte: "Gagne 2 étapes de l'Édition deluxe", cible: 2, recompense: 60, evenement: "victoire-deluxe", mode: "deluxe" },
];

export const MISSIONS_PAR_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
