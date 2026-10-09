// ==========================================================
// LES SECRETS : la rarete au-dessus de Legendaire
// Un par manga : LE heros de la serie, dans sa forme ultime.
// Leur identite reste cachee dans la Collection (silhouette « ??? »)
// tant qu'on ne les a pas invoques. Ils ne servent jamais d'ennemis
// et ne comptent pas dans les series (8 / 8) ni les editions.
//   base : le perso dont on reprend le portrait
// Ajouter un Secret = ajouter une entree ici (puis node js/outils/calibrer.mjs secrets).
// ==========================================================

export const PERSOS_SECRETS = [
  {
    id: "goku_ui", base: "goku", nom: "Goku Ultra Instinct", serie: "Dragon Ball", role: "assassin", affinite: "vitesse", rarete: "secret",
    mods: { vit: 1.1 },
    passif: { nom: "Ultra Instinct", description: "30 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.3 },
    ultime: { nom: "Kamehameha divin", description: "130 % à tous les ennemis, puis Accélération 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.3 },
      { type: "effet", cible: "soi", effet: "acceleration", duree: 3 },
    ] },
  },
  {
    id: "naruto_baryon", base: "naruto", nom: "Naruto mode Baryon", serie: "Naruto", role: "attaquant", affinite: "esprit", rarete: "secret",
    mods: { pv: 1.05 },
    passif: { nom: "Volonté du Hokage", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Mode Baryon", description: "Coûte 10 % de ses PV : 450 % au perso ennemi qui a la plus forte ATQ", actions: [
      { type: "coutPv", pourcent: 0.1 },
      { type: "degats", cible: "plus-forte-atq", mult: 4.5 },
    ] },
  },
  {
    id: "luffy_gear5", base: "luffy", nom: "Luffy Gear 5", serie: "One Piece", role: "tank", affinite: "chaos", rarete: "secret",
    mods: { pv: 1.05 },
    passif: { nom: "Corps de Nika", description: "-25 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.25 },
    ultime: { nom: "Bajrang Gun", description: "140 % et Étourdi 1 s à tous les ennemis, puis Provocation 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.4, effet: { type: "etourdi", duree: 1 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "pikachu_sacha", base: "pikachu", nom: "Pikachu de Sacha", serie: "Pokémon", role: "controle", affinite: "vitesse", rarete: "secret",
    mods: {},
    passif: { nom: "Statik", description: "30 % de chance d'étourdir 1 s celui qui le frappe d'une attaque de base", type: "etourdirAttaquant", chance: 0.3, duree: 1 },
    ultime: { nom: "Fatal-Foudre", description: "140 % et Étourdi 2 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.4, effet: { type: "etourdi", duree: 2 } },
    ] },
  },
  {
    id: "guts_berserker", base: "guts", nom: "Guts, armure du Berserker", serie: "Berserk", role: "attaquant", affinite: "chaos", rarete: "secret",
    mods: { pv: 1.05 },
    passif: { nom: "Armure du Berserker", description: "ATQ +6 % par tranche de 10 % de PV perdus", type: "atqSelonPvPerdus", ratio: 0.6 },
    ultime: { nom: "Dragon Slayer", description: "Coûte 8 % de ses PV : 340 % à la cible en face et au perso derrière elle", actions: [
      { type: "coutPv", pourcent: 0.08 },
      { type: "degats", cible: "face+derriere", mult: 3.4 },
    ] },
  },
  {
    id: "gojo_vide", base: "gojo", nom: "Gojo, Vide infini", serie: "Jujutsu Kaisen", role: "controle", affinite: "esprit", rarete: "secret",
    mods: {},
    passif: { nom: "Infini", description: "Ignore la première attaque reçue toutes les 5 s", type: "annuleAttaquePeriodique", periode: 5 },
    ultime: { nom: "Extension du territoire : Vide infini", description: "100 % et Étourdi 2 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.0, effet: { type: "etourdi", duree: 2 } },
    ] },
  },
  {
    id: "tanjiro_hinokami", base: "tanjiro", nom: "Tanjiro, Danse du dieu du feu", serie: "Demon Slayer", role: "attaquant", affinite: "technique", rarete: "secret",
    mods: {},
    passif: { nom: "Marque du pourfendeur", description: "Ses attaques de base infligent Brûlure 2 s", type: "effetSurBase", effet: "brulure", duree: 2 },
    ultime: { nom: "Hinokami Kagura", description: "160 % et Brûlure 3 s à la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.6, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "gon_adulte", base: "gon", nom: "Gon, forme adulte", serie: "Hunter x Hunter", role: "attaquant", affinite: "puissance", rarete: "secret",
    mods: { atq: 1.05 },
    passif: { nom: "Serment", description: "ATQ +40 % si un allié est KO", type: "atqSiAllieKo", bonus: 0.4 },
    ultime: { nom: "Jajanken : Pierre", description: "Coûte 15 % de ses PV : 520 % (critique garanti) à la cible en face", actions: [
      { type: "coutPv", pourcent: 0.15 },
      { type: "degats", cible: "face", mult: 5.2, critGaranti: true },
    ] },
  },
  {
    id: "ichigo_mugetsu", base: "ichigo", nom: "Ichigo Mugetsu", serie: "Bleach", role: "assassin", affinite: "chaos", rarete: "secret",
    mods: {},
    passif: { nom: "Zangetsu", description: "Ses attaques de base frappent une 2e fois pour 20 % des dégâts", type: "doubleFrappe", mult: 0.2 },
    ultime: { nom: "Mugetsu", description: "320 % au perso ennemi qui a le moins de PV, puis 50 % à tous les ennemis", actions: [
      { type: "degats", cible: "plus-faible", mult: 3.2 },
      { type: "degats", cible: "tous", mult: 0.5 },
    ] },
  },
  {
    id: "deku_100", base: "deku", nom: "Deku, One For All 100 %", serie: "My Hero Academia", role: "attaquant", affinite: "puissance", rarete: "secret",
    mods: {},
    passif: { nom: "Full Cowl", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "United States of Smash", description: "Coûte 8 % de ses PV : 360 % à la cible en face et au perso derrière elle", actions: [
      { type: "coutPv", pourcent: 0.08 },
      { type: "degats", cible: "face+derriere", mult: 3.6 },
    ] },
  },
  {
    id: "eren_originel", base: "eren", nom: "Eren, Titan Originel", serie: "L'Attaque des Titans", role: "tank", affinite: "chaos", rarete: "secret",
    mods: { pv: 1.05 },
    passif: { nom: "Régénération titanesque", description: "Récupère 3 % de ses PV max toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Le Grand Terrassement", description: "150 % et Ralenti 3 s à tous les ennemis, puis Provocation 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.5, effet: { type: "ralenti", duree: 3 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "chainsaw_man", base: "denji", nom: "Chainsaw Man", serie: "Chainsaw Man", role: "assassin", affinite: "chaos", rarete: "secret",
    mods: {},
    passif: { nom: "Cœur de Pochita", description: "ATQ +15 % par KO réalisé (max +45 %)", type: "atqParKo", bonus: 0.15, max: 0.45 },
    ultime: { nom: "Tronçonnage", description: "5 frappes de 110 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 1.1, coups: 5 },
    ] },
  },
  {
    id: "frieren_tueuse", base: "frieren", nom: "Frieren, la Tueuse de démons", serie: "Frieren", role: "controle", affinite: "esprit", rarete: "secret",
    mods: {},
    passif: { nom: "Mana dissimulé", description: "Gagne 4 d'énergie par seconde", type: "energieParSeconde", valeur: 4 },
    ultime: { nom: "Zoltraak", description: "150 % et Vulnérabilité 4 s à tous les ennemis, puis 150 % au perso qui a la plus forte ATQ", actions: [
      { type: "degats", cible: "tous", mult: 1.5, effet: { type: "vulnerabilite", duree: 4 } },
      { type: "degats", cible: "plus-forte-atq", mult: 1.5 },
    ] },
  },
  {
    id: "natsu_dragon", base: "natsu", nom: "Natsu, Dragon Force", serie: "Fairy Tail", role: "attaquant", affinite: "puissance", rarete: "secret",
    mods: {},
    passif: { nom: "Cœur du dragon", description: "ATQ +30 % sous 50 % de PV", type: "atqSousPv", seuil: 0.5, bonus: 0.3 },
    ultime: { nom: "Hurlement du dragon de feu", description: "160 % et Brûlure 3 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.6, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "seiya_divin", base: "seiya", nom: "Seiya, armure divine", serie: "Saint Seiya", role: "tank", affinite: "esprit", rarete: "secret",
    mods: { def: 1.05 },
    passif: { nom: "Cosmos ultime", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Météores de Pégase", description: "6 frappes de 80 % sur des ennemis au hasard, puis Bouclier de 20 % de ses PV et Provocation 3 s", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.8, coups: 6 },
      { type: "effet", cible: "soi", effet: "bouclier", duree: 6, pourcentPv: 0.2 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "asta_diable", base: "asta", nom: "Asta, forme du Diable", serie: "Black Clover", role: "assassin", affinite: "chaos", rarete: "secret",
    mods: {},
    passif: { nom: "Anti-magie", description: "-35 % de dégâts subis des ultimes", type: "reductionUltime", pourcent: 0.35 },
    ultime: { nom: "Black Divider", description: "380 % et Vulnérabilité 4 s à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 3.8, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "jinwoo_monarque", base: "jinwoo", nom: "Sung Jinwoo, Monarque des Ombres", serie: "Solo Leveling", role: "attaquant", affinite: "technique", rarete: "secret",
    mods: {},
    passif: { nom: "Lève-toi", description: "ATQ +10 % par KO réalisé (max +40 %)", type: "atqParKo", bonus: 0.1, max: 0.4 },
    ultime: { nom: "Domaine du Monarque", description: "140 % à tous les ennemis, puis Renforcement 4 s à tous les alliés", actions: [
      { type: "degats", cible: "tous", mult: 1.4 },
      { type: "effet", cible: "allies", effet: "renforcement", duree: 4 },
    ] },
  },
  {
    id: "edward_acier", base: "edward", nom: "Edward, l'Alchimiste d'acier", serie: "Fullmetal Alchemist", role: "controle", affinite: "technique", rarete: "secret",
    mods: { def: 1.05 },
    passif: { nom: "Bras d'acier", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Transmutation sans cercle", description: "160 % et Étourdi 2 s à la ligne avant, puis Bouclier de 8 % des PV aux alliés", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.6, effet: { type: "etourdi", duree: 2 } },
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.08 },
    ] },
  },
  {
    id: "kaneki_roi", base: "kaneki", nom: "Kaneki, Roi borgne", serie: "Tokyo Ghoul", role: "assassin", affinite: "chaos", rarete: "secret",
    mods: {},
    passif: { nom: "Kagune mille-pattes", description: "ATQ +5 % par tranche de 10 % de PV perdus", type: "atqSelonPvPerdus", ratio: 0.5 },
    ultime: { nom: "Kakuja", description: "300 % au perso ennemi qui a le moins de PV, puis récupère 12 % de ses PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 3.0 },
      { type: "soin", cible: "soi", pourcent: 0.12 },
    ] },
  },
  {
    id: "jotaro_monde", base: "jotaro", nom: "Jotaro, Star Platinum The World", serie: "JoJo", role: "attaquant", affinite: "puissance", rarete: "secret",
    mods: {},
    passif: { nom: "Arrêt du temps", description: "Sa première attaque est un coup critique", type: "premierCoupCritique" },
    ultime: { nom: "ORA ORA ORA", description: "Étourdit tous les ennemis 1 s, puis 5 frappes de 70 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "tous", mult: 0.2, effet: { type: "etourdi", duree: 1 } },
      { type: "degats", cible: "aleatoire", mult: 0.7, coups: 5 },
    ] },
  },
];

export const IDS_SECRETS = new Set(PERSOS_SECRETS.map((p) => p.id));
export const estSecret = (id) => IDS_SECRETS.has(id);
