// ==========================================================
// LES LIENS : 57 duos de series differentes
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
  // ---------- Volume 4 ----------
  l("itachi", "aizen", "Maîtres de l'illusion", [["aizen", "Tu caches tes intentions derrière un masque parfait."], ["itachi", "Toi derrière un sourire. La différence, c'est ce qu'on protège."], ["aizen", "Intéressant. Restons sur nos gardes, alors."]]),
  l("jotaro", "livai", "Hommes de peu de mots", [["livai", "Tu parles peu."], ["jotaro", "Toi non plus."], ["narrateur", "Ils se sont compris. Personne d'autre n'a rien suivi."]]),
  l("dio", "muzan", "Rois de la nuit", [["muzan", "Le soleil est notre seul ennemi véritable."], ["dio", "Le soleil, et les héros têtus qui le servent."], ["muzan", "Ceux-là, je les efface un par un."]]),
  l("edward", "armin", "Petits génies", [["armin", "Tu résous les problèmes en les comprenant, toi aussi ?"], ["edward", "Et en tapant dessus quand ça ne suffit pas."], ["armin", "Je garde la première méthode. Tu gardes la deuxième."]]),
  l("roy", "ace", "Maîtres du feu", [["ace", "Une flamme d'un claquement de doigts ? Pas mal."], ["roy", "Toi, tu es carrément fait de feu. Je suis presque jaloux."], ["ace", "Presque ? On allume le prochain ennemi à deux."]]),
  l("asta", "deku", "Partis de rien", [["deku", "On m'a dit que je n'aurais jamais de pouvoir."], ["asta", "À moi aussi ! Et regarde-nous maintenant !"], ["deku", "Alors on continue de leur donner tort. Ensemble."]]),
  l("yami", "kenpachi", "Amoureux du combat", [["kenpachi", "Tu as l'air de quelqu'un qui aime se battre."], ["yami", "J'aime surtout dépasser mes limites. Le combat, c'est le prétexte."], ["kenpachi", "Même chose. Mais moi, je préfère le prétexte."]]),
  l("jinwoo", "megumi", "Armées d'ombres", [["megumi", "Tes ombres t'obéissent sans hésiter."], ["jinwoo", "Les tiennes aussi. On dirait qu'on parle la même langue."], ["megumi", "Une langue que peu de gens comprennent."]]),
  l("igris", "erza", "Chevaliers", [["erza", "Ta garde est irréprochable, chevalier."], ["igris", "…"], ["erza", "Un salut de l'épée vaut mieux que mille mots. Je l'accepte."]]),
  l("kaneki", "eren", "Monstres malgré eux", [["eren", "Ils me regardent tous comme un monstre."], ["kaneki", "Je connais ce regard. Il ne dit rien de qui tu es."], ["eren", "Alors je choisirai moi-même qui je suis."]]),
  l("touka", "nezuko", "Cachées parmi les humains", [["touka", "Toi aussi, tu dois cacher ce que tu es ?"], ["nezuko", "Mmh."], ["touka", "On protège ceux qu'on aime quand même. C'est ça qui compte."]]),
  l("arima", "byakuya", "Lames implacables", [["byakuya", "Ton geste ne gaspille rien."], ["arima", "Le tien non plus. C'est reposant."], ["byakuya", "Ne le répète à personne."]]),
  l("seiya", "natsu", "Têtes brûlées", [["natsu", "Tu te relèves toujours, toi ?"], ["seiya", "Tant que mon cosmos brûle, oui !"], ["natsu", "J'adore ce type. On fonce !"]]),
  l("ikki", "vegeta", "Loups solitaires", [["vegeta", "Tu arrives toujours au dernier moment."], ["ikki", "Je n'aime pas la foule. Mais je n'abandonne jamais les miens."], ["vegeta", "… Moi non plus. Ne le dis à personne."]]),
  l("shaka", "frieren", "Sages éternels", [["frieren", "Tu gardes les yeux fermés pour mieux voir ?"], ["shaka", "Et toi, tu vis mille ans pour mieux comprendre."], ["frieren", "Je comprends surtout que j'ai encore beaucoup à apprendre."]]),
  l("saga", "makima", "Marionnettistes", [["makima", "Tu sais faire plier les autres à ta volonté."], ["saga", "Je préfère les convaincre. Le résultat est le même."], ["makima", "Pas tout à fait. Mais je t'apprécie déjà."]]),
  l("shun", "orihime", "Âmes douces", [["orihime", "Tu n'aimes pas te battre, n'est-ce pas ?"], ["shun", "Non. Mais je me battrai pour protéger les autres."], ["orihime", "Moi aussi. Alors protégeons-nous les uns les autres."]]),
  l("hyoga", "gray", "Le grand froid", [["gray", "Ta glace est différente de la mienne."], ["hyoga", "La mienne vient du cœur de l'hiver. La tienne ?"], ["gray", "De quelqu'un qui m'a tout appris. On fait geler le terrain ?"]]),
  l("aldebaran", "allmight", "Colosses au grand cœur", [["allmight", "Tu tiens debout comme une montagne !"], ["aldebaran", "Et toi, tu souris comme le soleil."], ["allmight", "Alors faisons de l'ombre aux méchants !"]]),
  l("julius", "erwin", "Commandants", [["erwin", "Diriger, c'est envoyer des gens vers le danger."], ["julius", "C'est aussi leur donner une raison d'en revenir."], ["erwin", "Je retiens la deuxième partie."]]),
  l("noelle", "juvia", "Filles de l'eau", [["juvia", "Ta magie de l'eau est royale !"], ["noelle", "Je… je n'ai pas toujours su la contrôler."], ["juvia", "Juvia non plus ! Entraînons-nous ensemble."]]),
  l("shanks", "netero", "Vieux maîtres", [["netero", "Tu as la force de ceux qui n'ont plus rien à prouver."], ["shanks", "Et toi, celle de ceux qui veulent encore s'amuser."], ["netero", "Le meilleur des deux mondes. Un verre ?"]]),
  l("joseph", "nami", "Les rusés", [["joseph", "Ta prochaine phrase sera : « Tu me dois de l'argent. »"], ["nami", "Tu me dois de l'argent. … Comment tu as su ?"], ["joseph", "Je reconnais une arnaqueuse de talent."]]),
  l("polnareff", "aki", "Venger les siens", [["aki", "Tu te bats pour quelqu'un que tu as perdu."], ["polnareff", "Oui. Et toi aussi, je le vois dans tes yeux."], ["aki", "Alors ne perdons plus personne."]]),
  l("josuke", "kirishima", "Coiffures sacrées", [["kirishima", "Ta coiffure, c'est du sérieux."], ["josuke", "Répète ça pour voir ? … Ah, c'était un compliment ?"], ["kirishima", "Le plus viril des compliments !"]]),
  l("jonathan", "himmel", "Vrais héros", [["himmel", "Tu aides les gens sans rien attendre en retour."], ["jonathan", "C'est ce que fait un gentleman."], ["himmel", "C'est ce que fait un héros. Moi, je dis que c'est pareil."]]),
  l("reze", "hisoka", "Charmes dangereux", [["hisoka", "Tu souris, mais tu caches une bombe."], ["reze", "Et toi, tu caches un jeu de cartes. Qui joue le premier ?"], ["hisoka", "Personne. C'est bien plus excitant d'attendre."]]),
  l("power", "bakugo", "Grandes gueules", [["power", "Je suis la plus forte ! Prosterne-toi !"], ["bakugo", "Tu rêves ! C'est moi le numéro un !"], ["narrateur", "Ils se sont disputés trois heures. Ils sont devenus inséparables."]]),
  l("denji", "inosuke", "Sauvages", [["inosuke", "Toi ! Tu fonces sans réfléchir, comme moi !"], ["denji", "Réfléchir, c'est fatigant. Foncer, c'est marrant."], ["inosuke", "Enfin quelqu'un d'intelligent !"]]),
  l("maki", "mikasa", "Guerrières", [["mikasa", "Tu te bats sans pouvoir, avec une arme et ta volonté."], ["maki", "Et toi, avec une force qui te vient du sang."], ["mikasa", "Le reste vient de l'entraînement. Comme toi."]]),
  l("nanami", "kishibe", "Adultes fatigués", [["nanami", "Les heures supplémentaires, je les compte."], ["kishibe", "Moi, je compte les verres après."], ["nanami", "… Un seul, alors. Pour la forme."]]),
  l("meruem", "freezer", "Tyrans", [["freezer", "Tu te crois roi de ton monde ?"], ["meruem", "Je l'étais. Puis une fille m'a appris un jeu de plateau."], ["freezer", "… Ridicule. Explique-moi les règles."]]),
  l("ectoplasma", "himeno", "Fantômes farceurs", [["himeno", "Un fantôme qui sourit tout le temps ? J'adore."], ["ectoplasma", "Ecto… plasma !"], ["himeno", "On va faire peur à tout le monde, toi et moi."]]),
  l("gajeel", "reiner", "Armures", [["reiner", "Ta peau devient du métal ?"], ["gajeel", "Gihi. Et la tienne une armure de titan. On se tape dessus pour voir ?"], ["reiner", "Une autre fois. Aujourd'hui, on protège les autres."]]),
  l("winry", "hange", "Têtes chercheuses", [["hange", "Montre-moi ce bras mécanique ! Je veux tout savoir !"], ["winry", "Seulement si tu me montres tes équipements de manœuvre !"], ["narrateur", "Personne ne les a revus pendant deux jours d'atelier."]]),
  l("riza", "nobara", "Tireuses d'élite", [["nobara", "Tu ne rates jamais ta cible ?"], ["riza", "Je ne tire que quand je suis sûre."], ["nobara", "Moi je tire, et je suis sûre après. Ça marche aussi."]]),
  l("scar", "zodd", "Cicatrices", [["zodd", "Ta cicatrice raconte une guerre."], ["scar", "Et toi, tu es la guerre elle-même."], ["zodd", "Alors tu sais ce qui t'attend si tu croises ma route."]]),
];

export const LIENS_PAR_CLE = Object.fromEntries(LIENS.map((x) => [x.cle, x]));
export const VICTOIRES_DECOUVERTE = 10;
export const BONUS_PAR_NIVEAU_LIEN = 2;   // % de PV et d'ATQ
export const niveauLien = (victoires) => (victoires < VICTOIRES_DECOUVERTE ? 0 : Math.min(5, 1 + Math.floor((victoires - VICTOIRES_DECOUVERTE) / 25)));
