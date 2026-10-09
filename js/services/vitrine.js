// ==========================================================
// VITRINE : les plus belles cartes du joueur, a montrer
// Elle se partage par un simple lien (tout est dans l'adresse),
// donc elle marche meme sans serveur.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { ORDRE_RARETES_PERSOS } from "../donnees/raretes.js";
import { idsPossedes, progressionDe, resumeJoueur } from "./partie.js";
import { lire, ecrire } from "./sauvegarde.js";

export const TAILLE_VITRINE = 6;
const CLE = "vitrine";

const varianteDe = (prog) => ["boss", "neant", "arcenciel", "doree", "holo"].find((v) => prog.variantes?.includes(v)) ?? null;

// Note d'une carte pour le choix automatique : rarete, variante, etoiles, niveau
function note(id) {
  const prog = progressionDe(id);
  const v = varianteDe(prog);
  return (ORDRE_RARETES_PERSOS.length - ORDRE_RARETES_PERSOS.indexOf(PERSOS_PAR_ID[id].rarete)) * 1000 + ({ boss: 950, neant: 900, arcenciel: 800, doree: 600, holo: 300 }[v] ?? 0)
    + (prog.etoiles ?? 1) * 40 + (prog.niveau ?? 1);
}

export const meilleuresCartes = () => idsPossedes().filter((id) => PERSOS_PAR_ID[id]).sort((a, b) => note(b) - note(a));

// Les cartes choisies (ou les meilleures si le joueur n'a rien choisi)
export function idsVitrine() {
  const possedes = new Set(idsPossedes());
  const choisis = (lire(CLE, null) ?? []).filter((id) => possedes.has(id) && PERSOS_PAR_ID[id]);
  return choisis.length ? choisis.slice(0, TAILLE_VITRINE) : meilleuresCartes().slice(0, TAILLE_VITRINE);
}

export function basculerVitrine(id) {
  const liste = idsVitrine();
  const i = liste.indexOf(id);
  if (i >= 0) liste.splice(i, 1);
  else if (liste.length < TAILLE_VITRINE) liste.push(id);
  else return false;
  ecrire(CLE, liste);
  return true;
}

// La vitrine sous forme compacte, pour le serveur ou le lien
export const vitrineCompacte = () => idsVitrine().map((id) => {
  const p = progressionDe(id);
  return { id, n: p.niveau ?? 1, e: p.etoiles ?? 1, v: varianteDe(p) };
});

export function lienVitrine(pseudo) {
  const contenu = { p: pseudo || "Un joueur", c: vitrineCompacte(), s: resumeJoueur() };
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(contenu)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${location.origin}${location.pathname}#vitrine=${code}`;
}

// Lit une vitrine depuis l'adresse ; null si elle est absente ou abimee
export function vitrineDuLien(hash = location.hash) {
  const m = /#vitrine=([A-Za-z0-9_-]+)/.exec(hash);
  if (!m) return null;
  try {
    const brut = m[1].replace(/-/g, "+").replace(/_/g, "/");
    const c = JSON.parse(decodeURIComponent(escape(atob(brut + "=".repeat((4 - brut.length % 4) % 4)))));
    return {
      pseudo: String(c.p ?? "Un joueur").slice(0, 20),
      cartes: (Array.isArray(c.c) ? c.c : []).filter((x) => PERSOS_PAR_ID[x?.id]).slice(0, TAILLE_VITRINE),
      resume: Object.fromEntries(["collection", "etoiles", "tour", "raid", "boss_semaine", "semaine"]
        .map((k) => [k, Math.max(0, Math.floor(Number(c.s?.[k]) || 0))])),
    };
  } catch {
    return null;
  }
}
