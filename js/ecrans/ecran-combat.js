// ==========================================================
// ECRAN DE COMBAT
// Le moteur calcule le combat tic par tic (0,1 s) ; cet ecran
// ne fait que lire les evenements produits et les animer.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { PALIERS } from "../donnees/ennemis.js";
import { creerCombat, avancer, demanderUltime } from "../moteur/simulation.js";
import { nouvelleGraine } from "../moteur/hasard.js";
import { TICS_PAR_SECONDE, DUREE_MAX, ENERGIE_MAX, niveauRage } from "../moteur/regles.js";
import { EFFETS, aEffet } from "../moteur/effets.js";
import { reglage, changerReglage, NOMS_CASES } from "../services/reglages.js";
import { entreeCombat, appliquerResultatCombat, appliquerResultatChasse, appliquerResultatCampagne, appliquerResultatTour, palierMaxDebloque, definirPalier, aUnePartie, sceneVue, marquerSceneVue } from "../services/partie.js";
import { etageTour, arcDeLaSemaine } from "../donnees/tour.js";
import { sceneAvantEtape, MOMENTS } from "../donnees/histoire.js";
import { jouerScene } from "../ui/scene.js";
import { annoncerTampons } from "../ui/toast.js";
import { verifierTampons, noterBoucle, etapeDeluxe, appliquerResultatDeluxe, recyclerCommunesLibres, assezDEnergie, payerEnergie, combatGratuit, coutEnergie, etatEnergie, rechargerEnergie, bonusDerniereVictoire, encre as encreJoueur } from "../services/partie.js";
import { afficherToast } from "../ui/toast.js";
import { CHAPITRES, etapeDe, nombreEtoiles, ETOILE_VICTOIRE, ETOILE_SANS_KO, ETOILE_RAPIDE, SECONDES_RAPIDE } from "../donnees/campagne.js";
import { ZONES, MULT_SOUS_ZONE, MULT_BOSS, CHANCE_DORE, BONUS_DORE } from "../donnees/zones.js";
import { nomPiece } from "../moteur/equipement.js";
import { RARETES, ORDRE_RARETES } from "../donnees/raretes.js";
import { varsSerie, motifSerie } from "../donnees/series.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait, COULEURS_AFFINITE } from "../ui/cartes.js";
import { iconeEffet } from "../ui/icones-effets.js";
import { htmlDecor } from "../ui/decors.js";

const DUREE_TIC = 100; // millisecondes par tic, a vitesse x1
const ONOMATOPEES = ["ドン", "ドドド", "ゴゴゴ", "バキッ", "ズドン", "ドカッ", "BAM", "VLAN", "BOUM", "CRAC", "PAF", "SBAM"];
const EFFETS_ANNONCES = { etourdi: "Étourdi", provocation: "Provoque", bouclier: "Bouclier", renforcement: "Renforcé", acceleration: "Accéléré" };

const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// chasse : { zoneId, index (0-2 sous-zone, 3 boss), groupe, dore, boucle: { total, fait, victoires, butin, eclats } }
// campagne : { chapitre, numero }
// tour : { etage, boucle: { fait, etages, eclats, encre, fragments, encreSacree } | null }
export function afficherCombat(conteneur, { naviguer, equipe, palier, chasse = null, campagne = null, tour = null, retour = "equipe" }) {
  const adversaire = tour ? adversaireTour(tour) : campagne ? adversaireCampagne(campagne)
    : chasse ? adversaireChasse(chasse)
    : PALIERS.find((p) => p.palier === palier) ?? PALIERS[0];
  const enBoucle = chasse?.boucle ?? tour?.boucle ?? null;
  if (!aUnePartie() || !Array.isArray(equipe) || equipe.length !== 5 || equipe.some((id) => !PERSOS_PAR_ID[id])) {
    naviguer("equipe");
    return;
  }

  // ---------- Energie : il en faut assez pour tenter le combat (payee a la victoire) ----------
  const modeEnergie = tour ? "tour" : campagne ? (campagne.deluxe ? "deluxe" : "campagne") : chasse ? "chasse" : "palier";
  const gratuit = combatGratuit({ campagne, tour });
  if (!gratuit && !assezDEnergie(modeEnergie)) {
    afficherManqueEnergie();
    return;
  }

  function afficherManqueEnergie(message = "") {
    const e = etatEnergie();
    const minutes = e.prochain ? Math.max(1, Math.ceil((e.prochain - Date.now()) / 60000)) : 0;
    conteneur.innerHTML = `
      <main class="manque-energie">
        <div class="manque-energie__case" role="dialog" aria-labelledby="titre-energie">
          <h1 id="titre-energie" class="manque-energie__titre">Plus assez d'énergie</h1>
          <p class="manque-energie__jauge"><strong>${e.valeur}</strong> / ${e.max} d'énergie · ce combat en demande ${coutEnergie(modeEnergie)} (payée seulement si tu gagnes).</p>
          <p class="case__aide">Elle remonte toute seule : +1 toutes les 3 minutes${minutes ? ` (prochain point dans ${minutes} min)` : ""}. Les missions du jour, les événements et le calendrier en donnent aussi. En attendant, la première victoire d'une étape de campagne et les étages de la Tour pas encore battus cette semaine sont gratuits.</p>
          <p class="case__message" role="status">${message}</p>
          <div class="manque-energie__actions">
            <button type="button" class="bouton bouton--principal" data-action="recharger-energie" ${e.achatsRestants > 0 && encreJoueur() >= e.recharge.prix ? "" : "disabled"}>+${e.recharge.energie} énergie · ${e.recharge.prix} d'encre (${e.achatsRestants} restante${e.achatsRestants > 1 ? "s" : ""} aujourd'hui)</button>
            <button type="button" class="bouton bouton--clair" data-action="retour-energie">Retour</button>
          </div>
        </div>
      </main>`;
    conteneur.onclick = (ev) => {
      const b = ev.target.closest("[data-action]");
      if (!b || b.disabled) return;
      if (b.dataset.action === "retour-energie") naviguer(retour === "equipe" || retour === "qg" ? retour : "aventure");
      if (b.dataset.action === "recharger-energie") {
        const r = rechargerEnergie();
        if (r.ok && assezDEnergie(modeEnergie)) naviguer("combat", { equipe, palier, chasse, campagne, tour, retour });
        else afficherManqueEnergie(r.ok ? "Recharge faite, mais il en manque encore." : r.erreur);
      }
    };
  }

  // ---------- Etat de l'ecran ----------
  let auto = reglage("auto");
  let vitesse = enBoucle ? 3 : reglage("vitesse");   // la boucle de chasse tourne en x3
  let modeCases = reglage("cases");
  let secousses = reglage("secousses");
  let casesVues = new Set();  // persos dont la grande case a deja ete montree ce combat
  let ultimesManuels = 0;     // pour les missions du jour
  let passerCase = null;      // pour passer la case en cours d'un clic
  let enPause = false;
  let etat = null;
  let graine = 0;
  let lecture = false;      // une animation bloquante est en cours (case d'ultime)
  let enCours = false;      // le combat tourne
  let cumul = 0;
  let gelJusqua = 0;        // arret sur image apres un gros coup
  let derniereImage = performance.now();
  let astuceAffichee = false;
  const cartes = {};        // uid -> element de la carte
  const statutsAffiches = {};
  const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;

  conteneur.innerHTML = `
    <div class="combat">
      <header class="combat__barre">
        <button type="button" class="lien-retour" data-action="abandonner">Abandonner</button>
        <p class="combat__adversaire ${enBoucle ? "combat__adversaire--boucle" : ""}">${adversaire.tour
          ? `Tour des Mille Volumes : <strong>${adversaire.nom}</strong> <span class="badge-boucle">${adversaire.arc.nom}</span>${enBoucle ? ` <span class="badge-dore">Descente : ${enBoucle.fait + 1} étage${enBoucle.fait ? "s" : ""}</span>` : ""}`
          : adversaire.chasse
          ? `${adversaire.titre} : <strong>${adversaire.nom}</strong>${adversaire.dore ? ' <span class="badge-dore">Doré</span>' : ""}${enBoucle ? ` <span class="badge-boucle">Boucle ${enBoucle.fait + 1} / ${enBoucle.total}</span>` : ""}`
          : adversaire.campagne ? `${adversaire.titre} : <strong>${adversaire.nom}</strong>${adversaire.type !== "normal" ? ` <span class="badge-${adversaire.type === "boss" ? "boss" : "dore"}">${adversaire.type === "boss" ? "Boss" : "Élite"}</span>` : ""}`
          : `Palier ${adversaire.palier} : <strong>${adversaire.nom}</strong>`}</p>
        <div class="commandes">
          <button type="button" class="commande" data-action="auto" aria-pressed="${auto}">Auto</button>
          <button type="button" class="commande" data-action="vitesse" aria-label="Vitesse">x${vitesse}</button>
          <button type="button" class="commande" data-action="pause" aria-pressed="false">Pause</button>
          ${enBoucle ? '<button type="button" class="commande commande--arret" data-action="arreter-boucle">Arrêter la boucle</button>' : ""}
        </div>
      </header>
      <main class="scene">
        ${htmlDecor(adversaire.decor, { crepuscule: adversaire.palier > 5 })}
        <div class="tableau-pv">
          <div class="tableau-pv__camp tableau-pv__camp--a">
            <span class="tableau-pv__nom">Ton équipe</span>
            <span class="jauge-equipe"><span class="jauge-equipe__rempli" id="pv-a"></span></span>
          </div>
          <div class="chrono-bloc">
            <p class="chrono" id="chrono" aria-label="Temps restant">90</p>
            <p class="rage" id="rage" hidden title="Après 60 s, toutes les 5 s : +15 % de dégâts et -15 % de soins pour tout le monde"></p>
          </div>
          <div class="tableau-pv__camp tableau-pv__camp--b">
            <span class="tableau-pv__nom">${adversaire.nom} <small>niv. ${adversaire.niveau}</small></span>
            <span class="jauge-equipe"><span class="jauge-equipe__rempli" id="pv-b"></span></span>
          </div>
        </div>
        <div class="arene" id="arene"></div>
      </main>
      <div class="calque" id="calque" aria-hidden="true"></div>
      <p class="visuellement-cache" id="annonces" aria-live="polite"></p>
      <div id="fin"></div>
    </div>
  `;

  const $ = (sel) => conteneur.querySelector(sel);
  const calque = $("#calque");

  // ---------- Construction de l'arene ----------

  function htmlCombattant(u) {
    const perso = PERSOS_PAR_ID[u.id];
    const balise = u.camp === 0 ? "button" : "div";
    const attributs = u.camp === 0 ? 'type="button" data-action="ultime"' : "";
    return `
      <${balise} ${attributs} class="combattant combattant--${u.camp === 0 ? "a" : "b"}" data-uid="${u.uid}"
        style="--aff: ${COULEURS_AFFINITE[perso.affinite]}; ${varsSerie(perso.serie)}" data-motif="${motifSerie(perso.serie)}" aria-label="${perso.nom}">
        <span class="combattant__pret" aria-hidden="true">Ultime prêt</span>
        <span class="combattant__corps" style="--decalage: ${(-Math.random() * 3).toFixed(2)}s">
          <span class="combattant__cadre">
            ${htmlPortrait(perso)}
            <span class="combattant__statuts"></span>
            <span class="combattant__niveau" title="Niveau ${u.niveau}">${u.niveau}</span>
          </span>
        </span>
        <span class="combattant__plaque">
          <span class="combattant__nom">${perso.nom}</span>
          <span class="jauge jauge--pv"><span class="jauge__trace"></span><span class="jauge__rempli"></span></span>
          <span class="jauge jauge--energie"><span class="jauge__rempli"></span></span>
        </span>
      </${balise}>
    `;
  }

  function htmlCamp(camp) {
    const unites = etat.equipes[camp];
    return `
      <div class="camp camp--${camp === 0 ? "a" : "b"}">
        <div class="rang rang--arriere">${unites.slice(2).map(htmlCombattant).join("")}</div>
        <div class="rang rang--avant">${unites.slice(0, 2).map(htmlCombattant).join("")}</div>
      </div>
    `;
  }

  function construireArene() {
    $("#arene").innerHTML = `
      ${htmlCamp(0)}
      <div class="arene__vs" aria-hidden="true">VS</div>
      ${htmlCamp(1)}
      <div class="arene__pause" id="ecran-pause" hidden>
        <p class="arene__pause-titre">Pause</p>
        <div class="reglages-rapides">
          <p class="reglages-rapides__titre">Grandes cases d'ultime</p>
          <div class="choix-segmente" role="radiogroup" aria-label="Grandes cases d'ultime">
            ${Object.entries(NOMS_CASES).map(([val, nom]) => `
              <button type="button" role="radio" class="choix-segmente__option" data-action="cases" data-valeur="${val}" aria-checked="${modeCases === val}">${nom}</button>`).join("")}
          </div>
          <label class="interrupteur">
            <input type="checkbox" data-action="secousses" ${secousses ? "checked" : ""}>
            <span>Secousses de l'écran</span>
          </label>
        </div>
      </div>
    `;
    for (const u of etat.unites) {
      cartes[u.uid] = $(`[data-uid="${u.uid}"]`);
      statutsAffiches[u.uid] = "";
    }
    calque.innerHTML = "";
    $("#fin").innerHTML = "";
    if (mouvementReduit) conteneur.querySelector(".decor svg")?.pauseAnimations?.();
    mettreAJourUnites();
    mettreAJourChrono();
  }

  // ---------- Mise a jour des cartes ----------

  function mettreAJourUnites() {
    for (const u of etat.unites) {
      const carte = cartes[u.uid];
      const ratio = Math.max(0, u.pv / u.pvMax);
      carte.style.setProperty("--pv", ratio);
      carte.style.setProperty("--energie", u.energie / ENERGIE_MAX);
      carte.dataset.etatPv = ratio > 0.5 ? "haut" : ratio > 0.25 ? "moyen" : "bas";

      const ko = u.pv <= 0;
      const pret = !ko && u.energie >= ENERGIE_MAX && !aEffet(u, "etourdi");
      carte.classList.toggle("combattant--ko", ko);
      carte.classList.toggle("combattant--pret", pret);
      carte.classList.toggle("combattant--etourdi", !ko && aEffet(u, "etourdi"));
      if (!pret) carte.classList.remove("combattant--arme");

      // Icones d'effets, redessinees seulement si elles changent
      const cle = u.effets.map((e) => e.type).sort().join(",");
      if (cle !== statutsAffiches[u.uid]) {
        statutsAffiches[u.uid] = cle;
        carte.querySelector(".combattant__statuts").innerHTML = u.effets
          .map((e) => `<span class="statut-effet statut-effet--${EFFETS[e.type]?.positif ? "positif" : "negatif"}" title="${EFFETS[e.type]?.nom ?? e.type}">${iconeEffet(e.type)}</span>`)
          .join("");
      }

      if (u.camp === 0) {
        carte.setAttribute("aria-label", `${u.nom}, ${ko ? "KO" : `${Math.round(u.pv)} PV sur ${u.pvMax}`}${pret ? ", ultime prêt" : ""}`);
        carte.disabled = ko;
      }
    }
    $(".combat").classList.toggle("combat--manuel", !auto);

    // Jauges de PV de chaque equipe, facon jeu de combat
    for (const camp of [0, 1]) {
      const unites = etat.equipes[camp];
      const total = unites.reduce((s, u) => s + Math.max(0, u.pv), 0) / unites.reduce((s, u) => s + u.pvMax, 0);
      $(camp === 0 ? "#pv-a" : "#pv-b").style.setProperty("--pv", total);
    }
  }

  function mettreAJourChrono() {
    const reste = Math.max(0, Math.ceil((DUREE_MAX - etat.t) / TICS_PAR_SECONDE));
    const chrono = $("#chrono");
    chrono.textContent = reste;
    chrono.classList.toggle("chrono--urgent", reste <= 10);
    const rage = niveauRage(etat.t);
    const badge = $("#rage");
    badge.hidden = rage === 0;
    if (rage) badge.textContent = `Rage x${rage}`;
  }

  // ---------- Petits effets visuels ----------

  const duree = (ms) => (mouvementReduit ? Math.min(ms, 200) : ms) / vitesse;

  function centreDe(element) {
    const r = element.getBoundingClientRect();
    const c = calque.getBoundingClientRect();
    return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2, h: r.height };
  }

  function afficherFlottant(uid, texte, classe = "") {
    const cible = cartes[uid];
    if (!cible) return;
    const { x, y, h } = centreDe(cible);
    const el = document.createElement("span");
    el.className = `flottant ${classe}`;
    el.textContent = texte;
    el.style.left = `${x + (Math.random() * 30 - 15)}px`;
    el.style.top = `${y - h * 0.15}px`;
    calque.appendChild(el);
    const anim = el.animate(
      [
        { transform: "translateY(6px) scale(0.7)", opacity: 0 },
        { transform: "translateY(-8px) scale(1.1)", opacity: 1, offset: 0.2 },
        { transform: "translateY(-46px) scale(1)", opacity: 0 },
      ],
      { duration: duree(900), easing: "ease-out" }
    );
    anim.onfinish = () => el.remove();
  }

  function afficherOnomatopee(uid, texte = auHasard(ONOMATOPEES)) {
    const cible = cartes[uid];
    if (!cible) return;
    const { x, y } = centreDe(cible);
    const el = document.createElement("span");
    el.className = "onomatopee";
    el.textContent = texte;
    el.style.left = `${x + (Math.random() * 40 - 20)}px`;
    el.style.top = `${y - 30}px`;
    const r = `rotate(${Math.round(Math.random() * 24 - 12)}deg)`;
    calque.appendChild(el);
    const anim = el.animate(
      [
        { transform: `${r} scale(0.3)`, opacity: 0 },
        { transform: `${r} scale(1.15)`, opacity: 1, offset: 0.25 },
        { transform: `${r} scale(1)`, opacity: 1, offset: 0.7 },
        { transform: `${r} scale(1.05)`, opacity: 0 },
      ],
      { duration: duree(800), easing: "ease-out" }
    );
    anim.onfinish = () => el.remove();
  }

  // L'attaquant prend son elan (petit recul), bondit, puis revient
  function elan(sourceUid, cibleUid) {
    if (mouvementReduit) return;
    const source = cartes[sourceUid];
    const cible = cartes[cibleUid];
    if (!source || !cible) return;
    const a = centreDe(source);
    const b = centreDe(cible);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    source.style.zIndex = 4;
    const anim = source.animate(
      [
        { transform: "translate(0, 0)" },
        { transform: `translate(${-dx * 0.06}px, ${-dy * 0.06}px) scale(1.04)`, offset: 0.25 },
        { transform: `translate(${dx * 0.38}px, ${dy * 0.38}px) scale(1.06)`, offset: 0.5 },
        { transform: "translate(0, 0)" },
      ],
      { duration: duree(380), easing: "ease-in-out" }
    );
    anim.onfinish = () => (source.style.zIndex = "");
  }

  // La cible flashe, tremble et recule dans le sens du coup
  function impact(uid, sourceUid = null, fort = false) {
    const carte = cartes[uid];
    const cadre = carte?.querySelector(".combattant__cadre");
    if (!cadre) return;
    cadre.animate(
      mouvementReduit
        ? [{ filter: "brightness(1.8)" }, { filter: "brightness(1)" }]
        : [
            { filter: "brightness(1)", transform: "translateX(0)" },
            { filter: "brightness(2.4) contrast(1.2)", transform: "translateX(-5px)", offset: 0.2 },
            { transform: "translateX(5px)", offset: 0.5 },
            { filter: "brightness(1)", transform: "translateX(0)" },
          ],
      { duration: duree(280) }
    );
    if (mouvementReduit || !sourceUid || !cartes[sourceUid]) return;
    const a = centreDe(cartes[sourceUid]);
    const b = centreDe(carte);
    const longueur = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const recul = fort ? 18 : 9;
    carte.querySelector(".combattant__corps").animate(
      [
        { transform: "translate(0, 0) rotate(0)" },
        { transform: `translate(${((b.x - a.x) / longueur) * recul}px, ${((b.y - a.y) / longueur) * recul}px) rotate(${b.x > a.x ? 4 : -4}deg)`, offset: 0.3 },
        { transform: "translate(0, 0) rotate(0)" },
      ],
      { duration: duree(fort ? 420 : 300), easing: "ease-out" }
    );
  }

  // Tremblement de toute la scene
  function secouer(force = 1) {
    if (mouvementReduit || !secousses) return;
    const f = 4 * force;
    $(".scene").animate(
      [
        { transform: "translate(0, 0)" },
        { transform: `translate(${-f}px, ${f / 2}px)` },
        { transform: `translate(${f}px, ${-f / 2}px)` },
        { transform: `translate(${-f / 2}px, ${f}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: duree(240 + force * 60) }
    );
  }

  // Arret sur image : le combat se fige un instant, comme dans les jeux de combat
  function geler(ms) {
    if (mouvementReduit) return;
    gelJusqua = Math.max(gelJusqua, performance.now() + ms / vitesse);
  }

  // Effet dessine a l'encre sur la cible : entaille, eclat ou onde
  const ETOILE_IMPACT = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 ? 22 : 48;
    const ang = (i / 24) * Math.PI * 2;
    return `${(Math.cos(ang) * r).toFixed(1)},${(Math.sin(ang) * r).toFixed(1)}`;
  }).join(" ");

  function dessinImpact(sourceUid, cibleUid, critique) {
    const source = etat.unites.find((u) => u.uid === sourceUid);
    const cible = cartes[cibleUid];
    if (!source || !cible || mouvementReduit) return;
    const { x, y } = centreDe(cible);
    const type = ["attaquant", "assassin"].includes(source.role) ? "entaille" : source.role === "tank" ? "eclat" : "onde";
    const sens = source.camp === 0 ? 1 : -1;

    let dessin;
    if (type === "entaille") {
      const traits = [[-40, -30, 40, 26], [-30, -6, 44, 34], [-46, -50, 26, 0]]
        .map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} L${x2} ${y2}" class="impact__trait"/>`).join("");
      dessin = `<g transform="scale(${sens} 1)">${traits}</g>`;
    } else if (type === "eclat") {
      dessin = `<polygon points="${ETOILE_IMPACT}" class="impact__eclat"/>`;
    } else {
      dessin = `<circle r="34" class="impact__onde" style="stroke: ${COULEURS_AFFINITE[source.affinite]}"/>`;
    }
    if (critique) dessin = `<polygon points="${ETOILE_IMPACT}" class="impact__eclat impact__eclat--critique" transform="scale(1.35)"/>` + dessin;

    const el = document.createElement("span");
    el.className = `impact impact--${type}${critique ? " impact--critique" : ""}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML = `<svg viewBox="-70 -70 140 140" aria-hidden="true">${dessin}</svg>`;
    calque.appendChild(el);
    const anim = el.animate(
      [
        { transform: "scale(0.4)", opacity: 1 },
        { transform: "scale(1.05)", opacity: 1, offset: 0.35 },
        { transform: "scale(1.25)", opacity: 0 },
      ],
      { duration: duree(type === "onde" ? 480 : 360), easing: "ease-out" }
    );
    anim.onfinish = () => el.remove();

    if (critique) eclaboussures(x, y);
  }

  // Gouttes d'encre projetees sur les critiques
  function eclaboussures(x, y) {
    for (let i = 0; i < 7; i++) {
      const goutte = document.createElement("span");
      goutte.className = "goutte";
      goutte.style.left = `${x}px`;
      goutte.style.top = `${y}px`;
      calque.appendChild(goutte);
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 50;
      goutte.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.4)`, opacity: 0 },
        ],
        { duration: duree(450 + Math.random() * 200), easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" }
      ).onfinish = () => goutte.remove();
    }
  }

  // Petites croix vertes qui montent lors d'un soin
  function etincellesSoin(uid) {
    const cible = cartes[uid];
    if (!cible || mouvementReduit) return;
    const { x, y, h } = centreDe(cible);
    for (let i = 0; i < 3; i++) {
      const el = document.createElement("span");
      el.className = "etincelle-soin";
      el.style.left = `${x + (i - 1) * 22}px`;
      el.style.top = `${y + h * 0.15}px`;
      calque.appendChild(el);
      el.animate(
        [{ transform: "translateY(0) scale(0.6)", opacity: 0 }, { transform: "translateY(-18px) scale(1)", opacity: 1, offset: 0.3 }, { transform: "translateY(-50px) scale(0.8)", opacity: 0 }],
        { duration: duree(800), delay: i * 90, easing: "ease-out", fill: "backwards" }
      ).onfinish = () => el.remove();
    }
  }

  // Le lanceur d'un ultime se gonfle d'energie
  function elanUltime(uid) {
    const corps = cartes[uid]?.querySelector(".combattant__corps");
    if (!corps || mouvementReduit) return;
    corps.animate(
      [{ transform: "scale(1)", filter: "brightness(1)" }, { transform: "scale(1.14)", filter: "brightness(1.35)", offset: 0.5 }, { transform: "scale(1)", filter: "brightness(1)" }],
      { duration: duree(420), easing: "ease-in-out" }
    );
  }

  function annoncer(texte) {
    $("#annonces").textContent = texte;
  }

  // Grande case manga pour tes ultimes : le combat attend la fin
  async function caseUltime(u) {
    const perso = PERSOS_PAR_ID[u.id];
    const el = document.createElement("div");
    el.className = "case-ultime";
    el.innerHTML = `
      <div class="case-ultime__case" style="--aff: ${COULEURS_AFFINITE[perso.affinite]}">
        <div class="case-ultime__portrait">${htmlPortrait(perso)}</div>
        <div class="case-ultime__texte">
          <p class="case-ultime__perso">${perso.nom}</p>
          <p class="case-ultime__technique">${perso.ultime.nom}</p>
        </div>
        <span class="case-ultime__onomatopee">${auHasard(ONOMATOPEES)}</span>
      </div>
    `;
    calque.appendChild(el);
    el.addEventListener("click", () => passerCase?.());
    const total = duree(1150);
    const anim = el.firstElementChild.animate(
      mouvementReduit
        ? [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }]
        : [
            { transform: "translateX(-120%) rotate(-3deg)", opacity: 1 },
            { transform: "translateX(0) rotate(-3deg)", offset: 0.15 },
            { transform: "translateX(2%) rotate(-3deg)", offset: 0.85 },
            { transform: "translateX(120%) rotate(-3deg)", opacity: 1 },
          ],
      { duration: total, easing: "ease-in-out" }
    );
    passerCase = () => anim.finish();
    await anim.finished.catch(() => {});
    passerCase = null;
    el.remove();
  }

  // Bandeau discret pour les ultimes ennemis : le combat continue
  function bandeauUltime(u) {
    const el = document.createElement("div");
    el.className = `bandeau-ultime${u.camp === 0 ? " bandeau-ultime--allie" : ""}`;
    el.innerHTML = `${u.camp === 0 ? "Ultime" : "Ultime ennemi"} : <strong>${u.nom}</strong>, ${u.ultime.nom}`;
    $("#arene").appendChild(el);
    const anim = el.animate(
      [
        { transform: "translateY(-150%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1, offset: 0.15 },
        { transform: "translateY(0)", opacity: 1, offset: 0.85 },
        { transform: "translateY(-150%)", opacity: 0 },
      ],
      { duration: duree(1400) }
    );
    anim.onfinish = () => el.remove();
  }

  // ---------- Lecture des evenements d'un tic ----------

  async function jouerEvenement(ev) {
    const unite = (uid) => etat.unites.find((u) => u.uid === uid);

    switch (ev.type) {
      case "attaque":
        if (ev.base) elan(ev.source, ev.cible);
        impact(ev.cible, ev.source, ev.critique || !ev.base);
        dessinImpact(ev.source, ev.cible, ev.critique);
        if (ev.critique) {
          geler(70);
          secouer(1);
        }
        if (ev.degats > 0 || !ev.absorbe) {
          afficherFlottant(ev.cible, String(ev.degats), ev.critique ? "flottant--critique" : ev.avantage ? "flottant--avantage" : "");
        }
        if (ev.absorbe) afficherFlottant(ev.cible, "Bouclier", "flottant--texte");
        if (ev.critique && Math.random() < 0.5) afficherOnomatopee(ev.cible);
        break;
      case "esquive":
        afficherFlottant(ev.cible, "Esquive", "flottant--texte");
        break;
      case "annule":
        afficherFlottant(ev.cible, ev.nom, "flottant--texte flottant--passif");
        break;
      case "ultime": {
        const u = unite(ev.source);
        // Mission du jour : on ne compte que les ultimes vraiment lances a la main
        if (ev.manuel) ultimesManuels += 1;
        annoncer(`${u.nom} lance ${u.ultime.nom}`);
        elanUltime(u.uid);
        secouer(1.5);
        const grandeCase = !enBoucle && u.camp === 0 && (modeCases === "toujours" || (modeCases === "premiere" && !casesVues.has(u.uid)));
        if (grandeCase) {
          casesVues.add(u.uid);
          mettreAJourUnites();
          await caseUltime(u);
        } else {
          bandeauUltime(u);
        }
        break;
      }
      case "soin":
        afficherFlottant(ev.cible, `+${ev.montant}`, "flottant--soin");
        etincellesSoin(ev.cible);
        break;
      case "perte":
        afficherFlottant(ev.cible, String(ev.montant), "flottant--perte");
        break;
      case "effet":
        if (EFFETS_ANNONCES[ev.effet]) afficherFlottant(ev.cible, EFFETS_ANNONCES[ev.effet], "flottant--texte");
        break;
      case "resiste":
        afficherFlottant(ev.cible, "Résiste", "flottant--texte");
        break;
      case "passif":
        afficherFlottant(ev.source, ev.nom, "flottant--texte flottant--passif");
        break;
      case "ko":
        afficherOnomatopee(ev.cible);
        geler(140);
        secouer(2);
        annoncer(`${unite(ev.cible).nom} est KO`);
        break;
    }
  }

  async function jouerTic() {
    lecture = true;
    const evenements = avancer(etat);
    for (const ev of evenements) await jouerEvenement(ev);
    if (!conteneur.isConnected) return;
    mettreAJourUnites();
    mettreAJourChrono();
    lecture = false;
    if (etat.fini) terminer();
  }

  // ---------- Horloge ----------

  function boucle(maintenant) {
    if (!conteneur.isConnected) return; // on a quitte l'ecran
    const ecart = Math.min(maintenant - derniereImage, 100);
    derniereImage = maintenant;
    if (enCours && !enPause && !lecture && maintenant >= gelJusqua) {
      cumul += ecart * vitesse;
      if (cumul >= DUREE_TIC) {
        cumul = Math.min(cumul - DUREE_TIC, DUREE_TIC);
        jouerTic();
      }
    }
    requestAnimationFrame(boucle);
  }

  // ---------- Debut et fin ----------

  async function demarrer() {
    graine = nouvelleGraine();
    etat = creerCombat({
      modificateurs: adversaire.modificateurs ?? null,
      equipeA: equipe.map(entreeCombat),
      equipeB: adversaire.equipe,
      niveauB: adversaire.niveau,
      multiplicateurB: adversaire.multiplicateur,
      graine,
      autoA: enBoucle ? true : auto,
      journal: false,
    });
    enCours = false;
    lecture = false;
    cumul = 0;
    casesVues = new Set();
    ultimesManuels = 0;
    construireArene();

    // Petite annonce de debut
    const debut = document.createElement("span");
    debut.className = "annonce-debut";
    debut.textContent = "Combat !";
    calque.appendChild(debut);
    await debut.animate(
      [
        { transform: "scale(2)", opacity: 0 },
        { transform: "scale(1)", opacity: 1, offset: 0.3 },
        { transform: "scale(1)", opacity: 1, offset: 0.75 },
        { transform: "scale(0.9)", opacity: 0 },
      ],
      { duration: mouvementReduit ? 500 : 1000 }
    ).finished.catch(() => {});
    debut.remove();
    if (!conteneur.isConnected) return;
    enCours = true;
    derniereImage = performance.now();
  }

  async function terminer() {
    if (!enCours) return; // deja termine : les recompenses ne se donnent qu'une fois
    enCours = false;
    const victoire = etat.vainqueur === 0;
    const duree = etat.t / TICS_PAR_SECONDE;
    const koAllies = etat.equipes[0].filter((u) => u.pv <= 0).length;
    const recompenses = adversaire.tour
      ? appliquerResultatTour({ etage: tour.etage, victoire, ids: equipe, duree, ultimesManuels, koAllies })
      : adversaire.campagne
      ? (campagne.deluxe
        ? appliquerResultatDeluxe({ chapitre: campagne.chapitre, numero: campagne.numero, victoire, ids: equipe, duree, ultimesManuels, koAllies })
        : appliquerResultatCampagne({ chapitre: campagne.chapitre, numero: campagne.numero, victoire, ids: equipe, duree, ultimesManuels, koAllies }))
      : adversaire.chasse
      ? appliquerResultatChasse({ zoneId: chasse.zoneId, index: chasse.index, dore: adversaire.dore, victoire, ids: equipe, duree, ultimesManuels, koAllies })
      : appliquerResultatCombat({ palier: adversaire.palier, victoire, ids: equipe, duree, ultimesManuels });

    // Energie payee a la victoire, et bonus de l'heure folle
    if (victoire) {
      const cout = gratuit ? 0 : payerEnergie(modeEnergie);
      const bonus = bonusDerniereVictoire();
      const morceaux = [gratuit ? (tour ? "Nouvel étage : énergie offerte" : "Première victoire : énergie offerte") : `Énergie −${cout}`];
      if (bonus) {
        const gains = [bonus.encre && `+${bonus.encre} encre`, bonus.poussiere && `+${bonus.poussiere} poussière`, bonus.eclats && `+${bonus.eclats} éclats`, bonus.energie && `+${bonus.energie} énergie`, bonus.tickets && "+1 booster !"].filter(Boolean);
        if (gains.length) morceaux.push(`${bonus.nom} : ${gains.join(", ")}`);
      }
      if (!enBoucle || bonus?.tickets) afficherToast(`<span>${morceaux.join(" · ")}</span>`, { duree: 2600 });
    }

    // Les vainqueurs encore debout sautent de joie
    if (!mouvementReduit) {
      for (const u of etat.equipes[etat.vainqueur]) {
        if (u.pv <= 0) continue;
        cartes[u.uid]?.querySelector(".combattant__corps")?.animate(
          [{ transform: "translateY(0)" }, { transform: "translateY(-16px)" }, { transform: "translateY(0)" }, { transform: "translateY(-8px)" }, { transform: "translateY(0)" }],
          { duration: 700, easing: "ease-out", delay: Math.random() * 150 }
        );
      }
    }

    await pause(mouvementReduit ? 300 : 900);
    if (!conteneur.isConnected) return;

    annoncerTampons(verifierTampons());

    // Nouveaux liens decouverts : une courte scene entre les deux persos
    for (const lien of recompenses.liens ?? []) {
      if (enBoucle) break;
      await jouerScene(conteneur, [{ qui: "narrateur", texte: `Nouveau lien découvert : « ${lien.nom} » !` }, ...lien.scene], { titre: `Lien : ${lien.nom}` });
      if (!conteneur.isConnected) return;
    }
    if (adversaire.chasse) return finChasse(victoire, recompenses);
    if (adversaire.tour) return finTour(victoire, recompenses);
    const enCampagne = Boolean(adversaire.campagne);

    // Denouement du chapitre, juste apres la premiere victoire contre son boss
    if (enCampagne && recompenses.chapitreTermine) {
      const cle = `${recompenses.chapitreTermine}-fin`;
      await jouerScene(conteneur, cle, { titre: `Chapitre ${recompenses.chapitreTermine} : ${MOMENTS.fin.nom}` });
      marquerSceneVue(cle);
      if (!conteneur.isConnected) return;
    }

    const miens = etat.equipes[0];
    // Une etiquette par meilleur dans chaque domaine : les tanks et les soigneurs comptent aussi
    const premierPar = (champ) => {
      const u = miens.reduce((a, b) => (b.bilan[champ] > a.bilan[champ] ? b : a));
      return u.bilan[champ] > 0 ? u : null;
    };
    const etiquettes = [[premierPar("inflige"), "Bourreau"], [premierPar("encaisse"), "Mur"], [premierPar("soins"), "Soigneur"]];
    const htmlEtiquettes = (u) => etiquettes.filter(([v]) => v === u).map(([, nom]) => ` <span class="etiquette-mvp">${nom}</span>`).join("");
    const restants = etat.equipes[1].filter((u) => u.pv > 0).length;
    const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
    const xpDe = (id) => recompenses.xp.find((x) => x.id === id);
    const raison = etat.raison === "temps"
      ? "Temps écoulé au bout de 90 secondes."
      : `Combat terminé en ${(etat.t / TICS_PAR_SECONDE).toFixed(1).replace(".", ",")} s.`;
    const suivant = enCampagne ? recompenses.suivante : PALIERS.find((p) => p.palier === adversaire.palier + 1);
    const suivantOuvert = enCampagne ? Boolean(suivant) : suivant && palierMaxDebloque() >= suivant.palier;
    const htmlEtoiles = enCampagne ? `
      <ul class="etoiles-victoire" aria-label="Étoiles de victoire">
        ${[[ETOILE_VICTOIRE, "Victoire"], [ETOILE_SANS_KO, "Aucun perso KO"], [ETOILE_RAPIDE, `Moins de ${SECONDES_RAPIDE} s`]].map(([bit, texte]) => `
          <li class="${recompenses.etoiles & bit ? "obtenue" : ""} ${recompenses.etoiles & bit && !(recompenses.etoilesAvant & bit) ? "nouvelle" : ""}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>
            <span>${texte}</span>
          </li>`).join("")}
      </ul>` : "";

    $("#fin").innerHTML = `
      <div class="voile">
        <div class="resultat resultat--combat" role="dialog" aria-modal="true" aria-labelledby="titre-fin">
          <h2 class="resultat__titre resultat__titre--${victoire ? "victoire" : "defaite"}" id="titre-fin">${victoire ? "Victoire" : "Défaite"}</h2>
          <p class="resultat__detail">${raison}${!victoire && restants ? ` ${restants} ennemi${restants > 1 ? "s" : ""} encore debout.` : ""}</p>

          <div class="gains">
            <p class="gains__encre"><span class="compteur-encre__goutte" aria-hidden="true"></span>+${nombre(recompenses.encre)} d'encre</p>
            ${recompenses.premiereVictoire ? '<p class="gains__tampon">Première victoire</p>' : ""}
          </div>
          ${recompenses.fragments ? `<p class="gains__butin">+${recompenses.fragments} fragment${recompenses.fragments > 1 ? "s" : ""} d'éveil${recompenses.eclats ? `, +${recompenses.eclats} éclats` : ""}</p>` : ""}
          ${recompenses.butin.length ? `<p class="gains__butin">Butin : ${recompenses.butin.map((p) => `<span class="obi-rarete obi-rarete--${p.rarete} obi-rarete--pastille">${nomPiece(p)}, ${RARETES[p.rarete].nom}</span>`).join(" ")}</p>` : ""}
          ${htmlEtoiles}
          ${!enCampagne && recompenses.palierDebloque ? `<p class="gains__deblocage">Palier ${recompenses.palierDebloque} débloqué : ${PALIERS[recompenses.palierDebloque - 1].nom}</p>` : ""}
          ${enCampagne && recompenses.chapitreTermine ? `<p class="gains__deblocage">Chapitre ${recompenses.chapitreTermine} terminé !${recompenses.chapitreTermine < 5 ? ` Le chapitre ${recompenses.chapitreTermine + 1} et une nouvelle zone de chasse sont ouverts.` : ""}</p>` : ""}

          <div class="defile">
            <table class="tableau-fin">
              <thead><tr><th>Perso</th><th>État</th><th class="nombre">Dégâts</th><th class="nombre col-soins">Encaissé</th><th class="nombre col-soins">Soins</th><th>XP</th></tr></thead>
              <tbody>
                ${miens.map((u) => {
                  const x = xpDe(u.id);
                  const monte = x && x.niveauApres > x.niveauAvant;
                  return `
                  <tr class="${u.pv <= 0 ? "ko" : ""}">
                    <td><strong>${u.nom}</strong>${htmlEtiquettes(u)}</td>
                    <td>${u.pv <= 0 ? "KO" : `${Math.round((u.pv / u.pvMax) * 100)} %`}</td>
                    <td class="nombre">${nombre(u.bilan.inflige)}</td>
                    <td class="nombre col-soins">${nombre(u.bilan.encaisse)}</td>
                    <td class="nombre col-soins">${nombre(u.bilan.soins)}</td>
                    <td>${x && x.gain ? `+${x.gain}` : "Max"}${monte ? ` <span class="montee">Niv. ${x.niveauAvant} → ${x.niveauApres}</span>` : ""}</td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
          ${recompenses.xpReserve ? `<p class="resultat__note">Tes persos en réserve gagnent aussi ${recompenses.xpReserve} XP.</p>` : ""}

          <div class="resultat__actions">
            ${victoire && suivantOuvert ? `<button type="button" class="bouton bouton--principal" data-action="${enCampagne ? "etape-suivante" : "palier-suivant"}">${enCampagne ? "Étape suivante" : "Palier suivant"}</button>` : ""}
            ${enCampagne ? '<button type="button" class="bouton bouton--clair" data-action="campagne">Campagne</button>' : ""}
            <button type="button" class="bouton ${victoire && suivantOuvert ? "bouton--clair" : "bouton--principal"}" data-action="rejouer">Rejouer</button>
            <button type="button" class="bouton bouton--clair" data-action="equipe">Changer d'équipe</button>
            <button type="button" class="bouton bouton--clair" data-action="qg">QG</button>
          </div>
        </div>
      </div>
    `;
    $("#fin .resultat__actions .bouton").focus();
  }

  // ---------- Chasse : fin de combat et boucle automatique ----------

  let boucleArretee = false;

  function htmlButin(liste) {
    return liste.map((p) => `<span class="obi-rarete obi-rarete--${p.rarete} obi-rarete--pastille">${p.nom}</span>`).join(" ");
  }

  // Bilan d'une boucle : du plus rare au plus commun, les memes objets regroupes (x3)
  function htmlButinGroupe(liste) {
    const resume = [];
    const pastilles = [];
    for (const r of ORDRE_RARETES) {
      const objets = liste.filter((p) => p.rarete === r);
      if (!objets.length) continue;
      resume.push(`${objets.length} ${RARETES[r].nom}${objets.length > 1 ? "s" : ""}`);
      const parNom = new Map();
      for (const p of objets) parNom.set(p.nom, (parNom.get(p.nom) ?? 0) + 1);
      for (const [nom, n] of parNom) pastilles.push(`<span class="obi-rarete obi-rarete--${r} obi-rarete--pastille">${nom}${n > 1 ? ` x${n}` : ""}</span>`);
    }
    return `<strong>${resume.join(", ")}</strong> ${pastilles.join(" ")}`;
  }

  async function finChasse(victoire, r) {
    const butinCombat = r.butin.map((p) => ({ nom: nomPiece(p), rarete: p.rarete }));
    const zone = ZONES.find((z) => z.id === chasse.zoneId);

    // Boucle : on cumule, puis on enchaine tout seul si tout va bien
    if (enBoucle) {
      const suite = {
        ...enBoucle,
        fait: enBoucle.fait + 1,
        victoires: enBoucle.victoires + (victoire ? 1 : 0),
        butin: [...enBoucle.butin, ...butinCombat],
        eclats: enBoucle.eclats + r.eclats,
      };
      if (reglage("recyclageAuto")) recyclerCommunesLibres();
      const continuer = (victoire || reglage("boucleContinuer")) && !boucleArretee && suite.fait < suite.total;
      if (continuer) {
        $("#fin").innerHTML = `
          <div class="bandeau-boucle" role="status" aria-live="polite">
            <strong>Combat ${suite.fait} / ${suite.total} : ${victoire ? "victoire" : "défaite, la boucle continue"}.</strong>
            ${butinCombat.length ? `Butin : ${htmlButin(butinCombat)}` : "Pas de butin cette fois."}
            <span class="case__aide">Combat suivant dans un instant...</span>
          </div>`;
        await pause(1600);
        if (!conteneur.isConnected || boucleArretee) {
          if (conteneur.isConnected) afficherBilanBoucle(suite, victoire, zone);
          return;
        }
        naviguer("combat", { equipe, chasse: prochainCombatChasse(chasse, suite), retour });
        return;
      }
      noterBoucle(suite.victoires);
      return afficherBilanBoucle(suite, victoire, zone, r.zoneDebloquee);
    }

    // Combat seul
    $("#fin").innerHTML = `
      <div class="voile">
        <div class="resultat resultat--combat" role="dialog" aria-modal="true" aria-labelledby="titre-fin">
          <h2 class="resultat__titre resultat__titre--${victoire ? "victoire" : "defaite"}" id="titre-fin">${victoire ? "Victoire" : "Défaite"}</h2>
          <p class="resultat__detail">${adversaire.titre} : ${adversaire.nom}${adversaire.dore ? " (doré, butin doublé)" : ""}.</p>
          <p class="gains__butin">${victoire ? (butinCombat.length ? `Butin : ${htmlButin(butinCombat)}` : "Pas de butin cette fois. Le Butin % de ton équipe augmente les chances.") : "Pas de butin en cas de défaite."}</p>
          <p class="resultat__note">+${r.eclats} éclats d'encre, +${r.xp[0]?.gain ?? 0} XP par perso de l'équipe.</p>
          ${r.zoneDebloquee ? `<p class="gains__deblocage">Nouvelle zone ouverte : ${ZONES[r.zoneDebloquee - 1].nom}</p>` : ""}
          <div class="resultat__actions">
            <button type="button" class="bouton bouton--principal" data-action="chasse-encore">Combattre encore</button>
            <button type="button" class="bouton bouton--clair" data-action="zone">Retour à la zone</button>
            <button type="button" class="bouton bouton--clair" data-action="equipe">Changer d'équipe</button>
          </div>
        </div>
      </div>`;
    $("#fin .resultat__actions .bouton").focus();
  }

  function afficherBilanBoucle(suite, derniereVictoire, zone, zoneDebloquee = null) {
    $("#fin").innerHTML = `
      <div class="voile">
        <div class="resultat resultat--combat" role="dialog" aria-modal="true" aria-labelledby="titre-fin">
          <h2 class="resultat__titre resultat__titre--${derniereVictoire ? "victoire" : "defaite"}" id="titre-fin">Fin de la boucle</h2>
          <p class="resultat__detail">${suite.fait} combat${suite.fait > 1 ? "s" : ""} joué${suite.fait > 1 ? "s" : ""} en ${zone.nom}, ${suite.victoires} victoire${suite.victoires > 1 ? "s" : ""}${derniereVictoire ? "" : " : arrêt après une défaite"}.</p>
          <p class="gains__butin">${suite.butin.length ? `${suite.butin.length} objet${suite.butin.length > 1 ? "s" : ""} : ${htmlButinGroupe(suite.butin)}` : "Aucun objet trouvé pendant cette boucle."}</p>
          <p class="resultat__note">+${suite.eclats} éclats d'encre au total.</p>
          ${zoneDebloquee ? `<p class="gains__deblocage">Nouvelle zone ouverte : ${ZONES[zoneDebloquee - 1].nom}</p>` : ""}
          <div class="resultat__actions">
            <button type="button" class="bouton bouton--principal" data-action="zone">Retour à la zone</button>
            <button type="button" class="bouton bouton--clair" data-action="qg">QG</button>
          </div>
        </div>
      </div>`;
    $("#fin .resultat__actions .bouton").focus();
  }

  // ---------- Tour : fin de combat et descente en boucle ----------

  const texteGains = (g) => [
    g.eclats ? `+${g.eclats} éclats` : null,
    g.encre ? `+${g.encre} d'encre` : null,
    g.fragments ? `+${g.fragments} fragment${g.fragments > 1 ? "s" : ""} d'éveil` : null,
    g.encreSacree ? `+${g.encreSacree} encre sacrée !` : null,
    g.butin?.length ? `objet${g.butin.length > 1 ? "s" : ""} : ${g.butin.map((p) => nomPiece(p)).join(", ")}` : null,
  ].filter(Boolean).join(", ");

  async function finTour(victoire, r) {
    const b = enBoucle;
    if (b) {
      const suite = {
        fait: b.fait + (victoire ? 1 : 0),
        eclats: b.eclats + r.eclats, encre: b.encre + r.encre,
        fragments: b.fragments + r.fragments, encreSacree: b.encreSacree + r.encreSacree,
      };
      if (victoire && !boucleArretee) {
        $("#fin").innerHTML = `
          <div class="bandeau-boucle" role="status" aria-live="polite">
            <strong>${adversaire.nom} franchi${r.premiere ? " : nouveau record !" : "."}</strong>
            <span>${texteGains(r) || "Pas de gain cette fois."}</span>
            <span class="case__aide">Étage suivant dans un instant...</span>
          </div>`;
        await pause(1600);
        if (conteneur.isConnected && !boucleArretee) {
          naviguer("combat", { equipe, tour: { etage: tour.etage + 1, boucle: suite }, retour });
          return;
        }
        if (!conteneur.isConnected) return;
      }
      $("#fin").innerHTML = `
        <div class="voile">
          <div class="resultat resultat--combat" role="dialog" aria-modal="true" aria-labelledby="titre-fin">
            <h2 class="resultat__titre resultat__titre--${victoire ? "victoire" : "defaite"}" id="titre-fin">Fin de la descente</h2>
            <p class="resultat__detail">${suite.fait} étage${suite.fait > 1 ? "s" : ""} franchi${suite.fait > 1 ? "s" : ""}${victoire ? "" : `, arrêt au ${adversaire.nom.toLowerCase()}`}. Record : étage ${r.record}.</p>
            <p class="gains__butin">${texteGains(suite) || "Aucun gain pendant cette descente."}</p>
            <div class="resultat__actions">
              <button type="button" class="bouton bouton--principal" data-action="tour">Retour à la Tour</button>
              <button type="button" class="bouton bouton--clair" data-action="qg">QG</button>
            </div>
          </div>
        </div>`;
      $("#fin .resultat__actions .bouton").focus();
      return;
    }
    $("#fin").innerHTML = `
      <div class="voile">
        <div class="resultat resultat--combat" role="dialog" aria-modal="true" aria-labelledby="titre-fin">
          <h2 class="resultat__titre resultat__titre--${victoire ? "victoire" : "defaite"}" id="titre-fin">${victoire ? "Victoire" : "Défaite"}</h2>
          <p class="resultat__detail">${adversaire.nom}, niveau ${adversaire.niveau}.${r.premiere ? " Nouveau record !" : ""}</p>
          <p class="gains__butin">${victoire ? texteGains(r) || "Étage déjà franchi : petite récompense." : "Pas de récompense en cas de défaite."}</p>
          <p class="resultat__note">+${r.xp[0]?.gain ?? 0} XP par perso de l'équipe.</p>
          <div class="resultat__actions">
            ${victoire ? '<button type="button" class="bouton bouton--principal" data-action="etage-suivant">Étage suivant</button>' : ""}
            <button type="button" class="bouton ${victoire ? "bouton--clair" : "bouton--principal"}" data-action="rejouer">Rejouer</button>
            <button type="button" class="bouton bouton--clair" data-action="tour">Retour à la Tour</button>
          </div>
        </div>
      </div>`;
    $("#fin .resultat__actions .bouton").focus();
  }

  // ---------- Commandes ----------

  function basculerPause() {
    if (!etat || etat.fini) return;
    enPause = !enPause;
    const bouton = $("[data-action='pause']");
    bouton.setAttribute("aria-pressed", String(enPause));
    bouton.textContent = enPause ? "Reprendre" : "Pause";
    $("#ecran-pause").hidden = !enPause;
    derniereImage = performance.now();
  }

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    const action = cible.dataset.action;

    if (action === "abandonner") {
      naviguer(retour);
    } else if (action === "equipe") {
      naviguer("equipe");
    } else if (action === "qg") {
      naviguer("qg");
    } else if (action === "rejouer") {
      demarrer();
    } else if (action === "etage-suivant") {
      naviguer("combat", { equipe, tour: { etage: tour.etage + 1, boucle: null }, retour });
    } else if (action === "tour") {
      naviguer("aventure", { onglet: "tour" });
    } else if (action === "etape-suivante") {
      const suite = etapeDe(campagne.chapitre, campagne.numero + 1) ?? etapeDe(campagne.chapitre + 1, 1);
      if (suite) naviguer("combat", { equipe, campagne: { chapitre: suite.chapitre, numero: suite.numero, deluxe: campagne.deluxe }, retour });
    } else if (action === "campagne") {
      naviguer("aventure", { onglet: "campagne", chapitre: campagne.chapitre, deluxe: campagne.deluxe });
    } else if (action === "arreter-boucle") {
      boucleArretee = true;
      cible.disabled = true;
      cible.textContent = "Arrêt après ce combat";
    } else if (action === "zone") {
      naviguer("aventure", { zoneId: chasse.zoneId, index: chasse.index });
    } else if (action === "chasse-encore") {
      naviguer("combat", { equipe, chasse: prochainCombatChasse(chasse, null), retour });
    } else if (action === "palier-suivant") {
      definirPalier(adversaire.palier + 1);
      naviguer("combat", { equipe, palier: adversaire.palier + 1, retour });
    } else if (action === "auto") {
      auto = !auto;
      changerReglage("auto", auto);
      cible.setAttribute("aria-pressed", String(auto));
      if (etat) etat.autoA = auto;
      mettreAJourUnites();
    } else if (action === "vitesse") {
      vitesse = vitesse >= 3 ? 1 : vitesse + 1;
      changerReglage("vitesse", vitesse);
      cible.textContent = `x${vitesse}`;
    } else if (action === "pause") {
      basculerPause();
    } else if (action === "cases") {
      modeCases = cible.dataset.valeur;
      changerReglage("cases", modeCases);
      conteneur.querySelectorAll("[data-action='cases']").forEach((b) => b.setAttribute("aria-checked", String(b === cible)));
    } else if (action === "secousses") {
      secousses = cible.checked;
      changerReglage("secousses", secousses);
    } else if (action === "ultime") {
      if (!etat || !enCours) return;
      const u = etat.unites.find((x) => x.uid === cible.dataset.uid);
      if (!u || u.pv <= 0) return;
      if (auto) {
        if (!astuceAffichee) {
          afficherFlottant(u.uid, "Coupe Auto pour jouer toi-même", "flottant--texte");
          astuceAffichee = true;
        }
        return;
      }
      if (u.energie >= ENERGIE_MAX) {
        demanderUltime(etat, u.uid);
        cible.classList.add("combattant--arme");
      }
    }
  });

  function clavier(e) {
    if (!conteneur.isConnected) {
      document.removeEventListener("keydown", clavier);
      return;
    }
    // Touches 1 a 5 : lancer l'ultime du perso correspondant (mode manuel)
    if (/^[1-5]$/.test(e.key) && etat && !etat.fini && !etat.autoA && !e.target.closest("input, select, textarea")) {
      const u = etat.equipes[0][Number(e.key) - 1];
      if (u && u.pv > 0 && u.energie >= 100) {
        demanderUltime(etat, u.uid);
        cartes[u.uid]?.classList.add("combattant--arme");
      }
    }
    // La barre d'espace met en pause, sauf si on est sur un bouton ou une case a cocher
    if (e.code === "Space" && !$("#fin").innerHTML && !e.target.closest("button, input, select, textarea")) {
      e.preventDefault();
      basculerPause();
    }
  }
  document.addEventListener("keydown", clavier);

  // Au cas ou des portraits manquent encore
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));

  requestAnimationFrame(boucle);
  // En campagne, la scene de l'etape se joue d'abord (une seule fois)
  (async () => {
    const cle = adversaire.campagne && !campagne.deluxe ? sceneAvantEtape(campagne.chapitre, campagne.numero) : null;
    if (cle && !sceneVue(cle)) {
      const moment = cle.split("-")[1];
      await jouerScene(conteneur, cle, { titre: `Chapitre ${campagne.chapitre} : ${MOMENTS[moment].nom}` });
      marquerSceneVue(cle);
      if (!conteneur.isConnected) return;
    }
    demarrer();
  })();
}

// ---------- Chasse : construire l'adversaire et le combat suivant ----------

function adversaireChasse(chasse) {
  const zone = ZONES.find((z) => z.id === chasse.zoneId) ?? ZONES[0];
  const boss = chasse.index === 3;
  const sousZone = zone.sousZones[Math.min(chasse.index, 2)];
  const groupe = boss ? zone.boss : sousZone.groupes[chasse.groupe ?? 0];
  const dore = !boss && Boolean(chasse.dore);
  return {
    chasse: true,
    titre: `${zone.nom}, ${boss ? "boss" : sousZone.nom}`,
    nom: groupe.nom,
    equipe: groupe.equipe,
    niveau: (boss ? zone.boss.niveau : sousZone.niveau) + (dore ? BONUS_DORE.niveau : 0),
    multiplicateur: (boss ? MULT_BOSS : MULT_SOUS_ZONE) * (dore ? BONUS_DORE.mult : 1),
    decor: zone.decor,
    dore,
  };
}

// Le combat suivant d'une boucle : un groupe au hasard de la meme sous-zone
export function prochainCombatChasse(chasse, boucle) {
  const zone = ZONES.find((z) => z.id === chasse.zoneId);
  const boss = chasse.index === 3;
  const groupe = boss ? 0 : Math.floor(Math.random() * zone.sousZones[chasse.index].groupes.length);
  return { zoneId: chasse.zoneId, index: chasse.index, groupe, dore: !boss && Math.random() < CHANCE_DORE, boucle };
}

// ---------- Campagne : construire l'adversaire d'une etape ----------

function adversaireCampagne({ chapitre, numero, deluxe = false }) {
  const etape = (deluxe ? etapeDeluxe(chapitre, numero) : etapeDe(chapitre, numero)) ?? etapeDe(1, 1);
  return {
    campagne: true,
    titre: `${deluxe ? "Édition deluxe, chapitre" : "Chapitre"} ${etape.chapitre}, étape ${etape.numero}`,
    nom: etape.nom,
    type: etape.type,
    equipe: etape.equipe,
    niveau: etape.niveau,
    multiplicateur: etape.multiplicateur,
    decor: CHAPITRES[etape.chapitre - 1].decor,
  };
}

// ---------- Tour : construire l'adversaire d'un etage ----------

function adversaireTour({ etage }) {
  const e = etageTour(etage);
  const arc = arcDeLaSemaine();
  return {
    tour: true,
    nom: e.nom,
    equipe: e.equipe,
    niveau: e.niveau,
    multiplicateur: e.multiplicateur,
    decor: e.decor,
    palier: 6,            // decor en version crepuscule : on est sous la Bibliotheque
    arc,
    modificateurs: arc.mods,
  };
}
