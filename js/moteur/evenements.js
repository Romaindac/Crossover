// ==========================================================
// CALENDRIER DES EVENEMENTS (logique pure)
// Tout se deduit de la date : deux joueurs voient le meme evenement
// au meme moment, sans serveur.
// ==========================================================

import { HEURES_FOLLES } from "../donnees/evenements.js";
import { creerHasard } from "./hasard.js";

const HEURE = 3600000;
const JOUR = 24 * HEURE;

// L'heure folle en cours (change a chaque heure pile, heure universelle)
export function heureFolle(maintenant = Date.now()) {
  const numero = Math.floor(maintenant / HEURE);
  const h = creerHasard((numero * 2654435761) >>> 0);
  const evenement = HEURES_FOLLES[Math.floor(h.nombre() * HEURES_FOLLES.length)];
  return { ...evenement, numero, fin: (numero + 1) * HEURE };
}

// Le defi du jour : une serie tiree au sort pour la journee
export function serieDuDefi(series, maintenant = Date.now()) {
  const numero = Math.floor(maintenant / JOUR);
  const h = creerHasard((numero * 40503 + 7) >>> 0);
  return { serie: series[Math.floor(h.nombre() * series.length)], numero, fin: (numero + 1) * JOUR };
}
