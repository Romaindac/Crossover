// ==========================================================
// REGLAGES DU JOUEUR
// Chaque reglage a une valeur par defaut. Ils sont gardes dans
// le navigateur et inclus dans l'export de la sauvegarde.
// ==========================================================

import { lire, ecrire } from "./sauvegarde.js";

export const REGLAGES = {
  auto: { defaut: true },
  vitesse: { defaut: 1, valeurs: [1, 2, 3] },
  // Grande case manga pour tes ultimes : toujours, la premiere fois
  // de chaque perso dans un combat, ou jamais (bandeau discret)
  cases: { defaut: "premiere", valeurs: ["toujours", "premiere", "jamais"] },
  secousses: { defaut: true },
  boucleContinuer: { defaut: false },   // la boucle de chasse continue apres une defaite
  recyclageAuto: { defaut: false },     // recycler les Communes libres pendant les boucles
};

export const NOMS_CASES = {
  toujours: "À chaque ultime",
  premiere: "Une fois par perso et par combat",
  jamais: "Jamais (bandeau discret)",
};

export function reglage(nom) {
  const def = REGLAGES[nom];
  const valeur = lire(nom, def.defaut);
  if (def.valeurs && !def.valeurs.includes(valeur)) return def.defaut;
  if (typeof def.defaut === "boolean" && typeof valeur !== "boolean") return def.defaut;
  return valeur;
}

export function changerReglage(nom, valeur) {
  ecrire(nom, valeur);
}

export function tousLesReglages() {
  return Object.fromEntries(Object.keys(REGLAGES).map((nom) => [nom, reglage(nom)]));
}

export function restaurerReglages(valeurs = {}) {
  for (const nom of Object.keys(REGLAGES)) {
    if (nom in valeurs) changerReglage(nom, valeurs[nom]);
  }
}
