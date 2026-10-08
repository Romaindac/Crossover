// ==========================================================
// SOURCES DES PORTRAITS
// - Pokemon : images officielles de PokeAPI (adresses fixes)
// - Les autres : AniList, via son API publique
//     recherche : nom a chercher sur AniList
//     verif     : mot qui doit apparaitre dans le nom trouve,
//                 pour ne jamais afficher le mauvais perso
//     cadrage   : (facultatif) quelle partie de l'image garder,
//                 "50% 0%" = le haut, "50% 50%" = le centre
// ==========================================================

export const SOURCES_PORTRAITS = {
  goku:     { recherche: "Son Goku", verif: "goku" },
  vegeta:   { recherche: "Vegeta", verif: "vegeta" },
  piccolo:  { recherche: "Piccolo", verif: "piccolo" },

  naruto:   { recherche: "Naruto Uzumaki", verif: "uzumaki" },
  sasuke:   { recherche: "Sasuke Uchiha", verif: "sasuke" },
  sakura:   { recherche: "Sakura Haruno", verif: "haruno" },

  luffy:    { recherche: "Monkey D. Luffy", verif: "luffy" },
  zoro:     { recherche: "Roronoa Zoro", verif: "zoro" },
  chopper:  { recherche: "Tony Tony Chopper", verif: "chopper" },

  pikachu:  { pokemon: 25 },
  ronflex:  { pokemon: 143 },
  mewtwo:   { pokemon: 150 },

  guts:     { recherche: "Guts", verif: "guts" },
  griffith: { recherche: "Griffith", verif: "griffith" },
  zodd:     { recherche: "Nosferatu Zodd", verif: "zodd" },

  gojo:     { recherche: "Satoru Gojou", verif: "gojo" },
  yuji:     { recherche: "Yuuji Itadori", verif: "itadori" },
  megumi:   { recherche: "Megumi Fushiguro", verif: "fushiguro" },

  tanjiro:  { recherche: "Tanjirou Kamado", verif: "tanjir" },
  nezuko:   { recherche: "Nezuko Kamado", verif: "nezuko" },
  zenitsu:  { recherche: "Zenitsu Agatsuma", verif: "zenitsu" },

  gon:      { recherche: "Gon Freecss", verif: "freecss", cadrage: "50% 30%" },
  killua:   { recherche: "Killua Zoldyck", verif: "killua" },
  kurapika: { recherche: "Kurapika", verif: "kurapika" },

  // Volume 2
  c18:       { recherche: "Android 18", verif: "18" },
  tsunade:   { recherche: "Tsunade", verif: "tsunade" },
  nami:      { recherche: "Nami", verif: "nami" },
  dracaufeu: { pokemon: 6 },
  chevalier: { recherche: "Skull Knight", verif: "skull" },
  nobara:    { recherche: "Nobara Kugisaki", verif: "kugisaki" },
  shinobu:   { recherche: "Shinobu Kochou", verif: "kochou" },
  hisoka:    { recherche: "Hisoka", verif: "hisoka" },
};
