// ==========================================================
// EQUIPEMENT (logique pure)
// Une piece = un exemplaire d'un objet du catalogue, avec ses
// propres jets de stats, son niveau d'amelioration, son porteur.
// ==========================================================

import { OBJETS_PAR_ID, OBJETS } from "../donnees/objets.js";
import { PANOPLIES } from "../donnees/panoplies.js";
import { BONUS_PAR_NIVEAU } from "../donnees/equipement.js";

const arrondi = (x) => Math.round(x * 10) / 10;
const ENTIERES = ["atq", "pv", "vit", "energie", "butin"];

export const objetDe = (piece) => OBJETS_PAR_ID[piece.objet];
export const nomPiece = (piece) => objetDe(piece)?.nom ?? "Objet inconnu";

// Cree un exemplaire d'un objet : chaque ligne est tiree dans sa fourchette
export function creerPiece(aleatoire, objetId, uid) {
  const o = OBJETS_PAR_ID[objetId];
  return {
    uid,
    objet: o.id,
    emplacement: o.emplacement,
    rarete: o.rarete,
    panoplie: o.panoplie,
    niveau: 0,
    lignes: o.lignes.map(([stat, min, max]) => {
      const v = min + aleatoire() * (max - min);
      return { stat, valeur: ENTIERES.includes(stat) ? Math.round(v) : arrondi(v) };
    }),
    verrou: false,
    porteur: null,
  };
}

// Valeur d'une ligne, amelioration comprise
export const valeurLigne = (piece, ligne) => arrondi(ligne.valeur * (1 + BONUS_PAR_NIVEAU * piece.niveau));

// Qualite d'un jet (0 = minimum, 1 = jet parfait), en moyenne sur toutes les lignes
export function qualiteJet(piece) {
  const o = objetDe(piece);
  if (!o) return 0;
  const parts = piece.lignes.map((l, i) => {
    const [, min, max] = o.lignes[i] ?? [l.stat, l.valeur, l.valeur];
    return max > min ? (l.valeur - min) / (max - min) : 1;
  });
  return parts.reduce((a, b) => a + b, 0) / (parts.length || 1);
}

// Pieces de chaque panoplie portees : { panoplie: nombre }
export function comptesPanoplies(pieces) {
  const comptes = {};
  for (const p of pieces) if (p.panoplie) comptes[p.panoplie] = (comptes[p.panoplie] ?? 0) + 1;
  return comptes;
}

// Total de ce qu'apportent des pieces : stats, pourcentages et effets de combat
export function bonusEquipement(pieces = []) {
  const b = {
    atq: 0, pv: 0, vit: 0, atqPct: 0, pvPct: 0, defPct: 0, vitPct: 0, critPct: 0, energie: 0, butin: 0,
    bonusUltime: 0, bouclierDepart: 0, multCrit: 0, bonusSoins: 0,
    epines: 0, esquive: 0, volDeVie: 0, bruleBase: 0, percage: 0,
    regenDepart: false, immuniteEtourdi: false, survie: false, apresKo: false,
    resurrection: false, atqParKoEquip: 0, rechargeUltime: 0,
  };
  const ajouter = (effet) => {
    for (const [k, v] of Object.entries(effet)) {
      if (k === "texte") continue;
      if (typeof v === "boolean") b[k] = b[k] || v;
      else if (k === "multCrit") b[k] = Math.max(b[k], v);
      else b[k] += v;
    }
  };
  for (const p of pieces) {
    for (const l of p.lignes) b[l.stat] += valeurLigne(p, l);
    const effet = objetDe(p)?.effet;
    if (effet) ajouter(effet);
  }
  for (const [cle, n] of Object.entries(comptesPanoplies(pieces))) {
    const pano = PANOPLIES[cle];
    if (!pano) continue;
    for (const palier of [2, 3, 4]) if (n >= palier && pano.bonus[palier]) ajouter(pano.bonus[palier]);
  }
  return b;
}

// ---------- Butin ----------

// Tire le butin d'un combat gagne. table : [{ objet, chance }]
export function tirerButin(aleatoire, table, { butinPct = 0, multiplicateur = 1 } = {}) {
  const facteur = (1 + butinPct / 100) * multiplicateur;
  return table.filter((t) => aleatoire() < Math.min(0.95, t.chance * facteur)).map((t) => t.objet);
}

// Un objet au hasard d'une zone (hors boss), pondere par rarete : pour l'expedition et les paliers
export function objetAuHasard(aleatoire, zoneId) {
  const POIDS = { commun: 10, peu_commun: 6, rare: 2 };
  const liste = OBJETS.filter((o) => o.zone === zoneId && POIDS[o.rarete]);
  const total = liste.reduce((s, o) => s + POIDS[o.rarete], 0);
  let x = aleatoire() * total;
  for (const o of liste) {
    x -= POIDS[o.rarete];
    if (x < 0) return o.id;
  }
  return liste[0].id;
}

// ---------- Amelioration ----------

export const coutAmelioration = (niveau) => 10 * (niveau + 1);
export const eclatsInvestis = (niveau) => (10 * niveau * (niveau + 1)) / 2;

// ---------- Choisir les meilleures pieces pour un perso ----------

const POIDS_ROLE = {
  tank:      { pv: 1.2, defPct: 1, atq: 0.3, vit: 0.4, critPct: 0.2, energie: 0.4, butin: 0.05 },
  attaquant: { pv: 0.5, defPct: 0.3, atq: 1.2, vit: 0.8, critPct: 1, energie: 0.5, butin: 0.05 },
  assassin:  { pv: 0.4, defPct: 0.2, atq: 1.2, vit: 1, critPct: 1.2, energie: 0.5, butin: 0.05 },
  soutien:   { pv: 1, defPct: 0.6, atq: 0.4, vit: 1, critPct: 0.2, energie: 1, butin: 0.05 },
  controle:  { pv: 0.6, defPct: 0.4, atq: 0.8, vit: 1.2, critPct: 0.5, energie: 1, butin: 0.05 },
};

export function scorePiece(piece, role, base) {
  const p = POIDS_ROLE[role];
  const enPct = (stat, v) => {
    if (stat === "atq") return (v / base.atq) * 100 * p.atq;
    if (stat === "pv") return (v / base.pv) * 100 * p.pv;
    if (stat === "vit") return (v / base.vit) * 100 * p.vit;
    if (stat === "atqPct") return v * p.atq;
    if (stat === "pvPct") return v * p.pv;
    if (stat === "defPct") return v * p.defPct;
    if (stat === "critPct") return v * 1.5 * p.critPct;
    if (stat === "energie") return v * 0.5 * p.energie;
    if (stat === "butin") return v * p.butin;
    return 0;
  };
  const effet = objetDe(piece)?.effet ? 12 : 0;   // un Legendaire vaut toujours le detour
  return piece.lignes.reduce((s, l) => s + enPct(l.stat, valeurLigne(piece, l)), 0) + effet;
}

// ---------- Retouche a l'encre (forgemagie) ----------

export const coutRetouche = (piece) => 20 + 10 * (piece.retouches ?? 0);

// Fourchette d'origine d'une ligne : [min, max]
export function fourchetteLigne(piece, index) {
  const ligne = objetDe(piece)?.lignes[index];
  return ligne ? [ligne[1], ligne[2]] : [0, 0];
}

// Une ligne est parfaite quand son jet atteint le maximum de sa fourchette
export function ligneParfaite(piece, index) {
  const [, max] = fourchetteLigne(piece, index);
  return piece.lignes[index].valeur >= max - 0.05;
}

export const pieceParfaite = (piece) => piece.lignes.length > 0 && piece.lignes.every((_, i) => ligneParfaite(piece, i));

// Nouveau jet d'une ligne, dans la fourchette de l'objet
export function nouveauJet(aleatoire, piece, index) {
  const [min, max] = fourchetteLigne(piece, index);
  const v = min + aleatoire() * (max - min);
  return ENTIERES.includes(piece.lignes[index].stat) ? Math.round(v) : arrondi(v);
}

// ---------- Sublimage a l'encre sacree ----------
export const BONUS_SUBLIMAGE = 0.15;
export const peutSublimer = (piece, index) => piece.sublime === undefined && ligneParfaite(piece, index);
