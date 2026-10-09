// ==========================================================
// LE DONJON D'ENCRE (affichage, onglet de l'Aventure)
// Hors descente : record, maitrises, entree. Pendant une descente :
// l'etage suivant, le sac, les vies, les benedictions ; combattre,
// enchainer, ou sortir avec le butin. Tous les 3 etages : un choix.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import {
  BENEDICTIONS_PAR_ID, MAITRISES, DESCENTES_PAR_JOUR, ETAGES_PAR_BENEDICTION, CHANCE_PAR_10_ETAGES_DONJON,
} from "../donnees/donjon.js";
import {
  etatDonjon, entrerDonjon, combattreEtage, configEtage, choisirBenediction, sortirDonjon, acheterMaitrise, equipeSauvee, verifierTampons,
} from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait } from "./cartes.js";
import { annoncerTampons } from "./toast.js";
import { jouerCombatDirect } from "./combat-direct.js";
import { sonCarte, sonRarete, sonComplete } from "./sons.js";

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const NOMS_TYPES = { normal: "Étage", elite: "Étage d'élite", gardien: "Gardien de l'étage" };
const COEUR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>';

export function afficherDonjon(zone, { naviguer, majNavigation }) {
  const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let enCombat = false;
  let enchainer = false;
  let message = "";
  let bilan = null;      // le resultat de la derniere descente terminee
  const $ = (s) => zone.querySelector(s);

  const htmlMini = (ids) => `<div class="mini-equipe">${ids.map((id) => `<span class="mini-equipe__perso" title="${PERSOS_PAR_ID[id]?.nom ?? id}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}</div>`;

  function htmlMaitrises(e) {
    return `
      <section class="donjon__maitrises">
        <h3 class="case__titre">Maîtrises <small>${nombre(e.cristaux)} cristaux</small></h3>
        <p class="case__aide">Permanentes : elles servent à toutes les descentes. Les cristaux viennent des étages (plus il est profond, plus il en donne).</p>
        <ul class="donjon__liste-maitrises">${MAITRISES.map((m) => {
          const n = e.maitrises[m.id] ?? 0;
          const max = n >= m.max;
          return `
            <li class="donjon__maitrise">
              <span><b>${m.nom}</b> ${n}/${m.max}<small>${m.texte(n)}</small></span>
              <button type="button" class="bouton bouton--obi-petit" data-donjon="maitrise" data-id="${m.id}" ${!max && e.cristaux >= m.cout(n) ? "" : "disabled"}>${max ? "Max" : `${nombre(m.cout(n))} cristaux`}</button>
            </li>`;
        }).join("")}</ul>
      </section>`;
  }

  function htmlBilan() {
    if (!bilan) return "";
    return `
      <div class="donjon__bilan ${bilan.sorti ? "donjon__bilan--sorti" : ""}">
        <p class="donjon__bilan-titre">${bilan.sorti ? "Sorti avec le butin !" : "Plus de vie : la descente s'arrête"}</p>
        <p>${bilan.etages} étage${bilan.etages > 1 ? "s" : ""} franchi${bilan.etages > 1 ? "s" : ""}${bilan.record ? " · <b>nouveau record !</b>" : ""}</p>
        <p class="donjon__gains">+${nombre(bilan.encre)} encre · +${nombre(bilan.cristaux)} cristaux${bilan.invocations ? ` · +${bilan.invocations} invocations` : ""}${bilan.sorti ? "" : ` (la moitié du sac)`}</p>
      </div>`;
  }

  function rendreHub(e) {
    const deck = equipeSauvee();
    zone.innerHTML = `
      <section class="donjon">
        <div class="donjon__entree">
          <p class="donjon__kanji" aria-hidden="true">迷宮</p>
          <div>
            <h2 class="donjon__titre">Le Donjon d'encre</h2>
            <p class="case__aide">Ton deck descend étage par étage, contre des ennemis de plus en plus forts. Tous les ${ETAGES_PAR_BENEDICTION} étages, choisis une <b>bénédiction</b>. Le butin s'entasse dans le sac : sors quand tu veux pour tout garder, mais si tu tombes sans vie, tu n'en gardes que la moitié.</p>
            <p class="donjon__chiffres"><span>Record <b>${e.record}</b></span><span>Descentes aujourd'hui <b>${e.descentesRestantes} / ${DESCENTES_PAR_JOUR}</b></span><span>Cristaux <b>${nombre(e.cristaux)}</b></span></p>
            <p class="case__aide">Le record rend chanceux à l'autel : +${Math.round(CHANCE_PAR_10_ETAGES_DONJON * 100)} % par tranche de 10 étages.</p>
            <div class="donjon__deck">${deck.every(Boolean) ? htmlMini(deck) : '<p class="arene__alerte">Ton deck n\'est pas complet.</p>'}</div>
            <div class="donjon__actions">
              <button type="button" class="bouton autel__invoquer" data-donjon="entrer" ${e.descentesRestantes > 0 && deck.every(Boolean) ? "" : "disabled"}>${e.descentesRestantes > 0 ? "Entrer dans le donjon" : "Reviens demain"}</button>
              <button type="button" class="bouton bouton--clair bouton--petit-texte" data-donjon="equipe">Changer le deck</button>
            </div>
          </div>
        </div>
        ${htmlBilan()}
        ${message ? `<p class="case__message" role="status">${message}</p>` : ""}
        ${htmlMaitrises(e)}
      </section>`;
  }

  function rendreDescente(e) {
    const run = e.run;
    const p = e.prochain;
    const b = p.bonus;
    const dernier = run.journal.at(-1);
    zone.innerHTML = `
      <section class="donjon donjon--descente">
        <header class="donjon__barre">
          <p class="donjon__etage"><small>${NOMS_TYPES[p.type]}</small> ${run.etage}</p>
          <p class="donjon__vies" aria-label="${run.vies} vie${run.vies > 1 ? "s" : ""}">${Array.from({ length: run.vies }, () => `<span class="donjon__coeur">${COEUR}</span>`).join("")}</p>
          <p class="donjon__sac"><b>Sac</b> ${nombre(run.sac.encre)} encre · ${nombre(run.sac.cristaux)} cristaux${run.sac.invocations ? ` · ${run.sac.invocations} invocations` : ""}</p>
        </header>
        <div class="donjon__face">
          <div class="donjon__camp">
            <p class="donjon__camp-nom">Ton deck <small>+${b.pct} % PV et ATQ</small></p>
            ${htmlMini(run.deck)}
          </div>
          <span class="donjon__contre ${enCombat ? "donjon__contre--choc" : ""}">VS</span>
          <div class="donjon__camp donjon__camp--ennemi donjon__camp--${p.type}">
            <p class="donjon__camp-nom">Niveau ${p.niveau} <small>stats ×${p.multiplicateur.toFixed(2).replace(".", ",")}</small></p>
            ${htmlMini(p.equipe)}
          </div>
        </div>
        ${dernier ? `<p class="donjon__dernier donjon__dernier--${dernier.victoire ? "v" : "d"}">Étage ${dernier.etage} : ${dernier.victoire ? `victoire en ${Math.round(dernier.duree)} s${dernier.koAllies ? `, ${dernier.koAllies} KO` : ""}` : "défaite, une vie perdue"}</p>` : ""}
        <div class="donjon__actions">
          <button type="button" class="bouton autel__invoquer" data-donjon="combattre" ${enCombat ? "disabled" : ""}>Combattre l'étage ${run.etage}</button>
          <button type="button" class="bouton bouton--clair" data-donjon="enchainer" aria-pressed="${enchainer}">${enchainer ? "Arrêter d'enchaîner" : `Enchaîner jusqu'à la bénédiction`}</button>
          <button type="button" class="bouton bouton--secondaire" data-donjon="sortir" ${enCombat ? "disabled" : ""}>Sortir avec le butin</button>
        </div>
        <div class="donjon__benedictions">
          <p class="arene__rubrique">Bénédictions de cette descente</p>
          ${run.benedictions.length ? `<ul>${run.benedictions.map((id) => `<li title="${BENEDICTIONS_PAR_ID[id].texte}">${BENEDICTIONS_PAR_ID[id].nom}</li>`).join("")}</ul>` : '<p class="case__aide">Aucune pour l\'instant : la première arrive après l\'étage 3.</p>'}
        </div>
        ${message ? `<p class="case__message" role="status">${message}</p>` : ""}
      </section>
      ${run.choix ? `
        <div class="voile donjon__voile">
          <div class="resultat donjon__choix" role="dialog" aria-modal="true" aria-labelledby="titre-choix">
            <h2 class="resultat__titre" id="titre-choix">Choisis une bénédiction</h2>
            <p class="case__aide">Elle dure jusqu'à la fin de cette descente.</p>
            <div class="donjon__cartes-choix">${run.choix.map((id) => `
              <button type="button" class="donjon__carte-choix" data-donjon="choisir" data-id="${id}">
                <b>${BENEDICTIONS_PAR_ID[id].nom}</b><span>${BENEDICTIONS_PAR_ID[id].texte}</span>
              </button>`).join("")}</div>
          </div>
        </div>` : ""}`;
  }

  function rendre() {
    const e = etatDonjon();
    if (e.run) rendreDescente(e); else rendreHub(e);
    chargerPortraits((id) => rafraichirPortrait(zone, id));
  }

  async function combattre() {
    if (enCombat) return;
    enCombat = true;
    message = "";
    rendre();
    if (enchainer) { if (!mouvementReduit) await pause(350); }
    else {
      // Un combat a la fois : on le regarde en direct (le meme que celui qui sera compte)
      const config = configEtage();
      if (config) await jouerCombatDirect({ config, titre: `Étage ${config.n}`, sousTitre: `Niveau ${config.adv.niveau} · stats ×${config.adv.multiplicateur.toFixed(2).replace(".", ",")}` });
    }
    if (!zone.isConnected) return;
    const r = combattreEtage();
    enCombat = false;
    if (!r) { enchainer = false; return rendre(); }
    if (r.victoire) sonCarte();
    if (r.fin) {
      bilan = r.fin;
      enchainer = false;
      sonRarete("commun");
      annoncerTampons(verifierTampons());
      majNavigation?.();
      return rendre();
    }
    if (r.choix) { enchainer = false; sonRarete("epique"); }
    if (!r.victoire) enchainer = false;
    rendre();
    if (enchainer) combattre();
  }

  zone.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-donjon]");
    if (!b || b.disabled) return;
    const a = b.dataset.donjon;
    if (a === "entrer") {
      const r = entrerDonjon();
      bilan = null;
      message = r.ok ? "" : r.erreur;
      rendre();
    }
    if (a === "equipe") naviguer("equipe");
    if (a === "combattre") combattre();
    if (a === "enchainer") { enchainer = !enchainer; if (enchainer) combattre(); else rendre(); }
    if (a === "choisir" && choisirBenediction(b.dataset.id)) { message = `Bénédiction : ${BENEDICTIONS_PAR_ID[b.dataset.id].nom}.`; rendre(); }
    if (a === "sortir") {
      const g = sortirDonjon();
      if (g) { bilan = g; sonComplete(); majNavigation?.(); }
      rendre();
    }
    if (a === "maitrise" && acheterMaitrise(b.dataset.id)) { message = "Maîtrise améliorée !"; rendre(); }
  });

  rendre();
}
