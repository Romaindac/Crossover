// ==========================================================
// BOOSTERS : la seule facon d'obtenir des persos
// Chaque edition a son theme et ses series. Un booster contient
// 5 cartes : 3 cases « communes », 1 case « peu commune ou mieux »
// et 1 case « rare ou mieux ». Tous les chiffres a regler sont ici.
// ==========================================================

export const EDITIONS = [
  {
    id: "shonen", nom: "Shōnen Légendes", numero: 1,
    texte: "Les piliers du genre : les héros qui ont tout commencé.",
    series: ["Dragon Ball", "Naruto", "One Piece", "Bleach"],
  },
  {
    id: "vague", nom: "Nouvelle Vague", numero: 2,
    texte: "La relève : exorcistes, pourfendeurs de démons et apprentis héros.",
    series: ["Jujutsu Kaisen", "Demon Slayer", "My Hero Academia"],
  },
  {
    id: "aventures", nom: "Grandes Aventures", numero: 3,
    texte: "Voyages, guildes et compagnons : l'aventure avant tout.",
    series: ["Pokémon", "Hunter x Hunter", "Fairy Tail", "Frieren"],
  },
  {
    id: "tenebres", nom: "Ténèbres", numero: 4,
    texte: "Dark fantasy, titans et démons : les pages les plus sombres.",
    series: ["Berserk", "L'Attaque des Titans", "Chainsaw Man"],
  },
];

export const EDITIONS_PAR_ID = Object.fromEntries(EDITIONS.map((e) => [e.id, e]));
export const editionDeSerie = (serie) => EDITIONS.find((e) => e.series.includes(serie)) ?? null;

export const CARTES_PAR_BOOSTER = 5;

// Chances par case (la serie a l'honneur de la semaine compte double dans sa rarete)
export const CASES_BOOSTER = [
  { commun: 0.7, peu_commun: 0.3 },
  { commun: 0.7, peu_commun: 0.3 },
  { commun: 0.7, peu_commun: 0.3 },
  { peu_commun: 0.62, rare: 0.28, epique: 0.08, legendaire: 0.02 },
  { rare: 0.72, epique: 0.2, legendaire: 0.08 },
];

// Booster dore : rarissime, 5 cartes Epiques ou Legendaires
export const CHANCE_BOOSTER_DORE = 0.005;
export const CASE_DOREE = { epique: 0.7, legendaire: 0.3 };

// Pitie : un Legendaire garanti dans la derniere case au 20e booster sans Legendaire
export const PITIE_BOOSTER = 20;

// Variantes cosmetiques (meme force, autre cadre) : par carte
export const CHANCE_HOLO = 0.06;
export const CHANCE_DOREE = 0.01;
export const VARIANTES = {
  holo: { nom: "Holo" },
  doree: { nom: "Dorée" },
};

// Prix et booster gratuit
export const PRIX_BOOSTER = 300;                  // encre
export const HEURES_BOOSTER_GRATUIT = 12;          // un ticket gratuit toutes les 12 h...
export const STOCK_GRATUIT_MAX = 2;                // ...tant qu'on en a moins de 2 en reserve
export const TICKETS_DEPART = 3;                   // de quoi ouvrir 3 boosters au debut
export const TICKETS_CHAPITRE = 2;                 // offerts a chaque chapitre de campagne fini
// (le bonus des 3 missions du jour reclamees donne aussi 1 ticket)

// Poussiere : chaque booster en donne un peu, et un doublon d'un perso deja a 5 etoiles
// se change en poussiere. Elle sert a fabriquer la carte de son choix a l'atelier.
export const POUSSIERE_PAR_BOOSTER = 10;
export const POUSSIERE_DOUBLON = { commun: 20, peu_commun: 40, rare: 80, epique: 160, legendaire: 320 };
export const COUT_FABRICATION = { commun: 150, peu_commun: 300, rare: 600, epique: 1200, legendaire: 2400 };
