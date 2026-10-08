// ==========================================================
// SCENES DE DIALOGUE
// Une page de manga qui se remplit case par case. Chaque
// replique est une case : le visage du perso et sa bulle.
// Un clic (ou Espace, Entree) fait apparaitre la suivante.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { SCENES } from "../donnees/histoire.js";
import { htmlPortrait, rafraichirPortrait } from "./cartes.js";
import { chargerPortraits } from "../services/portraits.js";

const TELEPATHES = ["mewtwo"];

// Typographie francaise : espace insecable avant ? ! : ; (pas de signe seul en debut de ligne)
const typo = (texte) => texte.replace(/ ([?!:;])/g, "\u202f$1");

function htmlCase(replique, index) {
  replique = { ...replique, texte: typo(replique.texte) };
  if (replique.qui === "narrateur") {
    return `<div class="case-scene case-scene--recit" style="--i: ${index}"><p>${replique.texte}</p></div>`;
  }
  const perso = PERSOS_PAR_ID[replique.qui];
  const cote = index % 2 ? "droite" : "gauche";
  const mechante = replique.qui === "rature";
  return `
    <div class="case-scene case-scene--${cote} ${mechante ? "case-scene--rature" : ""}" style="--i: ${index}">
      <span class="case-scene__visage">${htmlPortrait(perso)}</span>
      <div class="case-scene__bulle">
        <p class="case-scene__nom">${perso.nom}${TELEPATHES.includes(perso.id) ? ", par télépathie" : ""}</p>
        <p>${replique.texte}</p>
      </div>
    </div>`;
}

// Joue une scene par-dessus "racine". Renvoie une promesse resolue a la fermeture.
export function jouerScene(racine, cle, { titre = "" } = {}) {
  const repliques = Array.isArray(cle) ? cle : SCENES[cle];
  if (!repliques) return Promise.resolve();

  return new Promise((resoudre) => {
    const zone = document.createElement("div");
    zone.className = "scene-histoire";
    zone.setAttribute("role", "dialog");
    zone.setAttribute("aria-modal", "true");
    zone.setAttribute("aria-label", titre || "Scène de l'histoire");
    zone.innerHTML = `
      <div class="scene-histoire__page">
        ${titre ? `<p class="scene-histoire__titre">${titre}</p>` : ""}
        <div class="scene-histoire__cases" aria-live="polite"></div>
        <div class="scene-histoire__barre">
          <span class="case__aide scene-histoire__aide">Clique ou appuie sur Espace pour continuer</span>
          <button type="button" class="bouton bouton--clair bouton--petit-texte" data-scene="passer">Passer</button>
          <button type="button" class="bouton bouton--principal bouton--petit-texte" data-scene="suite">Suite</button>
        </div>
      </div>`;
    racine.appendChild(zone);
    const cases = zone.querySelector(".scene-histoire__cases");
    const boutonSuite = zone.querySelector("[data-scene='suite']");
    let affichees = 0;

    const fermer = () => {
      document.removeEventListener("keydown", clavier, true);
      zone.remove();
      resoudre();
    };
    const suivante = () => {
      if (affichees >= repliques.length) return fermer();
      cases.insertAdjacentHTML("beforeend", htmlCase(repliques[affichees], affichees));
      affichees++;
      chargerPortraits((id) => rafraichirPortrait(cases, id));
      cases.lastElementChild.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (affichees >= repliques.length) boutonSuite.textContent = "Continuer";
      boutonSuite.focus({ preventScroll: true });
    };
    const clavier = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        fermer();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        suivante();
      }
    };
    document.addEventListener("keydown", clavier, true);

    zone.addEventListener("click", (e) => {
      const bouton = e.target.closest("[data-scene]");
      if (bouton?.dataset.scene === "passer") return fermer();
      suivante();
    });

    suivante();
  });
}
