// ==========================================================
// LA TOUR DES MILLE VOLUMES
// Des etages sans fin. Chaque etage est un volume ; un boss
// tous les 10 etages. Chaque semaine, un arc change les regles.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "./persos.js";
import { creerHasard } from "../moteur/hasard.js";

export const ARCS = [
  { id: "tournoi", nom: "Arc du tournoi", regle: "Critiques +50 % pour tout le monde", mods: { critMult: 1.5 } },
  { id: "survie", nom: "Arc de la survie", regle: "Soins réduits de moitié", mods: { soinsMult: 0.5 } },
  { id: "flashback", nom: "Arc du flashback", regle: "Tout le monde commence avec 50 d'énergie", mods: { energieDepart: 50 } },
  { id: "rival", nom: "Arc du rival", regle: "Ennemis +20 % d'ATQ, coffre de la semaine x1,5", mods: { atqEnnemis: 1.2 }, coffre: 1.5 },
  { id: "entrainement", nom: "Arc de l'entraînement", regle: "Expérience x2 dans la Tour", mods: {}, xp: 2 },
  { id: "ombres", nom: "Arc des ombres", regle: "10 % d'esquive pour tout le monde", mods: { esquive: 0.1 } },
];

// Les semaines commencent le lundi (heure locale)
const LUNDI_DE_REFERENCE = new Date(2024, 0, 1).getTime();   // le 1er janvier 2024 etait un lundi
const SEMAINE = 7 * 24 * 3600 * 1000;
export const numeroSemaine = (maintenant = Date.now()) => Math.floor((maintenant - LUNDI_DE_REFERENCE) / SEMAINE);
export const arcDeLaSemaine = (maintenant = Date.now()) => ARCS[numeroSemaine(maintenant) % ARCS.length];
export const finDeSemaine = (maintenant = Date.now()) => LUNDI_DE_REFERENCE + (numeroSemaine(maintenant) + 1) * SEMAINE;

export const estBoss = (n) => n % 10 === 0;

// Composition d'un etage : toujours la meme pour un etage donne
export function etageTour(n) {
  const h = creerHasard(n * 7919 + 13);
  const boss = estBoss(n);
  const pioche = (liste) => liste.splice(Math.floor(h.nombre() * liste.length), 1)[0].id;
  let equipe;
  if (boss) {
    // Les boss reunissent les plus grandes figures ; la Rature garde les etages multiples de 50
    const forts = PERSOS.filter((p) => ["legendaire", "epique"].includes(p.rarete));
    const devant = PERSOS.filter((p) => p.role === "tank");
    equipe = [n % 50 === 0 ? "rature" : pioche(devant), pioche(devant), pioche(forts), pioche(forts), pioche(forts)];
  } else {
    const devant = PERSOS.filter((p) => p.role === "tank" || p.role === "attaquant");
    const autres = PERSOS.filter((p) => p.role !== "tank");
    const a = pioche(devant);
    const b = pioche(devant.filter((p) => p.id !== a));
    const reste = autres.filter((p) => p.id !== a && p.id !== b);
    equipe = [a, b, pioche(reste), pioche(reste), pioche(reste)];
  }
  const niveau = Math.min(6 + n, 60);   // le boss est deja plus fort par sa composition
  // Au-dela de 50 : croissance lineaire (2,5 % par etage). Une equipe au maximum
  // (eveil IV, panoplie +12) plafonne vers l'etage 145 ; l'ancienne courbe
  // exponentielle bloquait tout le monde vers 90.
  const profondeur = n > 50 ? 1 + 0.025 * (n - 50) : 1;
  return {
    etage: n,
    boss,
    nom: boss ? `Gardien du volume ${n}` : `Volume ${n}`,
    equipe,
    niveau,
    multiplicateur: 0.85 * profondeur,
    decor: ["terrain", "forteresse", "toits", "domaine", "brasier"][Math.floor((n - 1) / 10) % 5],
  };
}

// ---------- Recompenses ----------
export const eclatsEtage = (n, premiere) => (premiere ? 10 + 2 * n : Math.ceil((10 + 2 * n) / 4));
export const encreEtage = (n) => (n % 5 === 0 ? 40 + 2 * n : 0);                 // premiere victoire seulement
export const fragmentsEtage = (n) => (estBoss(n) ? 1 + Math.floor(n / 20) : 0);  // premiere victoire seulement
export const CHANCE_ENCRE_SACREE = 0.15;                                          // boss des etages 30 et plus
export const xpTour = (etage, victoire, arc) => Math.round((victoire ? 8 + 1.5 * etage.niveau : 4) * (arc.xp ?? 1));

// Coffre de la semaine : selon le nombre d'etages franchis cette semaine
export const COFFRES_SEMAINE = [
  { etages: 10, encre: 100, fragments: 2, encreSacree: 0 },
  { etages: 25, encre: 200, fragments: 5, encreSacree: 0 },
  { etages: 50, encre: 400, fragments: 10, encreSacree: 1 },
];
