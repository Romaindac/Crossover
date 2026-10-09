// ==========================================================
// L'AUTEL D'INVOCATION (affichage)
// On invoque une carte a la fois : le sceau s'allume, la carte
// jaillit, sa rarete se lit tout de suite (couleur, son, eclats).
// Invocation automatique, rapide et x3 se debloquent avec le niveau
// d'autel. Potions, mondes (un autel par edition) et historique.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES, ORDRE_RARETES } from "../donnees/raretes.js";
import { EDITIONS_PAR_ID } from "../donnees/boosters.js";
import {
  MONDES, POTIONS, BORDURES, NIVEAUX_AUTEL, BRANCHES_AUTEL, POINTS_PAR_NIVEAU, COUT_REDISTRIBUTION, PHASES, MINUTES_PAR_PHASE,
  CHANCE_BOSS_ARENE, CHANCE_MONDE_FINI, INVOCATIONS_MAX, MINUTES_PAR_INVOCATION, INVOCATIONS_VICTOIRE,
  CHANCE_SERIE_COMPLETE, CHANCE_EDITION_COMPLETE, PITIE_INVOCATION, POUSSIERE_DOUBLON_INVOCATION, CHANCE_POTION_VICTOIRE,
} from "../donnees/invocations.js";
import { tableAvecChance } from "../moteur/invocations.js";
import { CHAPITRES } from "../donnees/campagne.js";
import { styleSerie, varsSerie } from "../donnees/series.js";
import {
  etatInvocations, invoquerJoueur, boirePotion, fabriquerPotion, choisirMonde, mondeOuvert, progressionDe, possede,
  progressionSerie, verifierTampons, placerPointAutel, redistribuerPointsAutel,
} from "../services/partie.js";
import { connecte, envoyerMessage } from "../services/enligne.js";
import { reglage } from "../services/reglages.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlCarteStatique, rafraichirPortrait, nomBordure } from "./cartes.js";
import { annoncerTampons } from "./toast.js";
import { sonCarte, sonRarete, sonNouveau, sonComplete, sonSuspense } from "./sons.js";

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const pourcent = (x) => `${(x * 100).toFixed(x < 0.01 ? 2 : x < 0.1 ? 1 : 0).replace(".", ",")} %`;
const multiplicateur = (x) => `×${x.toFixed(2).replace(".", ",").replace(/,?0+$/, "")}`;
const ONOMATOPEES = ["ゴゴゴ", "ドドド", "ズドン"];
const HISTORIQUE_MAX = 40;
const BORDURES_RARES = ["arcenciel", "neant"];

function dureeCourte(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")}` : `${s} s`;
}

// Le sceau de l'autel : deux anneaux graves qui tournent, l'etoile au centre
const SCEAU = `
  <svg class="autel__sceau" viewBox="0 0 200 200" aria-hidden="true">
    <g class="autel__anneau autel__anneau--ext">
      <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="100" cy="100" r="84" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 5"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="97" y="8" width="6" height="12" rx="1" fill="currentColor" transform="rotate(${i * 30} 100 100)"/>`).join("")}
    </g>
    <g class="autel__anneau autel__anneau--int">
      <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <polygon points="100,38 154,131 46,131" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <polygon points="100,162 46,69 154,69" fill="none" stroke="currentColor" stroke-width="1.5"/>
    </g>
    <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" stroke-width="2.5"/>
  </svg>`;

const ICONE_POTION = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2h6v2h-1v4.2l5.2 8.6A3.5 3.5 0 0116.2 22H7.8a3.5 3.5 0 01-3-5.2L10 8.2V4H9z" fill="var(--potion)" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M7 15h10" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/></svg>`;

export function afficherAutel(zone, { conteneur, majEncre, mouvementReduit = false, naviguer }) {
  let auto = false;
  let enCours = false;      // une invocation est en train de s'afficher
  let prochainPossible = 0; // horodatage du prochain tirage permis
  const historique = [];
  const seance = { invocations: 0, nouveaux: 0, parRarete: {} };
  const $ = (sel) => zone.querySelector(sel);

  zone.innerHTML = `
    <section class="autel" aria-label="Autel d'invocation">
      <div class="autel__mondes" id="autel-mondes" role="radiogroup" aria-label="Choisir l'autel"></div>
      <div class="autel__scene" id="autel-scene">
        <div class="autel__halo" aria-hidden="true"></div>
        <p class="autel__phase" id="autel-phase" aria-live="polite"></p>
        ${SCEAU}
        <div class="autel__carte" id="autel-carte" aria-live="polite">
          <p class="autel__invite">Touche « Invoquer » : une carte jaillit du sceau.</p>
        </div>
        <p class="autel__resultat" id="autel-resultat" aria-live="polite"></p>
      </div>
      <div class="autel__commandes">
        <button type="button" class="bouton autel__invoquer" data-autel="invoquer"><span class="autel__invoquer-texte">Invoquer</span><span class="autel__recharge" aria-hidden="true"></span></button>
        <button type="button" class="bouton bouton--clair autel__triple" data-autel="triple" hidden>×3</button>
        <button type="button" class="bouton bouton--clair autel__auto" data-autel="auto" aria-pressed="false">Auto</button>
      </div>
      <div class="autel__reserve" id="autel-reserve"></div>
      <div class="autel__panneaux">
        <div class="autel__panneau" id="autel-chance"></div>
        <div class="autel__panneau" id="autel-niveau"></div>
      </div>
      <h2 class="autel__titre-section">Potions</h2>
      <div class="autel__potions" id="autel-potions"></div>
      <h2 class="autel__titre-section">Dernières invocations</h2>
      <p class="autel__seance" id="autel-seance"></p>
      <ol class="autel__historique" id="autel-historique"></ol>
      <div id="autel-taux"></div>
    </section>`;

  // ---------- Rendus partiels (on ne redessine jamais tout l'autel) ----------

  function rendreMondes() {
    const e = etatInvocations();
    $("#autel-mondes").innerHTML = MONDES.map((m) => {
      const ed = EDITIONS_PAR_ID[m.edition];
      const ouvert = mondeOuvert(m.edition);
      const persos = PERSOS.filter((p) => ed.series.includes(p.serie));
      const n = persos.filter((p) => possede(p.id)).length;
      return `
        <button type="button" role="radio" class="autel__monde" data-autel="monde" data-edition="${m.edition}" aria-checked="${e.monde === m.edition}" ${ouvert ? "" : "disabled"}
          style="--p1: ${ed.couleurs[0]}; --p2: ${ed.couleurs[1]}; --p3: ${ed.couleurs[2]}">
          <span class="autel__monde-nom">${m.nom}</span>
          <span class="autel__monde-info">${ouvert ? `${ed.nom} · ${n}/${persos.length}` : `Fin du chapitre ${m.chapitre} : ${CHAPITRES[m.chapitre - 1]?.nom ?? ""}`}</span>
        </button>`;
    }).join("");
    const ed = EDITIONS_PAR_ID[e.monde];
    $("#autel-scene").style.cssText = `--p1: ${ed.couleurs[0]}; --p2: ${ed.couleurs[1]}; --p3: ${ed.couleurs[2]}`;
  }

  function rendreReserve() {
    const e = etatInvocations();
    const prochaine = e.prochaine ? `+1 dans ${dureeCourte(e.prochaine - Date.now())}` : "Réserve pleine";
    $("#autel-reserve").innerHTML = `
      <span class="autel__reserve-chiffre"><strong>${e.reserve}</strong> / ${e.max} invocations</span>
      <span class="autel__jauge"><span style="--v: ${Math.min(1, e.reserve / e.max)}"></span></span>
      <span class="autel__reserve-aide">${prochaine} · +${INVOCATIONS_VICTOIRE} par combat gagné · Légendaire garanti dans <strong>${e.avantLegendaire}</strong></span>`;
    const vide = e.reserve <= 0;
    $("[data-autel='invoquer']").disabled = vide;
    const triple = $("[data-autel='triple']");
    triple.hidden = !e.pouvoirs.triple;
    triple.disabled = e.reserve < 3;
    const boutonAuto = $("[data-autel='auto']");
    boutonAuto.disabled = !e.pouvoirs.auto;
    boutonAuto.title = e.pouvoirs.auto ? "Invoque tout seul tant qu'il reste des invocations" : `Se débloque au niveau d'autel 1 (${NIVEAUX_AUTEL[1].invocations} invocations)`;
    boutonAuto.innerHTML = e.pouvoirs.auto ? (auto ? "Auto : en marche" : "Auto") : `Auto <small>niv. 1</small>`;
    boutonAuto.setAttribute("aria-pressed", String(auto));
    if (vide && auto) arreterAuto();
  }

  function rendreChance() {
    const e = etatInvocations();
    const c = e.chance;
    const table = tableAvecChance(c.total);
    const lignes = [
      ["Points d'autel (Chance)", `+${pourcent(c.niveau)}`],
      [`Index · ${c.index.nbSeries} série${c.index.nbSeries > 1 ? "s" : ""} complète${c.index.nbSeries > 1 ? "s" : ""}`, `+${pourcent(c.index.series)}`],
      [`Index · ${c.index.nbEditions} édition${c.index.nbEditions > 1 ? "s" : ""} complète${c.index.nbEditions > 1 ? "s" : ""}`, `+${pourcent(c.index.editions)}`],
      ["Index · bordures", `+${pourcent(c.index.bordures)}`],
      [`Index · combats (${c.index.nbBoss} boss, Tour, éveils)`, `+${pourcent(c.index.combats)}`],
      ...(c.potion > 1 ? [["Potion de chance", multiplicateur(c.potion)]] : []),
      ...(c.phase > 1 ? [[`Phase : ${e.phase.nom}`, multiplicateur(c.phase)]] : []),
    ];
    $("#autel-chance").innerHTML = `
      <p class="autel__panneau-titre">Chance <strong class="autel__chance">${multiplicateur(c.total)}</strong></p>
      <dl class="autel__lignes">${lignes.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>
      ${naviguer ? '<button type="button" class="bouton-texte autel__voir-index" data-autel="index">Voir l\'Index : ce qui te manque</button>' : ""}
      <p class="autel__taux-courts">${ORDRE_RARETES.slice(0, 3).map((r) => `<span class="autel__taux autel__taux--${r}">${RARETES[r].nom} ${pourcent(table[r])}</span>`).join("")}${c.bordure > 1 ? `<span class="autel__taux autel__taux--bordure">Bordures ${multiplicateur(c.bordure)}</span>` : ""}</p>`;
    $("#autel-scene").style.setProperty("--chance", String(Math.min(1, (c.total - 1) / 2)));
  }

  function rendreNiveau() {
    const e = etatInvocations();
    const p = e.prochainNiveau;
    const v = (e.total - e.seuilNiveau) / (p.invocations - e.seuilNiveau);
    const pouvoirs = NIVEAUX_AUTEL.map((x, i) => x.pouvoir ? `<li class="${e.niveau >= i ? "autel__pouvoir--ok" : ""}">Niv. ${i} · ${x.texte}</li>` : "").join("");
    $("#autel-niveau").innerHTML = `
      <p class="autel__panneau-titre">Niveau d'autel <strong>${e.niveau}</strong></p>
      <span class="autel__jauge autel__jauge--niveau"><span style="--v: ${v}"></span></span>
      <p class="autel__aide">${nombre(e.total)} / ${nombre(p.invocations)} invocations pour le niveau ${e.niveau + 1}${p.texte ? ` : <b>${p.texte}</b>` : ""}. Chaque niveau : ${POINTS_PAR_NIVEAU} points d'autel.</p>
      <ul class="autel__pouvoirs">${pouvoirs}</ul>
      <p class="autel__points-titre">Points d'autel ${e.pointsLibres ? `<b class="autel__points-libres">${e.pointsLibres} à placer</b>` : ""}</p>
      <ul class="autel__branches">${BRANCHES_AUTEL.map((b) => `
        <li class="autel__branche">
          <span class="autel__branche-nom"><b>${b.nom}</b> ${e.points[b.id]}/${b.max}<small>${b.effet(e.points[b.id])}</small></span>
          <button type="button" class="autel__plus" data-autel="point" data-branche="${b.id}" ${e.pointsLibres > 0 && e.points[b.id] < b.max ? "" : "disabled"} aria-label="Placer un point en ${b.nom}">+</button>
        </li>`).join("")}</ul>
      <button type="button" class="bouton-texte autel__redistribuer" data-autel="redistribuer" ${e.poussiere >= COUT_REDISTRIBUTION && Object.values(e.points).some(Boolean) ? "" : "disabled"}>Tout redistribuer · ${COUT_REDISTRIBUTION} poussière</button>`;
  }

  function rendrePotions() {
    const e = etatInvocations();
    $("#autel-potions").innerHTML = POTIONS.map((p) => {
      const fin = e.actives[p.id];
      return `
        <div class="potion ${fin ? "potion--active" : ""}" style="--potion: ${p.couleur}">
          <span class="potion__icone">${ICONE_POTION}<span class="potion__stock">${e.potions[p.id]}</span></span>
          <span class="potion__texte"><b>${p.nom}</b><span>${p.effet}${p.minutes ? ` · ${p.minutes} min` : ""}</span>${fin ? `<span class="potion__minuteur" data-fin="${fin}">Active : ${dureeCourte(fin - Date.now())}</span>` : ""}</span>
          <span class="potion__actions">
            <button type="button" class="bouton bouton--obi-petit" data-autel="boire" data-potion="${p.id}" ${e.potions[p.id] > 0 ? "" : "disabled"}>${p.id === "lune" ? "Relancer" : fin ? "Rallonger" : "Boire"}</button>
            <button type="button" class="bouton-texte" data-autel="distiller" data-potion="${p.id}" ${e.poussiere >= p.poussiere ? "" : "disabled"} title="Fabriquer avec la poussière d'atelier (tu en as ${nombre(e.poussiere)})">Distiller · ${p.poussiere} poussière</button>
          </span>
        </div>`;
    }).join("");
  }

  function rendreHistorique() {
    $("#autel-seance").innerHTML = seance.invocations
      ? `Cette séance : <b>${seance.invocations}</b> invocation${seance.invocations > 1 ? "s" : ""} · <b>${seance.nouveaux}</b> nouveau${seance.nouveaux > 1 ? "x" : ""} · ${ORDRE_RARETES.slice(0, 3).filter((r) => seance.parRarete[r]).map((r) => `<span class="autel__taux autel__taux--${r}">${seance.parRarete[r]} ${RARETES[r].nom}${seance.parRarete[r] > 1 ? "s" : ""}</span>`).join(" ")}`
      : "Rien encore cette séance.";
    $("#autel-historique").innerHTML = historique.map((c) => {
      const p = PERSOS_PAR_ID[c.id];
      return `<li class="autel__trace autel__trace--${c.rarete} ${c.variante ? `autel__trace--${c.variante}` : ""}" style="${varsSerie(p.serie)}" title="${p.nom} · ${RARETES[c.rarete].nom}${c.variante ? ` · ${nomBordure(c.variante)}` : ""}${c.nouveau ? " · nouveau" : ""}">
        <b>${styleSerie(p.serie).abrege}</b><span>${p.nom}</span>${c.nouveau ? '<i aria-label="nouveau">N</i>' : ""}</li>`;
    }).join("");
  }

  function rendreTaux() {
    const base = tableAvecChance(1);
    $("#autel-taux").innerHTML = `
      <details class="taux">
        <summary>Voir les taux, les bordures et l'Index</summary>
        <p>Taux de base par invocation : ${ORDRE_RARETES.map((r) => `${RARETES[r].nom} ${pourcent(base[r])}`).join(", ")}. La chance multiplie les Rares, Épiques et Légendaires ; le Commun recule d'autant. Un Légendaire est garanti à la ${PITIE_INVOCATION}e invocation sans Légendaire.</p>
        <p>Bordures (même force, autre cadre) : ${BORDURES.slice().reverse().map((b) => `${b.nom} ${pourcent(b.chance)}`).join(", ")}. La potion de bordure triple ces chances.</p>
        <p>L'Index rend chanceux pour toujours : +${pourcent(CHANCE_SERIE_COMPLETE)} par série complète, +${pourcent(CHANCE_EDITION_COMPLETE)} par édition complète, un peu pour chaque bordure, +${pourcent(CHANCE_BOSS_ARENE)} par boss de l'Arène vaincu, +${pourcent(CHANCE_MONDE_FINI)} par monde dont les 8 boss sont tombés, et des bonus pour le record de la Tour et les éveils.</p>
        <p>Phases de l'autel : toutes les ${MINUTES_PAR_PHASE} minutes, la même pour tous les joueurs. ${PHASES.map((x) => `<b>${x.nom}</b> (${x.texte.replace(/\.$/, "")})`).join(", ")}. La potion de lune relance la phase jusqu'au prochain changement.</p>
        <p>Réserve : ${INVOCATIONS_MAX} invocations, +1 toutes les ${MINUTES_PAR_INVOCATION} min et +${INVOCATIONS_VICTOIRE} par combat gagné (${pourcent(CHANCE_POTION_VICTOIRE)} des victoires donnent aussi une potion). Un doublon d'un perso déjà à 5 étoiles donne de la poussière (${ORDRE_RARETES.slice().reverse().map((r) => `${RARETES[r].nom} ${POUSSIERE_DOUBLON_INVOCATION[r]}`).join(", ")}).</p>
      </details>`;
  }

  function rendrePhase() {
    const ph = etatInvocations().phase;
    const z = $("#autel-phase");
    z.className = `autel__phase autel__phase--${ph.id}`;
    z.innerHTML = `<b>${ph.nom}</b><span>${ph.serie ? `${ph.serie} à l'honneur : 3 fois plus de chances` : ph.texte}</span><small data-phase-fin="${ph.fin}">${ph.relancee ? "relancée · " : ""}change dans ${dureeCourte(ph.fin - Date.now())}</small>`;
    $("#autel-scene").dataset.phase = ph.id;
  }

  function rendreTout() {
    rendrePhase();
    rendreMondes();
    rendreReserve();
    rendreChance();
    rendreNiveau();
    rendrePotions();
    rendreHistorique();
    rendreTaux();
  }

  // ---------- Effets ----------

  const COULEURS_ECLATS = { rare: ["#5fa8ff", "#cfe4ff"], epique: ["#b38cff", "#efe4ff", "#ff9bd8"], legendaire: ["#ffd23f", "#fff3b0", "#ff9f1c", "#ffffff"] };

  function eclater(rarete, bordure) {
    if (mouvementReduit) return;
    const couleurs = BORDURES_RARES.includes(bordure) ? ["#ff7a7a", "#ffd36e", "#8affc1", "#7ab8ff", "#d38aff", "#ffffff"] : COULEURS_ECLATS[rarete];
    if (!couleurs) return;
    const boite = document.createElement("span");
    boite.className = "eclats-particules autel__eclats";
    const n = rarete === "legendaire" || bordure ? 40 : rarete === "epique" ? 24 : 12;
    boite.innerHTML = Array.from({ length: n }, (_, k) => {
      const angle = (k / n) * 360 + Math.random() * 20;
      const distance = (rarete === "legendaire" ? 150 : 90) + Math.random() * 80;
      return `<span style="--a: ${angle}deg; --d: ${distance}px; --t: ${4 + Math.random() * 7}px; --c: ${couleurs[k % couleurs.length]}; --delai: ${Math.random() * 100}ms"></span>`;
    }).join("");
    $("#autel-scene").appendChild(boite);
    setTimeout(() => boite.remove(), 1300);
  }

  function secouer(force) {
    if (mouvementReduit) return;
    $("#autel-scene").animate(
      [{ transform: "translate(0,0)" }, { transform: `translate(${-7 * force}px, ${4 * force}px)` }, { transform: `translate(${6 * force}px, ${-4 * force}px)` }, { transform: "translate(0,0)" }],
      { duration: 340, easing: "ease-out" });
  }

  function texteCarte(c) {
    const b = c.variante && c.nouvelleVariante ? ` + bordure ${nomBordure(c.variante)} !` : c.variante ? ` · ${nomBordure(c.variante)}` : "";
    if (c.nouveau) return `Nouveau perso !${b}`;
    if (c.poussiere) return `Déjà au maximum : +${c.poussiere} poussière${b}`;
    if (c.etoilesApres > c.etoilesAvant) return `${c.etoilesApres}e étoile !${b}`;
    return `Doublon ${c.doublons}/${c.besoin} vers l'étoile suivante${b}`;
  }

  // Une ou trois cartes sortent du sceau
  async function montrer(cartes) {
    const scene = $("#autel-scene");
    const meilleure = cartes.reduce((a, b) => (RARETES[b.rarete].ordre > RARETES[a.rarete].ordre ? b : a));
    const grosse = meilleure.rarete === "legendaire" || meilleure.rarete === "epique";
    const bordureRare = cartes.find((c) => BORDURES_RARES.includes(c.variante));
    scene.dataset.rarete = meilleure.rarete;
    scene.classList.remove("autel__scene--jaillit");
    // Le sceau s'emballe avant une grosse carte
    if (grosse && !mouvementReduit) {
      scene.classList.add("autel__scene--suspense");
      sonSuspense();
      await pause(meilleure.rarete === "legendaire" ? 900 : 450);
      scene.classList.remove("autel__scene--suspense");
    }
    $("#autel-carte").innerHTML = cartes.map((c) => `
      <span class="autel__sortie autel__sortie--${c.rarete} ${c.variante ? `tome--${c.variante}` : ""}">
        ${htmlCarteStatique(PERSOS_PAR_ID[c.id], { progression: { ...progressionDe(c.id), variantes: c.variante ? [c.variante] : [] } })}
        ${c.nouveau ? '<span class="tampon">Nouveau</span>' : ""}
        ${c.variante ? `<span class="badge-variante badge-variante--${c.variante} autel__badge">${nomBordure(c.variante)}</span>` : ""}
      </span>`).join("");
    $("#autel-carte").classList.toggle("autel__carte--trois", cartes.length > 1);
    chargerPortraits((id) => rafraichirPortrait(zone, id));
    void scene.offsetWidth;
    scene.classList.add("autel__scene--jaillit");
    sonCarte();
    sonRarete(meilleure.rarete);
    if (cartes.some((c) => c.nouveau)) setTimeout(sonNouveau, 220);
    if (RARETES[meilleure.rarete].ordre >= 3 || bordureRare) eclater(meilleure.rarete, bordureRare?.variante);
    $("#autel-resultat").innerHTML = cartes.length === 1
      ? `<b class="autel__nom-${meilleure.rarete}">${PERSOS_PAR_ID[meilleure.id].nom}</b> · ${RARETES[meilleure.rarete].nom} · ${texteCarte(meilleure)}`
      : cartes.map((c) => `<span><b class="autel__nom-${c.rarete}">${PERSOS_PAR_ID[c.id].nom}</b> ${c.nouveau ? "(nouveau)" : ""}</span>`).join(" · ");
    if (meilleure.rarete === "legendaire" || bordureRare) {
      secouer(1.3);
      if (!mouvementReduit) {
        const flash = document.createElement("span");
        flash.className = "flash-legendaire";
        scene.appendChild(flash);
        flash.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 800 }).onfinish = () => flash.remove();
        const ono = document.createElement("span");
        ono.className = "onomatopee autel__onomatopee";
        ono.textContent = bordureRare ? nomBordure(bordureRare.variante).toUpperCase() : ONOMATOPEES[Math.floor(Math.random() * ONOMATOPEES.length)];
        scene.appendChild(ono);
        setTimeout(() => ono.remove(), 1600);
      }
      await pause(mouvementReduit ? 200 : 1300);   // on savoure, meme en automatique
    } else if (meilleure.rarete === "epique") {
      secouer(0.6);
      await pause(mouvementReduit ? 100 : 600);
    }
  }

  // ---------- Annonces dans le chat (General) des tirages tres rares ----------
  let derniereAnnonce = 0;
  function annoncerDansLeChat(cartes) {
    if (!connecte() || !reglage("annonces") || Date.now() - derniereAnnonce < 30000) return;
    const c = cartes.find((x) => ["arcenciel", "neant"].includes(x.variante) || (x.rarete === "legendaire" && x.variante));
    if (!c) return;
    derniereAnnonce = Date.now();
    const p = PERSOS_PAR_ID[c.id];
    envoyerMessage("general", `[Autel] vient d'invoquer ${p.nom} ${RARETES[c.rarete].nom}${c.variante ? `, bordure ${nomBordure(c.variante)}` : ""} !`).catch(() => {});
  }

  // ---------- Invoquer ----------

  async function invoquer(nombreCartes = 1) {
    if (enCours) return false;
    const attente = prochainPossible - Date.now();
    if (attente > 0) await pause(attente);
    if (!zone.isConnected) return false;
    const r = invoquerJoueur(nombreCartes);
    if (!r) { rendreReserve(); return false; }
    enCours = true;
    const e = etatInvocations();
    prochainPossible = Date.now() + e.delai;
    const bouton = $("[data-autel='invoquer']");
    bouton.style.setProperty("--delai", `${e.delai}ms`);
    bouton.classList.remove("autel__invoquer--recharge");
    void bouton.offsetWidth;
    bouton.classList.add("autel__invoquer--recharge");
    for (const c of r.cartes) {
      historique.unshift(c);
      seance.invocations += 1;
      if (c.nouveau) seance.nouveaux += 1;
      seance.parRarete[c.rarete] = (seance.parRarete[c.rarete] ?? 0) + 1;
    }
    historique.length = Math.min(historique.length, HISTORIQUE_MAX);
    rendreReserve();
    await montrer(r.cartes);
    enCours = false;
    if (!zone.isConnected) return false;
    rendreHistorique();
    // Nouveau niveau d'autel, series completes : on le dit
    const annonces = [];
    if (r.niveauGagne) annonces.push(`Niveau d'autel ${r.niveauGagne.niveau} : +${r.niveauGagne.points} points à placer${r.niveauGagne.texte ? `, ${r.niveauGagne.texte} débloquée !` : ""}`);
    annoncerDansLeChat(r.cartes);
    for (const x of r.completions) annonces.push(`${x.type === "edition" ? "Édition" : "Série"} complète : ${x.nom} ! +${x.recompense.dores} booster${x.recompense.dores > 1 ? "s" : ""} doré${x.recompense.dores > 1 ? "s" : ""}, +${x.recompense.encre} d'encre`);
    for (const c of r.cartes.filter((x) => x.nouveau)) {
      const { n, total } = progressionSerie(PERSOS_PAR_ID[c.id].serie);
      if (n === total) continue;
      if (n >= total - 1) annonces.push(`${PERSOS_PAR_ID[c.id].serie} : plus qu'une carte pour la série complète !`);
    }
    if (annonces.length) {
      const p = document.createElement("p");
      p.className = "autel__annonce";
      p.textContent = annonces.join(" · ");
      $("#autel-scene").appendChild(p);
      setTimeout(() => p.remove(), 3200);
      if (r.completions.length || r.niveauGagne) sonComplete();
    }
    if (r.niveauGagne || r.completions.length || r.cartes.some((c) => c.nouveau)) { rendreNiveau(); rendreChance(); rendreMondes(); }
    rendrePotions();
    annoncerTampons(verifierTampons());
    majEncre?.();
    return true;
  }

  async function boucleAuto() {
    while (auto && zone.isConnected) {
      const ok = await invoquer(etatInvocations().pouvoirs.triple && etatInvocations().reserve >= 3 ? 3 : 1);
      if (!ok) break;
    }
    if (auto) arreterAuto();
  }

  function arreterAuto() {
    auto = false;
    if (zone.isConnected) rendreReserve();
  }

  zone.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-autel]");
    if (!b || b.disabled) return;
    const a = b.dataset.autel;
    if (a === "invoquer" && !auto) invoquer(1);
    if (a === "triple" && !auto) invoquer(3);
    if (a === "auto") {
      auto = !auto;
      rendreReserve();
      if (auto) boucleAuto();
    }
    if (a === "monde" && choisirMonde(b.dataset.edition)) { rendreMondes(); }
    if (a === "boire" && boirePotion(b.dataset.potion)) { rendrePotions(); rendrePhase(); rendreChance(); rendreReserve(); }
    if (a === "index") { arreterAuto(); return naviguer?.("collection", { onglet: "index" }); }
    if (a === "point" && placerPointAutel(b.dataset.branche)) { rendreNiveau(); rendreChance(); }
    if (a === "redistribuer" && redistribuerPointsAutel()) { rendreNiveau(); rendreChance(); rendrePotions(); }
    if (a === "distiller" && fabriquerPotion(b.dataset.potion)) { rendrePotions(); majEncre?.(); }
  });

  // Les minuteurs (reserve, potions) avancent chaque seconde
  const minuteur = setInterval(() => {
    if (!zone.isConnected) { auto = false; return clearInterval(minuteur); }
    const e = etatInvocations();
    zone.querySelectorAll(".potion__minuteur").forEach((m) => {
      const reste = Number(m.dataset.fin) - Date.now();
      if (reste <= 0) { rendrePotions(); rendreChance(); } else m.textContent = `Active : ${dureeCourte(reste)}`;
    });
    if (!enCours) rendreReserve();
    const finPhase = zone.querySelector("[data-phase-fin]");
    if (finPhase) {
      const reste = Number(finPhase.dataset.phaseFin) - Date.now();
      if (reste <= 0) { rendrePhase(); rendreChance(); }
      else finPhase.textContent = `${e.phase.relancee ? "relancée · " : ""}change dans ${dureeCourte(reste)}`;
    }
  }, 1000);

  rendreTout();
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}
