// ==========================================================
// SIMULATION
// Le coeur du moteur. Il ne touche jamais a l'ecran :
// il recoit deux equipes et une graine, et produit une liste
// d'evenements que l'affichage pourra animer.
//
// Utilisation :
//   - simulerCombat(config)  -> joue tout le combat d'un coup
//   - creerCombat(config) puis avancer(etat) a chaque tic
//     -> pour l'affichage en direct (etape 4)
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { creerHasard } from "./hasard.js";
import { calculerStatsFinales } from "./stats.js";
import { aEffet, vieillirEffets } from "./effets.js";
import { emettre, vivants, vitActuelle, attaqueDeBase, appliquerEffet, TICS_PAR_SECONDE, DUREE_MAX, INTERVALLE_BASE, ENERGIE_MAX } from "./regles.js";
import { executerUltime, chaqueSeconde } from "./competences.js";

// Une entree d'equipe : soit un id ("goku"), soit { id, niveau, etoiles, equipement }
function lireEntree(entree) {
  return typeof entree === "string" ? { id: entree, niveau: 1, etoiles: 1 } : { niveau: 1, etoiles: 1, ...entree };
}

function creerUnite(entree, place, camp, idsEquipe, options, hasard) {
  const { id, niveau, etoiles, equipement = [], eveil = 0, talents = [], bonusPct = 0, ascension = 0 } = lireEntree(entree);
  const perso = PERSOS_PAR_ID[id];
  if (!perso) throw new Error(`Perso inconnu : ${id}`);
  const stats = calculerStatsFinales(perso, {
    equipe: idsEquipe.map((i) => PERSOS_PAR_ID[i]),
    multiplicateur: options.multiplicateur,
    niveau: options.niveau ?? niveau,
    etoiles,
    avecRarete: options.avecRarete,
    equipement,
    eveil,
    talents,
    bonusPct,
    ascension,
  });

  return {
    uid: `${camp === 0 ? "A" : "B"}${place}`,
    id,
    niveau: options.niveau ?? niveau,
    etoiles,
    nom: perso.nom,
    serie: perso.serie,
    boss: Boolean(perso.boss),
    role: perso.role,
    affinite: perso.affinite,
    passif: perso.passif,
    ultime: perso.ultime,
    camp,
    place,
    stats,
    pvMax: stats.pv,
    pv: stats.pv,
    energie: Math.min(ENERGIE_MAX, stats.energieDepart || 0),
    jauge: hasard.nombre() * 0.3,   // petit decalage de depart
    effets: [],
    immuniteEtourdiJusqua: 0,
    compteurs: { kos: 0, infiniPret: 0, concentration: 0 },
    bilan: { inflige: 0, recu: 0, encaisse: 0, soins: 0 },
  };
}

// equipeA / equipeB : 5 entrees chacune (ids ou { id, niveau, etoiles })
// niveauB : niveau impose a toute l'equipe B (les ennemis d'un palier)
// avecRarete : false pour comparer les persos a egalite (tournoi du labo)
export function creerCombat({
  equipeA, equipeB, graine,
  multiplicateurA = 1, multiplicateurB = 1, niveauB = null,
  avecRarete = true, autoA = true, journal = true,
  modificateurs = null,   // regles speciales (arcs de la Tour) : { critMult, soinsMult, energieDepart, esquive, atqEnnemis }
  bonusA = null,          // bonus du camp A seulement (donjon) : { crit, esquive, volDeVie, energieDepart }
}) {
  const hasard = creerHasard(graine);
  const etat = {
    t: 0,
    graine,
    hasard,
    autoA,
    demandes: [],
    fini: false,
    vainqueur: null,
    raison: null,
    evenements: [],
    journal: journal ? [] : null,
    mods: modificateurs ?? {},
  };
  const idsA = equipeA.map((e) => lireEntree(e).id);
  const idsB = equipeB.map((e) => lireEntree(e).id);
  etat.equipes = [
    equipeA.map((e, place) => creerUnite(e, place, 0, idsA, { multiplicateur: multiplicateurA, avecRarete }, hasard)),
    equipeB.map((e, place) => creerUnite(e, place, 1, idsB, { multiplicateur: multiplicateurB, niveau: niveauB, avecRarete }, hasard)),
  ];
  etat.unites = [...etat.equipes[0], ...etat.equipes[1]];
  const mods = etat.mods;
  for (const u of etat.unites) {
    if (mods.energieDepart) u.energie = Math.max(u.energie, Math.min(ENERGIE_MAX, mods.energieDepart));
    if (mods.esquive) u.stats.esquive = (u.stats.esquive || 0) + mods.esquive;
    if (mods.atqEnnemis && u.camp === 1) u.stats.atq = Math.round(u.stats.atq * mods.atqEnnemis);
  }
  if (bonusA) {
    for (const u of etat.equipes[0]) {
      if (bonusA.crit) u.stats.crit = (u.stats.crit || 0) + bonusA.crit;
      if (bonusA.esquive) u.stats.esquive = (u.stats.esquive || 0) + bonusA.esquive;
      if (bonusA.volDeVie) u.stats.volDeVie = (u.stats.volDeVie || 0) + bonusA.volDeVie;
      if (bonusA.energieDepart) u.energie = Math.max(u.energie, Math.min(ENERGIE_MAX, bonusA.energieDepart));
    }
  }
  emettre(etat, { type: "debut" });

  // Ensemble Garde de fer : un bouclier des le debut du combat
  for (const u of etat.unites) {
    if (u.stats.bouclierDepart > 0) {
      appliquerEffet(etat, u, "bouclier", 15, u, { valeur: u.pvMax * u.stats.bouclierDepart });
    }
    if (u.stats.regenDepart) appliquerEffet(etat, u, "regeneration", 5, u);
  }
  return etat;
}

// Le joueur demande l'ultime d'un perso (mode manuel)
export function demanderUltime(etat, uid) {
  etat.demandes.push(uid);
}

function terminer(etat, vainqueur, raison) {
  etat.fini = true;
  etat.vainqueur = vainqueur;
  etat.raison = raison;
  emettre(etat, { type: "fin", vainqueur, raison, duree: etat.t / TICS_PAR_SECONDE });
}

function verifierFin(etat) {
  if (etat.fini) return true;
  const restantsA = vivants(etat.equipes[0]).length;
  const restantsB = vivants(etat.equipes[1]).length;
  if (restantsB === 0) terminer(etat, 0, "ko");
  else if (restantsA === 0) terminer(etat, 1, "ko");
  return etat.fini;
}

const parVitesse = (etat) => (a, b) => vitActuelle(etat, b) - vitActuelle(etat, a) || (a.uid < b.uid ? -1 : 1);

// Fait avancer le combat d'un tic (0,1 seconde)
export function avancer(etat) {
  if (etat.fini) return [];
  etat.evenements = [];
  etat.t += 1;

  // 1. Les effets s'ecoulent
  for (const u of etat.unites) if (u.pv > 0) vieillirEffets(u, etat.t);

  // 2. Ce qui arrive chaque seconde (brulure, regeneration, passifs)
  if (etat.t % TICS_PAR_SECONDE === 0) chaqueSeconde(etat);
  if (verifierFin(etat)) return etat.evenements;

  // 3. Les ultimes prets (auto, ou demandes par le joueur)
  const lanceurs = etat.unites.filter((u) => {
    if (u.pv <= 0 || u.energie < ENERGIE_MAX || aEffet(u, "etourdi")) return false;
    const auto = u.camp === 1 || etat.autoA;
    return auto || etat.demandes.includes(u.uid);
  });
  etat.demandes = [];
  lanceurs.sort(parVitesse(etat));
  for (const u of lanceurs) {
    if (u.pv <= 0 || aEffet(u, "etourdi")) continue;
    executerUltime(etat, u, { manuel: u.camp === 0 && !etat.autoA });
    if (verifierFin(etat)) return etat.evenements;
  }

  // 4. Les jauges d'action se remplissent
  const prets = [];
  for (const u of etat.unites) {
    if (u.pv <= 0 || aEffet(u, "etourdi")) continue;
    u.jauge += vitActuelle(etat, u) / 100 / (INTERVALLE_BASE * TICS_PAR_SECONDE);
    if (u.jauge >= 1) prets.push(u);
  }
  prets.sort((a, b) => b.jauge - a.jauge || (a.uid < b.uid ? -1 : 1));
  for (const u of prets) {
    if (u.pv <= 0 || aEffet(u, "etourdi")) continue;
    u.jauge -= 1;
    attaqueDeBase(etat, u);
    if (verifierFin(etat)) return etat.evenements;
  }

  // 5. Temps ecoule : le joueur perd
  if (etat.t >= DUREE_MAX) terminer(etat, 1, "temps");
  return etat.evenements;
}

// Joue un combat entier d'un coup
export function simulerCombat(config) {
  const etat = creerCombat(config);
  while (!etat.fini) avancer(etat);
  return {
    vainqueur: etat.vainqueur,
    raison: etat.raison,
    duree: etat.t / TICS_PAR_SECONDE,
    journal: etat.journal,
    unites: etat.unites.map((u) => ({
      uid: u.uid, id: u.id, nom: u.nom, camp: u.camp, place: u.place, niveau: u.niveau,
      pv: u.pv, pvMax: u.pvMax, bilan: { ...u.bilan },
    })),
  };
}
