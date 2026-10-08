// ==========================================================
// CHOIX DU PREMIER HEROS (une seule fois, au debut)
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { ROLES, AFFINITES } from "../donnees/roles.js";
import { PERSOS_DE_DEPART, HEROS_AU_CHOIX, ENCRE_DE_DEPART } from "../donnees/progression.js";
import { nouvellePartie } from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, htmlObi, iconeRole, rafraichirPortrait, COULEURS_AFFINITE } from "../ui/cartes.js";

export function afficherDebut(conteneur, { naviguer }) {
  const heros = HEROS_AU_CHOIX.map((id) => PERSOS_PAR_ID[id]);
  const compagnons = PERSOS_DE_DEPART.map((id) => PERSOS_PAR_ID[id]);

  conteneur.innerHTML = `
    <main class="debut">
      <button type="button" class="lien-retour" data-action="accueil">Retour à l'accueil</button>
      <h1 class="debut__titre">Choisis ton premier héros</h1>
      <p class="debut__intro">Il rejoint ton équipe pour toujours. Les autres se trouvent dans les boosters.</p>

      <div class="heros">
        ${heros.map((p) => `
          <article class="heros__carte" style="--aff: ${COULEURS_AFFINITE[p.affinite]}">
            <div class="heros__visuel">${htmlPortrait(p)}${htmlObi(p)}</div>
            <div class="heros__corps">
              <p class="heros__serie">${p.serie}</p>
              <h2 class="heros__nom">${p.nom}</h2>
              <p class="heros__role">${iconeRole(p.role)} ${ROLES[p.role].nom}, ${AFFINITES[p.affinite]}</p>
              <p class="heros__comp"><strong>${p.passif.nom}.</strong> ${p.passif.description}.</p>
              <p class="heros__comp"><strong>${p.ultime.nom}.</strong> ${p.ultime.description}.</p>
              <button type="button" class="bouton bouton--principal heros__bouton" data-action="choisir" data-heros="${p.id}">Choisir ${p.nom}</button>
            </div>
          </article>
        `).join("")}
      </div>

      <section class="compagnons" aria-labelledby="titre-compagnons">
        <h2 id="titre-compagnons">Ils t'accompagnent déjà</h2>
        <ul class="compagnons__liste">
          ${compagnons.map((p) => `
            <li class="compagnon" style="--aff: ${COULEURS_AFFINITE[p.affinite]}">
              ${htmlPortrait(p)}
              <span><strong>${p.nom}</strong><br>${ROLES[p.role].nom}</span>
            </li>
          `).join("")}
        </ul>
        <p class="compagnons__cadeau">Et un cadeau de bienvenue : 3 boosters à ouvrir et ${ENCRE_DE_DEPART.toLocaleString("fr-FR")} d'encre.</p>
      </section>
    </main>
  `;

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    if (cible.dataset.action === "accueil") naviguer("accueil");
    if (cible.dataset.action === "choisir") {
      nouvellePartie(cible.dataset.heros);
      naviguer("qg");
    }
  });

  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}
