// ==========================================================
// REGLES DU COMBAT
// Les briques de base : stats du moment, ciblage, degats,
// soins, energie, KO. Tout le reste du moteur s'appuie dessus.
// ==========================================================

import { DOMINE, BONUS_AFFINITE } from "../donnees/roles.js";
import { aEffet, trouverEffet, retirerEffet, poserEffet, EFFETS } from "./effets.js";

export const TICS_PAR_SECONDE = 10;
export const DUREE_MAX = 90 * TICS_PAR_SECONDE;   // 90 secondes
export const INTERVALLE_BASE = 1.5;               // secondes entre 2 attaques a 100 de vitesse
export const ENERGIE_PAR_ATTAQUE = 10;
export const ENERGIE_MAX = 100;
export const MULT_CRITIQUE = 1.5;

// ---------- Journal ----------

export function emettre(etat, evenement) {
  evenement.t = etat.t;
  etat.evenements.push(evenement);
  if (etat.journal) etat.journal.push(evenement);
}

// ---------- Equipes et lignes ----------

export const vivants = (liste) => liste.filter((u) => u.pv > 0);
export const alliesDe = (etat, u) => etat.equipes[u.camp];
export const ennemisDe = (etat, u) => etat.equipes[1 - u.camp];
export const estAvant = (u) => u.place < 2;

// ---------- Stats du moment (bonus et malus compris) ----------

export function atqActuelle(etat, u) {
  let mult = 1;
  if (aEffet(u, "renforcement")) mult += 0.2;

  const p = u.passif;
  if (p.type === "atqSousPv" && u.pv / u.pvMax < p.seuil) mult += p.bonus;
  if (p.type === "atqParKo") mult += Math.min(u.compteurs.kos * p.bonus, p.max);
  if (u.stats.atqParKoEquip) mult += Math.min(u.compteurs.kos, 3) * u.stats.atqParKoEquip;   // Marque-page sanglant
  if (p.type === "atqSelonPvPerdus") mult += (1 - u.pv / u.pvMax) * p.ratio;
  if (p.type === "atqSiAllieKo" && vivants(alliesDe(etat, u)).length < alliesDe(etat, u).length) mult += p.bonus;

  // Charisme de Griffith : bonus pour les allies de la ligne avant
  if (estAvant(u)) {
    for (const allie of vivants(alliesDe(etat, u))) {
      if (allie.passif.type === "auraAtqAvant") mult += allie.passif.bonus;
    }
  }
  return u.stats.atq * mult;
}

export function defActuelle(u) {
  return u.stats.def * (u.compteurs.apotre ? 1 + u.passif.bonus : 1);
}

export function vitActuelle(etat, u) {
  let mult = 1;
  if (aEffet(u, "ralenti")) mult -= 0.3;
  if (aEffet(u, "acceleration")) mult += 0.6;
  if (u.passif.type === "vitSousPv" && u.pv / u.pvMax < u.passif.seuil) mult += u.passif.bonus;

  // Pression de Mewtwo : ralentit toute l'equipe adverse
  for (const ennemi of vivants(ennemisDe(etat, u))) {
    if (ennemi.passif.type === "auraVitEnnemis") mult -= ennemi.passif.malus;
  }
  return u.stats.vit * Math.max(0.2, mult);
}

// ---------- Ciblage ----------

// Cible de la ligne avant : en priorite celle "en face"
export function cibleAvant(u, ennemis) {
  const avant = ennemis.filter(estAvant);
  if (avant.length) return avant.find((e) => e.place === u.place % 2) ?? avant[0];
  return cibleArriere(u, ennemis);
}

// Cible de la ligne arriere : en priorite celle "en face"
export function cibleArriere(u, ennemis) {
  const arriere = ennemis.filter((e) => !estAvant(e));
  if (!arriere.length) return ennemis.find(estAvant) ?? null;
  return arriere.find((e) => e.place === 2 + (u.place % 3)) ?? arriere[0];
}

// Cible d'une attaque de base (provocation, assassins, ligne avant)
export function cibleBase(etat, u, { ignorerProvocation = false } = {}) {
  const ennemis = vivants(ennemisDe(etat, u));
  if (!ennemis.length) return null;

  if (!ignorerProvocation) {
    const provocateur = ennemis.find((e) => aEffet(e, "provocation"));
    if (provocateur) return provocateur;
  }
  return u.role === "assassin" ? cibleArriere(u, ennemis) : cibleAvant(u, ennemis);
}

// ---------- Energie ----------

export function gagnerEnergie(u, quantite) {
  if (u.pv <= 0 || aEffet(u, "etourdi")) return;
  u.energie = Math.min(ENERGIE_MAX, u.energie + quantite * (1 + (u.stats.rechargeUltime || 0)));
}

// ---------- Effets (avec message dans le journal) ----------

export function appliquerEffet(etat, cible, type, dureeSecondes, source, { valeur = 0, force = false } = {}) {
  if (cible.pv <= 0) return false;
  if (type === "etourdi" && !force && cible.stats.immuniteEtourdi && !cible.compteurs.immuniteUtilisee) {
    cible.compteurs.immuniteUtilisee = true;
    emettre(etat, { type: "resiste", cible: cible.uid, source: source?.uid ?? null, effet: type, duree: dureeSecondes, valeur: 0 });
    return false;
  }
  // Brulure et regeneration agissent a chaque seconde pleine : un tic de plus
  // evite de perdre une seconde quand l'effet est pose pile sur un tic de seconde.
  const ticsEnPlus = type === "brulure" || type === "regeneration" ? 1 : 0;
  const tics = Math.round(dureeSecondes * TICS_PAR_SECONDE) + ticsEnPlus;
  const pose = poserEffet(cible, type, tics, { valeur, source, temps: etat.t, force });
  emettre(etat, {
    type: pose ? "effet" : "resiste",
    cible: cible.uid,
    source: source?.uid ?? null,
    effet: type,
    duree: dureeSecondes,
    valeur: Math.round(valeur),
  });
  return pose;
}

// ---------- Soins ----------

export function soigner(etat, source, cible, montant) {
  if (cible.pv <= 0) return 0;
  if (source.passif.type === "soinsBonusBlesses" && cible.pv / cible.pvMax < source.passif.seuil) {
    montant *= 1 + source.passif.bonus;
  }
  montant *= 1 + (source.stats.bonusSoins || 0);   // ensemble Coeur du sage
  montant *= etat.mods?.soinsMult ?? 1;               // arc de la survie
  const reel = Math.min(Math.round(montant), cible.pvMax - cible.pv);
  if (reel <= 0) return 0;
  cible.pv += reel;
  source.bilan.soins += reel;
  emettre(etat, { type: "soin", source: source.uid, cible: cible.uid, montant: reel });
  return reel;
}

// ---------- Pertes de PV ----------

// Retire des PV (le bouclier absorbe d'abord). Ne gere pas le KO.
function retirerPv(cible, montant) {
  let absorbe = 0;
  const bouclier = trouverEffet(cible, "bouclier");
  if (bouclier) {
    absorbe = Math.min(bouclier.valeur, montant);
    bouclier.valeur -= absorbe;
    montant -= absorbe;
    if (bouclier.valeur <= 0) retirerEffet(cible, "bouclier");
  }

  let perte = Math.min(Math.round(montant), cible.pv);
  let survie = false;
  if (perte >= cible.pv && cible.passif.type === "survieUneFois" && !cible.compteurs.survieUtilisee) {
    perte = cible.pv - 1;
    survie = true;
    cible.compteurs.survieUtilisee = true;
  } else if (perte >= cible.pv && cible.stats.survie && !cible.compteurs.survieEquipement) {
    perte = cible.pv - 1;
    survie = "equipement";
    cible.compteurs.survieEquipement = true;
  }
  cible.pv -= perte;
  return { perte, absorbe: Math.round(absorbe), survie };
}

// Ce qui se passe apres une perte de PV : energie, passifs, KO
function apresPerte(etat, cible, source, resultat) {
  cible.bilan.recu += resultat.perte;
  cible.bilan.encaisse += resultat.perte + (resultat.absorbe ?? 0);   // y compris ce que le bouclier a pris
  if (source) source.bilan.inflige += resultat.perte;

  if (resultat.survie) {
    const nom = resultat.survie === "equipement" ? "Bandeau de l'aube" : cible.passif.nom;
    emettre(etat, { type: "passif", source: cible.uid, nom, detail: "survit avec 1 PV" });
  }

  gagnerEnergie(cible, (resultat.perte / cible.pvMax) * 100);

  if (cible.pv <= 0) {
    // Reliure de resurrection : revient une fois avec 30 % de ses PV
    if (cible.stats.resurrection && !cible.compteurs.resurrection) {
      cible.compteurs.resurrection = true;
      cible.pv = Math.round(cible.pvMax * 0.3);
      cible.effets = [];
      emettre(etat, { type: "passif", source: cible.uid, nom: "Reliure de résurrection", detail: "revient au combat" });
      return;
    }
    mettreKo(etat, cible, source);
    return;
  }

  const ratio = cible.pv / cible.pvMax;
  const p = cible.passif;

  // Repos de Ronflex
  if (p.type === "reposUneFois" && !cible.compteurs.reposUtilise && ratio <= p.seuil) {
    cible.compteurs.reposUtilise = true;
    emettre(etat, { type: "passif", source: cible.uid, nom: p.nom, detail: "s'endort et récupère des PV" });
    soigner(etat, cible, cible, cible.pvMax * p.soin);
    appliquerEffet(etat, cible, "etourdi", p.duree, cible, { force: true });
  }

  // Apotre de Zodd
  if (p.type === "defSousPvUneFois" && !cible.compteurs.apotre && ratio < p.seuil) {
    cible.compteurs.apotre = true;
    emettre(etat, { type: "passif", source: cible.uid, nom: p.nom, detail: "DEF +30 %" });
  }
}

function mettreKo(etat, cible, source) {
  cible.pv = 0;
  cible.effets = [];
  cible.jauge = 0;
  cible.energie = 0;
  emettre(etat, { type: "ko", cible: cible.uid, source: source?.uid ?? null });
  if (source && (source.passif.type === "atqParKo" || source.stats.atqParKoEquip)) source.compteurs.kos += 1;
  if (source && source !== cible && source.pv > 0 && source.stats.apresKo) {
    emettre(etat, { type: "passif", source: source.uid, nom: "Plume de la Rature", detail: "se nourrit du KO" });
    soigner(etat, source, source, source.pvMax * 0.15);
    gagnerEnergie(source, 30);
  }
}

// Degats qui ignorent la defense (brulure, etc.)
export function perteDirecte(etat, cible, montant, source, origine) {
  if (cible.pv <= 0) return;
  const resultat = retirerPv(cible, montant);
  emettre(etat, { type: "perte", cible: cible.uid, montant: resultat.perte, absorbe: resultat.absorbe, origine });
  apresPerte(etat, cible, source, resultat);
}

// ---------- Degats d'une attaque ----------

export function infligerDegats(etat, source, cible, { mult = 1, base = false, critGaranti = false, multCrit = null, ultime = false } = {}) {
  if (cible.pv <= 0) return { touche: false };
  const h = etat.hasard;

  // Infini de Gojo : annule la premiere attaque toutes les X secondes
  if (cible.passif.type === "annuleAttaquePeriodique" && etat.t >= cible.compteurs.infiniPret) {
    cible.compteurs.infiniPret = etat.t + cible.passif.periode * TICS_PAR_SECONDE;
    emettre(etat, { type: "annule", source: source.uid, cible: cible.uid, nom: cible.passif.nom });
    return { touche: false };
  }

  // Sharingan de Sasuke : esquive des attaques de base
  if (base && cible.passif.type === "esquiveBase" && h.chance(cible.passif.chance)) {
    emettre(etat, { type: "esquive", source: source.uid, cible: cible.uid });
    return { touche: false };
  }
  if (base && cible.stats.esquive > 0 && h.chance(cible.stats.esquive)) {
    emettre(etat, { type: "esquive", source: source.uid, cible: cible.uid });
    return { touche: false };
  }

  // Formule de degats
  const def = defActuelle(cible) * (1 - (source.stats.percage || 0));
  let degats = atqActuelle(etat, source) * mult * (100 / (100 + def));

  const avantage = DOMINE[source.affinite].includes(cible.affinite);
  if (avantage) degats *= 1 + BONUS_AFFINITE;
  if (ultime) degats *= 1 + (source.stats.bonusUltime || 0);   // ensemble Volonte du heros

  const ps = source.passif;
  if (ps.type === "degatsContreBlesses" && cible.pv / cible.pvMax < ps.seuil) degats *= 1 + ps.bonus;

  if (base && ps.type === "concentration") {
    if (source.compteurs.cibleConcentration === cible.uid) {
      source.compteurs.concentration = Math.min(source.compteurs.concentration + ps.bonus, ps.max);
    } else {
      source.compteurs.cibleConcentration = cible.uid;
      source.compteurs.concentration = 0;
    }
    degats *= 1 + source.compteurs.concentration;
  }

  if (base && cible.passif.type === "reductionBase") degats *= 1 - cible.passif.pourcent;

  // Critique
  const premierCoup = ps.type === "premierCoupCritique" && !source.compteurs.premierCoupFait;
  source.compteurs.premierCoupFait = true;
  const critique = critGaranti || premierCoup || h.chance(source.stats.crit);
  // Multiplicateur de critique : le plus fort entre la regle, le passif (Zoro) et l'equipement
  const multCritique = Math.max(MULT_CRITIQUE, ps.type === "multCrit" ? ps.valeur : 0, source.stats.multCrit || 0);
  if (critique) degats *= (multCrit ?? multCritique) * (etat.mods?.critMult ?? 1);   // arc du tournoi

  // Petit alea de +/- 5 %
  degats = Math.max(1, Math.round(degats * h.entre(0.95, 1.05)));

  const resultat = retirerPv(cible, degats);
  emettre(etat, {
    type: "attaque",
    source: source.uid,
    cible: cible.uid,
    base,
    degats: resultat.perte,
    absorbe: resultat.absorbe,
    critique,
    avantage,
  });
  apresPerte(etat, cible, source, resultat);

  // Vol de vie (Murasame d'encre, panoplie Encre originelle)
  if (source.stats.volDeVie > 0 && resultat.perte > 0 && source.pv > 0) {
    soigner(etat, source, source, resultat.perte * source.stats.volDeVie);
  }
  // Epines (Bouclier du colosse, panoplie Rempart eternel)
  if (cible.stats.epines > 0 && resultat.perte > 0 && source.pv > 0 && source !== cible) {
    perteDirecte(etat, source, resultat.perte * cible.stats.epines, cible, "Épines");
  }

  // Statik de Pikachu : peut etourdir celui qui le frappe
  if (base && cible.pv > 0 && cible.passif.type === "etourdirAttaquant" && h.chance(cible.passif.chance)) {
    emettre(etat, { type: "passif", source: cible.uid, nom: cible.passif.nom, detail: "riposte" });
    appliquerEffet(etat, source, "etourdi", cible.passif.duree, cible);
  }

  return { touche: true, perte: resultat.perte };
}

// ---------- Attaque de base ----------

export function attaqueDeBase(etat, u) {
  const cible = cibleBase(etat, u);
  if (!cible) return;

  const resultat = infligerDegats(etat, u, cible, { base: true });
  gagnerEnergie(u, ENERGIE_PAR_ATTAQUE);
  if (!resultat.touche || cible.pv <= 0) return;

  if (u.stats.bruleBase > 0 && cible.pv > 0 && etat.hasard.chance(u.stats.bruleBase)) {
    appliquerEffet(etat, cible, "brulure", 2, u);
  }

  const p = u.passif;
  if (p.type === "doubleFrappe") infligerDegats(etat, u, cible, { mult: p.mult });
  if (p.type === "effetSurBase" && cible.pv > 0 && (!p.chance || etat.hasard.chance(p.chance))) {
    appliquerEffet(etat, cible, p.effet, p.duree, u);
  }
}

export function nomEffet(type) {
  return EFFETS[type]?.nom ?? type;
}
