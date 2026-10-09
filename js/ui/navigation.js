// ==========================================================
// BARRE DE NAVIGATION
// Presente sur les ecrans du jeu (pas en combat ni a l'accueil).
// ==========================================================

import { htmlDevenirFort } from "./aide.js";
import { nonLusEnMemoire, enLigneDisponible, connecte, pseudoConnecte } from "../services/enligne.js";
import { ouvrirCompte } from "./compte.js";
import { ouvrirTutoriel } from "./tutoriel.js";
import { encre, quelqueChoseAReclamer, boostersDisponibles, etatEnergie, etatBoosters, eclats, ressources, etatInvocations, etatDonjon } from "../services/partie.js";
const partie_cristaux = () => etatDonjon()?.cristaux ?? 0;

// Le lexique des ressources : a quoi sert chaque monnaie et comment l'obtenir
function lignesLexique() {
  const e = etatEnergie() ?? { valeur: 0, max: 0 };
  const b = etatBoosters() ?? { tickets: 0, dores: 0, poussiere: 0 };
  const r = ressources();
  const n = (x) => Number(x ?? 0).toLocaleString("fr-FR");
  return [
    ["Énergie", `${e.valeur} / ${e.max}`, "Payée seulement quand tu gagnes un combat (campagne 6, Tour 4, chasse 3).", "+1 toutes les 3 min, missions, défi du jour, calendrier, recharge à l'encre. Première victoire d'une étape et nouveaux étages de la Tour : gratuits."],
    ["Encre", n(encre()), "Acheter des boosters (100 l'un) et recharger l'énergie.", "Chaque victoire, l'expédition, les coffres, les missions."],
    ["Invocations", `${n(etatInvocations()?.reserve)} / ${n(etatInvocations()?.max)}`, "Invoquer une carte à l'Autel (onglet Invocations).", "+1 toutes les 3 min (réserve de 120), +1 par combat gagné, bonus des missions du jour."],
    ["Potions", ["chance", "bordure", "vitesse"].map((id) => n(etatInvocations()?.potions[id])).join(" / "), "Chance ×1,5, bordures ×3 ou invocations 2× plus rapides pendant 5 min.", "12 % des victoires, bonus des missions du jour, ou distillées avec la poussière à l'Autel."],
    ["Tickets de booster", n(b.tickets), "Ouvrir un booster gratuitement.", "1 toutes les 30 min (réserve de 16), chapitres finis, missions, événements, guide."],
    ["Tickets dorés", n(b.dores), "Ouvrir un booster doré : 3 cartes Épiques ou Légendaires.", "Très rarement dans un booster (0,3 %). Ils ne s'obtiennent plus en récompense."],
    ["Poussière", n(b.poussiere), "Fabriquer à l'Atelier la carte de ton choix.", "Chaque booster ouvert, et surtout les doublons (plus la carte est rare, plus elle en donne)."],
    ["Cristaux du donjon", n(partie_cristaux()), "Acheter les maîtrises permanentes du Donjon d'encre.", "Chaque étage gagné dans le donjon (gardés en entier si tu sors, à moitié si tu tombes)."],
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
        <button type="button" class="choix-segmente__option" data-ouvrir-tuto>Tutoriel</button>
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
    if (ev.target.closest("[data-ouvrir-tuto]")) { voile.remove(); return ouvrirTutoriel(); }
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
  { ecran: "tirages", nom: "Invocations" },
  { ecran: "collection", nom: "Collection" },
  { ecran: "social", nom: "Social" },
  { ecran: "reglages", nom: "Réglages" },
];

const ICONE_COMPTE = '<svg class="navigation__compte-icone" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="currentColor"/></svg>';
const echapper = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function htmlBoutonCompte() {
  if (!enLigneDisponible()) return "";
  return connecte()
    ? `<button type="button" class="navigation__compte navigation__compte--connecte" data-ouvrir-compte title="Ton compte : ${echapper(pseudoConnecte())}" aria-label="Ton compte : ${echapper(pseudoConnecte())}"><span class="navigation__compte-avatar" aria-hidden="true">${echapper(pseudoConnecte().slice(0, 1).toUpperCase())}</span><span class="navigation__compte-nom">${echapper(pseudoConnecte())}</span></button>`
    : `<button type="button" class="navigation__compte" data-ouvrir-compte aria-label="Se connecter ou créer un compte">${ICONE_COMPTE}<span class="navigation__compte-nom">Connexion</span></button>`;
}

export function htmlNavigation(actif) {
  return `
    <nav class="navigation" aria-label="Menu du jeu">
      <button type="button" class="navigation__logo" data-nav="accueil" aria-label="Retour à l'accueil">Crossover</button>
      <div class="navigation__onglets">
        ${ONGLETS.map((o) => `
          <button type="button" class="navigation__onglet" data-nav="${o.ecran}" ${o.ecran === actif ? 'aria-current="page"' : ""}>${o.nom}${o.ecran === "tirages" ? '<span class="pastille-tirage" data-pastille></span>' : ""}${o.ecran === "qg" ? '<span class="pastille-tirage" data-pastille-qg hidden>!</span>' : ""}${o.ecran === "social" ? '<span class="pastille-tirage" data-pastille-social hidden></span>' : ""}</button>
        `).join("")}
      </div>
      <p class="compteur-energie" title="Énergie : les combats en coûtent (payée seulement à la victoire), +1 toutes les 3 minutes"><svg class="compteur-energie__eclair" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg><span data-energie>${etatEnergie()?.valeur ?? 0}/${etatEnergie()?.max ?? 0}</span><span class="visuellement-cache"> d'énergie</span></p>
      ${htmlBoutonCompte()}
      <button type="button" class="navigation__aide" data-lexique aria-label="Aide : tes ressources et comment devenir plus fort" title="Aide">?</button>
      <p class="compteur-encre navigation__encre"><span class="compteur-encre__goutte" aria-hidden="true"></span><span data-encre>${encre().toLocaleString("fr-FR")}</span><span class="visuellement-cache"> d'encre</span></p>
    </nav>
  `;
}

// Branche les clics de la barre, et renvoie une fonction pour mettre l'encre a jour
export function brancherNavigation(conteneur, naviguer, actif) {
  conteneur.addEventListener("click", (e) => {
    if (e.target.closest("[data-lexique]")) return ouvrirLexique();
    if (e.target.closest("[data-ouvrir-compte]")) return ouvrirCompte();
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
    const pastilleSocial = conteneur.querySelector("[data-pastille-social]");
    if (pastilleSocial) {
      const n = nonLusEnMemoire();
      pastilleSocial.textContent = n > 9 ? "9+" : String(n);
      pastilleSocial.hidden = n === 0;
      pastilleSocial.setAttribute("aria-label", n ? `${n} message${n > 1 ? "s" : ""} privé${n > 1 ? "s" : ""} non lu${n > 1 ? "s" : ""}` : "");
    }
    const pastilleQg = conteneur.querySelector("[data-pastille-qg]");
    if (pastilleQg) {
      const aReclamer = quelqueChoseAReclamer();
      pastilleQg.hidden = !aReclamer;
      pastilleQg.setAttribute("aria-label", aReclamer ? "des gains t'attendent" : "");
    }
  };
  maj();
  // Les messages prives non lus arrivent en arriere-plan
  const surNonLus = () => { if (conteneur.isConnected) maj(); else window.removeEventListener("crossover:non-lus", surNonLus); };
  window.addEventListener("crossover:non-lus", surNonLus);
  // Connexion ou deconnexion : le bouton du compte change
  const surCompte = () => {
    if (!conteneur.isConnected) return window.removeEventListener("crossover:compte", surCompte);
    conteneur.querySelector("[data-ouvrir-compte]")?.replaceWith(Object.assign(document.createElement("template"), { innerHTML: htmlBoutonCompte() }).content);
    maj();
  };
  window.addEventListener("crossover:compte", surCompte);
  return maj;
}
