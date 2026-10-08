// ==========================================================
// LES LIENS : 20 duos de series differentes
// Un lien se decouvre apres 10 victoires ensemble, puis monte
// jusqu'au niveau 5. Bonus : +2 % de PV et d'ATQ par niveau,
// pour les deux persos, quand ils sont dans la meme equipe.
// ==========================================================

const l = (a, b, nom, scene) => ({ cle: `${a}+${b}`, a, b, nom, scene: scene.map(([qui, texte]) => ({ qui, texte })) });

export const LIENS = [
  l("naruto", "luffy", "Les têtus", [["luffy", "Toi non plus, tu n'abandonnes jamais ?"], ["naruto", "Jamais. C'est ma façon de faire."], ["luffy", "Alors on est amis. C'est décidé."]]),
  l("guts", "zoro", "Lames solitaires", [["zoro", "Ton épée est trop grande."], ["guts", "La tienne sont trop nombreuses."], ["zoro", "… On s'entraîne demain ?"]]),
  l("gojo", "mewtwo", "Les plus forts", [["gojo", "On dit que tu es le plus puissant de ton monde."], ["mewtwo", "On dit la même chose de toi. Vérifions qui a raison… un autre jour."], ["gojo", "Marché conclu."]]),
  l("pikachu", "killua", "Électriques", [["killua", "Tu fais des étincelles, toi aussi ?"], ["pikachu", "Pika !"], ["killua", "On va bien s'entendre."]]),
  l("goku", "luffy", "Appétits sans fond", [["goku", "Tu manges combien de bols, toi ?"], ["luffy", "Je ne compte pas. Je mange jusqu'à ce que la table soit vide."], ["goku", "On fait la course au prochain repas !"]]),
  l("sasuke", "killua", "Prodiges de l'ombre", [["killua", "Toi aussi, on t'a élevé pour être une arme."], ["sasuke", "J'ai choisi ma propre route depuis."], ["killua", "Moi aussi. C'est ce qui compte."]]),
  l("tanjiro", "gon", "Cœurs purs", [["gon", "Tu sens vraiment les émotions des gens ?"], ["tanjiro", "Oui. Et toi, tu sens bon la sincérité."], ["gon", "C'est le plus beau compliment qu'on m'ait fait !"]]),
  l("sakura", "chopper", "Les soigneurs", [["chopper", "Tu soignes avec tes mains ? Moi, avec mes remèdes !"], ["sakura", "Échangeons nos techniques. On sauvera plus de monde."], ["chopper", "Ça ne me fait pas plaisir du tout ! … Si, en fait."]]),
  l("ronflex", "zodd", "Les montagnes", [["zodd", "Toi, tu ne recules jamais."], ["ronflex", "Ronn… flex."], ["zodd", "Je respecte ça."]]),
  l("griffith", "kurapika", "Ambitions brûlantes", [["griffith", "Tu as un but qui te dévore. Je le reconnais."], ["kurapika", "Le mien est de protéger ce qui reste. Le tien ?"], ["griffith", "Le mien est bien plus haut. Mais nos routes se croisent ici."]]),
  l("megumi", "piccolo", "Les stratèges", [["piccolo", "Tu réfléchis avant de frapper. C'est rare."], ["megumi", "C'est surtout que je n'ai pas le choix."], ["piccolo", "Dans ce cas, réfléchissons ensemble."]]),
  l("nezuko", "pikachu", "Petits mais costauds", [["pikachu", "Pika pika !"], ["nezuko", "Mmh !"], ["narrateur", "Ils ne se comprennent pas, mais ils se sont tout dit."]]),
  l("yuji", "naruto", "Réceptacles", [["yuji", "Toi aussi, tu portes quelque chose de terrible en toi ?"], ["naruto", "Ouais. Mais j'ai appris à lui parler."], ["yuji", "Faudra que tu m'expliques comment."]]),
  l("vegeta", "sasuke", "Rivaux éternels", [["vegeta", "Tu as un rival qui t'agace, toi aussi ?"], ["sasuke", "Depuis toujours. Il ne lâche jamais."], ["vegeta", "Le mien non plus. C'est épuisant… et indispensable."]]),
  l("zoro", "tanjiro", "Lames et souffle", [["tanjiro", "Votre respiration est parfaite pendant le combat."], ["zoro", "Je ne respire pas, je coupe."], ["tanjiro", "C'est peut-être la même chose."]]),
  l("gojo", "kurapika", "Yeux rares", [["kurapika", "Vos yeux… ils ne sont pas ordinaires."], ["gojo", "Les tiens non plus. On fait un club ?"], ["kurapika", "Un club très fermé, alors."]]),
  l("guts", "yuji", "Porteurs de malédiction", [["yuji", "On dit que vous êtes maudit."], ["guts", "Et alors ? J'avance quand même."], ["yuji", "Je vais essayer de faire pareil."]]),
  l("zenitsu", "chopper", "Trouillards héroïques", [["zenitsu", "J'ai peur de tout, tu sais."], ["chopper", "Moi aussi ! Mais on se bat quand même."], ["zenitsu", "… Ensemble, ça fait un peu moins peur."]]),
  l("gon", "goku", "Enfants de la nature", [["goku", "Tu as grandi dans la forêt, toi aussi ?"], ["gon", "Oui ! Et j'adore les adversaires forts."], ["goku", "Alors on va bien s'amuser."]]),
  l("mewtwo", "griffith", "Défier son destin", [["mewtwo", "On t'a destiné à quelque chose que tu n'as pas choisi."], ["griffith", "Alors je choisirai autre chose."], ["mewtwo", "C'est la seule réponse qui vaille."]]),
];

export const LIENS_PAR_CLE = Object.fromEntries(LIENS.map((x) => [x.cle, x]));
export const VICTOIRES_DECOUVERTE = 10;
export const BONUS_PAR_NIVEAU_LIEN = 2;   // % de PV et d'ATQ
export const niveauLien = (victoires) => (victoires < VICTOIRES_DECOUVERTE ? 0 : Math.min(5, 1 + Math.floor((victoires - VICTOIRES_DECOUVERTE) / 25)));
