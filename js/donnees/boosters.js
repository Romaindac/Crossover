// ==========================================================
// BOOSTERS : la seule facon d'obtenir des persos
// Chaque edition a son theme et ses series. Un booster contient
// 3 cartes : une case « commune », une « commune ou mieux » et une
// « peu commune ou mieux ». Tous les chiffres a regler sont ici.
// ==========================================================

// couleurs : [principale, sombre, claire] du sachet ; vedettes : les 3 persos dessines dessus
export const EDITIONS = [
  {
    id: "shonen", nom: "Shōnen Légendes", numero: 1,
    texte: "Les piliers du genre : les héros qui ont tout commencé, chevaliers du zodiaque compris.",
    couleurs: ["#f08a1c", "#c2410c", "#fde68a"], vedettes: ["naruto", "goku", "luffy"],
    series: ["Dragon Ball", "Naruto", "One Piece", "Bleach", "Saint Seiya"],
  },
  {
    id: "vague", nom: "Nouvelle Vague", numero: 2,
    texte: "La relève : exorcistes, pourfendeurs de démons, mages et chasseurs.",
    couleurs: ["#6d28d9", "#1e1b4b", "#c4b5fd"], vedettes: ["tanjiro", "gojo", "deku"],
    series: ["Jujutsu Kaisen", "Demon Slayer", "My Hero Academia", "Black Clover", "Solo Leveling"],
  },
  {
    id: "aventures", nom: "Grandes Aventures", numero: 3,
    texte: "Voyages, guildes, alchimistes et compagnons : l'aventure avant tout.",
    couleurs: ["#0f9d74", "#0b4f6c", "#a7f3d0"], vedettes: ["gon", "frieren", "natsu"],
    series: ["Pokémon", "Hunter x Hunter", "Fairy Tail", "Frieren", "Fullmetal Alchemist"],
  },
  {
    id: "tenebres", nom: "Ténèbres", numero: 4,
    texte: "Dark fantasy, titans, goules et vampires : les pages les plus sombres.",
    couleurs: ["#b91c1c", "#1c1917", "#fca5a5"], vedettes: ["eren", "guts", "denji"],
    series: ["Berserk", "L'Attaque des Titans", "Chainsaw Man", "Tokyo Ghoul", "JoJo"],
  },
  {
    id: "generation", nom: "Nouvelle Génération", numero: 5,
    texte: "Les phénomènes d'aujourd'hui : ninjas damnés, ovnis et yokai, kaiju, espions et buteurs.",
    couleurs: ["#e6007e", "#1a0b2e", "#ffb3e0"], vedettes: ["okarun", "kafka", "anya"],
    series: ["Hell's Paradise", "Dandadan", "Kaiju n°8", "Spy x Family", "Blue Lock"],
  },
];

export const EDITIONS_PAR_ID = Object.fromEntries(EDITIONS.map((e) => [e.id, e]));
export const editionDeSerie = (serie) => EDITIONS.find((e) => e.series.includes(serie)) ?? null;

// Un booster gratuit toutes les 30 minutes (reserve de 8 tickets, soit 4 h) : chaque booster est donc petit
// (3 cartes) et les grosses raretes sont rares. Simulation (200 joueurs) :
// 36 persos apres 25 boosters, 56 apres 100, la collection complete vers
// 1 000 boosters (environ 5 semaines pour un joueur regulier).
export const CARTES_PAR_BOOSTER = 3;

// Chances par case (la serie a l'honneur de la semaine compte double dans sa rarete)
export const CASES_BOOSTER = [
  { commun: 0.8, peu_commun: 0.2 },
  { commun: 0.5, peu_commun: 0.38, rare: 0.12 },
  { peu_commun: 0.6, rare: 0.335, epique: 0.06, legendaire: 0.005 },
];

// Booster dore : rarissime, 3 cartes Epiques ou Legendaires
export const CHANCE_BOOSTER_DORE = 0.003;
export const CASE_DOREE = { epique: 0.75, legendaire: 0.25 };

// Pitie : un Legendaire garanti dans la derniere case au 150e booster sans Legendaire
export const PITIE_BOOSTER = 150;

// Variantes (autre cadre, petit bonus de stats : BONUS_STATS_BORDURE dans invocations.js) : par carte
export const CHANCE_HOLO = 0.02;
export const CHANCE_DOREE = 0.0025;
export const VARIANTES = {
  holo: { nom: "Holo" },
  doree: { nom: "Dorée" },
};

// Prix et booster gratuit
export const PRIX_BOOSTER = 100;                   // encre
export const MINUTES_BOOSTER_GRATUIT = 30;         // un ticket gratuit toutes les 30 minutes...
export const STOCK_GRATUIT_MAX = 8;                // ...tant qu'on en a moins de 8 en reserve (4 h)
export const TICKETS_DEPART = 3;                   // de quoi ouvrir 3 boosters apres le booster de depart
export const TICKETS_CHAPITRE = 3;                 // offerts a chaque chapitre de campagne fini
// (le bonus des 3 missions du jour reclamees donne aussi 1 ticket)

// Poussiere : chaque booster en donne un peu, et un doublon d'un perso deja a 5 etoiles
// se change en poussiere. Elle sert a fabriquer la carte de son choix a l'atelier.
export const POUSSIERE_PAR_BOOSTER = 2;
export const POUSSIERE_DOUBLON = { commun: 20, peu_commun: 40, rare: 80, epique: 160, legendaire: 320, secret: 640 };
export const COUT_FABRICATION = { commun: 150, peu_commun: 300, rare: 700, epique: 2000, legendaire: 5000 };

// Le booster de depart, offert une fois au debut (voir ouvrirBoosterDepart)
export const BOOSTER_DEPART = {
  nom: "Booster de départ", etiquette: "Offert", cartes: 5,
  couleurs: ["#efbd2b", "#7a4a00", "#fff3c4"], vedettes: ["luffy", "naruto", "tanjiro"],
};
