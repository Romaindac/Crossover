// ==========================================================
// ENERGIE ET EVENEMENTS
// L'energie limite les combats (payee seulement en cas de victoire).
// Les evenements tournent tout seuls, les memes pour tous les joueurs
// a un instant donne : un bonus chaque heure, un defi chaque jour, un
// tournoi chaque semaine, et un calendrier de connexion de 7 jours.
// ==========================================================

// ---------- Energie ----------
export const ENERGIE_MAX = 150;                 // la jauge se remplit seule jusque-la (les cadeaux peuvent depasser)
export const MINUTES_PAR_ENERGIE = 3;           // +1 toutes les 3 minutes : pleine en 7 h 30
export const ENERGIE_PLAFOND = 999;
export const COUT_ENERGIE = { campagne: 6, deluxe: 6, chasse: 3, tour: 4, palier: 3 };
export const RECHARGE_ENCRE = { energie: 60, prix: 150, parJour: 3 };
export const ENERGIE_BONUS_MISSIONS = 30;       // avec le bonus des 3 missions du jour

// ---------- Heure folle : un bonus different chaque heure ----------
// gains : ce que rapporte chaque victoire pendant l'heure
export const HEURES_FOLLES = [
  { id: "encre", nom: "Pluie d'encre", texte: "+25 d'encre à chaque victoire", gains: { encre: 25 } },
  { id: "tickets", nom: "Tickets volants", texte: "15 % de chances de gagner un booster à chaque victoire", gains: { chanceTicket: 0.15 } },
  { id: "energie", nom: "Énergie à moitié prix", texte: "Les combats coûtent deux fois moins d'énergie", coutEnergie: 0.5 },
  { id: "poussiere", nom: "Poussière d'étoile", texte: "+4 poussière à chaque victoire", gains: { poussiere: 4 } },
  { id: "points", nom: "Ferveur du tournoi", texte: "Points du tournoi de la semaine doublés", pointsTournoi: 2 },
  { id: "eclats", nom: "Éclats en folie", texte: "+30 éclats à chaque victoire", gains: { eclats: 30 } },
  { id: "fontaine", nom: "Fontaine de jouvence", texte: "Chaque victoire rend 2 d'énergie", gains: { energie: 2 } },
];

// ---------- Defi du jour ----------
export const DEFI_DU_JOUR = { victoires: 12, persosSerie: 2, recompense: { tickets: 3, energie: 40 } };

// ---------- Calendrier de connexion (7 jours, puis on recommence) ----------
export const CALENDRIER = [
  { texte: "40 d'énergie", recompense: { energie: 40 } },
  { texte: "2 boosters", recompense: { tickets: 2 } },
  { texte: "400 d'encre", recompense: { encre: 400 } },
  { texte: "3 boosters", recompense: { tickets: 3 } },
  { texte: "80 d'énergie", recompense: { energie: 80 } },
  { texte: "60 poussière", recompense: { poussiere: 60 } },
  { texte: "Un booster doré", recompense: { ticketsDores: 1 } },
];

// ---------- Tournoi de la semaine (la serie a l'honneur) ----------
// Points : 1 par victoire avec un perso de la serie, 2 avec au moins 3 persos de la serie
export const PALIERS_TOURNOI = [
  { points: 10, texte: "2 boosters", recompense: { tickets: 2 } },
  { points: 25, texte: "50 d'énergie", recompense: { energie: 50 } },
  { points: 45, texte: "3 boosters", recompense: { tickets: 3 } },
  { points: 70, texte: "40 poussière", recompense: { poussiere: 40 } },
  { points: 100, texte: "4 boosters", recompense: { tickets: 4 } },
  { points: 140, texte: "100 d'énergie", recompense: { energie: 100 } },
  { points: 190, texte: "5 boosters", recompense: { tickets: 5 } },
  { points: 250, texte: "Un booster doré", recompense: { ticketsDores: 1 } },
];
