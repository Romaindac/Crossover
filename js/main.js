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
ECRANS.accueil(racine, { naviguer });
