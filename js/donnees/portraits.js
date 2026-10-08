// ==========================================================
// SOURCES DES PORTRAITS
// - Tous les persos : AniList, via son API publique (une image tiree de l'anime)
// - Pokemon : en plus, "pokemon" donne l'illustration officielle PokeAPI,
//   affichee en secours tant qu'AniList n'a rien trouve
//     recherche : nom a chercher sur AniList
//     verif     : mot (ou liste de mots) qui doit apparaitre dans le nom trouve,
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

  pikachu:  { recherche: "Pikachu", verif: "pikachu", pokemon: 25 },
  ronflex:  { recherche: "Snorlax", verif: ["snorlax", "kabigon"], pokemon: 143 },
  mewtwo:   { recherche: "Mewtwo", verif: ["mewtwo", "myuutsuu"], pokemon: 150 },

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
  dracaufeu: { recherche: "Charizard", verif: ["charizard", "lizardon"], pokemon: 6 },
  chevalier: { recherche: "Skull Knight", verif: "skull" },
  nobara:    { recherche: "Nobara Kugisaki", verif: "kugisaki" },
  shinobu:   { recherche: "Shinobu Kochou", verif: "kochou" },
  hisoka:    { recherche: "Hisoka", verif: "hisoka" },

  // Volume 3
  krilin:     { recherche: "Krillin", verif: "kri" },
  freezer:    { recherche: "Frieza", verif: "frie" },
  kakashi:    { recherche: "Kakashi Hatake", verif: "kakashi" },
  hinata:     { recherche: "Hinata Hyuuga", verif: "hinata" },
  sanji:      { recherche: "Sanji", verif: "sanji" },
  robin:      { recherche: "Nico Robin", verif: "robin" },
  lucario:    { recherche: "Lucario", verif: "lucario", pokemon: 448 },
  florizarre: { recherche: "Venusaur", verif: ["venusaur", "fushigibana"], pokemon: 3 },
  casca:      { recherche: "Casca", verif: "casca" },
  schierke:   { recherche: "Schierke", verif: "schierke" },
  sukuna:     { recherche: "Sukuna Ryoumen", verif: "sukuna" },
  todo:       { recherche: "Aoi Toudou", verif: "tou" },
  rengoku:    { recherche: "Kyoujurou Rengoku", verif: "rengoku" },
  inosuke:    { recherche: "Inosuke Hashibira", verif: "inosuke" },
  netero:     { recherche: "Isaac Netero", verif: "netero" },
  leorio:     { recherche: "Leorio", verif: "leorio" },
  ichigo:     { recherche: "Ichigo Kurosaki", verif: "ichigo" },
  rukia:      { recherche: "Rukia Kuchiki", verif: "rukia" },
  orihime:    { recherche: "Orihime Inoue", verif: "orihime" },
  byakuya:    { recherche: "Byakuya Kuchiki", verif: "byakuya" },
  kenpachi:   { recherche: "Kenpachi Zaraki", verif: "kenpachi" },
  deku:       { recherche: "Izuku Midoriya", verif: "midoriya" },
  bakugo:     { recherche: "Katsuki Bakugou", verif: "bakugo" },
  allmight:   { recherche: "All Might", verif: "might" },
  uraraka:    { recherche: "Ochaco Uraraka", verif: "uraraka" },
  todoroki:   { recherche: "Shouto Todoroki", verif: "todoroki" },
  eren:       { recherche: "Eren Yeager", verif: "eren" },
  mikasa:     { recherche: "Mikasa Ackerman", verif: "mikasa" },
  livai:      { recherche: "Levi", verif: "levi" },
  armin:      { recherche: "Armin Arlert", verif: "armin" },
  hange:      { recherche: "Hange Zoe", verif: "hange" },
  denji:      { recherche: "Denji", verif: "denji" },
  power:      { recherche: "Power", verif: "power" },
  makima:     { recherche: "Makima", verif: "makima" },
  aki:        { recherche: "Aki Hayakawa", verif: "hayakawa" },
  kobeni:     { recherche: "Kobeni Higashiyama", verif: "kobeni" },
  frieren:    { recherche: "Frieren", verif: "frieren" },
  fern:       { recherche: "Fern", verif: "fern" },
  stark:      { recherche: "Stark", verif: "stark" },
  himmel:     { recherche: "Himmel", verif: "himmel" },
  heiter:     { recherche: "Heiter", verif: "heiter" },
  natsu:      { recherche: "Natsu Dragneel", verif: "natsu" },
  lucy:       { recherche: "Lucy Heartfilia", verif: "heartfilia" },
  erza:       { recherche: "Erza Scarlet", verif: "erza" },
  gray:       { recherche: "Gray Fullbuster", verif: "fullbuster" },
  wendy:      { recherche: "Wendy Marvell", verif: "wendy" },
};
