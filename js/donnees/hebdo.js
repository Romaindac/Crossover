// ==========================================================
// CROSSOVER HEBDO : le numero de la semaine
// Chaque lundi, une serie a l'honneur (les 8 a tour de role)
// et trois missions de la semaine.
// ==========================================================

import { PERSOS } from "./persos.js";
import { numeroSemaine } from "./tour.js";

export const SERIES = [...new Set(PERSOS.map((p) => p.serie))];
export const BONUS_HONNEUR = 15;          // % de PV et d'ATQ
export const BUTIN_HONNEUR = 10;          // % de butin par perso a l'honneur dans l'equipe
export const serieDeLaSemaine = (maintenant = Date.now()) => SERIES[numeroSemaine(maintenant) % SERIES.length];
export const numeroDuMagazine = (maintenant = Date.now()) => numeroSemaine(maintenant) - 140;

export const MISSIONS_SEMAINE = [
  { id: "honneur", texte: "Gagne 40 combats avec un perso à l'honneur", cible: 40, evenement: "victoire-honneur", recompense: { encre: 150, fragments: 3 } },
  { id: "tour", texte: "Gagne 10 combats dans la Tour", cible: 10, evenement: "etage-tour", recompense: { encre: 120, fragments: 2 } },
  { id: "retouche", texte: "Fais 15 retouches à l'encre", cible: 15, evenement: "retouche", recompense: { eclats: 300, fragments: 1 } },
  { id: "tirages", texte: "Ouvre 6 boosters", cible: 6, evenement: "tirage", recompense: { encre: 100, fragments: 2 } },
  { id: "invocations", texte: "Invoque 300 cartes à l'autel", cible: 300, evenement: "invocation", recompense: { encre: 150, fragments: 2 } },
  { id: "dores", texte: "Vaincs 5 groupes dorés", cible: 5, evenement: "chasse-dore", recompense: { encre: 120, fragments: 2 } },
  { id: "raid", texte: "Tente 6 fois le boss de la semaine", cible: 6, evenement: "raid", recompense: { encre: 150, fragments: 3 } },
];
