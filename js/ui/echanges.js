// ==========================================================
// ECHANGES DE CARTES (onglet Social)
// Proposer une copie en trop d'un perso contre un perso de meme
// rarete, accepter l'offre d'un autre joueur, suivre ses offres.
// Les collections restent dans le navigateur : le serveur garde les
// offres et rend chaque acceptation unique.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES, ORDRE_RARETES } from "../donnees/raretes.js";
import { styleSerie, varsSerie } from "../donnees/series.js";
import { possede, copiesEnTrop, retirerCopie, recevoirCarte, idsPossedes } from "../services/partie.js";
import {
  enLigneDisponible, connecte, monId, offresEchange, mesEchanges, proposerEchange, accepterEchange, annulerEchange,
  recupererEchanges, DUREE_ECHANGE_JOURS,
} from "../services/enligne.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait } from "./cartes.js";
import { ouvrirCompte } from "./compte.js";

const echapper = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const restant = (cree) => {
  const ms = new Date(cree).getTime() + DUREE_ECHANGE_JOURS * 86400000 - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  return h >= 24 ? `${Math.floor(h / 24)} j` : `${Math.max(1, h)} h`;
};
const triPersos = (a, b) => RARETES[b.rarete].ordre - RARETES[a.rarete].ordre || a.nom.localeCompare(b.nom);

function htmlMiniCarte(id, legende = "") {
  const p = PERSOS_PAR_ID[id];
  if (!p) return "";
  return `
    <span class="echange__carte" style="${varsSerie(p.serie)}">
      <span class="echange__portrait">${htmlPortrait(p)}</span>
      <span class="echange__nom">${p.nom}</span>
      <span class="echange__info"><span class="autel__taux autel__taux--${p.rarete}">${RARETES[p.rarete].nom}</span> ${styleSerie(p.serie).abrege}</span>
      ${legende ? `<span class="echange__legende">${legende}</span>` : ""}
    </span>`;
}

export function afficherEchanges(zone, { apresChangement = () => {} } = {}) {
  let vue = "offres";
  let offres = null;
  let miennes = null;
  let message = "";
  let erreur = false;
  let donne = "";
  let veut = "";
  let filtre = "pour-moi";

  if (!enLigneDisponible() || !connecte()) {
    zone.innerHTML = `
      <div class="hotel hotel--ferme">
        <h2 class="hotel__titre">Échanges de cartes</h2>
        <p class="case__aide">${enLigneDisponible()
          ? "Échange tes doublons contre les persos qui te manquent, avec les autres joueurs. Il faut un compte (juste un pseudo et un mot de passe)."
          : "Les échanges ouvriront avec les comptes en ligne."}</p>
        ${enLigneDisponible() ? '<button type="button" class="bouton bouton--obi-petit" data-ech="compte">Créer mon compte</button>' : ""}
      </div>`;
    zone.onclick = (e) => { if (e.target.closest("[data-ech='compte']")) ouvrirCompte(); };
    return;
  }

  const dire = (texte, estErreur = false) => { message = texte; erreur = estErreur; };

  // Les cartes recues pour mes offres acceptees arrivent dans la collection
  async function recuperer() {
    try {
      const recues = await recupererEchanges();
      for (const r of recues ?? []) recevoirCarte(r.veut);
      if (recues?.length) {
        dire(`Échange conclu ! Tu reçois ${recues.map((r) => `${PERSOS_PAR_ID[r.veut]?.nom ?? r.veut} (de ${echapper(r.de)})`).join(", ")}.`);
        apresChangement();
      }
    } catch { /* on reessaiera */ }
  }

  async function charger() {
    zone.querySelector(".echanges__liste")?.classList.add("echanges__liste--charge");
    try {
      await recuperer();
      [offres, miennes] = await Promise.all([offresEchange(), mesEchanges()]);
    } catch (e) {
      dire(e.message, true);
    }
    rendre();
  }

  function htmlOnglets() {
    return `
      <div class="choix-segmente choix-segmente--gauche" role="tablist" aria-label="Échanges">
        <button type="button" role="tab" class="choix-segmente__option" data-ech="vue" data-vue="offres" aria-checked="${vue === "offres"}">Offres des joueurs</button>
        <button type="button" role="tab" class="choix-segmente__option" data-ech="vue" data-vue="proposer" aria-checked="${vue === "proposer"}">Proposer</button>
        <button type="button" role="tab" class="choix-segmente__option" data-ech="vue" data-vue="miennes" aria-checked="${vue === "miennes"}">Mes échanges</button>
      </div>`;
  }

  function htmlOffres() {
    if (!offres) return '<p class="case__aide">Chargement…</p>';
    const moi = monId();
    let liste = offres.filter((o) => o.auteur !== moi && PERSOS_PAR_ID[o.donne] && PERSOS_PAR_ID[o.veut] && restant(o.cree));
    if (filtre === "pour-moi") liste = liste.filter((o) => copiesEnTrop(o.veut) > 0);
    if (filtre === "manquants") liste = liste.filter((o) => !possede(o.donne));
    return `
      <div class="choix-segmente choix-segmente--gauche" role="radiogroup" aria-label="Filtre">
        <button type="button" role="radio" class="choix-segmente__option" data-ech="filtre" data-valeur="pour-moi" aria-checked="${filtre === "pour-moi"}">Que je peux accepter</button>
        <button type="button" role="radio" class="choix-segmente__option" data-ech="filtre" data-valeur="manquants" aria-checked="${filtre === "manquants"}">Persos qui me manquent</button>
        <button type="button" role="radio" class="choix-segmente__option" data-ech="filtre" data-valeur="toutes" aria-checked="${filtre === "toutes"}">Toutes</button>
      </div>
      <div class="echanges__liste">
        ${liste.length ? liste.map((o) => {
          const peut = copiesEnTrop(o.veut) > 0;
          return `
            <article class="echange">
              <p class="echange__auteur"><b>${echapper(o.pseudo)}</b> · encore ${restant(o.cree)}</p>
              <div class="echange__sens">
                ${htmlMiniCarte(o.donne, possede(o.donne) ? "tu l'as déjà : une étoile" : "nouveau pour toi !")}
                <span class="echange__fleche" aria-label="contre">⇄</span>
                ${htmlMiniCarte(o.veut, peut ? `tu en as ${copiesEnTrop(o.veut)} en trop` : "pas de copie en trop")}
              </div>
              <button type="button" class="bouton bouton--obi-petit" data-ech="accepter" data-id="${o.id}" ${peut ? "" : "disabled"}>Accepter l'échange</button>
            </article>`;
        }).join("") : `<p class="case__aide">${filtre === "pour-moi" ? "Aucune offre que tu peux accepter pour l'instant. Regarde « Toutes », ou propose la tienne." : "Aucune offre pour l'instant : propose la tienne !"}</p>`}
      </div>`;
  }

  function htmlProposer() {
    const aDonner = idsPossedes().filter((id) => PERSOS_PAR_ID[id] && copiesEnTrop(id) > 0).map((id) => PERSOS_PAR_ID[id]).sort(triPersos);
    const choixDonne = PERSOS_PAR_ID[donne];
    const aVouloir = choixDonne ? PERSOS.filter((p) => p.rarete === choixDonne.rarete && p.id !== donne).sort((a, b) => Number(possede(a.id)) - Number(possede(b.id)) || a.nom.localeCompare(b.nom)) : [];
    return `
      <p class="case__aide">Tu donnes une <b>copie en trop</b> (un doublon : jamais le perso lui-même) contre un perso de <b>même rareté</b>. Ta copie part tout de suite ; si personne n'accepte, annule l'offre pour la récupérer. Une offre dure ${DUREE_ECHANGE_JOURS} jours.</p>
      <form class="echanges__formulaire" id="form-echange">
        <label class="champ-social">Je donne
          <select name="donne">
            <option value="">Choisis une carte en trop…</option>
            ${ORDRE_RARETES.map((r) => {
              const groupe = aDonner.filter((p) => p.rarete === r);
              return groupe.length ? `<optgroup label="${RARETES[r].nom}">${groupe.map((p) => `<option value="${p.id}" ${p.id === donne ? "selected" : ""}>${p.nom} (${copiesEnTrop(p.id)} en trop)</option>`).join("")}</optgroup>` : "";
            }).join("")}
          </select>
        </label>
        <label class="champ-social">Je veux
          <select name="veut" ${choixDonne ? "" : "disabled"}>
            <option value="">${choixDonne ? `Un perso ${RARETES[choixDonne.rarete].nom}…` : "Choisis d'abord ce que tu donnes"}</option>
            ${aVouloir.map((p) => `<option value="${p.id}" ${p.id === veut ? "selected" : ""}>${p.nom} · ${p.serie}${possede(p.id) ? "" : " (manquant)"}</option>`).join("")}
          </select>
        </label>
        <div class="echanges__apercu">${donne ? htmlMiniCarte(donne, "tu donnes") : ""}${donne && veut ? '<span class="echange__fleche">⇄</span>' : ""}${veut ? htmlMiniCarte(veut, "tu reçois") : ""}</div>
        <button type="submit" class="bouton bouton--obi-petit" ${donne && veut ? "" : "disabled"}>Publier l'offre</button>
      </form>
      ${aDonner.length ? "" : '<p class="case__aide">Tu n\'as encore aucune copie en trop : elles viennent des doublons (invocations, boosters).</p>'}`;
  }

  function htmlMiennes() {
    if (!miennes) return '<p class="case__aide">Chargement…</p>';
    const moi = monId();
    return `
      <div class="echanges__liste">
        ${miennes.length ? miennes.map((o) => {
          const auteur = o.auteur === moi;
          const etat = o.statut === "ouvert" ? (restant(o.cree) ? `ouverte, encore ${restant(o.cree)}` : "expirée : annule-la pour récupérer ta carte")
            : o.statut === "annule" ? "annulée" : auteur ? `acceptée par ${echapper(o.pseudo_accepteur)}` : `acceptée (offre de ${echapper(o.pseudo)})`;
          return `
            <article class="echange echange--${o.statut}">
              <p class="echange__auteur">${auteur ? "Ton offre" : "Offre acceptée"} · ${etat}</p>
              <div class="echange__sens">
                ${htmlMiniCarte(auteur ? o.donne : o.veut, "donné")}
                <span class="echange__fleche">⇄</span>
                ${htmlMiniCarte(auteur ? o.veut : o.donne, o.statut === "accepte" ? "reçu" : "voulu")}
              </div>
              ${auteur && o.statut === "ouvert" ? `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-ech="annuler" data-id="${o.id}">Annuler et récupérer ma carte</button>` : ""}
            </article>`;
        }).join("") : '<p class="case__aide">Aucun échange pour l\'instant.</p>'}
      </div>`;
  }

  function rendre() {
    zone.innerHTML = `
      <div class="hotel echanges">
        <div class="hotel__tete">
          <h2 class="hotel__titre">Échanges de cartes</h2>
          <button type="button" class="bouton-texte" data-ech="actualiser">Actualiser</button>
        </div>
        ${htmlOnglets()}
        ${message ? `<p class="case__message ${erreur ? "case__message--erreur" : ""}" role="status">${message}</p>` : ""}
        ${vue === "offres" ? htmlOffres() : vue === "proposer" ? htmlProposer() : htmlMiennes()}
      </div>`;
    chargerPortraits((id) => rafraichirPortrait(zone, id));
  }

  zone.onclick = async (e) => {
    const b = e.target.closest("[data-ech]");
    if (!b || b.disabled) return;
    const a = b.dataset.ech;
    if (a === "vue") { vue = b.dataset.vue; dire(""); rendre(); }
    if (a === "filtre") { filtre = b.dataset.valeur; rendre(); }
    if (a === "actualiser") { dire(""); charger(); }
    if (a === "accepter") {
      const o = offres?.find((x) => String(x.id) === b.dataset.id);
      if (!o || copiesEnTrop(o.veut) <= 0) return;
      b.disabled = true;
      try {
        await accepterEchange(o.id);
        retirerCopie(o.veut);
        const r = recevoirCarte(o.donne);
        dire(`Échange fait avec ${echapper(o.pseudo)} : tu donnes ${PERSOS_PAR_ID[o.veut].nom}, tu reçois ${PERSOS_PAR_ID[o.donne].nom}${r?.nouveau ? " (nouveau perso !)" : ""}.`);
        apresChangement();
      } catch (err) {
        dire(err.message, true);
      }
      charger();
    }
    if (a === "annuler") {
      b.disabled = true;
      try {
        const id = await annulerEchange(b.dataset.id);
        recevoirCarte(id);
        dire(`Offre annulée : ${PERSOS_PAR_ID[id]?.nom ?? "ta carte"} revient dans ta collection.`);
        apresChangement();
      } catch (err) {
        dire(err.message, true);
      }
      charger();
    }
  };

  zone.onchange = (e) => {
    if (e.target.name === "donne") { donne = e.target.value; veut = ""; rendre(); }
    if (e.target.name === "veut") { veut = e.target.value; rendre(); }
  };

  zone.onsubmit = async (e) => {
    e.preventDefault();
    if (!donne || !veut || copiesEnTrop(donne) <= 0) return;
    const bouton = zone.querySelector("#form-echange [type=submit]");
    bouton.disabled = true;
    try {
      await proposerEchange(donne, veut);
      retirerCopie(donne);
      dire(`Offre publiée : ${PERSOS_PAR_ID[donne].nom} contre ${PERSOS_PAR_ID[veut].nom}. Ta copie est mise de côté jusqu'à l'échange.`);
      donne = ""; veut = ""; vue = "miennes";
      apresChangement();
    } catch (err) {
      dire(err.message, true);
    }
    charger();
  };

  rendre();
  charger();
}
