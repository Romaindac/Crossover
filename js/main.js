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
import { aUnePartie, partieBrute, resumeJoueur } from "./services/partie.js";
import { ecrire } from "./services/sauvegarde.js";
import { brancherInclinaison } from "./ui/inclinaison.js";
import { reglage } from "./services/reglages.js";

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
  const neuf = racine.cloneNode(false);
  racine.replaceWith(neuf);
  racine = neuf;
  ECRANS[nom](racine, { naviguer, ...donnees });
  window.scrollTo(0, 0);
}

brancherInclinaison();
document.body.classList.toggle("portraits-encre", reglage("portraits") === "encre");
// Un lien de vitrine ouvre directement la vitrine du joueur
const vitrine = vitrineDuLien();
if (vitrine) ECRANS.vitrine(racine, { naviguer, vitrine });
else ECRANS.accueil(racine, { naviguer });
window.addEventListener("hashchange", () => {
  const v = vitrineDuLien();
  if (v) naviguer("vitrine", { vitrine: v });
});

// Compte en ligne : la partie part toute seule toutes les 5 minutes
setInterval(async () => {
  if (!connecte() || !aUnePartie() || document.hidden) return;
  try {
    await envoyerSauvegarde(partieBrute());
    await publierProfil(resumeJoueur(), vitrineCompacte());
    ecrire("derniere-synchro", Date.now());
  } catch {
    // Pas grave : on reessaiera au prochain tour
  }
}, 5 * 60 * 1000);

// Messages prives non lus : un coup d'oeil par minute (pastille de l'onglet Social)
if (connecte()) rafraichirNonLus();
setInterval(() => { if (connecte() && !document.hidden) rafraichirNonLus(); }, 60 * 1000);
