// ==========================================================
// LES 24 PERSOS DE LA V0.1
// Chaque perso : sa serie, son role, son affinite, sa rarete, de petits
// ajustements de stats (mods), son passif et son ultime.
// Ajouter un perso = ajouter une entree ici.
// ==========================================================

export const PERSOS = [
  // ---------- Dragon Ball ----------
  {
    id: "goku", nom: "Goku", serie: "Dragon Ball", role: "attaquant", affinite: "puissance", rarete: "legendaire",
    mods: { atq: 1.05 },
    passif: { nom: "Sang saiyan", description: "ATQ +25 % sous 50 % de PV", type: "atqSousPv", seuil: 0.5, bonus: 0.25 },
    ultime: { nom: "Kamehameha", description: "150 % de dégâts à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.5 },
    ] },
  },
  {
    id: "vegeta", nom: "Vegeta", serie: "Dragon Ball", role: "assassin", affinite: "chaos", rarete: "epique",
    mods: { atq: 1.05, pv: 0.95 },
    passif: { nom: "Fierté du prince", description: "ATQ +10 % par KO réalisé (max +30 %)", type: "atqParKo", bonus: 0.1, max: 0.3 },
    ultime: { nom: "Final Flash", description: "420 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 4.2 },
    ] },
  },
  {
    id: "piccolo", nom: "Piccolo", serie: "Dragon Ball", role: "tank", affinite: "esprit", rarete: "peu_commun",
    mods: { def: 1.05, atq: 1.05 },
    passif: { nom: "Régénération namek", description: "Récupère 3 % de ses PV max toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Makankosappo", description: "220 % à la cible en face et au perso derrière elle, puis Provocation", actions: [
      { type: "degats", cible: "face+derriere", mult: 2.2 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- Naruto ----------
  {
    id: "naruto", nom: "Naruto", serie: "Naruto", role: "attaquant", affinite: "esprit", rarete: "rare",
    mods: { pv: 1.08 },
    passif: { nom: "Volonté", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Multiclonage", description: "5 frappes de 100 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 1.0, coups: 5 },
    ] },
  },
  {
    id: "sasuke", nom: "Sasuke", serie: "Naruto", role: "assassin", affinite: "vitesse", rarete: "epique",
    mods: { vit: 1.05 },
    passif: { nom: "Sharingan", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Chidori", description: "340 % à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 3.4 },
    ] },
  },
  {
    id: "sakura", nom: "Sakura", serie: "Naruto", role: "soutien", affinite: "technique", rarete: "commun",
    mods: { atq: 1.1, pv: 1.05 },
    passif: { nom: "Maîtrise du chakra", description: "Soins +20 % sur les alliés sous 30 % de PV", type: "soinsBonusBlesses", seuil: 0.3, bonus: 0.2 },
    ultime: { nom: "Soin ninja", description: "Soigne tous les alliés de 15 % de leurs PV max", actions: [
      { type: "soin", cible: "allies", pourcent: 0.15 },
    ] },
  },

  // ---------- One Piece ----------
  {
    id: "luffy", nom: "Luffy", serie: "One Piece", role: "tank", affinite: "puissance", rarete: "rare",
    mods: { pv: 1.05 },
    passif: { nom: "Corps élastique", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Gatling", description: "6 coups de 60 % sur la ligne avant, puis Provocation", actions: [
      { type: "degats", cible: "ligne-avant-aleatoire", mult: 0.6, coups: 6 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "zoro", nom: "Zoro", serie: "One Piece", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: { atq: 1.08, vit: 0.95 },
    passif: { nom: "Sabreur", description: "Ses critiques font x1,8 au lieu de x1,5", type: "multCrit", valeur: 1.8 },
    ultime: { nom: "Santoryu", description: "450 % à une cible", actions: [
      { type: "degats", cible: "base", mult: 4.5 },
    ] },
  },
  {
    id: "chopper", nom: "Chopper", serie: "One Piece", role: "soutien", affinite: "technique", rarete: "commun",
    mods: { pv: 0.95, vit: 1.05 },
    passif: { nom: "Médecin de bord", description: "Soigne l'allié le plus blessé de 4 % toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.04, periode: 4 },
    ultime: { nom: "Rumble Ball", description: "Régénération sur toute l'équipe et Bouclier de 10 % sur la ligne avant", actions: [
      { type: "effet", cible: "allies", effet: "regeneration", duree: 5 },
      { type: "effet", cible: "allies-avant", effet: "bouclier", duree: 6, pourcentPv: 0.1 },
    ] },
  },

  // ---------- Pokemon ----------
  {
    id: "pikachu", nom: "Pikachu", serie: "Pokémon", role: "controle", affinite: "vitesse", rarete: "peu_commun",
    mods: { vit: 1.15 },
    passif: { nom: "Statik", description: "20 % de chance d'étourdir 1 s l'ennemi qui le frappe", type: "etourdirAttaquant", chance: 0.2, duree: 1 },
    ultime: { nom: "Tonnerre", description: "300 % à une cible et Étourdissement", actions: [
      { type: "degats", cible: "base", mult: 3.0, effet: { type: "etourdi", duree: 2 } },
    ] },
  },
  {
    id: "ronflex", nom: "Ronflex", serie: "Pokémon", role: "tank", affinite: "puissance", rarete: "commun",
    mods: { pv: 1.1, vit: 0.9 },
    passif: { nom: "Repos", description: "À 30 % de PV, dort 2 s et récupère 35 % de ses PV max (une fois)", type: "reposUneFois", seuil: 0.3, duree: 2, soin: 0.35 },
    ultime: { nom: "Plaquage", description: "200 % à la cible en face, Étourdissement 1,5 s et Provocation", actions: [
      { type: "degats", cible: "face", mult: 2.0, effet: { type: "etourdi", duree: 1.5 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "mewtwo", nom: "Mewtwo", serie: "Pokémon", role: "controle", affinite: "esprit", rarete: "legendaire",
    mods: { atq: 1.1, pv: 0.95 },
    passif: { nom: "Pression", description: "VIT des ennemis -6 %", type: "auraVitEnnemis", malus: 0.06 },
    ultime: { nom: "Frappe Psy", description: "90 % à tous les ennemis et Ralentissement 3 s", actions: [
      { type: "degats", cible: "tous", mult: 0.9, effet: { type: "ralenti", duree: 3 } },
    ] },
  },

  // ---------- Berserk ----------
  {
    id: "guts", nom: "Guts", serie: "Berserk", role: "attaquant", affinite: "chaos", rarete: "epique",
    mods: { pv: 1.1, vit: 0.92 },
    passif: { nom: "Rage", description: "ATQ +1 % par tranche de 2 % de PV perdus", type: "atqSelonPvPerdus", ratio: 0.5 },
    ultime: { nom: "Dragon Slayer", description: "220 % à toute la ligne avant, puis Renforcement", actions: [
      { type: "degats", cible: "ligne-avant", mult: 2.2 },
      { type: "effet", cible: "soi", effet: "renforcement", duree: 6 },
    ] },
  },
  {
    id: "griffith", nom: "Griffith", serie: "Berserk", role: "soutien", affinite: "esprit", rarete: "rare",
    mods: { vit: 1.08 },
    passif: { nom: "Charisme", description: "ATQ +8 % pour les alliés de la ligne avant", type: "auraAtqAvant", bonus: 0.08 },
    ultime: { nom: "Aube du Faucon", description: "Renforcement et +30 d'énergie pour tous les alliés", actions: [
      { type: "effet", cible: "allies", effet: "renforcement", duree: 6 },
      { type: "energie", cible: "allies-autres", montant: 30 },
    ] },
  },
  {
    id: "zodd", nom: "Zodd", serie: "Berserk", role: "tank", affinite: "chaos", rarete: "commun",
    mods: { atq: 1.1, def: 0.95 },
    passif: { nom: "Apôtre", description: "Sous 40 % de PV, DEF +30 % (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Charge", description: "200 % à la cible en face, Provocation et Bouclier de 20 %", actions: [
      { type: "degats", cible: "face", mult: 2.0 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
      { type: "effet", cible: "soi", effet: "bouclier", duree: 6, pourcentPv: 0.2 },
    ] },
  },

  // ---------- Jujutsu Kaisen ----------
  {
    id: "gojo", nom: "Gojo", serie: "Jujutsu Kaisen", role: "controle", affinite: "esprit", rarete: "legendaire",
    mods: { pv: 0.95 },
    passif: { nom: "Infini", description: "Ignore la première attaque reçue toutes les 10 s", type: "annuleAttaquePeriodique", periode: 10 },
    ultime: { nom: "Extension du territoire", description: "70 % à tous les ennemis et Étourdissement 1,5 s", actions: [
      { type: "degats", cible: "tous", mult: 0.7, effet: { type: "etourdi", duree: 1.5 } },
    ] },
  },
  {
    id: "yuji", nom: "Yuji", serie: "Jujutsu Kaisen", role: "attaquant", affinite: "puissance", rarete: "peu_commun",
    mods: { pv: 1.05 },
    passif: { nom: "Poing divergent", description: "Ses attaques de base frappent une 2e fois à 15 %", type: "doubleFrappe", mult: 0.15 },
    ultime: { nom: "Black Flash", description: "240 % à une cible, critique garanti à x2", actions: [
      { type: "degats", cible: "base", mult: 2.4, critGaranti: true, multCrit: 2.0 },
    ] },
  },
  {
    id: "megumi", nom: "Megumi", serie: "Jujutsu Kaisen", role: "controle", affinite: "chaos", rarete: "commun",
    mods: { atq: 1.1 },
    passif: { nom: "Dix ombres", description: "Ses attaques de base appliquent Ralentissement 2 s", type: "effetSurBase", effet: "ralenti", duree: 2 },
    ultime: { nom: "Chiens divins", description: "3 morsures de 100 % sur la ligne arrière et Ralentissement", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 1.0, coups: 3, effet: { type: "ralenti", duree: 4 } },
    ] },
  },

  // ---------- Demon Slayer ----------
  {
    id: "tanjiro", nom: "Tanjiro", serie: "Demon Slayer", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Odorat", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Danse du dieu du feu", description: "260 % à une cible et Brûlure", actions: [
      { type: "degats", cible: "base", mult: 2.6, effet: { type: "brulure", duree: 4 } },
    ] },
  },
  {
    id: "nezuko", nom: "Nezuko", serie: "Demon Slayer", role: "tank", affinite: "chaos", rarete: "peu_commun",
    mods: { vit: 1.05 },
    passif: { nom: "Sang démoniaque", description: "Ses attaques de base ont 50 % de chance d'appliquer Brûlure 1 s", type: "effetSurBase", effet: "brulure", duree: 1, chance: 0.5 },
    ultime: { nom: "Sang explosif", description: "120 % et Brûlure à toute la ligne avant, puis Provocation", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.2, effet: { type: "brulure", duree: 4 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "zenitsu", nom: "Zenitsu", serie: "Demon Slayer", role: "assassin", affinite: "vitesse", rarete: "peu_commun",
    mods: { atq: 1.05 },
    passif: { nom: "Sommeil", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "Éclair foudroyant", description: "400 % à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 4.0 },
    ] },
  },

  // ---------- Hunter x Hunter ----------
  {
    id: "gon", nom: "Gon", serie: "Hunter x Hunter", role: "attaquant", affinite: "puissance", rarete: "commun",
    mods: { pv: 1.05, vit: 0.95 },
    passif: { nom: "Concentration", description: "+10 % de dégâts par coup sur la même cible (max +50 %)", type: "concentration", bonus: 0.1, max: 0.5 },
    ultime: { nom: "Jajanken", description: "460 % à la cible en face, mais il perd 10 % de ses PV", actions: [
      { type: "degats", cible: "face", mult: 4.6 },
      { type: "coutPv", pourcent: 0.1 },
    ] },
  },
  {
    id: "killua", nom: "Killua", serie: "Hunter x Hunter", role: "assassin", affinite: "vitesse", rarete: "peu_commun",
    mods: { vit: 1.05 },
    passif: { nom: "Né assassin", description: "Son premier coup du combat est un critique garanti", type: "premierCoupCritique" },
    ultime: { nom: "Godspeed", description: "VIT +60 % pendant 5 s et 200 % à un perso de la ligne arrière avec Étourdissement 1 s", actions: [
      { type: "effet", cible: "soi", effet: "acceleration", duree: 5 },
      { type: "degats", cible: "arriere", mult: 2.0, effet: { type: "etourdi", duree: 1 } },
    ] },
  },
  {
    id: "kurapika", nom: "Kurapika", serie: "Hunter x Hunter", role: "controle", affinite: "technique", rarete: "epique",
    mods: { def: 1.05, atq: 1.1 },
    passif: { nom: "Yeux écarlates", description: "ATQ +30 % dès qu'un allié tombe KO", type: "atqSiAllieKo", bonus: 0.3 },
    ultime: { nom: "Chaîne du jugement", description: "220 % et Étourdissement 3 s sur l'ennemi à la plus forte ATQ", actions: [
      { type: "degats", cible: "plus-forte-atq", mult: 2.2, effet: { type: "etourdi", duree: 3 } },
    ] },
  },
];

// La Rature : le seul perso entierement original du jeu, boss final de l'histoire.
// Elle n'est pas dans PERSOS : on ne peut ni la tirer ni l'avoir dans sa collection.
export const RATURE = {
  id: "rature", nom: "La Rature", serie: "Crossover", role: "tank", affinite: "chaos", rarete: "legendaire", boss: true,
  mods: { pv: 1.45, atq: 1.35, def: 1.1 },
  passif: { nom: "Absorption", description: "ATQ +15 % par KO réalisé (max +45 %)", type: "atqParKo", bonus: 0.15, max: 0.45 },
  ultime: { nom: "Page blanche", description: "220 % de dégâts à tous les ennemis", actions: [
    { type: "degats", cible: "tous", mult: 2.2 },
  ] },
};

// Les antagonistes du boss de la semaine : originaux, hors collection, PV enormes
export const BOSS_RAID = [
  {
    id: "kraken", nom: "Kraken d'encre", serie: "Crossover", role: "tank", affinite: "puissance", rarete: "legendaire", boss: true,
    mods: { pv: 150, atq: 1.5 },
    mecanique: "Sa peau d'encre réduit de moitié les dégâts des attaques de base : misez sur les ultimes.",
    passif: { nom: "Peau d'encre", description: "-50 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.5 },
    ultime: { nom: "Marée noire", description: "180 % de dégâts à tous les ennemis", actions: [{ type: "degats", cible: "tous", mult: 1.8 }] },
  },
  {
    id: "demon", nom: "Démon de la page blanche", serie: "Crossover", role: "controle", affinite: "esprit", rarete: "legendaire", boss: true,
    mods: { pv: 140, atq: 1.4 },
    mecanique: "Il annule la première attaque reçue toutes les 4 secondes : les attaques nombreuses et rapides passent mieux.",
    passif: { nom: "Page vierge", description: "Ignore la première attaque reçue toutes les 4 s", type: "annuleAttaquePeriodique", periode: 4 },
    ultime: { nom: "Effacement", description: "150 % de dégâts à tous les ennemis", actions: [{ type: "degats", cible: "tous", mult: 1.5 }] },
  },
  {
    id: "editeur", nom: "L'Éditeur fou", serie: "Crossover", role: "attaquant", affinite: "chaos", rarete: "legendaire", boss: true,
    mods: { pv: 130, atq: 1.8 },
    mecanique: "Chaque KO qu'il réalise le rend plus fort : protégez vos persos fragiles et gardez des soigneurs.",
    passif: { nom: "Coupes franches", description: "ATQ +20 % par KO réalisé (max +60 %)", type: "atqParKo", bonus: 0.2, max: 0.6 },
    ultime: { nom: "Bon à tirer", description: "500 % au perso ennemi qui a le moins de PV", actions: [{ type: "degats", cible: "plus-faible", mult: 5 }] },
  },
  {
    id: "golem", nom: "Golem de reliures", serie: "Crossover", role: "tank", affinite: "technique", rarete: "legendaire", boss: true,
    mods: { pv: 160, atq: 1.2, def: 2.2 },
    mecanique: "Sa défense énorme se renforce encore sous 40 % de PV : les effets qui ignorent la DEF (brûlure, perçage) font la différence.",
    passif: { nom: "Reliure renforcée", description: "Sous 40 % de PV, DEF +30 % (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Avalanche de tomes", description: "140 % de dégâts à tous les ennemis", actions: [{ type: "degats", cible: "tous", mult: 1.4 }] },
  },
];

// Pour retrouver un perso a partir de son id : PERSOS_PAR_ID.goku
export const PERSOS_PAR_ID = Object.fromEntries([...PERSOS, RATURE, ...BOSS_RAID].map((p) => [p.id, p]));
