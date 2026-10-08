// ==========================================================
// SOCIAL : ma vitrine, mon compte en ligne et les classements
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { partieBrute, remplacerPartie, resumeJoueur } from "../services/partie.js";
import {
  enLigneDisponible, connecte, pseudoConnecte, inscrire, connecter, deconnecter,
  envoyerSauvegarde, recupererSauvegarde, publierProfil, classement, CLASSEMENTS,
} from "../services/enligne.js";
import { idsVitrine, basculerVitrine, meilleuresCartes, vitrineCompacte, lienVitrine, TAILLE_VITRINE } from "../services/vitrine.js";
import { lire, ecrire } from "../services/sauvegarde.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlCarte, rafraichirPortrait } from "../ui/cartes.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";

const echapper = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Une carte de vitrine compacte { id, n, e, v } en HTML
export function htmlCarteVitrine(c) {
  const perso = PERSOS_PAR_ID[c.id];
  if (!perso) return "";
  return htmlCarte(perso, { progression: { niveau: c.n ?? 1, etoiles: c.e ?? 1, variantes: c.v ? [c.v] : [] } })
    .replace('data-action="choisir-perso"', 'data-action="voir-carte"').replace('draggable="true"', "");
}

export function htmlResume(r = {}) {
  return `<ul class="vitrine-resume">
    <li><strong>${r.collection ?? 0}</strong> persos</li>
    <li><strong>${r.etoiles ?? 0}</strong> étoiles</li>
    <li>Tour : <strong>étage ${r.tour ?? 0}</strong></li>
    <li>Boss : <strong>${(r.raid ?? 0).toLocaleString("fr-FR")}</strong></li>
  </ul>`;
}

export function afficherSocial(conteneur, { naviguer }) {
  let edition = false;
  let ongletClassement = "tour";
  let joueurs = null;

  conteneur.innerHTML = `
    ${htmlNavigation("social")}
    <div class="reglages-page social">
      <h1 class="equipe__titre">Social</h1>

      <section class="carte-reglage" aria-labelledby="titre-vitrine">
        <h2 id="titre-vitrine">Ma vitrine</h2>
        <p class="reglage__aide">Tes ${TAILLE_VITRINE} plus belles cartes. Envoie le lien à tes potes : ils voient ta vitrine sans rien installer.</p>
        <div id="vitrine"></div>
      </section>

      <section class="carte-reglage" aria-labelledby="titre-compte">
        <h2 id="titre-compte">Compte et sauvegarde en ligne</h2>
        <div id="compte"></div>
      </section>

      <section class="carte-reglage" aria-labelledby="titre-classement">
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
  function rendreCompte(message = "", erreur = false) {
    const zone = $("#compte");
    const msg = `<p class="reglage__message ${erreur ? "reglage__message--erreur" : ""}" role="status" aria-live="polite">${message}</p>`;
    if (!enLigneDisponible()) {
      zone.innerHTML = `
        <p class="reglage__aide">Les comptes en ligne ne sont pas encore activés. En attendant, ta partie est gardée dans ce navigateur : pense à l'exporter dans les Réglages pour ne pas la perdre.</p>
        <div class="reglage__boutons"><button type="button" class="bouton bouton--clair bouton--petit-texte" data-nav="reglages">Exporter ma partie</button></div>`;
      return;
    }
    if (!connecte()) {
      zone.innerHTML = `
        <p class="reglage__aide">Crée un compte pour sauvegarder ta partie en ligne, la retrouver sur un autre appareil et apparaître au classement. Juste un pseudo et un mot de passe, pas de mail.</p>
        <form class="form-compte" id="form-compte">
          <label class="champ-social">Pseudo<input type="text" name="pseudo" autocomplete="username" maxlength="20" required></label>
          <label class="champ-social">Mot de passe<input type="password" name="mdp" autocomplete="current-password" minlength="6" required></label>
          <div class="reglage__boutons">
            <button type="submit" class="bouton bouton--obi-petit" data-mode="inscrire">Créer mon compte</button>
            <button type="submit" class="bouton bouton--clair bouton--petit-texte" data-mode="connecter">J'ai déjà un compte</button>
          </div>
        </form>
        <p class="reglage__aide">Garde bien ton mot de passe : on ne peut pas le récupérer.</p>
        ${msg}`;
      return;
    }
    const derniere = lire("derniere-synchro", null);
    zone.innerHTML = `
      <p class="reglage__aide">Connecté en tant que <strong>${echapper(pseudoConnecte())}</strong>. Ta partie part en ligne toute seule toutes les 5 minutes${derniere ? ` (dernière fois : ${new Date(derniere).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })})` : ""}.</p>
      <div class="reglage__boutons">
        <button type="button" class="bouton bouton--obi-petit" data-action="sauver-ligne">Sauvegarder maintenant</button>
        <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="recuperer">Récupérer ma partie en ligne</button>
        <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="deconnecter">Se déconnecter</button>
      </div>
      ${msg}`;
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

  // Envoie la partie et le profil public
  async function synchroniser() {
    await envoyerSauvegarde(partieBrute());
    await publierProfil(resumeJoueur(), vitrineCompacte());
    ecrire("derniere-synchro", Date.now());
  }

  conteneur.addEventListener("submit", async (e) => {
    if (e.target.id !== "form-compte") return;
    e.preventDefault();
    const donnees = new FormData(e.target);
    const pseudo = String(donnees.get("pseudo")).trim();
    const mdp = String(donnees.get("mdp"));
    const mode = e.submitter?.dataset.mode ?? "connecter";
    e.target.querySelectorAll("button").forEach((b) => { b.disabled = true; });
    try {
      if (mode === "inscrire") {
        await inscrire(pseudo, mdp);
        await synchroniser();
        rendreCompte("Compte créé et partie sauvegardée en ligne !");
      } else {
        await connecter(pseudo, mdp);
        const enLigne = await recupererSauvegarde();
        rendreCompte(enLigne ? "Connecté ! Ta partie en ligne est disponible : clique sur « Récupérer » pour la charger ici." : "Connecté !");
      }
      rendreVitrine();
      chargerClassement();
    } catch (err) {
      rendreCompte(err.message, true);
    }
  });

  let confirmerRecup = false;
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

    if (action === "sauver-ligne") {
      cible.disabled = true;
      try { await synchroniser(); rendreCompte("Partie sauvegardée en ligne !"); chargerClassement(); }
      catch (err) { rendreCompte(err.message, true); }
    }
    if (action === "recuperer") {
      if (!confirmerRecup) {
        confirmerRecup = true;
        cible.textContent = "Remplacer ma partie ici ? Clique encore";
        cible.classList.add("bouton--danger");
        return;
      }
      confirmerRecup = false;
      try {
        const enLigne = await recupererSauvegarde();
        if (!enLigne) return rendreCompte("Aucune partie en ligne pour ce compte.", true);
        if (!remplacerPartie(enLigne.donnees)) return rendreCompte("La partie en ligne est abîmée.", true);
        majNavigation();
        rendreVitrine();
        rendreCompte(`Partie du ${new Date(enLigne.maj).toLocaleString("fr-FR")} récupérée !`);
      } catch (err) { rendreCompte(err.message, true); }
    }
    if (action === "deconnecter") { deconnecter(); rendreCompte("Déconnecté. Ta partie reste dans ce navigateur."); rendreClassement(); rendreVitrine(); }
  });

  rendreVitrine();
  rendreCompte();
  if (enLigneDisponible()) chargerClassement(); else rendreClassement();
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}

// ---------- Vitrine recue par lien (sans compte) ----------
export function afficherVitrinePartagee(conteneur, { naviguer, vitrine }) {
  conteneur.innerHTML = `
    <main class="reglages-page social social--partage">
      <p class="accueil__tranche">Crossover</p>
      <section class="carte-reglage">
        <h1 class="equipe__titre">Vitrine de ${echapper(vitrine.pseudo)}</h1>
        ${htmlResume(vitrine.resume)}
        <div class="vitrine-grille">${vitrine.cartes.map(htmlCarteVitrine).join("")}</div>
        <p class="reglage__aide">Crossover, c'est les héros de tous les mangas dans la même équipe. Ouvre des boosters, monte ton équipe et bats ce score !</p>
        <div class="reglage__boutons"><button type="button" class="bouton bouton--obi" data-action="jouer">Jouer à Crossover</button></div>
      </section>
    </main>`;
  conteneur.addEventListener("click", (e) => {
    if (e.target.closest("[data-action='jouer']")) {
      history.replaceState(null, "", location.pathname);
      naviguer("accueil");
    }
  });
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}
