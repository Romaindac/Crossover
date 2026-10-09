// ==========================================================
// CALIBRAGE AUTOMATIQUE DES PERSOS (outil, hors du jeu)
// Lancer avec : node js/outils/calibrer.mjs
//
// Joue des tournois realistes (1 tank + 1 soutien ou controle + 3 persos
// au hasard, ranges comme un joueur, niveau 30, sans bonus de rarete),
// puis ajuste un coefficient de PV et d'ATQ pour chaque perso qui sort
// de la zone 46-54 %. Recommence jusqu'a ce que tout le monde soit
// entre 45 et 55 %, puis ecrit js/donnees/calibrage.js.
// Les kits (passifs, ultimes) ne sont jamais modifies.
//
// node js/outils/calibrer.mjs secrets : calibre seulement les persos Secrets
// (ils jouent contre tout le monde, les autres coefficients ne bougent pas).
// ==========================================================

import { writeFileSync } from "node:fs";
import { PERSOS, PERSOS_PAR_ID, PERSOS_SECRETS } from "../donnees/persos.js";
import { CALIBRAGE } from "../donnees/calibrage.js";
import { simulerCombat } from "../moteur/simulation.js";
import { creerHasard } from "../moteur/hasard.js";

// node js/outils/calibrer.mjs liste id1,id2,... : seulement ces persos (une nouvelle extension par exemple)
const SECRETS = process.argv[2] === "secrets";
const LISTE = process.argv[2] === "liste" ? process.argv[3].split(",") : null;
const args = SECRETS ? process.argv.slice(3) : LISTE ? process.argv.slice(4) : process.argv.slice(2);
const COMBATS_PAR_TOUR = Number(args[0] ?? 16000);
const TOURS_MAX = Number(args[1] ?? 8);
const avecSecrets = SECRETS || LISTE?.some((id) => PERSOS_SECRETS.some((p) => p.id === id));
const ids = (avecSecrets ? [...PERSOS, ...PERSOS_SECRETS] : PERSOS).map((p) => p.id);
// Les persos dont on ajuste le coefficient (tous, les Secrets, ou une liste)
const aRegler = SECRETS ? PERSOS_SECRETS.map((p) => p.id) : LISTE ?? ids;
const ordreDevant = ["tank", "attaquant", "controle", "soutien", "assassin"];

function ranger(equipe) {
  const avant = [...equipe].sort((a, b) => ordreDevant.indexOf(PERSOS_PAR_ID[a].role) - ordreDevant.indexOf(PERSOS_PAR_ID[b].role)).slice(0, 2);
  return [...avant, ...equipe.filter((i) => !avant.includes(i))];
}

function tirerEquipe(h, reserve) {
  const prendre = (filtre) => {
    const candidats = reserve.filter(filtre);
    const id = candidats[Math.floor(h.nombre() * candidats.length)];
    reserve.splice(reserve.indexOf(id), 1);
    return id;
  };
  const tank = prendre((i) => PERSOS_PAR_ID[i].role === "tank");
  const aide = prendre((i) => ["soutien", "controle"].includes(PERSOS_PAR_ID[i].role));
  return ranger([tank, aide, prendre(() => true), prendre(() => true), prendre(() => true)]);
}

function tournoi(graine) {
  const h = creerHasard(graine);
  const stats = Object.fromEntries(ids.map((id) => [id, { matchs: 0, victoires: 0 }]));
  for (let i = 0; i < COMBATS_PAR_TOUR; i++) {
    const reserve = [...ids];
    const a = tirerEquipe(h, reserve);
    const b = tirerEquipe(h, reserve);
    const r = simulerCombat({
      equipeA: a.map((id) => ({ id, niveau: 30 })), equipeB: b.map((id) => ({ id, niveau: 30 })),
      avecRarete: false, graine: graine * 100003 + i, journal: false,
    });
    for (const u of r.unites) {
      stats[u.id].matchs++;
      if (r.raison === "ko" && u.camp === r.vainqueur) stats[u.id].victoires++;
    }
  }
  return Object.fromEntries(ids.map((id) => [id, stats[id].victoires / Math.max(1, stats[id].matchs)]));
}

const rapport = (taux) => {
  const valeurs = aRegler.map((id) => taux[id]);
  const ecart = Math.sqrt(valeurs.reduce((s, t) => s + (t - 0.5) ** 2, 0) / valeurs.length);
  const hors = aRegler.filter((id) => taux[id] < 0.45 || taux[id] > 0.55);
  return { ecart, hors };
};

for (let tour = 1; tour <= TOURS_MAX; tour++) {
  const taux = tournoi(tour);
  const { ecart, hors } = rapport(taux);
  console.log(`Tour ${tour} : ecart-type ${(100 * ecart).toFixed(1)} points, hors [45 ; 55] : ${hors.map((id) => `${id} ${(100 * taux[id]).toFixed(0)}`).join(", ") || "personne"}`);
  if (!hors.length) break;
  for (const id of aRegler) {
    if (taux[id] >= 0.46 && taux[id] <= 0.54) continue;
    const coef = (CALIBRAGE[id] ?? 1) * (1 + 0.8 * (0.5 - taux[id]));
    CALIBRAGE[id] = Math.round(Math.min(1.5, Math.max(0.6, coef)) * 1000) / 1000;
  }
}

// Verification sur des graines neuves
const final = tournoi(999);
const { ecart, hors } = rapport(final);
console.log(`Verification : ecart-type ${(100 * ecart).toFixed(1)} points, hors [45 ; 55] : ${hors.join(", ") || "personne"}`);

const lignes = Object.keys(CALIBRAGE).filter((id) => PERSOS_PAR_ID[id] && Math.abs(CALIBRAGE[id] - 1) >= 0.005).sort()
  .map((id) => `  ${id}: ${CALIBRAGE[id]},`);
writeFileSync(new URL("../donnees/calibrage.js", import.meta.url), `// ==========================================================
// CALIBRAGE AUTOMATIQUE DES PERSOS
// Fichier ecrit par js/outils/calibrer.mjs (ne pas modifier a la main) :
// un petit coefficient de PV et d'ATQ par perso, pour que chacun gagne
// entre 45 et 55 % au tournoi realiste, sans toucher a son kit.
// ==========================================================

export const CALIBRAGE = {
${lignes.join("\n")}
};
`);
console.log(`calibrage.js ecrit (${lignes.length} persos ajustes).`);
