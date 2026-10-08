// ==========================================================
// BARRE DE NAVIGATION
// Presente sur les ecrans du jeu (pas en combat ni a l'accueil).
// ==========================================================

import { htmlDevenirFort } from "./aide.js";
import { encre, quelqueChoseAReclamer, boostersDisponibles, etatEnergie, etatBoosters, eclats, ressources } from "../services/partie.js";

// Le lexique des ressources : a quoi sert chaque monnaie et comment l'obtenir
function lignesLexique() {
  const e = etatEnergie() ?? { valeur: 0, max: 0 };
  const b = etatBoosters() ?? { tickets: 0, dores: 0, poussiere: 0 };
  const r = ressources();
  const n = (x) => Number(x ?? 0).toLocaleString("fr-FR");
  return [
    ["Énergie", `${e.valeur} / ${e.max}`, "Payée seulement quand tu gagnes un combat (campagne 6, Tour 4, chasse 3).", "+1 toutes les 3 min, missions, défi du jour, calendrier, recharge à l'encre. Première victoire d'une étape et nouveaux étages de la Tour : gratuits."],
    ["Encre", n(encre()), "Acheter des boosters (100 l'un) et recharger l'énergie.", "Chaque victoire, l'expédition, les coffres, les missions."],
    ["Tickets de booster", n(b.tickets), "Ouvrir un booster gratuitement.", "1 toutes les 30 min (réserve de 16), chapitres finis, missions, événements, guide."],
    ["Tickets dorés", n(b.dores), "Ouvrir un booster doré : 3 cartes Épiques ou Légendaires.", "Le 7e jour du calendrier, très rarement dans les boosters."],
    ["Poussière", n(b.poussiere), "Fabriquer à l'Atelier la carte de ton choix.", "Chaque booster ouvert, et surtout les doublons (plus la carte est rare, plus elle en donne)."],
    ["Éclats", n(eclats()), "Améliorer et retoucher les objets d'équipement.", "Recycler les objets, la Tour, la chasse."],
    ["Fragments d'éveil", n(r.fragments), "Éveiller un perso (paliers I à V) pour débloquer ses talents.", "Les boss de la Tour, les coffres de la semaine, le boss de la semaine."],
    ["Encre sacrée", n(r.encreSacree), "Sublimer une ligne parfaite d'un objet : elle dépasse son maximum de 15 %.", "Rare : boss de la Tour à partir de l'étage 30, gros coffres de la semaine."],
  ];
}

export function ouvrirLexique(onglet = "ressources") {
  document.querySelector(".voile--lexique")?.remove();
  const voile = document.createElement("div");
  voile.className = "voile voile--lexique";
  voile.innerHTML = `
    <div class="resultat lexique" role="dialog" aria-modal="true" aria-labelledby="titre-lexique">
      <h2 class="resultat__titre" id="titre-lexique" tabindex="-1">Aide</h2>
      <div class="choix-segmente choix-segmente--gauche lexique__onglets" role="tablist" aria-label="Aide">
        <button type="button" role="tab" class="choix-segmente__option" data-onglet-aide="ressources" aria-selected="${onglet === "ressources"}" aria-checked="${onglet === "ressources"}">Tes ressources</button>
        <button type="button" role="tab" class="choix-segmente__option" data-onglet-aide="fort" aria-selected="${onglet === "fort"}" aria-checked="${onglet === "fort"}">Devenir plus fort</button>
      </div>
      <div class="lexique__page" data-page="fort" ${onglet === "fort" ? "" : "hidden"}>${htmlDevenirFort()}</div>
      <dl class="lexique__liste lexique__page" data-page="ressources" ${onglet === "ressources" ? "" : "hidden"}>
        ${lignesLexique().map(([nom, valeur, sert, gagne]) => `
          <div class="lexique__ligne">
            <dt><span>${nom}</span><strong>${valeur}</strong></dt>
            <dd><b>Sert à :</b> ${sert}<br><b>Se gagne :</b> ${gagne}</dd>
          </div>`).join("")}
      </dl>
      <div class="resultat__actions"><button type="button" class="bouton bouton--clair" data-fermer-lexique>Fermer</button></div>
    </div>`;
  voile.addEventListener("click", (ev) => {
    const tab = ev.target.closest("[data-onglet-aide]");
    if (tab) {
      voile.querySelectorAll("[data-onglet-aide]").forEach((b) => { b.setAttribute("aria-selected", String(b === tab)); b.setAttribute("aria-checked", String(b === tab)); });
      voile.querySelectorAll(".lexique__page").forEach((pg) => { pg.hidden = pg.dataset.page !== tab.dataset.ongletAide; });
      voile.querySelector(".lexique").scrollTop = 0;
      return;
    }
    if (ev.target === voile || ev.target.closest("[data-fermer-lexique]")) voile.remove();
  });
  document.body.append(voile);
  voile.querySelector("#titre-lexique").focus();
}

const ONGLETS = [
  { ecran: "qg", nom: "QG" },
  { ecran: "aventure", nom: "Aventure" },
  { ecran: "equipe", nom: "Équipe" },
  { ecran: "tirages", nom: "Boosters" },
  { ecran: "collection", nom: "Collection" },
  { ecran: "social", nom: "Social" },
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
      <p class="compteur-energie" title="Énergie : les combats en coûtent (payée seulement à la victoire), +1 toutes les 3 minutes"><svg class="compteur-energie__eclair" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg><span data-energie>${etatEnergie()?.valeur ?? 0}/${etatEnergie()?.max ?? 0}</span><span class="visuellement-cache"> d'énergie</span></p>
      <button type="button" class="navigation__aide" data-lexique aria-label="Aide : tes ressources et comment devenir plus fort" title="Aide">?</button>
      <p class="compteur-encre navigation__encre"><span class="compteur-encre__goutte" aria-hidden="true"></span><span data-encre>${encre().toLocaleString("fr-FR")}</span><span class="visuellement-cache"> d'encre</span></p>
    </nav>
  `;
}

// Branche les clics de la barre, et renvoie une fonction pour mettre l'encre a jour
export function brancherNavigation(conteneur, naviguer, actif) {
  conteneur.addEventListener("click", (e) => {
    if (e.target.closest("[data-lexique]")) return ouvrirLexique();
    const bouton = e.target.closest("[data-nav]");
    if (bouton && bouton.dataset.nav !== actif) naviguer(bouton.dataset.nav);
  });
  const maj = () => {
    const zone = conteneur.querySelector(".navigation [data-encre]");
    if (zone) zone.textContent = encre().toLocaleString("fr-FR");
    const energie = conteneur.querySelector(".navigation [data-energie]");
    const e = etatEnergie();
    if (energie && e) energie.textContent = `${e.valeur}/${e.max}`;
    const pastille = conteneur.querySelector("[data-pastille]");
    if (pastille) {
      const n = boostersDisponibles();
      pastille.textContent = n > 9 ? "9+" : n ? String(n) : "";
      pastille.hidden = n === 0;
      pastille.setAttribute("aria-label", n ? `${n} booster${n > 1 ? "s" : ""} à ouvrir` : "");
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
