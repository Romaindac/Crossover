// ==========================================================
// VERIFICATIONS RAPIDES DU MOTEUR (sans navigateur)
// Lancer avec : node tests/verifier.mjs
// ==========================================================

import { simulerCombat } from "../js/moteur/simulation.js";
import { OBJETS } from "../js/donnees/objets.js";
import { PANOPLIES } from "../js/donnees/panoplies.js";
import { PERSOS } from "../js/donnees/persos.js";
import { TOUTES_LES_ETAPES } from "../js/donnees/campagne.js";
import { etageTour } from "../js/donnees/tour.js";
import { TAMPONS } from "../js/donnees/tampons.js";
import { LIENS } from "../js/donnees/liens.js";
import { SOURCES_PORTRAITS } from "../js/donnees/portraits.js";
import { ouvrirBooster, ouvrirBoosterDepart } from "../js/moteur/boosters.js";
import { EDITIONS, PITIE_BOOSTER, CASES_BOOSTER, CARTES_PAR_BOOSTER } from "../js/donnees/boosters.js";
import { creerHasard } from "../js/moteur/hasard.js";
import { STYLES_SERIES } from "../js/donnees/series.js";
import { creerCombat, avancer } from "../js/moteur/simulation.js";
import { appliquerEffet } from "../js/moteur/regles.js";

let erreurs = 0;
const verifier = (condition, message) => {
  console.log(`${condition ? "OK    " : "ECHEC "} ${message}`);
  if (!condition) erreurs++;
};

const equipe = ["ronflex", "luffy", "zoro", "sakura", "pikachu"].map((id) => ({ id, niveau: 20 }));
const a = simulerCombat({ equipeA: equipe, equipeB: equipe, graine: 42 });
const b = simulerCombat({ equipeA: equipe, equipeB: equipe, graine: 42 });
verifier(JSON.stringify(a.journal) === JSON.stringify(b.journal), "le combat est reproductible (meme graine, meme resultat)");
verifier(PERSOS.length === 160, `160 persos jouables (${PERSOS.length})`);
verifier(new Set(PERSOS.map((p) => p.id)).size === PERSOS.length && PERSOS.every((p) => /^[a-z][a-z0-9]*$/.test(p.id)), "ids de persos uniques et simples (alias AniList)");
verifier(PERSOS.every((p) => SOURCES_PORTRAITS[p.id]), "chaque perso a une source de portrait");
verifier(OBJETS.length === 120 && new Set(OBJETS.map((o) => o.id)).size === 120, `120 objets aux ids uniques (${OBJETS.length})`);
verifier(OBJETS.every((o) => !o.panoplie || PANOPLIES[o.panoplie]), "chaque objet de panoplie a sa panoplie");
verifier(TOUTES_LES_ETAPES.length === 40, "40 etapes de campagne");
verifier([1, 10, 50, 100].every((n) => etageTour(n).equipe.length === 5), "les etages de la Tour ont 5 ennemis");
verifier(new Set(TAMPONS.map((t) => t.id)).size === TAMPONS.length, `tampons aux ids uniques (${TAMPONS.length})`);
verifier(LIENS.every((l) => PERSOS.find((p) => p.id === l.a).serie !== PERSOS.find((p) => p.id === l.b).serie), "les 20 liens relient des series differentes");

// Une brulure de N secondes fait N tics de degats, meme posee pile sur un tic de seconde
const ticsDeBrulure = (poseAuTic, secondes) => {
  const etat = creerCombat({ equipeA: equipe, equipeB: equipe, graine: 7 });
  while (etat.t < poseAuTic) avancer(etat);
  const cible = etat.equipes[1][0];
  appliquerEffet(etat, cible, "brulure", secondes, etat.equipes[0][0]);
  let tics = 0;
  while (cible.effets.some((e) => e.type === "brulure")) {
    for (const ev of avancer(etat)) if (ev.type === "perte" && ev.cible === cible.uid && ev.origine === "Brûlure") tics++;
    if (etat.fini) break;
  }
  return tics;
};
verifier(ticsDeBrulure(20, 1) === 1 && ticsDeBrulure(23, 1) === 1 && ticsDeBrulure(20, 4) === 4, "une brulure de N s fait N tics de degats");

// Boosters : 5 cartes de l'edition, reproductibles, et Legendaire garanti par la pitie
const hb = creerHasard(3);
verifier(EDITIONS.every((e) => { const r = ouvrirBooster(hb.nombre, e.id); return r.cartes.length === CARTES_PAR_BOOSTER && r.cartes.every((c) => e.series.includes(PERSOS.find((p) => p.id === c.id).serie)); }), "chaque booster donne ses cartes, toutes de son edition");
verifier(ouvrirBooster(creerHasard(9).nombre, "shonen", { pitie: PITIE_BOOSTER - 1 }).cartes.some((c) => c.rarete === "legendaire"), "la pitie garantit un Legendaire au 20e booster");
verifier(PERSOS.every((p) => EDITIONS.some((e) => e.series.includes(p.serie)) && STYLES_SERIES[p.serie]), "chaque perso est dans une edition et sa serie a un style de carte");

verifier([1, 2, 3, 4, 5].every((g) => { const c = ouvrirBoosterDepart(creerHasard(g).nombre).cartes; return c.length === 5 && new Set(c.map((x) => PERSOS.find((p) => p.id === x.id).role)).size === 5 && c.filter((x) => x.rarete === "rare").length === 1; }), "le booster de depart donne 5 persos, un par role, dont un Rare");
// Chaque perso peut sortir d'un booster : son edition a des cases qui tirent sa rarete
const raretesTirables = new Set(CASES_BOOSTER.flatMap((c) => Object.keys(c)));
verifier(PERSOS.every((p) => raretesTirables.has(p.rarete) && EDITIONS.some((e) => e.series.includes(p.serie))), "les 160 persos peuvent sortir d'un booster");

console.log(erreurs ? `\n${erreurs} verification(s) en echec.` : "\nTout est bon.");
process.exit(erreurs ? 1 : 0);
