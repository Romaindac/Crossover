// ==========================================================
// ECRAN D'EQUIPE
// Choisir 5 persos parmi ceux obtenus, les placer
// (2 devant, 3 derriere), choisir un palier, puis combattre.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { ROLES } from "../donnees/roles.js";
import { RARETES } from "../donnees/raretes.js";
import { CHAPITRES } from "../donnees/campagne.js";
import { encreCombat } from "../donnees/progression.js";
import { tauxVictoire, libelleChances } from "../moteur/estimation.js";
import { chercherEquipeConseillee } from "../moteur/composition.js";
import { cibleAvant, cibleArriere } from "../moteur/regles.js";
import { varsSerie, motifSerie } from "../donnees/series.js";
import {
  possede, progressionDe, idsPossedes, equipeSauvee, palierSauve,
  definirEquipe, definirPalier, palierMaxDebloque, estBattu, entreeCombat, equiperMeilleur, equiperMeilleurEquipe, prochaineEtape,
  eveiller, choisirTalent, equipesEnregistrees, enregistrerEquipe, chargerEquipe,
} from "../services/partie.js";
import { chargerPortraits, nombrePortraits } from "../services/portraits.js";
import { htmlCarte, htmlPortrait, iconeRole, rafraichirPortrait, COULEURS_AFFINITE } from "../ui/cartes.js";
import { htmlFiche } from "../ui/fiche.js";
import { ouvrirChoixPiece } from "../ui/equipement-ui.js";
import { jouerEveil } from "../ui/eveil.js";
import { htmlEntete, htmlOnglet } from "../ui/entete.js";
import { htmlNavigation, brancherNavigation, ouvrirLexique } from "../ui/navigation.js";
import { htmlSynergies } from "../ui/synergies.js";

const NOMS_PLACES = ["Avant 1", "Avant 2", "Arrière 1", "Arrière 2", "Arrière 3"];
const ORDRE_ROLES = ["tous", "tank", "attaquant", "assassin", "soutien", "controle"];
const nombre = (n) => Math.round(n).toLocaleString("fr-FR");

export function afficherEquipe(conteneur, { naviguer }) {
  // ---------- Etat de l'ecran ----------
  let equipe = equipeSauvee().map((id) => (possede(id) ? id : null));
  let palier = Math.min(palierSauve(), palierMaxDebloque());
  let placeChoisie = null;
  let filtre = "tous";
  let detail = equipe.find(Boolean) ?? idsPossedes()[0];
  let message = "";
  let chances = {};          // palier -> taux de victoire estime
  let calculEnCours = 0;     // pour abandonner un calcul devenu inutile

  const persosObtenus = () => PERSOS.filter((p) => possede(p.id));
  const sauver = () => {
    definirEquipe(equipe);
    definirPalier(palier);
  };

  // ---------- Squelette ----------
  conteneur.innerHTML = `
    ${htmlNavigation("equipe")}
    <div class="equipe">
      ${htmlEntete({
        titre: "Ton équipe", kanji: "仲間", theme: "equipe", classe: "equipe__entete",
        accroche: "Cinq persos sur deux lignes : la ligne avant encaisse, la ligne arrière frappe. Le placement compte.",
        extra: '<p class="equipe__chargement" id="chargement" role="status" aria-live="polite"></p>',
      })}

      <div class="equipe__haut">
        <section class="formation" aria-labelledby="titre-formation">
          <div class="formation__titre-ligne">
            <h2 id="titre-formation">Formation</h2>
            <div class="formation__outils">
              <button type="button" class="bouton-texte" data-action="meilleure" title="Cherche, par combats simulés, la meilleure équipe et le meilleur placement contre la prochaine étape">Équipe conseillée</button>
              <button type="button" class="bouton-texte" data-action="equiper-equipe">Équiper toute l'équipe</button>
              <button type="button" class="bouton-texte" data-action="hasard">Au hasard</button>
              <button type="button" class="bouton-texte" data-action="vider">Vider</button>
            </div>
          </div>
          <div class="equipes-enregistrees" id="equipes-enregistrees"></div>
          <div id="formation"></div>
          <p class="formation__message" id="message" role="status" aria-live="polite"></p>
        </section>

        <section class="detail" id="detail" aria-live="polite"></section>
      </div>

      <section class="panneau-synergies" aria-labelledby="titre-synergies">
        <div class="panneau-synergies__entete">
          <h2 id="titre-synergies">Synergies</h2>
          <p class="case__aide">Ce qui rend ton équipe plus forte que la somme de ses persos. Mis à jour à chaque changement.</p>
          <button type="button" class="bouton-texte" data-action="aide-synergies">Comment devenir plus fort ?</button>
        </div>
        <div id="synergies"></div>
      </section>

      <section class="selection" aria-labelledby="titre-selection">
        <div class="selection__entete">
          <h2 id="titre-selection">Tes persos <span class="selection__compte" id="compte"></span></h2>
          <div class="filtres" role="group" aria-label="Filtrer par rôle" id="filtres"></div>
        </div>
        <div class="grille" id="grille"></div>
        <p class="selection__aide">Les autres persos s'obtiennent dans les <button type="button" class="bouton-texte" data-action="tirages">boosters</button>.</p>
      </section>

      <section class="adversaire" aria-labelledby="titre-adversaire">
        <h2 id="titre-adversaire">Prochain combat</h2>
        <div id="paliers"></div>
        <div class="adversaire__action">
          <button type="button" class="bouton bouton--clair" data-action="aventure">Voir la campagne</button>
          <button type="button" class="bouton bouton--principal" id="combattre" data-action="combattre">Combattre</button>
        </div>
      </section>
    </div>
  `;

  const $ = (sel) => conteneur.querySelector(sel);

  // ---------- Rendu de chaque zone ----------

  function rendreEntete() {
    $("#compte").textContent = `${persosObtenus().length} sur ${PERSOS.length}`;
  }

  function rendreEquipesEnregistrees() {
    const zone = $("#equipes-enregistrees");
    if (!zone) return;
    zone.innerHTML = `<span class="case__aide">Équipes enregistrées :</span>` + equipesEnregistrees().map((e, i) => `
      <span class="equipe-enregistree">
        <button type="button" class="bouton-texte" data-action="charger-equipe" data-index="${i}" ${e ? "" : "disabled"}>${e ? e.nom : ["Campagne", "Chasse", "Tour"][i]}</button>
        <button type="button" class="bouton-texte bouton-texte--discret" data-action="enregistrer-equipe" data-index="${i}" title="Enregistrer l'équipe actuelle ici">enregistrer</button>
      </span>`).join("");
  }

  // Qui frappe qui au debut du prochain combat (attaques de base, sans Provocation) :
  // les ennemis en face visent la ligne avant, leurs assassins la ligne arriere.
  function visesParPlace() {
    const et = prochaineEtape();
    const miens = equipe.map((id, place) => (id ? { place } : null)).filter(Boolean);
    const vises = [[], [], [], [], []];
    if (!miens.length) return vises;
    et.equipe.forEach((id, place) => {
      const ennemi = PERSOS_PAR_ID[id];
      if (!ennemi) return;
      const cible = ennemi.role === "assassin" ? cibleArriere({ place }, miens) : cibleAvant({ place }, miens);
      if (cible) vises[cible.place].push(ennemi.nom);
    });
    return vises;
  }

  function rendreFormation() {
    rendreEquipesEnregistrees();
    const vises = visesParPlace();
    const htmlVise = (i) => (vises[i].length
      ? `<span class="place__vise${vises[i].length >= 3 ? " place__vise--danger" : ""}" title="Visé au début du prochain combat par : ${vises[i].join(", ")}">Visé par ${vises[i].length}</span>`
      : "");
    const place = (i) => {
      const id = equipe[i];
      const choisie = placeChoisie === i ? " place--choisie" : "";
      if (!id) {
        return `
          <button type="button" class="place place--vide${choisie}" data-action="place" data-place="${i}" aria-label="${NOMS_PLACES[i]}, vide">
            <span class="place__nom">${NOMS_PLACES[i]}</span>
          </button>`;
      }
      const perso = PERSOS_PAR_ID[id];
      const prog = progressionDe(id);
      return `
        <button type="button" class="place${choisie}" data-action="place" data-place="${i}" draggable="true"
          style="--aff: ${COULEURS_AFFINITE[perso.affinite]}; ${varsSerie(perso.serie)}" data-motif="${motifSerie(perso.serie)}" aria-label="${NOMS_PLACES[i]} : ${perso.nom}, niveau ${prog.niveau}">
          ${htmlPortrait(perso)}
          <span class="place__infos">
            <span class="place__perso">${perso.nom}</span>
            <span class="place__nom">Niv. ${prog.niveau}</span>
            ${htmlVise(i)}
          </span>
        </button>`;
    };

    $("#formation").innerHTML = `
      <div class="ligne">
        <span class="ligne__nom" title="Les ennemis frappent d'abord le perso de la ligne avant en face d'eux">Ligne avant</span>
        <div class="ligne__places">${place(0)}${place(1)}</div>
      </div>
      <div class="ligne">
        <span class="ligne__nom" title="Seuls les assassins ennemis (et certains ultimes) atteignent la ligne arrière">Ligne arrière</span>
        <div class="ligne__places">${place(2)}${place(3)}${place(4)}</div>
      </div>
    `;

    $("#synergies").innerHTML = htmlSynergies({ equipe, etape: prochaineEtape(), vises });

    $("#message").textContent = message;
    $("#combattre").disabled = equipe.some((id) => !id);
  }

  function rendreFiltres() {
    $("#filtres").innerHTML = ORDRE_ROLES.map((role) => `
      <button type="button" class="filtre" data-action="filtre" data-filtre="${role}" aria-pressed="${filtre === role}">
        ${role === "tous" ? "Tous" : `${iconeRole(role)}${ROLES[role].nom}`}
      </button>
    `).join("");
  }

  function rendreGrille() {
    const visibles = persosObtenus()
      .filter((p) => filtre === "tous" || p.role === filtre)
      .sort((a, b) => RARETES[b.rarete].ordre - RARETES[a.rarete].ordre || progressionDe(b.id).niveau - progressionDe(a.id).niveau);
    $("#grille").innerHTML = visibles.length
      ? visibles.map((p) => htmlCarte(p, { dansEquipe: equipe.includes(p.id), progression: progressionDe(p.id) })).join("")
      : '<p class="grille__vide">Aucun perso de ce rôle pour l\'instant.</p>';
  }

  function rendreDetail() {
    const p = PERSOS_PAR_ID[detail];
    if (!p) return;
    $("#detail").innerHTML = htmlFiche(p, progressionDe(p.id));
  }

  // La prochaine etape de campagne, avec les chances de ton equipe
  function rendrePaliers() {
    const et = prochaineEtape();
    const ch = CHAPITRES[et.chapitre - 1];
    $("#paliers").innerHTML = `
      <div class="palier palier--campagne" aria-live="polite">
        <span class="palier__numero">Chapitre ${et.chapitre}, étape ${et.numero}${et.type !== "normal" ? ` (${et.type === "boss" ? "boss" : "élite"})` : ""}</span>
        <span class="palier__nom">${et.nom}</span>
        <span class="palier__equipe">${ch.nom}. Niveau ennemi ${et.niveau}. ${et.equipe.map((id) => PERSOS_PAR_ID[id].nom).join(", ")}.</span>
        ${chances.etape === undefined ? "" : htmlChances(chances.etape)}
      </div>`;
  }

  function htmlChances(taux) {
    const { classe, mot } = libelleChances(taux);
    return `<span class="chances chances--${classe}" title="Chances de victoire estimées sur 30 combats simulés">${mot} : ${Math.round(taux * 100)} %<span class="visuellement-cache"> de chances de victoire</span></span>`;
  }

  // Estime les chances de victoire contre chaque palier ouvert, en
  // simulant 30 combats par palier. Le calcul se fait par petits
  // morceaux pour ne jamais figer l'ecran.
  async function estimerChances() {
    const jeton = ++calculEnCours;
    chances = {};
    if (equipe.some((id) => !id)) return rendrePaliers();
    const entrees = equipe.map(entreeCombat);
    await new Promise((r) => setTimeout(r, 150));
    if (jeton !== calculEnCours || !conteneur.isConnected) return;
    chances.etape = tauxVictoire(entrees, prochaineEtape());
    rendrePaliers();
  }

  function toutRendre() {
    rendreEntete();
    rendreFormation();
    rendreFiltres();
    rendreGrille();
    rendreDetail();
    rendrePaliers();
  }

  // ---------- Equipe conseillee ----------
  // Des centaines de combats simules contre la prochaine etape : on avance
  // par tranches de 25 ms pour que l'ecran reste fluide.
  let conseilEnCours = false;
  async function conseillerEquipe(bouton) {
    if (conseilEnCours) return;
    conseilEnCours = true;
    bouton.disabled = true;
    message = "Calcul de l'équipe conseillée…";
    $("#message").textContent = message;
    const collection = Object.fromEntries(idsPossedes().map((id) => [id, progressionDe(id)]));
    const recherche = chercherEquipeConseillee(collection, prochaineEtape(), (id, eq) => entreeCombat(id, eq.indexOf(id), eq));
    let etape;
    do {
      const debut = performance.now();
      do etape = recherche.next(); while (!etape.done && performance.now() - debut < 25);
      if (!etape.done) await new Promise((r) => setTimeout(r, 0));
      if (!conteneur.isConnected) return;
    } while (!etape.done);
    conseilEnCours = false;
    bouton.disabled = false;
    equipe = [...etape.value.equipe, null, null, null, null, null].slice(0, 5);
    message = "Équipe conseillée contre la prochaine étape (persos et placement testés en combats simulés). À toi d'ajuster !";
    placeChoisie = null;
    sauver();
    toutRendre();
    estimerChances();
  }

  // ---------- Placement des persos ----------

  function placer(id, place = null) {
    message = "";
    const actuelle = equipe.indexOf(id);

    if (place !== null) {
      if (actuelle !== -1) {
        [equipe[place], equipe[actuelle]] = [equipe[actuelle], equipe[place]];
      } else {
        equipe[place] = id;
      }
    } else if (actuelle !== -1) {
      equipe[actuelle] = null;
    } else {
      const ordre = PERSOS_PAR_ID[id].role === "tank" ? [0, 1, 2, 3, 4] : [2, 3, 4, 0, 1];
      const libre = ordre.find((i) => !equipe[i]);
      if (libre === undefined) {
        message = "Ton équipe est complète : clique d'abord sur une place pour la remplacer.";
      } else {
        equipe[libre] = id;
      }
    }
    placeChoisie = null;
    sauver();
  }

  // ---------- Clics ----------

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    if (cible.dataset.action === "aide-synergies") return ouvrirLexique("fort");
    const action = cible.dataset.action;

    if (action === "tirages") return naviguer("tirages");
    if (action === "aventure") return naviguer("aventure", { onglet: "campagne" });
    if (action === "charger-equipe") {
      const e = chargerEquipe(Number(cible.dataset.index));
      if (e) { equipe = e; message = "Équipe chargée."; toutRendre(); estimerChances(); }
      return;
    }
    if (action === "enregistrer-equipe") {
      sauver();
      enregistrerEquipe(Number(cible.dataset.index), ["Campagne", "Chasse", "Tour"][Number(cible.dataset.index)]);
      message = "Équipe enregistrée.";
      toutRendre();
      return;
    }
    if (action === "eveiller") {
      const r = eveiller(cible.dataset.perso);
      if (r.ok) jouerEveil(conteneur, PERSOS_PAR_ID[cible.dataset.perso], r.palier).then(() => { rendreDetail(); estimerChances(); });
      else { message = r.erreur; rendreFormation(); }
      return;
    }
    if (action === "talent") {
      const r = choisirTalent(cible.dataset.perso, Number(cible.dataset.palier), cible.dataset.choix);
      if (!r.ok) { message = r.erreur; rendreFormation(); }
      rendreDetail();
      return;
    }
    if (action === "equiper-equipe") {
      const n = equiperMeilleurEquipe();
      message = n ? `${n} pièce${n > 1 ? "s" : ""} changée${n > 1 ? "s" : ""} : chaque perso porte ses meilleures pièces.` : "Ton équipe porte déjà ses meilleures pièces.";
      rendreFormation();
      rendreDetail();
      estimerChances();
      return;
    }
    if (action === "equiper-meilleur") {
      equiperMeilleur(cible.dataset.perso);
      rendreDetail();
      estimerChances();
      return;
    }
    if (action === "emplacement") {
      return ouvrirChoixPiece(conteneur, cible.dataset.perso, cible.dataset.emplacement, () => {
        rendreDetail();
        estimerChances();
      });
    }

    if (action === "choisir-perso") {
      detail = cible.dataset.perso;
      placer(cible.dataset.perso, placeChoisie);
    } else if (action === "place") {
      const i = Number(cible.dataset.place);
      if (equipe[i]) detail = equipe[i];
      if (placeChoisie === i && equipe[i]) {
        equipe[i] = null;
        placeChoisie = null;
        sauver();
      } else {
        placeChoisie = placeChoisie === i ? null : i;
        message = placeChoisie !== null ? `${NOMS_PLACES[i]} choisie : clique sur un perso pour l'y placer${equipe[i] ? ", ou reclique pour la vider" : ""}.` : "";
      }
    } else if (action === "filtre") {
      filtre = cible.dataset.filtre;
    } else if (action === "palier") {
      const choix = Number(cible.dataset.palier);
      if (choix > palierMaxDebloque()) return;
      palier = choix;
      sauver();
    } else if (action === "meilleure") {
      conseillerEquipe(cible);
      return;
    } else if (action === "hasard") {
      const reserve = persosObtenus().map((p) => p.id).sort(() => Math.random() - 0.5).slice(0, 5);
      const tanks = reserve.filter((id) => PERSOS_PAR_ID[id].role === "tank");
      const autres = reserve.filter((id) => PERSOS_PAR_ID[id].role !== "tank");
      equipe = [...tanks, ...autres, null, null, null, null, null].slice(0, 5);
      message = "";
      placeChoisie = null;
      sauver();
    } else if (action === "vider") {
      equipe = [null, null, null, null, null];
      message = "";
      placeChoisie = null;
      sauver();
    } else if (action === "combattre") {
      if (equipe.some((id) => !id)) return;
      const et = prochaineEtape();
      return naviguer("combat", { equipe: [...equipe], campagne: { chapitre: et.chapitre, numero: et.numero }, retour: "equipe" });
    } else {
      return;
    }
    toutRendre();
    if (["choisir-perso", "place", "meilleure", "hasard", "vider"].includes(action)) estimerChances();
  });

  // Survol d'une carte : on affiche son detail (sur ordinateur)
  conteneur.addEventListener("mouseover", (e) => {
    const carte = e.target.closest(".carte[data-perso]");
    if (carte && carte.dataset.perso !== detail) {
      detail = carte.dataset.perso;
      rendreDetail();
    }
  });

  // ---------- Glisser-deposer (sur ordinateur) ----------

  conteneur.addEventListener("dragstart", (e) => {
    const source = e.target.closest("[draggable='true']");
    if (!source) return;
    const donnees = source.dataset.perso ? { perso: source.dataset.perso } : { perso: equipe[Number(source.dataset.place)] };
    e.dataTransfer.setData("text/plain", JSON.stringify(donnees));
    e.dataTransfer.effectAllowed = "move";
  });

  conteneur.addEventListener("dragover", (e) => {
    if (e.target.closest(".place")) e.preventDefault();
  });

  conteneur.addEventListener("drop", (e) => {
    const place = e.target.closest(".place");
    if (!place) return;
    e.preventDefault();
    try {
      const { perso } = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (!possede(perso)) return;
      detail = perso;
      placer(perso, Number(place.dataset.place));
      toutRendre();
      estimerChances();
    } catch {
      // donnees glissees inconnues : on ignore
    }
  });

  brancherNavigation(conteneur, naviguer, "equipe");

  // ---------- Portraits ----------

  const total = PERSOS.length;
  function suivreChargement() {
    const zone = $("#chargement");
    const n = nombrePortraits();
    zone.textContent = n < total ? `Chargement des portraits : ${n} sur ${total}` : "";
    chargerPortraits((id) => {
      rafraichirPortrait(conteneur, id);
      zone.textContent = `Chargement des portraits : ${nombrePortraits()} sur ${total}`;
    }).then(({ manquants, erreur }) => {
      if (!manquants) {
        zone.textContent = "";
        return;
      }
      zone.innerHTML = `${manquants} portraits manquent${erreur ? ` (${erreur})` : ""} : les initiales s'affichent à la place.
        <button type="button" class="bouton-texte" data-action="reessayer-portraits">Réessayer</button>`;
    });
  }
  conteneur.addEventListener("click", (e) => {
    if (e.target.closest("[data-action='reessayer-portraits']")) suivreChargement();
  });
  suivreChargement();

  toutRendre();
  estimerChances();
}
