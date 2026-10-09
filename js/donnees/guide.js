// ==========================================================
// GUIDE DU DEBUTANT : les premiers objectifs, un par un, au QG
// Chaque objectif montre ou aller et donne une petite recompense.
// La condition (cle « si ») est verifiee dans services/partie.js.
// recompense : { encre, tickets, energie, invocations, potions: { chance, bordure, vitesse, lune } }
// ==========================================================

export const GUIDE = [
  { id: "invoquer", si: "invoquer10", texte: "Invoque 10 cartes à l'autel", aide: "Onglet Invocations : touche « Invoquer ». Ta réserve se recharge toute seule et à chaque victoire. À 10 invocations, l'invocation automatique se débloque.", nav: "tirages", recompense: { invocations: 20 } },
  { id: "etape1", si: "etape1", texte: "Gagne ta première étape de campagne", aide: "Aventure, onglet Campagne : la première victoire d'une étape ne coûte pas d'énergie. Chaque chapitre fini ouvre un nouveau monde.", nav: "aventure", onglet: "campagne", recompense: { encre: 100 } },
  { id: "arene", si: "arene1", texte: "Bats le premier boss de l'Arène", aide: "Aventure, onglet Arène : ton équipe contre un boss géant. Le premier KO donne sa bordure Boss, introuvable ailleurs.", nav: "aventure", onglet: "arene", recompense: { encre: 150, potions: { chance: 1 } } },
  { id: "points", si: "point-autel", texte: "Place un point d'autel", aide: "Chaque niveau d'autel donne 3 points : Chance, Vitesse, Potions ou Bordures. Le panneau « Niveau d'autel », sous l'autel.", nav: "tirages", recompense: { potions: { lune: 1 } } },
  { id: "booster", si: "booster", texte: "Ouvre un booster", aide: "Onglet Invocations, puis Boosters : un booster gratuit toutes les 30 minutes, et chaque chapitre fini en offre 3.", nav: "tirages", recompense: { tickets: 1 } },
  { id: "niveau", si: "niveau5", texte: "Monte un perso au niveau 5", aide: "Chaque combat donne de l'expérience à ton équipe, et un peu aux persos de réserve.", nav: "aventure", onglet: "campagne", recompense: { encre: 150 } },
  { id: "mission", si: "mission", texte: "Réclame une mission du jour", aide: "Le QG propose 3 missions chaque jour. Les 3 réussies donnent un bonus d'énergie.", nav: "qg", recompense: { energie: 30 } },
  { id: "exploration", si: "exploration", texte: "Envoie une équipe en exploration", aide: "Au QG, case Explorations : tes persos partent en mission même jeu fermé et rapportent des invocations.", nav: "qg", recompense: { invocations: 15 } },
  { id: "chapitre1", si: "chapitre1", texte: "Termine le chapitre 1", aide: "Bats le boss de l'étape 8. Ça ouvre la Chasse (équipement) et un deuxième autel.", nav: "aventure", onglet: "campagne", recompense: { tickets: 2 } },
  { id: "etoile", si: "etoile2", texte: "Fais passer un perso à 2 étoiles", aide: "Un doublon ajoute une étoile : +12 % de PV et d'ATQ. L'autel en donne beaucoup.", nav: "tirages", recompense: { invocations: 20 } },
  { id: "potion", si: "potion", texte: "Bois une potion à l'autel", aide: "Sous l'autel : la potion de chance rend les grosses cartes plus probables pendant 5 minutes. Profites-en pour enchaîner les invocations.", nav: "tirages", recompense: { potions: { chance: 1, bordure: 1 } } },
  { id: "chasse", si: "chasse", texte: "Gagne un combat de chasse", aide: "Aventure, onglet Chasse : chaque victoire peut donner un objet à équiper.", nav: "aventure", onglet: "chasse", recompense: { encre: 150 } },
  { id: "equiper", si: "equiper", texte: "Équipe un objet sur un perso", aide: "Équipe, puis touche un perso : 4 emplacements (arme, tenue, accessoire, relique). « Équiper le meilleur » fait tout d'un coup.", nav: "equipe", recompense: { encre: 200 } },
  { id: "donjon", si: "donjon5", texte: "Franchis 5 étages du Donjon", aide: "Aventure, onglet Donjon : 3 descentes par jour. Choisis tes bénédictions, et sors avec le butin avant de tomber.", nav: "aventure", onglet: "donjon", recompense: { invocations: 25 } },
  { id: "chapitre2", si: "chapitre2", texte: "Termine le chapitre 2", aide: "Ça ouvre la Tour infinie, le boss de la semaine et un troisième autel.", nav: "aventure", onglet: "campagne", recompense: { tickets: 2, energie: 30 } },
  { id: "tour", si: "tour5", texte: "Atteins l'étage 5 de la Tour", aide: "Les étages pas encore battus cette semaine sont gratuits. Coffres à 10, 25 et 50 étages par semaine.", nav: "aventure", onglet: "tour", recompense: { encre: 300 } },
  { id: "raid", si: "raid", texte: "Tente le boss de la semaine", aide: "Aventure, onglet Raid : 3 tentatives par jour, sans énergie. En ligne, tes dégâts s'ajoutent à ceux de tous les joueurs.", nav: "aventure", onglet: "raid", recompense: { tickets: 2 } },
  { id: "passe", si: "passe", texte: "Réclame un palier du passe de saison", aide: "Au QG : le passe avance tout seul en invoquant, en gagnant et avec les missions du jour.", nav: "qg", recompense: { invocations: 20 } },
  { id: "vitrine", si: "chapitre3", texte: "Termine le chapitre 3", aide: "Et partage ta vitrine à tes potes depuis l'onglet Social, ou défie-les en Duel !", nav: "aventure", onglet: "campagne", recompense: { tickets: 3, energie: 50 } },
];
