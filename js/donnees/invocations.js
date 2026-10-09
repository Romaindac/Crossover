// ==========================================================
// L'AUTEL D'INVOCATION : le coeur de la collection
// On invoque une carte a la fois, vite, tant qu'il reste des
// invocations en reserve (elles se rechargent avec le temps et
// avec les victoires). La chance, les potions, les bordures et
// les mondes (un autel par edition) sont regles ici.
// ==========================================================

// ---------- Reserve d'invocations ----------
export const INVOCATIONS_MAX = 120;            // la reserve se remplit en 6 h...
export const MINUTES_PAR_INVOCATION = 3;       // ...a raison d'une toutes les 3 minutes (6 h)
export const INVOCATIONS_DEPART = 60;
export const INVOCATIONS_VICTOIRE = 1;         // chaque combat gagne (campagne, Tour, chasse)
export const INVOCATIONS_PLAFOND = 600;        // les cadeaux peuvent depasser la reserve, pas ce plafond

// ---------- Rythme ----------
export const DELAI_TIRAGE_MS = 2200;           // temps entre deux invocations
export const DELAI_RAPIDE_MS = 1000;           // une fois le tirage rapide debloque
export const FACTEUR_POTION_VITESSE = 0.5;

// ---------- Chances de base, par invocation ----------
export const TABLE_INVOCATION = { commun: 0.567, peu_commun: 0.28, rare: 0.125, epique: 0.025, legendaire: 0.003 };
// La chance multiplie le poids des raretes Rare et au-dessus (le Commun recule d'autant)
export const RARETES_CHANCEUSES = ["rare", "epique", "legendaire"];
export const PITIE_INVOCATION = 300;           // un Legendaire garanti a la 300e invocation sans Legendaire

// ---------- Bordures (meme force, autre cadre ; elles comptent dans l'Index) ----------
// Du plus rare au plus courant : on tire dans cet ordre
export const BORDURES = [
  { id: "neant", nom: "Néant", chance: 0.0002 },
  { id: "arcenciel", nom: "Arc-en-ciel", chance: 0.001 },
  { id: "doree", nom: "Dorée", chance: 0.005 },
  { id: "holo", nom: "Holo", chance: 0.03 },
];
export const BORDURES_PAR_ID = Object.fromEntries(BORDURES.map((b) => [b.id, b]));
export const ORDRE_BORDURES = ["holo", "doree", "arcenciel", "neant"];   // de la plus courante a la plus rare

// ---------- Niveau d'autel : il monte avec le nombre d'invocations ----------
// Chaque niveau donne +3 % de chance ; certains debloquent un pouvoir.
export const NIVEAUX_AUTEL = [
  { invocations: 0 },
  { invocations: 10, pouvoir: "auto", texte: "Invocation automatique" },
  { invocations: 100, pouvoir: "rapide", texte: "Invocation rapide" },
  { invocations: 250 },
  { invocations: 500, pouvoir: "triple", texte: "Invocation ×3" },
  { invocations: 1000 },
  { invocations: 2000 },
  { invocations: 3500 },
  { invocations: 5000 },
  { invocations: 7500 },
  { invocations: 10000 },
  { invocations: 15000 },
];
export const CHANCE_PAR_NIVEAU = 0.03;

// ---------- Index : la collection donne de la chance pour toujours ----------
export const CHANCE_SERIE_COMPLETE = 0.04;     // 20 series : +80 %
export const CHANCE_EDITION_COMPLETE = 0.1;    // 4 editions : +40 %
export const CHANCE_PAR_BORDURE = { holo: 0.002, doree: 0.005, arcenciel: 0.02, neant: 0.05 };   // par perso et par bordure

// ---------- Potions (le temps file meme jeu ferme) ----------
export const POTIONS = [
  { id: "chance", nom: "Potion de chance", effet: "Chance ×1,5", minutes: 5, couleur: "#3fbf6e", poussiere: 60 },
  { id: "bordure", nom: "Potion de bordure", effet: "Bordures ×3", minutes: 5, couleur: "#b36bff", poussiere: 80 },
  { id: "vitesse", nom: "Potion de vitesse", effet: "Invocations 2× plus rapides", minutes: 5, couleur: "#3f8fff", poussiere: 40 },
];
export const POTIONS_PAR_ID = Object.fromEntries(POTIONS.map((p) => [p.id, p]));
export const MULT_POTION_CHANCE = 1.5;
export const MULT_POTION_BORDURE = 3;
export const MINUTES_POTION_MAX = 30;          // boire plusieurs fois rallonge, jusqu'a 30 min
export const POTIONS_DEPART = { chance: 2, bordure: 1, vitesse: 2 };
export const CHANCE_POTION_VICTOIRE = 0.12;    // une potion au hasard sur 12 % des victoires

// ---------- Poussiere des invocations ----------
// Un doublon d'un perso deja a 5 etoiles : moins que dans un booster (on invoque beaucoup plus)
export const POUSSIERE_DOUBLON_INVOCATION = { commun: 2, peu_commun: 4, rare: 10, epique: 30, legendaire: 80 };

// ---------- Mondes : un autel par edition, ouverts par la campagne ----------
// chapitre : le chapitre de campagne a terminer pour ouvrir l'autel (0 = ouvert d'emblee)
export const MONDES = [
  { edition: "shonen", nom: "Autel du Soleil levant", chapitre: 0 },
  { edition: "vague", nom: "Autel de la Nouvelle Lune", chapitre: 1 },
  { edition: "aventures", nom: "Autel des Quatre Vents", chapitre: 2 },
  { edition: "tenebres", nom: "Autel de l'Abîme", chapitre: 3 },
];
