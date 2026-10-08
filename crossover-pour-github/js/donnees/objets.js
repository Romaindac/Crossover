// ==========================================================
// LE CATALOGUE DES 100 OBJETS
// 20 objets par zone : 3 panoplies de 4 pieces, 7 objets isoles
// et 1 Legendaire unique. Tous les noms sont originaux.
//
// Les fourchettes de stats sont calculees par une formule
// (niveau requis x rarete), pour que tout reste equilibre :
// on ne choisit a la main que QUELLES stats porte un objet.
// ==========================================================

import { MULT_RARETE_OBJET } from "./equipement.js";

// Valeur de reference d'une stat pour un objet de niveau L
const REFERENCE = {
  atq: (L) => 3 + 0.6 * L,
  pv: (L) => 30 + 8 * L,
  vit: (L) => 1 + 0.12 * L,
  atqPct: (L) => 1.5 + 0.12 * L,
  pvPct: (L) => 1.5 + 0.12 * L,
  defPct: (L) => 2 + 0.15 * L,
  critPct: (L) => 1 + 0.08 * L,
  energie: (L) => 4 + 0.3 * L,
  butin: (L) => 4 + 0.3 * L,
};
const ENTIERES = ["atq", "pv", "vit", "energie", "butin"];

function fourchette(stat, niveau, rarete, poids) {
  const v = REFERENCE[stat](niveau) * MULT_RARETE_OBJET[rarete] * poids;
  const arrondir = (x) => (ENTIERES.includes(stat) ? Math.max(1, Math.round(x)) : Math.round(x * 10) / 10);
  return [stat, arrondir(v * 0.75), arrondir(v)];
}

// La premiere stat est la principale ; les suivantes valent 60 %
function objet(id, nom, zone, emplacement, rarete, niveau, panoplie, stats, texte, effet = null) {
  return {
    id, nom, zone, emplacement, rarete, niveau, panoplie, texte, effet,
    lignes: stats.map((stat, i) => fourchette(stat, niveau, rarete, i === 0 ? 1 : 0.6)),
  };
}

export const OBJETS = [
  // ===================== ZONE 1 : TERRAIN D'ENTRAINEMENT (niv. 1 a 10) =====================
  objet("baton-disciple", "Bâton du disciple", 1, "arme", "commun", 2, "disciple", ["atq"], "Usé à force de frapper le même poteau."),
  objet("kimono-disciple", "Kimono du disciple", 1, "tenue", "commun", 2, "disciple", ["pv"], "Recousu cent fois, jamais abandonné."),
  objet("bandeau-disciple", "Bandeau du disciple", 1, "accessoire", "commun", 2, "disciple", ["vit"], "Le premier cadeau d'un maître."),
  objet("pierre-concentration", "Pierre de concentration", 1, "relique", "commun", 2, "disciple", ["pvPct"], "Lisse comme un esprit calme."),

  objet("lame-serment", "Lame du serment", 1, "arme", "rare", 6, "volonte", ["atq", "atqPct", "critPct"], "Forgée le jour où un apprenti a juré de ne plus fuir."),
  objet("manteau-heros", "Manteau du héros", 1, "tenue", "rare", 6, "volonte", ["pv", "atqPct"], "Il flotte toujours dans le bon sens."),
  objet("bandeau-promesse", "Bandeau de la promesse", 1, "accessoire", "rare", 6, "volonte", ["vit", "energie"], "Noué une fois, porté pour toujours."),
  objet("medaille-volonte", "Médaille de volonté", 1, "relique", "rare", 6, "volonte", ["atqPct", "critPct"], "Gagnée sans jamais avoir gagné."),

  objet("bokken-maitre", "Bokken du maître", 1, "arme", "epique", 10, "dojo", ["atq", "defPct", "critPct"], "Il n'a jamais brisé un os. Seulement des certitudes."),
  objet("hakama-maitre", "Hakama du maître", 1, "tenue", "epique", 10, "dojo", ["pv", "defPct", "pvPct"], "Plié avec soin, chaque soir, depuis quarante ans."),
  objet("ceinture-noire", "Ceinture noire", 1, "accessoire", "epique", 10, "dojo", ["vit", "pvPct", "energie"], "Noire à force d'être portée."),
  objet("parchemin-katas", "Parchemin des katas", 1, "relique", "epique", 10, "dojo", ["defPct", "atqPct", "pvPct"], "Mille mouvements, un seul principe."),

  objet("gourdin-apprenti", "Gourdin d'apprenti", 1, "arme", "commun", 1, null, ["atq"], "Plus lourd que dangereux."),
  objet("gants-sparring", "Gants de sparring", 1, "arme", "peu_commun", 4, null, ["atq", "critPct"], "Rembourrés, mais pas tant que ça."),
  objet("tunique-rapiecee", "Tunique rapiécée", 1, "tenue", "commun", 3, null, ["pv"], "Chaque pièce raconte une chute."),
  objet("plastron-bambou", "Plastron de bambou", 1, "tenue", "peu_commun", 7, null, ["pv", "defPct"], "Plie, mais ne rompt pas."),
  objet("sandales-course", "Sandales de course", 1, "accessoire", "peu_commun", 5, null, ["vit", "energie"], "Faites pour arriver le premier au repas."),
  objet("trefle-porte-bonheur", "Trèfle porte-bonheur", 1, "accessoire", "rare", 8, null, ["vit", "butin"], "Quatre feuilles et une bonne étoile."),
  objet("cloche-dojo", "Cloche du dojo", 1, "relique", "rare", 9, null, ["defPct", "pvPct"], "Elle sonne la fin de l'entraînement. Jamais assez tôt."),

  objet("bandeau-aube", "Bandeau de l'aube", 1, "accessoire", "legendaire", 10, null, ["vit", "energie", "atqPct"], "Celui qui le porte se relève toujours une fois de plus.",
    { survie: true, texte: "Survit une fois par combat à un coup mortel" }),

  // ===================== ZONE 2 : FORTERESSE DE FER (niv. 8 a 16) =====================
  objet("pique-garnison", "Pique de garnison", 2, "arme", "commun", 9, "garnison", ["atq"], "Distribuée en grand nombre, perdue en plus grand nombre."),
  objet("cotte-garnison", "Cotte de garnison", 2, "tenue", "commun", 9, "garnison", ["pv"], "Elle tinte à chaque pas de ronde."),
  objet("brassard-garnison", "Brassard de garnison", 2, "accessoire", "commun", 9, "garnison", ["vit"], "Aux couleurs d'un bataillon oublié."),
  objet("insigne-garnison", "Insigne de garnison", 2, "relique", "commun", 9, "garnison", ["defPct"], "Rouillé, mais toujours épinglé."),

  objet("masse-fer", "Masse de fer", 2, "arme", "rare", 12, "fer", ["atq", "defPct"], "Elle ne connaît qu'une technique, et elle suffit."),
  objet("armure-rempart", "Armure du rempart", 2, "tenue", "rare", 12, "fer", ["pv", "defPct", "pvPct"], "Les flèches s'y plantent par politesse."),
  objet("gantelet-acier", "Gantelet d'acier", 2, "accessoire", "rare", 12, "fer", ["vit", "defPct"], "Il serre la main comme il serre la garde."),
  objet("sceau-rempart", "Sceau du rempart", 2, "relique", "rare", 12, "fer", ["defPct", "pvPct"], "Tant qu'il tient, la porte tient."),

  objet("hallebarde-eternelle", "Hallebarde éternelle", 2, "arme", "epique", 16, "rempart", ["atq", "pvPct", "critPct"], "Elle a gardé cette porte avant que la porte existe."),
  objet("cuirasse-eternelle", "Cuirasse éternelle", 2, "tenue", "epique", 16, "rempart", ["pv", "defPct", "pvPct"], "Ses bosses sont des souvenirs de batailles gagnées."),
  objet("chaine-gardien", "Chaîne du gardien", 2, "accessoire", "epique", 16, "rempart", ["vit", "defPct", "pvPct"], "Chaque maillon, un serment de ne pas reculer."),
  objet("cle-forteresse", "Clé de la forteresse", 2, "relique", "epique", 16, "rempart", ["pvPct", "defPct", "energie"], "Personne ne sait plus quelle porte elle ouvre."),

  objet("epee-rouillee", "Épée rouillée", 2, "arme", "commun", 8, null, ["atq"], "La rouille, c'est juste de l'expérience."),
  objet("arbalete-rempart", "Arbalète de rempart", 2, "arme", "rare", 14, null, ["atq", "critPct"], "Conçue pour viser par les meurtrières."),
  objet("gambison", "Gambison", 2, "tenue", "commun", 10, null, ["pv"], "Matelassé pour amortir les coups et l'ennui."),
  objet("cape-assiege", "Cape de l'assiégé", 2, "tenue", "peu_commun", 13, null, ["pv", "pvPct"], "Elle a connu de longs hivers derrière les murs."),
  objet("bottes-ferrees", "Bottes ferrées", 2, "accessoire", "peu_commun", 11, null, ["vit", "defPct"], "On les entend venir. C'est voulu."),
  objet("lanterne-ronde", "Lanterne de ronde", 2, "accessoire", "peu_commun", 15, null, ["vit", "butin"], "Elle éclaire ce que les autres ont perdu."),
  objet("blason-fendu", "Blason fendu", 2, "relique", "rare", 15, null, ["defPct", "pvPct"], "Fendu, mais jamais tombé."),

  objet("bouclier-colosse", "Bouclier du colosse", 2, "tenue", "legendaire", 16, null, ["pv", "defPct", "pvPct"], "Ceux qui le frappent le regrettent aussitôt.",
    { epines: 0.2, texte: "Renvoie 20 % des dégâts reçus" }),

  // ===================== ZONE 3 : TOITS DE LA NUIT (niv. 14 a 22) =====================
  objet("kunai-ombre", "Kunai d'ombre", 3, "arme", "commun", 15, "ombre", ["atq"], "Noirci pour ne pas briller sous la lune."),
  objet("tenue-ombre", "Tenue d'ombre", 3, "tenue", "commun", 15, "ombre", ["pv"], "Elle ne fait aucun bruit, même mouillée."),
  objet("masque-ombre", "Masque d'ombre", 3, "accessoire", "commun", 15, "ombre", ["vit"], "Un visage de moins à retenir."),
  objet("fiole-fumee", "Fiole de fumée", 3, "relique", "commun", 15, "ombre", ["critPct"], "Pour les sorties discrètes et les entrées dramatiques."),

  objet("kunai-vent", "Kunai du vent", 3, "arme", "rare", 18, "vent", ["atq", "vit"], "Lancé avant même d'être visé."),
  objet("cape-legere", "Cape légère", 3, "tenue", "rare", 18, "vent", ["pv", "vit"], "Elle ne pèse rien, sauf sur la conscience."),
  objet("sandales-vent", "Sandales du vent", 3, "accessoire", "rare", 18, "vent", ["vit", "energie"], "Les toits ne sont qu'un long chemin plat."),
  objet("plume-orage", "Plume de l'orage", 3, "relique", "rare", 18, "vent", ["atqPct", "vit"], "Tombée d'un oiseau qu'on n'a jamais vu."),

  objet("katana-nocturne", "Katana nocturne", 3, "arme", "epique", 22, "nocturne", ["atq", "critPct", "atqPct"], "Il ne sort du fourreau qu'une fois par nuit."),
  objet("kimono-nocturne", "Kimono nocturne", 3, "tenue", "epique", 22, "nocturne", ["pv", "critPct", "vit"], "Brodé de constellations qui n'existent plus."),
  objet("fourreau-lune", "Fourreau de lune", 3, "accessoire", "epique", 22, "nocturne", ["vit", "critPct", "atqPct"], "Laqué si fin qu'il reflète la lune."),
  objet("pierre-lunaire", "Pierre à aiguiser lunaire", 3, "relique", "epique", 22, "nocturne", ["critPct", "atqPct", "energie"], "Elle n'affûte que la nuit."),

  objet("shuriken-ebreche", "Shuriken ébréché", 3, "arme", "commun", 14, null, ["atq"], "Il revient rarement, mais il revient."),
  objet("tanto-silencieux", "Tantō silencieux", 3, "arme", "peu_commun", 17, null, ["atq", "vit"], "Personne ne l'a jamais entendu frapper."),
  objet("manteau-toits", "Manteau des toits", 3, "tenue", "commun", 16, null, ["pv"], "Doublé pour les nuits de garde."),
  objet("haori-veilleur", "Haori de veilleur", 3, "tenue", "rare", 20, null, ["pv", "vit", "critPct"], "Celui qui le porte ne dort que d'un œil."),
  objet("grappin", "Grappin", 3, "accessoire", "peu_commun", 19, null, ["vit", "critPct"], "Le plus court chemin entre deux toits."),
  objet("clochette-muette", "Clochette muette", 3, "accessoire", "rare", 21, null, ["vit", "butin"], "Elle ne sonne que pour ceux qui trouvent quelque chose."),
  objet("oeil-de-chat", "Œil-de-chat", 3, "relique", "peu_commun", 18, null, ["critPct", "atqPct"], "Il voit dans le noir, et parfois au-delà."),

  objet("murasame-encre", "Murasame d'encre", 3, "arme", "legendaire", 22, null, ["atq", "critPct", "atqPct"], "Une lame qui boit l'encre de ses ennemis.",
    { volDeVie: 0.15, texte: "Vol de vie : 15 % des dégâts infligés" }),

  // ===================== ZONE 4 : DOMAINE (niv. 20 a 28) =====================
  objet("baton-initie", "Bâton d'initié", 4, "arme", "commun", 21, "initie", ["atq"], "Gravé de runes qu'il ne comprend pas encore."),
  objet("robe-initie", "Robe d'initié", 4, "tenue", "commun", 21, "initie", ["pv"], "Trop grande, comme toutes les premières robes."),
  objet("talisman-initie", "Talisman d'initié", 4, "accessoire", "commun", 21, "initie", ["energie"], "Il chauffe quand un secret approche."),
  objet("encens-initie", "Encens d'initié", 4, "relique", "commun", 21, "initie", ["pvPct"], "Sa fumée dessine toujours la même forme."),

  objet("sceptre-scelle", "Sceptre scellé", 4, "arme", "rare", 24, "sceau", ["atq", "atqPct"], "Son vrai pouvoir est enfermé dedans. Pour l'instant."),
  objet("voile-scelle", "Voile scellé", 4, "tenue", "rare", 24, "sceau", ["pv", "atqPct"], "Il cache plus qu'un visage."),
  objet("bague-sceau", "Bague du sceau", 4, "accessoire", "rare", 24, "sceau", ["vit", "atqPct"], "Elle ne s'enlève qu'avec une bonne raison."),
  objet("sceau-verite", "Sceau de vérité", 4, "relique", "rare", 24, "sceau", ["atqPct", "vit"], "Il brûle les mensonges, et parfois les doigts."),

  objet("baton-sage", "Bâton du sage", 4, "arme", "epique", 28, "sage", ["atq", "energie", "pvPct"], "Il s'appuie sur toi autant que toi sur lui."),
  objet("robe-sage", "Robe du sage", 4, "tenue", "epique", 28, "sage", ["pv", "pvPct", "energie"], "Brodée de mots qu'on lit en fermant les yeux."),
  objet("chapelet-jade", "Chapelet de jade", 4, "accessoire", "epique", 28, "sage", ["vit", "energie", "pvPct"], "Cent huit perles, cent huit patiences."),
  objet("lanterne-esprit", "Lanterne de l'esprit", 4, "relique", "epique", 28, "sage", ["pvPct", "energie", "defPct"], "Elle éclaire le chemin de ceux qui se sont perdus."),

  objet("eventail-papier", "Éventail de papier", 4, "arme", "commun", 20, null, ["atq"], "Fragile en apparence. Seulement en apparence."),
  objet("chakram-runique", "Chakram runique", 4, "arme", "rare", 26, null, ["atq", "energie", "critPct"], "Il revient toujours, chargé d'énergie."),
  objet("chale-brume", "Châle de brume", 4, "tenue", "peu_commun", 22, null, ["pv", "vit"], "Tissé dans le brouillard d'un matin sans fin."),
  objet("toge-rituel", "Toge du rituel", 4, "tenue", "peu_commun", 25, null, ["pv", "pvPct"], "Portée une fois par siècle, lavée une fois par millénaire."),
  objet("perles-priere", "Perles de prière", 4, "accessoire", "commun", 23, null, ["energie"], "On les compte quand on n'ose plus compter les ennemis."),
  objet("miroir-ames", "Miroir des âmes", 4, "accessoire", "rare", 27, null, ["vit", "butin"], "Il montre ce que les autres ont laissé derrière eux."),
  objet("fragment-domaine", "Fragment de domaine", 4, "relique", "peu_commun", 24, null, ["atqPct", "energie"], "Un éclat d'un monde où les règles plient."),

  objet("oeil-domaine", "Œil du domaine", 4, "relique", "legendaire", 28, null, ["critPct", "energie", "vit"], "Il voit les failles dans toutes les défenses.",
    { percage: 0.25, texte: "Ignore 25 % de la DEF ennemie" }),

  // ===================== ZONE 5 : BRASIER (niv. 26 a 30) =====================
  objet("lame-braise", "Lame de braise", 5, "arme", "commun", 27, "braise", ["atq"], "Elle ne refroidit jamais vraiment."),
  objet("cuirasse-braise", "Cuirasse de braise", 5, "tenue", "commun", 27, "braise", ["pv"], "Tiède en hiver, brûlante en combat."),
  objet("anneau-braise", "Anneau de braise", 5, "accessoire", "commun", 27, "braise", ["vit"], "Une petite flamme qu'on garde au doigt."),
  objet("charbon-ardent", "Charbon ardent", 5, "relique", "commun", 27, "braise", ["atqPct"], "À tenir par le bon côté."),

  objet("epee-legende", "Épée de légende", 5, "arme", "rare", 29, "legende", ["atq", "atqPct", "critPct"], "Toutes les histoires parlent d'elle. Aucune ne dit la même chose."),
  objet("armure-legende", "Armure de légende", 5, "tenue", "rare", 29, "legende", ["pv", "pvPct", "atqPct"], "Chaque génération y ajoute une cicatrice."),
  objet("couronne-legende", "Couronne de légende", 5, "accessoire", "rare", 29, "legende", ["vit", "atqPct", "pvPct"], "Elle ne choisit pas un roi. Elle choisit un héros."),
  objet("etoile-legende", "Étoile de légende", 5, "relique", "rare", 29, "legende", ["atqPct", "pvPct", "critPct"], "Tombée le soir où la première histoire fut écrite."),

  objet("plume-lame", "Plume-lame originelle", 5, "arme", "epique", 30, "originelle", ["atq", "atqPct", "critPct"], "Avec elle, on a écrit les premiers héros."),
  objet("manteau-encre", "Manteau d'encre", 5, "tenue", "epique", 30, "originelle", ["pv", "atqPct", "pvPct"], "Il coule sans jamais tacher."),
  objet("encrier-sans-fond", "Encrier sans fond", 5, "accessoire", "epique", 30, "originelle", ["vit", "energie", "critPct"], "On n'en a jamais vu le fond. On a cessé de chercher."),
  objet("page-blanche", "Page blanche", 5, "relique", "epique", 30, "originelle", ["critPct", "atqPct", "energie"], "Tout reste à écrire."),

  objet("hachette-cendre", "Hachette de cendre", 5, "arme", "commun", 26, null, ["atq"], "Elle laisse des traces grises partout."),
  objet("lance-phenix", "Lance du phénix", 5, "arme", "rare", 30, null, ["atq", "critPct", "pvPct"], "Elle renaît chaque fois qu'on la croit brisée."),
  objet("tunique-ignifugee", "Tunique ignifugée", 5, "tenue", "commun", 27, null, ["pv"], "Testée près des flammes, pas dedans."),
  objet("ecailles-dragon", "Écailles de dragon", 5, "tenue", "rare", 30, null, ["pv", "defPct", "pvPct"], "Le dragon ne les réclame plus."),
  objet("bracelet-lave", "Bracelet de lave", 5, "accessoire", "peu_commun", 28, null, ["vit", "atqPct"], "Il bat comme un cœur de volcan."),
  objet("fer-a-cheval-dore", "Fer à cheval doré", 5, "accessoire", "rare", 29, null, ["vit", "butin", "critPct"], "La chance sourit aux audacieux, et à ceux qui le portent."),
  objet("coeur-volcan", "Cœur de volcan", 5, "relique", "peu_commun", 28, null, ["atqPct", "pvPct"], "Il chauffe la paume et le courage."),

  objet("plume-rature", "Plume de la Rature", 5, "relique", "legendaire", 30, null, ["atqPct", "critPct", "energie"], "Arrachée à ce qui voulait tout effacer.",
    { apresKo: true, texte: "Après chaque KO réalisé, récupère 15 % de ses PV et 30 d'énergie" }),
];

// ===================== TOUR DES MILLE VOLUMES (niv. 35 a 50) =====================
// Zone 6 : ces objets ne tombent que dans la Tour, a partir de l'etage 30.
OBJETS.push(
  objet("signet-oublie", "Signet oublié", 6, "arme", "epique", 35, "volumeOublie", ["atq", "atqPct", "pvPct"], "Il marquait une page que personne n'a jamais lue."),
  objet("couverture-oubliee", "Couverture oubliée", 6, "tenue", "epique", 35, "volumeOublie", ["pv", "pvPct", "defPct"], "Usée par des mains qui n'existent plus."),
  objet("ruban-oublie", "Ruban oublié", 6, "accessoire", "epique", 35, "volumeOublie", ["vit", "atqPct", "energie"], "Un ruban de lecture, encore noué."),
  objet("tranche-oubliee", "Tranche oubliée", 6, "relique", "epique", 35, "volumeOublie", ["atqPct", "pvPct", "critPct"], "Le titre a disparu, l'histoire est restée."),

  objet("fermoir-acier", "Fermoir d'acier", 6, "arme", "epique", 40, "reliure", ["atq", "defPct", "pvPct"], "Il garde les livres fermés, et les ennemis à distance."),
  objet("reliure-acier", "Reliure d'acier", 6, "tenue", "epique", 40, "reliure", ["pv", "defPct", "pvPct"], "Aucune page ne s'en échappe."),
  objet("coins-acier", "Coins d'acier", 6, "accessoire", "epique", 40, "reliure", ["vit", "defPct", "pvPct"], "Pour les tomes qui tombent souvent."),
  objet("dos-acier", "Dos d'acier", 6, "relique", "epique", 40, "reliure", ["defPct", "pvPct", "energie"], "Il ne plie jamais."),

  objet("coupe-papier", "Coupe-papier sanglant", 6, "arme", "epique", 45, "marquePage", ["atq", "critPct", "atqPct"], "Il a ouvert bien plus que des enveloppes."),
  objet("jaquette-rouge", "Jaquette rouge", 6, "tenue", "epique", 45, "marquePage", ["pv", "atqPct", "critPct"], "Rouge à l'origine. Ou pas."),
  objet("marque-page-sanglant", "Marque-page sanglant", 6, "accessoire", "epique", 45, "marquePage", ["vit", "critPct", "atqPct"], "Il s'arrête toujours au chapitre le plus violent."),
  objet("goutte-encre-rouge", "Goutte d'encre rouge", 6, "relique", "epique", 45, "marquePage", ["critPct", "atqPct", "vit"], "Elle ne sèche jamais."),

  objet("plume-finale", "Plume finale", 6, "arme", "epique", 50, "dernierePage", ["atq", "atqPct", "energie"], "Celle qui écrit le mot fin."),
  objet("manteau-epilogue", "Manteau d'épilogue", 6, "tenue", "epique", 50, "dernierePage", ["pv", "pvPct", "energie"], "On ne le porte qu'une fois l'histoire terminée."),
  objet("sceau-editeur", "Sceau de l'éditeur", 6, "accessoire", "epique", 50, "dernierePage", ["vit", "energie", "critPct"], "Il valide ce qui sera publié."),
  objet("derniere-page", "Dernière page", 6, "relique", "epique", 50, "dernierePage", ["atqPct", "critPct", "energie"], "Après elle, il n'y a plus que la couverture."),

  objet("encre-abysses", "Encre des abysses", 6, "relique", "legendaire", 40, null, ["atqPct", "pvPct", "defPct"], "Puisée tout au fond, là où les histoires se défont.",
    { volDeVie: 0.1, epines: 0.1, texte: "Vol de vie de 10 % et renvoie 10 % des dégâts reçus" }),
  objet("reliure-resurrection", "Reliure de résurrection", 6, "tenue", "legendaire", 45, null, ["pv", "pvPct", "defPct"], "Une histoire qu'on referme peut toujours se rouvrir.",
    { resurrection: true, texte: "Revient une fois au combat avec 30 % de ses PV" }),
  objet("plume-dernier-mot", "Plume du dernier mot", 6, "arme", "legendaire", 50, null, ["atq", "atqPct", "critPct"], "Celui qui l'a, a toujours le dernier mot.",
    { bonusUltime: 0.3, percage: 0.15, texte: "Ultime +30 % et ignore 15 % de la DEF ennemie" }),
  objet("signet-temps", "Signet du temps", 6, "accessoire", "legendaire", 50, null, ["vit", "energie", "critPct"], "Il garde la page, et le moment.",
    { energie: 50, rechargeUltime: 0.15, texte: "Commence avec 50 d'énergie, et l'ultime se recharge 15 % plus vite" }),
);

export const OBJETS_PAR_ID = Object.fromEntries(OBJETS.map((o) => [o.id, o]));
