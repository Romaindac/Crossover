// ==========================================================
// HOTEL DES VENTES (onglet de la Collection)
// Acheter, vendre et suivre ses ventes d'equipement, contre de l'encre.
// L'encre et l'inventaire restent dans la partie locale : le serveur
// garde les annonces, verifie les objets et rend chaque achat unique.
// ==========================================================

import { RARETES, ORDRE_RARETES } from "../donnees/raretes.js";
import { EMPLACEMENTS, ORDRE_EMPLACEMENTS } from "../donnees/equipement.js";
import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { nomPiece, objetDe, qualiteJet } from "../moteur/equipement.js";
import {
  inventaire, encre, objetAVendre, enleverPiece, recevoirPiece, depenserEncre, gagnerEncre,
} from "../services/partie.js";
import {
  enLigneDisponible, connecte, monId, annonces, mesVentes, mettreEnVente, acheterVente, retirerVente,
  recupererGains, DUREE_VENTE_JOURS, TAXE_VENTE, PRIX_VENTE,
} from "../services/enligne.js";
import { htmlDetailsPiece, iconeEmplacement, htmlPieceCarte } from "./equipement-ui.js";
import { ouvrirCompte } from "./compte.js";

const echapper = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const PRIX_DE_BASE = { commun: 40, peu_commun: 90, rare: 220, epique: 600, legendaire: 1800 };

// Un prix indicatif : rarete, amelioration et qualite du jet
export function prixConseille(p) {
  const base = PRIX_DE_BASE[p.rarete] ?? 50;
  const v = base * (1 + 0.12 * (p.niveau ?? 0)) * (0.8 + 0.4 * qualiteJet(p));
  return Math.max(PRIX_VENTE.min, Math.min(PRIX_VENTE.max, Math.round(v / 5) * 5));
}

const restant = (cree) => {
  const ms = new Date(cree).getTime() + DUREE_VENTE_JOURS * 86400000 - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  return h >= 24 ? `${Math.floor(h / 24)} j ${h % 24} h` : `${Math.max(1, h)} h`;
};

// zone : ou dessiner ; options : naviguer (vers le compte), apresChangement (encre, inventaire),
// vendreUid (ouvrir directement la vente de cet objet)
export function afficherHotel(zone, { naviguer, apresChangement = () => {}, vendreUid = null }) {
  let vue = vendreUid ? "vendre" : "acheter";
  let filtres = { emplacement: "tous", rarete: "toutes", tri: "recent" };
  let liste = null;            // annonces chargees
  let miennes = null;          // mes ventes
  let message = "";
  let erreur = false;

  if (!enLigneDisponible() || !connecte()) {
    zone.innerHTML = `
      <div class="hotel hotel--ferme">
        <h2 class="hotel__titre">Hôtel des ventes</h2>
        <p class="case__aide">${enLigneDisponible()
          ? "Achète et vends de l'équipement aux autres joueurs, contre de l'encre. Il faut un compte (juste un pseudo et un mot de passe)."
          : "L'hôtel des ventes ouvrira avec les comptes en ligne."}</p>
        ${enLigneDisponible() ? '<button type="button" class="bouton bouton--obi-petit" data-hv="compte">Créer mon compte</button>' : ""}
      </div>`;
    zone.onclick = (e) => { if (e.target.closest("[data-hv='compte']")) ouvrirCompte(); };
    return;
  }

  const carte = (p, { prix = null, vendeur = null, action = "", id = "", info = "" } = {}) => htmlPieceCarte(p, {
    attributs: `data-hv="${action}" data-id="${id}"`,
    prix,
    sousTexte: `${vendeur ? `par ${echapper(vendeur)}` : ""}${vendeur && info ? " · " : ""}${info}`,
  });

  function rendre() {
    const gains = (miennes ?? []).filter((v) => v.statut === "vendue" && !v.recupere).reduce((s, v) => s + Math.floor(v.prix * (1 - TAXE_VENTE)), 0);
    const option = (val, texte, actuel) => `<option value="${val}" ${val === actuel ? "selected" : ""}>${texte}</option>`;
    let corps = "";
    if (vue === "acheter") {
      corps = `
        <div class="inventaire__filtres">
          <div class="filtres" role="group" aria-label="Emplacement">
            ${["tous", ...ORDRE_EMPLACEMENTS].map((e) => `<button type="button" class="filtre" data-hv="f-emplacement" data-valeur="${e}" aria-pressed="${filtres.emplacement === e}">${e === "tous" ? "Tout" : `${iconeEmplacement(e)}${EMPLACEMENTS[e].nom}`}</button>`).join("")}
          </div>
          <label class="champ-compact">Rareté
            <select data-hv-select="rarete">${option("toutes", "Toutes", filtres.rarete)}${ORDRE_RARETES.map((r) => option(r, RARETES[r].nom, filtres.rarete)).join("")}</select>
          </label>
          <label class="champ-compact">Tri
            <select data-hv-select="tri">${option("recent", "Plus récentes", filtres.tri)}${option("prix-bas", "Prix croissant", filtres.tri)}${option("prix-haut", "Prix décroissant", filtres.tri)}</select>
          </label>
        </div>
        ${liste === null ? '<p class="case__aide">Chargement des annonces…</p>'
          : !liste.length ? '<p class="case__aide">Aucune annonce pour ces filtres. Sois le premier à vendre !</p>'
          : `<div class="inventaire">${liste.map((v) => carte(v.objet, { prix: v.prix, vendeur: v.vendeur === monId() ? "toi" : v.pseudo, action: "annonce", id: v.id, info: restant(v.cree) ? `encore ${restant(v.cree)}` : "" })).join("")}</div>`}`;
    } else if (vue === "vendre") {
      const pieces = inventaire().filter((p) => !p.verrou);
      corps = `
        <p class="case__aide">Choisis un objet à vendre. Il reste ${DUREE_VENTE_JOURS} jours en vente ; tu peux le retirer à tout moment. Taxe de ${Math.round(TAXE_VENTE * 100)} % sur le prix de vente. 5 mises en vente par jour, 8 objets en vente en même temps au maximum. Les objets verrouillés n'apparaissent pas.</p>
        ${pieces.length ? `<div class="inventaire">${pieces.map((p) => carte(p, { action: "choisir", id: p.uid, info: p.porteur ? `porté par ${PERSOS_PAR_ID[p.porteur]?.nom ?? "?"}` : "" })).join("")}</div>`
          : '<p class="case__aide">Aucun objet à vendre : va chasser dans l\'Aventure.</p>'}`;
    } else {
      corps = `
        ${gains ? `<div class="hotel__gains"><span>Tes ventes ont rapporté <strong>${nombre(gains)} d'encre</strong> (taxe déduite).</span><button type="button" class="bouton bouton--obi-petit" data-hv="encaisser">Encaisser</button></div>` : ""}
        ${miennes === null ? '<p class="case__aide">Chargement…</p>'
          : !miennes.length ? '<p class="case__aide">Tu n\'as encore rien mis en vente.</p>'
          : `<ul class="hotel__mes-ventes">${miennes.map((v) => {
            const expiree = v.statut === "en_vente" && !restant(v.cree);
            const etat = v.statut === "vendue" ? (v.recupere ? "Vendue, encre encaissée" : "Vendue ! Encre à encaisser")
              : v.statut === "retiree" ? "Retirée" : expiree ? "Expirée : récupère ton objet" : `En vente, encore ${restant(v.cree)}`;
            return `
              <li class="hotel__vente hotel__vente--${v.statut}${expiree ? " hotel__vente--expiree" : ""}">
                <span class="hotel__vente-nom">${iconeEmplacement(v.objet.emplacement)}${nomPiece(v.objet)}${v.objet.niveau ? ` +${v.objet.niveau}` : ""}</span>
                <span class="hotel__vente-prix"><span class="compteur-encre__goutte" aria-hidden="true"></span>${nombre(v.prix)}</span>
                <span class="hotel__vente-etat">${etat}</span>
                ${v.statut === "en_vente" ? `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-hv="retirer" data-id="${v.id}">${expiree ? "Récupérer" : "Retirer"}</button>` : ""}
              </li>`;
          }).join("")}</ul>`}`;
    }
    zone.innerHTML = `
      <div class="hotel">
        <div class="hotel__entete">
          <h2 class="hotel__titre">Hôtel des ventes</h2>
          <p class="hotel__encre"><span class="compteur-encre__goutte" aria-hidden="true"></span><strong>${nombre(encre())}</strong> d'encre</p>
        </div>
        <div class="choix-segmente choix-segmente--gauche" role="tablist" aria-label="Hôtel des ventes">
          ${[["acheter", "Acheter"], ["vendre", "Vendre"], ["miennes", `Mes ventes${gains ? " (!)" : ""}`]].map(([k, t]) => `<button type="button" role="tab" class="choix-segmente__option" data-hv="vue" data-valeur="${k}" aria-selected="${vue === k}">${t}</button>`).join("")}
        </div>
        <p class="case__message ${erreur ? "case__message--erreur" : ""}" role="status" aria-live="polite">${message}</p>
        ${corps}
      </div>
      <div class="hotel__fenetre-zone"></div>`;
  }

  // ---------- Fenetres ----------
  const fenetre = (html) => { zone.querySelector(".hotel__fenetre-zone").innerHTML = `<div class="voile hotel__voile" data-hv="fermer"><div class="resultat fenetre-piece" role="dialog" aria-modal="true">${html}</div></div>`; };
  const fermer = () => { const z = zone.querySelector(".hotel__fenetre-zone"); if (z) z.innerHTML = ""; };

  function ouvrirAnnonce(v) {
    const mien = v.vendeur === monId();
    const assez = encre() >= v.prix;
    fenetre(`
      ${htmlDetailsPiece({ ...v.objet, uid: "annonce" })}
      <p class="hotel__fenetre-prix">Prix : <span class="compteur-encre__goutte" aria-hidden="true"></span><strong>${nombre(v.prix)}</strong> d'encre · vendu par ${mien ? "toi" : echapper(v.pseudo)}</p>
      <div class="fenetre-piece__actions">
        ${mien ? '<p class="case__aide">C\'est ton annonce : retire-la depuis « Mes ventes ».</p>'
          : `<button type="button" class="bouton bouton--obi bouton--petit-texte" data-hv="acheter" data-id="${v.id}" ${assez ? "" : "disabled"}>${assez ? `Acheter pour ${nombre(v.prix)} d'encre` : `Il te manque ${nombre(v.prix - encre())} d'encre`}</button>`}
        <button type="button" class="bouton bouton--clair bouton--petit-texte" data-hv="fermer">Fermer</button>
      </div>`);
  }

  function ouvrirVente(uid) {
    const prep = objetAVendre(uid);
    if (!prep.ok) { message = prep.erreur; erreur = true; return rendre(); }
    const p = inventaire().find((x) => x.uid === uid);
    const conseil = prixConseille(p);
    fenetre(`
      ${htmlDetailsPiece(p)}
      <form class="hotel__form-vente" data-uid="${uid}">
        <label class="champ-social">Prix en encre
          <input type="number" name="prix" min="${PRIX_VENTE.min}" max="${PRIX_VENTE.max}" step="5" value="${conseil}" required>
        </label>
        <p class="case__aide">Prix conseillé : ${nombre(conseil)} d'encre. Tu recevras <strong data-net>${nombre(conseil * (1 - TAXE_VENTE))}</strong> d'encre une fois vendu (taxe de ${Math.round(TAXE_VENTE * 100)} %).${prep.porteur ? ` Il sera retiré de ${PERSOS_PAR_ID[prep.porteur]?.nom ?? "son porteur"}.` : ""}</p>
        <div class="fenetre-piece__actions">
          <button type="submit" class="bouton bouton--obi bouton--petit-texte">Mettre en vente</button>
          <button type="button" class="bouton bouton--clair bouton--petit-texte" data-hv="fermer">Annuler</button>
        </div>
      </form>`);
  }

  // ---------- Chargements ----------
  async function chargerAnnonces() {
    liste = null; rendre();
    try { liste = await annonces(filtres); } catch (e) { liste = []; message = e.message; erreur = true; }
    rendre();
  }
  async function chargerMiennes() {
    try { miennes = await mesVentes(); } catch (e) { miennes = []; message = e.message; erreur = true; }
    rendre();
  }
  const info = (texte, estErreur = false) => { message = texte; erreur = estErreur; };

  // ---------- Evenements ----------
  zone.onclick = async (e) => {
    const cible = e.target.closest("[data-hv]");
    if (!cible) return;
    const a = cible.dataset.hv;
    if (a === "fermer") { if (e.target === cible || cible.tagName === "BUTTON") fermer(); return; }
    if (a === "vue") { vue = cible.dataset.valeur; info(""); if (vue === "acheter") chargerAnnonces(); else if (vue === "miennes") { miennes = null; rendre(); chargerMiennes(); } else rendre(); return; }
    if (a === "f-emplacement") { filtres.emplacement = cible.dataset.valeur; return chargerAnnonces(); }
    if (a === "annonce") { const v = liste?.find((x) => String(x.id) === cible.dataset.id); if (v) ouvrirAnnonce(v); return; }
    if (a === "choisir") return ouvrirVente(cible.dataset.id);
    cible.disabled = true;
    try {
      if (a === "acheter") {
        const v = liste.find((x) => String(x.id) === cible.dataset.id);
        if (!v || !depenserEncre(v.prix)) { info("Pas assez d'encre.", true); fermer(); return rendre(); }
        try {
          const r = await acheterVente(v.id);
          const piece = recevoirPiece(r.objet);
          info(`Achat réussi : ${piece ? nomPiece(piece) : "objet"} ajouté à ton inventaire.`);
        } catch (err) {
          gagnerEncre(v.prix);   // rendu : l'achat n'a pas eu lieu
          info(err.message, true);
        }
        fermer(); apresChangement(); return chargerAnnonces();
      }
      if (a === "retirer") {
        const objet = await retirerVente(cible.dataset.id);
        recevoirPiece(objet);
        info("Objet retiré de la vente et rendu à ton inventaire.");
        apresChangement(); return chargerMiennes();
      }
      if (a === "encaisser") {
        const n = await recupererGains();
        gagnerEncre(n);
        info(n ? `+${nombre(n)} d'encre encaissée !` : "Rien à encaisser pour l'instant.");
        apresChangement(); return chargerMiennes();
      }
    } catch (err) {
      info(err.message, true); fermer(); rendre();
    } finally {
      cible.disabled = false;
    }
  };

  zone.onchange = (e) => {
    const s = e.target.closest("[data-hv-select]");
    if (s) { filtres[s.dataset.hvSelect] = s.value; chargerAnnonces(); }
  };

  zone.oninput = (e) => {
    if (e.target.name === "prix") {
      const net = zone.querySelector("[data-net]");
      if (net) net.textContent = nombre((Number(e.target.value) || 0) * (1 - TAXE_VENTE));
    }
  };

  zone.onsubmit = async (e) => {
    const form = e.target.closest(".hotel__form-vente");
    if (!form) return;
    e.preventDefault();
    const uid = form.dataset.uid;
    const prix = Math.round(Number(new FormData(form).get("prix")));
    if (!(prix >= PRIX_VENTE.min && prix <= PRIX_VENTE.max)) { info(`Prix entre ${PRIX_VENTE.min} et ${nombre(PRIX_VENTE.max)} d'encre.`, true); fermer(); return rendre(); }
    const prep = objetAVendre(uid);
    if (!prep.ok) { info(prep.erreur, true); fermer(); return rendre(); }
    form.querySelector("[type=submit]").disabled = true;
    try {
      await mettreEnVente(prep.objet, prix);
      enleverPiece(uid);
      info(`${nomPiece(prep.objet)} est en vente pour ${nombre(prix)} d'encre.`);
      apresChangement();
    } catch (err) {
      info(err.message, true);
    }
    fermer(); rendre();
  };

  rendre();
  if (vue === "acheter") chargerAnnonces();
  chargerMiennes();
  if (vendreUid) ouvrirVente(vendreUid);
}
