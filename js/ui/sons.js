// ==========================================================
// SONS : petits effets synthetises (Web Audio), sans fichier
// Dechirure du sachet, carte qui se retourne, carillon selon la
// rarete, nouveau perso, serie complete. Coupe-les dans les Reglages.
// ==========================================================

import { reglage } from "../services/reglages.js";

let contexte = null;

function ctx() {
  if (!reglage("sons")) return null;
  try {
    contexte ??= new (window.AudioContext || window.webkitAudioContext)();
    if (contexte.state === "suspended") contexte.resume();
    return contexte;
  } catch {
    return null;
  }
}

// Une note : frequence, debut (s), duree (s), volume, forme d'onde
function note(c, frequence, debut, duree, volume = 0.18, forme = "triangle") {
  const t = c.currentTime + debut;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = forme;
  o.frequency.setValueAtTime(frequence, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + duree + 0.05);
}

// Un souffle de bruit filtre (dechirure, retournement)
function bruit(c, debut, duree, { volume = 0.25, de = 1800, a = 600, q = 0.8 } = {}) {
  const t = c.currentTime + debut;
  const taille = Math.floor(c.sampleRate * duree);
  const tampon = c.createBuffer(1, taille, c.sampleRate);
  const donnees = tampon.getChannelData(0);
  for (let i = 0; i < taille; i++) donnees[i] = (Math.random() * 2 - 1) * (1 - i / taille);
  const source = c.createBufferSource();
  source.buffer = tampon;
  const filtre = c.createBiquadFilter();
  filtre.type = "bandpass";
  filtre.Q.value = q;
  filtre.frequency.setValueAtTime(de, t);
  filtre.frequency.exponentialRampToValueAtTime(a, t + duree);
  const g = c.createGain();
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  source.connect(filtre).connect(g).connect(c.destination);
  source.start(t);
}

export function sonDechirure() {
  const c = ctx(); if (!c) return;
  bruit(c, 0, 0.32, { volume: 0.35, de: 4200, a: 900, q: 0.6 });
  bruit(c, 0.05, 0.22, { volume: 0.2, de: 2500, a: 1200, q: 2 });
}

export function sonCarte() {
  const c = ctx(); if (!c) return;
  bruit(c, 0, 0.12, { volume: 0.12, de: 2600, a: 1400, q: 1.2 });
}

// Une montee de tension avant une grosse carte
export function sonSuspense() {
  const c = ctx(); if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(440, t + 0.8);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.9);
}

const GAMMES = {
  commun: [523],
  peu_commun: [523, 659],
  rare: [523, 659, 784],
  epique: [523, 659, 784, 1047],
  legendaire: [523, 659, 784, 1047, 1319, 1568],
  secret: [196, 233, 294, 392, 466, 587, 784, 932],
};

export function sonRarete(rarete) {
  const c = ctx(); if (!c) return;
  const gamme = GAMMES[rarete] ?? GAMMES.commun;
  const ecart = rarete === "legendaire" ? 0.07 : 0.06;
  gamme.forEach((f, i) => note(c, f, i * ecart, rarete === "commun" ? 0.12 : 0.35, rarete === "commun" ? 0.08 : 0.14));
  if (rarete === "secret") {
    // Un accord sombre qui monte, un coup de gong, puis une pluie claire
    note(c, 98, 0, 1.6, 0.18, "sawtooth");
    bruit(c, 0, 1.2, { volume: 0.12, de: 400, a: 120, q: 1 });
    [1175, 1397, 1760, 2349].forEach((f, i) => note(c, f, 0.7 + i * 0.09, 1.4, 0.06, "sine"));
    return;
  }
  if (rarete === "legendaire") {
    [1047, 1319, 1568, 2093].forEach((f) => note(c, f, gamme.length * ecart, 1.2, 0.07, "sine"));
    bruit(c, 0, 0.6, { volume: 0.08, de: 6000, a: 3000, q: 0.5 });
  }
}

export function sonNouveau() {
  const c = ctx(); if (!c) return;
  note(c, 880, 0, 0.09, 0.08, "square");
  note(c, 1320, 0.07, 0.12, 0.07, "square");
}

export function sonComplete() {
  const c = ctx(); if (!c) return;
  [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => note(c, f, i * 0.09, 0.4, 0.12));
}
