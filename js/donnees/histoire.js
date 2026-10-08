// ==========================================================
// L'HISTOIRE : 20 scenes, 4 par chapitre
// Toutes les repliques sont originales : aucune citation des
// series. "narrateur" = case de recit, "rature" = la mechante.
// ==========================================================

// Quand chaque scene se joue
export const MOMENTS = {
  debut: { nom: "Ouverture", avantEtape: 1 },
  elite: { nom: "Après l'élite", avantEtape: 5 },
  avantBoss: { nom: "Avant le boss", avantEtape: 8 },
  fin: { nom: "Dénouement", apresBoss: true },
};
export const ORDRE_MOMENTS = ["debut", "elite", "avantBoss", "fin"];

const r = (qui, texte) => ({ qui, texte });

export const SCENES = {
  // ===================== CHAPITRE 1 : LE TERRAIN D'ENTRAINEMENT =====================
  "1-debut": [
    r("narrateur", "Une tache d'encre s'étend sur les pages. Partout où elle passe, les histoires s'effacent."),
    r("luffy", "Toi aussi, tu t'es fait aspirer dans ce livre bizarre ? Il y a de quoi manger, ici ?"),
    r("naruto", "Concentre-toi ! Cette tache d'encre a déjà avalé la moitié de mon village."),
    r("gon", "Regardez là-bas… c'est vous deux. En noir. Et ils n'ont pas l'air sympas."),
    r("naruto", "Des copies de nous ? Alors on va leur montrer comment se battent les vrais !"),
  ],
  "1-elite": [
    r("gon", "Ils se relèvent toujours. Comme s'ils apprenaient de chaque coup."),
    r("luffy", "Moi aussi j'apprends ! Enfin… surtout à frapper plus fort."),
    r("naruto", "Ces reflets copient nos techniques. Pas ce qu'on a dans le ventre."),
    r("luffy", "Dans le ventre, j'ai faim. C'est grave ?"),
    r("narrateur", "Au loin, une silhouette verte observe le terrain, immobile."),
  ],
  "1-avantBoss": [
    r("narrateur", "Au centre du terrain, un reflet plus grand que les autres attend, bras croisés."),
    r("gon", "Lui, il ne bouge pas. Il nous étudie."),
    r("naruto", "Un professeur d'encre… J'en ai déjà eu des sévères. Je connais la chanson."),
    r("luffy", "On le bat, et après on mange. Promis ?"),
    r("gon", "Promis."),
  ],
  "1-fin": [
    r("narrateur", "Le reflet se dissout en une flaque noire. Puis la flaque se met à parler."),
    r("rature", "Vous n'êtes que des brouillons. Je vais tout recommencer… proprement."),
    r("naruto", "Cette voix… c'est la tache elle-même ?"),
    r("gon", "Elle file vers la forteresse ! Il reste des gens, là-bas."),
    r("luffy", "Alors on y va. Et quelqu'un emporte des sandwichs."),
  ],

  // ===================== CHAPITRE 2 : LA FORTERESSE DE FER =====================
  "2-debut": [
    r("narrateur", "La dernière forteresse tient encore. Ses murs résistent à l'encre, pour l'instant."),
    r("zoro", "C'est par là, la forteresse ? … Non, attends. Par là."),
    r("guts", "Tu marches vers le mur depuis dix minutes. La porte est derrière toi."),
    r("ronflex", "Ronn… flex."),
    r("guts", "Et lui bloque l'entrée en dormant. Pour une fois, c'est pratique."),
  ],
  "2-elite": [
    r("zoro", "Leur capitaine maniait trois lames d'encre. Mauvais choix de modèle."),
    r("guts", "Plus on monte, plus ils sont lourds. Ils copient les plus solides d'entre nous."),
    r("ronflex", "Ronflex !"),
    r("zoro", "Je crois qu'il est d'accord. Ou qu'il a faim."),
  ],
  "2-avantBoss": [
    r("narrateur", "Dans la cour du donjon, un géant d'encre arrache une colonne pour s'en faire une massue."),
    r("guts", "Celui-là, je le connais. Ou du moins, je connais l'original."),
    r("zoro", "Il est grand. Ça fait juste plus de surface à couper."),
    r("ronflex", "… Ronn."),
    r("guts", "Réveillez-le. On va avoir besoin d'un mur."),
  ],
  "2-fin": [
    r("narrateur", "Le géant tombe. Les murs de la forteresse retrouvent leurs couleurs."),
    r("rature", "Une forteresse de plus ou de moins… La nuit m'appartient encore."),
    r("zoro", "Elle parle beaucoup, pour une tache."),
    r("guts", "Elle file vers les toits de la ville. On la suit avant qu'elle ne se cache."),
  ],

  // ===================== CHAPITRE 3 : LES TOITS DE LA NUIT =====================
  "3-debut": [
    r("narrateur", "La nuit tombe sur une ville de tuiles. Des ombres sautent de toit en toit."),
    r("zenitsu", "Pourquoi la nuit ? Pourquoi toujours la nuit ? On ne pourrait pas se battre à midi ?"),
    r("killua", "Arrête de trembler, tu fais bouger les tuiles."),
    r("tanjiro", "Je sens leur odeur. De l'encre… et quelque chose de froid."),
    r("killua", "Alors on chasse les chasseurs. C'est un peu ma spécialité."),
  ],
  "3-elite": [
    r("zenitsu", "Il était rapide ! Trop rapide ! Je ne me souviens même pas de l'avoir battu !"),
    r("tanjiro", "Tu l'as battu en dormant, Zenitsu. Comme d'habitude."),
    r("killua", "Leur maître avait mes réflexes. Ça m'énerve."),
    r("tanjiro", "Ce n'est qu'un reflet. Lui, il ne protège personne."),
  ],
  "3-avantBoss": [
    r("narrateur", "Sur le plus haut toit, un reflet aux yeux rouges attend sous la lune."),
    r("killua", "Lui, c'est un autre niveau. Il a déjà lu nos mouvements."),
    r("tanjiro", "Il n'a pas d'odeur de peur. Il n'a pas d'odeur du tout."),
    r("zenitsu", "Bon. Bon, bon, bon. Si je m'évanouis, réveillez-moi après."),
  ],
  "3-fin": [
    r("narrateur", "Le reflet se brise comme une vitre noire. La lune redevient blanche."),
    r("rature", "Les règles de votre monde sont trop simples. Allons là où c'est moi qui les écris."),
    r("killua", "Elle parle d'un domaine. Un endroit où les règles changent."),
    r("tanjiro", "Alors il nous faut quelqu'un qui connaît ce genre d'endroit."),
  ],

  // ===================== CHAPITRE 4 : LE DOMAINE =====================
  "4-debut": [
    r("narrateur", "Au-delà des toits s'ouvre un espace sans horizon. Ici, les lois du combat se tordent."),
    r("gojo", "Un domaine fait d'encre ? Pas mal. Un peu mal décoré, mais pas mal."),
    r("megumi", "Ne la provoquez pas. Si c'est son domaine, c'est elle qui fixe les règles."),
    r("kurapika", "Chaque règle a une faille. Il suffit de l'observer assez longtemps."),
    r("gojo", "Ou de taper plus fort que la règle. Ça marche aussi."),
  ],
  "4-elite": [
    r("kurapika", "Le gardien du sceau s'est effacé, mais ses runes restent actives."),
    r("megumi", "Elles rendent les coups paralysants plus dangereux. Méfiez-vous."),
    r("gojo", "Moi, on ne me touche pas. Mais vous, oui. Alors restez derrière moi."),
  ],
  "4-avantBoss": [
    r("narrateur", "Au cœur du domaine, un reflet aux yeux bandés lève lentement la main."),
    r("megumi", "C'est… votre copie."),
    r("gojo", "Enfin un adversaire à ma hauteur. Dommage qu'il soit en noir et blanc."),
    r("kurapika", "S'il a vos pouvoirs, il a aussi vos défauts."),
    r("gojo", "Je n'ai pas de défauts. Bon, peut-être un ou deux."),
  ],
  "4-fin": [
    r("narrateur", "Le domaine s'effondre page par page. Derrière, un ciel brûle."),
    r("rature", "Assez joué. J'effacerai les légendes elles-mêmes. Sans elles, aucune histoire ne tient."),
    r("kurapika", "Elle se replie vers son cœur. Le dernier monde."),
    r("gojo", "Alors appelons les vraies légendes."),
  ],

  // ===================== CHAPITRE 5 : LA LEGENDE =====================
  "5-debut": [
    r("narrateur", "Le ciel brûle. Les dernières légendes se dressent au milieu des cendres."),
    r("goku", "Ça sent le grand combat ! Il y a des adversaires forts, par ici ?"),
    r("mewtwo", "Plus forts que tout ce que tu as affronté. Ce sont des copies de nous tous."),
    r("griffith", "Une armée de reflets, et un seul cœur à atteindre. Le plan est simple."),
    r("goku", "Simple, j'aime bien. On fonce !"),
  ],
  "5-elite": [
    r("griffith", "Leur avant-garde est tombée. La Rature ne sait pas commander, elle ne sait qu'imiter."),
    r("mewtwo", "Elle a peur. Je le sens. Pour la première fois, elle a peur."),
    r("goku", "Peur de quoi ? On n'a même pas encore commencé !"),
  ],
  "5-avantBoss": [
    r("narrateur", "Au centre du brasier, la tache d'encre a pris une forme. Elle a des yeux, maintenant."),
    r("rature", "Pourquoi résister ? Une page blanche, c'est la paix. Plus de combats, plus de pertes."),
    r("goku", "Une histoire sans combat ? Ça doit être drôlement ennuyeux."),
    r("griffith", "Une page blanche ne rêve de rien. Nous, nous rêvons encore."),
    r("mewtwo", "Ensemble, alors. Toutes les histoires à la fois."),
  ],
  "5-fin": [
    r("narrateur", "La Rature se disperse en milliers de gouttes. Chacune redevient une lettre, un mot, une page."),
    r("goku", "C'était le meilleur combat de ma vie ! Bon… le meilleur de la semaine."),
    r("griffith", "Les mondes reprennent leur place. Mais certains liens resteront."),
    r("mewtwo", "La Bibliothèque garde tous nos tomes. Tant que quelqu'un les lit, nous existons."),
    r("narrateur", "Et quelque part, une nouvelle page se tourne. Fin du premier volume."),
  ],
};

// La scene a jouer avant une etape (ou null)
export function sceneAvantEtape(chapitre, numero) {
  const moment = ORDRE_MOMENTS.find((m) => MOMENTS[m].avantEtape === numero);
  return moment ? `${chapitre}-${moment}` : null;
}
