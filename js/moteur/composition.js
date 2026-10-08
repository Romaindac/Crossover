// ==========================================================
// COMPOSITION AUTOMATIQUE D'UNE EQUIPE
// Utilisee par le bouton "Meilleure équipe" et par le simulateur.
// Regle simple et lisible : le meilleur tank, le meilleur soutien,
// puis les persos les plus forts ; les tanks et attaquants devant.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { facteurProgression } from "./stats.js";

// collection : { id: { niveau, etoiles, ... } }
export function scorePerso(id, prog) {
  return facteurProgression(PERSOS_PAR_ID[id], prog);
}

export function composerEquipe(collection) {
  const role = (id) => PERSOS_PAR_ID[id].role;
  const ids = Object.keys(collection).sort((a, b) => scorePerso(b, collection[b]) - scorePerso(a, collection[a]));
  const choisis = [];
  const prendre = (filtre) => {
    const id = ids.find((i) => !choisis.includes(i) && filtre(i));
    if (id) choisis.push(id);
  };
  prendre((i) => role(i) === "tank");
  prendre((i) => role(i) === "soutien");
  while (choisis.length < Math.min(5, ids.length)) prendre(() => true);

  // Devant : les tanks d'abord, puis les attaquants, puis le reste
  const ordreDevant = ["tank", "attaquant", "controle", "soutien", "assassin"];
  const avant = [...choisis].sort((a, b) => ordreDevant.indexOf(role(a)) - ordreDevant.indexOf(role(b))).slice(0, 2);
  const arriere = choisis.filter((i) => !avant.includes(i));
  return [...avant, ...arriere, null, null, null, null, null].slice(0, 5);
}
