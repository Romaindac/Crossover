// ==========================================================
// SIMULATEUR DE PROGRESSION
// Simule un joueur qui enchaine les combats et les tirages,
// pour verifier le rythme de l'economie : quand atteint-on
// chaque palier, combien de persos a-t-on apres 1 h, 3 h... ?
// Il utilise exactement les memes regles que le jeu.
// ==========================================================

import { PALIERS } from "../donnees/ennemis.js";
import {
  PERSOS_DE_DEPART, ENCRE_DE_DEPART, COUT_TIRAGE_X10, xpCombat, encreCombat, PART_XP_RESERVE,
  EXPEDITION_COMBATS_PAR_HEURE, EXPEDITION_HEURES_MAX,
} from "../donnees/progression.js";
import { simulerCombat } from "../moteur/simulation.js";
import { tirerSerie } from "../moteur/gacha.js";
import { creerHasard } from "../moteur/hasard.js";
import { nouvelleProgression, ajouterXp, ajouterDoublon } from "../moteur/progression.js";
import { composerEquipe } from "../moteur/composition.js";

// Temps passe par combat (en secondes) : regarde en vitesse x2, plus 10 s de menus
export const tempsCombat = (duree) => duree / 2 + 10;

// Un joueur virtuel et ses actions possibles
function creerJoueur(graine, heros) {
  const h = creerHasard(graine);
  const j = {
    collection: {},
    encre: ENCRE_DE_DEPART,
    pitie: 0,
    battus: new Set(),
    echecs: 0,
    farm: 0,
    combats: 0,
  };
  for (const id of [...PERSOS_DE_DEPART, heros]) j.collection[id] = nouvelleProgression();
  j.meilleur = () => (j.battus.size ? Math.max(...j.battus) : 0);

  j.donnerXp = (equipe, gain) => {
    for (const id of Object.keys(j.collection)) {
      ajouterXp(j.collection[id], equipe.includes(id) ? gain : Math.round(gain * PART_XP_RESERVE));
    }
  };

  j.tirer = () => {
    while (j.encre >= COUT_TIRAGE_X10) {
      j.encre -= COUT_TIRAGE_X10;
      const r = tirerSerie(h.nombre, 10, j.pitie);
      j.pitie = r.pitie;
      for (const t of r.tirages) {
        if (!j.collection[t.id]) j.collection[t.id] = nouvelleProgression();
        else j.encre += ajouterDoublon(j.collection[t.id]).encreRendue;
      }
    }
  };

  // Joue un combat et renvoie sa duree en secondes (menus compris)
  j.combattre = () => {
    const cible = j.farm > 0 ? Math.max(1, j.meilleur()) : Math.min(PALIERS.length, j.meilleur() + 1);
    const pal = PALIERS[cible - 1];
    const equipe = composerEquipe(j.collection);
    const r = simulerCombat({
      equipeA: equipe.map((id) => ({ id, ...j.collection[id] })),
      equipeB: pal.equipe, niveauB: pal.niveau, multiplicateurB: pal.multiplicateur,
      graine: Math.floor(h.nombre() * 2147483647), journal: false,
    });
    const victoire = r.vainqueur === 0;
    j.combats++;
    const premiere = victoire && !j.battus.has(cible);
    j.encre += encreCombat(cible, victoire, premiere);
    j.donnerXp(equipe, xpCombat(cible, victoire));
    if (premiere) {
      j.battus.add(cible);
      j.echecs = 0;
    }
    if (j.farm > 0) j.farm--;
    else if (!victoire && ++j.echecs >= 2 && j.battus.size) {
      j.farm = 6; // apres 2 defaites, on s'entraine sur le palier precedent
      j.echecs = 0;
    }
    j.tirer();
    return { secondes: tempsCombat(r.duree), premiere, palier: cible };
  };

  // L'expedition pendant une absence
  j.expedition = (heures) => {
    const palier = j.meilleur();
    if (!palier) return;
    const combats = Math.floor(Math.min(heures, EXPEDITION_HEURES_MAX) * EXPEDITION_COMBATS_PAR_HEURE);
    j.encre += combats * encreCombat(palier, true, false);
    j.donnerXp(composerEquipe(j.collection), combats * xpCombat(palier, true));
    j.tirer();
  };

  j.tirer();
  return j;
}

// Un joueur qui joue d'une traite, sans pause
export function simulerJoueur({ graine = 1, heros = "naruto", heuresMax = 8 } = {}) {
  const j = creerJoueur(graine, heros);
  let temps = 0;
  let prochainBilan = 3600;
  const jalons = {};
  const bilans = [];
  while (temps < heuresMax * 3600 && j.battus.size < PALIERS.length) {
    const r = j.combattre();
    temps += r.secondes;
    if (r.premiere) jalons[r.palier] = temps / 60;
    while (temps >= prochainBilan) {
      bilans.push({ heure: prochainBilan / 3600, collection: Object.keys(j.collection).length, palier: j.meilleur() });
      prochainBilan += 3600;
    }
  }
  return { jalons, bilans, combats: j.combats, minutes: temps / 60, collection: Object.keys(j.collection).length };
}

// Un joueur qui joue un peu chaque jour et laisse l'expedition tourner le reste du temps
export function simulerJours({ graine = 1, heros = "naruto", minutesParJour = 45, jours = 30 } = {}) {
  const j = creerJoueur(graine, heros);
  const jalons = {};
  const bilans = [];
  for (let jour = 1; jour <= jours && j.battus.size < PALIERS.length; jour++) {
    if (jour > 1) j.expedition(24 - minutesParJour / 60);
    let temps = 0;
    while (temps < minutesParJour * 60 && j.battus.size < PALIERS.length) {
      const r = j.combattre();
      temps += r.secondes;
      if (r.premiere) jalons[r.palier] = jour;
    }
    bilans.push({ jour, collection: Object.keys(j.collection).length, palier: j.meilleur() });
  }
  return { jalons, bilans, collection: Object.keys(j.collection).length };
}

// Mediane d'une liste de nombres
export const mediane = (liste) => {
  const triee = [...liste].sort((a, b) => a - b);
  return triee.length ? triee[Math.floor(triee.length / 2)] : null;
};
