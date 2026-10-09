// ==========================================================
// LES 160 PERSOS (24 de la V0.1, 8 du Volume 2, 46 du Volume 3,
// 82 du Volume 4 dans persos-v4.js)
// Chaque perso : sa serie, son role, son affinite, sa rarete, de petits
// ajustements de stats (mods), son passif et son ultime.
// Ajouter un perso = ajouter une entree ici.
// ==========================================================

import { PERSOS_V4 } from "./persos-v4.js";
import { PERSOS_SECRETS } from "./persos-secrets.js";

const PERSOS_BASE = [
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
    ultime: { nom: "Final Flash", description: "360 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 3.6 },
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
    ultime: { nom: "Multiclonage", description: "6 frappes de 100 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 1.0, coups: 6 },
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
    mods: { pv: 1.1 },
    passif: { nom: "Corps élastique", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Gatling", description: "6 coups de 60 % sur la ligne avant, puis Provocation", actions: [
      { type: "degats", cible: "ligne-avant-aleatoire", mult: 0.6, coups: 6 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "zoro", nom: "Zoro", serie: "One Piece", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: { atq: 1.08, vit: 0.95, crit: 0.1 },
    passif: { nom: "Sabreur", description: "Ses critiques font x1,8 au lieu de x1,5", type: "multCrit", valeur: 1.8 },
    ultime: { nom: "Santoryu", description: "450 % à une cible", actions: [
      { type: "degats", cible: "base", mult: 4.5 },
    ] },
  },
  {
    id: "chopper", nom: "Chopper", serie: "One Piece", role: "soutien", affinite: "technique", rarete: "commun",
    mods: { pv: 0.95, vit: 1.05 },
    passif: { nom: "Médecin de bord", description: "Soigne l'allié le plus blessé de 3 % toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Rumble Ball", description: "Régénération sur toute l'équipe et Bouclier de 10 % sur la ligne avant", actions: [
      { type: "effet", cible: "allies", effet: "regeneration", duree: 4 },
      { type: "effet", cible: "allies-avant", effet: "bouclier", duree: 6, pourcentPv: 0.1 },
    ] },
  },

  // ---------- Pokemon ----------
  {
    id: "pikachu", nom: "Pikachu", serie: "Pokémon", role: "controle", affinite: "vitesse", rarete: "peu_commun",
    mods: { vit: 1.15 },
    passif: { nom: "Statik", description: "30 % de chance d'étourdir 1 s l'ennemi qui le frappe", type: "etourdirAttaquant", chance: 0.3, duree: 1 },
    ultime: { nom: "Tonnerre", description: "3 éclairs de 110 % sur des ennemis au hasard, chacun avec Étourdissement 1,5 s", actions: [
      { type: "degats", cible: "aleatoire", mult: 1.1, coups: 3, effet: { type: "etourdi", duree: 1.5 } },
    ] },
  },
  {
    id: "ronflex", nom: "Ronflex", serie: "Pokémon", role: "tank", affinite: "puissance", rarete: "commun",
    mods: { pv: 1.1, vit: 0.9 },
    passif: { nom: "Repos", description: "À 30 % de PV, dort 2 s et récupère 25 % de ses PV max (une fois)", type: "reposUneFois", seuil: 0.3, duree: 2, soin: 0.25 },
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
    passif: { nom: "Charisme", description: "ATQ +15 % pour les alliés de la ligne avant", type: "auraAtqAvant", bonus: 0.15 },
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
    ultime: { nom: "Chiens divins", description: "3 morsures de 150 % sur la ligne arrière et Ralentissement", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 1.5, coups: 3, effet: { type: "ralenti", duree: 4 } },
    ] },
  },

  // ---------- Demon Slayer ----------
  {
    id: "tanjiro", nom: "Tanjiro", serie: "Demon Slayer", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Odorat", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Danse du dieu du feu", description: "260 % et Brûlure à l'ennemi qui a le moins de PV (il sent la faille)", actions: [
      { type: "degats", cible: "plus-faible", mult: 2.6, effet: { type: "brulure", duree: 4 } },
    ] },
  },
  {
    id: "nezuko", nom: "Nezuko", serie: "Demon Slayer", role: "tank", affinite: "chaos", rarete: "peu_commun",
    mods: { vit: 1.05, pv: 1.12 },
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
    passif: { nom: "Concentration", description: "+10 % de dégâts par coup sur la même cible (max +60 %)", type: "concentration", bonus: 0.1, max: 0.6 },
    ultime: { nom: "Jajanken", description: "500 % à la cible en face, mais il perd 10 % de ses PV", actions: [
      { type: "degats", cible: "face", mult: 5.0 },
      { type: "coutPv", pourcent: 0.1 },
    ] },
  },
  {
    id: "killua", nom: "Killua", serie: "Hunter x Hunter", role: "assassin", affinite: "vitesse", rarete: "peu_commun",
    mods: { vit: 1.05 },
    passif: { nom: "Né assassin", description: "Son premier coup du combat est un critique garanti", type: "premierCoupCritique" },
    ultime: { nom: "Godspeed", description: "VIT +60 % pendant 3 s et 200 % à un perso de la ligne arrière avec Étourdissement 1 s", actions: [
      { type: "effet", cible: "soi", effet: "acceleration", duree: 3 },
      { type: "degats", cible: "arriere", mult: 2.0, effet: { type: "etourdi", duree: 1 } },
    ] },
  },
  {
    id: "kurapika", nom: "Kurapika", serie: "Hunter x Hunter", role: "controle", affinite: "technique", rarete: "epique",
    mods: { def: 1.05, atq: 1.1 },
    passif: { nom: "Yeux écarlates", description: "ATQ +30 % dès qu'un allié tombe KO", type: "atqSiAllieKo", bonus: 0.3 },
    ultime: { nom: "Chaîne du jugement", description: "240 % et Étourdissement 3 s sur l'ennemi à la plus forte ATQ, puis Emperor Time : Accélération 3 s et Renforcement 6 s", actions: [
      { type: "degats", cible: "plus-forte-atq", mult: 2.4, effet: { type: "etourdi", duree: 3 } },
      { type: "effet", cible: "soi", effet: "acceleration", duree: 3 },
      { type: "effet", cible: "soi", effet: "renforcement", duree: 6 },
    ] },
  },
  // ---------- Volume 2 : un 4e perso par serie ----------
  {
    id: "c18", nom: "C-18", serie: "Dragon Ball", role: "attaquant", affinite: "vitesse", rarete: "rare",
    mods: { vit: 1.05 },
    passif: { nom: "Énergie infinie", description: "Gagne 4 d'énergie par seconde", type: "energieParSeconde", valeur: 4 },
    ultime: { nom: "Kienzan", description: "280 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 2.8 },
    ] },
  },
  {
    id: "tsunade", nom: "Tsunade", serie: "Naruto", role: "soutien", affinite: "puissance", rarete: "legendaire",
    mods: {},
    passif: { nom: "Médecin légendaire", description: "Soins +25 % sur les alliés sous 40 % de PV", type: "soinsBonusBlesses", seuil: 0.4, bonus: 0.25 },
    ultime: { nom: "Katsuyu", description: "Soigne toute l'équipe de 12 % et lui donne Régénération 3 s", actions: [
      { type: "soin", cible: "allies", pourcent: 0.12 },
      { type: "effet", cible: "allies", effet: "regeneration", duree: 3 },
    ] },
  },
  {
    id: "nami", nom: "Nami", serie: "One Piece", role: "controle", affinite: "vitesse", rarete: "rare",
    mods: { vit: 1.1 },
    passif: { nom: "Navigatrice", description: "Ralentit toute l'équipe ennemie de 8 %", type: "auraVitEnnemis", malus: 0.08 },
    ultime: { nom: "Zeus Breeze Tempo", description: "110 % à tous les ennemis, puis Étourdissement 1,5 s sur l'un d'eux au hasard", actions: [
      { type: "degats", cible: "tous", mult: 1.1 },
      { type: "degats", cible: "aleatoire", mult: 0.3, effet: { type: "etourdi", duree: 1.5 } },
    ] },
  },
  {
    id: "dracaufeu", nom: "Dracaufeu", serie: "Pokémon", role: "attaquant", affinite: "puissance", rarete: "epique",
    mods: { atq: 1.05 },
    passif: { nom: "Brasier", description: "ATQ +30 % sous 33 % de PV", type: "atqSousPv", seuil: 0.33, bonus: 0.3 },
    ultime: { nom: "Déflagration", description: "140 % et Brûlure 2 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.4, effet: { type: "brulure", duree: 2 } },
    ] },
  },
  {
    id: "chevalier", nom: "Chevalier Squelette", serie: "Berserk", role: "tank", affinite: "technique", rarete: "legendaire",
    mods: { pv: 1.12, atq: 1.2 },
    passif: { nom: "Armure de l'ancien roi", description: "-25 % de dégâts subis des ultimes", type: "reductionUltime", pourcent: 0.25 },
    ultime: { nom: "Épée de Béhérit", description: "180 % à tous les ennemis, puis Provocation", actions: [
      { type: "degats", cible: "tous", mult: 1.8 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "nobara", nom: "Nobara", serie: "Jujutsu Kaisen", role: "controle", affinite: "technique", rarete: "rare",
    mods: { atq: 1.15, pv: 1.05 },
    passif: { nom: "Résonance", description: "Ses attaques de base ont 50 % de chance d'appliquer Vulnérabilité 3 s (+25 % de dégâts subis)", type: "effetSurBase", effet: "vulnerabilite", duree: 3, chance: 0.5 },
    ultime: { nom: "Clou et marteau", description: "4 clous de 110 % sur des ennemis au hasard, chacun avec Vulnérabilité 4 s", actions: [
      { type: "degats", cible: "aleatoire", mult: 1.1, coups: 4, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "shinobu", nom: "Shinobu", serie: "Demon Slayer", role: "assassin", affinite: "technique", rarete: "epique",
    mods: { atq: 0.95, vit: 1.05 },
    passif: { nom: "Poison de glycine", description: "Ses attaques de base appliquent Vulnérabilité 2 s (+25 % de dégâts subis)", type: "effetSurBase", effet: "vulnerabilite", duree: 2 },
    ultime: { nom: "Danse du papillon", description: "4 piqûres de 80 % sur la ligne arrière, chacune avec Vulnérabilité 4 s", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 0.8, coups: 4, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "hisoka", nom: "Hisoka", serie: "Hunter x Hunter", role: "controle", affinite: "chaos", rarete: "epique",
    mods: { atq: 1.2, pv: 1.05 },
    passif: { nom: "Texture surprise", description: "30 % de chance d'esquiver les attaques de base", type: "esquiveBase", chance: 0.3 },
    ultime: { nom: "Bungee Gum", description: "320 % et Étourdissement 2,5 s sur l'ennemi qui a le plus d'énergie (il coupe son ultime)", actions: [
      { type: "degats", cible: "plus-energie", mult: 3.2, effet: { type: "etourdi", duree: 2.5 } },
    ] },
  },
  // ---------- Volume 3 : 2 persos de plus par serie ----------
  {
    id: "krilin", nom: "Krilin", serie: "Dragon Ball", role: "soutien", affinite: "technique", rarete: "commun",
    mods: {},
    passif: { nom: "Haricot magique", description: "À 40 % de PV, gagne 30 % de DEF (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Taiyoken", description: "Étourdissement 1,5 s sur la ligne avant ennemie et soin de 10 % pour toute l'équipe", actions: [
      { type: "degats", cible: "ligne-avant", mult: 0.4, effet: { type: "etourdi", duree: 1.5 } },
      { type: "soin", cible: "allies", pourcent: 0.1 },
    ] },
  },
  {
    id: "freezer", nom: "Freezer", serie: "Dragon Ball", role: "assassin", affinite: "chaos", rarete: "epique",
    mods: { atq: 1.05 },
    passif: { nom: "Empereur de l'univers", description: "ATQ +15 % par KO réalisé (max +45 %)", type: "atqParKo", bonus: 0.15, max: 0.45 },
    ultime: { nom: "Death Beam", description: "3 rayons de 130 % sur la ligne arrière", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 1.3, coups: 3 },
    ] },
  },
  {
    id: "kakashi", nom: "Kakashi", serie: "Naruto", role: "controle", affinite: "technique", rarete: "epique",
    mods: { vit: 1.05 },
    passif: { nom: "Sharingan", description: "25 % de chance d'esquiver les attaques de base", type: "esquiveBase", chance: 0.25 },
    ultime: { nom: "Raikiri", description: "300 % et Étourdissement 2 s sur l'ennemi qui a le plus d'énergie", actions: [
      { type: "degats", cible: "plus-energie", mult: 3.0, effet: { type: "etourdi", duree: 2 } },
    ] },
  },
  {
    id: "hinata", nom: "Hinata", serie: "Naruto", role: "soutien", affinite: "esprit", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Byakugan", description: "Soigne l'allié le plus blessé de 3 % toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Poings du lion jumeau", description: "Bouclier de 15 % sur toute l'équipe et 120 % à la cible en face", actions: [
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.15 },
      { type: "degats", cible: "face", mult: 1.2 },
    ] },
  },
  {
    id: "sanji", nom: "Sanji", serie: "One Piece", role: "assassin", affinite: "puissance", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Diable Jambe", description: "Ses attaques de base ont 50 % de chance d'appliquer Brûlure 1 s", type: "effetSurBase", effet: "brulure", duree: 1, chance: 0.5 },
    ultime: { nom: "Hell Memories", description: "260 % et Brûlure 3 s à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 2.6, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "robin", nom: "Robin", serie: "One Piece", role: "controle", affinite: "esprit", rarete: "rare",
    mods: {},
    passif: { nom: "Hana Hana", description: "Ses attaques de base appliquent Ralentissement 2 s", type: "effetSurBase", effet: "ralenti", duree: 2 },
    ultime: { nom: "Gigantesco Mano", description: "120 % à tous les ennemis et Étourdissement 1 s", actions: [
      { type: "degats", cible: "tous", mult: 1.2, effet: { type: "etourdi", duree: 1 } },
    ] },
  },
  {
    id: "lucario", nom: "Lucario", serie: "Pokémon", role: "assassin", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Impassible", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Aurasphère", description: "300 % au perso ennemi qui a le moins de PV", actions: [
      { type: "degats", cible: "plus-faible", mult: 3.0 },
    ] },
  },
  {
    id: "florizarre", nom: "Florizarre", serie: "Pokémon", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: { pv: 1.1, vit: 0.9 },
    passif: { nom: "Engrais", description: "Récupère 3 % de ses PV toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Synthèse", description: "Régénération 5 s pour toute l'équipe et Ralentissement 3 s sur la ligne avant ennemie", actions: [
      { type: "effet", cible: "allies", effet: "regeneration", duree: 5 },
      { type: "degats", cible: "ligne-avant", mult: 0.6, effet: { type: "ralenti", duree: 3 } },
    ] },
  },
  {
    id: "casca", nom: "Casca", serie: "Berserk", role: "assassin", affinite: "vitesse", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Commandante", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "Assaut de la Troupe", description: "2 coups de 150 % sur la ligne arrière", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 1.5, coups: 2 },
    ] },
  },
  {
    id: "schierke", nom: "Schierke", serie: "Berserk", role: "soutien", affinite: "esprit", rarete: "rare",
    mods: {},
    passif: { nom: "Esprits élémentaires", description: "Soins +25 % sur les alliés sous 40 % de PV", type: "soinsBonusBlesses", seuil: 0.4, bonus: 0.25 },
    ultime: { nom: "Protection astrale", description: "Bouclier de 15 % et Renforcement 5 s pour toute l'équipe", actions: [
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.15 },
      { type: "effet", cible: "allies", effet: "renforcement", duree: 5 },
    ] },
  },
  {
    id: "sukuna", nom: "Sukuna", serie: "Jujutsu Kaisen", role: "attaquant", affinite: "chaos", rarete: "legendaire",
    mods: {},
    passif: { nom: "Roi des fléaux", description: "ATQ +15 % par KO réalisé (max +45 %)", type: "atqParKo", bonus: 0.15, max: 0.45 },
    ultime: { nom: "Sanctuaire malveillant", description: "4 vagues de 55 % sur tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 0.55, coups: 4 },
    ] },
  },
  {
    id: "todo", nom: "Todo", serie: "Jujutsu Kaisen", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Meilleur ami", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Boogie Woogie", description: "180 % et Étourdissement 1,5 s à la cible en face, puis Provocation", actions: [
      { type: "degats", cible: "face", mult: 1.8, effet: { type: "etourdi", duree: 1.5 } },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "rengoku", nom: "Rengoku", serie: "Demon Slayer", role: "attaquant", affinite: "puissance", rarete: "epique",
    mods: {},
    passif: { nom: "Cœur ardent", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Neuvième forme : Rengoku", description: "220 % et Brûlure 3 s à toute la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant", mult: 2.2, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "inosuke", nom: "Inosuke", serie: "Demon Slayer", role: "assassin", affinite: "chaos", rarete: "commun",
    mods: { pv: 1.05 },
    passif: { nom: "Souffle de la bête", description: "Ses attaques de base frappent une 2e fois pour 15 % des dégâts", type: "doubleFrappe", mult: 0.15 },
    ultime: { nom: "Crocs déchiquetants", description: "4 coups de 70 % sur la ligne arrière", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 0.7, coups: 4 },
    ] },
  },
  {
    id: "netero", nom: "Netero", serie: "Hunter x Hunter", role: "attaquant", affinite: "esprit", rarete: "epique",
    mods: {},
    passif: { nom: "Gratitude", description: "Son premier coup du combat est un critique garanti", type: "premierCoupCritique" },
    ultime: { nom: "Bodhisattva aux cent mains", description: "10 coups de 35 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.35, coups: 10 },
    ] },
  },
  {
    id: "leorio", nom: "Leorio", serie: "Hunter x Hunter", role: "soutien", affinite: "puissance", rarete: "commun",
    mods: { pv: 1.05 },
    passif: { nom: "Futur médecin", description: "Soigne l'allié le plus blessé de 3 % toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Poing distant", description: "Soigne toute l'équipe de 12 % et 150 % à la cible en face", actions: [
      { type: "soin", cible: "allies", pourcent: 0.12 },
      { type: "degats", cible: "face", mult: 1.5 },
    ] },
  },

  // ---------- Bleach ----------
  {
    id: "ichigo", nom: "Ichigo", serie: "Bleach", role: "attaquant", affinite: "vitesse", rarete: "epique",
    mods: {},
    passif: { nom: "Bankai", description: "VIT +40 % sous 50 % de PV", type: "vitSousPv", seuil: 0.5, bonus: 0.4 },
    ultime: { nom: "Getsuga Tenshō", description: "260 % à la cible en face et au perso derrière elle", actions: [
      { type: "degats", cible: "face+derriere", mult: 2.6 },
    ] },
  },
  {
    id: "rukia", nom: "Rukia", serie: "Bleach", role: "controle", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Danse de la lune blanche", description: "Ses attaques de base appliquent Ralentissement 2 s", type: "effetSurBase", effet: "ralenti", duree: 2 },
    ultime: { nom: "Sode no Shirayuki", description: "140 % et Étourdissement 1,5 s à toute la ligne avant (le gel)", actions: [
      { type: "degats", cible: "ligne-avant", mult: 1.4, effet: { type: "etourdi", duree: 1.5 } },
    ] },
  },
  {
    id: "orihime", nom: "Orihime", serie: "Bleach", role: "soutien", affinite: "esprit", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Santen Kesshun", description: "Soins +25 % sur les alliés sous 40 % de PV", type: "soinsBonusBlesses", seuil: 0.4, bonus: 0.25 },
    ultime: { nom: "Sōten Kisshun", description: "Soigne toute l'équipe de 10 % et Bouclier de 6 %", actions: [
      { type: "soin", cible: "allies", pourcent: 0.1 },
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.06 },
    ] },
  },
  {
    id: "byakuya", nom: "Byakuya", serie: "Bleach", role: "assassin", affinite: "technique", rarete: "legendaire",
    mods: {},
    passif: { nom: "Fierté des Kuchiki", description: "Ses critiques font x1,8 au lieu de x1,5", type: "multCrit", valeur: 1.8 },
    ultime: { nom: "Senbonzakura Kageyoshi", description: "6 pétales de 60 % sur la ligne arrière", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 0.6, coups: 6 },
    ] },
  },
  {
    id: "kenpachi", nom: "Kenpachi", serie: "Bleach", role: "tank", affinite: "chaos", rarete: "peu_commun",
    mods: { atq: 1.15 },
    passif: { nom: "Soif de combat", description: "ATQ +1 % par % de PV perdu (moitié de l'effet)", type: "atqSelonPvPerdus", ratio: 0.5 },
    ultime: { nom: "Coup de sabre sauvage", description: "250 % à la cible en face, puis Provocation", actions: [
      { type: "degats", cible: "face", mult: 2.5 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },

  // ---------- My Hero Academia ----------
  {
    id: "deku", nom: "Deku", serie: "My Hero Academia", role: "attaquant", affinite: "puissance", rarete: "rare",
    mods: { pv: 1.05 },
    passif: { nom: "One For All", description: "ATQ +25 % sous 50 % de PV", type: "atqSousPv", seuil: 0.5, bonus: 0.25 },
    ultime: { nom: "Detroit Smash", description: "340 % à la cible en face, mais il perd 8 % de ses PV", actions: [
      { type: "degats", cible: "face", mult: 3.4 },
      { type: "coutPv", pourcent: 0.08 },
    ] },
  },
  {
    id: "bakugo", nom: "Bakugo", serie: "My Hero Academia", role: "assassin", affinite: "puissance", rarete: "epique",
    mods: {},
    passif: { nom: "Explosion", description: "Ses attaques de base frappent une 2e fois pour 15 % des dégâts", type: "doubleFrappe", mult: 0.15 },
    ultime: { nom: "Howitzer Impact", description: "3 explosions de 100 % sur la ligne arrière", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 1.0, coups: 3 },
    ] },
  },
  {
    id: "allmight", nom: "All Might", serie: "My Hero Academia", role: "tank", affinite: "puissance", rarete: "legendaire",
    mods: { atq: 1.2 },
    passif: { nom: "Symbole de la paix", description: "ATQ +15 % pour les alliés de la ligne avant", type: "auraAtqAvant", bonus: 0.15 },
    ultime: { nom: "United States of Smash", description: "200 % à tous les ennemis, puis Provocation", actions: [
      { type: "degats", cible: "tous", mult: 2.0 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "uraraka", nom: "Uraraka", serie: "My Hero Academia", role: "controle", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Zéro gravité", description: "20 % de chance d'étourdir 1 s l'ennemi qui la frappe", type: "etourdirAttaquant", chance: 0.2, duree: 1 },
    ultime: { nom: "Pluie de météores", description: "5 débris de 60 % sur des ennemis au hasard et Ralentissement", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.6, coups: 5, effet: { type: "ralenti", duree: 3 } },
    ] },
  },
  {
    id: "todoroki", nom: "Todoroki", serie: "My Hero Academia", role: "controle", affinite: "technique", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Moitié froid, moitié chaud", description: "Ses attaques de base appliquent Ralentissement 2 s", type: "effetSurBase", effet: "ralenti", duree: 2 },
    ultime: { nom: "Glacier embrasé", description: "130 % et Brûlure 3 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.3, effet: { type: "brulure", duree: 3 } },
    ] },
  },

  // ---------- L'Attaque des Titans ----------
  {
    id: "eren", nom: "Eren", serie: "L'Attaque des Titans", role: "tank", affinite: "chaos", rarete: "epique",
    mods: {},
    passif: { nom: "Titan assaillant", description: "À 30 % de PV, se transforme : dort 2 s puis récupère 25 % de ses PV (une fois)", type: "reposUneFois", seuil: 0.3, duree: 2, soin: 0.25 },
    ultime: { nom: "Coup du Titan", description: "200 % à la cible en face, Bouclier de 20 % et Provocation", actions: [
      { type: "degats", cible: "face", mult: 2.0 },
      { type: "effet", cible: "soi", effet: "bouclier", duree: 6, pourcentPv: 0.2 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "mikasa", nom: "Mikasa", serie: "L'Attaque des Titans", role: "assassin", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Sang Ackerman", description: "Son premier coup du combat est un critique garanti", type: "premierCoupCritique" },
    ultime: { nom: "Tranche-nuque", description: "320 % à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 3.2 },
    ] },
  },
  {
    id: "livai", nom: "Livaï", serie: "L'Attaque des Titans", role: "assassin", affinite: "vitesse", rarete: "legendaire",
    mods: {},
    passif: { nom: "Soldat le plus fort de l'humanité", description: "Ses critiques font x1,8 au lieu de x1,5", type: "multCrit", valeur: 1.8 },
    ultime: { nom: "Tourbillon", description: "Accélération 4 s, puis 5 coups de 70 % sur la ligne arrière", actions: [
      { type: "effet", cible: "soi", effet: "acceleration", duree: 4 },
      { type: "degats", cible: "arriere-aleatoire", mult: 0.7, coups: 5 },
    ] },
  },
  {
    id: "armin", nom: "Armin", serie: "L'Attaque des Titans", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Stratège", description: "ATQ +8 % pour les alliés de la ligne avant", type: "auraAtqAvant", bonus: 0.08 },
    ultime: { nom: "Plan d'Armin", description: "Renforcement 6 s, Bouclier de 10 % et +30 d'énergie pour tous les alliés", actions: [
      { type: "effet", cible: "allies", effet: "renforcement", duree: 6 },
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.1 },
      { type: "energie", cible: "allies-autres", montant: 30 },
    ] },
  },
  {
    id: "hange", nom: "Hansi", serie: "L'Attaque des Titans", role: "soutien", affinite: "technique", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Curiosité scientifique", description: "Soigne l'allié le plus blessé de 3 % toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Lance-foudre", description: "Bouclier de 15 % sur toute l'équipe et 180 % à la cible en face", actions: [
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.15 },
      { type: "degats", cible: "face", mult: 1.8 },
    ] },
  },

  // ---------- Chainsaw Man ----------
  {
    id: "denji", nom: "Denji", serie: "Chainsaw Man", role: "attaquant", affinite: "chaos", rarete: "rare",
    mods: { pv: 1.05 },
    passif: { nom: "Moteur relancé", description: "Survit une fois par combat à un coup mortel avec 1 PV", type: "survieUneFois" },
    ultime: { nom: "Tronçonneuses", description: "5 coups de 65 % sur la ligne avant", actions: [
      { type: "degats", cible: "ligne-avant-aleatoire", mult: 0.65, coups: 5 },
    ] },
  },
  {
    id: "power", nom: "Power", serie: "Chainsaw Man", role: "tank", affinite: "chaos", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Démon du sang", description: "Récupère 3 % de ses PV toutes les 3 s", type: "regenPeriodique", pourcent: 0.03, periode: 3 },
    ultime: { nom: "Marteau de sang", description: "190 % à la cible en face, puis Provocation", actions: [
      { type: "degats", cible: "face", mult: 1.9 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "makima", nom: "Makima", serie: "Chainsaw Man", role: "controle", affinite: "esprit", rarete: "legendaire",
    mods: {},
    passif: { nom: "Démon du contrôle", description: "Ralentit toute l'équipe ennemie de 10 %", type: "auraVitEnnemis", malus: 0.1 },
    ultime: { nom: "Pan", description: "180 % et Étourdissement 2 s sur l'ennemi qui a le plus d'énergie, puis 100 % à tous", actions: [
      { type: "degats", cible: "plus-energie", mult: 1.8, effet: { type: "etourdi", duree: 2 } },
      { type: "degats", cible: "tous", mult: 1.0 },
    ] },
  },
  {
    id: "aki", nom: "Aki", serie: "Chainsaw Man", role: "assassin", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Contrat du Renard", description: "+20 % de dégâts contre les ennemis sous 50 % de PV", type: "degatsContreBlesses", seuil: 0.5, bonus: 0.2 },
    ultime: { nom: "Démon de la malédiction", description: "280 % et Vulnérabilité 4 s à un perso de la ligne arrière", actions: [
      { type: "degats", cible: "arriere", mult: 2.8, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "kobeni", nom: "Kobeni", serie: "Chainsaw Man", role: "assassin", affinite: "vitesse", rarete: "commun",
    mods: {},
    passif: { nom: "Instinct de survie", description: "30 % de chance d'esquiver les attaques de base", type: "esquiveBase", chance: 0.3 },
    ultime: { nom: "Panique", description: "3 coups de 90 % sur la ligne arrière", actions: [
      { type: "degats", cible: "arriere-aleatoire", mult: 0.9, coups: 3 },
    ] },
  },

  // ---------- Frieren ----------
  {
    id: "frieren", nom: "Frieren", serie: "Frieren", role: "controle", affinite: "esprit", rarete: "legendaire",
    mods: {},
    passif: { nom: "Mage millénaire", description: "Gagne 3 d'énergie par seconde", type: "energieParSeconde", valeur: 3 },
    ultime: { nom: "Zoltraak", description: "160 % et Vulnérabilité 4 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.6, effet: { type: "vulnerabilite", duree: 4 } },
    ] },
  },
  {
    id: "fern", nom: "Fern", serie: "Frieren", role: "attaquant", affinite: "technique", rarete: "rare",
    mods: {},
    passif: { nom: "Tir rapide", description: "Ses attaques de base frappent une 2e fois pour 15 % des dégâts", type: "doubleFrappe", mult: 0.15 },
    ultime: { nom: "Salve de Zoltraak", description: "6 tirs de 50 % sur des ennemis au hasard", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.5, coups: 6 },
    ] },
  },
  {
    id: "stark", nom: "Stark", serie: "Frieren", role: "tank", affinite: "puissance", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Courage tremblant", description: "À 40 % de PV, gagne 30 % de DEF (une fois)", type: "defSousPvUneFois", seuil: 0.4, bonus: 0.3 },
    ultime: { nom: "Éclair du guerrier", description: "220 % à la cible en face, puis Provocation", actions: [
      { type: "degats", cible: "face", mult: 2.2 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "himmel", nom: "Himmel", serie: "Frieren", role: "tank", affinite: "esprit", rarete: "rare",
    mods: {},
    passif: { nom: "Le héros", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Épée du héros", description: "Bouclier de 12 % sur toute l'équipe, 160 % à la cible en face et Provocation", actions: [
      { type: "effet", cible: "allies", effet: "bouclier", duree: 6, pourcentPv: 0.12 },
      { type: "degats", cible: "face", mult: 1.6 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 3 },
    ] },
  },
  {
    id: "heiter", nom: "Heiter", serie: "Frieren", role: "soutien", affinite: "esprit", rarete: "commun",
    mods: {},
    passif: { nom: "Prêtre ivre", description: "Soins +20 % sur les alliés sous 30 % de PV", type: "soinsBonusBlesses", seuil: 0.3, bonus: 0.2 },
    ultime: { nom: "Bénédiction", description: "Soigne toute l'équipe de 10 % et lui donne Régénération 2 s", actions: [
      { type: "soin", cible: "allies", pourcent: 0.1 },
      { type: "effet", cible: "allies", effet: "regeneration", duree: 2 },
    ] },
  },

  // ---------- Fairy Tail ----------
  {
    id: "natsu", nom: "Natsu", serie: "Fairy Tail", role: "attaquant", affinite: "puissance", rarete: "epique",
    mods: {},
    passif: { nom: "Chasseur de dragons", description: "Ses attaques de base ont 50 % de chance d'appliquer Brûlure 1 s", type: "effetSurBase", effet: "brulure", duree: 1, chance: 0.5 },
    ultime: { nom: "Hurlement du dragon de feu", description: "150 % et Brûlure 3 s à tous les ennemis", actions: [
      { type: "degats", cible: "tous", mult: 1.5, effet: { type: "brulure", duree: 3 } },
    ] },
  },
  {
    id: "lucy", nom: "Lucy", serie: "Fairy Tail", role: "soutien", affinite: "esprit", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Clés célestes", description: "ATQ +8 % pour les alliés de la ligne avant", type: "auraAtqAvant", bonus: 0.08 },
    ultime: { nom: "Ouverture de la porte", description: "Soigne toute l'équipe de 12 % et 150 % à un ennemi au hasard", actions: [
      { type: "soin", cible: "allies", pourcent: 0.12 },
      { type: "degats", cible: "aleatoire", mult: 1.5 },
    ] },
  },
  {
    id: "erza", nom: "Erza", serie: "Fairy Tail", role: "tank", affinite: "technique", rarete: "epique",
    mods: { atq: 1.1 },
    passif: { nom: "Rééquipement", description: "-15 % de dégâts subis des attaques de base", type: "reductionBase", pourcent: 0.15 },
    ultime: { nom: "Armure du ciel", description: "8 lames de 30 % sur des ennemis au hasard, puis Provocation", actions: [
      { type: "degats", cible: "aleatoire", mult: 0.3, coups: 8 },
      { type: "effet", cible: "soi", effet: "provocation", duree: 4 },
    ] },
  },
  {
    id: "gray", nom: "Gray", serie: "Fairy Tail", role: "controle", affinite: "technique", rarete: "peu_commun",
    mods: {},
    passif: { nom: "Ice Make", description: "Ses attaques de base appliquent Ralentissement 2 s", type: "effetSurBase", effet: "ralenti", duree: 2 },
    ultime: { nom: "Ice Make : Lance", description: "200 % et Étourdissement 1,5 s sur l'ennemi à la plus forte ATQ", actions: [
      { type: "degats", cible: "plus-forte-atq", mult: 2.0, effet: { type: "etourdi", duree: 1.5 } },
    ] },
  },
  {
    id: "wendy", nom: "Wendy", serie: "Fairy Tail", role: "soutien", affinite: "vitesse", rarete: "commun",
    mods: {},
    passif: { nom: "Dragonne du ciel", description: "Soigne l'allié le plus blessé de 3 % toutes les 4 s", type: "soinPeriodiqueBlesse", pourcent: 0.03, periode: 4 },
    ultime: { nom: "Arms et Vernier", description: "Accélération 2 s et Renforcement 3 s pour toute l'équipe", actions: [
      { type: "effet", cible: "allies", effet: "acceleration", duree: 2 },
      { type: "effet", cible: "allies", effet: "renforcement", duree: 3 },
    ] },
  },
];

export const PERSOS = [...PERSOS_BASE, ...PERSOS_V4];

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
export const PERSOS_PAR_ID = Object.fromEntries([...PERSOS, ...PERSOS_SECRETS, RATURE, ...BOSS_RAID].map((p) => [p.id, p]));
// Tous les persos qu'un joueur peut posseder (les Secrets a part : ils ne sont pas dans PERSOS)
export const PERSOS_JOUABLES = [...PERSOS, ...PERSOS_SECRETS];
export { PERSOS_SECRETS };
