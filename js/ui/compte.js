// ==========================================================
// FENETRE DU COMPTE (ouverte depuis la barre, le QG, le Social...)
// Creer un compte, se connecter, sauvegarder ou recuperer sa partie.
// Previent le reste du jeu par l'evenement « crossover:compte ».
// ==========================================================

import { partieBrute, remplacerPartie, resumeJoueur } from "../services/partie.js";
import {
  enLigneDisponible, connecte, pseudoConnecte, inscrire, connecter, deconnecter,
  envoyerSauvegarde, recupererSauvegarde, publierProfil, rafraichirNonLus,
} from "../services/enligne.js";
import { vitrineCompacte } from "../services/vitrine.js";
import { lire, ecrire } from "../services/sauvegarde.js";

const echapper = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const prevenir = () => window.dispatchEvent(new CustomEvent("crossover:compte"));

// Apres une connexion, si une partie existe deja en ligne, rien ne part tant que le joueur
// n'a pas choisi laquelle garder : sinon la partie de cet appareil (meme debutante) ecrasait
// en silence une progression plus avancee.
export const CHOIX_SYNCHRO = "synchro-a-choisir";
export const synchroEnAttente = () => Boolean(lire(CHOIX_SYNCHRO, false));

// Ce qu'une partie contient, pour comparer les deux
const resumePartie = (d) => ({
  persos: Object.keys(d?.collection ?? {}).length,
  victoires: Math.floor(Number(d?.stats?.victoires) || 0),
  etoiles: Object.values(d?.collection ?? {}).reduce((t, p) => t + (Number(p?.etoiles) || 0), 0),
});
const texteResume = (r) => `${r.persos} persos, ${r.etoiles} étoiles, ${r.victoires} victoires`;

// Envoie la partie et le profil public (scores, vitrine)
export async function synchroniser() {
  await envoyerSauvegarde(partieBrute());
  await publierProfil(resumeJoueur(), vitrineCompacte());
  ecrire("derniere-synchro", Date.now());
}

export function ouvrirCompte({ mode = "inscrire" } = {}) {
  document.querySelector(".voile--compte")?.remove();
  const voile = document.createElement("div");
  voile.className = "voile voile--compte";
  document.body.append(voile);
  let confirmerRecup = false;
  let enLigneConnue = null;   // la partie en ligne, lue a la connexion (pour le choix)

  function rendre(message = "", erreur = false) {
    const msg = message ? `<p class="compte__message ${erreur ? "compte__message--erreur" : ""}" role="status" aria-live="polite">${message}</p>` : "";
    let corps;
    if (!enLigneDisponible()) {
      corps = `<p class="reglage__aide">Le jeu en ligne n'est pas encore activé. Ta partie est gardée dans ce navigateur : pense à l'exporter dans les Réglages.</p>`;
    } else if (!connecte()) {
      corps = `
        <ul class="compte__avantages">
          <li><b>Sauvegarde en ligne</b> : retrouve ta partie sur ton téléphone et ton ordinateur.</li>
          <li><b>Chat</b> avec les autres joueurs, et messages privés.</li>
          <li><b>Hôtel des ventes</b> : vends et achète de l'équipement.</li>
          <li><b>Classements</b> : Tour, boss de la semaine, collection.</li>
        </ul>
        <div class="choix-segmente compte__modes" role="tablist" aria-label="Compte">
          <button type="button" role="tab" class="choix-segmente__option" data-compte-mode="inscrire" aria-selected="${mode === "inscrire"}">Créer un compte</button>
          <button type="button" role="tab" class="choix-segmente__option" data-compte-mode="connecter" aria-selected="${mode === "connecter"}">J'ai déjà un compte</button>
        </div>
        <form class="form-compte" data-form-compte>
          <label class="champ-social">Pseudo<input type="text" name="pseudo" autocomplete="username" maxlength="20" required placeholder="3 à 20 lettres ou chiffres"></label>
          <label class="champ-social">Mot de passe<input type="password" name="mdp" autocomplete="${mode === "inscrire" ? "new-password" : "current-password"}" minlength="6" required placeholder="6 caractères minimum"></label>
          <button type="submit" class="bouton bouton--obi">${mode === "inscrire" ? "Créer mon compte" : "Me connecter"}</button>
        </form>
        <p class="reglage__aide">${mode === "inscrire" ? "Pas d'adresse mail demandée. Garde bien ton mot de passe : on ne peut pas le récupérer." : "Ta partie en ligne pourra ensuite être chargée ici."}</p>`;
    } else if (synchroEnAttente()) {
      const ici = resumePartie(partieBrute());
      const la = enLigneConnue ? resumePartie(enLigneConnue.donnees) : null;
      corps = `
        <p class="compte__connecte"><span class="compte__avatar" aria-hidden="true">${echapper(pseudoConnecte().slice(0, 1).toUpperCase())}</span><span>Connecté en tant que <strong>${echapper(pseudoConnecte())}</strong></span></p>
        <p class="reglage__aide"><b>Deux parties existent.</b> Choisis laquelle garder : l'autre sera remplacée. Rien n'est envoyé tant que tu n'as pas choisi.</p>
        <div class="compte__choix">
          <button type="button" class="encrier__option" data-compte="choix-en-ligne">
            <b>Charger la partie en ligne</b><span>${la ? texteResume(la) : "partie en ligne"}${enLigneConnue?.maj ? ` · sauvegardée le ${new Date(enLigneConnue.maj).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}` : ""}</span>
          </button>
          <button type="button" class="encrier__option" data-compte="choix-local">
            <b>Garder la partie de cet appareil</b><span>${texteResume(ici)} · elle remplacera celle en ligne</span>
          </button>
        </div>
        <div class="compte__actions"><button type="button" class="bouton bouton--clair bouton--petit-texte" data-compte="deconnecter">Se déconnecter</button></div>`;
    } else {
      const derniere = lire("derniere-synchro", null);
      corps = `
        <p class="compte__connecte"><span class="compte__avatar" aria-hidden="true">${echapper(pseudoConnecte().slice(0, 1).toUpperCase())}</span><span>Connecté en tant que <strong>${echapper(pseudoConnecte())}</strong></span></p>
        <p class="reglage__aide">Ta partie part en ligne toute seule toutes les 5 minutes${derniere ? ` (dernière fois à ${new Date(derniere).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })})` : ""}.</p>
        <div class="compte__actions">
          <button type="button" class="bouton bouton--obi-petit" data-compte="sauver">Sauvegarder maintenant</button>
          <button type="button" class="bouton bouton--clair bouton--petit-texte" data-compte="recuperer">${confirmerRecup ? "Remplacer la partie de ce navigateur ? Clique encore" : "Charger ma partie en ligne ici"}</button>
          <button type="button" class="bouton bouton--clair bouton--petit-texte" data-compte="deconnecter">Se déconnecter</button>
        </div>`;
    }
    voile.innerHTML = `
      <div class="resultat compte" role="dialog" aria-modal="true" aria-labelledby="titre-compte">
        <h2 class="resultat__titre" id="titre-compte">${connecte() ? "Ton compte" : "Jouer en ligne"}</h2>
        ${corps}
        ${msg}
        <div class="resultat__actions"><button type="button" class="bouton-texte" data-compte="fermer">Fermer</button></div>
      </div>`;
    voile.querySelector("input[name=pseudo]")?.focus();
  }

  voile.addEventListener("click", async (e) => {
    if (e.target === voile) return voile.remove();
    const m = e.target.closest("[data-compte-mode]");
    if (m) { mode = m.dataset.compteMode; return rendre(); }
    const b = e.target.closest("[data-compte]");
    if (!b) return;
    const action = b.dataset.compte;
    if (action === "fermer") return voile.remove();
    b.disabled = true;
    try {
      if (action === "sauver") { await synchroniser(); rendre("Partie sauvegardée en ligne !"); }
      if (action === "choix-local") { ecrire(CHOIX_SYNCHRO, false); await synchroniser(); prevenir(); rendre("C'est noté : la partie de cet appareil est maintenant celle en ligne."); }
      if (action === "choix-en-ligne") {
        const enLigne = enLigneConnue ?? await recupererSauvegarde();
        if (!enLigne || !remplacerPartie(enLigne.donnees)) return rendre("La partie en ligne est introuvable ou abîmée.", true);
        ecrire(CHOIX_SYNCHRO, false);
        location.reload();
      }
      if (action === "deconnecter") { deconnecter(); ecrire(CHOIX_SYNCHRO, false); prevenir(); rendre("Déconnecté. Ta partie reste dans ce navigateur."); }
      if (action === "recuperer") {
        if (!confirmerRecup) { confirmerRecup = true; return rendre(); }
        const enLigne = await recupererSauvegarde();
        if (!enLigne) { confirmerRecup = false; return rendre("Aucune partie en ligne pour ce compte.", true); }
        if (!remplacerPartie(enLigne.donnees)) return rendre("La partie en ligne est abîmée.", true);
        ecrire(CHOIX_SYNCHRO, false);
        location.reload();   // tout l'ecran repart de la partie chargee
      }
    } catch (err) {
      rendre(err.message, true);
    } finally {
      b.disabled = false;
    }
  });

  voile.addEventListener("submit", async (e) => {
    if (!e.target.matches("[data-form-compte]")) return;
    e.preventDefault();
    const donnees = new FormData(e.target);
    const pseudo = String(donnees.get("pseudo")).trim();
    const mdp = String(donnees.get("mdp"));
    e.target.querySelector("button").disabled = true;
    try {
      if (mode === "inscrire") {
        await inscrire(pseudo, mdp);
        await synchroniser();
        prevenir();
        rendre("Compte créé et partie sauvegardée en ligne ! Le chat et l'hôtel des ventes sont dans l'onglet Social.");
      } else {
        await connecter(pseudo, mdp);
        const enLigne = await recupererSauvegarde().catch(() => null);
        enLigneConnue = enLigne;
        // Une partie en ligne existe : on attend le choix du joueur. Sinon, celle-ci part tout de suite.
        ecrire(CHOIX_SYNCHRO, Boolean(enLigne));
        if (!enLigne) await synchroniser().catch(() => {});
        prevenir();
        rafraichirNonLus();
        rendre(enLigne ? "" : "Connecté ! Ta partie est sauvegardée en ligne.");
      }
    } catch (err) {
      rendre(err.message, true);
    }
  });

  rendre();
  // Choix en attente (rouvert au lancement) : on va chercher le resume de la partie en ligne
  if (connecte() && synchroEnAttente() && !enLigneConnue) {
    recupererSauvegarde().then((d) => { enLigneConnue = d; if (voile.isConnected) rendre(); }).catch(() => {});
  }
}
