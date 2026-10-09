// ==========================================================
// ECRAN D'EQUIPE
// Choisir 5 persos parmi ceux obtenus, les placer
// (2 devant, 3 derriere), choisir un palier, puis combattre.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID, PERSOS_JOUABLES } from "../donnees/persos.js";
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
  puissancePerso, puissanceDeMonEquipe, ascensionner,
} from "../services/partie.js";
import { chargerPortraits, nombrePortraits, portraitDe } from "../services/portraits.js";
import { htmlPortrait, iconeRole, rafraichirPortrait, COULEURS_AFFINITE } from "../ui/cartes.js";
import { htmlFiche } from "../ui/fiche.js";
import { ouvrirChoixPiece } from "../ui/equipement-ui.js";
import { jouerEveil, jouerAscension } from "../ui/eveil.js";
import { htmlEntete, htmlOnglet } from "../ui/entete.js";
import { htmlNavigation, brancherNavigation, ouvrirLexique } from "../ui/navigation.js";
import { htmlSynergies } from "../ui/synergies.js";

const NOMS_PLACES = ["Avant 1", "Avant 2", "Arrière 1", "Arrière 2", "Arrière 3"];
const ORDRE_ROLES = ["tous", "tank", "attaquant", "assassin", "soutien", "controle"];
const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const sansAccents = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const echapper = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const nombreCourt = (n) => (n >= 10000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(".", ",")}k` : Math.round(n).toLocaleString("fr-FR"));

export function afficherEquipe(conteneur, { naviguer }) {
  // ---------- Etat de l'ecran ----------
  let equipe = equipeSauvee().map((id) => (possede(id) ? id : null));
  let palier = Math.min(palierSauve(), palierMaxDebloque());
  let placeChoisie = null;
  let filtre = "tous";
  let recherche = "";        // texte tape dans la recherche (nom ou serie)
  let tri = "puissance";
  let horsEquipe = false;    // cacher les persos deja dans l'equipe
  let cleGrille = "";        // pour ne pas reconstruire la liste sans raison
  let detail = equipe.find(Boolean) ?? idsPossedes()[0];
  let message = "";
  let chances = {};          // palier -> taux de victoire estime
  let calculEnCours = 0;     // pour abandonner un calcul devenu inutile

  const persosObtenus = () => PERSOS_JOUABLES.filter((p) => possede(p.id));
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
        <div class="equipe__gauche">
        <section class="formation" aria-labelledby="titre-formation">
          <div class="formation__titre-ligne">
            <h2 id="titre-formation">Formation <span class="puissance-equipe" id="puissance-equipe"></span></h2>
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
        <section class="panneau-synergies" aria-labelledby="titre-synergies">
          <div class="panneau-synergies__entete">
            <h2 id="titre-synergies">Synergies</h2>
            <p class="case__aide">Ce qui rend ton équipe plus forte que la somme de ses persos. Mis à jour à chaque changement.</p>
            <button type="button" class="bouton-texte" data-action="aide-synergies">Comment devenir plus fort ?</button>
          </div>
          <div id="synergies"></div>
        </section>
        </div>

        <section class="detail" id="detail" aria-live="polite"></section>
      </div>


      <section class="selection roster" aria-labelledby="titre-selection">
        <div class="roster__entete">
          <h2 id="titre-selection">Tes persos <span class="selection__compte" id="compte"></span></h2>
          <div class="roster__outils">
            <label class="roster__recherche">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
              <input type="search" id="recherche" placeholder="Chercher un perso ou une série" autocomplete="off" aria-label="Chercher un perso par nom ou par série">
            </label>
            <label class="roster__tri">
              <span class="visuellement-cache">Trier par</span>
              <select id="tri" aria-label="Trier par">
                <option value="puissance">Puissance</option>
                <option value="niveau">Niveau</option>
                <option value="rarete">Rareté</option>
                <option value="serie">Série</option>
                <option value="nom">Nom</option>
              </select>
            </label>
            <button type="button" class="filtre roster__hors" data-action="hors-equipe" aria-pressed="false">Hors équipe</button>
          </div>
          <div class="filtres" role="group" aria-label="Filtrer par rôle" id="filtres"></div>
        </div>
        <div class="roster__liste" id="grille"></div>
        <p class="selection__aide">Clique sur une place de la formation, puis sur un perso pour l'y mettre (ou glisse-le). Les autres persos s'obtiennent dans les <button type="button" class="bouton-texte" data-action="tirages">boosters</button>.</p>
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
    // le compte est ecrit par rendreGrille (il tient compte de la recherche)
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
    const total = $("#puissance-equipe");
    if (total) total.innerHTML = `Puissance <b>${puissanceDeMonEquipe(equipe).toLocaleString("fr-FR")}</b>`;
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
            <span class="place__puissance">${puissancePerso(id).toLocaleString("fr-FR")}</span>
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

  // La liste compacte de tes persos. Elle n'est reconstruite que si le filtre,
  // la recherche ou le tri changent (ou si on la force) ; sinon on met juste
  // a jour les pastilles « dans l'equipe ». Les vignettes hors de l'ecran ne
  // sont pas dessinees (content-visibility), ce qui garde l'ecran fluide.
  function rendreGrille(forcer = false) {
    const cle = [filtre, recherche, tri, horsEquipe, horsEquipe ? equipe.join() : ""].join("|");
    if (!forcer && cle === cleGrille) return majPrises();
    cleGrille = cle;
    const q = sansAccents(recherche.trim());
    const ordre = (p) => RARETES[p.rarete]?.ordre ?? 0;
    const visibles = persosObtenus()
      .filter((p) => filtre === "tous" || p.role === filtre)
      .filter((p) => !horsEquipe || !equipe.includes(p.id))
      .filter((p) => !q || sansAccents(`${p.nom} ${p.serie}`).includes(q))
      .map((p) => ({ p, prog: progressionDe(p.id), pui: puissancePerso(p.id) }))
      .sort((a, b) =>
        tri === "niveau" ? b.prog.niveau - a.prog.niveau || b.pui - a.pui
        : tri === "rarete" ? ordre(b.p) - ordre(a.p) || b.pui - a.pui
        : tri === "serie" ? a.p.serie.localeCompare(b.p.serie, "fr") || b.pui - a.pui
        : tri === "nom" ? a.p.nom.localeCompare(b.p.nom, "fr")
        : b.pui - a.pui);
    $("#compte").textContent = visibles.length === persosObtenus().length
      ? `${persosObtenus().length} sur ${PERSOS.length}`
      : `${visibles.length} affichés sur ${persosObtenus().length}`;
    $("#grille").innerHTML = visibles.length
      ? visibles.map(htmlVignette).join("")
      : `<p class="grille__vide">${q ? `Aucun perso ne correspond à « ${echapper(recherche.trim())} ».` : "Aucun perso ici pour l'instant."}</p>`;
  }

  function htmlVignette({ p, prog, pui }) {
    const prise = equipe.includes(p.id);
    return `
      <button type="button" class="vignette vignette--${p.rarete}${prise ? " vignette--prise" : ""}" data-action="choisir-perso" data-perso="${p.id}" draggable="true"
        style="--aff: ${COULEURS_AFFINITE[p.affinite]}; ${varsSerie(p.serie)}" aria-pressed="${prise}"
        aria-label="${p.nom}, ${RARETES[p.rarete].nom}, ${ROLES[p.role].nom}, niveau ${prog.niveau}, puissance ${pui}${prise ? ", dans ton équipe" : ""}">
        <span class="vignette__visuel">
          ${htmlPortrait(p)}
          <span class="vignette__role" title="${ROLES[p.role].nom}">${iconeRole(p.role)}</span>
          <span class="vignette__prise" aria-hidden="true">Équipe</span>
        </span>
        <span class="vignette__pui"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/></svg>${nombreCourt(pui)}</span>
        <span class="vignette__nom">${p.nom}</span>
        <span class="vignette__niv">Niv. ${prog.niveau}<span class="vignette__etoiles">${prog.ascension ? `<b class="vignette__rouge">${prog.ascension}</b>` : prog.etoiles}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/></svg></span></span>
      </button>`;
  }

  // Sans reconstruire : seulement les pastilles « dans l'equipe »
  function majPrises() {
    conteneur.querySelectorAll("#grille .vignette").forEach((v) => {
      const prise = equipe.includes(v.dataset.perso);
      v.classList.toggle("vignette--prise", prise);
      v.setAttribute("aria-pressed", String(prise));
    });
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
    if (action === "ascension") {
      const r = ascensionner(cible.dataset.perso);
      if (r.ok) jouerAscension(conteneur, PERSOS_PAR_ID[cible.dataset.perso], r.palier).then(() => { rendreDetail(); rendreFormation(); rendreGrille(true); estimerChances(); });
      else { message = r.erreur; rendreFormation(); }
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
    } else if (action === "hors-equipe") {
      horsEquipe = !horsEquipe;
      cible.setAttribute("aria-pressed", String(horsEquipe));
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
  // (petit delai : balayer la liste a la souris ne redessine pas la fiche a chaque vignette)
  let survol = null;
  conteneur.addEventListener("mouseover", (e) => {
    const carte = e.target.closest(".vignette[data-perso], .carte[data-perso]");
    if (!carte || carte.dataset.perso === detail) return;
    clearTimeout(survol);
    survol = setTimeout(() => {
      if (!carte.isConnected || carte.dataset.perso === detail) return;
      detail = carte.dataset.perso;
      rendreDetail();
    }, 90);
  });

  // ---------- Recherche et tri ----------
  let frappe = null;
  conteneur.addEventListener("input", (e) => {
    if (e.target.id !== "recherche") return;
    clearTimeout(frappe);
    frappe = setTimeout(() => { recherche = e.target.value; rendreGrille(); }, 120);
  });
  conteneur.addEventListener("change", (e) => {
    if (e.target.id !== "tri") return;
    tri = e.target.value;
    rendreGrille();
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
      // Les noms des persos sans portrait (pour signaler ceux a corriger)
      const sans = PERSOS.filter((p) => !portraitDe(p.id)).map((p) => p.nom);
      const liste = sans.length && sans.length <= 15 ? ` <span class="equipe__sans-portrait">(${sans.join(", ")})</span>` : "";
      zone.innerHTML = `${manquants} portraits manquent${erreur ? ` (${erreur})` : ""} : les initiales s'affichent à la place.${liste}
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
