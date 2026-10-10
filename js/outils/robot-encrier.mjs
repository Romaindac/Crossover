// ==========================================================
// ROBOT DE L'ENCRIER : joue des parties completes du roguelite
// avec une strategie simple, pour verifier les regles et mesurer
// la difficulte. Usage : node js/outils/robot-encrier.mjs [parties]
// ==========================================================

import * as P from "../services/partie.js";
import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES } from "../donnees/raretes.js";
import { caseDe } from "../moteur/encrier.js";
import { EVENEMENTS_PAR_ID } from "../donnees/encrier.js";


const ordre = (id) => RARETES[PERSOS_PAR_ID[id].rarete].ordre;
const pvMoyen = (run) => { const l = [...run.terrain, ...run.reserve]; return l.reduce((t, id) => t + run.persos[id].pv, 0) / l.length; };

// Joue n parties et renvoie les statistiques (utilise aussi par tests/verifier.mjs)
export function jouerParties(N) {
P.nouvellePartie();
const stats = { actes: [0, 0, 0, 0, 0], victoires: 0, combats: 0, mortsParType: {}, or: 0, reliques: 0, duree: 0, parRang: {}, sansBilan: [] };

for (let partie = 0; partie < N; partie++) {
  P.abandonnerEncrier();
  P.commencerEncrier();
  let e = P.etatEncrier();
  // Draft : un tank, un soutien, puis la meilleure rarete
  const offre = e.run.offre.persos;
  const tri = [...offre].sort((a, b) => ordre(b) - ordre(a));
  const choix = [];
  for (const role of ["tank", "soutien"]) { const id = tri.find((x) => PERSOS_PAR_ID[x].role === role && !choix.includes(x)); if (id) choix.push(id); }
  for (const id of tri) if (choix.length < 3 && !choix.includes(id)) choix.push(id);
  P.choisirDepartEncrier(choix);
  let fin = null;
  for (let pas = 0; pas < 400 && !fin; pas++) {
    e = P.etatEncrier();
    if (!e.run) break;
    const run = e.run;
    const o = run.offre;
    if (!o) {
      // choisir la prochaine case : soin si besoin, sinon combats/elites selon l'etat
      const cases = e.accessibles.map((id) => caseDe(e.carte, id));
      const pv = pvMoyen(run);
      const note = (c) => ({ repos: pv < 0.5 ? 10 : 2, boutique: run.or >= 90 ? 6 : 1, tresor: 8, evenement: 3, combat: pv > 0.35 ? 6 : 1, elite: pv > 0.7 && run.terrain.length >= 4 ? 7 : 0, boss: 5 })[c.type];
      cases.sort((a, b) => note(b) - note(a));
      P.allerVersEncrier(cases[0].id);
      continue;
    }
    if (o.type === "combat") {
      const rang = Number(o.caseId.match(/r(\d+)/)[1]) + (run.acte - 1) * 8;
      const taille = run.terrain.length;
      const r = P.combattreEncrier();
      stats.combats++;
      const k = `${String(rang).padStart(2, "0")} ${o.typeCase}`;
      stats.parRang[k] ??= [0, 0, 0, 0];
      stats.parRang[k][0]++; if (r.victoire) stats.parRang[k][1]++; stats.parRang[k][2] += taille; stats.parRang[k][3] += pvMoyen(run);
      if (!r.victoire) { fin = r.fin; stats.mortsParType[o.typeCase] = (stats.mortsParType[o.typeCase] || 0) + 1; }
      continue;
    }
    if (o.type === "recrue") {
      const meilleur = [...o.persos].sort((a, b) => ordre(b) - ordre(a))[0];
      const tous = [...run.terrain, ...run.reserve];
      const plein = tous.length >= 8;
      const pire = [...tous].sort((a, b) => ordre(a) - ordre(b))[0];
      const r = (!meilleur || (plein && ordre(meilleur) <= ordre(pire))) ? P.recruterEncrier(null) : P.recruterEncrier(meilleur, plein ? pire : null);
      if (r.fin) fin = r.fin;
      // garder les plus rares sur le terrain
      e = P.etatEncrier();
      if (e.run && !e.run.offre) {
        const t = e.run;
        const res = [...t.reserve].sort((a, b) => ordre(b) - ordre(a));
        for (const id of res) { const faible = [...e.run.terrain].sort((a, b) => ordre(a) - ordre(b))[0]; if (ordre(id) > ordre(faible)) { P.echangerEncrier(faible); P.echangerEncrier(id); e = P.etatEncrier(); } }
      }
      continue;
    }
    if (o.type === "tresor" || o.type === "relique") { P.prendreReliqueEncrier(o.reliques[0]); stats.reliques++; continue; }
    if (o.type === "evenement") {
      if (!o.resultat) {
        const evt = EVENEMENTS_PAR_ID[o.id];
        const i = evt.choix.findIndex((c) => !c.cout || run.or >= c.cout);
        P.choisirEvenementEncrier(i);
      } else P.quitterCaseEncrier();
      continue;
    }
    if (o.type === "boutique") {
      for (const rel of o.reliques) P.acheterEncrier("relique", rel.id);
      if (pvMoyen(run) < 0.6) P.acheterEncrier("soin");
      P.quitterCaseEncrier();
      continue;
    }
    if (o.type === "repos") {
      if (pvMoyen(run) < 0.7) P.reposerEncrier("soin");
      else { const id = [...run.terrain].sort((a, b) => ordre(b) - ordre(a) || run.persos[a].etoiles - run.persos[b].etoiles).find((x) => run.persos[x].etoiles < 5); if (id) P.reposerEncrier("entrainement", id); else P.reposerEncrier("soin"); }
      continue;
    }
    if (o.type === "depart") break;
  }
  const b = fin ?? P.etatEncrier().bilan;
  if (!b) stats.sansBilan.push(JSON.stringify(P.etatEncrier().run?.offre ?? "?").slice(0, 120));
  if (b) {
    stats.actes[b.victoire ? 4 : b.acte]++;
    if (b.victoire) stats.victoires++;
  }
}
return stats;
}

const lancementDirect = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (lancementDirect) {
const N = Number(process.argv[2] || 100);
const stats = jouerParties(N);
console.log(`${N} parties : fin a l'acte 1 ${stats.actes[1]}, acte 2 ${stats.actes[2]}, acte 3 ${stats.actes[3]}, victoires ${stats.victoires} (${Math.round(stats.victoires / N * 100)} %)`);
console.log("combats par partie", (stats.combats / N).toFixed(1), "morts par type", stats.mortsParType, "reliques/partie", (stats.reliques / N).toFixed(1));
console.log(Object.entries(stats.parRang).sort().map(([k, v]) => `${k.padEnd(12)} ${v[0]} combats, ${Math.round(v[1] / v[0] * 100)} % gagnes, equipe ${(v[2] / v[0]).toFixed(1)}, pv ${(v[3] / v[0]).toFixed(2)}`).join("\n"));
console.log("sans bilan", stats.sansBilan);
}
