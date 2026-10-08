// ==========================================================
// ROLES ET AFFINITES
// Les valeurs de depart de chaque role (a ajuster en test).
// ==========================================================

export const ROLES = {
  tank:      { nom: "Tank",      pv: 2500, atq: 80,  def: 60, vit: 90,  crit: 0.05 },
  attaquant: { nom: "Attaquant", pv: 1800, atq: 135, def: 35, vit: 100, crit: 0.10 },
  assassin:  { nom: "Assassin",  pv: 1600, atq: 150, def: 25, vit: 125, crit: 0.25 },
  soutien:   { nom: "Soutien",   pv: 1700, atq: 85,  def: 40, vit: 105, crit: 0.05 },
  controle:  { nom: "Contrôle",  pv: 1700, atq: 100, def: 35, vit: 110, crit: 0.10 },
};

// Ce que fait chaque role en combat, en une phrase (affiche dans la fiche du perso)
export const REGLES_ROLES = {
  tank: "Encaisse en ligne avant. Les attaques de base ennemies frappent d'abord la ligne avant en face d'elles.",
  attaquant: "Frappe la ligne avant ennemie en face de lui. À placer devant ou derrière selon sa solidité.",
  assassin: "Frappe directement la ligne arrière ennemie en face de lui. Fragile : à garder en ligne arrière.",
  soutien: "Soigne et protège ses alliés. À l'abri en ligne arrière, seuls les assassins l'atteignent vite.",
  controle: "Étourdit, ralentit et affaiblit l'adversaire. Frappe la ligne avant ennemie en face de lui.",
};

export const AFFINITES = {
  puissance: "Puissance",
  technique: "Technique",
  vitesse: "Vitesse",
  esprit: "Esprit",
  chaos: "Chaos",
};

// Qui domine qui : l'attaquant fait +25 % de degats a ces affinites.
// Cycle : Puissance > Technique > Vitesse > Puissance.
// Duo : Esprit et Chaos se dominent l'un l'autre.
export const DOMINE = {
  puissance: ["technique"],
  technique: ["vitesse"],
  vitesse: ["puissance"],
  esprit: ["chaos"],
  chaos: ["esprit"],
};

export const BONUS_AFFINITE = 0.25;
