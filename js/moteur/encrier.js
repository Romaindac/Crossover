// ==========================================================
// L'ENCRIER (logique pure, sans affichage)
// Carte a embranchements, offres de recrues, ennemis, reliques,
// evenements. Tout est tire avec la graine de la partie et une cle
// (« carte-2 », « recrue-a1r3c2 »...) : meme partie = memes tirages,
// et recharger la page ne change rien.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES } from "../donnees/raretes.js";
import {
  ACTES, RANGS_PAR_ACTE, COLONNES, NIVEAU_PERSOS, POIDS_CASES, RARETES_RECRUES,
  multEnnemis, tailleEnnemis, RELIQUES, RELIQUES_PAR_ID, EVENEMENTS,
} from "../donnees/encrier.js";
import { creerHasard } from "./hasard.js";
import { composerEquipe } from "./composition.js";

// Un hasard propre a (graine, cle)
export function hasardDe(graine, cle) {
  let h = 2166136261 ^ (graine >>> 0);
  for (let i = 0; i < cle.length; i++) h = Math.imul(h ^ cle.charCodeAt(i), 16777619);
  return creerHasard(h >>> 0);
}

const tirerPondere = (h, poids) => {
  const total = Object.values(poids).reduce((a, b) => a + b, 0);
  let x = h.nombre() * total;
  for (const [k, v] of Object.entries(poids)) { x -= v; if (x < 0) return k; }
  return Object.keys(poids)[0];
};

// ---------- La carte d'un acte ----------
// rangs[r] : les cases du rang r (0 a RANGS_PAR_ACTE - 1). Chaque case : { id, col, type, liens }
// liens : les ids des cases du rang suivant qu'on peut atteindre.
// Rang 1 : combats ; rang 4 : tresors ; rang 7 : repos ; rang 8 : le boss.
export function genererCarte(graine, acte) {
  const h = hasardDe(graine, `carte-${acte}`);
  const rangs = [];
  for (let r = 0; r < RANGS_PAR_ACTE; r++) {
    let cols;
    if (r === RANGS_PAR_ACTE - 1) cols = [Math.floor((COLONNES - 1) / 2)];
    else {
      const n = r === 0 ? 3 : 2 + Math.floor(h.nombre() * (COLONNES - 1));   // 2 a 4 cases
      const toutes = [...Array(COLONNES).keys()];
      cols = [];
      while (cols.length < n) cols.push(toutes.splice(Math.floor(h.nombre() * toutes.length), 1)[0]);
      cols.sort((a, b) => a - b);
    }
    rangs.push(cols.map((col) => {
      let type;
      if (r === RANGS_PAR_ACTE - 1) type = "boss";
      else if (r === 0) type = "combat";
      else if (r === 3) type = "tresor";
      else if (r === RANGS_PAR_ACTE - 2) type = "repos";
      else {
        const poids = { ...POIDS_CASES };
        if (r < 2) delete poids.elite;   // pas d'elite tout de suite
        type = tirerPondere(h, poids);
      }
      return { id: `a${acte}r${r}c${col}`, col, type, rang: r, liens: [] };
    }));
  }
  // Les liens : vers les cases voisines (meme colonne ou a cote) du rang suivant ;
  // chaque case du rang suivant est atteignable, chaque case mene quelque part.
  for (let r = 0; r < RANGS_PAR_ACTE - 1; r++) {
    const ici = rangs[r];
    const suivant = rangs[r + 1];
    for (const c of ici) {
      const proches = suivant.filter((s) => Math.abs(s.col - c.col) <= 1);
      const cibles = proches.length ? proches : [suivant.reduce((a, b) => (Math.abs(b.col - c.col) < Math.abs(a.col - c.col) ? b : a))];
      c.liens = cibles.map((s) => s.id);
    }
    for (const s of suivant) {
      if (!ici.some((c) => c.liens.includes(s.id))) {
        const proche = ici.reduce((a, b) => (Math.abs(b.col - s.col) < Math.abs(a.col - s.col) ? b : a));
        proche.liens.push(s.id);
      }
    }
  }
  return { acte, rangs };
}

export const caseDe = (carte, id) => carte.rangs.flat().find((c) => c.id === id) ?? null;
export const rangGlobal = (acte, rang) => (acte - 1) * RANGS_PAR_ACTE + rang;

// ---------- Les persos proposes ----------
// niveauTable : 0 a 3 (acte - 1, +1 apres une elite) ; minRarete : rarete minimale (evenements)
// garantir : roles a inclure au moins une fois (le draft de depart)
export function offrePersos(graine, cle, nombre, niveauTable, { exclure = [], minRarete = null, garantir = [] } = {}) {
  const h = hasardDe(graine, `persos-${cle}`);
  const table = { ...RARETES_RECRUES[Math.max(0, Math.min(RARETES_RECRUES.length - 1, niveauTable))] };
  if (minRarete) for (const r of Object.keys(table)) if (RARETES[r].ordre < RARETES[minRarete].ordre) delete table[r];
  const choisis = [];
  const libre = (p) => !exclure.includes(p.id) && !choisis.includes(p.id);
  const piocher = (filtre) => {
    for (let essai = 0; essai < 30; essai++) {
      const rarete = tirerPondere(h, table);
      const pool = PERSOS.filter((p) => p.rarete === rarete && libre(p) && filtre(p));
      if (pool.length) return pool[Math.floor(h.nombre() * pool.length)].id;
    }
    const pool = PERSOS.filter((p) => libre(p) && filtre(p));
    return pool.length ? pool[Math.floor(h.nombre() * pool.length)].id : null;
  };
  for (const role of garantir) { const id = piocher((p) => p.role === role); if (id) choisis.push(id); }
  while (choisis.length < nombre) { const id = piocher(() => true); if (!id) break; choisis.push(id); }
  // melange (les roles garantis ne sont pas toujours en premier)
  for (let i = choisis.length - 1; i > 0; i--) { const j = Math.floor(h.nombre() * (i + 1)); [choisis[i], choisis[j]] = [choisis[j], choisis[i]]; }
  return choisis;
}

// ---------- Les ennemis d'une case ----------
export function adversaireCase(graine, acte, rang, type, caseId, ennemis = 1) {
  const h = hasardDe(graine, `ennemis-${caseId}`);
  const taille = tailleEnnemis(acte, rang + 1, type);
  const choisis = [];
  if (type === "boss") {
    // le chef : un Legendaire
    const leg = PERSOS.filter((p) => p.rarete === "legendaire");
    choisis.push(leg[Math.floor(h.nombre() * leg.length)].id);
  }
  while (choisis.length < taille) {
    const p = PERSOS[Math.floor(h.nombre() * PERSOS.length)];
    if (!choisis.includes(p.id)) choisis.push(p.id);
  }
  const equipe = composerEquipe(Object.fromEntries(choisis.map((id) => [id, { niveau: NIVEAU_PERSOS, etoiles: 1 }]))).filter(Boolean);
  return { equipe, niveau: NIVEAU_PERSOS, multiplicateur: multEnnemis(rangGlobal(acte, rang), type) * ennemis, chef: type === "boss" ? choisis[0] : null };
}

// ---------- Reliques ----------
export function tirerReliques(graine, cle, nombre, rangs, exclure = []) {
  const h = hasardDe(graine, `reliques-${cle}`);
  const pool = RELIQUES.filter((r) => rangs.includes(r.rang) && !exclure.includes(r.id));
  const choix = [];
  while (choix.length < nombre && pool.length) choix.push(pool.splice(Math.floor(h.nombre() * pool.length), 1)[0].id);
  return choix;
}

// Les effets cumules des reliques d'une partie
export function effetsReliques(ids = [], malusEnnemis = 1) {
  const e = { pct: 0, energieDepart: 0, stats: {}, ennemis: malusEnnemis, orPct: 0, soinApresCombat: 0, recruesEnPlus: 0, remise: 0, soinRepos: 0, pvApresKo: 0 };
  for (const id of ids) {
    const r = RELIQUES_PAR_ID[id];
    if (!r) continue;
    e.pct += r.pct ?? 0;
    e.energieDepart += r.energieDepart ?? 0;
    e.ennemis *= r.ennemis ?? 1;
    e.orPct += r.orPct ?? 0;
    e.soinApresCombat += r.soinApresCombat ?? 0;
    e.recruesEnPlus += r.recruesEnPlus ?? 0;
    e.remise = Math.max(e.remise, r.remise ?? 0);
    e.soinRepos = Math.max(e.soinRepos, r.soinRepos ?? 0);
    e.pvApresKo = Math.max(e.pvApresKo, r.pvApresKo ?? 0);
    for (const [k, v] of Object.entries(r.stats ?? {})) e.stats[k] = typeof v === "boolean" ? true : (e.stats[k] ?? 0) + v;
  }
  return e;
}

// ---------- Evenements ----------
export function tirerEvenement(graine, caseId, deja = []) {
  const h = hasardDe(graine, `evenement-${caseId}`);
  const pool = EVENEMENTS.filter((e) => !deja.includes(e.id));
  const liste = pool.length ? pool : EVENEMENTS;
  return liste[Math.floor(h.nombre() * liste.length)].id;
}

export const reussite = (graine, cle, p) => hasardDe(graine, `chance-${cle}`).nombre() < p;

// ---------- L'equipe de combat ----------
// terrain : ids (jusqu'a 5) ; persos : { id: { etoiles, pv } } (pv : part de 0 a 1)
// Le placement est automatique (tanks devant) ; les KO restent a leur place, a 0 PV.
export function equipeDeCombat(terrain, persos, pct = 0) {
  const ordre = composerEquipe(Object.fromEntries(terrain.map((id) => [id, { niveau: NIVEAU_PERSOS, etoiles: persos[id]?.etoiles ?? 1 }]))).filter(Boolean);
  return ordre.map((id) => ({ id, niveau: NIVEAU_PERSOS, etoiles: persos[id]?.etoiles ?? 1, pvPart: persos[id]?.pv ?? 1, bonusPct: pct }));
}

export const NOMBRE_ACTES = ACTES;
export const persoExiste = (id) => Boolean(PERSOS_PAR_ID[id]) && PERSOS.some((p) => p.id === id);
