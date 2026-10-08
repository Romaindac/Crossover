// ==========================================================
// LA CAMPAGNE : 5 chapitres de 8 etapes
// Etapes 1-3 et 5-7 : combats normaux. Etape 4 : elite.
// Etape 8 : boss. Chaque chapitre se passe dans un monde.
// ==========================================================

const e = (nom, equipe) => ({ nom, equipe });

const CONTENU = [
  { nom: "Le terrain d'entraînement", decor: "terrain", debut: 1, etapes: [
    e("Premiers reflets", ["ronflex", "gon", "sakura", "megumi", "chopper"]),
    e("Les têtus", ["luffy", "ronflex", "naruto", "gon", "sakura"]),
    e("Course d'encre", ["luffy", "gon", "pikachu", "chopper", "megumi"]),
    e("Le sparring piégé", ["piccolo", "ronflex", "naruto", "goku", "sakura"]),
    e("Coups de bâton", ["luffy", "piccolo", "gon", "naruto", "chopper"]),
    e("Copies conformes", ["ronflex", "luffy", "naruto", "gon", "sakura"]),
    e("La dernière série", ["piccolo", "luffy", "goku", "naruto", "megumi"]),
    e("Reflet de Piccolo", ["piccolo", "ronflex", "goku", "naruto", "sakura"]),
  ] },
  { nom: "La forteresse de fer", decor: "forteresse", debut: 7, etapes: [
    e("Au pied des remparts", ["zodd", "luffy", "zoro", "chopper", "sakura"]),
    e("La porte nord", ["ronflex", "zodd", "guts", "chopper", "megumi"]),
    e("Les sentinelles", ["luffy", "piccolo", "zoro", "griffith", "chopper"]),
    e("Le capitaine de garde", ["zodd", "ronflex", "guts", "griffith", "sakura"]),
    e("Le chemin de ronde", ["luffy", "zodd", "zoro", "guts", "chopper"]),
    e("La salle d'armes", ["ronflex", "luffy", "guts", "griffith", "sakura"]),
    e("Le donjon", ["zodd", "nezuko", "zoro", "griffith", "chopper"]),
    e("Reflet de Zodd", ["zodd", "luffy", "guts", "griffith", "chopper"]),
  ] },
  { nom: "Les toits de la nuit", decor: "toits", debut: 13, etapes: [
    e("Pas sur les tuiles", ["nezuko", "ronflex", "killua", "pikachu", "tanjiro"]),
    e("Ombres en chasse", ["ronflex", "nezuko", "zenitsu", "sasuke", "sakura"]),
    e("Le guet", ["luffy", "nezuko", "killua", "zenitsu", "chopper"]),
    e("Le maître des ombres", ["nezuko", "zodd", "vegeta", "killua", "zenitsu"]),
    e("Lanternes éteintes", ["ronflex", "nezuko", "sasuke", "tanjiro", "pikachu"]),
    e("La ruelle", ["nezuko", "luffy", "vegeta", "zenitsu", "sakura"]),
    e("Minuit", ["zodd", "nezuko", "sasuke", "killua", "pikachu"]),
    e("Reflet de Sasuke", ["nezuko", "ronflex", "sasuke", "killua", "zenitsu"]),
  ] },
  { nom: "Le domaine", decor: "domaine", debut: 19, etapes: [
    e("Le seuil", ["zodd", "luffy", "megumi", "kurapika", "sakura"]),
    e("Les runes", ["ronflex", "piccolo", "pikachu", "megumi", "griffith"]),
    e("Règles inversées", ["zodd", "ronflex", "kurapika", "yuji", "sakura"]),
    e("Le gardien du sceau", ["zodd", "luffy", "gojo", "megumi", "sakura"]),
    e("Brume liée", ["ronflex", "zodd", "mewtwo", "kurapika", "griffith"]),
    e("Le cercle", ["luffy", "piccolo", "yuji", "pikachu", "kurapika"]),
    e("Le cœur du domaine", ["zodd", "nezuko", "gojo", "kurapika", "griffith"]),
    e("Reflet de Gojo", ["zodd", "luffy", "gojo", "kurapika", "mewtwo"]),
  ] },
  { nom: "La légende", decor: "brasier", debut: 25, etapes: [
    e("Les cendres", ["zodd", "ronflex", "guts", "yuji", "griffith"]),
    e("Flammes jumelles", ["ronflex", "luffy", "vegeta", "goku", "sakura"]),
    e("Le pont de braise", ["zodd", "piccolo", "yuji", "mewtwo", "griffith"]),
    e("L'avant-garde", ["ronflex", "zodd", "goku", "vegeta", "griffith"]),
    e("Le feu sacré", ["zodd", "luffy", "mewtwo", "guts", "sakura"]),
    e("Les héros d'encre", ["ronflex", "nezuko", "goku", "gojo", "griffith"]),
    e("Aux portes du cœur", ["zodd", "luffy", "gojo", "vegeta", "griffith"]),
    e("La Rature", ["rature", "zodd", "goku", "mewtwo", "gojo"]),
  ] },
];

// Difficulte des etapes normales de chaque chapitre (calibree au simulateur V0.3)
export const MULT_PAR_CHAPITRE = [0.85, 1.06, 1.15, 1.25, 1.25];   // recale au simulateur (160 persos, boosters toutes les 15 min) : fin vers le jour 17-19
export const MULT_ETAPE = MULT_PAR_CHAPITRE[0];
const TYPES = ["normal", "normal", "normal", "elite", "normal", "normal", "normal", "boss"];
const BONUS_TYPE = { normal: { niveau: 0, mult: 1, encre: 1 }, elite: { niveau: 1, mult: 1.12, encre: 1.5 }, boss: { niveau: 1, mult: 1.25, encre: 2 } };

export const CHAPITRES = CONTENU.map((c, i) => ({
  id: i + 1,
  nom: c.nom,
  decor: c.decor,
  etapes: c.etapes.map((et, j) => {
    const type = TYPES[j];
    return {
      chapitre: i + 1,
      numero: j + 1,
      global: i * 8 + j + 1,     // de 1 a 40
      type,
      nom: et.nom,
      equipe: et.equipe,
      niveau: c.debut + j + BONUS_TYPE[type].niveau,
      multiplicateur: MULT_PAR_CHAPITRE[i] * BONUS_TYPE[type].mult,
    };
  }),
}));

export const etapeDe = (chapitre, numero) => CHAPITRES[chapitre - 1]?.etapes[numero - 1] ?? null;
export const TOUTES_LES_ETAPES = CHAPITRES.flatMap((c) => c.etapes);

// ---------- Recompenses ----------

export const encreEtape = (etape, premiere) =>
  premiere ? Math.round((30 + 3 * etape.global) * BONUS_TYPE[etape.type].encre) : 2 + Math.floor(etape.global / 4);
export const xpEtape = (etape, victoire) => (victoire ? Math.round(20 + 2 * etape.niveau) : 8);

// Etoiles de victoire (un masque de 3 bits)
export const ETOILE_VICTOIRE = 1;
export const ETOILE_SANS_KO = 2;
export const ETOILE_RAPIDE = 4;
export const SECONDES_RAPIDE = 40;
export const nombreEtoiles = (masque) => (masque & 1) + ((masque >> 1) & 1) + ((masque >> 2) & 1);

// Coffres d'etoiles de chaque chapitre
export const COFFRES = [
  { etoiles: 8, encre: 100, eclats: 50, objet: null },
  { etoiles: 16, encre: 150, eclats: 100, objet: "rare" },
  { etoiles: 24, encre: 250, eclats: 200, objet: "epique" },
];
