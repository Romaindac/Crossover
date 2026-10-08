// ==========================================================
// LES 10 PALIERS
// L'ordre des persos = leur place : les 2 premiers en ligne
// avant, les 3 suivants en ligne arriere.
// niveau        : niveau des ennemis (meme formule que tes persos)
// decor         : le lieu du combat (voir js/ui/decors.js)
// multiplicateur: reglage fin de la difficulte (PV et ATQ), calibre en
//                 simulation pour une courbe de progression reguliere
// ==========================================================

const ECHAUFFEMENT = ["ronflex", "piccolo", "goku", "naruto", "sakura"];
const MUR_DE_FER = ["luffy", "zodd", "chopper", "sakura", "griffith"];
const RAID = ["ronflex", "nezuko", "sasuke", "killua", "zenitsu"];
const CONTROLE = ["zodd", "luffy", "gojo", "pikachu", "kurapika"];
const LEGENDES = ["ronflex", "zodd", "goku", "gojo", "griffith"];

export const PALIERS = [
  { palier: 1,  nom: "Échauffement",        niveau: 1,  multiplicateur: 0.9,  equipe: ECHAUFFEMENT, decor: "terrain" },
  { palier: 2,  nom: "Mur de fer",          niveau: 3,  multiplicateur: 0.85, equipe: MUR_DE_FER, decor: "forteresse" },
  { palier: 3,  nom: "Raid d'assassins",    niveau: 6,  multiplicateur: 0.85, equipe: RAID, decor: "toits" },
  { palier: 4,  nom: "Contrôle total",      niveau: 9,  multiplicateur: 1.0,  equipe: CONTROLE, decor: "domaine" },
  { palier: 5,  nom: "Légendes",            niveau: 12, multiplicateur: 1.0,  equipe: LEGENDES, decor: "brasier" },
  { palier: 6,  nom: "Échauffement II",     niveau: 15, multiplicateur: 1.0,  equipe: ECHAUFFEMENT, decor: "terrain" },
  { palier: 7,  nom: "Mur de fer II",       niveau: 18, multiplicateur: 1.05, equipe: MUR_DE_FER, decor: "forteresse" },
  { palier: 8,  nom: "Raid d'assassins II", niveau: 22, multiplicateur: 0.9,  equipe: RAID, decor: "toits" },
  { palier: 9,  nom: "Contrôle total II",   niveau: 26, multiplicateur: 1.05, equipe: CONTROLE, decor: "domaine" },
  { palier: 10, nom: "Légendes II",         niveau: 30, multiplicateur: 0.95, equipe: LEGENDES, decor: "brasier" },
];
