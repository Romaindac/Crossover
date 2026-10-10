// ==========================================================
// L'ENCRIER (affichage, onglet de l'Aventure)
// Hors partie : record, parties recompensees, dernier bilan, regles.
// En partie : la carte a embranchements de l'acte, l'equipe (terrain
// et reserve, PV qui restent), l'or, les reliques ; chaque case ouvre
// une fenetre (draft, combat, recrue, tresor, evenement, boutique, repos).
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES } from "../donnees/raretes.js";
import { ROLES } from "../donnees/roles.js";
import {
  ACTES, TYPES_CASES, CHOIX_DEPART, TERRAIN_MAX, RESERVE_MAX, OR_SI_ON_PASSE, ETOILES_MAX_PARTIE, NIVEAU_PERSOS,
  RELIQUES_PAR_ID, EVENEMENTS_PAR_ID, SOIN_REPOS, PARTIES_RECOMPENSEES_PAR_JOUR, RECOMPENSES,
} from "../donnees/encrier.js";
import { caseDe } from "../moteur/encrier.js";
import {
  etatEncrier, commencerEncrier, choisirDepartEncrier, allerVersEncrier, configCombatEncrier, combattreEncrier,
  recruterEncrier, prendreReliqueEncrier, choisirEvenementEncrier, acheterEncrier, reposerEncrier, quitterCaseEncrier,
  echangerEncrier, abandonnerEncrier,
} from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait, htmlCarteStatique, iconeRole, htmlEtoiles } from "./cartes.js";
import { jouerCombatDirect } from "./combat-direct.js";
import { sonCarte, sonRarete, sonComplete } from "./sons.js";
import { annoncerTampons } from "./toast.js";

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");

// Icones des cases (traits simples, pas d'emoji)
const ICONES = {
  combat: '<path d="M5 19L15 9M15 9l1-4 4-1-1 4-4 1zM19 19L9 9M9 9L8 5 4 4l1 4 4 1M7 15l2 2M17 15l-2 2"/>',
  elite: '<path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 15.6 7 18.2l1-5.5-4-3.9 5.5-.8z"/><path d="M9.5 11h.01M14.5 11h.01"/>',
  evenement: '<path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4M12 18h.01"/><circle cx="12" cy="12" r="9.5"/>',
  boutique: '<path d="M5 8h14l-1.2 11H6.2zM9 8V6a3 3 0 0 1 6 0v2"/>',
  repos: '<path d="M12 3c1 3 4 4.5 4 8.5A4 4 0 0 1 8 12c0-1.6.7-2.6 1.5-3.5.2 1.6 1 2.4 1.8 2.6C11 9 11 6 12 3z"/><path d="M5 21h14"/>',
  tresor: '<path d="M4 10h16v9H4zM4 10l2-5h12l2 5M10 13h4"/>',
  boss: '<path d="M4 18h16M5 18l-1-10 5 4 3-7 3 7 5-4-1 10"/>',
};
const iconeCase = (type) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONES[type]}</svg>`;
const OR = '<svg class="encrier__or-icone" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="currentColor"/><path d="M9 12h6M12 9v6" stroke="#1a1206" stroke-width="2" stroke-linecap="round"/></svg>';

export function afficherEncrier(zone, { naviguer, majNavigation }) {
  let selection = [];        // draft de depart
  let message = "";
  let enCombat = false;
  let attenteRemplacement = null;   // { source: "recrue" | "boutique", id } : on choisit qui laisser partir
  let attenteEntrainement = null;   // "repos" | "boutique" : on choisit qui entrainer
  const $ = (s) => zone.querySelector(s);

  // ---------- Petits morceaux ----------
  const htmlMini = (ids) => `<div class="mini-equipe">${ids.map((id) => `<span class="mini-equipe__perso" title="${PERSOS_PAR_ID[id]?.nom ?? id}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}</div>`;

  function htmlRelique(id, { bouton = null, prix = null, achete = false } = {}) {
    const r = RELIQUES_PAR_ID[id];
    const contenu = `<span class="relique__rang">${r.rang === "boss" ? "Boss" : r.rang === "rare" ? "Rare" : "Commune"}</span><b class="relique__nom">${r.nom}</b><span class="relique__texte">${r.texte}</span>${prix !== null ? `<span class="relique__prix">${OR}${prix}</span>` : ""}`;
    return bouton
      ? `<button type="button" class="relique relique--${r.rang}" ${bouton} ${achete ? "disabled" : ""}>${contenu}${achete ? '<span class="relique__achete">Acheté</span>' : ""}</button>`
      : `<div class="relique relique--${r.rang}">${contenu}</div>`;
  }

  // Une carte de recrue : la vraie carte du jeu, au niveau de la partie
  const htmlCarteRecrue = (id, etoiles = 1) => htmlCarteStatique(PERSOS_PAR_ID[id], { progression: { niveau: NIVEAU_PERSOS, etoiles, variantes: [] } });

  function htmlMembre(run, id, ou) {
    const p = PERSOS_PAR_ID[id];
    const etat = run.persos[id];
    const ko = etat.pv <= 0;
    return `
      <button type="button" class="membre ${ko ? "membre--ko" : ""} vignette--${p.rarete}" data-enc="echanger" data-id="${id}"
        title="${p.nom} · ${RARETES[p.rarete].nom} · ${ROLES[p.role].nom}. ${ou === "terrain" ? "Envoyer en réserve" : "Faire combattre"}">
        <span class="membre__visuel">${htmlPortrait(p)}<span class="membre__role">${iconeRole(p.role)}</span></span>
        <span class="membre__nom">${p.nom}</span>
        <span class="membre__etoiles">${htmlEtoiles(etat.etoiles)}</span>
        <span class="membre__pv" style="--pv: ${etat.pv}"><span></span></span>
      </button>`;
  }

  function htmlEquipe(run) {
    const vides = (n) => Array.from({ length: n }, () => '<span class="membre membre--vide" aria-hidden="true"></span>').join("");
    return `
      <section class="encrier__equipe" aria-label="Ton équipe">
        <h3 class="encrier__titre-bloc">Sur le terrain <small>${run.terrain.length} / ${TERRAIN_MAX}</small></h3>
        <div class="encrier__membres">${run.terrain.map((id) => htmlMembre(run, id, "terrain")).join("")}${vides(TERRAIN_MAX - run.terrain.length)}</div>
        <h3 class="encrier__titre-bloc">Réserve <small>${run.reserve.length} / ${RESERVE_MAX}</small></h3>
        <div class="encrier__membres encrier__membres--reserve">${run.reserve.map((id) => htmlMembre(run, id, "reserve")).join("")}${vides(RESERVE_MAX - run.reserve.length)}</div>
        <p class="case__aide">Touche un perso pour l'envoyer en réserve ou le faire combattre. Le placement se fait tout seul (tanks devant). Les PV restent d'un combat à l'autre.</p>
      </section>`;
  }

  function htmlReliques(run) {
    return `
      <section class="encrier__reliques" aria-label="Reliques">
        <h3 class="encrier__titre-bloc">Reliques <small>${run.reliques.length}</small></h3>
        ${run.reliques.length ? `<div class="encrier__liste-reliques">${run.reliques.map((id) => htmlRelique(id)).join("")}</div>` : '<p class="case__aide">Aucune pour l\'instant : trésors, élites et boss en donnent.</p>'}
        ${run.malus > 1.001 ? `<p class="encrier__malus">Ennemis renforcés de ${Math.round((run.malus - 1) * 100)} % (choix d'événements)</p>` : ""}
      </section>`;
  }

  // ---------- La carte ----------
  function htmlCarte(e) {
    const { carte, run, accessibles } = e;
    const rangs = carte.rangs;
    const H = 100;   // hauteur d'un rang dans le dessin
    const x = (col) => col * 100 + 50;
    const y = (r) => r * H + 50;
    const visitees = new Set(run.visitees);
    const lignes = rangs.slice(0, -1).flatMap((rang) => rang.flatMap((c) => c.liens.map((l) => {
      const cible = caseDe(carte, l);
      const fait = visitees.has(c.id) && visitees.has(l);
      const ouvert = c.id === run.position && accessibles.includes(l);
      return `<line x1="${x(c.col)}" y1="${y(c.rang)}" x2="${x(cible.col)}" y2="${y(cible.rang)}" class="${fait ? "trace--faite" : ouvert ? "trace--ouverte" : ""}"/>`;
    }))).join("");
    const cases = rangs.flat().map((c) => {
      const etat = c.id === run.position ? "ici" : visitees.has(c.id) ? "faite" : accessibles.includes(c.id) ? "ouverte" : "fermee";
      return `
        <button type="button" class="case-carte case-carte--${c.type} case-carte--${etat}" data-enc="aller" data-id="${c.id}"
          style="left: ${(c.col + 0.5) * 25}%; top: ${((c.rang + 0.5) / rangs.length) * 100}%" ${etat === "ouverte" ? "" : "disabled"}
          aria-label="${TYPES_CASES[c.type].nom}${etat === "ouverte" ? " : y aller" : etat === "faite" ? " (faite)" : etat === "ici" ? " (tu es ici)" : ""}" title="${TYPES_CASES[c.type].nom} · ${TYPES_CASES[c.type].aide}">
          ${iconeCase(c.type)}
        </button>`;
    }).join("");
    return `
      <div class="encrier__carte" style="--rangs: ${rangs.length}">
        <svg class="encrier__traces" viewBox="0 0 400 ${rangs.length * H}" preserveAspectRatio="none" aria-hidden="true">${lignes}</svg>
        ${cases}
      </div>
      <ul class="encrier__legende" aria-label="Légende">
        ${["combat", "elite", "evenement", "boutique", "repos", "tresor", "boss"].map((t) => `<li class="case-carte--${t}">${iconeCase(t)}${TYPES_CASES[t].nom}</li>`).join("")}
      </ul>`;
  }

  // ---------- Les fenetres (une par type d'offre) ----------
  function htmlFenetre(e) {
    const run = e.run;
    const o = run.offre;
    if (!o) return "";
    let titre = "";
    let corps = "";
    let classe = "";

    if (o.type === "depart") {
      titre = "Choisis ton équipe de départ";
      classe = "encrier__fenetre--large";
      corps = `
        <p class="case__aide">Garde ${CHOIX_DEPART} persos parmi ces ${o.persos.length}. Ils sont tous au niveau ${NIVEAU_PERSOS}, comme pour tous les joueurs : ta collection ne compte pas ici.</p>
        <div class="encrier__cartes">${o.persos.map((id) => `
          <button type="button" class="encrier__choix-carte" data-enc="draft" data-id="${id}" aria-pressed="${selection.includes(id)}">
            ${htmlCarteRecrue(id)}
          </button>`).join("")}</div>
        <div class="resultat__actions">
          <button type="button" class="bouton bouton--principal" data-enc="valider-draft" ${selection.length === CHOIX_DEPART ? "" : "disabled"}>Commencer (${selection.length} / ${CHOIX_DEPART})</button>
        </div>`;
    }

    if (o.type === "combat") {
      const cfg = configCombatEncrier();
      const t = o.typeCase;
      titre = t === "boss" ? `Boss de l'acte ${run.acte}` : t === "elite" ? "Combat d'élite" : "Combat";
      classe = `encrier__fenetre--${t}`;
      corps = `
        <div class="encrier__face">
          <div><p class="encrier__camp">Ton équipe</p>${htmlMini(run.terrain)}</div>
          <span class="encrier__vs">VS</span>
          <div><p class="encrier__camp encrier__camp--ennemi">Ennemis <small>stats ×${cfg.adv.multiplicateur.toFixed(2).replace(".", ",")}</small></p>${htmlMini(cfg.equipeB)}</div>
        </div>
        ${t === "boss" ? `<p class="case__aide">Le chef : <b>${PERSOS_PAR_ID[cfg.adv.chef]?.nom ?? ""}</b>. Perdre un combat termine la partie.</p>` : '<p class="case__aide">Perdre un combat termine la partie. Les blessures restent ensuite.</p>'}
        <div class="resultat__actions">
          <button type="button" class="bouton bouton--principal" data-enc="combattre" ${enCombat ? "disabled" : ""}>Combattre</button>
        </div>`;
    }

    if (o.type === "recrue") {
      const plein = run.terrain.length >= TERRAIN_MAX && run.reserve.length >= RESERVE_MAX;
      titre = o.typeCase === "evenement" ? "Une recrue t'attend" : "Victoire !";
      classe = "encrier__fenetre--large";
      if (attenteRemplacement?.source === "recrue") {
        corps = htmlChoixRemplacement(run, attenteRemplacement.id);
      } else {
        corps = `
          ${o.or ? `<p class="encrier__gain">${OR}+${o.or} or${o.relique ? ` · relique : <b>${RELIQUES_PAR_ID[o.relique].nom}</b>` : ""}</p>` : ""}
          ${o.relique ? `<div class="encrier__reliques-gagnees">${htmlRelique(o.relique)}</div>` : ""}
          <p class="case__aide">Recrute un perso${plein ? " (ton équipe est pleine : il faudra laisser partir quelqu'un)" : ""}, ou passe pour ${OR_SI_ON_PASSE} or.</p>
          <div class="encrier__cartes">${o.persos.map((id) => `<button type="button" class="encrier__choix-carte" data-enc="recruter" data-id="${id}">${htmlCarteRecrue(id)}</button>`).join("")}</div>
          <div class="resultat__actions">
            <button type="button" class="bouton bouton--clair" data-enc="passer-recrue">Passer (+${OR_SI_ON_PASSE} or)</button>
          </div>`;
      }
    }

    if (o.type === "tresor" || o.type === "relique") {
      titre = o.type === "tresor" ? "Trésor" : `Acte ${run.acte} terminé !`;
      corps = `
        <p class="case__aide">${o.type === "tresor" ? "Prends une relique : elle dure toute la partie." : `Choisis une relique de boss, puis en route pour l'acte ${run.acte + 1}.`}</p>
        <div class="encrier__liste-reliques encrier__liste-reliques--choix">${o.reliques.map((id) => htmlRelique(id, { bouton: `data-enc="relique" data-id="${id}"` })).join("")}</div>`;
    }

    if (o.type === "evenement") {
      const evt = EVENEMENTS_PAR_ID[o.id];
      titre = evt.titre;
      classe = "encrier__fenetre--evenement";
      corps = `
        <p class="encrier__recit">${evt.texte}</p>
        ${o.resultat ? `
          <ul class="encrier__resultat">${o.resultat.lignes.map((l) => `<li>${l}</li>`).join("")}</ul>
          <div class="resultat__actions"><button type="button" class="bouton bouton--principal" data-enc="quitter">Continuer</button></div>`
        : `<div class="encrier__choix-evenement">${evt.choix.map((c, i) => `
            <button type="button" class="encrier__option" data-enc="evenement" data-i="${i}" ${c.cout && run.or < c.cout ? "disabled" : ""}>
              <b>${c.texte}</b><span>${c.detail}${c.cout && run.or < c.cout ? " (pas assez d'or)" : ""}</span>
            </button>`).join("")}</div>`}`;
    }

    if (o.type === "boutique") {
      titre = "Boutique";
      classe = "encrier__fenetre--large";
      if (attenteRemplacement?.source === "boutique") corps = htmlChoixRemplacement(run, attenteRemplacement.id);
      else if (attenteEntrainement === "boutique") corps = htmlChoixEntrainement(run, `Entraînement (${o.entrainement} or) : +1 étoile`);
      else {
        const achete = (k) => o.achetes.includes(k);
        corps = `
          <p class="encrier__bourse">${OR}<b>${nombre(run.or)}</b> or</p>
          <h3 class="encrier__titre-bloc">Persos</h3>
          <div class="encrier__cartes encrier__cartes--boutique">${o.persos.map(({ id, prix }) => `
            <button type="button" class="encrier__choix-carte" data-enc="acheter-perso" data-id="${id}" ${achete(`p-${id}`) || run.or < prix ? "disabled" : ""}>
              ${htmlCarteRecrue(id)}<span class="encrier__prix">${achete(`p-${id}`) ? "Recruté" : `${OR}${prix}`}</span>
            </button>`).join("")}</div>
          <h3 class="encrier__titre-bloc">Reliques</h3>
          <div class="encrier__liste-reliques encrier__liste-reliques--choix">${o.reliques.map(({ id, prix }) => htmlRelique(id, { bouton: `data-enc="acheter-relique" data-id="${id}" ${run.or < prix ? "disabled" : ""}`, prix, achete: achete(`r-${id}`) })).join("")}</div>
          <h3 class="encrier__titre-bloc">Services</h3>
          <div class="encrier__services">
            <button type="button" class="encrier__option" data-enc="acheter-soin" ${achete("soin") || run.or < o.soin ? "disabled" : ""}><b>Soins</b><span>+30 % de PV à toute l'équipe · ${OR}${o.soin}</span></button>
            <button type="button" class="encrier__option" data-enc="entrainer-boutique" ${achete("entrainement") || run.or < o.entrainement ? "disabled" : ""}><b>Entraînement</b><span>+1 étoile à un perso · ${OR}${o.entrainement}</span></button>
          </div>
          <div class="resultat__actions"><button type="button" class="bouton bouton--principal" data-enc="quitter">Quitter la boutique</button></div>`;
      }
    }

    if (o.type === "repos") {
      titre = "Repos";
      if (attenteEntrainement === "repos") corps = htmlChoixEntrainement(run, "Qui s'entraîne ? (+1 étoile)");
      else {
        const soin = Math.round(Math.max(SOIN_REPOS, e.effets.soinRepos) * 100);
        corps = `
          <p class="case__aide">Un feu de camp entre deux planches. Le temps d'une seule action.</p>
          <div class="encrier__choix-evenement">
            <button type="button" class="encrier__option" data-enc="repos-soin"><b>Se soigner</b><span>+${soin} % de PV à toute l'équipe (les KO restent KO)</span></button>
            <button type="button" class="encrier__option" data-enc="repos-entrainement"><b>S'entraîner</b><span>+1 étoile à un perso (+12 % de PV et d'ATQ)</span></button>
          </div>`;
      }
    }

    return `
      <div class="voile encrier__voile">
        <div class="resultat encrier__fenetre ${classe}" role="dialog" aria-modal="true" aria-labelledby="titre-encrier">
          <h2 class="resultat__titre" id="titre-encrier">${titre}</h2>
          ${corps}
          ${message ? `<p class="case__message" role="status">${message}</p>` : ""}
        </div>
      </div>`;
  }

  function htmlChoixRemplacement(run, id) {
    return `
      <p class="case__aide">Ton équipe est pleine. Qui laisse sa place à <b>${PERSOS_PAR_ID[id].nom}</b> ?</p>
      <div class="encrier__membres encrier__membres--choix">${[...run.terrain, ...run.reserve].map((x) => htmlMembre(run, x, "").replace('data-enc="echanger"', 'data-enc="remplacer"')).join("")}</div>
      <div class="resultat__actions"><button type="button" class="bouton bouton--clair" data-enc="annuler">Annuler</button></div>`;
  }

  function htmlChoixEntrainement(run, texte) {
    const candidats = [...run.terrain, ...run.reserve];
    return `
      <p class="case__aide">${texte}</p>
      <div class="encrier__membres encrier__membres--choix">${candidats.map((x) => {
        const max = run.persos[x].etoiles >= ETOILES_MAX_PARTIE;
        return htmlMembre(run, x, "").replace('data-enc="echanger"', `data-enc="entrainer" ${max ? "disabled" : ""}`);
      }).join("")}</div>
      <div class="resultat__actions"><button type="button" class="bouton bouton--clair" data-enc="annuler">Annuler</button></div>`;
  }

  // ---------- Hors partie ----------
  function htmlBilan(b) {
    if (!b) return "";
    const g = b.gains;
    return `
      <div class="encrier__bilan ${b.victoire ? "encrier__bilan--victoire" : ""}">
        <p class="encrier__bilan-titre">${b.victoire ? "L'Encrier est vaincu !" : b.abandon ? "Partie abandonnée" : `Défaite à l'acte ${b.acte}`}${b.record ? ' <span class="encrier__record">record</span>' : ""}</p>
        <p>${b.combats} combat${b.combats > 1 ? "s" : ""}, ${b.elites} élite${b.elites > 1 ? "s" : ""}, ${b.boss} boss vaincu${b.boss > 1 ? "s" : ""}.</p>
        ${b.recompensee ? `<p class="encrier__gain">+${nombre(g.encre)} encre${g.invocations ? ` · +${g.invocations} invocations` : ""}${g.poussiere ? ` · +${g.poussiere} poussière` : ""}</p>` : '<p class="case__aide">Partie pour l\'honneur : les récompenses du jour étaient déjà prises.</p>'}
        ${b.equipe?.length ? htmlMini(b.equipe) : ""}
      </div>`;
  }

  function rendreHub(e) {
    zone.innerHTML = `
      <section class="encrier encrier--hub">
        <div class="encrier__entree">
          <p class="encrier__kanji" aria-hidden="true">墨壺</p>
          <div class="encrier__presentation">
            <h2 class="encrier__titre">L'Encrier</h2>
            <p class="encrier__accroche">Un roguelite en draft : <b>tout le monde part à égalité</b>. Ta collection reste au vestiaire, tu recrutes tes persos en route.</p>
            <ul class="encrier__regles">
              <li><b>3 actes</b>, une carte à embranchements chacun, un boss au bout.</li>
              <li>Tu choisis ta route : combats, élites, événements, boutiques, repos, trésors.</li>
              <li>Après chaque victoire, une <b>recrue</b> au choix. Les <b>reliques</b> changent tout.</li>
              <li>Les PV restent d'un combat à l'autre. <b>Perdre un combat termine la partie.</b></li>
            </ul>
            <p class="encrier__chiffres">
              <span>Meilleur résultat <b>${e.record.victoires ? `${e.record.victoires} victoire${e.record.victoires > 1 ? "s" : ""}` : e.record.acte ? `acte ${Math.min(ACTES, e.record.acte)}` : "aucun"}</b></span>
              <span>Parties récompensées aujourd'hui <b>${e.partiesRecompensees} / ${PARTIES_RECOMPENSEES_PAR_JOUR}</b></span>
            </p>
            <p class="case__aide">Récompenses : encre par combat, ${RECOMPENSES.invocationsParBoss} invocations par boss, et ${RECOMPENSES.invocationsVictoire} invocations + ${RECOMPENSES.poussiereVictoire} poussière pour une victoire finale. Au-delà de ${PARTIES_RECOMPENSEES_PAR_JOUR} parties par jour, on joue pour l'honneur.</p>
            <div class="encrier__actions">
              <button type="button" class="bouton autel__invoquer" data-enc="commencer">Nouvelle partie</button>
            </div>
          </div>
        </div>
        ${htmlBilan(e.bilan)}
        ${message ? `<p class="case__message" role="status">${message}</p>` : ""}
      </section>`;
  }

  function rendrePartie(e) {
    const run = e.run;
    zone.innerHTML = `
      <section class="encrier encrier--partie">
        <header class="encrier__barre">
          <p class="encrier__acte"><small>Acte</small> ${run.acte} <small>/ ${ACTES}</small></p>
          <p class="encrier__bourse">${OR}<b>${nombre(run.or)}</b> or</p>
          <p class="encrier__progres">${run.bilan.combats + run.bilan.elites + run.bilan.boss} victoire${run.bilan.combats + run.bilan.elites + run.bilan.boss > 1 ? "s" : ""}${run.recompensee ? "" : " · pour l'honneur"}</p>
          <button type="button" class="bouton bouton--clair bouton--petit-texte" data-enc="abandonner">Abandonner</button>
        </header>
        <div class="encrier__corps">
          <div class="encrier__plateau">
            <p class="encrier__consigne">${run.offre ? "" : e.accessibles.length ? "Choisis ta prochaine case (elles brillent)." : ""}</p>
            ${htmlCarte(e)}
          </div>
          <aside class="encrier__cote">
            ${htmlEquipe(run)}
            ${htmlReliques(run)}
          </aside>
        </div>
        ${message && !run.offre ? `<p class="case__message" role="status">${message}</p>` : ""}
      </section>
      ${htmlFenetre(e)}`;
  }

  function rendre() {
    const e = etatEncrier();
    if (!e) return;
    if (e.run) rendrePartie(e); else rendreHub(e);
    chargerPortraits((id) => rafraichirPortrait(zone, id));
  }

  // ---------- Actions ----------
  async function combattre() {
    if (enCombat) return;
    const config = configCombatEncrier();
    if (!config) return;
    enCombat = true;
    rendre();
    const t = config.typeCase;
    await jouerCombatDirect({ config, titre: t === "boss" ? "Boss" : t === "elite" ? "Élite" : "Combat", sousTitre: `Acte ${etatEncrier().run.acte} · stats ×${config.adv.multiplicateur.toFixed(2).replace(".", ",")}` });
    if (!zone.isConnected) return;
    const r = combattreEncrier();
    enCombat = false;
    message = "";
    if (r?.victoire) sonCarte(); else sonRarete("commun");
    if (r?.fin) { majNavigation?.(); annoncerTampons(r.fin.tampons ?? []); }
    rendre();
  }

  zone.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-enc]");
    if (!b || b.disabled) return;
    const a = b.dataset.enc;
    const id = b.dataset.id;
    message = "";
    const resultat = (r, ok = "") => { if (r && !r.ok && r.erreur) message = r.erreur; else if (ok) message = ok; if (r?.fin) { sonComplete(); majNavigation?.(); annoncerTampons(r.fin.tampons ?? []); } };

    if (a === "commencer") { const r = commencerEncrier(); selection = []; resultat(r); }
    if (a === "draft") {
      selection = selection.includes(id) ? selection.filter((x) => x !== id) : selection.length < CHOIX_DEPART ? [...selection, id] : selection;
    }
    if (a === "valider-draft") { resultat(choisirDepartEncrier(selection)); selection = []; }
    if (a === "aller") {
      const r = allerVersEncrier(id);
      resultat(r);
      if (r?.ok && ["tresor", "boutique"].includes(r.type)) sonRarete("rare");
    }
    if (a === "combattre") return combattre();
    if (a === "recruter") {
      const e = etatEncrier();
      const plein = e.run.terrain.length >= TERRAIN_MAX && e.run.reserve.length >= RESERVE_MAX;
      if (plein) attenteRemplacement = { source: "recrue", id };
      else { resultat(recruterEncrier(id)); sonCarte(); }
    }
    if (a === "remplacer" && attenteRemplacement) {
      const { source, id: nouveau } = attenteRemplacement;
      attenteRemplacement = null;
      resultat(source === "recrue" ? recruterEncrier(nouveau, id) : acheterEncrier("perso", nouveau, id));
    }
    if (a === "annuler") { attenteRemplacement = null; attenteEntrainement = null; }
    if (a === "passer-recrue") resultat(recruterEncrier(null));
    if (a === "relique") { resultat(prendreReliqueEncrier(id)); sonRarete("epique"); }
    if (a === "evenement") resultat(choisirEvenementEncrier(Number(b.dataset.i)));
    if (a === "quitter") quitterCaseEncrier();
    if (a === "acheter-perso") {
      const e = etatEncrier();
      const plein = e.run.terrain.length >= TERRAIN_MAX && e.run.reserve.length >= RESERVE_MAX;
      if (plein) attenteRemplacement = { source: "boutique", id };
      else resultat(acheterEncrier("perso", id));
    }
    if (a === "acheter-relique") resultat(acheterEncrier("relique", id));
    if (a === "acheter-soin") resultat(acheterEncrier("soin"));
    if (a === "entrainer-boutique") attenteEntrainement = "boutique";
    if (a === "repos-soin") resultat(reposerEncrier("soin"));
    if (a === "repos-entrainement") attenteEntrainement = "repos";
    if (a === "entrainer") {
      const ou = attenteEntrainement;
      attenteEntrainement = null;
      resultat(ou === "boutique" ? acheterEncrier("entrainement", id) : reposerEncrier("entrainement", id), `${PERSOS_PAR_ID[id].nom} gagne une étoile !`);
    }
    if (a === "echanger") { if (!echangerEncrier(id)) message = "Impossible : il faut au moins un perso sur le terrain, et 5 au maximum."; }
    if (a === "abandonner") {
      if (!confirm("Abandonner la partie ? Tu gardes les récompenses déjà gagnées.")) return;
      const bilan = abandonnerEncrier();
      majNavigation?.();
      annoncerTampons(bilan?.tampons ?? []);
    }
    rendre();
  });

  rendre();
}
