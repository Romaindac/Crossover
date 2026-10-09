// ==========================================================
// SIMULATEUR DE LA V0.3
// Des joueurs virtuels qui jouent un peu chaque jour :
// campagne d'abord, chasse en boucle quand ils bloquent,
// equipement au mieux, ameliorations, tirages, expedition.
// Memes regles que le jeu, sans aucun affichage.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import {
  ENCRE_DE_DEPART, PART_XP_RESERVE,
  EXPEDITION_COMBATS_PAR_HEURE, EXPEDITION_HEURES_MAX,
} from "../donnees/progression.js";
import { TOUTES_LES_ETAPES, encreEtape, xpEtape, COFFRES } from "../donnees/campagne.js";
import { ZONES, tableButin, xpChasse, eclatsChasse, MULT_SOUS_ZONE } from "../donnees/zones.js";
import { OBJETS_PAR_ID } from "../donnees/objets.js";
import { ORDRE_EMPLACEMENTS, NIVEAU_MAX_PIECE } from "../donnees/equipement.js";
import { simulerCombat } from "../moteur/simulation.js";
import { ouvrirBooster, ouvrirBoosterDepart } from "../moteur/boosters.js";
import { EDITIONS, PRIX_BOOSTER, TICKETS_DEPART, TICKETS_CHAPITRE, STOCK_GRATUIT_MAX } from "../donnees/boosters.js";

const TICKETS_GRATUITS_PAR_JOUR = 2 * STOCK_GRATUIT_MAX;
import { creerHasard } from "../moteur/hasard.js";
import { nouvelleProgression, ajouterXp, ajouterDoublon } from "../moteur/progression.js";
import { invoquer } from "../moteur/invocations.js";
import { INVOCATIONS_DEPART, INVOCATIONS_VICTOIRE, INVOCATIONS_MAX, MONDES, NIVEAUX_AUTEL, CHANCE_PAR_NIVEAU } from "../donnees/invocations.js";
import { composerEquipe } from "../moteur/composition.js";
import { calculerStatsFinales } from "../moteur/stats.js";
import { creerPiece, tirerButin, objetAuHasard, scorePiece, coutAmelioration, bonusEquipement } from "../moteur/equipement.js";

const ECLATS_RECYCLAGE = { commun: 5, peu_commun: 10, rare: 20, epique: 40, legendaire: 80 };

// visitesAutel : combien de fois par jour le joueur vide sa reserve d'invocations (120 chacune)
export function simulerJoueurV03({ graine = 1, heros = "naruto", minutesParJour = 45, jours = 30, visitesAutel = 2 } = {}) {
  const h = creerHasard(graine);
  const j = {
    collection: {}, encre: ENCRE_DE_DEPART, pitie: 0, eclats: 0, tickets: TICKETS_DEPART, boosters: 0,
    pieces: [], uid: 1, battues: new Set(), bossChasse: new Set(), echecs: 0,
    invocations: INVOCATIONS_DEPART, totalInvocations: 0, pitieAutel: 0,
  };
  // Le booster de depart offert (heros n'est plus utilise : garde pour la compatibilite)
  for (const c of ouvrirBoosterDepart(h.nombre).cartes) j.collection[c.id] = nouvelleProgression();

  const jalons = {};           // chapitre termine -> jour
  const bilans = [];
  let jour = 0;

  // ---------- Actions de base ----------

  // Ouvre tous les boosters possibles (tickets d'abord, puis encre), en tournant entre les editions
  const tirer = () => {
    while (j.tickets > 0 || j.encre >= PRIX_BOOSTER) {
      if (j.tickets > 0) j.tickets -= 1;
      else j.encre -= PRIX_BOOSTER;
      const edition = EDITIONS[j.boosters++ % EDITIONS.length];
      const r = ouvrirBooster(h.nombre, edition.id, { pitie: j.pitie });
      j.pitie = r.pitie;
      for (const c of r.cartes) {
        if (!j.collection[c.id]) j.collection[c.id] = nouvelleProgression();
        else ajouterDoublon(j.collection[c.id]);   // au-dela de 5 etoiles : poussiere (non modelisee ici)
      }
    }
  };

  // Vide la reserve d'invocations, en tournant entre les autels ouverts (chance : niveau d'autel seulement)
  const invoquerTout = () => {
    const mondes = MONDES.filter((m) => m.chapitre === 0 || j.battues.has(m.chapitre * 8));
    while (j.invocations > 0) {
      j.invocations -= 1;
      let niveau = 0;
      while (niveau + 1 < NIVEAUX_AUTEL.length && j.totalInvocations >= NIVEAUX_AUTEL[niveau + 1].invocations) niveau += 1;
      const monde = mondes[j.totalInvocations++ % mondes.length];
      const r = invoquer(h.nombre, monde.edition, { chance: 1 + niveau * CHANCE_PAR_NIVEAU, pitie: j.pitieAutel });
      j.pitieAutel = r.pitie;
      if (!j.collection[r.id]) j.collection[r.id] = nouvelleProgression();
      else ajouterDoublon(j.collection[r.id]);
    }
  };

  const donnerXp = (equipe, gain) => {
    for (const id of Object.keys(j.collection)) {
      ajouterXp(j.collection[id], equipe.includes(id) ? gain : Math.round(gain * PART_XP_RESERVE));
    }
  };

  const ajouterObjets = (ids) => {
    for (const id of ids) j.pieces.push(creerPiece(h.nombre, id, `e${j.uid++}`));
    // inventaire limite : on recycle les Communes libres les plus anciennes
    while (j.pieces.length > 150) {
      const i = j.pieces.findIndex((p) => p.rarete === "commun" && !p.porteur);
      if (i === -1) break;
      j.eclats += ECLATS_RECYCLAGE.commun;
      j.pieces.splice(i, 1);
    }
  };

  const equipeActuelle = () => composerEquipe(j.collection);
  const piecesDe = (id) => j.pieces.filter((p) => p.porteur === id);
  const entree = (id) => ({ id, ...j.collection[id], equipement: piecesDe(id) });

  // Equiper au mieux, puis depenser les eclats sur les pieces portees les moins ameliorees
  const optimiser = (equipe) => {
    for (const id of equipe) {
      const perso = PERSOS_PAR_ID[id];
      const prog = j.collection[id];
      const base = calculerStatsFinales(perso, { niveau: prog.niveau, etoiles: prog.etoiles });
      for (const empl of ORDRE_EMPLACEMENTS) {
        const possibles = j.pieces.filter((p) => p.emplacement === empl && (!p.porteur || p.porteur === id)
          && prog.niveau >= OBJETS_PAR_ID[p.objet].niveau);
        if (!possibles.length) continue;
        const meilleure = possibles.reduce((a, b) => (scorePiece(b, perso.role, base) > scorePiece(a, perso.role, base) ? b : a));
        for (const p of possibles) if (p.porteur === id) p.porteur = null;
        meilleure.porteur = id;
      }
    }
    // Les pieces que plus personne ne porte et qui sont Communes partent au recyclage
    for (let i = j.pieces.length - 1; i >= 0; i--) {
      const p = j.pieces[i];
      if (!p.porteur && p.rarete === "commun" && p.niveau === 0 && j.pieces.length > 40) {
        j.eclats += ECLATS_RECYCLAGE.commun;
        j.pieces.splice(i, 1);
      }
    }
    let ameliore = true;
    while (ameliore) {
      ameliore = false;
      const portees = j.pieces.filter((p) => p.porteur && p.niveau < NIVEAU_MAX_PIECE).sort((a, b) => a.niveau - b.niveau);
      const cible = portees[0];
      if (cible && j.eclats >= coutAmelioration(cible.niveau)) {
        j.eclats -= coutAmelioration(cible.niveau);
        cible.niveau += 1;
        ameliore = true;
      }
    }
  };

  const combat = (equipe, adversaire) => simulerCombat({
    equipeA: equipe.map(entree),
    equipeB: adversaire.equipe, niveauB: adversaire.niveau, multiplicateurB: adversaire.multiplicateur,
    graine: Math.floor(h.nombre() * 2147483647), journal: false,
  });

  const meilleureEtape = () => [...TOUTES_LES_ETAPES].reverse().find((e) => j.battues.has(e.global)) ?? null;
  const prochaineEtape = () => TOUTES_LES_ETAPES.find((e) => !j.battues.has(e.global)) ?? null;
  const zoneOuverte = (z) => z === 1 || j.bossChasse.has(z - 1) || j.battues.has((z - 1) * 8);

  // ---------- Une etape de campagne (duree d'un combat x2 + 10 s de menus) ----------
  const jouerEtape = (et) => {
    const equipe = equipeActuelle();
    const r = combat(equipe, et);
    const victoire = r.vainqueur === 0;
    const premiere = victoire && !j.battues.has(et.global);
    if (victoire) j.invocations += INVOCATIONS_VICTOIRE;
    j.encre += victoire ? encreEtape(et, premiere) : 1;
    donnerXp(equipe, xpEtape(et, victoire));
    if (premiere) {
      j.battues.add(et.global);
      if (et.type === "boss") {
        ajouterObjets([objetAuHasard(h.nombre, et.chapitre)]);
        jalons[et.chapitre] = jour;
        j.tickets += TICKETS_CHAPITRE;
        const coffre = COFFRES[0];      // approximation : le premier coffre d'etoiles a la fin du chapitre
        j.encre += coffre.encre;
        j.eclats += coffre.eclats;
      } else if (et.type === "elite" || h.nombre() < 0.5) {
        ajouterObjets([objetAuHasard(h.nombre, et.chapitre)]);
      }
    }
    tirer();
    if (j.invocations >= 40) invoquerTout();
    optimiser(equipe);
    return { victoire, secondes: r.duree / 2 + 10 };
  };

  // ---------- Un combat de chasse en boucle (x3, 3,5 s entre deux combats) ----------
  const chasser = () => {
    const niveauEquipe = Math.round(equipeActuelle().reduce((s, id) => s + j.collection[id].niveau, 0) / 5);
    let choix = null;
    for (const zone of ZONES.filter((z) => zoneOuverte(z.id))) {
      zone.sousZones.forEach((sz, i) => {
        if (sz.niveau <= niveauEquipe + 1) choix = { zone, index: i, sz };
      });
    }
    if (!choix) choix = { zone: ZONES[0], index: 0, sz: ZONES[0].sousZones[0] };
    const equipe = equipeActuelle();
    const groupe = choix.sz.groupes[Math.floor(h.nombre() * choix.sz.groupes.length)];
    const r = combat(equipe, { equipe: groupe.equipe, niveau: choix.sz.niveau, multiplicateur: MULT_SOUS_ZONE });
    const victoire = r.vainqueur === 0;
    donnerXp(equipe, xpChasse(choix.sz.niveau, victoire));
    j.eclats += eclatsChasse(choix.sz.niveau, victoire, false);
    if (victoire) {
      j.invocations += INVOCATIONS_VICTOIRE;
      const butinPct = equipe.reduce((s, id) => s + bonusEquipement(piecesDe(id)).butin, 0);
      ajouterObjets(tirerButin(h.nombre, tableButin(choix.zone, choix.index), { butinPct }));
    }
    optimiser(equipe);
    return { victoire, secondes: r.duree / 3 + 3.5 };
  };

  // ---------- Les jours ----------
  tirer();
  invoquerTout();
  for (jour = 1; jour <= jours && prochaineEtape(); jour++) {
    // L'expedition pendant l'absence
    const etapeExp = meilleureEtape();
    if (jour > 1) j.tickets += TICKETS_GRATUITS_PAR_JOUR;
    if (jour > 1) { j.invocations += visitesAutel * INVOCATIONS_MAX; invoquerTout(); }   // un ticket toutes les 30 min, reserve de 16 (8 h) : un joueur qui passe matin et soir
    if (jour > 1 && etapeExp) {
      const combats = Math.floor(Math.min(24 - minutesParJour / 60, EXPEDITION_HEURES_MAX) * EXPEDITION_COMBATS_PAR_HEURE);
      j.encre += combats * encreEtape(etapeExp, false);
      donnerXp(equipeActuelle(), Math.round(combats * xpEtape(etapeExp, true) * 0.5));
      ajouterObjets(Array.from({ length: 6 }, () => objetAuHasard(h.nombre, etapeExp.chapitre)));
      tirer();
      optimiser(equipeActuelle());
    }
    // Le temps de jeu actif
    let temps = 0;
    let farm = 0;
    while (temps < minutesParJour * 60 && prochaineEtape()) {
      if (farm > 0) {
        temps += chasser().secondes;
        farm--;
        continue;
      }
      const r = jouerEtape(prochaineEtape());
      temps += r.secondes;
      if (r.victoire) j.echecs = 0;
      else if (++j.echecs >= 2) {
        farm = 20;       // bloque : 20 combats de chasse en boucle, puis on retente
        j.echecs = 0;
      }
    }
    const equipe = equipeActuelle();
    const portees = equipe.flatMap(piecesDe);
    bilans.push({
      jour,
      etape: meilleureEtape()?.global ?? 0,
      niveau: Math.round(equipe.reduce((s, id) => s + j.collection[id].niveau, 0) / 5),
      collection: Object.keys(j.collection).length,
      pieces: portees.length,
      ameliorationMoyenne: portees.length ? portees.reduce((s, p) => s + p.niveau, 0) / portees.length : 0,
      eclats: j.eclats,
    });
  }
  const collectionParRarete = {};
  for (const id of Object.keys(j.collection)) collectionParRarete[PERSOS_PAR_ID[id].rarete] = (collectionParRarete[PERSOS_PAR_ID[id].rarete] ?? 0) + 1;
  return { jalons, bilans, fini: !prochaineEtape(), collectionParRarete, encreFin: j.encre, boosters: j.boosters, invocations: j.totalInvocations };
}

export const mediane = (liste) => {
  const triee = [...liste].sort((a, b) => a - b);
  return triee.length ? triee[Math.floor(triee.length / 2)] : null;
};
