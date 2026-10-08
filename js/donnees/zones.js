// ==========================================================
// LES 5 ZONES DE CHASSE
// Chaque zone : 3 sous-zones (Lisiere, Coeur, Repaire) avec
// 3 groupes de reflets chacune, puis un boss.
// Les tables de butin sont construites a partir du catalogue.
// ==========================================================

import { OBJETS } from "./objets.js";
import { CHANCE_DROP } from "./equipement.js";

const z = (id, nom, decor, niveaux, sousZones, boss) => ({ id, nom, decor, niveaux, sousZones, boss });
const sz = (nom, niveau, groupes) => ({ nom, niveau, groupes });
const g = (nom, equipe) => ({ nom, equipe });

export const ZONES = [
  z(1, "Terrain d'entraînement", "terrain", [1, 10], [
    sz("Lisière", 2, [
      g("Patrouille d'apprentis", ["ronflex", "gon", "sakura", "megumi", "chopper"]),
      g("Duo des têtus", ["luffy", "ronflex", "naruto", "gon", "sakura"]),
      g("Échauffement matinal", ["piccolo", "gon", "chopper", "megumi", "sakura"]),
    ]),
    sz("Cœur", 5, [
      g("Sparring du midi", ["luffy", "piccolo", "naruto", "goku", "sakura"]),
      g("Rivaux de dojo", ["ronflex", "luffy", "gon", "naruto", "megumi"]),
      g("Gardiens du terrain", ["piccolo", "ronflex", "chopper", "sakura", "goku"]),
    ]),
    sz("Repaire", 8, [
      g("Élèves du maître", ["piccolo", "luffy", "goku", "naruto", "chopper"]),
      g("Ultime entraînement", ["ronflex", "piccolo", "goku", "gon", "sakura"]),
      g("Reflets acharnés", ["luffy", "ronflex", "naruto", "goku", "megumi"]),
    ]),
  ], { nom: "Reflet de Piccolo", niveau: 10, equipe: ["piccolo", "ronflex", "goku", "naruto", "sakura"] }),

  z(2, "Forteresse de fer", "forteresse", [8, 16], [
    sz("Lisière", 9, [
      g("Garnison de reflets", ["zodd", "luffy", "chopper", "zoro", "sakura"]),
      g("Ronde des remparts", ["ronflex", "zodd", "guts", "chopper", "griffith"]),
      g("Sentinelles", ["luffy", "piccolo", "zoro", "chopper", "megumi"]),
    ]),
    sz("Cœur", 12, [
      g("Bataillon de fer", ["zodd", "ronflex", "guts", "zoro", "chopper"]),
      g("Escouade du siège", ["luffy", "zodd", "griffith", "zoro", "sakura"]),
      g("Murs vivants", ["ronflex", "luffy", "chopper", "griffith", "guts"]),
    ]),
    sz("Repaire", 15, [
      g("Garde du donjon", ["zodd", "luffy", "guts", "griffith", "chopper"]),
      g("Lames du rempart", ["ronflex", "zodd", "zoro", "guts", "sakura"]),
      g("Derniers défenseurs", ["luffy", "nezuko", "griffith", "zoro", "chopper"]),
    ]),
  ], { nom: "Reflet de Zodd", niveau: 17, equipe: ["zodd", "luffy", "guts", "griffith", "chopper"] }),

  z(3, "Toits de la nuit", "toits", [14, 22], [
    sz("Lisière", 15, [
      g("Ombres furtives", ["nezuko", "ronflex", "killua", "pikachu", "tanjiro"]),
      g("Guetteurs", ["ronflex", "nezuko", "zenitsu", "sasuke", "chopper"]),
      g("Pas feutrés", ["luffy", "nezuko", "killua", "zenitsu", "sakura"]),
    ]),
    sz("Cœur", 18, [
      g("Chasseurs de toits", ["nezuko", "ronflex", "sasuke", "killua", "tanjiro"]),
      g("Lames de minuit", ["nezuko", "zodd", "vegeta", "zenitsu", "pikachu"]),
      g("Traque silencieuse", ["ronflex", "nezuko", "killua", "sasuke", "sakura"]),
    ]),
    sz("Repaire", 21, [
      g("Clan des ombres", ["nezuko", "ronflex", "vegeta", "killua", "zenitsu"]),
      g("Éclairs nocturnes", ["zodd", "nezuko", "sasuke", "zenitsu", "pikachu"]),
      g("Assassins d'encre", ["nezuko", "luffy", "vegeta", "sasuke", "killua"]),
    ]),
  ], { nom: "Reflet de Sasuke", niveau: 23, equipe: ["nezuko", "ronflex", "sasuke", "killua", "zenitsu"] }),

  z(4, "Domaine", "domaine", [20, 28], [
    sz("Lisière", 21, [
      g("Initiés du domaine", ["zodd", "luffy", "megumi", "kurapika", "sakura"]),
      g("Brume mystique", ["ronflex", "piccolo", "pikachu", "megumi", "griffith"]),
      g("Gardiens des runes", ["zodd", "ronflex", "kurapika", "yuji", "sakura"]),
    ]),
    sz("Cœur", 24, [
      g("Cercle des scellés", ["zodd", "luffy", "gojo", "megumi", "sakura"]),
      g("Esprits liés", ["ronflex", "zodd", "mewtwo", "kurapika", "griffith"]),
      g("Règles brisées", ["luffy", "piccolo", "yuji", "pikachu", "kurapika"]),
    ]),
    sz("Repaire", 27, [
      g("Maîtres du domaine", ["zodd", "luffy", "gojo", "kurapika", "griffith"]),
      g("Contrôle absolu", ["ronflex", "zodd", "mewtwo", "pikachu", "kurapika"]),
      g("Disciples du sceau", ["zodd", "nezuko", "gojo", "megumi", "sakura"]),
    ]),
  ], { nom: "Reflet de Gojo", niveau: 29, equipe: ["zodd", "luffy", "gojo", "kurapika", "mewtwo"] }),

  z(5, "Brasier", "brasier", [26, 32], [
    sz("Lisière", 27, [
      g("Flammes errantes", ["zodd", "ronflex", "guts", "yuji", "griffith"]),
      g("Cendres vivantes", ["ronflex", "luffy", "vegeta", "goku", "sakura"]),
      g("Braises dansantes", ["zodd", "piccolo", "yuji", "mewtwo", "griffith"]),
    ]),
    sz("Cœur", 29, [
      g("Légendes déchues", ["ronflex", "zodd", "goku", "vegeta", "griffith"]),
      g("Feu sacré", ["zodd", "luffy", "mewtwo", "guts", "sakura"]),
      g("Héros d'encre", ["ronflex", "nezuko", "goku", "gojo", "griffith"]),
    ]),
    sz("Repaire", 31, [
      g("Gardiens du brasier", ["ronflex", "zodd", "goku", "mewtwo", "griffith"]),
      g("Avant-garde de la Rature", ["zodd", "luffy", "gojo", "vegeta", "griffith"]),
      g("Dernier rempart", ["ronflex", "zodd", "goku", "gojo", "sakura"]),
    ]),
  ], { nom: "La Rature", niveau: 32, equipe: ["rature", "zodd", "goku", "mewtwo", "gojo"] }),
];

export const NOMS_SOUS_ZONES = ["Lisière", "Cœur", "Repaire", "Boss"];
export const MULT_SOUS_ZONE = 0.85;      // difficulte des groupes (calibree au simulateur)
export const MULT_BOSS = 1.0;
export const CHANCE_DORE = 0.08;         // un groupe sur 12 environ est dore
export const BONUS_DORE = { niveau: 2, mult: 1.1, butin: 2 };

// Table de butin d'une sous-zone (index 0 a 2) ou du boss (index 3)
export function tableButin(zone, index) {
  const objets = OBJETS.filter((o) => o.zone === zone.id);
  const duBoss = (o) => o.rarete === "epique" || o.rarete === "legendaire";
  let liste;
  if (index === 3) {
    liste = objets.filter((o) => duBoss(o) || o.rarete === "rare");
  } else {
    const niveau = zone.sousZones[index].niveau;
    liste = objets.filter((o) => !duBoss(o) && o.niveau <= niveau + 4);
    if (!liste.length) liste = objets.filter((o) => !duBoss(o)).slice(0, 4);
  }
  return liste.map((o) => ({ objet: o.id, chance: CHANCE_DROP[o.rarete] }));
}

// Gains d'un combat de chasse (pas d'encre : elle reste reservee aux tirages)
// La boucle tourne en x3 sans menus : l'XP par combat est plus faible qu'aux paliers,
// pour que la chasse automatique ne rapporte pas plus que le jeu actif.
export const xpChasse = (niveau, victoire) => (victoire ? 8 + Math.round(1.5 * niveau) : 4);
export const eclatsChasse = (niveau, victoire, boss) => (victoire ? (2 + Math.floor(niveau / 4)) * (boss ? 3 : 1) : 0);
