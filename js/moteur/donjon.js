// ==========================================================
// DONJON (logique pure) : l'adversaire d'un etage et les bonus
// d'une descente. Reproductible : la graine de la descente fixe
// les ennemis de chaque etage.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES } from "../donnees/raretes.js";
import { niveauEtage, multEtage, BENEDICTIONS_PAR_ID } from "../donnees/donjon.js";
import { creerHasard } from "./hasard.js";
import { composerEquipe } from "./composition.js";

// Le poids moyen de la rarete d'une equipe (Commun 1, Legendaire 2)
export const facteurRarete = (ids) => ids.reduce((t, id) => t + 1 + (RARETES[PERSOS_PAR_ID[id]?.rarete]?.bonus ?? 0), 0) / Math.max(1, ids.length);

// 5 persos au hasard (graine + etage), ranges comme une vraie equipe.
// raretesDeck : le poids moyen de rarete du deck ; les ennemis sont ramenes a ce poids,
// pour que le donjon soit juste avec une equipe de Communs comme de Legendaires.
export function adversaireEtage(graine, n, niveauDeck, ennemis = 1, raretesDeck = null) {
  const h = creerHasard(((graine >>> 0) * 31 + n * 7919) >>> 0);
  const pioche = [...PERSOS];
  const choisis = [];
  while (choisis.length < 5) choisis.push(pioche.splice(Math.floor(h.nombre() * pioche.length), 1)[0].id);
  const niveau = niveauEtage(n, niveauDeck);
  const equipe = composerEquipe(Object.fromEntries(choisis.map((id) => [id, { niveau, etoiles: 1 }])));
  const equilibre = raretesDeck ? raretesDeck / facteurRarete(equipe) : 1;
  return { equipe, niveau, multiplicateur: multEtage(n) * ennemis * equilibre };
}

// Les bonus cumules des benedictions d'une descente (+ la maitrise de vigueur)
export function bonusDescente(benedictions = [], vigueur = 0) {
  const b = { pct: vigueur * 3, crit: 0, esquive: 0, volDeVie: 0, energieDepart: 0, ennemis: 1, butin: 0 };
  for (const id of benedictions) {
    const x = BENEDICTIONS_PAR_ID[id];
    if (!x) continue;
    b.pct += x.pct ?? 0;
    b.crit += x.crit ?? 0;
    b.esquive += x.esquive ?? 0;
    b.volDeVie += x.volDeVie ?? 0;
    b.energieDepart += x.energie ?? 0;
    b.ennemis *= x.ennemis ?? 1;
    b.butin += x.butin ?? 0;
  }
  return b;
}
