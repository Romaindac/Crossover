// ==========================================================
// TIRAGES (logique pure, sans affichage ni sauvegarde)
// "aleatoire" est une fonction qui renvoie un nombre entre 0 et 1 :
// Math.random dans le jeu, un hasard reproductible dans les tests.
// ==========================================================

import { RARETES } from "../donnees/raretes.js";
import { PERSOS } from "../donnees/persos.js";
import { PITIE_LEGENDAIRE } from "../donnees/progression.js";

const DU_PLUS_COMMUN = ["commun", "peu_commun", "rare", "epique", "legendaire"];
const estRarePlus = (rarete) => RARETES[rarete].ordre >= RARETES.rare.ordre;

// Tire une rarete selon les taux, en respectant les garanties
export function tirerRarete(aleatoire, { pitie = 0, rarePlusGaranti = false } = {}) {
  if (pitie + 1 >= PITIE_LEGENDAIRE) return "legendaire";
  const candidates = rarePlusGaranti ? DU_PLUS_COMMUN.filter(estRarePlus) : DU_PLUS_COMMUN;
  const total = candidates.reduce((somme, r) => somme + RARETES[r].taux, 0);
  let x = aleatoire() * total;
  for (const r of candidates) {
    x -= RARETES[r].taux;
    if (x < 0) return r;
  }
  return candidates[candidates.length - 1];
}

// Tire un perso au hasard dans une rarete
export function tirerPerso(aleatoire, rarete, serieVedette = null) {
  const liste = PERSOS.filter((p) => p.rarete === rarete);
  const poids = liste.map((p) => (p.serie === serieVedette ? 2 : 1));
  let x = aleatoire() * poids.reduce((a, b) => a + b, 0);
  for (let i = 0; i < liste.length; i++) {
    x -= poids[i];
    if (x < 0) return liste[i].id;
  }
  return liste[liste.length - 1].id;
}

// Fait une serie de tirages. En x10, le dernier tome est au moins
// Rare si les 9 premiers ne l'etaient pas.
export function tirerSerie(aleatoire, nombre, pitieDepart, serieVedette = null) {
  let pitie = pitieDepart;
  const tirages = [];
  for (let i = 0; i < nombre; i++) {
    const garantie = nombre === 10 && i === 9 && !tirages.some((t) => estRarePlus(t.rarete));
    const rarete = tirerRarete(aleatoire, { pitie, rarePlusGaranti: garantie });
    pitie = rarete === "legendaire" ? 0 : pitie + 1;
    tirages.push({ id: tirerPerso(aleatoire, rarete, serieVedette), rarete });
  }
  return { tirages, pitie };
}
