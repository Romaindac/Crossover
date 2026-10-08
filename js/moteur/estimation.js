// ==========================================================
// ESTIMATION DES CHANCES
// Simule quelques combats (toujours les memes graines, pour un
// resultat stable) et renvoie le taux de victoire.
// ==========================================================

import { simulerCombat } from "./simulation.js";

export function tauxVictoire(entrees, palier, combats = 30) {
  let victoires = 0;
  for (let g = 1; g <= combats; g++) {
    const r = simulerCombat({
      equipeA: entrees, equipeB: palier.equipe, niveauB: palier.niveau,
      multiplicateurB: palier.multiplicateur, graine: g * 7919, journal: false,
    });
    if (r.vainqueur === 0) victoires++;
  }
  return victoires / combats;
}

export function libelleChances(taux) {
  if (taux >= 0.8) return { classe: "facile", mot: "Facile" };
  if (taux >= 0.5) return { classe: "jouable", mot: "Jouable" };
  if (taux >= 0.2) return { classe: "difficile", mot: "Difficile" };
  return { classe: "extreme", mot: "Très difficile" };
}
