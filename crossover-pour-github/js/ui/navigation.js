// ==========================================================
// BARRE DE NAVIGATION
// Presente sur les ecrans du jeu (pas en combat ni a l'accueil).
// ==========================================================

import { encre, quelqueChoseAReclamer } from "../services/partie.js";
import { COUT_TIRAGE, COUT_TIRAGE_X10 } from "../donnees/progression.js";

const ONGLETS = [
  { ecran: "qg", nom: "QG" },
  { ecran: "aventure", nom: "Aventure" },
  { ecran: "equipe", nom: "Équipe" },
  { ecran: "tirages", nom: "Tirages" },
  { ecran: "collection", nom: "Collection" },
  { ecran: "reglages", nom: "Réglages" },
];

export function htmlNavigation(actif) {
  return `
    <nav class="navigation" aria-label="Menu du jeu">
      <button type="button" class="navigation__logo" data-nav="accueil" aria-label="Retour à l'accueil">Crossover</button>
      <div class="navigation__onglets">
        ${ONGLETS.map((o) => `
          <button type="button" class="navigation__onglet" data-nav="${o.ecran}" ${o.ecran === actif ? 'aria-current="page"' : ""}>${o.nom}${o.ecran === "tirages" ? '<span class="pastille-tirage" data-pastille></span>' : ""}${o.ecran === "qg" ? '<span class="pastille-tirage" data-pastille-qg hidden>!</span>' : ""}</button>
        `).join("")}
      </div>
      <p class="compteur-encre navigation__encre"><span class="compteur-encre__goutte" aria-hidden="true"></span><span data-encre>${encre().toLocaleString("fr-FR")}</span><span class="visuellement-cache"> d'encre</span></p>
    </nav>
  `;
}

// Branche les clics de la barre, et renvoie une fonction pour mettre l'encre a jour
export function brancherNavigation(conteneur, naviguer, actif) {
  conteneur.addEventListener("click", (e) => {
    const bouton = e.target.closest("[data-nav]");
    if (bouton && bouton.dataset.nav !== actif) naviguer(bouton.dataset.nav);
  });
  const maj = () => {
    const zone = conteneur.querySelector(".navigation [data-encre]");
    if (zone) zone.textContent = encre().toLocaleString("fr-FR");
    const pastille = conteneur.querySelector("[data-pastille]");
    if (pastille) {
      const solde = encre();
      pastille.textContent = solde >= COUT_TIRAGE_X10 ? "x10" : solde >= COUT_TIRAGE ? "x1" : "";
      pastille.hidden = solde < COUT_TIRAGE;
      pastille.setAttribute("aria-label", solde >= COUT_TIRAGE ? "tirage possible" : "");
    }
    const pastilleQg = conteneur.querySelector("[data-pastille-qg]");
    if (pastilleQg) {
      const aReclamer = quelqueChoseAReclamer();
      pastilleQg.hidden = !aReclamer;
      pastilleQg.setAttribute("aria-label", aReclamer ? "des gains t'attendent" : "");
    }
  };
  maj();
  return maj;
}
