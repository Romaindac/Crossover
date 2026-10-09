// ==========================================================
// VOLUME 5 : « Nouvelle Génération », 40 persos (200 au total)
// 5 series de 8 : Hell's Paradise, Dandadan, Kaiju n°8, Spy x Family,
// Blue Lock. Par serie : 1 Legendaire, 1 Epique, 2 Rares, 2 Peu communs,
// 2 Communs. Meme format que persos.js.
// ==========================================================

export const PERSOS_V5 = [
  // ---------- Hell's Paradise ----------
  {
    id: "rien", nom: "Rien", serie: "Hell's Paradise", role: "controle", affinite: "esprit", rarete: "legendaire",
    mods: {},
    passif: { nom: "Tao de la fleur", description: "Récupère 3 % de ses PV max toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Floraison immortelle", description: "140 % et Ralenti 3 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.4, effet: { type: "ralenti", duree: 3 } },
    ] },
  },
  {
    id: "gabimaru", nom: "Gabimaru", serie: "Hell's Paradise", role: "assassin", affinite: "chaos", rarete: "epique",
    mods: { vit: 1.04 },
    passif: { nom: "Le Creux", description: "20 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.2 },
    ultime: { nom: "Ninpō : flammes de Shinobi", description: "250 % et Brûlure 3 s à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 2.5, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "sagiri", nom: "Sagiri", serie: "Hell's Paradise", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Lame des Yamada", description: "Sa première attaque est un coup critique", type: "premierCoupCritique" },
    ultime: { nom: "Coupe d'exécution", description: "260 % à la cible en face", actions: [
      { type: "degats", cible: "face", mult: 2.6 },
    ] },
  },
  {
    id: "yuzuriha", nom: "Yuzuriha", serie: "Hell's Paradise", role: "assassin", affinite: "vitesse", rarete: "rare",
    mods: { vit: 1.05 },
    passif: { nom: "Kunoichi", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Fil de soie", description: "4 frappes de 75 % sur la ligne arrière au hasard", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 0.75, coups: 4 },
    ] },
  },
  {
    id: "chobe", nom: "Chobe", serie: "Hell's Paradise", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: { pv: 1.05 },
    passif: { nom: "Peau de brigand", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Charge du bandit", description: "160 % à la ligne avant, puis Provocation 3 s", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.6 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "shion", nom: "Shion", serie: "Hell's Paradise", role: "soutien", affinite: "technique", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Maître du dojo", description: "Les alliés de la ligne avant ont +10 % d'ATQ", type: "auraAtqAvant", bonus: 0.1 },
    ultime: { nom: "Enseignement", description: "Soigne tous les alliés de 12 % de leurs PV et leur donne Renforcement 4 s", actions: [
      { type: "soin", cible: "allies", pourcent: 0.12 },
      { type: "effet", cible: "allies", effet: "renforcement", duree: 4 },
    ] },
  },
  {
    id: "mei", nom: "Mei", serie: "Hell's Paradise", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Tao purifiant", description: "Soigne de 3 % le plus blessé de ses alliés toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Pousse de vie", description: "Soigne tous les alliés de 14 % de leurs PV", actions: [
      { type: "soin", cible: "allies", pourcent: 0.14 },
    ] },
  },
  {
    id: "tenza", nom: "Tenza", serie: "Hell's Paradise", role: "attaquant", affinite: "puissance", rarete: "commun",
    mods: { atq: 1.03 },
    passif: { nom: "Résolution", description: "ATQ +25 % sous 50 % de PV", type: "atqSousPv", seuil: 0.5, bonus: 0.25 },
    ultime: { nom: "Taille du samouraï", description: "220 % à la cible en face et au perso derrière elle", actions: [
      { type: "degats", cible: "face+derriere", mult: 2.2 },
    ] },
  },

  // ---------- Dandadan ----------
  {
    id: "turbogranny", nom: "Mémé Turbo", serie: "Dandadan", role: "assassin", affinite: "vitesse", rarete: "legendaire",
    mods: { vit: 1.08 },
    passif: { nom: "Vitesse de légende", description: "Ses attaques de base frappent une 2e fois pour 20 % des dégâts", type: "doubleFrappe", mult: 0.2 },
    ultime: { nom: "Course maudite", description: "6 frappes de 80 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.8, coups: 6 },
    ] },
  },
  {
    id: "momo", nom: "Momo", serie: "Dandadan", role: "controle", affinite: "esprit", rarete: "epique",
    mods: {},
    passif: { nom: "Pouvoirs psychiques", description: "Gagne 2 d'énergie par seconde", type: "energieParSeconde", valeur: 2 },
    ultime: { nom: "Mains d'esprit", description: "130 % et Étourdi 2 s à la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.3, effet: { type: "etourdi", duree: 2 } },
    ] },
  },
  {
    id: "okarun", nom: "Okarun", serie: "Dandadan", role: "attaquant", affinite: "chaos", rarete: "rare",
    mods: {},
    passif: { nom: "Malédiction de la Mémé", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "Forme turbo", description: "5 frappes de 65 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.65, coups: 5 },
    ] },
  },
  {
    id: "aira", nom: "Aira", serie: "Dandadan", role: "soutien", affinite: "esprit", rarete: "rare",
    mods: {},
    passif: { nom: "Élue de l'Acrobatique", description: "Soins +20 % sur les alliés sous 30 % de PV", type: "soinsBonusBlesses", seuil: 0.3, bonus: 0.2 },
    ultime: { nom: "Boule d'éclat", description: "Soigne tous les alliés de 12 % de leurs PV et leur donne un bouclier de 10 % de leurs PV", actions: [
      { type: "soin", cible: "allies", pourcent: 0.12 },
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.1 },
    ] },
  },
  {
    id: "jiji", nom: "Jiji", serie: "Dandadan", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: { pv: 1.05 },
    passif: { nom: "Esprit Mauvais Œil", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Poigne de feu", description: "150 % et Brûlure 3 s à la ligne avant, puis Provocation 3 s", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.5, effet: { type: "brulure", duree: 3 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "seiko", nom: "Seiko", serie: "Dandadan", role: "controle", affinite: "esprit", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Médium aguerrie", description: "30 % de chance d'étourdir 1 s celui qui la frappe d'une attaque de base", type: "etourdirAttaquant", chance: 0.3, duree: 1 },
    ultime: { nom: "Barrière sacrée", description: "100 % et Vulnérabilité 4 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.0, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "vamola", nom: "Vamola", serie: "Dandadan", role: "attaquant", affinite: "technique", rarete: "commun",
    mods: { atq: 1.03 },
    passif: { nom: "Armure extraterrestre", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Rayon de combat", description: "240 % à la cible en face", actions: [
      { type: "degats", cible: "face", mult: 2.4 },
    ] },
  },
  {
    id: "kashimoto", nom: "Kashimoto", serie: "Dandadan", role: "tank", affinite: "technique", rarete: "commun",
    mods: { def: 1.05 },
    passif: { nom: "Esprit de corps", description: "Sous 40 % de PV, DEF +30 % (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Bouclier du club", description: "Bouclier de 20 % de ses PV et Provocation 4 s", actions: [
      { type: "effet", cible: "soi", effet: "bouclier", duree: 6, pourcentPv: 0.2 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- Kaiju n°8 ----------
  {
    id: "narumi", nom: "Narumi", serie: "Kaiju n°8", role: "attaquant", affinite: "technique", rarete: "legendaire",
    mods: {},
    passif: { nom: "Œil de lecture", description: "Ses coups critiques font 180 % des dégâts", type: "multCrit", valeur: 1.8 },
    ultime: { nom: "Arme n°1252", description: "380 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 3.8 },
    ] },
  },
  {
    id: "kafka", nom: "Kafka", serie: "Kaiju n°8", role: "tank", affinite: "puissance", rarete: "epique",
    mods: { pv: 1.05 },
    passif: { nom: "Corps de kaiju", description: "Récupère 3 % de ses PV max toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Poing du kaiju n°8", description: "180 % à la ligne avant, puis Provocation 3 s", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.8 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "mina", nom: "Mina", serie: "Kaiju n°8", role: "attaquant", affinite: "puissance", rarete: "rare",
    mods: { atq: 1.03 },
    passif: { nom: "Canon de la capitaine", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Tir de destruction", description: "180 % à toute la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.8 },
    ] },
  },
  {
    id: "hoshina", nom: "Hoshina", serie: "Kaiju n°8", role: "assassin", affinite: "vitesse", rarete: "rare",
    mods: { vit: 1.05 },
    passif: { nom: "Double lame", description: "Ses attaques de base frappent une 2e fois pour 15 % des dégâts", type: "doubleFrappe", mult: 0.15 },
    ultime: { nom: "Style Hoshina : 4e forme", description: "340 % à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 3.4 },
    ] },
  },
  {
    id: "kikoru", nom: "Kikoru", serie: "Kaiju n°8", role: "attaquant", affinite: "technique", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Prodige", description: "ATQ +10 % par KO réalisé (max +30 %)", type: "atqParKo", bonus: 0.1, max: 0.3 },
    ultime: { nom: "Hache de combat", description: "230 % à la cible en face", actions: [
      { type: "degats", cible: "face", mult: 2.3 },
    ] },
  },
  {
    id: "reno", nom: "Reno", serie: "Kaiju n°8", role: "controle", affinite: "vitesse", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Tir de couverture", description: "Les ennemis ont -8 % de VIT", type: "auraVitEnnemis", malus: 0.08 },
    ultime: { nom: "Tir de gel", description: "110 % et Ralenti 3 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.1, effet: { type: "ralenti", duree: 3 } },
    ] },
  },
  {
    id: "iharu", nom: "Iharu", serie: "Kaiju n°8", role: "attaquant", affinite: "puissance", rarete: "commun",
    mods: {},
    passif: { nom: "Rival", description: "ATQ +30 % si un allié est KO", type: "atqSiAllieKo", bonus: 0.3 },
    ultime: { nom: "Rafale", description: "4 frappes de 65 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.65, coups: 4 },
    ] },
  },
  {
    id: "kaiju10", nom: "Kaiju n°10", serie: "Kaiju n°8", role: "tank", affinite: "chaos", rarete: "commun",
    mods: { pv: 1.06 },
    passif: { nom: "Carapace", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Rugissement", description: "120 % et Étourdi 1 s à la ligne avant, puis Provocation 3 s", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.2, effet: { type: "etourdi", duree: 1 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },

  // ---------- Spy x Family ----------
  {
    id: "yor", nom: "Yor", serie: "Spy x Family", role: "assassin", affinite: "vitesse", rarete: "legendaire",
    mods: { vit: 1.05 },
    passif: { nom: "Princesse Épine", description: "Sa première attaque est un coup critique", type: "premierCoupCritique" },
    ultime: { nom: "Danse des épines", description: "400 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 4.0 },
    ] },
  },
  {
    id: "loid", nom: "Loid", serie: "Spy x Family", role: "controle", affinite: "technique", rarete: "epique",
    mods: {},
    passif: { nom: "Agent Twilight", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Opération Strix", description: "130 % et Étourdi 2 s à l'ennemi qui a le plus d'énergie, puis Vulnérabilité 4 s à tous", actions: [
      { type: "degats", cible: "plus-energie", mult: 1.3, effet: { type: "etourdi", duree: 2 } },
      { type: "degats", cible: "tous", mult: 0.3, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "anya", nom: "Anya", serie: "Spy x Family", role: "soutien", affinite: "esprit", rarete: "rare",
    mods: {},
    passif: { nom: "Télépathie", description: "Gagne 2 d'énergie par seconde", type: "energieParSeconde", valeur: 2 },
    ultime: { nom: "Waku waku", description: "Donne 30 d'énergie aux autres alliés et les soigne de 8 %", actions: [
      { type: "energie", cible: "allies-autres", montant: 30 },
      { type: "soin", cible: "allies", pourcent: 0.08 },
    ] },
  },
  {
    id: "bond", nom: "Bond", serie: "Spy x Family", role: "tank", affinite: "esprit", rarete: "rare",
    mods: { pv: 1.05 },
    passif: { nom: "Prémonition", description: "Ignore la première attaque reçue toutes les 8 s", type: "annuleAttaquePeriodique", periode: 8 },
    ultime: { nom: "Gros toutou", description: "Bouclier de 22 % de ses PV et Provocation 4 s", actions: [
      { type: "effet", cible: "soi", effet: "bouclier", duree: 6, pourcentPv: 0.22 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "yuri", nom: "Yuri", serie: "Spy x Family", role: "attaquant", affinite: "chaos", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Frère dévoué", description: "ATQ +25 % sous 50 % de PV", type: "atqSousPv", seuil: 0.5, bonus: 0.25 },
    ultime: { nom: "Interrogatoire", description: "240 % à la cible en face", actions: [
      { type: "degats", cible: "face", mult: 2.4 },
    ] },
  },
  {
    id: "fiona", nom: "Fiona", serie: "Spy x Family", role: "controle", affinite: "technique", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Nightfall", description: "Les ennemis ont -8 % de VIT", type: "auraVitEnnemis", malus: 0.08 },
    ultime: { nom: "Coup de pied gelé", description: "150 % et Ralenti 3 s à la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.5, effet: { type: "ralenti", duree: 3 } },
    ] },
  },
  {
    id: "franky", nom: "Franky", serie: "Spy x Family", role: "soutien", affinite: "technique", rarete: "commun",
    mods: {},
    passif: { nom: "Informateur", description: "Les alliés de la ligne avant ont +10 % d'ATQ", type: "auraAtqAvant", bonus: 0.1 },
    ultime: { nom: "Gadget maison", description: "Bouclier de 14 % des PV à tous les alliés et les soigne de 8 %", actions: [
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.14 },
      { type: "soin", cible: "allies", pourcent: 0.08 },
    ] },
  },
  {
    id: "becky", nom: "Becky", serie: "Spy x Family", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Meilleure amie", description: "Soigne de 3 % le plus blessé de ses alliés toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Goûter de luxe", description: "Soigne tous les alliés de 12 % de leurs PV", actions: [
      { type: "soin", cible: "allies", pourcent: 0.12 },
    ] },
  },

  // ---------- Blue Lock ----------
  {
    id: "rin", nom: "Rin", serie: "Blue Lock", role: "attaquant", affinite: "technique", rarete: "legendaire",
    mods: {},
    passif: { nom: "Génie destructeur", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Tir enroulé", description: "200 % à toute la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 2.0 },
    ] },
  },
  {
    id: "isagi", nom: "Isagi", serie: "Blue Lock", role: "controle", affinite: "esprit", rarete: "epique",
    mods: {},
    passif: { nom: "Vision spatiale", description: "Gagne 2 d'énergie par seconde", type: "energieParSeconde", valeur: 2 },
    ultime: { nom: "Tir direct", description: "220 % à la cible en face et Vulnérabilité 4 s à tous les ennemis", actions: [
      { type: "degats", cible: "face", mult: 2.2 },
      { type: "degats", cible: "tous", mult: 0.3, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "bachira", nom: "Bachira", serie: "Blue Lock", role: "assassin", affinite: "vitesse", rarete: "rare",
    mods: { vit: 1.05 },
    passif: { nom: "Le monstre en moi", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Dribble fou", description: "4 frappes de 75 % sur la ligne arrière au hasard", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 0.75, coups: 4 },
    ] },
  },
  {
    id: "nagi", nom: "Nagi", serie: "Blue Lock", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Contrôle parfait", description: "Sa première attaque est un coup critique", type: "premierCoupCritique" },
    ultime: { nom: "Contrôle à cinq temps", description: "270 % à la cible en face", actions: [
      { type: "degats", cible: "face", mult: 2.7 },
    ] },
  },
  {
    id: "kunigami", nom: "Kunigami", serie: "Blue Lock", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: { pv: 1.05 },
    passif: { nom: "Héros du terrain", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Frappe du gauche", description: "160 % à la ligne avant, puis Provocation 3 s", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.6 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "chigiri", nom: "Chigiri", serie: "Blue Lock", role: "assassin", affinite: "vitesse", rarete: "peu_commun",
    mods: { vit: 1.06 },
    passif: { nom: "Pointe de vitesse", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "Sprint de la panthère", description: "300 % à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 3.0 },
    ] },
  },
  {
    id: "ego", nom: "Ego", serie: "Blue Lock", role: "soutien", affinite: "chaos", rarete: "commun",
    mods: {},
    passif: { nom: "Égoïsme", description: "Les alliés de la ligne avant ont +15 % d'ATQ", type: "auraAtqAvant", bonus: 0.15 },
    ultime: { nom: "Discours du projet", description: "Renforcement 5 s à tous les alliés, +25 d'énergie aux autres et soin de 5 %", actions: [
      { type: "effet", cible: "allies", effet: "renforcement", duree: 5 },
      { type: "energie", cible: "allies-autres", montant: 25 },
      { type: "soin", cible: "allies", pourcent: 0.05 },
    ] },
  },
  {
    id: "kuon", nom: "Kuon", serie: "Blue Lock", role: "tank", affinite: "technique", rarete: "commun",
    mods: { def: 1.05 },
    passif: { nom: "Défenseur", description: "Sous 40 % de PV, DEF +30 % (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Tacle glissé", description: "160 % et Étourdi 1,5 s à la cible en face, puis Provocation 3 s", actions: [
      { type: "degats", cible: "face", mult: 1.6, effet: { type: "etourdi", duree: 1.5 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
];
