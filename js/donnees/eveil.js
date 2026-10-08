// ==========================================================
// L'EVEIL : niveaux 31 a 50
// Quatre paliers, chacun ouvre 5 niveaux et donne +4 % a toutes
// les stats. A chaque palier, on choisit un talent selon le role.
// ==========================================================

export const EVEILS = [
  { palier: 1, niveauMax: 35, etoiles: 2, fragments: 5, eclats: 500 },
  { palier: 2, niveauMax: 40, etoiles: 3, fragments: 10, eclats: 1000 },
  { palier: 3, niveauMax: 45, etoiles: 4, fragments: 20, eclats: 2000 },
  { palier: 4, niveauMax: 50, etoiles: 5, fragments: 40, eclats: 4000 },
];
export const BONUS_EVEIL = 0.04;               // +4 % de PV et d'ATQ par palier
export const COUT_CHANGER_TALENT = 200;        // eclats
export const CHIFFRES_ROMAINS = ["", "I", "II", "III", "IV"];
export const niveauMaxDe = (prog) => 30 + 5 * (prog?.eveil ?? 0);

// Deux talents par role ; chaque palier d'eveil en ajoute un, au choix
export const TALENTS = {
  attaquant: {
    a: { nom: "Coup final", texte: "Ultime +10 % de dégâts", effet: { bonusUltime: 0.1 } },
    b: { nom: "Fureur", texte: "Critique +5 %", effet: { critPct: 5 } },
  },
  assassin: {
    a: { nom: "Exécution", texte: "Critique +5 %", effet: { critPct: 5 } },
    b: { nom: "Vitesse fantôme", texte: "VIT +5 %", effet: { vitPct: 5 } },
  },
  tank: {
    a: { nom: "Rempart", texte: "DEF +8 %", effet: { defPct: 8 } },
    b: { nom: "Colosse", texte: "PV +8 %", effet: { pvPct: 8 } },
  },
  soutien: {
    a: { nom: "Bénédiction", texte: "Soins donnés +10 %", effet: { bonusSoins: 0.1 } },
    b: { nom: "Inspiration", texte: "+10 d'énergie de départ", effet: { energie: 10 } },
  },
  controle: {
    a: { nom: "Maîtrise", texte: "VIT +5 %", effet: { vitPct: 5 } },
    b: { nom: "Esprit vif", texte: "+10 d'énergie de départ", effet: { energie: 10 } },
  },
};
