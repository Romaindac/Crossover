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
export const TABLE_INVOCATION = { commun: 0.567, peu_commun: 0.28, rare: 0.125, epique: 0.025, legendaire: 0.003, secret: 0.0002 };
// La chance multiplie le poids des raretes Rare et au-dessus (le Commun recule d'autant)
export const RARETES_CHANCEUSES = ["rare", "epique", "legendaire", "secret"];
export const PITIE_INVOCATION = 300;           // un Legendaire garanti a la 300e invocation sans Legendaire (un Secret remet aussi le compteur a zero)
// Secret : 0,02 % (environ 1 invocation sur 5 000), multiplie par la chance comme les Rares et au-dessus ; jamais garanti

// ---------- Bordures (meme force, autre cadre ; elles comptent dans l'Index) ----------
// Du plus rare au plus courant : on tire dans cet ordre
export const BORDURES = [
  { id: "neant", nom: "Néant", chance: 0.0002 },
  { id: "arcenciel", nom: "Arc-en-ciel", chance: 0.001 },
  { id: "doree", nom: "Dorée", chance: 0.005 },
  { id: "holo", nom: "Holo", chance: 0.03 },
];
// La bordure Boss ne s'invoque pas : seul le premier KO d'un boss de l'Arene la donne
export const BORDURE_BOSS = { id: "boss", nom: "Boss", chance: 0 };
// La bordure Eveille non plus : seule la quete du perso la donne
export const BORDURE_EVEILLE = { id: "eveille", nom: "Éveillé", chance: 0 };
export const BORDURES_PAR_ID = Object.fromEntries([...BORDURES, BORDURE_BOSS, BORDURE_EVEILLE].map((b) => [b.id, b]));
export const ORDRE_BORDURES = ["holo", "doree", "arcenciel", "eveille", "neant", "boss"];   // de la plus courante a la plus prestigieuse

// ---------- Niveau d'autel : il monte avec le nombre d'invocations ----------
// Chaque niveau donne des points d'autel a repartir ; certains debloquent un pouvoir.
// Apres le dernier palier de la liste, un niveau de plus toutes les 5 000 invocations.
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
export const INVOCATIONS_PAR_NIVEAU_EN_PLUS = 5000;

// ---------- Points d'autel : 3 par niveau, a placer ou on veut (plafond par branche) ----------
export const POINTS_PAR_NIVEAU = 3;
export const BRANCHES_AUTEL = [
  { id: "chance", nom: "Chance", effet: (n) => `+${n * 2} % de chance`, max: 25 },
  { id: "vitesse", nom: "Vitesse", effet: (n) => `invocations ${n * 3} % plus rapides`, max: 15 },
  { id: "potions", nom: "Potions", effet: (n) => `potions ${n * 6} % plus longues`, max: 15 },
  { id: "bordure", nom: "Bordures", effet: (n) => `bordures +${n * 4} %`, max: 25 },
];
export const CHANCE_PAR_POINT = 0.02;
export const VITESSE_PAR_POINT = 0.03;
export const POTIONS_PAR_POINT = 0.06;
export const BORDURE_PAR_POINT = 0.04;
export const COUT_REDISTRIBUTION = 300;        // poussiere pour remettre ses points a zero

// ---------- Phases de l'autel : toutes les 5 minutes, la meme pour tout le monde ----------
// Calculees depuis l'heure (aucun serveur). poids : frequence relative.
export const MINUTES_PAR_PHASE = 5;
export const PHASES = [
  { id: "calme", nom: "Ciel calme", texte: "Aucun effet : l'autel se repose.", poids: 40 },
  { id: "sang", nom: "Lune de sang", texte: "Chance ×1,3", poids: 18, chance: 1.3 },
  { id: "eclipse", nom: "Éclipse", texte: "Bordures ×2", poids: 14, bordure: 2 },
  { id: "etoiles", nom: "Pluie d'étoiles", texte: "Une série à l'honneur : 3 fois plus de chances de sortir", poids: 14, serie: true },
  { id: "maree", nom: "Marée d'encre", texte: "Invocations 30 % plus rapides", poids: 10, vitesse: 0.7 },
  { id: "neant", nom: "Lune du Néant", texte: "Chance ×1,6 et bordures ×3", poids: 4, chance: 1.6, bordure: 3 },
];
export const PHASES_PAR_ID = Object.fromEntries(PHASES.map((p) => [p.id, p]));

// ---------- Index : la collection donne de la chance pour toujours ----------
export const CHANCE_SERIE_COMPLETE = 0.04;     // 20 series : +80 %
export const CHANCE_EDITION_COMPLETE = 0.1;    // 4 editions : +40 %
export const CHANCE_PAR_SECRET = 0.05;         // chaque Secret obtenu (20 : +100 %)
export const CHANCE_PAR_BORDURE = { holo: 0.002, doree: 0.005, arcenciel: 0.02, neant: 0.05, boss: 0.01, eveille: 0.02 };   // par perso et par bordure
// Les combats aussi rendent chanceux : boss de l'arene, mondes finis, Tour, eveils
export const CHANCE_BOSS_ARENE = 0.005;        // par boss vaincu (32 : +16 %)
export const CHANCE_MONDE_FINI = 0.05;         // les 8 boss d'un monde (4 : +20 %)
export const CHANCE_MONDE_DIFFICILE = 0.03;    // les memes en Difficile, Cauchemar, Celeste (12 : +36 %)
export const CHANCE_PAR_10_ETAGES = 0.01;      // record de la Tour, plafond +15 %
export const CHANCE_TOUR_MAX = 0.15;
export const CHANCE_PAR_EVEIL = 0.005;         // par palier d'eveil, tous persos confondus, plafond +15 %
export const CHANCE_EVEIL_MAX = 0.15;

// ---------- Potions (le temps file meme jeu ferme) ----------
export const POTIONS = [
  { id: "chance", nom: "Potion de chance", effet: "Chance ×1,5", minutes: 5, couleur: "#3fbf6e", poussiere: 60 },
  { id: "bordure", nom: "Potion de bordure", effet: "Bordures ×3", minutes: 5, couleur: "#b36bff", poussiere: 80 },
  { id: "vitesse", nom: "Potion de vitesse", effet: "Invocations 2× plus rapides", minutes: 5, couleur: "#3f8fff", poussiere: 40 },
  { id: "lune", nom: "Potion de lune", effet: "Relance la phase de l'autel (jamais « Ciel calme »)", minutes: 0, couleur: "#d9a441", poussiere: 120 },
];
export const POTIONS_PAR_ID = Object.fromEntries(POTIONS.map((p) => [p.id, p]));
export const MULT_POTION_CHANCE = 1.5;
export const MULT_POTION_BORDURE = 3;
export const MINUTES_POTION_MAX = 30;          // boire plusieurs fois rallonge, jusqu'a 30 min
export const POTIONS_DEPART = { chance: 2, bordure: 1, vitesse: 2, lune: 1 };

// ---------- Fusion : les doublons au-dela de 5 etoiles forgent une bordure ----------
// (ils donnent toujours leur poussiere ; ils comptent en plus ici)
export const FUSION = [
  { bordure: "holo", doublons: 10 },
  { bordure: "doree", doublons: 30 },
  { bordure: "arcenciel", doublons: 100 },
];
export const CHANCE_POTION_VICTOIRE = 0.12;    // une potion au hasard sur 12 % des victoires

// ---------- Poussiere des invocations ----------
// Un doublon d'un perso deja a 5 etoiles : moins que dans un booster (on invoque beaucoup plus)
export const POUSSIERE_DOUBLON_INVOCATION = { commun: 2, peu_commun: 4, rare: 10, epique: 30, legendaire: 80, secret: 300 };

// ---------- Mondes : un autel par edition, ouverts par la campagne ----------
// chapitre : le chapitre de campagne a terminer pour ouvrir l'autel (0 = ouvert d'emblee)
export const MONDES = [
  { edition: "shonen", nom: "Autel du Soleil levant", chapitre: 0 },
  { edition: "vague", nom: "Autel de la Nouvelle Lune", chapitre: 1 },
  { edition: "aventures", nom: "Autel des Quatre Vents", chapitre: 2 },
  { edition: "tenebres", nom: "Autel de l'Abîme", chapitre: 3 },
];
