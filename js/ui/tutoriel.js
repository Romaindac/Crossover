// ==========================================================
// TUTORIEL DE DEPART : tout le jeu en 7 pages
// S'ouvre une fois au premier passage au QG ; on le revoit depuis
// le bouton « ? ». Les chiffres viennent des fichiers de donnees.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { EDITIONS, MINUTES_BOOSTER_GRATUIT, STOCK_GRATUIT_MAX, CARTES_PAR_BOOSTER } from "../donnees/boosters.js";
import { ENERGIE_MAX, MINUTES_PAR_ENERGIE } from "../donnees/evenements.js";
import { PERSOS } from "../donnees/persos.js";
import { equipeSauvee } from "../services/partie.js";
import { enLigneDisponible, connecte } from "../services/enligne.js";
import { lire, ecrire } from "../services/sauvegarde.js";
import { htmlPortrait, iconeRole } from "./cartes.js";
import { htmlSachet } from "./sachet.js";
import { schemaFormation, schemaAffinites } from "./aide.js";
import { ouvrirCompte } from "./compte.js";

const CLE = "tutoriel-vu";
export const tutorielVu = () => Boolean(lire(CLE, false));

const pastilles = (liste) => `<ul class="tuto__pastilles">${liste.map(([titre, texte]) => `<li><b>${titre}</b>${texte}</li>`).join("")}</ul>`;

function pages() {
  const equipe = equipeSauvee().filter(Boolean);
  const heures = Math.round((MINUTES_BOOSTER_GRATUIT * STOCK_GRATUIT_MAX) / 60);
  return [
    {
      titre: "Bienvenue dans Crossover",
      illustration: `<div class="tuto__equipe">${(equipe.length ? equipe : ["naruto", "luffy", "goku", "pikachu", "guts"]).map((id, i) => `<span class="tuto__heros" style="--i: ${i}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}</div>`,
      texte: `Les héros de tous les mangas dans la même équipe. Tu commences avec 5 persos, un par rôle. ${PERSOS.length} sont à collectionner.`,
      plus: pastilles([["Ton but : ", "monter la meilleure équipe, finir la campagne et grimper dans les classements."], ["Le Guide du débutant ", "au QG te donne un objectif à la fois, avec une récompense."]]),
    },
    {
      titre: "Les combats",
      illustration: schemaFormation(),
      texte: "Les combats se jouent tout seuls : place bien tes 5 persos, ils frappent et lancent leur ultime quand leur jauge est pleine. En mode manuel, c'est toi qui les déclenches.",
      plus: pastilles([["Placement : ", "tank devant, assassins et soutiens derrière."], ["Arène : ", "ton deck contre des boss géants, 8 par monde. Le premier KO donne la bordure Boss du perso, un cadre introuvable ailleurs."], ["Campagne : ", "5 chapitres de 8 étapes : chaque chapitre fini ouvre un nouveau monde (autel et boss)."], ["Énergie : ", `${ENERGIE_MAX} max, +1 toutes les ${MINUTES_PAR_ENERGIE} min, payée seulement si tu gagnes. La première victoire d'une étape est gratuite.`]]),
    },
    {
      titre: "Invocations et boosters",
      illustration: `<div class="tuto__sachets">${EDITIONS.slice(0, 3).map((e, i) => `<span class="tuto__sachet" style="--i: ${i}">${htmlSachet(e)}</span>`).join("")}</div>`,
      texte: `Tous les persos s'invoquent à l'Autel (onglet Invocations), une carte à la fois, ou sortent des boosters : ${EDITIONS.length} éditions de 40 persos.`,
      plus: pastilles([["Autel : ", "une réserve d'invocations qui se recharge seule et à chaque victoire. Invocation automatique, rapide et ×3 se débloquent en invoquant. Potions de chance, séries complètes et bordures rares rendent plus chanceux."],["Gratuit : ", `un booster toutes les ${MINUTES_BOOSTER_GRATUIT} min, jusqu'à ${STOCK_GRATUIT_MAX} en réserve (${heures} h). Les chapitres et missions en donnent aussi.`], ["Doublons : ", "ils ajoutent une étoile au perso (plus de PV et d'ATQ)."], ["Atelier : ", "la poussière fabrique la carte de ton choix."]]),
    },
    {
      titre: "Devenir plus fort",
      illustration: schemaAffinites(),
      texte: "Monte le niveau de tes persos en combattant, équipe-les avec le butin de la Chasse, et joue les synergies.",
      plus: pastilles([["Synergies : ", "même manga, liens entre persos, affinités (+25 % de dégâts). Le panneau Synergies de l'écran Équipe montre tout en direct."], ["Équipe conseillée : ", "le jeu cherche pour toi la meilleure équipe contre le prochain combat."], ["Bouton « ? » : ", "la page « Devenir plus fort » détaille tout."]]),
    },
    {
      titre: "Chaque jour",
      illustration: `<div class="tuto__jour">${["Calendrier", "Missions", "Défi du jour", "Heure folle", "Expédition", "Boss"].map((t, i) => `<span class="tuto__case" style="--i: ${i}">${t}</span>`).join("")}</div>`,
      texte: "Un petit tour au QG chaque jour rapporte gros.",
      plus: pastilles([["Calendrier et missions : ", "des boosters, de l'encre et de l'énergie."], ["Expédition : ", "ton équipe combat seule même jeu fermé (jusqu'à 12 h)."], ["Boss de la semaine et Tour : ", "3 tentatives par jour contre le boss, des coffres chaque semaine dans la Tour."]]),
    },
    {
      titre: "Jouer avec les autres",
      illustration: `<div class="tuto__social">${["Chat", "Hôtel des ventes", "Classements", "Vitrine"].map((t, i) => `<span class="tuto__bulle" style="--i: ${i}">${t}</span>`).join("")}</div>`,
      texte: "Tout est dans l'onglet Social, avec un compte (juste un pseudo et un mot de passe).",
      plus: pastilles([["Chat : ", "canaux Général, Entraide, Échanges, et messages privés."], ["Échanges et hôtel des ventes : ", "échange tes doublons de cartes, vends ton équipement en trop."], ["Duels (Aventure) : ", "attaque les défenses des autres joueurs et grimpe de Bronze à Diamant."], ["Vitrine : ", "partage tes plus belles cartes par un lien, et défie tes potes au boss de la semaine."]]),
      bouton: enLigneDisponible() && !connecte() ? "Créer mon compte maintenant" : null,
    },
    {
      titre: "À toi de jouer !",
      illustration: `<div class="tuto__fin">${iconeRole("attaquant")}<span>GO</span>${iconeRole("tank")}</div>`,
      texte: "Commence par l'objectif du Guide du débutant, au QG : il te montre où aller à chaque étape.",
      plus: pastilles([["Revoir ce tutoriel : ", "bouton « ? » en haut, onglet « Tutoriel »."]]),
    },
  ];
}

export function ouvrirTutoriel() {
  document.querySelector(".voile--tuto")?.remove();
  const liste = pages();
  let i = 0;
  const voile = document.createElement("div");
  voile.className = "voile voile--tuto";
  document.body.append(voile);

  const fermer = () => { ecrire(CLE, true); voile.remove(); document.removeEventListener("keydown", clavier); };

  function rendre() {
    const p = liste[i];
    const derniere = i === liste.length - 1;
    voile.innerHTML = `
      <div class="tuto" role="dialog" aria-modal="true" aria-labelledby="titre-tuto">
        <div class="tuto__scene">${p.illustration}</div>
        <div class="tuto__corps">
          <p class="tuto__etape">${i + 1} / ${liste.length}</p>
          <h2 class="tuto__titre" id="titre-tuto">${p.titre}</h2>
          <p class="tuto__texte">${p.texte}</p>
          ${p.plus ?? ""}
          ${p.bouton ? `<button type="button" class="bouton bouton--obi-petit tuto__compte" data-tuto="compte">${p.bouton}</button>` : ""}
        </div>
        <div class="tuto__bas">
          <button type="button" class="bouton-texte" data-tuto="passer" ${derniere ? 'style="visibility: hidden"' : ""}>Passer</button>
          <ol class="tuto__points" aria-hidden="true">${liste.map((_, k) => `<li class="${k === i ? "tuto__point--actif" : ""}"></li>`).join("")}</ol>
          <div class="tuto__nav">
            ${i > 0 ? '<button type="button" class="bouton bouton--clair bouton--petit-texte" data-tuto="precedent">Précédent</button>' : ""}
            <button type="button" class="bouton bouton--obi-petit" data-tuto="${derniere ? "fin" : "suivant"}">${derniere ? "C'est parti !" : "Suivant"}</button>
          </div>
        </div>
      </div>`;
    voile.querySelector(`[data-tuto="${derniere ? "fin" : "suivant"}"]`).focus();
  }

  function clavier(e) {
    if (e.key === "ArrowRight" && i < liste.length - 1) { i += 1; rendre(); }
    if (e.key === "ArrowLeft" && i > 0) { i -= 1; rendre(); }
    if (e.key === "Escape") fermer();
  }
  document.addEventListener("keydown", clavier);

  voile.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tuto]");
    if (!b) return;
    const a = b.dataset.tuto;
    if (a === "suivant") { i += 1; rendre(); }
    if (a === "precedent") { i -= 1; rendre(); }
    if (a === "passer" || a === "fin") fermer();
    if (a === "compte") { fermer(); ouvrirCompte(); }
  });

  rendre();
}
