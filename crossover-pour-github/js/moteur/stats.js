// ==========================================================
// STATS FINALES
// LA fonction unique qui calcule les stats d'un perso avant
// un combat : role, rarete, niveau, etoiles, bonus de serie.
// L'equipement de la V0.3 viendra s'ajouter ici.
// ==========================================================

import { ROLES } from "../donnees/roles.js";
import { RARETES } from "../donnees/raretes.js";
import { BONUS_NIVEAU, BONUS_ETOILE } from "../donnees/progression.js";
import { bonusEquipement } from "./equipement.js";
import { BONUS_EVEIL, TALENTS } from "../donnees/eveil.js";

// Bonus de serie : 2 persos de la meme serie, ou 3
export const BONUS_SERIE = {
  2: { atq: 0.08, pv: 0 },
  3: { atq: 0.15, pv: 0.1 },
};

export function bonusSerie(perso, persosEquipe) {
  const nombre = persosEquipe.filter((p) => p.serie === perso.serie).length;
  return BONUS_SERIE[Math.min(nombre, 3)] ?? { atq: 0, pv: 0 };
}

// Rarete x niveau x etoiles (s'applique aux PV et a l'ATQ)
export function facteurProgression(perso, { niveau = 1, etoiles = 1, avecRarete = true } = {}) {
  const rarete = avecRarete ? RARETES[perso.rarete]?.bonus ?? 0 : 0;
  return (1 + rarete) * (1 + BONUS_NIVEAU * (niveau - 1)) * (1 + BONUS_ETOILE * (etoiles - 1));
}

// eveil : palier d'eveil (0 a 4) ; talents : choix "a"/"b" par palier ;
// bonusPct : bonus de lien et de la semaine (en %, sur PV et ATQ)
export function calculerStatsFinales(perso, { equipe = [], multiplicateur = 1, niveau = 1, etoiles = 1, avecRarete = true, equipement = [], eveil = 0, talents = [], bonusPct = 0 } = {}) {
  const base = ROLES[perso.role];
  const mods = perso.mods ?? {};
  const serie = bonusSerie(perso, equipe);
  const progression = facteurProgression(perso, { niveau, etoiles, avecRarete }) * (1 + BONUS_EVEIL * eveil) * (1 + bonusPct / 100);
  const e = bonusEquipement(equipement);
  // Les talents d'eveil s'ajoutent comme des bonus d'equipement
  for (const choix of talents.slice(0, eveil)) {
    const t = TALENTS[perso.role]?.[choix];
    if (t) for (const [k, v] of Object.entries(t.effet)) e[k] = (e[k] ?? 0) + v;
  }

  return {
    pv: Math.round((base.pv * (mods.pv ?? 1) * progression + e.pv) * (1 + serie.pv + e.pvPct / 100) * multiplicateur),
    atq: Math.round((base.atq * (mods.atq ?? 1) * progression + e.atq) * (1 + serie.atq + e.atqPct / 100) * multiplicateur),
    // La DEF ne monte pas avec la progression : sinon les combats a haut niveau
    // s'allongent et finissent au temps (constate en simulation).
    def: Math.round(base.def * (mods.def ?? 1) * (1 + e.defPct / 100)),
    vit: Math.round((base.vit * (mods.vit ?? 1) + e.vit) * (1 + e.vitPct / 100)),
    crit: base.crit + (mods.crit ?? 0) + e.critPct / 100,
    // Effets de combat apportes par l'equipement (ensembles a 4 pieces surtout)
    energieDepart: e.energie,
    bouclierDepart: e.bouclierDepart,
    bonusUltime: e.bonusUltime,
    multCrit: e.multCrit,
    bonusSoins: e.bonusSoins,
    epines: e.epines,
    esquive: e.esquive,
    volDeVie: e.volDeVie,
    bruleBase: e.bruleBase,
    percage: e.percage,
    regenDepart: e.regenDepart,
    immuniteEtourdi: e.immuniteEtourdi,
    survie: e.survie,
    apresKo: e.apresKo,
    butin: e.butin,
    resurrection: e.resurrection,
    atqParKoEquip: e.atqParKoEquip,
    rechargeUltime: e.rechargeUltime,
  };
}
