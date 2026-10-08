// ==========================================================
// DEBUT DE PARTIE : le booster de depart (une seule fois)
// Un booster offert donne les 5 premiers persos, un par role :
// l'equipe est prete tout de suite. Les autres viendront des boosters.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { ROLES } from "../donnees/roles.js";
import { RARETES } from "../donnees/raretes.js";
import { ENCRE_DE_DEPART } from "../donnees/progression.js";
import { BOOSTER_DEPART, TICKETS_DEPART, MINUTES_BOOSTER_GRATUIT } from "../donnees/boosters.js";
import { nouvellePartie } from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlCarte, rafraichirPortrait } from "../ui/cartes.js";
import { htmlSachet } from "../ui/sachet.js";

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export function afficherDebut(conteneur, { naviguer }) {
  const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ouvert = false;

  conteneur.innerHTML = `
    <main class="debut debut--booster">
      <button type="button" class="lien-retour" data-action="accueil">Retour à l'accueil</button>
      <h1 class="debut__titre">Ton premier booster</h1>
      <p class="debut__intro" id="debut-intro">Il est offert ! Il contient 5 persos, un de chaque rôle : de quoi former ta première équipe.</p>
      <button type="button" class="debut__sachet" data-action="ouvrir" aria-label="Ouvrir le booster de départ">
        ${htmlSachet(BOOSTER_DEPART)}
      </button>
      <p class="debut__consigne" id="debut-consigne">Clique sur le booster pour l'ouvrir.</p>
      <div class="debut__equipe" id="debut-equipe" hidden></div>
      <div class="debut__suite" id="debut-suite" hidden>
        <p class="compagnons__cadeau">Ton équipe est prête ! En cadeau : ${TICKETS_DEPART} boosters à ouvrir et ${ENCRE_DE_DEPART.toLocaleString("fr-FR")} d'encre. Ensuite, un booster gratuit toutes les ${MINUTES_BOOSTER_GRATUIT} minutes.</p>
        <button type="button" class="bouton bouton--principal" data-action="commencer">Commencer l'aventure</button>
      </div>
    </main>
  `;
  const $ = (sel) => conteneur.querySelector(sel);

  async function ouvrir() {
    if (ouvert) return;
    ouvert = true;
    $("#debut-consigne").hidden = true;
    $(".lien-retour").hidden = true;
    const sachet = $(".debut__sachet .sachet");
    if (!mouvementReduit) {
      sachet.classList.add("sachet--tremble");
      await pause(650);
      sachet.classList.add("sachet--dechire");
      await pause(550);
    }
    const cartes = nouvellePartie();
    $(".debut__sachet").hidden = true;
    $("#debut-intro").textContent = "Voici ton équipe : un tank, un soutien, un contrôle, un attaquant et un assassin.";
    $("#debut-equipe").innerHTML = cartes.map((c, i) => {
      const perso = PERSOS_PAR_ID[c.id];
      return `
        <div class="debut__carte" style="--i: ${i}">
          ${htmlCarte(perso).replace('data-action="choisir-perso"', 'tabindex="-1"')}
          <p class="debut__role">${ROLES[perso.role].nom} · ${RARETES[perso.rarete].nom}</p>
        </div>`;
    }).join("");
    $("#debut-equipe").hidden = false;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
    await pause(mouvementReduit ? 0 : 900);
    $("#debut-suite").hidden = false;
    $("#debut-suite .bouton").focus({ preventScroll: true });
  }

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    if (cible.dataset.action === "accueil" && !ouvert) naviguer("accueil");
    if (cible.dataset.action === "ouvrir") ouvrir();
    if (cible.dataset.action === "commencer") naviguer("qg");
  });

  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}
