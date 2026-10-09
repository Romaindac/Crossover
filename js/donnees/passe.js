// ==========================================================
// PASSE DE SAISON (gratuit) : il avance en jouant, et repart
// a zero a chaque saison (chaque mois). 40 paliers.
// XP : 1 par invocation, 5 par victoire, 40 par mission du jour reclamee.
// Joueur actif : environ 800 XP par jour, soit le passe complet en 25 jours.
// ==========================================================

export const XP_PAR_PALIER = 500;
export const XP_INVOCATION = 1;
export const XP_VICTOIRE = 5;
export const XP_MISSION = 40;

// Une recompense par palier ; tous les 10 paliers, un gros lot
const CYCLE = [
  { invocations: 15 },
  { potions: { chance: 1 } },
  { encre: 150 },
  { potions: { bordure: 1 } },
  { invocations: 25 },
  { potions: { lune: 1 } },
  { encre: 250 },
  { tickets: 2 },
  { potions: { vitesse: 2 } },
];
export const PALIERS_PASSE = Array.from({ length: 40 }, (_, i) => {
  if ((i + 1) % 10 === 0) return i === 39 ? { ticketsDores: 2, potions: { lune: 3, chance: 2 } } : { ticketsDores: 1, invocations: 30 };
  return CYCLE[i % 10];
});
