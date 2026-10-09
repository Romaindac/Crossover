// ==========================================================
// BULLE DE CHAT : toujours la, en bas a droite (comme sur
// beaucoup de sites). Fermee, elle compte les nouveaux messages
// (canal General et messages prives) et montre un apercu du
// dernier. Ouverte, c'est le meme chat que l'onglet Social.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import {
  enLigneDisponible, connecte, monId, messagesCanal, nonLusEnMemoire, rafraichirNonLus,
} from "../services/enligne.js";
import { lire, ecrire } from "../services/sauvegarde.js";
import { chargerPortraits } from "../services/portraits.js";
import { brancherChat } from "./chat.js";
import { ouvrirCompte } from "./compte.js";
import { rafraichirPortrait } from "./cartes.js";
import { htmlCarteVitrine, htmlResume } from "../ecrans/ecran-social.js";

const CLE_VU = "chat-general-vu";     // dernier message du General deja vu
const ATTENTE_FERMEE = 30000;         // fermee : un coup d'oeil au General toutes les 30 s
const ECRANS_SANS_BULLE = ["combat", "debut", "vitrine"];
const echapper = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ICONE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H9l-5 4v-4a2 2 0 01-2-2V6a2 2 0 012-2z" fill="currentColor"/><circle cx="8" cy="11" r="1.4" fill="var(--encre)"/><circle cx="12" cy="11" r="1.4" fill="var(--encre)"/><circle cx="16" cy="11" r="1.4" fill="var(--encre)"/></svg>`;

let racine = null;
let ouverte = false;
let arreterChat = null;
let ecranActuel = "accueil";
let nouveauxGeneral = 0;
let minuteur = null;
let naviguerVers = null;

// La vitrine d'un joueur, par-dessus tout le jeu
function ouvrirJoueur(j) {
  const cartes = (Array.isArray(j.vitrine) ? j.vitrine : []).filter((c) => PERSOS_PAR_ID[c?.id]);
  const voile = document.createElement("div");
  voile.className = "voile voile--bulle";
  voile.innerHTML = `
    <div class="resultat vitrine-joueur" role="dialog" aria-modal="true" aria-label="Vitrine de ${echapper(j.pseudo)}">
      <h2 class="resultat__titre">Vitrine de ${echapper(j.pseudo)}</h2>
      ${htmlResume(j)}
      <div class="vitrine-grille">${cartes.length ? cartes.map(htmlCarteVitrine).join("") : '<p class="reglage__aide">Vitrine vide.</p>'}</div>
      <div class="resultat__actions"><button type="button" class="bouton bouton--clair" data-fermer>Fermer</button></div>
    </div>`;
  voile.addEventListener("click", (e) => { if (e.target === voile || e.target.closest("[data-fermer]")) voile.remove(); });
  document.body.append(voile);
  voile.querySelector("[data-fermer]").focus();
  chargerPortraits((id) => rafraichirPortrait(voile, id));
}

function majPastille() {
  if (!racine) return;
  const n = (ouverte ? 0 : nouveauxGeneral) + (nonLusEnMemoire() || 0);
  const pastille = racine.querySelector(".bulle-chat__pastille");
  pastille.textContent = n > 9 ? "9+" : String(n);
  pastille.hidden = n === 0;
  racine.querySelector(".bulle-chat__bouton").setAttribute("aria-label", n ? `Ouvrir le chat : ${n} nouveau${n > 1 ? "x" : ""} message${n > 1 ? "s" : ""}` : "Ouvrir le chat");
}

// Un apercu du dernier message, au-dessus de la bulle, quelques secondes
function apercu(m) {
  const zone = racine.querySelector(".bulle-chat__apercu");
  zone.innerHTML = `<b>${echapper(m.pseudo)}</b> ${echapper(m.texte).slice(0, 90)}${m.texte.length > 90 ? "…" : ""}`;
  zone.hidden = false;
  zone.classList.remove("bulle-chat__apercu--sort");
  void zone.offsetWidth;
  zone.classList.add("bulle-chat__apercu--sort");
  clearTimeout(apercu.t);
  apercu.t = setTimeout(() => { zone.hidden = true; }, 5000);
}

// Fermee : y a-t-il du nouveau dans le General ?
async function guetter() {
  clearTimeout(minuteur);
  if (connecte() && !ouverte && !document.hidden && racine && !racine.hidden) {
    try {
      const vu = Number(lire(CLE_VU, 0)) || 0;
      const liste = await messagesCanal("general", vu, 30);
      const moi = monId();
      if (!vu && liste.length) {
        // Premiere fois : on part du dernier message, sans tout compter
        ecrire(CLE_VU, liste.at(-1).id);
      } else {
        const autres = liste.filter((m) => m.auteur !== moi && m.id > vu);
        const avant = nouveauxGeneral;
        nouveauxGeneral = autres.length;
        if (nouveauxGeneral > avant && autres.length) apercu(autres.at(-1));
      }
    } catch { /* hors ligne : on reessaiera */ }
    majPastille();
  }
  minuteur = setTimeout(guetter, ATTENTE_FERMEE);
}

function rendrePanneau() {
  const corps = racine.querySelector(".bulle-chat__corps");
  arreterChat?.();
  arreterChat = null;
  if (!connecte()) {
    corps.innerHTML = `
      <div class="bulle-chat__invite">
        <p>Le chat réunit tous les joueurs : canaux Général, Entraide et Échanges, et messages privés.</p>
        <p>Il faut un compte : juste un pseudo et un mot de passe.</p>
        <button type="button" class="bouton bouton--obi-petit" data-bulle="compte">Créer mon compte</button>
      </div>`;
    return;
  }
  const zone = document.createElement("div");
  zone.className = "bulle-chat__chat";
  corps.replaceChildren(zone);
  arreterChat = brancherChat(zone, { ouvrirJoueur });
}

function ouvrir() {
  ouverte = true;
  racine.classList.add("bulle-chat--ouverte");
  racine.querySelector(".bulle-chat__panneau").hidden = false;
  racine.querySelector(".bulle-chat__bouton").setAttribute("aria-expanded", "true");
  racine.querySelector(".bulle-chat__apercu").hidden = true;
  rendrePanneau();
  // Ouvrir le chat, c'est avoir vu le General
  nouveauxGeneral = 0;
  if (connecte()) messagesCanal("general", 0, 1).then((l) => { if (l.length) ecrire(CLE_VU, l.at(-1).id); }).catch(() => {});
  majPastille();
  setTimeout(() => racine.querySelector(".chat__champ, [data-bulle='compte']")?.focus(), 50);
}

function fermer() {
  ouverte = false;
  arreterChat?.();
  arreterChat = null;
  racine.classList.remove("bulle-chat--ouverte");
  racine.querySelector(".bulle-chat__panneau").hidden = true;
  racine.querySelector(".bulle-chat__corps").innerHTML = "";
  racine.querySelector(".bulle-chat__bouton").setAttribute("aria-expanded", "false");
  // Le General a ete lu jusqu'ici
  if (connecte()) messagesCanal("general", 0, 1).then((l) => { if (l.length) ecrire(CLE_VU, l.at(-1).id); }).catch(() => {});
  majPastille();
  rafraichirNonLus();
}

// A appeler a chaque changement d'ecran : la bulle se cache en combat
export function bulleChatSurEcran(nom) {
  ecranActuel = nom;
  if (!racine) return;
  const cachee = ECRANS_SANS_BULLE.includes(nom);
  racine.hidden = cachee;
  if (cachee && ouverte) fermer();
}

export function installerBulleChat({ naviguer }) {
  if (racine || !enLigneDisponible()) return;
  naviguerVers = naviguer;
  racine = document.createElement("div");
  racine.className = "bulle-chat";
  racine.innerHTML = `
    <section class="bulle-chat__panneau" role="dialog" aria-label="Chat" hidden>
      <header class="bulle-chat__entete">
        <span class="bulle-chat__titre">Chat</span>
        <button type="button" class="bulle-chat__agrandir" data-bulle="agrandir" title="Ouvrir dans l'onglet Social">Plein écran</button>
        <button type="button" class="bulle-chat__fermer" data-bulle="fermer" aria-label="Fermer le chat">×</button>
      </header>
      <div class="bulle-chat__corps"></div>
    </section>
    <p class="bulle-chat__apercu" data-bulle="ouvrir" hidden></p>
    <button type="button" class="bulle-chat__bouton" data-bulle="basculer" aria-expanded="false" aria-label="Ouvrir le chat">
      ${ICONE}<span class="bulle-chat__pastille" hidden></span>
    </button>`;
  document.body.append(racine);

  racine.addEventListener("click", (e) => {
    const b = e.target.closest("[data-bulle]");
    if (!b) return;
    const a = b.dataset.bulle;
    if (a === "basculer") return ouverte ? fermer() : ouvrir();
    if (a === "ouvrir") return ouvrir();
    if (a === "fermer") return fermer();
    if (a === "compte") { fermer(); return ouvrirCompte(); }
    if (a === "agrandir") { fermer(); return naviguerVers?.("social", { onglet: "chat" }); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ouverte && !document.querySelector(".voile")) fermer(); });
  window.addEventListener("crossover:non-lus", majPastille);
  window.addEventListener("crossover:compte", () => { nouveauxGeneral = 0; if (ouverte) rendrePanneau(); majPastille(); guetter(); });
  bulleChatSurEcran(ecranActuel);
  majPastille();
  guetter();
}
