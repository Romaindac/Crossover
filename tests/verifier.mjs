// ==========================================================
// VERIFICATIONS RAPIDES DU MOTEUR (sans navigateur)
// Lancer avec : node tests/verifier.mjs
// ==========================================================

import { simulerCombat } from "../js/moteur/simulation.js";
import { OBJETS } from "../js/donnees/objets.js";
import { PANOPLIES } from "../js/donnees/panoplies.js";
import { PERSOS } from "../js/donnees/persos.js";
import { TOUTES_LES_ETAPES } from "../js/donnees/campagne.js";
import { etageTour } from "../js/donnees/tour.js";
import { TAMPONS } from "../js/donnees/tampons.js";
import { LIENS } from "../js/donnees/liens.js";
import { catalogueSql, toutSql } from "../js/outils/catalogue-sql.mjs";
import { ICONE_DE_OBJET, TYPES_ICONES } from "../js/ui/icones-objets.js";
import { readFileSync } from "node:fs";
import { SOURCES_PORTRAITS } from "../js/donnees/portraits.js";
import { ouvrirBooster, ouvrirBoosterDepart } from "../js/moteur/boosters.js";
import { invoquer, tableAvecChance, phaseAutel, phaseRelancee } from "../js/moteur/invocations.js";
import { CODES_CADEAUX } from "../js/donnees/codes.js";
import { createHash } from "crypto";
import { MONDES, PITIE_INVOCATION, BORDURES } from "../js/donnees/invocations.js";
import { BOSS_ARENE, bossDe } from "../js/donnees/arene.js";
import { adversaireEtage, bonusDescente } from "../js/moteur/donjon.js";
import { PERSOS_PAR_ID, PERSOS_SECRETS } from "../js/donnees/persos.js";
import { CALIBRAGE } from "../js/donnees/calibrage.js";
import { TABLE_INVOCATION } from "../js/donnees/invocations.js";
import { CALIBRAGE_BOSS } from "../js/donnees/calibrage-arene.js";
import { EDITIONS, PITIE_BOOSTER, CASES_BOOSTER, CARTES_PAR_BOOSTER } from "../js/donnees/boosters.js";
import { creerHasard } from "../js/moteur/hasard.js";
import { STYLES_SERIES } from "../js/donnees/series.js";
import { creerCombat, avancer } from "../js/moteur/simulation.js";
import { appliquerEffet } from "../js/moteur/regles.js";

let erreurs = 0;
const verifier = (condition, message) => {
  console.log(`${condition ? "OK    " : "ECHEC "} ${message}`);
  if (!condition) erreurs++;
};

const equipe = ["ronflex", "luffy", "zoro", "sakura", "pikachu"].map((id) => ({ id, niveau: 20 }));
const a = simulerCombat({ equipeA: equipe, equipeB: equipe, graine: 42 });
const b = simulerCombat({ equipeA: equipe, equipeB: equipe, graine: 42 });
verifier(JSON.stringify(a.journal) === JSON.stringify(b.journal), "le combat est reproductible (meme graine, meme resultat)");
verifier(PERSOS.length === 200, `200 persos jouables (${PERSOS.length})`);
verifier(new Set(PERSOS.map((p) => p.id)).size === PERSOS.length && PERSOS.every((p) => /^[a-z][a-z0-9]*$/.test(p.id)), "ids de persos uniques et simples (alias AniList)");
verifier(PERSOS.every((p) => SOURCES_PORTRAITS[p.id]), "chaque perso a une source de portrait");
verifier(OBJETS.length === 120 && new Set(OBJETS.map((o) => o.id)).size === 120, `120 objets aux ids uniques (${OBJETS.length})`);
verifier(OBJETS.every((o) => !o.panoplie || PANOPLIES[o.panoplie]), "chaque objet de panoplie a sa panoplie");
verifier(TOUTES_LES_ETAPES.length === 40, "40 etapes de campagne");
verifier([1, 10, 50, 100].every((n) => etageTour(n).equipe.length === 5), "les etages de la Tour ont 5 ennemis");
verifier(new Set(TAMPONS.map((t) => t.id)).size === TAMPONS.length, `tampons aux ids uniques (${TAMPONS.length})`);
verifier(LIENS.every((l) => PERSOS.find((p) => p.id === l.a).serie !== PERSOS.find((p) => p.id === l.b).serie), `les ${LIENS.length} liens relient des series differentes`);
verifier(new Set(LIENS.map((l) => l.cle)).size === LIENS.length && LIENS.every((l) => l.scene.every((r) => r.qui === "narrateur" || r.qui === l.a || r.qui === l.b)), "liens uniques, chaque replique dite par un des deux persos");

// Une brulure de N secondes fait N tics de degats, meme posee pile sur un tic de seconde
const ticsDeBrulure = (poseAuTic, secondes) => {
  const etat = creerCombat({ equipeA: equipe, equipeB: equipe, graine: 7 });
  while (etat.t < poseAuTic) avancer(etat);
  const cible = etat.equipes[1][0];
  appliquerEffet(etat, cible, "brulure", secondes, etat.equipes[0][0]);
  let tics = 0;
  while (cible.effets.some((e) => e.type === "brulure")) {
    for (const ev of avancer(etat)) if (ev.type === "perte" && ev.cible === cible.uid && ev.origine === "Brûlure") tics++;
    if (etat.fini) break;
  }
  return tics;
};
verifier(ticsDeBrulure(20, 1) === 1 && ticsDeBrulure(23, 1) === 1 && ticsDeBrulure(20, 4) === 4, "une brulure de N s fait N tics de degats");

// Boosters : 5 cartes de l'edition, reproductibles, et Legendaire garanti par la pitie
const hb = creerHasard(3);
verifier(EDITIONS.every((e) => { const r = ouvrirBooster(hb.nombre, e.id); return r.cartes.length === CARTES_PAR_BOOSTER && r.cartes.every((c) => e.series.includes(PERSOS.find((p) => p.id === c.id).serie)); }), "chaque booster donne ses cartes, toutes de son edition");
verifier(ouvrirBooster(creerHasard(9).nombre, "shonen", { pitie: PITIE_BOOSTER - 1 }).cartes.some((c) => c.rarete === "legendaire"), "la pitie garantit un Legendaire au 20e booster");
verifier(PERSOS.every((p) => EDITIONS.some((e) => e.series.includes(p.serie)) && STYLES_SERIES[p.serie]), "chaque perso est dans une edition et sa serie a un style de carte");

verifier([1, 2, 3, 4, 5].every((g) => { const c = ouvrirBoosterDepart(creerHasard(g).nombre).cartes; return c.length === 5 && new Set(c.map((x) => PERSOS.find((p) => p.id === x.id).role)).size === 5 && c.filter((x) => x.rarete === "rare").length === 1; }), "le booster de depart donne 5 persos, un par role, dont un Rare");
// Chaque perso peut sortir d'un booster : son edition a des cases qui tirent sa rarete
const raretesTirables = new Set(CASES_BOOSTER.flatMap((c) => Object.keys(c)));
verifier(PERSOS.every((p) => raretesTirables.has(p.rarete) && EDITIONS.some((e) => e.series.includes(p.serie))), "les 160 persos peuvent sortir d'un booster");
// Autel d'invocation : chances qui font 100 %, la chance fait monter les raretes, pitie, mondes
verifier([1, 1.5, 3, 6].every((c) => Math.abs(Object.values(tableAvecChance(c)).reduce((a, b) => a + b, 0) - 1) < 1e-9), "les chances d'invocation font toujours 100 %");
verifier(tableAvecChance(2).legendaire > tableAvecChance(1).legendaire && tableAvecChance(2).commun < tableAvecChance(1).commun, "la chance rend les Legendaires plus probables");
verifier(invoquer(creerHasard(5).nombre, "vague", { pitie: PITIE_INVOCATION - 1 }).rarete === "legendaire", "la pitie de l'autel garantit un Legendaire");
verifier(MONDES.every((m) => EDITIONS.some((e) => e.id === m.edition)) && MONDES.length === EDITIONS.length, "un autel par edition");
verifier((() => { const h = creerHasard(11); return Array.from({ length: 300 }, () => invoquer(h.nombre, "tenebres")).every((r) => EDITIONS.find((e) => e.id === "tenebres").series.includes(PERSOS.find((p) => p.id === r.id).serie) && (r.variante === null || BORDURES.some((b) => b.id === r.variante))); })(), "les invocations restent dans leur autel, avec des bordures connues");
// Phases de l'autel : les memes pour tous a la meme heure, une nouvelle toutes les 5 min, jamais « calme » apres une potion de lune
verifier(phaseAutel(1.7e12).id === phaseAutel(1.7e12 + 1000).id && phaseAutel(1.7e12).fin - phaseAutel(1.7e12).debut === 300000, "les phases de l'autel sont deterministes et durent 5 minutes");
verifier((() => { const vus = new Set(Array.from({ length: 2000 }, (_, i) => phaseAutel(i * 300000).id)); return vus.size >= 6; })(), "toutes les phases de l'autel finissent par sortir");
verifier((() => { const h = creerHasard(4); return Array.from({ length: 200 }, () => phaseRelancee(h.nombre, 1).id).every((id) => id !== "calme"); })(), "la potion de lune ne donne jamais le ciel calme");
verifier(CODES_CADEAUX.some((c) => c.empreinte === createHash("sha256").update("crossover:BIENVENUE").digest("hex")) && new Set(CODES_CADEAUX.map((c) => c.empreinte)).size === CODES_CADEAUX.length, "les codes cadeaux ont des empreintes uniques");

// Donjon : les ennemis d'un etage dependent de la graine, et les benedictions se cumulent
verifier(JSON.stringify(adversaireEtage(42, 7, 20)) === JSON.stringify(adversaireEtage(42, 7, 20)) && adversaireEtage(42, 7, 20).equipe.length === 5, "les etages du donjon sont reproductibles (5 ennemis)");
verifier(adversaireEtage(42, 20, 20).multiplicateur > adversaireEtage(42, 2, 20).multiplicateur, "le donjon devient plus dur en descendant");
verifier(bonusDescente(["vigueur", "vigueur", "crit"], 2).pct === 30 && bonusDescente(["crit"]).crit === 0.1, "les benedictions se cumulent");

// Arene : 8 boss par monde, tous enregistres pour le moteur, calibres entre 0,4 et 2
verifier(MONDES.every((m) => bossDe(m.edition).length === 8) && BOSS_ARENE.every((b) => PERSOS_PAR_ID[b.id]?.boss && PERSOS_PAR_ID[b.perso]), "8 boss d'arene par monde, connus du moteur");
verifier(Object.values(CALIBRAGE_BOSS).length === BOSS_ARENE.length && Object.values(CALIBRAGE_BOSS).every((c) => c >= 0.4 && c <= 2), "les boss d'arene sont calibres (sinon : node js/outils/calibrer-arene.mjs)");
verifier(OBJETS.every((o) => TYPES_ICONES.includes(ICONE_DE_OBJET[o.id])), "chaque objet a son icone");
verifier(readFileSync(new URL("../supabase/catalogue.sql", import.meta.url), "utf8") === catalogueSql(), "supabase/catalogue.sql est a jour (sinon : node js/outils/catalogue-sql.mjs)");
verifier(readFileSync(new URL("../supabase/a-coller.sql", import.meta.url), "utf8") === toutSql(), "supabase/a-coller.sql est a jour (sinon : node js/outils/catalogue-sql.mjs)");

// ---------- Les Secrets ----------
{
  const series = [...new Set(PERSOS.map((p) => p.serie))];
  verifier(PERSOS_SECRETS.length === series.length && series.every((s) => PERSOS_SECRETS.filter((p) => p.serie === s).length === 1), `un Secret par serie (${PERSOS_SECRETS.length})`);
  verifier(PERSOS_SECRETS.every((p) => p.rarete === "secret" && PERSOS_PAR_ID[p.base]?.serie === p.serie && !PERSOS.includes(p)), "chaque Secret a son heros de base et reste hors de PERSOS (jamais ennemi, hors series)");
  verifier(PERSOS_SECRETS.every((p) => CALIBRAGE[p.id] === undefined || (CALIBRAGE[p.id] >= 0.8 && CALIBRAGE[p.id] <= 1.2)), "coefficients des Secrets entre 0,8 et 1,2 (sinon : retoucher le kit)");
  verifier(TABLE_INVOCATION.secret > 0 && TABLE_INVOCATION.secret < TABLE_INVOCATION.legendaire, "le Secret a un taux a l'autel, plus rare que Legendaire");
  let h = creerHasard(7), secrets = 0, bonsMondes = true;
  for (let i = 0; i < 200000; i++) {
    const m = MONDES[i % 4];
    const r = invoquer(() => h.nombre(), m.edition, { chance: 1 });
    if (r.rarete === "secret") { secrets++; if (!EDITIONS.find((e) => e.id === m.edition).series.includes(PERSOS_PAR_ID[r.id].serie)) bonsMondes = false; }
  }
  verifier(secrets > 15 && secrets < 70 && bonsMondes, `Secrets a l'autel : ${secrets} sur 200 000 invocations (environ 40 attendus), chacun dans son monde`);
}

// Calibrage : chaque perso entre 0,8 et 1,2 (sinon c'est son kit qu'il faut retoucher, voir CLAUDE.md)
{
  const hors = Object.entries(CALIBRAGE).filter(([, c]) => c < 0.8 || c > 1.2).map(([id, c]) => `${id} ${c}`);
  verifier(hors.length === 0, `tous les coefficients de calibrage entre 0,8 et 1,2${hors.length ? ` (hors plage : ${hors.join(", ")})` : ""}`);
}

// ---------- L'Encrier (roguelite) ----------
{
  const { genererCarte, offrePersos, adversaireCase, effetsReliques } = await import("../js/moteur/encrier.js");
  const { RELIQUES, EVENEMENTS } = await import("../js/donnees/encrier.js");
  let cartesOk = true;
  for (let g = 1; g <= 200; g++) for (let a = 1; a <= 3; a++) {
    const r = genererCarte(g, a).rangs;
    if (r.at(-1).length !== 1 || r.at(-1)[0].type !== "boss" || r[0].some((x) => x.type !== "combat")) cartesOk = false;
    for (let i = 0; i < r.length - 1; i++) {
      if (r[i].some((x) => !x.liens.length || x.liens.some((l) => !r[i + 1].some((y) => y.id === l)))) cartesOk = false;
      if (r[i + 1].some((y) => !r[i].some((x) => x.liens.includes(y.id)))) cartesOk = false;
    }
  }
  verifier(cartesOk, "Encrier : chaque carte mene au boss, chaque case est atteignable et mene quelque part");
  verifier(JSON.stringify(genererCarte(5, 2)) === JSON.stringify(genererCarte(5, 2)) && offrePersos(9, "x", 4, 1).join() === offrePersos(9, "x", 4, 1).join(), "Encrier : cartes et offres reproductibles (meme graine)");
  let departOk = true;
  for (let g = 1; g <= 100; g++) {
    const o = offrePersos(g, "depart", 6, 0, { garantir: ["tank", "soutien", "attaquant"] });
    if (o.length !== 6 || new Set(o).size !== 6 || !["tank", "soutien", "attaquant"].every((r) => o.some((id) => PERSOS_PAR_ID[id].role === r)) || o.some((id) => !PERSOS.includes(PERSOS_PAR_ID[id]))) departOk = false;
  }
  verifier(departOk, "Encrier : le draft de depart propose 6 persos differents (hors Secrets), avec tank, soutien et attaquant");
  verifier(adversaireCase(1, 3, 7, "boss", "b").multiplicateur > adversaireCase(1, 2, 7, "boss", "b").multiplicateur && adversaireCase(1, 2, 7, "boss", "b").multiplicateur > adversaireCase(1, 1, 0, "combat", "c").multiplicateur, "Encrier : les ennemis se renforcent d'acte en acte");
  verifier(effetsReliques(["pacte", "encre-chine", "talisman"]).pct === 35 && effetsReliques(["talisman"]).stats.survie === true && new Set(RELIQUES.map((r) => r.id)).size === RELIQUES.length, "Encrier : les reliques se cumulent (ids uniques)");
  verifier(EVENEMENTS.every((e) => e.choix.length >= 2 && e.choix.every((c) => c.texte && c.detail && c.effets)), "Encrier : chaque evenement a au moins deux choix complets");
  const { jouerParties } = await import("../js/outils/robot-encrier.mjs");
  const st = jouerParties(40);
  const fins = st.actes.reduce((a, b) => a + b, 0);
  verifier(fins === 40 && st.sansBilan.length === 0, `Encrier : 40 parties completes jouees par le robot sans blocage (victoires du robot : ${st.victoires})`);
  verifier(st.victoires >= 1 && st.victoires <= 20, "Encrier : ni impossible ni trop facile pour le robot (1 a 20 victoires sur 40)");
}

console.log(erreurs ? `\n${erreurs} verification(s) en echec.` : "\nTout est bon.");
process.exit(erreurs ? 1 : 0);
