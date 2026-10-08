// ==========================================================
// ECRAN DES BOOSTERS
// La seule facon d'obtenir des persos : ouvrir des boosters.
// Chaque edition a ses series ; un booster = 3 cartes. Les cartes
// se retournent une par une, l'obi annonce la rarete d'abord.
// L'atelier fabrique la carte de son choix avec la poussiere.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES, ORDRE_RARETES } from "../donnees/raretes.js";
import { ETOILES_MAX } from "../donnees/progression.js";
import {
  EDITIONS, CASES_BOOSTER, CHANCE_BOOSTER_DORE, PITIE_BOOSTER, CHANCE_HOLO, CHANCE_DOREE,
  STOCK_GRATUIT_MAX, POUSSIERE_PAR_BOOSTER, COUT_FABRICATION, CARTES_PAR_BOOSTER,
} from "../donnees/boosters.js";
import { styleSerie, varsSerie, motifSerie } from "../donnees/series.js";
import { serieDeLaSemaine } from "../donnees/hebdo.js";
import {
  encre, idsPossedes, possede, progressionDe, etatBoosters, ouvrirBoosterJoueur, fabriquerCarte, coutFabrication,
  verifierTampons,
} from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait } from "../ui/cartes.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";
import { htmlSachet } from "../ui/sachet.js";
import { annoncerTampons } from "../ui/toast.js";

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const pourcent = (x) => `${(x * 100).toFixed(x < 0.1 ? 1 : 0).replace(".", ",")} %`;
const ONOMATOPEES_LEGENDAIRE = ["ゴゴゴ", "ドドド", "ズドン"];

const persosEdition = (edition) => PERSOS.filter((p) => edition.series.includes(p.serie));

function duree(ms) {
  const minutes = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(minutes / 60);
  return h ? `${h} h ${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`;
}

export function afficherTirages(conteneur, { naviguer }) {
  const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const serie = serieDeLaSemaine();
  let revelation = null;     // { edition, cartes, reveles, dore }
  let vue = "boutique";      // boutique | atelier
  let filtreAtelier = "manquants";
  let messageAtelier = "";

  conteneur.innerHTML = `
    ${htmlNavigation("tirages")}
    <div class="tirages">
      <header class="tirages__entete">
        <h1 class="equipe__titre">Boosters</h1>
        <div class="boosters__onglets" role="tablist" aria-label="Boosters">
          <button type="button" class="bouton bouton--clair" role="tab" data-action="vue" data-vue="boutique">Ouvrir des boosters</button>
          <button type="button" class="bouton bouton--clair" role="tab" data-action="vue" data-vue="atelier">Atelier</button>
        </div>
      </header>
      <section class="boosters__reserve" id="reserve" aria-live="polite"></section>
      <div id="vue-boosters"></div>
    </div>
    <div id="revelation"></div>
  `;

  const $ = (sel) => conteneur.querySelector(sel);
  const majEncre = brancherNavigation(conteneur, naviguer, "tirages");

  // ---------- Reserve : tickets, encre, poussiere, pitie ----------

  function rendreReserve() {
    const b = etatBoosters();
    const prochain = b.stockPlein
      ? `Réserve de tickets gratuits pleine (${STOCK_GRATUIT_MAX}) : ouvre-les !`
      : `Prochain ticket gratuit dans ${duree(b.prochainGratuit - Date.now())}.`;
    $("#reserve").innerHTML = `
      <div class="reserve__case"><span class="reserve__chiffre">${b.tickets}${b.dores ? ` + ${b.dores} doré${b.dores > 1 ? "s" : ""}` : ""}</span><span class="reserve__nom">ticket${b.tickets > 1 ? "s" : ""} de booster</span></div>
      <div class="reserve__case"><span class="reserve__chiffre">${nombre(encre())}</span><span class="reserve__nom">encre (${nombre(b.prix)} le booster)</span></div>
      <div class="reserve__case"><span class="reserve__chiffre">${nombre(b.poussiere)}</span><span class="reserve__nom">poussière pour l'atelier</span></div>
      <p class="reserve__aide">${prochain} Un Légendaire est garanti dans <strong>${b.avantLegendaire}</strong> booster${b.avantLegendaire > 1 ? "s" : ""} au plus. Des tickets se gagnent aussi en finissant un chapitre de campagne et avec le bonus des missions du jour ; l'encre se gagne en combattant.</p>
      <p class="etal__honneur"><strong>À l'honneur cette semaine : ${serie}.</strong> Ses persos ont deux fois plus de chances de sortir dans leur rareté.</p>`;
  }

  // ---------- Boutique : une edition = un booster ----------

  function htmlBooster(edition) {
    const persos = persosEdition(edition);
    const obtenus = persos.filter((p) => possede(p.id)).length;
    const b = etatBoosters();
    const payer = b.dores > 0 ? "Ouvrir · booster doré !" : b.tickets > 0 ? "Ouvrir · 1 ticket" : `Ouvrir · ${nombre(b.prix)} d'encre`;
    const peutOuvrir = b.dores > 0 || b.tickets > 0 || encre() >= b.prix;
    return `
      <article class="booster">
        <button type="button" class="booster__bouton-sachet" data-action="ouvrir" data-edition="${edition.id}" ${peutOuvrir ? "" : "disabled"}
          aria-label="Ouvrir un booster ${edition.nom} (${b.tickets > 0 ? "1 ticket" : `${nombre(b.prix)} d'encre`})">
          ${htmlSachet(edition)}
        </button>
        <div class="booster__texte">
          <p class="booster__accroche">${edition.texte}</p>
          <p class="booster__series">${edition.series.map((x) => `<span class="sigle" style="${varsSerie(x)}">${styleSerie(x).abrege}</span>`).join("")}</p>
          <p class="booster__progression"><strong>${obtenus}</strong> / ${persos.length} persos</p>
          <span class="barre-xp"><span class="barre-xp__rempli barre-pitie" style="--xp: ${obtenus / persos.length}"></span></span>
          <button type="button" class="bouton bouton--principal booster__ouvrir" data-action="ouvrir" data-edition="${edition.id}" ${peutOuvrir ? "" : "disabled"}>${payer}</button>
        </div>
      </article>`;
  }

  function htmlTaux() {
    const nomsCases = CASES_BOOSTER.map((_, i) => `Carte ${i + 1}`);
    const cases = CASES_BOOSTER;
    const ordre = ORDRE_RARETES.slice().reverse();
    return `
      <details class="taux">
        <summary>Voir les taux et les garanties</summary>
        <div class="defile">
          <table>
            <thead><tr><th>Case</th>${ordre.map((r) => `<th class="nombre">${RARETES[r].nom}</th>`).join("")}</tr></thead>
            <tbody>
              ${cases.map((c, i) => `<tr><td>${nomsCases[i]}</td>${ordre.map((r) => `<td class="nombre">${c[r] ? pourcent(c[r]) : "–"}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </div>
        <p>Chaque carte a ${pourcent(CHANCE_HOLO)} de chances d'être Holo et ${pourcent(CHANCE_DOREE)} d'être Dorée : même force, autre cadre, à collectionner. Un booster sur ${Math.round(1 / CHANCE_BOOSTER_DORE)} est un booster doré (${CARTES_PAR_BOOSTER} cartes Épiques ou Légendaires). Un Légendaire est garanti au ${PITIE_BOOSTER}e booster sans Légendaire. Chaque booster donne ${POUSSIERE_PAR_BOOSTER} poussière. Un doublon fait monter les étoiles du perso ; au-delà de ${ETOILES_MAX} étoiles, il se change en poussière.</p>
      </details>`;
  }

  function rendreBoutique() {
    $("#vue-boosters").innerHTML = `
      <div class="boosters__grille">${EDITIONS.map(htmlBooster).join("")}</div>
      ${htmlTaux()}`;
  }

  // ---------- Atelier : fabriquer une carte avec la poussiere ----------

  function rendreAtelier() {
    const b = etatBoosters();
    const liste = PERSOS.filter((p) => filtreAtelier === "tous" || !possede(p.id))
      .sort((a, c) => RARETES[a.rarete].ordre - RARETES[c.rarete].ordre || a.nom.localeCompare(c.nom));
    const ordre = ORDRE_RARETES.slice().reverse();
    $("#vue-boosters").innerHTML = `
      <section class="atelier">
        <p class="case__aide">La poussière vient des boosters (${POUSSIERE_PAR_BOOSTER} par booster) et des doublons d'un perso déjà à ${ETOILES_MAX} étoiles. Coût : ${ordre.map((r) => `${RARETES[r].nom} ${nombre(COUT_FABRICATION[r])}`).join(", ")}.</p>
        <div class="choix-segmente choix-segmente--gauche" role="radiogroup" aria-label="Persos affichés">
          <button type="button" role="radio" class="choix-segmente__option" data-action="filtre-atelier" data-valeur="manquants" aria-checked="${filtreAtelier === "manquants"}">Persos manquants</button>
          <button type="button" role="radio" class="choix-segmente__option" data-action="filtre-atelier" data-valeur="tous" aria-checked="${filtreAtelier === "tous"}">Tous (pour les étoiles)</button>
        </div>
        <p class="case__message" role="status" aria-live="polite">${messageAtelier}</p>
        <div class="atelier__grille">
          ${liste.length ? liste.map((p) => {
            const cout = coutFabrication(p.id);
            const prog = possede(p.id) ? progressionDe(p.id) : null;
            const bloque = b.poussiere < cout || (prog && prog.etoiles >= ETOILES_MAX);
            return `
              <div class="atelier__carte" data-motif="${motifSerie(p.serie)}" style="${varsSerie(p.serie)}">
                <span class="atelier__portrait">${htmlPortrait(p)}<span class="obi-rarete obi-rarete--${p.rarete}">${RARETES[p.rarete].nom}</span></span>
                <span class="atelier__nom">${p.nom}</span>
                <span class="atelier__info">${p.serie}${prog ? ` · ${prog.etoiles} étoile${prog.etoiles > 1 ? "s" : ""}` : ""}</span>
                <button type="button" class="bouton bouton--obi-petit" data-action="fabriquer" data-perso="${p.id}" ${bloque ? "disabled" : ""}>${nombre(cout)} poussière</button>
              </div>`;
          }).join("") : '<p class="case__aide">Tu as tous les persos ! Choisis « Tous » pour fabriquer des doublons et gagner des étoiles.</p>'}
        </div>
      </section>`;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
  }

  function rendre() {
    rendreReserve();
    conteneur.querySelectorAll("[data-action='vue']").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.vue === vue)));
    if (vue === "atelier") rendreAtelier();
    else rendreBoutique();
    majEncre?.();
  }

  // ---------- Revelation des cartes ----------

  function texteResultat(c) {
    const variante = c.nouvelleVariante ? ` + version ${c.variante === "doree" ? "Dorée" : "Holo"} !` : "";
    if (c.nouveau) return `Nouveau perso${variante}`;
    if (c.poussiere) return `Déjà au maximum : +${c.poussiere} poussière${variante}`;
    if (c.etoilesApres > c.etoilesAvant) return `${c.etoilesApres}e étoile !${variante}`;
    return `Doublon : ${c.doublons} sur ${c.besoin} pour l'étoile suivante${variante}`;
  }

  function htmlCarteRevelee(c, index) {
    const perso = PERSOS_PAR_ID[c.id];
    return `
      <button type="button" class="tome tome--${c.rarete} ${c.variante ? `tome--${c.variante}` : ""}" data-action="reveler" data-index="${index}"
        aria-label="Carte ${index + 1}, à révéler" style="--i: ${index}">
        <span class="tome__interieur">
          <span class="tome__face tome__face--dos">
            <span class="tome__logo">Crossover</span>
            <span class="tome__obi"><span class="tome__obi-texte">${RARETES[c.rarete].nom}</span></span>
          </span>
          <span class="tome__face tome__face--avant" data-motif="${motifSerie(perso.serie)}" style="${varsSerie(perso.serie)}">
            ${htmlPortrait(perso)}
            <span class="serie-bande" aria-hidden="true"></span>
            <span class="tome__titre">${perso.nom}</span>
            <span class="obi-rarete obi-rarete--${c.rarete}">${RARETES[c.rarete].nom}</span>
            ${c.nouveau ? '<span class="tampon">Nouveau</span>' : ""}
            ${c.variante ? `<span class="badge-variante badge-variante--${c.variante} tome__variante">${c.variante === "doree" ? "Dorée" : "Holo"}</span>` : ""}
          </span>
        </span>
        <span class="tome__resultat">${texteResultat(c)}</span>
      </button>`;
  }

  async function reveler(index, rapide = false) {
    const etat = revelation;
    if (!etat || etat.reveles.has(index)) return;
    etat.reveles.add(index);
    const carte = $(`.tome[data-index="${index}"]`);
    const c = etat.cartes[index];
    const perso = PERSOS_PAR_ID[c.id];
    carte.classList.add("tome--obi");
    if (!rapide && !mouvementReduit) await pause(c.rarete === "legendaire" ? 900 : c.rarete === "epique" ? 600 : 380);
    carte.classList.add("tome--revele");
    carte.setAttribute("aria-label", `${perso.nom}, ${RARETES[c.rarete].nom}. ${texteResultat(c)}`);
    if (c.rarete === "legendaire" && !rapide) {
      const flash = document.createElement("span");
      flash.className = "flash-legendaire";
      $("#revelation .revelation").appendChild(flash);
      flash.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 700 }).onfinish = () => flash.remove();
      const ono = document.createElement("span");
      ono.className = "onomatopee onomatopee--tome";
      ono.textContent = ONOMATOPEES_LEGENDAIRE[Math.floor(Math.random() * ONOMATOPEES_LEGENDAIRE.length)];
      carte.appendChild(ono);
    }
    if (etat.reveles.size === etat.cartes.length) terminerRevelation();
  }

  function terminerRevelation() {
    const etat = revelation;
    const nouveaux = etat.cartes.filter((c) => c.nouveau).length;
    const etoiles = etat.cartes.filter((c) => c.etoilesApres > c.etoilesAvant).length;
    const variantes = etat.cartes.filter((c) => c.nouvelleVariante).length;
    const resume = [
      nouveaux ? `${nouveaux} nouveau${nouveaux > 1 ? "x" : ""} perso${nouveaux > 1 ? "s" : ""}` : null,
      etoiles ? `${etoiles} étoile${etoiles > 1 ? "s" : ""} gagnée${etoiles > 1 ? "s" : ""}` : null,
      variantes ? `${variantes} nouvelle${variantes > 1 ? "s" : ""} version${variantes > 1 ? "s" : ""}` : null,
    ].filter(Boolean).join(", ") || "Que des doublons, cette fois";
    $("#revelation-resume").textContent = `${resume}. +${POUSSIERE_PAR_BOOSTER} poussière. Collection : ${idsPossedes().length} sur ${PERSOS.length}.`;
    $("#revelation-actions").hidden = false;
    $("#tout-reveler").hidden = true;
    const b = etatBoosters();
    $("#revelation [data-action='ouvrir']").disabled = !(b.dores > 0 || b.tickets > 0 || encre() >= b.prix);
    annoncerTampons(verifierTampons());
    rendre();
  }

  async function ouvrir(editionId) {
    const r = ouvrirBoosterJoueur(editionId);
    if (!r) return rendre();
    rendre();
    const edition = EDITIONS.find((e) => e.id === editionId);
    revelation = { edition, cartes: r.cartes, reveles: new Set(), dore: r.dore };
    $("#revelation").innerHTML = `
      <div class="revelation ${r.dore ? "revelation--doree" : ""}" role="dialog" aria-modal="true" aria-labelledby="titre-revelation">
        <h2 class="revelation__titre" id="titre-revelation">${r.dore ? "Booster doré !" : `Booster ${edition.nom}`}</h2>
        <div class="revelation__sachet" id="sachet-ouverture">${htmlSachet(edition, { attributs: r.dore ? 'data-dore="1"' : "" })}</div>
        <div class="revelation__tomes revelation__tomes--dix" id="cartes-booster" hidden>
          ${r.cartes.map(htmlCarteRevelee).join("")}
        </div>
        <p class="revelation__resume" id="revelation-resume" role="status" aria-live="polite"></p>
        <div class="revelation__barre">
          <button type="button" class="bouton bouton--clair" id="tout-reveler" data-action="tout-reveler">Tout révéler</button>
          <div class="revelation__actions" id="revelation-actions" hidden>
            <button type="button" class="bouton bouton--secondaire" data-action="ouvrir" data-edition="${editionId}">Encore un booster</button>
            <button type="button" class="bouton bouton--clair" data-action="fermer">Fermer</button>
          </div>
        </div>
      </div>`;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
    $("#tout-reveler").focus({ preventScroll: true });
    const etat = revelation;
    // Le sachet tremble, se dechire, puis les cartes sortent
    if (!mouvementReduit) {
      const sachet = $("#sachet-ouverture .sachet");
      sachet.classList.add("sachet--tremble");
      await pause(650);
      sachet.classList.add("sachet--dechire");
      await pause(550);
    }
    if (revelation !== etat) return;
    $("#sachet-ouverture").hidden = true;
    $("#cartes-booster").hidden = false;
    await pause(mouvementReduit ? 100 : 450);
    for (let i = 0; i < r.cartes.length; i++) {
      if (revelation !== etat) return;
      await reveler(i);
      if (!mouvementReduit) await pause(200);
    }
  }

  function fermer() {
    revelation = null;
    $("#revelation").innerHTML = "";
    rendre();
  }

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible || cible.disabled) return;
    const action = cible.dataset.action;
    if (action === "vue") { vue = cible.dataset.vue; messageAtelier = ""; rendre(); }
    if (action === "ouvrir") ouvrir(cible.dataset.edition);
    if (action === "reveler") reveler(Number(cible.dataset.index), true);
    if (action === "tout-reveler" && revelation) {
      $("#sachet-ouverture").hidden = true;
      $("#cartes-booster").hidden = false;
      revelation.cartes.forEach((_, i) => reveler(i, true));
    }
    if (action === "fermer") fermer();
    if (action === "filtre-atelier") { filtreAtelier = cible.dataset.valeur; rendreAtelier(); }
    if (action === "fabriquer") {
      const r = fabriquerCarte(cible.dataset.perso);
      const perso = PERSOS_PAR_ID[cible.dataset.perso];
      messageAtelier = r.ok ? `${perso.nom} fabriqué : ${texteResultat(r.carte)}` : r.erreur;
      if (r.ok) annoncerTampons(verifierTampons());
      rendre();
    }
  });

  conteneur.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && revelation && !$("#revelation-actions")?.hidden) fermer();
  });

  // Le compte a rebours se met a jour ; quand un ticket gratuit arrive, tout l'ecran suit
  let ticketsAffiches = etatBoosters().tickets;
  const minuteur = setInterval(() => {
    if (!conteneur.isConnected) return clearInterval(minuteur);
    if (revelation) return;
    const tickets = etatBoosters().tickets;
    if (tickets !== ticketsAffiches) { ticketsAffiches = tickets; rendre(); }
    else rendreReserve();
  }, 30000);

  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
  rendre();
}
