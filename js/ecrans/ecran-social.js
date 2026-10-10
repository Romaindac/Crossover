// ==========================================================
// SOCIAL : ma vitrine, mon compte en ligne et les classements
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { resumeJoueur } from "../services/partie.js";
import {
  enLigneDisponible, connecte, pseudoConnecte, classement, CLASSEMENTS,
} from "../services/enligne.js";
import { idsVitrine, basculerVitrine, meilleuresCartes, vitrineCompacte, lienVitrine, TAILLE_VITRINE, carteVitrineSure } from "../services/vitrine.js";
import { lire, ecrire } from "../services/sauvegarde.js";
import { numeroSemaine } from "../donnees/tour.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlCarte, rafraichirPortrait } from "../ui/cartes.js";
import { htmlEntete, htmlOnglet } from "../ui/entete.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";
import { brancherChat } from "../ui/chat.js";
import { afficherHotel } from "../ui/hotel.js";
import { afficherEchanges } from "../ui/echanges.js";
import { ouvrirCompte } from "../ui/compte.js";
import { signalEcran } from "../ui/vie-ecran.js";

const echapper = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Une carte de vitrine compacte { id, n, e, v } en HTML
// (les vitrines des autres joueurs viennent d'un lien ou du serveur : tout est revalide)
export function htmlCarteVitrine(brute) {
  const c = carteVitrineSure(brute);
  if (!c) return "";
  const perso = PERSOS_PAR_ID[c.id];
  return htmlCarte(perso, { progression: { niveau: c.n, etoiles: c.e, ascension: c.a ?? 0, variantes: c.v ? [c.v] : [] } })
    .replace('data-action="choisir-perso"', 'data-action="voir-carte"').replace('draggable="true"', "");
}

export function htmlResume(brut = {}) {
  // les chiffres d'un profil en ligne sont ramenes a des nombres (jamais de texte brut)
  const n = (k) => Math.max(0, Math.floor(Number(brut?.[k]) || 0));
  const r = { collection: n("collection"), etoiles: n("etoiles"), tour: n("tour"), raid: n("raid"), boss_semaine: n("boss_semaine"), semaine: n("semaine") };
  return `<ul class="vitrine-resume">
    <li><strong>${r.collection ?? 0}</strong> persos</li>
    <li><strong>${r.etoiles ?? 0}</strong> étoiles</li>
    <li>Tour : <strong>étage ${r.tour ?? 0}</strong></li>
    <li>Boss : <strong>${(r.raid ?? 0).toLocaleString("fr-FR")}</strong></li>
    ${r.boss_semaine && r.semaine === numeroSemaine() ? `<li>Boss cette semaine : <strong>${r.boss_semaine.toLocaleString("fr-FR")}</strong></li>` : ""}
  </ul>`;
}

export function afficherSocial(conteneur, { naviguer, onglet = null }) {
  let ongletSocial = onglet ?? "chat";
  let arreterChat = null;
  let edition = false;
  let ongletClassement = "semaine";
  let joueurs = null;

  conteneur.innerHTML = `
    ${htmlNavigation("social")}
    <div class="reglages-page social">
      ${htmlEntete({
        titre: "Social", kanji: "交流", theme: "social",
        accroche: "Discute, échange tes doublons, vends ton équipement et compare-toi aux autres joueurs.",
        onglets: [["chat", "Chat"], ["echanges", "Échanges"], ["hotel", "Hôtel des ventes"], ["classements", "Classements"], ["vitrine", "Ma vitrine"]]
          .map(([id, nom]) => htmlOnglet(nom, { classe: "choix-segmente__option", donnees: `data-action="onglet-social" data-onglet="${id}"` })).join(""),
      })}
      <div class="social__compte" id="compte"></div>

      <section class="carte-reglage social__chat" data-panneau="chat" aria-label="Chat">
        <div id="chat"></div>
      </section>

      <section class="social__hotel" data-panneau="echanges" aria-label="Échanges de cartes">
        <div id="echanges"></div>
      </section>

      <section class="social__hotel" data-panneau="hotel" aria-label="Hôtel des ventes">
        <div id="hotel"></div>
      </section>

      <section class="carte-reglage" data-panneau="vitrine" aria-labelledby="titre-vitrine">
        <h2 id="titre-vitrine">Ma vitrine</h2>
        <p class="reglage__aide">Tes ${TAILLE_VITRINE} plus belles cartes. Envoie le lien à tes potes : ils voient ta vitrine sans rien installer, et ton score au boss de la semaine devient un défi à battre.</p>
        <div id="vitrine"></div>
      </section>


      <section class="carte-reglage" data-panneau="classements" aria-labelledby="titre-classement">
        <h2 id="titre-classement">Classements</h2>
        <div id="classement"></div>
      </section>
    </div>
    <div id="voile-social"></div>
  `;

  const $ = (sel) => conteneur.querySelector(sel);
  const majNavigation = brancherNavigation(conteneur, naviguer, "social");

  // ---------- Vitrine ----------
  function rendreVitrine(message = "") {
    const choisis = idsVitrine();
    const pseudo = pseudoConnecte() ?? lire("pseudo", "");
    $("#vitrine").innerHTML = `
      ${htmlResume(resumeJoueur())}
      <div class="vitrine-grille">${vitrineCompacte().map(htmlCarteVitrine).join("")}</div>
      <div class="reglage__boutons">
        <button type="button" class="bouton bouton--obi-petit" data-action="partager">Copier le lien de ma vitrine</button>
        <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="editer">${edition ? "Terminer" : "Choisir mes cartes"}</button>
      </div>
      ${connecte() ? "" : `<label class="champ-social">Nom affiché sur le lien
        <input type="text" id="pseudo-lien" maxlength="20" value="${echapper(pseudo)}" placeholder="Ton pseudo"></label>`}
      ${edition ? `
        <p class="reglage__aide">Touche une carte pour l'ajouter ou la retirer (${choisis.length} / ${TAILLE_VITRINE}).</p>
        <div class="vitrine-choix">${meilleuresCartes().map((id) => `
          <button type="button" class="vitrine-choix__carte ${choisis.includes(id) ? "vitrine-choix__carte--prise" : ""}" data-action="basculer" data-perso="${id}" aria-pressed="${choisis.includes(id)}">${echapper(PERSOS_PAR_ID[id].nom)}</button>`).join("")}
        </div>` : ""}
      <p class="reglage__message" role="status" aria-live="polite">${message}</p>`;
  }

  // ---------- Compte ----------
  // Un bandeau compact : le compte se gere dans sa fenetre (bouton de la barre)
  function rendreCompte() {
    const zone = $("#compte");
    if (!enLigneDisponible()) { zone.innerHTML = ""; return; }
    zone.innerHTML = connecte()
      ? `<p class="social__compte-texte">Connecté en tant que <strong>${echapper(pseudoConnecte())}</strong> · partie sauvegardée en ligne toutes les 5 minutes.</p>
         <button type="button" class="bouton-texte" data-action="ouvrir-compte">Mon compte</button>`
      : `<p class="social__compte-texte"><strong>Pas encore de compte ?</strong> Crée-le en 10 secondes pour le chat, l'hôtel des ventes, les classements et la sauvegarde en ligne.</p>
         <button type="button" class="bouton bouton--obi-petit" data-action="ouvrir-compte">Créer mon compte</button>`;
  }

  // ---------- Classements ----------
  async function chargerClassement() {
    joueurs = null;
    rendreClassement();
    try {
      joueurs = await classement(ongletClassement);
    } catch (e) {
      joueurs = { erreur: e.message };
    }
    rendreClassement();
  }

  function rendreClassement() {
    const zone = $("#classement");
    if (!enLigneDisponible()) {
      zone.innerHTML = '<p class="reglage__aide">Le classement s\'ouvrira avec les comptes en ligne. En attendant, compare-toi avec tes potes grâce au lien de ta vitrine !</p>';
      return;
    }
    const moi = pseudoConnecte();
    zone.innerHTML = `
      <div class="choix-segmente choix-segmente--gauche" role="radiogroup" aria-label="Classement">
        ${Object.entries(CLASSEMENTS).map(([cle, c]) => `
          <button type="button" role="radio" class="choix-segmente__option" data-action="onglet-classement" data-cle="${cle}" aria-checked="${cle === ongletClassement}">${c.nom}</button>`).join("")}
      </div>
      ${joueurs === null ? '<p class="reglage__aide">Chargement…</p>'
        : joueurs.erreur ? `<p class="reglage__message reglage__message--erreur">${echapper(joueurs.erreur)}</p>`
        : !joueurs.length ? '<p class="reglage__aide">Personne pour l\'instant : sois le premier !</p>'
        : `<ol class="classement">${joueurs.map((j, i) => `
            <li><button type="button" class="classement__ligne ${j.pseudo === moi ? "classement__ligne--moi" : ""}" data-action="voir-joueur" data-index="${i}">
              <span class="classement__rang">${i + 1}</span>
              <span class="classement__pseudo">${echapper(j.pseudo)}</span>
              <span class="classement__valeur">${CLASSEMENTS[ongletClassement].valeur(j)}</span>
            </button></li>`).join("")}</ol>`}
      ${connecte() ? "" : '<p class="reglage__aide">Crée un compte juste au-dessus pour y apparaître.</p>'}`;
  }

  function ouvrirJoueur(j) {
    const cartes = (Array.isArray(j.vitrine) ? j.vitrine : []).filter((c) => PERSOS_PAR_ID[c?.id]);
    $("#voile-social").innerHTML = `
      <div class="voile" data-action="fermer">
        <div class="resultat vitrine-joueur" role="dialog" aria-modal="true" aria-label="Vitrine de ${echapper(j.pseudo)}">
          <h2 class="resultat__titre">Vitrine de ${echapper(j.pseudo)}</h2>
          ${htmlResume(j)}
          <div class="vitrine-grille">${cartes.length ? cartes.map(htmlCarteVitrine).join("") : '<p class="reglage__aide">Vitrine vide.</p>'}</div>
          <div class="resultat__actions"><button type="button" class="bouton bouton--clair" data-action="fermer">Fermer</button></div>
        </div>
      </div>`;
    $("#voile-social .resultat__actions .bouton").focus();
  }

  conteneur.addEventListener("input", (e) => {
    if (e.target.id === "pseudo-lien") ecrire("pseudo", e.target.value.trim().slice(0, 20));
  });

  conteneur.addEventListener("click", async (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    const action = cible.dataset.action;

    if (action === "fermer" && (e.target === cible || cible.tagName === "BUTTON")) $("#voile-social").innerHTML = "";
    if (action === "editer") { edition = !edition; rendreVitrine(); chargerPortraits((id) => rafraichirPortrait(conteneur, id)); }
    if (action === "basculer") {
      if (!basculerVitrine(cible.dataset.perso)) return rendreVitrine(`Ta vitrine est pleine (${TAILLE_VITRINE} cartes) : retire d'abord une carte.`);
      rendreVitrine();
      chargerPortraits((id) => rafraichirPortrait(conteneur, id));
    }
    if (action === "partager") {
      const lien = lienVitrine(pseudoConnecte() ?? lire("pseudo", ""));
      try {
        await navigator.clipboard.writeText(lien);
        rendreVitrine("Lien copié ! Colle-le à tes potes.");
      } catch {
        rendreVitrine(`Copie ce lien : ${echapper(lien)}`);
      }
    }
    if (action === "onglet-classement") { ongletClassement = cible.dataset.cle; chargerClassement(); }
    if (action === "voir-joueur" && Array.isArray(joueurs)) ouvrirJoueur(joueurs[Number(cible.dataset.index)]);

    if (action === "ouvrir-compte") ouvrirCompte();
  });

  // ---------- Onglets et chat ----------
  function rendreChat() {
    arreterChat?.();
    arreterChat = null;
    const zone = $("#chat");
    if (!enLigneDisponible()) {
      zone.innerHTML = '<p class="reglage__aide">Le chat s\'ouvrira avec les comptes en ligne. En attendant, partage ta vitrine à tes potes depuis l\'onglet « Ma vitrine ».</p>';
      return;
    }
    if (!connecte()) {
      zone.innerHTML = `
        <p class="reglage__aide">Le chat réunit tous les joueurs : canaux Général, Entraide et Échanges, et messages privés. Il faut un compte (juste un pseudo et un mot de passe).</p>
        <div class="reglage__boutons"><button type="button" class="bouton bouton--obi-petit" data-action="ouvrir-compte">Créer mon compte</button></div>`;
      return;
    }
    arreterChat = brancherChat(zone, { ouvrirJoueur });
  }

  function afficherOnglet(nom) {
    ongletSocial = nom;
    conteneur.querySelectorAll("[data-action='onglet-social'][role='tab']").forEach((b) => {
      b.setAttribute("aria-selected", String(b.dataset.onglet === nom));
    });
    conteneur.querySelectorAll("[data-panneau]").forEach((s) => { s.hidden = s.dataset.panneau !== nom; });
    $(".social").classList.toggle("social--large", nom === "chat" || nom === "hotel" || nom === "echanges");
    if (nom === "chat") rendreChat(); else { arreterChat?.(); arreterChat = null; }
    if (nom === "hotel") afficherHotel($("#hotel"), { naviguer, apresChangement: majNavigation });
    if (nom === "echanges") afficherEchanges($("#echanges"), { apresChangement: majNavigation });
    if (nom === "classements") { if (enLigneDisponible()) chargerClassement(); else rendreClassement(); }
  }

  conteneur.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action='onglet-social']");
    if (b) afficherOnglet(b.dataset.onglet);
  });

  // Connexion ou deconnexion depuis la fenetre du compte : tout se remet a jour
  const surCompte = () => {
    if (!conteneur.isConnected) return window.removeEventListener("crossover:compte", surCompte);
    rendreCompte(); rendreVitrine(); afficherOnglet(ongletSocial);
  };
  window.addEventListener("crossover:compte", surCompte, { signal: signalEcran() });

  rendreVitrine();
  rendreCompte();
  afficherOnglet(ongletSocial);
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}

// ---------- Vitrine recue par lien (sans compte) ----------
export function afficherVitrinePartagee(conteneur, { naviguer, vitrine }) {
  const defiActif = vitrine.resume.boss_semaine > 0 && vitrine.resume.semaine === numeroSemaine();
  conteneur.innerHTML = `
    <main class="reglages-page social social--partage">
      <p class="accueil__tranche">Crossover</p>
      <section class="carte-reglage">
        <h1 class="equipe__titre">Vitrine de ${echapper(vitrine.pseudo)}</h1>
        ${htmlResume(vitrine.resume)}
        <div class="vitrine-grille">${vitrine.cartes.map(htmlCarteVitrine).join("")}</div>
        ${defiActif ? `<p class="defi-ami">Défi : bats les <strong>${vitrine.resume.boss_semaine.toLocaleString("fr-FR")} dégâts</strong> de ${echapper(vitrine.pseudo)} au boss de la semaine avant lundi !</p>` : ""}
        <p class="reglage__aide">Crossover, c'est les héros de tous les mangas dans la même équipe. Ouvre des boosters, monte ton équipe et bats ce score !</p>
        <div class="reglage__boutons"><button type="button" class="bouton bouton--obi" data-action="jouer">${defiActif ? "Relever le défi" : "Jouer à Crossover"}</button></div>
      </section>
    </main>`;
  conteneur.addEventListener("click", (e) => {
    if (e.target.closest("[data-action='jouer']")) {
      // Le defi est garde : l'ecran du boss de la semaine l'affichera
      if (defiActif) ecrire("defi-ami", { pseudo: vitrine.pseudo, score: vitrine.resume.boss_semaine, semaine: vitrine.resume.semaine });
      history.replaceState(null, "", location.pathname);
      naviguer("accueil");
    }
  });
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}
