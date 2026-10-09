// ==========================================================
// QUETES DE PERSONNAGE : chaque perso a la meme suite de 5 objectifs.
// La derniere etape donne sa bordure « Eveille », introuvable ailleurs.
// Les victoires comptent dans tous les modes ou il est dans l'equipe
// (campagne, chasse, Tour, Arene, Donjon, Duels).
// ==========================================================

export const ETAPES_QUETE = [
  { si: "victoires", cible: 10, texte: "Gagne 10 combats avec lui dans l'équipe", recompense: { invocations: 10 } },
  { si: "niveau", cible: 15, texte: "Monte-le au niveau 15", recompense: { potions: { chance: 1 } } },
  { si: "etoiles", cible: 3, texte: "Amène-le à 3 étoiles", recompense: { invocations: 20 } },
  { si: "victoires", cible: 40, texte: "Gagne 40 combats avec lui dans l'équipe", recompense: { poussiere: 150 } },
  { si: "eveil", cible: 1, texte: "Éveille-le (palier I)", recompense: { invocations: 30, bordure: "eveille" } },
];
