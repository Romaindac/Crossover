// ==========================================================
// COMPETENCES
// Les ultimes (decrits dans persos.js sous forme d'actions)
// et les passifs qui se declenchent avec le temps.
// ==========================================================

import {
  emettre, vivants, alliesDe, ennemisDe, estAvant,
  cibleBase, cibleAvant, cibleArriere, atqActuelle,
  infligerDegats, soigner, appliquerEffet, gagnerEnergie, perteDirecte,
  TICS_PAR_SECONDE,
} from "./regles.js";
import { trouverEffet } from "./effets.js";

// ---------- Choix des cibles d'une action ----------

function selectionner(etat, u, cible) {
  const ennemis = vivants(ennemisDe(etat, u));
  const allies = vivants(alliesDe(etat, u));
  const h = etat.hasard;
  if (!ennemis.length && !["soi", "allies", "allies-autres", "allies-avant"].includes(cible)) return [];

  switch (cible) {
    case "tous":
      return ennemis;
    case "base":
      return [cibleBase(etat, u, { ignorerProvocation: true })];
    case "face":
      return [cibleAvant(u, ennemis)];
    case "face+derriere": {
      const devant = cibleAvant(u, ennemis);
      const derriere = ennemis.find((e) => !estAvant(e) && e.place === (devant.place === 0 ? 2 : 4))
        ?? ennemis.find((e) => e.place === 3);
      return derriere && derriere !== devant ? [devant, derriere] : [devant];
    }
    case "ligne-avant": {
      const avant = ennemis.filter(estAvant);
      return avant.length ? avant : ennemis;
    }
    case "ligne-avant-aleatoire": {
      const avant = ennemis.filter(estAvant);
      return [h.choisir(avant.length ? avant : ennemis)];
    }
    case "arriere":
      return [cibleArriere(u, ennemis)];
    case "arriere-aleatoire": {
      const arriere = ennemis.filter((e) => !estAvant(e));
      return [h.choisir(arriere.length ? arriere : ennemis)];
    }
    case "aleatoire":
      return [h.choisir(ennemis)];
    case "plus-faible":
      return [ennemis.reduce((a, b) => (b.pv < a.pv ? b : a))];
    case "plus-forte-atq":
      return [ennemis.reduce((a, b) => (atqActuelle(etat, b) > atqActuelle(etat, a) ? b : a))];
    case "soi":
      return [u];
    case "allies":
      return allies;
    case "allies-autres":
      return allies.filter((a) => a !== u);
    case "allies-avant":
      return allies.filter(estAvant);
    default:
      return [];
  }
}

// ---------- Ultimes ----------

export function executerUltime(etat, u) {
  u.energie = 0;
  emettre(etat, { type: "ultime", source: u.uid, nom: u.ultime.nom });

  for (const action of u.ultime.actions) {
    switch (action.type) {
      case "degats":
        actionDegats(etat, u, action);
        break;

      case "soin":
        for (const c of selectionner(etat, u, action.cible)) soigner(etat, u, c, c.pvMax * action.pourcent);
        break;

      case "effet":
        for (const c of selectionner(etat, u, action.cible)) {
          const valeur = action.pourcentPv ? c.pvMax * action.pourcentPv : 0;
          appliquerEffet(etat, c, action.effet, action.duree, u, { valeur });
        }
        break;

      case "energie":
        for (const c of selectionner(etat, u, action.cible)) {
          gagnerEnergie(c, action.montant);
          emettre(etat, { type: "energie", source: u.uid, cible: c.uid, montant: action.montant });
        }
        break;

      case "coutPv": {
        const perte = Math.min(Math.round(u.pvMax * action.pourcent), u.pv - 1);
        if (perte > 0) {
          u.pv -= perte;
          u.bilan.recu += perte;
          emettre(etat, { type: "perte", cible: u.uid, montant: perte, absorbe: 0, origine: u.ultime.nom });
        }
        break;
      }
    }
  }
}

function actionDegats(etat, u, action) {
  const coups = action.coups ?? 1;
  for (let i = 0; i < coups; i++) {
    const cibles = selectionner(etat, u, action.cible).filter((c) => c && c.pv > 0);
    if (!cibles.length) return;
    for (const c of cibles) {
      const resultat = infligerDegats(etat, u, c, {
        mult: action.mult,
        critGaranti: action.critGaranti,
        multCrit: action.multCrit,
        ultime: true,
      });
      if (resultat.touche && action.effet && c.pv > 0) {
        appliquerEffet(etat, c, action.effet.type, action.effet.duree, u);
      }
    }
  }
}

// ---------- Ce qui se passe chaque seconde ----------

export const BRULURE_PAR_SECONDE = 0.02;
export const REGENERATION_PAR_SECONDE = 0.02;

export function chaqueSeconde(etat) {
  for (const u of etat.unites) {
    if (u.pv <= 0) continue;

    // Brulure : 2 % des PV max par seconde
    const brulure = trouverEffet(u, "brulure");
    if (brulure) perteDirecte(etat, u, u.pvMax * BRULURE_PAR_SECONDE, brulure.source, "Brûlure");

    // Regeneration : 2 % des PV max par seconde
    const regen = trouverEffet(u, "regeneration");
    if (regen && u.pv > 0) soigner(etat, regen.source ?? u, u, u.pvMax * REGENERATION_PAR_SECONDE);

    if (u.pv <= 0) continue;
    const p = u.passif;

    // Regeneration namek de Piccolo
    if (p.type === "regenPeriodique" && etat.t % (p.periode * TICS_PAR_SECONDE) === 0) {
      soigner(etat, u, u, u.pvMax * p.pourcent);
    }

    // Medecin de bord de Chopper : soigne l'allie le plus blesse
    if (p.type === "soinPeriodiqueBlesse" && etat.t % (p.periode * TICS_PAR_SECONDE) === 0) {
      const blesses = vivants(alliesDe(etat, u)).filter((a) => a.pv < a.pvMax);
      if (blesses.length) {
        const plusBlesse = blesses.reduce((a, b) => (b.pv / b.pvMax < a.pv / a.pvMax ? b : a));
        soigner(etat, u, plusBlesse, plusBlesse.pvMax * p.pourcent);
      }
    }
  }
}
