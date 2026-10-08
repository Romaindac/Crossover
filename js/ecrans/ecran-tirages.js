// ==========================================================
// ECRAN DES TIRAGES
// Chaque tirage est un tome de manga : l'obi annonce la rarete,
// puis la couverture se retourne et revele le perso.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES, ORDRE_RARETES } from "../donnees/raretes.js";
import { ETOILES_MAX, PITIE_LEGENDAIRE } from "../donnees/progression.js";
import { encre, effectuerTirage, coutTirage, tiragesAvantLegendaire, idsPossedes } from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait } from "../ui/cartes.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";
import { annoncerTampons } from "../ui/toast.js";
import { verifierTampons } from "../services/partie.js";
import { serieDeLaSemaine } from "../donnees/hebdo.js";
import { finDeSemaine } from "../donnees/tour.js";

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const ONOMATOPEES_LEGENDAIRE = ["ゴゴゴ", "ドドド", "ズドン"];

// Chance d'un perso precis par tirage (hors garanties) : la serie a l'honneur compte double dans sa rarete
function chancePerso(perso, serie) {
  const liste = PERSOS.filter((p) => p.rarete === perso.rarete);
  const poids = (p) => (p.serie === serie ? 2 : 1);
  return RARETES[perso.rarete].taux * poids(perso) / liste.reduce((t, p) => t + poids(p), 0);
}
const pourcent = (x) => `${(x * 100).toFixed(1).replace(".", ",")} %`;

export function afficherTirages(conteneur, { naviguer }) {
  const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let revelationEnCours = null; // { tomes, resultats, passer }
  const serie = serieDeLaSemaine();
  const joursRestants = Math.max(0, Math.floor((finDeSemaine() - Date.now()) / 86400000));

  conteneur.innerHTML = `
    ${htmlNavigation("tirages")}
    <div class="tirages">
      <header class="tirages__entete">
        <h1 class="equipe__titre">Tirages</h1>
      </header>

      <section class="etal">
        <div class="pile" aria-hidden="true">
          ${["commun", "rare", "peu_commun", "legendaire", "epique", "commun"].map((r, i) => `
            <span class="pile__tome" style="--i: ${i}"><span class="obi-rarete obi-rarete--${r}"></span></span>
          `).join("")}
        </div>

        <div class="etal__contenu">
          <p class="etal__texte">Chaque tome cache un perso. Regarde bien l'obi : sa couleur annonce la rareté avant que la couverture ne se retourne.</p>
          <p class="etal__honneur"><strong>À l'honneur cette semaine : ${serie}.</strong> Ses persos ont deux fois plus de chances de sortir dans leur rareté. Encore ${joursRestants} jour${joursRestants > 1 ? "s" : ""}.</p>
          <div class="etal__boutons">
            <button type="button" class="bouton bouton--clair bouton-tirage" data-action="tirer" data-nombre="1">
              1 tome <span class="bouton-tirage__prix">${coutTirage(1)} d'encre</span>
            </button>
            <button type="button" class="bouton bouton--principal bouton-tirage" data-action="tirer" data-nombre="10">
              10 tomes <span class="bouton-tirage__prix">${coutTirage(10)} d'encre</span>
            </button>
          </div>
          <p class="etal__manque" id="manque" role="status" aria-live="polite"></p>

          <div class="pitie">
            <p id="pitie-texte"></p>
            <span class="barre-xp"><span class="barre-xp__rempli barre-pitie" id="pitie-barre"></span></span>
          </div>

          <details class="taux">
            <summary>Voir les taux et les garanties</summary>
            <table>
              <thead><tr><th>Rareté</th><th class="nombre">Chance</th><th>Persos</th></tr></thead>
              <tbody>
                ${ORDRE_RARETES.map((r) => `
                  <tr>
                    <td><span class="obi-rarete obi-rarete--${r} obi-rarete--pastille">${RARETES[r].nom}</span></td>
                    <td class="nombre">${Math.round(RARETES[r].taux * 100)} %</td>
                    <td>${PERSOS.filter((p) => p.rarete === r).map((p) => `<span class="${p.serie === serie ? "taux__honneur" : ""}">${p.nom} (${pourcent(chancePerso(p, serie))})</span>`).join(", ")}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
            <p>Entre parenthèses, la chance de chaque perso par tome ; en gras, la série à l'honneur. Dans chaque tirage de 10 tomes, au moins un perso Rare ou mieux. Un Légendaire est garanti au ${PITIE_LEGENDAIRE}e tirage sans Légendaire. Un doublon fait monter les étoiles du perso ; au-delà de ${ETOILES_MAX} étoiles, il se change en encre.</p>
          </details>
        </div>
      </section>
    </div>
    <div id="revelation"></div>
  `;

  const $ = (sel) => conteneur.querySelector(sel);
  const majEncre = brancherNavigation(conteneur, naviguer, "tirages");

  function rendreEtal() {
    const solde = encre();
    majEncre();
    conteneur.querySelectorAll("[data-action='tirer']").forEach((b) => {
      b.disabled = solde < coutTirage(Number(b.dataset.nombre));
    });
    $("#manque").textContent = solde < coutTirage(1)
      ? `Il te manque ${nombre(coutTirage(1) - solde)} d'encre. Gagne des combats pour en obtenir.`
      : "";
    const reste = tiragesAvantLegendaire();
    $("#pitie-texte").innerHTML = `Légendaire garanti dans <strong>${reste}</strong> tirage${reste > 1 ? "s" : ""} au plus.`;
    $("#pitie-barre").style.setProperty("--xp", (PITIE_LEGENDAIRE - reste) / PITIE_LEGENDAIRE);
  }

  // ---------- Un tome ----------

  function texteResultat(r) {
    if (r.nouveau) return "Nouveau perso";
    if (r.encreRendue) return `Déjà au maximum : +${r.encreRendue} d'encre`;
    if (r.etoilesApres > r.etoilesAvant) return `Doublon : ${r.etoilesApres}e étoile\u202f!`;
    return `Doublon : ${r.doublons} sur ${r.besoin} pour la prochaine étoile`;
  }

  function htmlTome(r, index) {
    const perso = PERSOS_PAR_ID[r.id];
    return `
      <button type="button" class="tome tome--${r.rarete}" data-action="reveler" data-index="${index}"
        aria-label="Tome ${index + 1}, à révéler" style="--i: ${index}">
        <span class="tome__interieur">
          <span class="tome__face tome__face--dos">
            <span class="tome__logo">Crossover</span>
            <span class="tome__obi"><span class="tome__obi-texte">${RARETES[r.rarete].nom}</span></span>
          </span>
          <span class="tome__face tome__face--avant">
            ${htmlPortrait(perso)}
            <span class="tome__titre">${perso.nom}</span>
            <span class="obi-rarete obi-rarete--${r.rarete}">${RARETES[r.rarete].nom}</span>
            ${r.nouveau ? '<span class="tampon">Nouveau</span>' : ""}
          </span>
        </span>
        <span class="tome__resultat">${texteResultat(r)}</span>
      </button>
    `;
  }

  // Revele un tome : l'obi d'abord, puis la couverture
  async function reveler(index, rapide = false) {
    const etat = revelationEnCours;
    if (!etat || etat.reveles.has(index)) return;
    etat.reveles.add(index);
    const tome = $(`.tome[data-index="${index}"]`);
    const r = etat.resultats[index];
    const perso = PERSOS_PAR_ID[r.id];

    tome.classList.add("tome--obi");
    if (!rapide && !mouvementReduit) await pause(r.rarete === "legendaire" ? 900 : 420);
    tome.classList.add("tome--revele");
    const resultat = texteResultat(r);
    tome.setAttribute("aria-label", `${perso.nom}, ${RARETES[r.rarete].nom}. ${resultat}${/[!.]$/.test(resultat) ? "" : "."}`);

    if (r.rarete === "legendaire" && !rapide) {
      const flash = document.createElement("span");
      flash.className = "flash-legendaire";
      $("#revelation .revelation").appendChild(flash);
      flash.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 700 }).onfinish = () => flash.remove();
      const ono = document.createElement("span");
      ono.className = "onomatopee onomatopee--tome";
      ono.textContent = ONOMATOPEES_LEGENDAIRE[Math.floor(Math.random() * ONOMATOPEES_LEGENDAIRE.length)];
      tome.appendChild(ono);
    }
    if (etat.reveles.size === etat.resultats.length) terminerRevelation();
  }

  function terminerRevelation() {
    const etat = revelationEnCours;
    const nouveaux = etat.resultats.filter((r) => r.nouveau).length;
    const etoiles = etat.resultats.filter((r) => r.etoilesApres > r.etoilesAvant).length;
    const resume = [
      nouveaux ? `${nouveaux} nouveau${nouveaux > 1 ? "x" : ""} perso${nouveaux > 1 ? "s" : ""}` : null,
      etoiles ? `${etoiles} étoile${etoiles > 1 ? "s" : ""} gagnée${etoiles > 1 ? "s" : ""}` : null,
    ].filter(Boolean).join(", ") || "Que des doublons, cette fois";
    $("#revelation-resume").textContent = `${resume}. Collection : ${idsPossedes().length} sur ${PERSOS.length}.`;
    $("#revelation-actions").hidden = false;
    annoncerTampons(verifierTampons());
    $("#tout-reveler").hidden = true;
    const solde = encre();
    $("#revelation [data-nombre='1']").disabled = solde < coutTirage(1);
    $("#revelation [data-nombre='10']").disabled = solde < coutTirage(10);
    rendreEtal();
  }

  async function lancerTirage(combien) {
    const resultats = effectuerTirage(combien);
    if (!resultats) return rendreEtal();
    rendreEtal();

    revelationEnCours = { resultats, reveles: new Set() };
    $("#revelation").innerHTML = `
      <div class="revelation" role="dialog" aria-modal="true" aria-labelledby="titre-revelation">
        <h2 class="visuellement-cache" id="titre-revelation">Résultat du tirage</h2>
        <div class="revelation__tomes revelation__tomes--${combien === 1 ? "un" : "dix"}">
          ${resultats.map(htmlTome).join("")}
        </div>
        <p class="revelation__resume" id="revelation-resume" role="status" aria-live="polite"></p>
        <div class="revelation__barre">
          <button type="button" class="bouton bouton--clair" id="tout-reveler" data-action="tout-reveler">Tout révéler</button>
          <div class="revelation__actions" id="revelation-actions" hidden>
            <button type="button" class="bouton bouton--clair" data-action="tirer" data-nombre="1">Encore 1 tome</button>
            <button type="button" class="bouton bouton--principal" data-action="tirer" data-nombre="10">Encore 10 tomes</button>
            <button type="button" class="bouton bouton--clair" data-action="fermer">Fermer</button>
          </div>
        </div>
      </div>
    `;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
    $("#tout-reveler").focus({ preventScroll: true });

    // Les tomes se revelent un par un ; un clic les revele tout de suite
    const etat = revelationEnCours;
    await pause(mouvementReduit ? 100 : 500 + combien * 40);
    for (let i = 0; i < resultats.length; i++) {
      if (revelationEnCours !== etat) return;
      await reveler(i);
      if (combien > 1 && !mouvementReduit) await pause(220);
    }
  }

  function fermer() {
    revelationEnCours = null;
    $("#revelation").innerHTML = "";
    rendreEtal();
  }

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    const action = cible.dataset.action;
    if (action === "tirer") lancerTirage(Number(cible.dataset.nombre));
    if (action === "reveler") reveler(Number(cible.dataset.index), true);
    if (action === "tout-reveler" && revelationEnCours) {
      revelationEnCours.resultats.forEach((_, i) => reveler(i, true));
    }
    if (action === "fermer") fermer();
  });

  conteneur.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && revelationEnCours && !$("#revelation-actions")?.hidden) fermer();
  });

  rendreEtal();
}
