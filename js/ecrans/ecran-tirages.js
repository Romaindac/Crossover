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
  verifierTampons, progressionSerie, prochaineFusion, fusionner,
} from "../services/partie.js";
import { FUSION } from "../donnees/invocations.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait, htmlCarteStatique, nomBordure } from "../ui/cartes.js";
import { htmlEntete, htmlOnglet } from "../ui/entete.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";
import { htmlSachet } from "../ui/sachet.js";
import { annoncerTampons } from "../ui/toast.js";
import { afficherAutel } from "../ui/autel.js";
import { sonDechirure, sonCarte, sonSuspense, sonRarete, sonNouveau, sonComplete } from "../ui/sons.js";

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
  let vue = "autel";         // autel | boutique | atelier
  let filtreAtelier = "manquants";
  let messageAtelier = "";

  conteneur.innerHTML = `
    ${htmlNavigation("tirages")}
    <div class="tirages">
      ${htmlEntete({
        titre: "Invocations", kanji: "召喚", theme: "invocations", classe: "tirages__entete",
        accroche: "L'autel pour invoquer, les boosters, et l'atelier pour fabriquer ce qui te manque.",
        onglets: [["autel", "Autel"], ["boutique", "Boosters"], ["atelier", "Atelier"]]
          .map(([id, nom]) => htmlOnglet(nom, { donnees: `data-action="vue" data-vue="${id}"` })).join(""),
      })}
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
    const pitie = (PITIE_BOOSTER - b.avantLegendaire) / PITIE_BOOSTER;
    $("#reserve").innerHTML = `
      <div class="comptoir">
        <div class="comptoir__case comptoir__case--tickets">
          <span class="comptoir__icone" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 7h18v3a2 2 0 000 4v3H3v-3a2 2 0 000-4z" fill="currentColor"/></svg></span>
          <span><span class="comptoir__chiffre">${b.tickets}${b.dores ? `<em> + ${b.dores} doré${b.dores > 1 ? "s" : ""}</em>` : ""}</span><span class="comptoir__nom">ticket${b.tickets > 1 ? "s" : ""} gratuit${b.tickets > 1 ? "s" : ""}</span></span>
        </div>
        <div class="comptoir__case">
          <span class="comptoir__icone comptoir__icone--encre" aria-hidden="true"><span class="compteur-encre__goutte"></span></span>
          <span><span class="comptoir__chiffre">${nombre(encre())}</span><span class="comptoir__nom">encre · ${nombre(b.prix)} le booster</span></span>
        </div>
        <div class="comptoir__case">
          <span class="comptoir__icone comptoir__icone--poussiere" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="currentColor"/></svg></span>
          <span><span class="comptoir__chiffre">${nombre(b.poussiere)}</span><span class="comptoir__nom">poussière d'atelier</span></span>
        </div>
        <div class="comptoir__pitie">
          <span class="comptoir__nom">Légendaire garanti dans <strong>${b.avantLegendaire}</strong> booster${b.avantLegendaire > 1 ? "s" : ""}</span>
          <span class="comptoir__jauge"><span style="--v: ${pitie}"></span></span>
        </div>
      </div>
      <p class="reserve__aide">${prochain} Les chapitres de campagne et les missions du jour donnent aussi des tickets.</p>
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
      <article class="booster" style="--p1: ${edition.couleurs[0]}; --p3: ${edition.couleurs[2]}">
        <button type="button" class="booster__bouton-sachet" data-action="ouvrir" data-edition="${edition.id}" ${peutOuvrir ? "" : "disabled"}
          aria-label="Ouvrir un booster ${edition.nom} (${b.dores > 0 ? "booster doré" : b.tickets > 0 ? "1 ticket" : `${nombre(b.prix)} d'encre`})">
          ${htmlSachet(edition)}
        </button>
        <div class="booster__texte">
          <p class="booster__accroche">${edition.texte}</p>
          <p class="booster__series">${edition.series.map((x) => `<span class="sigle" style="${varsSerie(x)}">${styleSerie(x).abrege}</span>`).join("")}</p>
          <p class="booster__progression"><strong>${obtenus}</strong> / ${persos.length} persos</p>
          <span class="barre-xp"><span class="barre-xp__rempli barre-pitie" style="--xp: ${obtenus / persos.length}"></span></span>
          <button type="button" class="bouton bouton--principal booster__ouvrir" data-action="ouvrir" data-edition="${edition.id}" ${peutOuvrir ? "" : "disabled"}>${payer}</button>
          ${b.dores + b.tickets >= 2 ? `<button type="button" class="bouton bouton--clair bouton--petit-texte booster__multi" data-action="ouvrir" data-edition="${edition.id}" data-nombre="${Math.min(10, b.dores + b.tickets)}">Ouvrir ×${Math.min(10, b.dores + b.tickets)} d'un coup</button>` : ""}
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
      <div class="vitrine-boosters"><div class="boosters__grille">${EDITIONS.map(htmlBooster).join("")}</div></div>
      ${htmlTaux()}`;
  }

  // ---------- Atelier : fabriquer une carte avec la poussiere, ou fusionner ----------

  const htmlOngletsAtelier = () => `
    <div class="choix-segmente choix-segmente--gauche" role="radiogroup" aria-label="Atelier">
      <button type="button" role="radio" class="choix-segmente__option" data-action="filtre-atelier" data-valeur="manquants" aria-checked="${filtreAtelier === "manquants"}">Persos manquants</button>
      <button type="button" role="radio" class="choix-segmente__option" data-action="filtre-atelier" data-valeur="tous" aria-checked="${filtreAtelier === "tous"}">Tous (pour les étoiles)</button>
      <button type="button" role="radio" class="choix-segmente__option" data-action="filtre-atelier" data-valeur="fusion" aria-checked="${filtreAtelier === "fusion"}">Fusion de bordures</button>
    </div>`;

  // La fusion : les doublons au-dela de 5 etoiles forgent une bordure
  function htmlFusion() {
    const liste = idsPossedes().map((id) => ({ p: PERSOS_PAR_ID[id], f: prochaineFusion(id) }))
      .filter((x) => x.p && x.f && x.f.surplus > 0)
      .sort((a, c) => Number(c.f.pret) - Number(a.f.pret) || c.f.surplus / c.f.doublons - a.f.surplus / a.f.doublons);
    return `
      <p class="case__aide">Un perso déjà à ${ETOILES_MAX} étoiles garde ses doublons en réserve (en plus de la poussière). Assez de doublons forgent sa bordure : ${FUSION.map((f) => `${nomBordure(f.bordure)} ${f.doublons}`).join(", ")}.</p>
      <p class="case__message" role="status" aria-live="polite">${messageAtelier}</p>
      <div class="atelier__grille">
        ${liste.length ? liste.map(({ p, f }) => `
          <div class="atelier__carte ${f.pret ? "atelier__carte--prete" : ""}" data-motif="${motifSerie(p.serie)}" style="${varsSerie(p.serie)}">
            <span class="atelier__portrait">${htmlPortrait(p)}<span class="obi-rarete obi-rarete--${p.rarete}">${RARETES[p.rarete].nom}</span></span>
            <span class="atelier__nom">${p.nom}</span>
            <span class="atelier__info">Doublons ${Math.min(f.surplus, f.doublons)} / ${f.doublons} vers <b>${nomBordure(f.bordure)}</b></span>
            <span class="barre-xp"><span class="barre-xp__rempli" style="--xp: ${Math.min(1, f.surplus / f.doublons)}"></span></span>
            <button type="button" class="bouton bouton--obi-petit" data-action="fusionner" data-perso="${p.id}" ${f.pret ? "" : "disabled"}>Fusionner</button>
          </div>`).join("") : `<p class="case__aide">Aucun doublon en réserve pour l'instant : ils arrivent quand un perso à ${ETOILES_MAX} étoiles ressort à l'autel ou dans un booster.</p>`}
      </div>`;
  }

  function rendreAtelier() {
    const b = etatBoosters();
    if (filtreAtelier === "fusion") {
      $("#vue-boosters").innerHTML = `<section class="atelier">${htmlOngletsAtelier()}${htmlFusion()}</section>`;
      chargerPortraits((id) => rafraichirPortrait(conteneur, id));
      return;
    }
    const liste = PERSOS.filter((p) => filtreAtelier === "tous" || !possede(p.id))
      .sort((a, c) => RARETES[a.rarete].ordre - RARETES[c.rarete].ordre || a.nom.localeCompare(c.nom));
    const ordre = ORDRE_RARETES.slice().reverse();
    $("#vue-boosters").innerHTML = `
      <section class="atelier">
        <p class="case__aide">La poussière vient des boosters (${POUSSIERE_PAR_BOOSTER} par booster) et des doublons d'un perso déjà à ${ETOILES_MAX} étoiles. Coût : ${ordre.map((r) => `${RARETES[r].nom} ${nombre(COUT_FABRICATION[r])}`).join(", ")}.</p>
        ${htmlOngletsAtelier()}
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
    conteneur.querySelectorAll("[data-action='vue']").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.vue === vue)));
    $("#reserve").hidden = vue === "autel";
    if (vue === "autel") {
      // L'autel se gere seul : on ne le redessine qu'en y entrant
      if (!$("#vue-boosters .autel")) {
        const zone = document.createElement("div");
        $("#vue-boosters").replaceChildren(zone);
        afficherAutel(zone, { conteneur, majEncre, mouvementReduit, naviguer });
      }
      majEncre?.();
      return;
    }
    rendreReserve();
    if (vue === "atelier") rendreAtelier();
    else rendreBoutique();
    majEncre?.();
  }

  // ---------- Revelation des cartes ----------

  function texteResultat(c) {
    const variante = c.nouvelleVariante ? ` + version ${nomBordure(c.variante)} !` : "";
    if (c.nouveau) return `Nouveau perso${variante}`;
    if (c.poussiere) return `Déjà au maximum : +${c.poussiere} poussière${variante}`;
    if (c.etoilesApres > c.etoilesAvant) return `${c.etoilesApres}e étoile !${variante}`;
    return `Doublon : ${c.doublons} sur ${c.besoin} pour l'étoile suivante${variante}`;
  }

  function htmlCarteRevelee(c, index) {
    const perso = PERSOS_PAR_ID[c.id];
    return `
      <button type="button" class="tome tome--carte tome--${c.rarete} tome--lueur-${c.rarete} ${c.variante ? `tome--${c.variante}` : ""}" data-action="reveler" data-index="${index}"
        aria-label="Carte ${index + 1}, à révéler" style="--i: ${index}; --p1: ${revelation.edition.couleurs[0]}; --p2: ${revelation.edition.couleurs[1]}; --p3: ${revelation.edition.couleurs[2]}">
        <span class="tome__halo" aria-hidden="true"></span>
        <span class="tome__interieur">
          <span class="tome__face tome__face--dos">
            <span class="dos-carte__rayons" aria-hidden="true"></span>
            <span class="dos-carte__cadre" aria-hidden="true"></span>
            <span class="dos-carte__embleme"><span class="dos-carte__logo">Crossover</span><span class="dos-carte__edition">Édition ${revelation.edition.numero}</span></span>
            <span class="tome__obi"><span class="tome__obi-texte">${RARETES[c.rarete].nom}</span></span>
          </span>
          <span class="tome__face tome__face--avant">
            ${htmlCarteStatique(perso, { progression: { ...progressionDe(c.id), variantes: c.variante ? [c.variante] : [] } })}
            ${c.nouveau ? '<span class="tampon">Nouveau</span>' : ""}
            ${c.variante ? `<span class="badge-variante badge-variante--${c.variante} tome__variante">${nomBordure(c.variante)}</span>` : ""}
          </span>
        </span>
        <span class="tome__resultat">${texteResultat(c)}</span>
      </button>`;
  }

  // ---------- Effets : particules, secousse ----------

  const COULEURS_ECLATS = { rare: ["#5fa8ff", "#cfe4ff"], epique: ["#b38cff", "#efe4ff", "#ff9bd8"], legendaire: ["#ffd23f", "#fff3b0", "#ff9f1c", "#ffffff"] };

  function eclater(element, rarete) {
    if (mouvementReduit || !COULEURS_ECLATS[rarete]) return;
    const zone = $("#revelation .revelation");
    const r = element.getBoundingClientRect();
    const z = zone.getBoundingClientRect();
    const boite = document.createElement("span");
    boite.className = "eclats-particules";
    boite.style.left = `${r.left - z.left + r.width / 2}px`;
    boite.style.top = `${r.top - z.top + r.height / 2}px`;
    const n = rarete === "legendaire" ? 42 : rarete === "epique" ? 26 : 14;
    const couleurs = COULEURS_ECLATS[rarete];
    boite.innerHTML = Array.from({ length: n }, (_, k) => {
      const angle = (k / n) * 360 + Math.random() * 20;
      const distance = (rarete === "legendaire" ? 140 : 90) + Math.random() * 90;
      const taille = 4 + Math.random() * (rarete === "legendaire" ? 9 : 6);
      return `<span style="--a: ${angle}deg; --d: ${distance}px; --t: ${taille}px; --c: ${couleurs[k % couleurs.length]}; --delai: ${Math.random() * 120}ms"></span>`;
    }).join("");
    zone.appendChild(boite);
    setTimeout(() => boite.remove(), 1300);
  }

  function secouer(force = 1) {
    if (mouvementReduit) return;
    $("#revelation .revelation")?.animate(
      [{ transform: "translate(0,0)" }, { transform: `translate(${-8 * force}px, ${4 * force}px)` }, { transform: `translate(${7 * force}px, ${-5 * force}px)` }, { transform: `translate(${-4 * force}px, ${3 * force}px)` }, { transform: "translate(0,0)" }],
      { duration: 380, easing: "ease-out" });
  }

  // ---------- Retourner une carte ----------

  async function reveler(index, rapide = false) {
    const etat = revelation;
    if (!etat || etat.phase !== "cartes" || etat.reveles.has(index)) return;
    etat.reveles.add(index);
    const carte = $(`.tome[data-index="${index}"]`);
    const c = etat.cartes[index];
    const perso = PERSOS_PAR_ID[c.id];
    carte.classList.add("tome--obi");
    const grosse = c.rarete === "legendaire" || c.rarete === "epique";
    if (!mouvementReduit) {
      if (grosse && !rapide) {
        carte.classList.add("tome--suspense");
        sonSuspense();
        await pause(c.rarete === "legendaire" ? 1150 : 780);
        carte.classList.remove("tome--suspense");
      } else {
        await pause(rapide ? 60 : 260);
      }
    }
    if (revelation !== etat) return;
    sonCarte();
    carte.classList.add("tome--revele");
    carte.setAttribute("aria-label", `${perso.nom}, ${RARETES[c.rarete].nom}. ${texteResultat(c)}`);
    setTimeout(() => {
      if (!rapide || grosse || etat.reveles.size === etat.cartes.length) sonRarete(c.rarete);
      if (c.nouveau && !rapide) setTimeout(sonNouveau, 260);
      eclater(carte, c.rarete);
      // Des rayons de lumiere derriere les belles cartes (les memes qu'a l'autel)
      if ((c.rarete === "legendaire" || c.rarete === "epique") && !mouvementReduit) {
        const rayons = document.createElement("span");
        rayons.className = `autel__rayons autel__rayons--${c.rarete} tome__rayons`;
        rayons.setAttribute("aria-hidden", "true");
        carte.prepend(rayons);
      }
      if (c.rarete === "legendaire") {
        secouer(1.4);
        const flash = document.createElement("span");
        flash.className = "flash-legendaire";
        $("#revelation .revelation")?.appendChild(flash);
        flash.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 800 }).onfinish = () => flash.remove();
        const ono = document.createElement("span");
        ono.className = "onomatopee onomatopee--tome";
        ono.textContent = ONOMATOPEES_LEGENDAIRE[Math.floor(Math.random() * ONOMATOPEES_LEGENDAIRE.length)];
        carte.appendChild(ono);
      } else if (c.rarete === "epique") {
        secouer(0.6);
      }
    }, mouvementReduit ? 0 : 280);
    if (etat.reveles.size === etat.cartes.length) setTimeout(() => { if (revelation === etat) terminerRevelation(); }, mouvementReduit ? 0 : 650);
  }

  // Tout retourner : les petites d'abord, la plus belle en dernier (avec son suspense)
  async function toutReveler() {
    const etat = revelation;
    if (!etat) return;
    if (etat.phase === "sachet") await dechirer();
    const ordre = etat.cartes.map((c, i) => ({ i, r: ORDRE_RARETES.length - ORDRE_RARETES.indexOf(c.rarete) }))
      .filter(({ i }) => !etat.reveles.has(i)).sort((a, b) => a.r - b.r);
    const derniere = ordre.pop();
    for (const { i } of ordre) {
      if (revelation !== etat) return;
      reveler(i, true);
      await pause(mouvementReduit ? 0 : etat.cartes.length > 6 ? 70 : 140);
    }
    if (derniere && revelation === etat) { await pause(mouvementReduit ? 0 : 300); reveler(derniere.i, false); }
  }

  function terminerRevelation() {
    const etat = revelation;
    if (!etat || etat.fini) return;
    etat.fini = true;
    const nouveaux = etat.cartes.filter((c) => c.nouveau);
    const etoiles = etat.cartes.filter((c) => c.etoilesApres > c.etoilesAvant).length;
    const variantes = etat.cartes.filter((c) => c.nouvelleVariante).length;
    const apres = idsPossedes().length;
    const lignes = [
      nouveaux.length ? `<strong>${nouveaux.length}</strong> nouveau${nouveaux.length > 1 ? "x" : ""} perso${nouveaux.length > 1 ? "s" : ""}` : null,
      etoiles ? `<strong>${etoiles}</strong> étoile${etoiles > 1 ? "s" : ""} gagnée${etoiles > 1 ? "s" : ""}` : null,
      variantes ? `<strong>${variantes}</strong> nouvelle${variantes > 1 ? "s" : ""} version${variantes > 1 ? "s" : ""}` : null,
      `+${POUSSIERE_PAR_BOOSTER * etat.nombre} poussière`,
    ].filter(Boolean);
    const series = [...new Set(nouveaux.map((c) => PERSOS_PAR_ID[c.id].serie))].map((serie) => {
      const { n, total } = progressionSerie(serie);
      return `<span class="bilan__serie ${n === total ? "bilan__serie--complete" : ""}" style="${varsSerie(serie)}"><b>${styleSerie(serie).abrege}</b> ${serie} ${n}/${total}</span>`;
    });
    $("#revelation-resume").innerHTML = `
      <span class="bilan__lignes">${nouveaux.length || etoiles || variantes ? lignes.join(" · ") : `Que des doublons, cette fois · ${lignes.at(-1)}`}</span>
      <span class="bilan__collection">Collection <strong data-compteur="${etat.avant}">${etat.avant}</strong> / ${PERSOS.length}</span>
      ${series.length ? `<span class="bilan__series">${series.join("")}</span>` : ""}
      ${etat.completions.map((x) => `<span class="bilan__complete">${x.type === "edition" ? "Édition complète" : "Série complète"} : ${x.nom} ! +${x.recompense.invocations} invocations, +${x.recompense.encre} d'encre</span>`).join("")}`;
    // Le compteur de collection defile jusqu'au nouveau total
    const compteur = $("#revelation-resume [data-compteur]");
    if (compteur && apres > etat.avant && !mouvementReduit) {
      let v = etat.avant;
      const pas = setInterval(() => { v += 1; compteur.textContent = v; compteur.classList.add("bilan__plus"); if (v >= apres) clearInterval(pas); }, Math.max(60, 500 / (apres - etat.avant)));
    } else if (compteur) compteur.textContent = apres;
    if (etat.completions.length) setTimeout(sonComplete, 300);
    $("#revelation-actions").hidden = false;
    $("#tout-reveler").hidden = true;
    $("#revelation-aide").hidden = true;
    const b = etatBoosters();
    const encore = $("#revelation [data-action='ouvrir']");
    const dispo = b.dores + b.tickets;
    // Ce que coute le prochain booster, ecrit sur le bouton (avant, l'encre partait sans prevenir)
    const cout = b.dores > 0 ? "booster doré" : b.tickets > 0 ? "1 ticket" : `${nombre(b.prix)} d'encre`;
    if (etat.nombre > 1 && dispo >= 2) {
      encore.dataset.nombre = String(Math.min(etat.nombre, dispo));
      encore.textContent = `Encore ×${Math.min(etat.nombre, dispo)} · ${b.dores > 0 ? "dorés et tickets" : "tickets"}`;
    } else {
      encore.dataset.nombre = "1";
      encore.textContent = `Encore un booster · ${cout}`;
    }
    encore.disabled = !(b.dores > 0 || b.tickets > 0 || encre() >= b.prix);
    annoncerTampons(verifierTampons());
    rendre();
  }

  // ---------- Ouvrir : le sachet a dechirer ----------

  async function dechirer() {
    const etat = revelation;
    if (!etat || etat.phase !== "sachet") return;
    etat.phase = "dechirure";
    sonDechirure();
    const sachet = $("#sachet-ouverture .sachet");
    if (!mouvementReduit && sachet) {
      sachet.style.setProperty("--dechirure", "1");
      sachet.classList.add("sachet--dechire");
      await pause(560);
    }
    if (revelation !== etat) return;
    $("#sachet-ouverture").hidden = true;
    $("#cartes-booster").hidden = false;
    $("#revelation-aide").textContent = etat.cartes.length > 3 ? "Touche les cartes pour les retourner, ou « Tout révéler »." : "Touche chaque carte pour la retourner.";
    etat.phase = "cartes";
    sonCarte();
  }

  function brancherDechirure() {
    const zone = $("#sachet-ouverture");
    let depart = null;
    zone.addEventListener("pointerdown", (e) => {
      if (revelation?.phase !== "sachet") return;
      depart = { x: e.clientX, largeur: zone.getBoundingClientRect().width, bouge: 0 };
      zone.setPointerCapture?.(e.pointerId);
    });
    zone.addEventListener("pointermove", (e) => {
      if (!depart || revelation?.phase !== "sachet") return;
      const dx = Math.abs(e.clientX - depart.x);
      depart.bouge = Math.max(depart.bouge, dx);
      const p = Math.min(1, dx / (depart.largeur * 0.55));
      $("#sachet-ouverture .sachet")?.style.setProperty("--dechirure", p.toFixed(3));
      if (p >= 1) { depart = null; dechirer(); }
    });
    const fin = () => {
      if (!depart) return;
      const toucher = depart.bouge < 10;
      depart = null;
      if (toucher) dechirer();
      else $("#sachet-ouverture .sachet")?.style.setProperty("--dechirure", "0");
    };
    zone.addEventListener("pointerup", fin);
    zone.addEventListener("pointercancel", fin);
    zone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dechirer(); } });
  }

  async function ouvrir(editionId, nombre = 1) {
    const avant = idsPossedes().length;
    const resultats = [];
    for (let k = 0; k < nombre; k++) {
      const r = ouvrirBoosterJoueur(editionId);
      if (!r) break;
      resultats.push(r);
    }
    if (!resultats.length) return rendre();
    rendre();
    const edition = EDITIONS.find((e) => e.id === editionId);
    const cartes = resultats.flatMap((r) => r.cartes);
    const dore = resultats.some((r) => r.dore);
    revelation = { edition, cartes, reveles: new Set(), dore, avant, nombre: resultats.length, completions: resultats.flatMap((r) => r.completions ?? []), phase: "sachet" };
    const multi = resultats.length > 1;
    $("#revelation").innerHTML = `
      <div class="revelation ${dore ? "revelation--doree" : ""}" role="dialog" aria-modal="true" aria-labelledby="titre-revelation">
        <h2 class="revelation__titre" id="titre-revelation">${dore ? "Booster doré !" : `${multi ? `${resultats.length} boosters` : "Booster"} ${edition.nom}`}</h2>
        <div class="revelation__sachet ${multi ? "revelation__sachet--pile" : ""}" id="sachet-ouverture" tabindex="0" role="button" aria-label="Déchirer le sachet" style="--n: ${Math.min(resultats.length, 5)}">
          ${multi ? `<span class="sachet-pile__dos" aria-hidden="true"></span><span class="sachet-pile__compte">×${resultats.length}</span>` : ""}
          ${htmlSachet(edition, { attributs: dore ? 'data-dore="1"' : "" })}
          <span class="sachet__ligne-dechirure" aria-hidden="true"></span>
        </div>
        <p class="revelation__aide" id="revelation-aide">Glisse le doigt sur le sachet pour le déchirer, ou touche-le.</p>
        <div class="revelation__tomes revelation__tomes--dix ${multi ? "revelation__tomes--multi" : ""}" id="cartes-booster" hidden>
          ${cartes.map(htmlCarteRevelee).join("")}
        </div>
        <p class="revelation__resume" id="revelation-resume" role="status" aria-live="polite"></p>
        <div class="revelation__barre">
          <button type="button" class="bouton bouton--clair" id="tout-reveler" data-action="tout-reveler">Tout révéler</button>
          <div class="revelation__actions" id="revelation-actions" hidden>
            <button type="button" class="bouton bouton--secondaire" data-action="ouvrir" data-edition="${editionId}" data-nombre="${resultats.length}">${multi ? `Encore ×${resultats.length}` : "Encore un booster"}</button>
            <button type="button" class="bouton bouton--clair" data-action="fermer">Fermer</button>
          </div>
        </div>
      </div>`;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
    brancherDechirure();
    $("#sachet-ouverture").focus({ preventScroll: true });
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
    if (action === "ouvrir") ouvrir(cible.dataset.edition, Number(cible.dataset.nombre) || 1);
    if (action === "reveler") reveler(Number(cible.dataset.index));
    if (action === "tout-reveler" && revelation) toutReveler();
    if (action === "fermer") fermer();
    if (action === "filtre-atelier") { filtreAtelier = cible.dataset.valeur; messageAtelier = ""; rendreAtelier(); }
    if (action === "fusionner") {
      const bordure = fusionner(cible.dataset.perso);
      if (bordure) { messageAtelier = `${PERSOS_PAR_ID[cible.dataset.perso].nom} : bordure ${nomBordure(bordure)} forgée !`; sonRarete("legendaire"); }
      rendreAtelier();
    }
    if (action === "fabriquer") {
      const r = fabriquerCarte(cible.dataset.perso);
      const perso = PERSOS_PAR_ID[cible.dataset.perso];
      messageAtelier = r.ok ? `${perso.nom} fabriqué : ${texteResultat(r.carte)}` : r.erreur;
      if (r.ok) {
        sonRarete(r.carte.rarete);
        for (const x of r.completions ?? []) messageAtelier += ` ${x.type === "edition" ? "Édition" : "Série"} complète : ${x.nom} ! +${x.recompense.invocations} invocations, +${x.recompense.encre} d'encre.`;
        if (r.completions?.length) sonComplete();
        annoncerTampons(verifierTampons());
      }
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
    if (revelation || vue === "autel") return;
    const tickets = etatBoosters().tickets;
    if (tickets !== ticketsAffiches) { ticketsAffiches = tickets; rendre(); }
    else rendreReserve();
  }, 30000);

  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
  rendre();
}
