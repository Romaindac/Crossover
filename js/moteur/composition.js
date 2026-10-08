// ==========================================================
// COMPOSITION AUTOMATIQUE D'UNE EQUIPE
// composerEquipe : utilisee par le simulateur, le boss et les expeditions.
// chercherEquipeConseillee : le bouton « Équipe conseillée ».
// Regle simple et lisible : le meilleur tank, le meilleur soutien,
// puis les persos les plus forts ; les tanks et attaquants devant.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { facteurProgression } from "./stats.js";
import { simulerCombat } from "./simulation.js";

// collection : { id: { niveau, etoiles, ... } }
export function scorePerso(id, prog) {
  return facteurProgression(PERSOS_PAR_ID[id], prog);
}

export function composerEquipe(collection) {
  const role = (id) => PERSOS_PAR_ID[id].role;
  const ids = Object.keys(collection).sort((a, b) => scorePerso(b, collection[b]) - scorePerso(a, collection[a]));
  const choisis = [];
  const prendre = (filtre) => {
    const id = ids.find((i) => !choisis.includes(i) && filtre(i));
    if (id) choisis.push(id);
  };
  prendre((i) => role(i) === "tank");
  prendre((i) => role(i) === "soutien");
  while (choisis.length < Math.min(5, ids.length)) prendre(() => true);

  // Devant : les tanks d'abord, puis les attaquants, puis le reste
  const ordreDevant = ["tank", "attaquant", "controle", "soutien", "assassin"];
  const avant = [...choisis].sort((a, b) => ordreDevant.indexOf(role(a)) - ordreDevant.indexOf(role(b))).slice(0, 2);
  const arriere = choisis.filter((i) => !avant.includes(i));
  return [...avant, ...arriere, null, null, null, null, null].slice(0, 5);
}

// ---------- Equipe conseillee (bouton de l'ecran Equipe) ----------
// Part de composerEquipe, puis essaie des echanges avec les persos les plus
// forts de la collection et tous les placements utiles, en notant chaque essai
// par des combats simules contre l'adversaire vise (graines fixes : resultat stable).
// C'est un generateur : l'ecran le fait avancer par petits morceaux sans figer.
// entree(id, equipe) : l'entree de combat d'un perso (niveau, equipement...).

const GRAINES_CONSEIL = 8;

// Note d'une equipe : 1 par victoire ; une defaite compte un peu selon les PV
// ennemis entames, pour savoir quelle equipe s'approche le plus de la victoire.
function noter(equipe, adversaire, entree) {
  const entrees = equipe.map((id) => entree(id, equipe));
  let note = 0;
  for (let g = 1; g <= GRAINES_CONSEIL; g++) {
    const r = simulerCombat({
      equipeA: entrees, equipeB: adversaire.equipe, niveauB: adversaire.niveau,
      multiplicateurB: adversaire.multiplicateur, graine: g * 104729, journal: false,
    });
    if (r.vainqueur === 0) note += 1;
    else {
      const ennemis = r.unites.filter((u) => u.camp === 1);
      const entame = 1 - ennemis.reduce((t, u) => t + u.pv, 0) / ennemis.reduce((t, u) => t + u.pvMax, 0);
      note += 0.9 * entame;
    }
  }
  return note / GRAINES_CONSEIL;
}

// Les 120 rangements utiles : quels 2 persos devant, puis l'ordre dans chaque ligne
function rangements(cinq) {
  const resultats = [];
  const permuter = (liste) => (liste.length <= 1 ? [liste] : liste.flatMap((x, i) => permuter([...liste.slice(0, i), ...liste.slice(i + 1)]).map((p) => [x, ...p])));
  for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) {
    const devant = [cinq[a], cinq[b]];
    const derriere = cinq.filter((_, i) => i !== a && i !== b);
    for (const d of permuter(devant)) for (const r of permuter(derriere)) resultats.push([...d, ...r]);
  }
  return resultats;
}

export function* chercherEquipeConseillee(collection, adversaire, entree) {
  let meilleure = composerEquipe(collection).filter(Boolean);
  if (meilleure.length < 5) return { equipe: composerEquipe(collection) };
  let note = noter(meilleure, adversaire, entree);
  const candidats = Object.keys(collection)
    .sort((a, b) => scorePerso(b, collection[b]) - scorePerso(a, collection[a]))
    .slice(0, 12);

  // 1. Echanges : un perso de l'equipe contre un candidat, tant que ca s'ameliore
  for (let passe = 0; passe < 2; passe++) {
    let progres = false;
    for (let i = 0; i < 5; i++) {
      for (const c of candidats) {
        if (meilleure.includes(c)) continue;
        const essai = [...meilleure];
        essai[i] = c;
        const n = noter(essai, adversaire, entree);
        if (n > note) { meilleure = essai; note = n; progres = true; }
        yield;
      }
    }
    if (!progres || note >= 1) break;
  }

  // 2. Placement : le meilleur des 120 rangements
  for (const essai of rangements(meilleure)) {
    const n = noter(essai, adversaire, entree);
    if (n > note) { meilleure = essai; note = n; }
    yield;
  }
  return { equipe: meilleure };
}
