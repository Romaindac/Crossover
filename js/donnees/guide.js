// ==========================================================
// GUIDE DU DEBUTANT : les premiers objectifs, un par un, au QG
// Chaque objectif montre ou aller et donne une petite recompense.
// La condition (cle « si ») est verifiee dans services/partie.js.
// ==========================================================

export const GUIDE = [
  { id: "etape1", si: "etape1", texte: "Gagne ta première étape de campagne", aide: "Aventure, onglet Campagne : la première victoire d'une étape ne coûte pas d'énergie.", nav: "aventure", onglet: "campagne", recompense: { encre: 100 } },
  { id: "booster", si: "booster", texte: "Ouvre un booster", aide: "Un booster gratuit arrive toutes les 30 minutes, et chaque chapitre fini en offre 3.", nav: "tirages", recompense: { tickets: 1 } },
  { id: "niveau", si: "niveau5", texte: "Monte un perso au niveau 5", aide: "Chaque combat donne de l'expérience à ton équipe, et un peu aux persos de réserve.", nav: "aventure", onglet: "campagne", recompense: { encre: 150 } },
  { id: "mission", si: "mission", texte: "Réclame une mission du jour", aide: "Le QG propose 3 missions chaque jour. Les 3 réussies donnent un bonus d'énergie.", nav: "qg", recompense: { energie: 30 } },
  { id: "chapitre1", si: "chapitre1", texte: "Termine le chapitre 1", aide: "Bats le boss de l'étape 8. Ça ouvre la Chasse, où l'on gagne l'équipement.", nav: "aventure", onglet: "campagne", recompense: { tickets: 2 } },
  { id: "chasse", si: "chasse", texte: "Gagne un combat de chasse", aide: "Aventure, onglet Chasse : chaque victoire peut donner un objet à équiper.", nav: "aventure", onglet: "chasse", recompense: { encre: 150 } },
  { id: "equiper", si: "equiper", texte: "Équipe un objet sur un perso", aide: "Équipe, puis touche un perso : 4 emplacements (arme, tenue, accessoire, relique). « Équiper le meilleur » fait tout d'un coup.", nav: "equipe", recompense: { encre: 200 } },
  { id: "etoile", si: "etoile2", texte: "Fais passer un perso à 2 étoiles", aide: "Un doublon tiré dans un booster ajoute une étoile : plus de PV et d'ATQ.", nav: "tirages", recompense: { tickets: 1 } },
  { id: "chapitre2", si: "chapitre2", texte: "Termine le chapitre 2", aide: "Ça ouvre la Tour infinie et le boss de la semaine.", nav: "aventure", onglet: "campagne", recompense: { tickets: 2, energie: 30 } },
  { id: "tour", si: "tour5", texte: "Atteins l'étage 5 de la Tour", aide: "Les étages pas encore battus cette semaine sont gratuits. Coffres à 10, 25 et 50 étages par semaine.", nav: "aventure", onglet: "tour", recompense: { encre: 300 } },
  { id: "raid", si: "raid", texte: "Tente le boss de la semaine", aide: "3 tentatives par jour, sans énergie. Tes 3 meilleures équipes l'affrontent l'une après l'autre.", nav: "aventure", onglet: "raid", recompense: { tickets: 2 } },
  { id: "vitrine", si: "chapitre3", texte: "Termine le chapitre 3", aide: "Et partage ta vitrine à tes potes depuis l'onglet Social !", nav: "aventure", onglet: "campagne", recompense: { tickets: 3, energie: 50 } },
];
