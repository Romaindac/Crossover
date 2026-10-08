// ==========================================================
// PROGRESSION (logique pure)
// Experience, niveaux, doublons et etoiles. Utilisee par la
// partie du joueur ET par le simulateur du laboratoire, pour
// que les deux suivent exactement les memes regles.
// ==========================================================

import {
  NIVEAU_MAX, xpPourNiveau, ETOILES_MAX, doublonsPourEtoile, ENCRE_PAR_DOUBLON_EN_TROP,
} from "../donnees/progression.js";

import { niveauMaxDe } from "../donnees/eveil.js";

export const nouvelleProgression = () => ({ niveau: 1, xp: 0, etoiles: 1, doublons: 0, eveil: 0, talents: [] });

// Ajoute de l'experience. Modifie prog et renvoie ce qui a change.
export function ajouterXp(prog, gain) {
  const niveauAvant = prog.niveau;
  const max = niveauMaxDe(prog);   // 30, puis jusqu'a 50 avec l'eveil
  if (prog.niveau >= max) return { gain: 0, niveauAvant, niveauApres: prog.niveau };
  prog.xp += gain;
  while (prog.niveau < max && prog.xp >= xpPourNiveau(prog.niveau)) {
    prog.xp -= xpPourNiveau(prog.niveau);
    prog.niveau += 1;
  }
  if (prog.niveau === max) prog.xp = 0;
  return { gain, niveauAvant, niveauApres: prog.niveau };
}

// Compte un doublon. Modifie prog et renvoie ce qui a change.
export function ajouterDoublon(prog) {
  const etoilesAvant = prog.etoiles;
  if (prog.etoiles >= ETOILES_MAX) {
    return { etoilesAvant, etoilesApres: prog.etoiles, encreRendue: ENCRE_PAR_DOUBLON_EN_TROP };
  }
  prog.doublons += 1;
  while (prog.etoiles < ETOILES_MAX && prog.doublons >= doublonsPourEtoile(prog.etoiles)) {
    prog.doublons -= doublonsPourEtoile(prog.etoiles);
    prog.etoiles += 1;
  }
  return {
    etoilesAvant,
    etoilesApres: prog.etoiles,
    doublons: prog.doublons,
    besoin: prog.etoiles < ETOILES_MAX ? doublonsPourEtoile(prog.etoiles) : 0,
    encreRendue: 0,
  };
}
