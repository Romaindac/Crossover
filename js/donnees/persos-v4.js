// ==========================================================
// VOLUME 4 : 82 persos de plus (160 au total, 40 par extension)
// Chaque serie d'origine passe a 8 persos, et 6 nouvelles series
// arrivent avec 8 persos chacune. Meme format que persos.js.
// ==========================================================

export const PERSOS_V4 = [
  // ---------- Dragon Ball ----------
  {
    id: "gohan", nom: "Gohan", serie: "Dragon Ball", role: "attaquant", affinite: "esprit", rarete: "rare",
    mods: { atq: 1.04 },
    passif: { nom: "Colère cachée", description: "ATQ +30 % dès qu'un allié tombe KO", type: "atqSiAllieKo", bonus: 0.3 },
    ultime: { nom: "Masenko", description: "260 % à la cible en face", actions: [
      { type: "degats", cible: "face", mult: 2.6 },
    ] },
  },
  {
    id: "yamcha", nom: "Yamcha", serie: "Dragon Ball", role: "assassin", affinite: "vitesse", rarete: "commun",
    mods: { vit: 1.05 },
    passif: { nom: "Poing du loup", description: "Ses attaques de base frappent une 2e fois à 15 %", type: "doubleFrappe", mult: 0.15 },
    ultime: { nom: "Rokakufu Ken", description: "4 frappes de 70 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.7, coups: 4 },
    ] },
  },

  // ---------- Naruto ----------
  {
    id: "itachi", nom: "Itachi", serie: "Naruto", role: "controle", affinite: "chaos", rarete: "rare",
    mods: { atq: 1.03 },
    passif: { nom: "Mangekyō", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Tsukuyomi", description: "Vulnérabilité 4 s, 210 % et Étourdissement 2,5 s sur l'ennemi qui a le plus d'énergie", actions: [
      { type: "effet", cible: "plus-energie", effet: "vulnerabilite", duree: 4 },
      { type: "degats", cible: "plus-energie", mult: 2.1, effet: { type: "etourdi", duree: 2.5 } },
    ] },
  },
  {
    id: "rocklee", nom: "Rock Lee", serie: "Naruto", role: "assassin", affinite: "vitesse", rarete: "commun",
    mods: { vit: 1.06, pv: 0.97 },
    passif: { nom: "Huit portes", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "Lotus recto", description: "5 frappes de 60 % sur un perso de la ligne arrière, puis perd 5 % de ses PV", actions: [
      { type: "degats", cible: "arriere", mult: 0.6, coups: 5 },
      { type: "coutPv", pourcent: 0.05 },
    ] },
  },

  // ---------- One Piece ----------
  {
    id: "shanks", nom: "Shanks", serie: "One Piece", role: "controle", affinite: "esprit", rarete: "legendaire",
    mods: { atq: 1.04 },
    passif: { nom: "Fluide royal", description: "VIT des ennemis -8 %", type: "auraVitEnnemis", malus: 0.08 },
    ultime: { nom: "Kamusari", description: "130 % à tous les ennemis et Étourdissement 1 s", actions: [
      { type: "degats", cible: "tous", mult: 1.3, effet: { type: "etourdi", duree: 1 } },
    ] },
  },
  {
    id: "ace", nom: "Ace", serie: "One Piece", role: "attaquant", affinite: "puissance", rarete: "epique",
    mods: { atq: 1.04, pv: 0.98 },
    passif: { nom: "Logia du feu", description: "Ses attaques de base ont 50 % de chance d'appliquer Brûlure 2 s", type: "effetSurBase", effet: "brulure", duree: 2, chance: 0.5 },
    ultime: { nom: "Hiken", description: "130 % à la ligne avant et Brûlure 3 s", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.3, effet: { type: "brulure", duree: 3 } },
    ] },
  },

  // ---------- Pokemon ----------
  {
    id: "ectoplasma", nom: "Ectoplasma", serie: "Pokémon", role: "controle", affinite: "chaos", rarete: "rare",
    mods: { vit: 1.04 },
    passif: { nom: "Lévitation", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Ball'Ombre", description: "4 frappes de 70 % au hasard, avec Vulnérabilité 4 s", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.7, coups: 4, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "tortank", nom: "Tortank", serie: "Pokémon", role: "tank", affinite: "technique", rarete: "peu_commun",
    mods: { def: 1.06 },
    passif: { nom: "Torrent", description: "Sous 40 % de PV, DEF +30 % (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Hydrocanon", description: "180 % à la ligne avant et Ralentissement 3 s, puis Provocation", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.8, effet: { type: "ralenti", duree: 3 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- Berserk ----------
  {
    id: "serpico", nom: "Serpico", serie: "Berserk", role: "assassin", affinite: "vitesse", rarete: "peu_commun",
    mods: { vit: 1.05 },
    passif: { nom: "Épée du vent", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Lame de sylphe", description: "300 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 3.0 },
    ] },
  },
  {
    id: "isidro", nom: "Isidro", serie: "Berserk", role: "attaquant", affinite: "vitesse", rarete: "commun",
    mods: { vit: 1.04 },
    passif: { nom: "Petit voyou", description: "Son premier coup du combat est un critique garanti", type: "premierCoupCritique" },
    ultime: { nom: "Salamandre", description: "160 % à un ennemi au hasard avec Brûlure 4 s", actions: [
      { type: "degats", cible: "aleatoire", mult: 1.6, effet: { type: "brulure", duree: 4 } },
    ] },
  },

  // ---------- Jujutsu Kaisen ----------
  {
    id: "nanami", nom: "Nanami", serie: "Jujutsu Kaisen", role: "attaquant", affinite: "technique", rarete: "epique",
    mods: { atq: 1.03 },
    passif: { nom: "Ratio 7:3", description: "Ses critiques font x1,8 au lieu de x1,5", type: "multCrit", valeur: 1.8 },
    ultime: { nom: "Heures sup", description: "Renforcement 6 s, puis 240 % à la cible en face", actions: [
      { type: "effet", cible: "soi", effet: "renforcement", duree: 6 },
      { type: "degats", cible: "face", mult: 2.4 },
    ] },
  },
  {
    id: "maki", nom: "Maki", serie: "Jujutsu Kaisen", role: "assassin", affinite: "puissance", rarete: "rare",
    mods: { atq: 1.04, vit: 1.03 },
    passif: { nom: "Corps céleste", description: "-25 % de dégâts subis des ultimes", type: "reductionUltime", pourcent: 0.25 },
    ultime: { nom: "Dragon Bone", description: "320 % à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 3.2 },
    ] },
  },

  // ---------- Demon Slayer ----------
  {
    id: "muzan", nom: "Muzan", serie: "Demon Slayer", role: "controle", affinite: "chaos", rarete: "legendaire",
    mods: { pv: 1.04 },
    passif: { nom: "Roi des démons", description: "Récupère 3 % de ses PV max toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Sang maudit", description: "140 % à tous les ennemis avec Brûlure 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.4, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "giyu", nom: "Giyu", serie: "Demon Slayer", role: "tank", affinite: "technique", rarete: "rare",
    mods: { def: 1.05 },
    passif: { nom: "Calme plat", description: "Ignore la première attaque reçue toutes les 10 s", type: "annuleAttaquePeriodique", periode: 10 },
    ultime: { nom: "Onzième mouvement", description: "Bouclier de 12 % des PV aux alliés de la ligne avant, puis Provocation", actions: [
      { type: "effet", cible: "allies-avant", effet: "bouclier", duree: 6, pourcentPv: 0.12 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- Hunter x Hunter ----------
  {
    id: "meruem", nom: "Meruem", serie: "Hunter x Hunter", role: "attaquant", affinite: "chaos", rarete: "legendaire",
    mods: { atq: 1.04, pv: 1.03 },
    passif: { nom: "Roi des fourmis", description: "ATQ +10 % par KO réalisé (max +30 %)", type: "atqParKo", bonus: 0.1, max: 0.3 },
    ultime: { nom: "Queue royale", description: "170 % à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.7 },
    ] },
  },
  {
    id: "biscuit", nom: "Biscuit", serie: "Hunter x Hunter", role: "tank", affinite: "puissance", rarete: "rare",
    mods: { pv: 1.05 },
    passif: { nom: "Vraie forme", description: "Sous 40 % de PV, DEF +30 % (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Magical Esthetic", description: "Soigne tous les alliés de 10 % de leurs PV max, puis Provocation", actions: [
      { type: "soin", cible: "allies", pourcent: 0.1 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- Bleach ----------
  {
    id: "aizen", nom: "Aizen", serie: "Bleach", role: "controle", affinite: "esprit", rarete: "legendaire",
    mods: { atq: 1.03 },
    passif: { nom: "Hypnose totale", description: "Ignore la première attaque reçue toutes les 10 s", type: "annuleAttaquePeriodique", periode: 10 },
    ultime: { nom: "Kurohitsugi", description: "300 % à l'ennemi à la plus forte ATQ et Étourdissement 2,5 s", actions: [
      { type: "degats", cible: "plus-forte-atq", mult: 3, effet: { type: "etourdi", duree: 2.5 } },
    ] },
  },
  {
    id: "uryu", nom: "Uryū", serie: "Bleach", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: { atq: 1.03 },
    passif: { nom: "Quincy", description: "+10 % de dégâts par coup sur la même cible (max +60 %)", type: "concentration", bonus: 0.1, max: 0.6 },
    ultime: { nom: "Licht Regen", description: "6 flèches de 55 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.55, coups: 6 },
    ] },
  },
  {
    id: "renji", nom: "Renji", serie: "Bleach", role: "attaquant", affinite: "puissance", rarete: "commun",
    mods: { pv: 1.04 },
    passif: { nom: "Babouin serpent", description: "ATQ +25 % sous 50 % de PV", type: "atqSousPv", seuil: 0.5, bonus: 0.25 },
    ultime: { nom: "Hihiō Zabimaru", description: "220 % à la cible en face et au perso derrière elle", actions: [
      { type: "degats", cible: "face+derriere", mult: 2.2 },
    ] },
  },

  // ---------- My Hero Academia ----------
  {
    id: "shigaraki", nom: "Shigaraki", serie: "My Hero Academia", role: "controle", affinite: "chaos", rarete: "epique",
    mods: { atq: 1.03 },
    passif: { nom: "Désintégration", description: "Ses attaques de base appliquent Vulnérabilité 2 s", type: "effetSurBase", effet: "vulnerabilite", duree: 2 },
    ultime: { nom: "Effondrement", description: "120 % à tous les ennemis avec Vulnérabilité 4 s", actions: [
      { type: "degats", cible: "tous", mult: 1.2, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "iida", nom: "Iida", serie: "My Hero Academia", role: "assassin", affinite: "vitesse", rarete: "peu_commun",
    mods: { vit: 1.06 },
    passif: { nom: "Moteurs", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "Recipro Burst", description: "Accélération 3 s, puis 280 % à un perso de la ligne arrière", actions: [
      { type: "effet", cible: "soi", effet: "acceleration", duree: 3 },
      { type: "degats", cible: "arriere", mult: 2.8 },
    ] },
  },
  {
    id: "kirishima", nom: "Kirishima", serie: "My Hero Academia", role: "tank", affinite: "puissance", rarete: "commun",
    mods: { def: 1.06 },
    passif: { nom: "Durcissement", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Roc inébranlable", description: "Bouclier de 20 % de ses PV et Provocation", actions: [
      { type: "effet", cible: "soi", effet: "bouclier", duree: 6, pourcentPv: 0.2 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- L'Attaque des Titans ----------
  {
    id: "erwin", nom: "Erwin", serie: "L'Attaque des Titans", role: "soutien", affinite: "esprit", rarete: "epique",
    mods: {},
    passif: { nom: "Commandant", description: "ATQ +15 % pour les alliés de la ligne avant", type: "auraAtqAvant", bonus: 0.15 },
    ultime: { nom: "Dévouez vos cœurs", description: "Renforcement 6 s pour toute l'équipe et +35 d'énergie aux autres alliés", actions: [
      { type: "effet", cible: "allies", effet: "renforcement", duree: 6 },
      { type: "energie", cible: "allies-autres", montant: 35 },
    ] },
  },
  {
    id: "reiner", nom: "Reiner", serie: "L'Attaque des Titans", role: "tank", affinite: "puissance", rarete: "rare",
    mods: { pv: 1.05, def: 1.04 },
    passif: { nom: "Titan cuirassé", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Charge blindée", description: "160 % à la ligne avant et Étourdissement 1 s, puis Provocation", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.6, effet: { type: "etourdi", duree: 1 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "jean", nom: "Jean", serie: "L'Attaque des Titans", role: "attaquant", affinite: "technique", rarete: "commun",
    mods: {},
    passif: { nom: "Sens tactique", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Lames d'acier", description: "2 frappes de 130 % sur la cible en face", actions: [
      { type: "degats", cible: "face", mult: 1.3, coups: 2 },
    ] },
  },

  // ---------- Chainsaw Man ----------
  {
    id: "reze", nom: "Reze", serie: "Chainsaw Man", role: "attaquant", affinite: "chaos", rarete: "epique",
    mods: { atq: 1.05, pv: 0.96 },
    passif: { nom: "Démon bombe", description: "Ses critiques font x1,8 au lieu de x1,5", type: "multCrit", valeur: 1.8 },
    ultime: { nom: "Détonation", description: "160 % à tous les ennemis avec Brûlure 2 s", actions: [
      { type: "degats", cible: "tous", mult: 1.6, effet: { type: "brulure", duree: 2 } },
    ] },
  },
  {
    id: "kishibe", nom: "Kishibe", serie: "Chainsaw Man", role: "assassin", affinite: "technique", rarete: "rare",
    mods: { atq: 1.03 },
    passif: { nom: "Vétéran", description: "Son premier coup du combat est un critique garanti", type: "premierCoupCritique" },
    ultime: { nom: "Couteaux", description: "3 frappes de 120 % sur le perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 1.2, coups: 3 },
    ] },
  },
  {
    id: "himeno", nom: "Himeno", serie: "Chainsaw Man", role: "controle", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Démon fantôme", description: "Ses attaques de base appliquent Ralentissement 2 s", type: "effetSurBase", effet: "ralenti", duree: 2 },
    ultime: { nom: "Main fantôme", description: "190 % et Étourdissement 2 s sur un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 1.9, effet: { type: "etourdi", duree: 2 } },
    ] },
  },

  // ---------- Frieren ----------
  {
    id: "ubel", nom: "Übel", serie: "Frieren", role: "assassin", affinite: "chaos", rarete: "epique",
    mods: { atq: 1.04 },
    passif: { nom: "Reiserei", description: "ATQ +10 % par KO réalisé (max +30 %)", type: "atqParKo", bonus: 0.1, max: 0.3 },
    ultime: { nom: "Tranche tout", description: "380 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 3.8 },
    ] },
  },
  {
    id: "aura", nom: "Aura", serie: "Frieren", role: "controle", affinite: "chaos", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Balance de l'obéissance", description: "VIT des ennemis -6 %", type: "auraVitEnnemis", malus: 0.06 },
    ultime: { nom: "Soumission", description: "Étourdissement 1,5 s à la ligne avant ennemie", actions: [
      { type: "degats", cible: "ligne-avant", mult: 0.8, effet: { type: "etourdi", duree: 1.5 } },
    ] },
  },
  {
    id: "eisen", nom: "Eisen", serie: "Frieren", role: "tank", affinite: "puissance", rarete: "commun",
    mods: { pv: 1.06 },
    passif: { nom: "Guerrier nain", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Hache du nain", description: "200 % à la cible en face, puis Provocation", actions: [
      { type: "degats", cible: "face", mult: 2.0 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- Fairy Tail ----------
  {
    id: "zeref", nom: "Zeref", serie: "Fairy Tail", role: "controle", affinite: "chaos", rarete: "legendaire",
    mods: { atq: 1.03 },
    passif: { nom: "Malédiction d'Ankhseram", description: "Ses attaques de base appliquent Vulnérabilité 2 s", type: "effetSurBase", effet: "vulnerabilite", duree: 2 },
    ultime: { nom: "Vague noire", description: "150 % à tous les ennemis et Ralentissement 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.5, effet: { type: "ralenti", duree: 3 } },
    ] },
  },
  {
    id: "gajeel", nom: "Gajeel", serie: "Fairy Tail", role: "tank", affinite: "puissance", rarete: "rare",
    mods: { def: 1.05 },
    passif: { nom: "Écailles d'acier", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Hurlement du dragon d'acier", description: "170 % à la ligne avant, puis Provocation", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.7 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "juvia", nom: "Juvia", serie: "Fairy Tail", role: "controle", affinite: "esprit", rarete: "rare",
    mods: {},
    passif: { nom: "Corps d'eau", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Water Nebula", description: "110 % à tous les ennemis avec Ralentissement 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.1, effet: { type: "ralenti", duree: 3 } },
    ] },
  },

  // ---------- Saint Seiya ----------
  {
    id: "saga", nom: "Saga", serie: "Saint Seiya", role: "controle", affinite: "chaos", rarete: "legendaire",
    mods: { atq: 1.04 },
    passif: { nom: "Double visage", description: "ATQ +25 % sous 50 % de PV", type: "atqSousPv", seuil: 0.5, bonus: 0.25 },
    ultime: { nom: "Galaxian Explosion", description: "160 % à tous les ennemis et Étourdissement 1 s", actions: [
      { type: "degats", cible: "tous", mult: 1.6, effet: { type: "etourdi", duree: 1 } },
    ] },
  },
  {
    id: "shaka", nom: "Shaka", serie: "Saint Seiya", role: "controle", affinite: "esprit", rarete: "epique",
    mods: {},
    passif: { nom: "Yeux fermés", description: "Ignore la première attaque reçue toutes les 10 s", type: "annuleAttaquePeriodique", periode: 10 },
    ultime: { nom: "Trésor du ciel", description: "Étourdissement 2 s à l'ennemi qui a le plus d'énergie, et 100 % à tous", actions: [
      { type: "degats", cible: "plus-energie", mult: 0.5, effet: { type: "etourdi", duree: 2 } },
      { type: "degats", cible: "tous", mult: 1.0 },
    ] },
  },
  {
    id: "seiya", nom: "Seiya", serie: "Saint Seiya", role: "attaquant", affinite: "puissance", rarete: "rare",
    mods: { pv: 1.04 },
    passif: { nom: "Cosmos ardent", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Météores de Pégase", description: "7 frappes de 50 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.5, coups: 7 },
    ] },
  },
  {
    id: "ikki", nom: "Ikki", serie: "Saint Seiya", role: "assassin", affinite: "chaos", rarete: "rare",
    mods: { atq: 1.04 },
    passif: { nom: "Phénix", description: "À 30 % de PV, dort 2 s et récupère 25 % de ses PV max (une fois)", type: "reposUneFois", seuil: 0.3, duree: 2, soin: 0.25 },
    ultime: { nom: "Ailes du phénix", description: "280 % au perso ennemi qui a le moins de PV, avec Brûlure 3 s", actions: [
      { type: "degats", cible: "plus-faible", mult: 2.8, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "shiryu", nom: "Shiryū", serie: "Saint Seiya", role: "tank", affinite: "technique", rarete: "peu_commun",
    mods: { def: 1.05 },
    passif: { nom: "Bouclier du dragon", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Colère du dragon", description: "200 % à la cible en face, puis Provocation", actions: [
      { type: "degats", cible: "face", mult: 2.0 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "aldebaran", nom: "Aldébaran", serie: "Saint Seiya", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: { pv: 1.06 },
    passif: { nom: "Taureau d'or", description: "Sous 40 % de PV, DEF +30 % (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Grande Corne", description: "150 % à la ligne avant et Étourdissement 1 s", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.5, effet: { type: "etourdi", duree: 1 } },
    ] },
  },
  {
    id: "hyoga", nom: "Hyōga", serie: "Saint Seiya", role: "controle", affinite: "vitesse", rarete: "commun",
    mods: {},
    passif: { nom: "Zéro absolu", description: "Ses attaques de base appliquent Ralentissement 2 s", type: "effetSurBase", effet: "ralenti", duree: 2 },
    ultime: { nom: "Poussière de diamant", description: "100 % à tous les ennemis avec Ralentissement 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.0, effet: { type: "ralenti", duree: 3 } },
    ] },
  },
  {
    id: "shun", nom: "Shun", serie: "Saint Seiya", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Défense circulaire", description: "Soigne l'allié le plus blessé de 3 % toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Chaîne nébulaire", description: "Bouclier de 16 % des PV aux alliés de la ligne avant, 90 % et Étourdissement 1,5 s en face", actions: [
      { type: "effet", cible: "allies-avant", effet: "bouclier", duree: 6, pourcentPv: 0.16 },
      { type: "degats", cible: "face", mult: 0.9, effet: { type: "etourdi", duree: 1.5 } },
    ] },
  },

  // ---------- Black Clover ----------
  {
    id: "julius", nom: "Julius", serie: "Black Clover", role: "controle", affinite: "technique", rarete: "legendaire",
    mods: {},
    passif: { nom: "Magie temporelle", description: "Gagne 2 d'énergie par seconde", type: "energieParSeconde", valeur: 2 },
    ultime: { nom: "Arrêt du temps", description: "Étourdissement 1 s à tous les ennemis et Accélération 2 s pour l'équipe", actions: [
      { type: "degats", cible: "tous", mult: 0.4, effet: { type: "etourdi", duree: 1 } },
      { type: "effet", cible: "allies", effet: "acceleration", duree: 2 },
    ] },
  },
  {
    id: "yami", nom: "Yami", serie: "Black Clover", role: "attaquant", affinite: "chaos", rarete: "epique",
    mods: { atq: 1.04 },
    passif: { nom: "Dépasser ses limites", description: "ATQ +1 % par tranche de 2 % de PV perdus", type: "atqSelonPvPerdus", ratio: 0.5 },
    ultime: { nom: "Tranchant des ténèbres", description: "240 % à la cible en face et au perso derrière elle", actions: [
      { type: "degats", cible: "face+derriere", mult: 2.4 },
    ] },
  },
  {
    id: "asta", nom: "Asta", serie: "Black Clover", role: "attaquant", affinite: "puissance", rarete: "rare",
    mods: { pv: 1.04 },
    passif: { nom: "Anti-magie", description: "-25 % de dégâts subis des ultimes", type: "reductionUltime", pourcent: 0.25 },
    ultime: { nom: "Black Meteorite", description: "250 % à la cible en face", actions: [
      { type: "degats", cible: "face", mult: 2.5 },
    ] },
  },
  {
    id: "yuno", nom: "Yuno", serie: "Black Clover", role: "assassin", affinite: "vitesse", rarete: "rare",
    mods: { vit: 1.05 },
    passif: { nom: "Esprit du vent", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Lance de Zéphyr", description: "320 % à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 3.2 },
    ] },
  },
  {
    id: "noelle", nom: "Noelle", serie: "Black Clover", role: "soutien", affinite: "esprit", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Sang royal", description: "Soins +20 % sur les alliés sous 30 % de PV", type: "soinsBonusBlesses", seuil: 0.3, bonus: 0.2 },
    ultime: { nom: "Dôme aquatique", description: "Soigne tous les alliés de 8 % et leur donne Régénération 4 s", actions: [
      { type: "soin", cible: "allies", pourcent: 0.08 },
      { type: "effet", cible: "allies", effet: "regeneration", duree: 4 },
    ] },
  },
  {
    id: "mereoleona", nom: "Mereoleona", serie: "Black Clover", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: { pv: 1.04, atq: 1.03 },
    passif: { nom: "Reine lionne", description: "ATQ +25 % sous 50 % de PV", type: "atqSousPv", seuil: 0.5, bonus: 0.25 },
    ultime: { nom: "Calidos Brachium", description: "150 % à la ligne avant avec Brûlure 3 s, puis Provocation", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.5, effet: { type: "brulure", duree: 3 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "luck", nom: "Luck", serie: "Black Clover", role: "assassin", affinite: "vitesse", rarete: "commun",
    mods: { vit: 1.05 },
    passif: { nom: "Fou de combat", description: "+10 % de dégâts par coup sur la même cible (max +60 %)", type: "concentration", bonus: 0.1, max: 0.6 },
    ultime: { nom: "Danse électrique", description: "3 frappes de 90 % au hasard avec Étourdissement 0,5 s", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.9, coups: 3, effet: { type: "etourdi", duree: 0.5 } },
    ] },
  },
  {
    id: "finral", nom: "Finral", serie: "Black Clover", role: "soutien", affinite: "technique", rarete: "commun",
    mods: {},
    passif: { nom: "Portails", description: "Ignore la première attaque reçue toutes les 10 s", type: "annuleAttaquePeriodique", periode: 10 },
    ultime: { nom: "Transport spatial", description: "+45 d'énergie aux autres alliés et Bouclier de 10 % pour tous", actions: [
      { type: "energie", cible: "allies-autres", montant: 45 },
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.1 },
    ] },
  },

  // ---------- Solo Leveling ----------
  {
    id: "jinwoo", nom: "Sung Jinwoo", serie: "Solo Leveling", role: "assassin", affinite: "chaos", rarete: "legendaire",
    mods: { atq: 1.04, vit: 1.03 },
    passif: { nom: "Monarque des ombres", description: "ATQ +10 % par KO réalisé (max +30 %)", type: "atqParKo", bonus: 0.1, max: 0.3 },
    ultime: { nom: "Domaine du monarque", description: "4 frappes de 110 % au hasard avec Vulnérabilité 3 s", actions: [
      { type: "degats", cible: "aleatoire", mult: 1.1, coups: 4, effet: { type: "vulnerabilite", duree: 3 } },
    ] },
  },
  {
    id: "chahaein", nom: "Cha Hae-In", serie: "Solo Leveling", role: "attaquant", affinite: "vitesse", rarete: "epique",
    mods: { vit: 1.04 },
    passif: { nom: "Danse de l'épée", description: "Ses attaques de base frappent une 2e fois à 15 %", type: "doubleFrappe", mult: 0.15 },
    ultime: { nom: "Lame dansante", description: "3 frappes de 110 % sur la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.1, coups: 3 },
    ] },
  },
  {
    id: "igris", nom: "Igris", serie: "Solo Leveling", role: "tank", affinite: "technique", rarete: "rare",
    mods: { def: 1.05 },
    passif: { nom: "Chevalier de sang", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Serment écarlate", description: "250 % à la cible en face, puis Provocation, Renforcement 6 s et Bouclier de 15 %", actions: [
      { type: "degats", cible: "face", mult: 2.5 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
      { type: "effet", cible: "soi", effet: "renforcement", duree: 6 },
      { type: "effet", cible: "soi", effet: "bouclier", duree: 6, pourcentPv: 0.15 },
    ] },
  },
  {
    id: "beru", nom: "Beru", serie: "Solo Leveling", role: "attaquant", affinite: "chaos", rarete: "rare",
    mods: { atq: 1.04, pv: 0.98 },
    passif: { nom: "Roi des fourmis", description: "Récupère 3 % de ses PV max toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Griffes royales", description: "5 frappes de 60 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.6, coups: 5 },
    ] },
  },
  {
    id: "choijongin", nom: "Choi Jong-In", serie: "Solo Leveling", role: "controle", affinite: "puissance", rarete: "peu_commun",
    mods: { atq: 1.03 },
    passif: { nom: "Ultime chasseur", description: "Ses attaques de base appliquent Brûlure 2 s", type: "effetSurBase", effet: "brulure", duree: 2 },
    ultime: { nom: "Pluie de flammes", description: "110 % à tous les ennemis avec Brûlure 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.1, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "gogunhee", nom: "Go Gunhee", serie: "Solo Leveling", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: { pv: 1.05 },
    passif: { nom: "Président", description: "ATQ +15 % pour les alliés de la ligne avant", type: "auraAtqAvant", bonus: 0.15 },
    ultime: { nom: "Poing de l'association", description: "160 % à la ligne avant, puis Provocation", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.6 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "leejoohee", nom: "Lee Joohee", serie: "Solo Leveling", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Guérisseuse de rang B", description: "Soins +20 % sur les alliés sous 30 % de PV", type: "soinsBonusBlesses", seuil: 0.3, bonus: 0.2 },
    ultime: { nom: "Lumière apaisante", description: "Soigne tous les alliés de 15 % de leurs PV max", actions: [
      { type: "soin", cible: "allies", pourcent: 0.15 },
    ] },
  },
  {
    id: "yoojinho", nom: "Yoo Jinho", serie: "Solo Leveling", role: "tank", affinite: "technique", rarete: "commun",
    mods: { def: 1.05 },
    passif: { nom: "Fidèle bras droit", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Grand bouclier", description: "Bouclier de 10 % des PV aux alliés de la ligne avant, puis Provocation", actions: [
      { type: "effet", cible: "allies-avant", effet: "bouclier", duree: 6, pourcentPv: 0.1 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- Fullmetal Alchemist ----------
  {
    id: "bradley", nom: "King Bradley", serie: "Fullmetal Alchemist", role: "assassin", affinite: "vitesse", rarete: "legendaire",
    mods: { atq: 1.04, vit: 1.04 },
    passif: { nom: "Œil ultime", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Wrath", description: "2 frappes critiques garanties de 200 % sur un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 2.0, coups: 2, critGaranti: true },
    ] },
  },
  {
    id: "roy", nom: "Roy Mustang", serie: "Fullmetal Alchemist", role: "attaquant", affinite: "puissance", rarete: "epique",
    mods: { atq: 1.04 },
    passif: { nom: "Alchimiste de flamme", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Claquement de doigts", description: "150 % à tous les ennemis avec Brûlure 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.5, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "edward", nom: "Edward", serie: "Fullmetal Alchemist", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: { atq: 1.03 },
    passif: { nom: "Bras d'acier", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Transmutation", description: "200 % à la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 2.0 },
    ] },
  },
  {
    id: "riza", nom: "Riza", serie: "Fullmetal Alchemist", role: "controle", affinite: "technique", rarete: "rare",
    mods: { atq: 1.03 },
    passif: { nom: "Œil de faucon", description: "Son premier coup du combat est un critique garanti", type: "premierCoupCritique" },
    ultime: { nom: "Tir de couverture", description: "Vulnérabilité 4 s, 310 % et Étourdissement 2 s sur l'ennemi à la plus forte ATQ", actions: [
      { type: "effet", cible: "plus-forte-atq", effet: "vulnerabilite", duree: 4 },
      { type: "degats", cible: "plus-forte-atq", mult: 3.1, effet: { type: "etourdi", duree: 2 } },
    ] },
  },
  {
    id: "alphonse", nom: "Alphonse", serie: "Fullmetal Alchemist", role: "tank", affinite: "esprit", rarete: "peu_commun",
    mods: { pv: 1.05 },
    passif: { nom: "Armure vide", description: "-25 % de dégâts subis des ultimes", type: "reductionUltime", pourcent: 0.25 },
    ultime: { nom: "Mur de pierre", description: "Bouclier de 12 % des PV aux alliés de la ligne avant, puis Provocation", actions: [
      { type: "effet", cible: "allies-avant", effet: "bouclier", duree: 6, pourcentPv: 0.12 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "scar", nom: "Scar", serie: "Fullmetal Alchemist", role: "assassin", affinite: "chaos", rarete: "peu_commun",
    mods: { atq: 1.04 },
    passif: { nom: "Bras de destruction", description: "Ses critiques font x1,8 au lieu de x1,5", type: "multCrit", valeur: 1.8 },
    ultime: { nom: "Décomposition", description: "300 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 3.0 },
    ] },
  },
  {
    id: "armstrong", nom: "Armstrong", serie: "Fullmetal Alchemist", role: "tank", affinite: "puissance", rarete: "commun",
    mods: { pv: 1.05 },
    passif: { nom: "Muscles héréditaires", description: "Sous 40 % de PV, DEF +30 % (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Poing étincelant", description: "160 % à la cible en face et Étourdissement 1 s, puis Provocation", actions: [
      { type: "degats", cible: "face", mult: 1.6, effet: { type: "etourdi", duree: 1 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "winry", nom: "Winry", serie: "Fullmetal Alchemist", role: "soutien", affinite: "technique", rarete: "commun",
    mods: {},
    passif: { nom: "Mécanicienne", description: "Soigne l'allié le plus blessé de 3 % toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Réparation express", description: "Soigne tous les alliés de 10 % et Renforcement 3 s", actions: [
      { type: "soin", cible: "allies", pourcent: 0.1 },
      { type: "effet", cible: "allies", effet: "renforcement", duree: 3 },
    ] },
  },

  // ---------- Tokyo Ghoul ----------
  {
    id: "arima", nom: "Arima", serie: "Tokyo Ghoul", role: "assassin", affinite: "technique", rarete: "legendaire",
    mods: { atq: 1.04 },
    passif: { nom: "Dieu de la mort", description: "+10 % de dégâts par coup sur la même cible (max +60 %)", type: "concentration", bonus: 0.1, max: 0.6 },
    ultime: { nom: "IXA", description: "420 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 4.2 },
    ] },
  },
  {
    id: "kaneki", nom: "Kaneki", serie: "Tokyo Ghoul", role: "attaquant", affinite: "chaos", rarete: "epique",
    mods: { pv: 1.03 },
    passif: { nom: "Kagune", description: "Récupère 3 % de ses PV max toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Centipède", description: "4 frappes de 80 % sur la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 0.8, coups: 4 },
    ] },
  },
  {
    id: "touka", nom: "Touka", serie: "Tokyo Ghoul", role: "assassin", affinite: "vitesse", rarete: "rare",
    mods: { vit: 1.05 },
    passif: { nom: "Ukaku", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "Pluie de cristaux", description: "6 frappes de 50 % sur la ligne arrière", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 0.5, coups: 6 },
    ] },
  },
  {
    id: "juuzou", nom: "Juuzou", serie: "Tokyo Ghoul", role: "controle", affinite: "chaos", rarete: "rare",
    mods: { vit: 1.03 },
    passif: { nom: "Sans douleur", description: "ATQ +1 % par tranche de 2 % de PV perdus", type: "atqSelonPvPerdus", ratio: 0.5 },
    ultime: { nom: "Jason", description: "130 % à tous les ennemis avec Vulnérabilité 3 s", actions: [
      { type: "degats", cible: "tous", mult: 1.3, effet: { type: "vulnerabilite", duree: 3 } },
    ] },
  },
  {
    id: "amon", nom: "Amon", serie: "Tokyo Ghoul", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: { pv: 1.05 },
    passif: { nom: "Justice", description: "20 % de chance d'étourdir 1 s l'ennemi qui le frappe", type: "etourdirAttaquant", chance: 0.2, duree: 1 },
    ultime: { nom: "Doujima", description: "Bouclier de 20 % de ses PV et Provocation", actions: [
      { type: "effet", cible: "soi", effet: "bouclier", duree: 6, pourcentPv: 0.2 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "rize", nom: "Rize", serie: "Tokyo Ghoul", role: "attaquant", affinite: "chaos", rarete: "peu_commun",
    mods: { atq: 1.04 },
    passif: { nom: "Gourmande", description: "ATQ +10 % par KO réalisé (max +30 %)", type: "atqParKo", bonus: 0.1, max: 0.3 },
    ultime: { nom: "Rinkaku", description: "220 % à la cible en face et au perso derrière elle", actions: [
      { type: "degats", cible: "face+derriere", mult: 2.2 },
    ] },
  },
  {
    id: "hinami", nom: "Hinami", serie: "Tokyo Ghoul", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Odorat fin", description: "Soins +20 % sur les alliés sous 30 % de PV", type: "soinsBonusBlesses", seuil: 0.3, bonus: 0.2 },
    ultime: { nom: "Refuge", description: "Soigne tous les alliés de 10 % et leur donne Régénération 4 s", actions: [
      { type: "soin", cible: "allies", pourcent: 0.1 },
      { type: "effet", cible: "allies", effet: "regeneration", duree: 4 },
    ] },
  },
  {
    id: "nishiki", nom: "Nishiki", serie: "Tokyo Ghoul", role: "assassin", affinite: "vitesse", rarete: "commun",
    mods: { vit: 1.04 },
    passif: { nom: "Bikaku", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Queue de serpent", description: "280 % à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 2.8 },
    ] },
  },

  // ---------- JoJo ----------
  {
    id: "dio", nom: "DIO", serie: "JoJo", role: "controle", affinite: "chaos", rarete: "legendaire",
    mods: { atq: 1.04 },
    passif: { nom: "Vampire", description: "Récupère 3 % de ses PV max toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "The World", description: "Étourdissement 1,5 s à tous les ennemis, puis 70 % à tous", actions: [
      { type: "degats", cible: "tous", mult: 0.3, effet: { type: "etourdi", duree: 1.5 } },
      { type: "degats", cible: "tous", mult: 0.7 },
    ] },
  },
  {
    id: "jotaro", nom: "Jotaro", serie: "JoJo", role: "attaquant", affinite: "puissance", rarete: "epique",
    mods: { atq: 1.04 },
    passif: { nom: "Star Platinum", description: "Ses attaques de base frappent une 2e fois à 15 %", type: "doubleFrappe", mult: 0.15 },
    ultime: { nom: "Ora ora ora", description: "8 frappes de 45 % sur la cible en face", actions: [
      { type: "degats", cible: "face", mult: 0.45, coups: 8 },
    ] },
  },
  {
    id: "joseph", nom: "Joseph", serie: "JoJo", role: "controle", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Ta prochaine réplique", description: "35 % de chance d'étourdir 1 s l'ennemi qui le frappe", type: "etourdirAttaquant", chance: 0.35, duree: 1 },
    ultime: { nom: "Hermit Purple", description: "Vulnérabilité 4 s, 280 % et Étourdissement 2,5 s sur un perso de la ligne arrière", actions: [
      { type: "effet", cible: "arriere", effet: "vulnerabilite", duree: 4 },
      { type: "degats", cible: "arriere", mult: 2.8, effet: { type: "etourdi", duree: 2.5 } },
    ] },
  },
  {
    id: "giorno", nom: "Giorno", serie: "JoJo", role: "soutien", affinite: "esprit", rarete: "rare",
    mods: {},
    passif: { nom: "Gold Experience", description: "Soigne l'allié le plus blessé de 2 % toutes les 5 s", type: "soinPeriodiqueBlesse", pourcent: 0.02, periode: 5 },
    ultime: { nom: "Souffle de vie", description: "Soigne tous les alliés de 9 % et leur donne Régénération 3 s", actions: [
      { type: "soin", cible: "allies", pourcent: 0.09 },
      { type: "effet", cible: "allies", effet: "regeneration", duree: 3 },
    ] },
  },
  {
    id: "kakyoin", nom: "Kakyoin", serie: "JoJo", role: "controle", affinite: "technique", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Hierophant Green", description: "Ses attaques de base appliquent Ralentissement 2 s", type: "effetSurBase", effet: "ralenti", duree: 2 },
    ultime: { nom: "Émeraude Splash", description: "5 frappes de 90 % sur des ennemis au hasard, qui ralentissent 2 s", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.9, coups: 5, effet: { type: "ralenti", duree: 2 } },
    ] },
  },
  {
    id: "polnareff", nom: "Polnareff", serie: "JoJo", role: "assassin", affinite: "vitesse", rarete: "peu_commun",
    mods: { vit: 1.05 },
    passif: { nom: "Silver Chariot", description: "25 % de chance d'esquiver une attaque de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Rafale d'estoc", description: "4 frappes de 85 % sur un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 0.85, coups: 4 },
    ] },
  },
  {
    id: "josuke", nom: "Josuke", serie: "JoJo", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Crazy Diamond", description: "Soins +20 % sur les alliés sous 30 % de PV", type: "soinsBonusBlesses", seuil: 0.3, bonus: 0.2 },
    ultime: { nom: "Restauration", description: "Soigne tous les alliés de 14 % de leurs PV max", actions: [
      { type: "soin", cible: "allies", pourcent: 0.14 },
    ] },
  },
  {
    id: "jonathan", nom: "Jonathan", serie: "JoJo", role: "tank", affinite: "puissance", rarete: "commun",
    mods: { pv: 1.05 },
    passif: { nom: "Gentleman", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Onde d'overdrive", description: "170 % à la cible en face, puis Provocation", actions: [
      { type: "degats", cible: "face", mult: 1.7 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
];
