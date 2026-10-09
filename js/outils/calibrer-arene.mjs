// ==========================================================
// CALIBRAGE DES BOSS DE L'ARENE
// Pour chaque boss, cherche le coefficient (PV et ATQ) qui donne
// la victoire visee a une equipe au niveau du boss (2 etoiles, composee
// au hasard parmi 35 persos ; equipe de debutant pour le premier monde). Ecrit js/donnees/calibrage-arene.js.
// Lancer : node js/outils/calibrer-arene.mjs   (environ 2 min)
// ==========================================================

import { writeFileSync } from "fs";
import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { BOSS_ARENE, pvBoss, atqBoss, victoireVisee } from "../donnees/arene.js";
import { composerEquipe } from "../moteur/composition.js";
import { simulerCombat } from "../moteur/simulation.js";
import { creerHasard } from "../moteur/hasard.js";

const EQUIPES = 16, COMBATS = 3;

// Les memes equipes de test pour un niveau donne. Premier monde : des equipes de
// debutant (Communs, Peu communs et quelques Rares, 1 etoile), comme en debut de partie.
const equipesDuNiveau = new Map();
function equipes(niveau, debutant = false) {
  const cle = `${niveau}:${debutant}`;
  if (!equipesDuNiveau.has(cle)) {
    equipesDuNiveau.set(cle, Array.from({ length: EQUIPES }, (_, t) => {
      const h = creerHasard(t * 31 + 7);
      const coll = {};
      const pool = debutant ? PERSOS.filter((p) => ["commun", "peu_commun"].includes(p.rarete) || (p.rarete === "rare" && h.nombre() < 0.3)) : PERSOS;
      for (const p of [...pool].sort(() => h.nombre() - 0.5).slice(0, debutant ? 12 : 35)) coll[p.id] = { niveau, etoiles: debutant ? 1 : 2, xp: 0, doublons: 0, eveil: 0, talents: [] };
      return composerEquipe(coll).map((id) => ({ id, ...coll[id] }));
    }));
  }
  return equipesDuNiveau.get(cle);
}

function taux(b, c) {
  const boss = PERSOS_PAR_ID[b.id];
  const base = PERSOS_PAR_ID[b.perso];
  boss.mods = { ...(base.mods ?? {}), pv: (base.mods?.pv ?? 1) * pvBoss(b.rang) * c, atq: (base.mods?.atq ?? 1) * atqBoss(b.rang) * c };
  let v = 0, n = 0;
  equipes(b.niveau, b.indexMonde === 0).forEach((eq, t) => {
    for (let g = 0; g < COMBATS; g++) {
      n++;
      if (simulerCombat({ equipeA: eq, equipeB: [b.id], niveauB: b.niveau, graine: t * 100 + g, journal: false }).vainqueur === 0) v++;
    }
  });
  return v / n;
}

const resultat = {};
for (const b of BOSS_ARENE) {
  const vise = victoireVisee(b.rang, b.indexMonde);
  let bas = 0.25, haut = 4;
  for (let i = 0; i < 9; i++) {
    const milieu = Math.sqrt(bas * haut);
    if (taux(b, milieu) > vise) bas = milieu; else haut = milieu;
  }
  const c = Math.round(Math.sqrt(bas * haut) * 100) / 100;
  resultat[b.id] = c;
  console.log(b.monde.padEnd(10), b.rang, b.perso.padEnd(12), "coef", c, "victoire", Math.round(taux(b, c) * 100) + " %", "(visé", Math.round(vise * 100) + " %)");
}
writeFileSync(new URL("../donnees/calibrage-arene.js", import.meta.url),
  `// Ecrit par node js/outils/calibrer-arene.mjs : ne pas modifier a la main.\nexport const CALIBRAGE_BOSS = ${JSON.stringify(resultat, null, 2)};\n`);
