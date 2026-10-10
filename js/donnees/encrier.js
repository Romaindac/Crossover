// ==========================================================
// L'ENCRIER (roguelite en draft)
// Tout le monde part a egalite : 3 persos tires au hasard, au meme
// niveau, puis on recrute en route. Une carte a embranchements par
// acte (3 actes, un boss au bout de chacun). Les PV restent d'un
// combat a l'autre ; perdre un combat termine la partie.
// Tous les chiffres a regler sont ici.
// ==========================================================

export const ACTES = 3;
export const RANGS_PAR_ACTE = 8;          // le 8e rang est le boss
export const COLONNES = 4;                // largeur de la carte
export const NIVEAU_PERSOS = 30;          // niveau de tous les persos du draft (et des ennemis)
export const ETOILES_MAX_PARTIE = 5;
export const TERRAIN_MAX = 5;             // persos qui combattent
export const RESERVE_MAX = 3;             // persos en reserve
export const OR_DEPART = 60;
export const OFFRE_DEPART = 6;            // persos proposes au depart...
export const CHOIX_DEPART = 3;            // ...dont on en garde 3
export const RECRUES_PROPOSEES = 3;       // apres chaque combat gagne
export const OR_SI_ON_PASSE = 12;         // si on ne recrute personne
export const PV_APRES_KO = 0.25;          // un perso KO dans un combat gagne revient a 25 % de ses PV
export const SOIN_APRES_COMBAT = 0.1;     // apres chaque combat gagne, toute l'equipe recupere 10 %
export const SOIN_REPOS = 0.35;
export const SOIN_BOSS = 0.5;             // apres chaque boss vaincu (et les KO reviennent)
export const PARTIES_RECOMPENSEES_PAR_JOUR = 2;

// Les types de cases de la carte
export const TYPES_CASES = {
  combat:    { nom: "Combat", aide: "Un groupe d'ennemis. Or et une recrue à la clé." },
  elite:     { nom: "Élite", aide: "Plus dur, mais une relique et une meilleure recrue." },
  evenement: { nom: "Événement", aide: "Une rencontre et un choix à faire." },
  boutique:  { nom: "Boutique", aide: "Dépense ton or : persos, reliques, soins." },
  repos:     { nom: "Repos", aide: "Soigner l'équipe ou entraîner un perso." },
  tresor:    { nom: "Trésor", aide: "Une relique à choisir parmi deux." },
  boss:      { nom: "Boss", aide: "Le gardien de l'acte. Le vaincre ouvre l'acte suivant." },
};

// Tirage des cases ordinaires (les rangs 1, 4, 7 et 8 sont imposes par la carte)
export const POIDS_CASES = { combat: 50, evenement: 20, elite: 12, repos: 9, boutique: 9 };

// Rarete des persos proposes, selon l'acte (et un cran au-dessus apres une elite)
export const RARETES_RECRUES = [
  { commun: 38, peu_commun: 32, rare: 21, epique: 8, legendaire: 1 },
  { commun: 22, peu_commun: 30, rare: 29, epique: 15, legendaire: 4 },
  { commun: 10, peu_commun: 24, rare: 34, epique: 23, legendaire: 9 },
  { commun: 4, peu_commun: 14, rare: 34, epique: 32, legendaire: 16 },
];

// Les ennemis : niveau NIVEAU_PERSOS, stats multipliees selon l'avancee.
// rangGlobal : 0 a 23 sur toute la partie. La courbe accelere : l'equipe aussi
// se renforce en route (recrues plus rares, etoiles, reliques).
export const multEnnemis = (rangGlobal, type) =>
  (0.5 + 0.016 * rangGlobal + 0.0009 * rangGlobal * rangGlobal) * (type === "boss" ? 1.15 : type === "elite" ? 1.15 : 1);
export const tailleEnnemis = (acte, rang, type) =>
  (type === "elite" || type === "boss" || acte > 1) ? 5 : rang <= 2 ? 3 : 4;

// Or gagne
export const orCombat = (acte, type) => (type === "boss" ? 80 : type === "elite" ? 42 : 18) + 6 * (acte - 1);

// Boutique (prix de base)
export const PRIX_PERSOS = { commun: 40, peu_commun: 55, rare: 75, epique: 105, legendaire: 145 };
export const PRIX_RELIQUES = { commune: 85, rare: 125 };
export const PRIX_SOIN = 35;              // +30 % de PV a toute l'equipe
export const PRIX_ENTRAINEMENT = 70;      // +1 etoile a un perso
export const SOIN_BOUTIQUE = 0.3;

// Recompenses hors partie (les PARTIES_RECOMPENSEES_PAR_JOUR premieres parties du jour)
export const RECOMPENSES = {
  encreParCombat: 8, encreParElite: 20, encreParBoss: 50,
  invocationsParBoss: 4, invocationsVictoire: 10, poussiereVictoire: 200,
};

// ---------- Reliques ----------
// stats : effets de combat sur toute l'equipe (memes cles que l'equipement) ;
// pct : PV et ATQ en % ; ennemis : multiplicateur des ennemis ;
// le reste : effets de la partie (or, soins, boutique, recrues...).
export const RELIQUES = [
  { id: "encre-chine", nom: "Encre de Chine", rang: "commune", texte: "+10 % de PV et d'ATQ", pct: 10 },
  { id: "plume-acier", nom: "Plume d'acier", rang: "commune", texte: "+12 % de chances de critique", stats: { crit: 0.12 } },
  { id: "voile-brume", nom: "Voile de brume", rang: "commune", texte: "+8 % d'esquive", stats: { esquive: 0.08 } },
  { id: "calice", nom: "Calice vermillon", rang: "commune", texte: "+8 % de vol de vie", stats: { volDeVie: 0.08 } },
  { id: "tambour", nom: "Tambour de guerre", rang: "commune", texte: "+40 d'énergie au début des combats", energieDepart: 40 },
  { id: "bourse", nom: "Bourse percée", rang: "commune", texte: "+30 % d'or", orPct: 0.3 },
  { id: "onguent", nom: "Onguent de l'atelier", rang: "commune", texte: "Soigne 12 % des PV après chaque combat gagné", soinApresCombat: 0.12 },
  { id: "masque", nom: "Masque d'effroi", rang: "commune", texte: "Ennemis : −7 % de PV et d'ATQ", ennemis: 0.93 },
  { id: "coussin", nom: "Coussin de méditation", rang: "commune", texte: "Le repos soigne 60 % au lieu de 35 %", soinRepos: 0.6 },
  { id: "ronces", nom: "Écorce de ronces", rang: "rare", texte: "Renvoie 15 % des dégâts reçus", stats: { epines: 0.15 } },
  { id: "burin", nom: "Burin du graveur", rang: "rare", texte: "Ignore 20 % de la DEF ennemie", stats: { percage: 0.2 } },
  { id: "sceau-final", nom: "Sceau du final", rang: "rare", texte: "Ultimes +25 % de dégâts", stats: { bonusUltime: 0.25 } },
  { id: "sablier", nom: "Sablier inversé", rang: "rare", texte: "L'ultime se recharge 20 % plus vite", stats: { rechargeUltime: 0.2 } },
  { id: "croc", nom: "Croc du chasseur", rang: "rare", texte: "Après chaque KO réalisé : +15 % de PV et +30 d'énergie", stats: { apresKo: true } },
  { id: "loupe", nom: "Loupe du recruteur", rang: "rare", texte: "4 persos proposés au lieu de 3", recruesEnPlus: 1 },
  { id: "carte-marchand", nom: "Carte du marchand", rang: "rare", texte: "Boutique : −25 %", remise: 0.25 },
  { id: "pacte", nom: "Pacte d'encre", rang: "rare", texte: "+25 % de PV et d'ATQ, mais ennemis +10 %", pct: 25, ennemis: 1.1 },
  { id: "pierre-tenace", nom: "Pierre de ténacité", rang: "rare", texte: "Un perso KO revient à 50 % de ses PV au lieu de 25 %", pvApresKo: 0.5 },
  { id: "talisman", nom: "Talisman du dernier souffle", rang: "boss", texte: "Chaque perso survit une fois par combat à un coup mortel", stats: { survie: true } },
  { id: "page-blanche", nom: "Page blanche", rang: "boss", texte: "Chaque perso revient une fois par combat avec 30 % de ses PV", stats: { resurrection: true } },
  { id: "couronne", nom: "Couronne d'encre", rang: "boss", texte: "+20 % de PV et d'ATQ, +20 d'énergie au départ", pct: 20, energieDepart: 20 },
];
export const RELIQUES_PAR_ID = Object.fromEntries(RELIQUES.map((r) => [r.id, r]));

// ---------- Evenements ----------
// effets : or (+/-), soin (part des PV max, negatif = degats, a toute l'equipe),
// relique ("commune" | "rare"), recrue (rarete minimale), etoile (+1 a un perso au hasard),
// ennemis (multiplicateur permanent pour la partie), revivre (les KO reviennent).
// chance : { p, succes, echec } (tire avec la graine de la partie).
// cout : or necessaire pour choisir (sinon le choix est grise).
export const EVENEMENTS = [
  {
    id: "planche", titre: "La planche oubliée",
    texte: "Sur une table d'atelier, une planche inachevée attend. L'encre est encore fraîche, comme si son auteur venait de partir.",
    choix: [
      { texte: "La terminer à sa place", detail: "Une relique, mais −15 % de PV à tous", effets: { relique: "commune", soin: -0.15 } },
      { texte: "La laisser à son auteur", detail: "Rien ne se passe", effets: {} },
    ],
  },
  {
    id: "editeur", titre: "L'éditeur pressé",
    texte: "Un éditeur en sueur vous barre la route : il lui faut des pages pour demain matin, coûte que coûte.",
    choix: [
      { texte: "Livrer en urgence", detail: "+60 or, −10 % de PV à tous", effets: { or: 60, soin: -0.1 } },
      { texte: "Négocier", detail: "Une chance sur deux : +110 or", effets: { chance: { p: 0.5, succes: { or: 110 }, echec: {} } } },
      { texte: "Refuser poliment", detail: "Rien ne se passe", effets: {} },
    ],
  },
  {
    id: "dojo", titre: "Le dojo abandonné",
    texte: "Les tatamis sont poussiéreux, mais les mannequins d'entraînement tiennent encore debout.",
    choix: [
      { texte: "S'entraîner jusqu'à l'épuisement", detail: "+1 étoile à un perso au hasard, −20 % de PV à tous", effets: { etoile: 1, soin: -0.2 } },
      { texte: "Méditer", detail: "Soigne 25 % des PV", effets: { soin: 0.25 } },
    ],
  },
  {
    id: "marchand-encre", titre: "Le marchand de fioles",
    texte: "Un vieux colporteur agite une fiole d'encre irisée. « Elle porte chance, dit-il. Presque toujours. »",
    choix: [
      { texte: "Acheter la fiole", detail: "−45 or : une relique", cout: 45, effets: { or: -45, relique: "commune" } },
      { texte: "Passer son chemin", detail: "Rien ne se passe", effets: {} },
    ],
  },
  {
    id: "recruteur", titre: "Le recruteur masqué",
    texte: "Un homme au masque de papier vous propose un combattant. « Il ne parle pas beaucoup, mais il frappe fort. »",
    choix: [
      { texte: "Payer son prix", detail: "−55 or : une recrue Rare ou mieux", cout: 55, effets: { or: -55, recrue: "rare" } },
      { texte: "Décliner", detail: "Rien ne se passe", effets: {} },
    ],
  },
  {
    id: "fontaine", titre: "La fontaine d'encre",
    texte: "Une source d'encre claire jaillit entre les pierres. Elle sent la pluie et le papier neuf.",
    choix: [
      { texte: "Boire", detail: "Soigne 40 % des PV", effets: { soin: 0.4 } },
      { texte: "Remplir les flacons pour les vendre", detail: "+35 or", effets: { or: 35 } },
    ],
  },
  {
    id: "tanuki", titre: "Le pari du tanuki",
    texte: "Un tanuki en kimono mélange trois gobelets. « Trouve la bille, double ta mise ! »",
    choix: [
      { texte: "Parier 30 or", detail: "Une chance sur deux : gagner 60 or, sinon perdre la mise", cout: 30, effets: { chance: { p: 0.5, succes: { or: 60 }, echec: { or: -30 } } } },
      { texte: "Ne pas jouer", detail: "Rien ne se passe", effets: {} },
    ],
  },
  {
    id: "rival", titre: "L'ombre du rival",
    texte: "Une silhouette vous attend au sommet d'un pont. « Toi et moi. Maintenant. »",
    choix: [
      { texte: "Accepter le duel", detail: "Une chance sur deux : une relique rare, sinon −25 % de PV", effets: { chance: { p: 0.5, succes: { relique: "rare" }, echec: { soin: -0.25 } } } },
      { texte: "Faire demi-tour", detail: "Rien ne se passe", effets: {} },
    ],
  },
  {
    id: "bibliotheque", titre: "La bibliothèque des tomes",
    texte: "Des milliers de volumes reliés à la main. Certains racontent des techniques oubliées.",
    choix: [
      { texte: "Étudier un tome", detail: "+1 étoile à un perso au hasard", effets: { etoile: 1 } },
      { texte: "Emprunter les plus précieux", detail: "+70 or, mais les ennemis gagnent 4 %", effets: { or: 70, ennemis: 1.04 } },
    ],
  },
  {
    id: "sanctuaire", titre: "Le sanctuaire des esquisses",
    texte: "Un autel couvert de croquis. Une bougie brûle sans jamais diminuer.",
    choix: [
      { texte: "Prier", detail: "Soigne 20 % des PV et ramène les KO", effets: { soin: 0.2, revivre: true } },
      { texte: "Prendre l'offrande", detail: "+75 or, mais les ennemis gagnent 5 %", effets: { or: 75, ennemis: 1.05 } },
    ],
  },
];
export const EVENEMENTS_PAR_ID = Object.fromEntries(EVENEMENTS.map((e) => [e.id, e]));
