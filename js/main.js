// ==========================================================
// MAIN : le point de depart du jeu.
// Il affiche le bon ecran et permet de passer de l'un a l'autre.
// ==========================================================

import { afficherAccueil } from "./ecrans/ecran-accueil.js";
import { afficherEquipe } from "./ecrans/ecran-equipe.js";
import { afficherCombat } from "./ecrans/ecran-combat.js";
import { afficherDebut } from "./ecrans/ecran-debut.js";
import { afficherTirages } from "./ecrans/ecran-tirages.js";
import { afficherCollection } from "./ecrans/ecran-collection.js";
import { afficherReglages } from "./ecrans/ecran-reglages.js";
import { afficherQg } from "./ecrans/ecran-qg.js";
import { afficherAventure } from "./ecrans/ecran-aventure.js";
import { afficherSocial, afficherVitrinePartagee } from "./ecrans/ecran-social.js";
import { vitrineDuLien, vitrineCompacte } from "./services/vitrine.js";
import { connecte, envoyerSauvegarde, publierProfil, rafraichirNonLus } from "./services/enligne.js";
import { aUnePartie, partieBrute, resumeJoueur, noterJourJoue } from "./services/partie.js";
import { ecrire } from "./services/sauvegarde.js";
import { brancherInclinaison } from "./ui/inclinaison.js";
import { reglage } from "./services/reglages.js";
import { installerBulleChat, bulleChatSurEcran } from "./ui/bulle-chat.js";
import { synchroEnAttente, ouvrirCompte } from "./ui/compte.js";
import { nouvelEcran } from "./ui/vie-ecran.js";

const ECRANS = {
  accueil: afficherAccueil,
  equipe: afficherEquipe,
  combat: afficherCombat,
  debut: afficherDebut,
  tirages: afficherTirages,
  collection: afficherCollection,
  reglages: afficherReglages,
  qg: afficherQg,
  aventure: afficherAventure,
  social: afficherSocial,
  vitrine: afficherVitrinePartagee,
};

let racine = document.getElementById("app");

// donnees : ce que l'ecran suivant doit savoir (ex. l'equipe choisie)
function naviguer(nom, donnees = {}) {
  // On repart d'un conteneur neuf : l'ancien ecran et ses clics disparaissent
  nouvelEcran();   // les ecouteurs de l'ancien ecran (window, document) sont retires
  const neuf = racine.cloneNode(false);
  racine.replaceWith(neuf);
  racine = neuf;
  ECRANS[nom](racine, { naviguer, ...donnees });
  bulleChatSurEcran(nom);
  window.scrollTo(0, 0);
}

brancherInclinaison();
document.body.classList.toggle("portraits-encre", reglage("portraits") === "encre");
// Un lien de vitrine ouvre directement la vitrine du joueur
const vitrine = vitrineDuLien();
if (vitrine) ECRANS.vitrine(racine, { naviguer, vitrine });
else ECRANS.accueil(racine, { naviguer });
bulleChatSurEcran(vitrine ? "vitrine" : "accueil");
installerBulleChat({ naviguer });
window.addEventListener("hashchange", () => {
  const v = vitrineDuLien();
  if (v) naviguer("vitrine", { vitrine: v });
});

// Compte en ligne : la partie part toute seule toutes les 5 minutes
setInterval(async () => {
  if (!connecte() || !aUnePartie() || document.hidden || synchroEnAttente()) return;
  try {
    await envoyerSauvegarde(partieBrute());
    await publierProfil(resumeJoueur(), vitrineCompacte());
    ecrire("derniere-synchro", Date.now());
  } catch {
    // Pas grave : on reessaiera au prochain tour
  }
}, 5 * 60 * 1000);

// Un jour de jeu de plus (tampons « 7 / 30 / 100 jours ») : au lancement, puis toutes les 10 min (minuit passe)
noterJourJoue();
setInterval(noterJourJoue, 10 * 60 * 1000);

// Deux parties (cet appareil et en ligne) attendent un choix : on le rappelle au lancement
if (connecte() && synchroEnAttente()) setTimeout(() => ouvrirCompte(), 1200);

// Messages prives non lus : un coup d'oeil par minute (pastille de l'onglet Social)
if (connecte()) rafraichirNonLus();
setInterval(() => { if (connecte() && !document.hidden) rafraichirNonLus(); }, 60 * 1000);

// Echap ferme la fenetre du dessus (aide, compte, objet...), si son ecran ne l'a pas deja fait.
// On attend un tour : les ecrans qui gerent Echap eux-memes passent d'abord.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const voile = [...document.querySelectorAll(".voile")].pop();
  if (!voile) return;
  setTimeout(() => {
    if (!voile.isConnected) return;
    const bouton = voile.querySelector('[data-action^="fermer"], [data-hv="fermer"], [data-fermer]')
      ?? [...voile.querySelectorAll("button")].find((b) => /^(Fermer|Annuler|Retour)$/.test(b.textContent.trim()));
    bouton?.click();
  }, 0);
});

// Fenetres (.voile) : le focus y entre a l'ouverture (clavier, lecteur d'ecran), et revient
// au bouton d'origine a la fermeture. Les fenetres qui placent deja le focus le gardent.
// (une seule recherche par lot de changements : l'ecran de combat modifie la page sans arret)
{
  const focusable = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  let ouvertes = new Map();   // voile -> element qui avait le focus avant
  new MutationObserver(() => {
    const actuelles = new Set(document.querySelectorAll(".voile"));
    for (const v of actuelles) {
      if (ouvertes.has(v)) continue;
      ouvertes.set(v, document.activeElement);
      requestAnimationFrame(() => {
        if (v.isConnected && !v.contains(document.activeElement)) v.querySelector(focusable)?.focus({ preventScroll: true });
      });
    }
    for (const [v, origine] of ouvertes) {
      if (actuelles.has(v)) continue;
      ouvertes.delete(v);
      if (!actuelles.size && origine?.isConnected) origine.focus({ preventScroll: true });
    }
  }).observe(document.body, { childList: true, subtree: true });
}
