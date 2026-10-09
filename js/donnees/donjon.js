// ==========================================================
// LE DONJON D'ENCRE (roguelite)
// Une descente : ton deck enchaine les etages, de plus en plus durs.
// Tous les 3 etages, une benediction a choisir parmi 3 (bonus pour
// cette descente seulement). Le butin s'accumule dans le sac : sortir
// le garde en entier, tomber sans vie n'en garde que la moitie.
// Les cristaux gagnes achetent des maitrises permanentes.
// Tous les chiffres a regler sont ici.
// ==========================================================

export const DESCENTES_PAR_JOUR = 3;
export const VIES_DEPART = 2;
export const ETAGES_PAR_BENEDICTION = 3;
export const PART_GARDEE_SI_KO = 0.5;

// L'adversaire de l'etage n (1, 2, 3...) : son niveau suit celui de ton deck
// (moyenne - 4, +1 tous les 3 etages) et ses stats grimpent de 4,5 % par etage.
// Tous les 5 etages : une elite ; tous les 10 : un gardien.
export const niveauEtage = (n, niveauDeck) => Math.max(1, Math.round(niveauDeck - 4 + Math.floor(n / 3)));
export const multEtage = (n) => (0.95 + 0.045 * n) * (n % 10 === 0 ? 1.25 : n % 5 === 0 ? 1.1 : 1);
export const typeEtage = (n) => (n % 10 === 0 ? "gardien" : n % 5 === 0 ? "elite" : "normal");

// Le butin d'un etage gagne (dans le sac jusqu'a la sortie)
export const butinEtage = (n) => ({
  encre: 5 + Math.round(1.5 * n),
  cristaux: 2 + Math.floor(n / 2) + (n % 10 === 0 ? 10 : n % 5 === 0 ? 4 : 0),
  invocations: n % 5 === 0 ? 5 : 0,
});

// ---------- Benedictions (pour la descente en cours) ----------
// pct : PV et ATQ du deck ; crit, esquive, volDeVie : en part (0,05 = 5 %) ; energie : energie de depart
export const BENEDICTIONS = [
  { id: "vigueur", nom: "Encre vive", texte: "+12 % de PV et d'ATQ", pct: 12 },
  { id: "force", nom: "Trait appuyé", texte: "+18 % d'ATQ et de PV, mais les ennemis aussi gagnent 5 %", pct: 18, ennemis: 1.05 },
  { id: "crit", nom: "Main lourde", texte: "+10 % de chances de critique", crit: 0.1 },
  { id: "esquive", nom: "Brume", texte: "+8 % d'esquive", esquive: 0.08 },
  { id: "vol", nom: "Plume vampire", texte: "+6 % de vol de vie", volDeVie: 0.06 },
  { id: "elan", nom: "Élan", texte: "+35 d'énergie au début de chaque combat", energie: 35 },
  { id: "peur", nom: "Intimidation", texte: "Ennemis : −8 % de PV et d'ATQ", ennemis: 0.92 },
  { id: "butin", nom: "Sac sans fond", texte: "+30 % d'encre et de cristaux dans le sac", butin: 0.3 },
  { id: "vie", nom: "Seconde page", texte: "+1 vie", vie: 1 },
];
export const BENEDICTIONS_PAR_ID = Object.fromEntries(BENEDICTIONS.map((b) => [b.id, b]));

// ---------- Maitrises (permanentes, payees en cristaux) ----------
export const MAITRISES = [
  { id: "vigueur", nom: "Vigueur", texte: (n) => `+${n * 3} % de PV et d'ATQ dans le donjon`, max: 10, cout: (n) => 20 * (n + 1) },
  { id: "fortune", nom: "Fortune", texte: (n) => `+${n * 10} % d'encre et de cristaux`, max: 5, cout: (n) => 40 * (n + 1) },
  { id: "vies", nom: "Ténacité", texte: (n) => `+${n} vie${n > 1 ? "s" : ""} au départ`, max: 2, cout: (n) => [150, 400][n] },
  { id: "choix", nom: "Clairvoyance", texte: (n) => (n ? "4 bénédictions au choix au lieu de 3" : "3 bénédictions au choix"), max: 1, cout: () => 250 },
  { id: "depart", nom: "Bénédiction de départ", texte: (n) => (n ? "une bénédiction au hasard dès l'entrée" : "aucune bénédiction au départ"), max: 1, cout: () => 200 },
];
export const MAITRISES_PAR_ID = Object.fromEntries(MAITRISES.map((m) => [m.id, m]));

// Le record du donjon rend aussi chanceux a l'autel (Index) : +1 % par 10 etages, plafond +10 %
export const CHANCE_PAR_10_ETAGES_DONJON = 0.01;
export const CHANCE_DONJON_MAX = 0.1;
