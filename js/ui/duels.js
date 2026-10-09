// ==========================================================
// DUELS (onglet de l'Aventure) : PvP en defense classee
// On enregistre une equipe de defense ; on attaque celles des autres
// joueurs proches en points. Meme regle pour tous : niveau, etoiles
// et eveil comptent, l'equipement et les talents non.
// Les points repartent a 1000 chaque mois.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import {
  equipeDuel, puissanceEquipe, jouerDuel, configDuel, recompenserDuel, equipeSauvee, RECOMPENSE_DUEL, verifierTampons,
} from "../services/partie.js";
import {
  enLigneDisponible, connecte, monId, maDefense, enregistrerDefense, adversairesDuel, resultatDuel, duelsRecents, saisonEnCours,
} from "../services/enligne.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait } from "./cartes.js";
import { ouvrirCompte } from "./compte.js";
import { annoncerTampons } from "./toast.js";
import { jouerCombatDirect } from "./combat-direct.js";
import { sonRarete, sonCarte } from "./sons.js";

const echapper = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nombre = (n) => Math.round(n).toLocaleString("fr-FR");

export const RANGS_DUEL = [
  { nom: "Bronze", min: 0 },
  { nom: "Argent", min: 1100 },
  { nom: "Or", min: 1250 },
  { nom: "Platine", min: 1400 },
  { nom: "Diamant", min: 1600 },
];
export const rangDuel = (points) => [...RANGS_DUEL].reverse().find((r) => points >= r.min) ?? RANGS_DUEL[0];

const htmlMini = (equipe) => `<div class="mini-equipe">${equipe.map((e) => `<span class="mini-equipe__perso" title="${PERSOS_PAR_ID[e.id]?.nom ?? e.id} · niv. ${e.niveau}, ${e.etoiles} étoile${e.etoiles > 1 ? "s" : ""}">${htmlPortrait(PERSOS_PAR_ID[e.id])}</span>`).join("")}</div>`;

export function afficherDuels(zone, { naviguer, majNavigation }) {
  let defense = null;      // ma defense sur le serveur
  let adversaires = null;
  let historique = null;
  let message = "";
  let erreur = false;
  let enCombat = null;     // l'adversaire en cours
  const $ = (s) => zone.querySelector(s);
  const dire = (t, e = false) => { message = t; erreur = e; };

  if (!enLigneDisponible() || !connecte()) {
    zone.innerHTML = `
      <div class="hotel hotel--ferme">
        <h2 class="hotel__titre">Duels</h2>
        <p class="case__aide">${enLigneDisponible()
          ? "Affronte les équipes des autres joueurs et grimpe de Bronze à Diamant. Il faut un compte (juste un pseudo et un mot de passe)."
          : "Les duels ouvriront avec les comptes en ligne."}</p>
        ${enLigneDisponible() ? '<button type="button" class="bouton bouton--obi-petit" data-duel="compte">Créer mon compte</button>' : ""}
      </div>`;
    zone.onclick = (e) => { if (e.target.closest("[data-duel='compte']")) ouvrirCompte(); };
    return;
  }

  async function charger() {
    try {
      defense = await maDefense();
      const points = defense && defense.saison === saisonEnCours() ? defense.points : 1000;
      [adversaires, historique] = await Promise.all([defense ? adversairesDuel(points) : Promise.resolve([]), duelsRecents()]);
    } catch (e) {
      dire(e.message, true);
      adversaires = adversaires ?? [];
      historique = historique ?? [];
    }
    rendre();
  }

  function htmlDefense() {
    const mienne = equipeDuel();
    const points = defense ? (defense.saison === saisonEnCours() ? defense.points : 1000) : 1000;
    const rang = rangDuel(points);
    return `
      <section class="duels__moi">
        <div class="duels__rang duels__rang--${rang.nom.toLowerCase()}">
          <span class="duels__rang-nom">${rang.nom}</span>
          <span class="duels__points">${nombre(points)} points</span>
          ${defense ? `<span class="duels__bilan">${defense.saison === saisonEnCours() ? `${defense.victoires} V · ${defense.defaites} D` : "nouvelle saison"}</span>` : ""}
        </div>
        <div class="duels__defense">
          <p class="arene__rubrique">Ta défense ${defense ? "" : "(pas encore enregistrée)"}</p>
          ${defense ? htmlMini(defense.equipe) : '<p class="case__aide">Enregistre ton équipe : les autres pourront l\'attaquer, et tu pourras attaquer la leur.</p>'}
          <p class="case__aide">Ton équipe actuelle : ${mienne.length === 5 ? htmlMini(mienne) : "incomplète"}</p>
          <div class="donjon__actions">
            <button type="button" class="bouton bouton--obi-petit" data-duel="defense" ${mienne.length === 5 ? "" : "disabled"}>${defense ? "Remplacer ma défense par mon équipe" : "Enregistrer mon équipe en défense"}</button>
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-duel="equipe">Changer d'équipe</button>
          </div>
        </div>
      </section>`;
  }

  function htmlAdversaires() {
    if (!defense) return "";
    if (!adversaires) return '<p class="case__aide">Recherche d\'adversaires…</p>';
    const moi = equipeDuel();
    return `
      <section>
        <h3 class="case__titre">Adversaires <button type="button" class="bouton-texte" data-duel="actualiser">Actualiser</button></h3>
        <p class="case__aide">Ton équipe actuelle attaque. Victoire : des points (plus si l'adversaire est mieux classé), +${RECOMPENSE_DUEL.encre} encre et +${RECOMPENSE_DUEL.invocations} invocations. 10 duels par jour, 3 contre la même défense.</p>
        <div class="duels__liste">
          ${adversaires.length ? adversaires.map((a) => {
            const rang = rangDuel(a.points);
            const rapport = puissanceEquipe(a.equipe) / Math.max(1, puissanceEquipe(moi));
            const estimation = rapport < 0.85 ? "facile" : rapport < 1.1 ? "jouable" : rapport < 1.3 ? "difficile" : "extreme";
            const mots = { facile: "Plus faible", jouable: "Équilibré", difficile: "Plus fort", extreme: "Bien plus fort" };
            return `
              <article class="duel ${enCombat === a.joueur ? "duel--combat" : ""}">
                <p class="duel__tete"><b>${echapper(a.pseudo)}</b><span class="duels__mini-rang duels__rang--${rang.nom.toLowerCase()}">${rang.nom} · ${nombre(a.points)}</span></p>
                ${htmlMini(a.equipe)}
                <p class="duel__pied"><span class="chances chances--${estimation}">${mots[estimation]}</span>
                  <button type="button" class="bouton bouton--obi-petit" data-duel="attaquer" data-id="${a.joueur}" ${enCombat || moi.length < 5 ? "disabled" : ""}>${enCombat === a.joueur ? "Combat…" : "Défier"}</button></p>
              </article>`;
          }).join("") : '<p class="case__aide">Personne d\'autre n\'a encore de défense : invite tes potes à enregistrer la leur !</p>'}
        </div>
      </section>`;
  }

  function htmlHistorique() {
    if (!historique?.length) return "";
    const moi = monId();
    return `
      <section>
        <h3 class="case__titre">Derniers duels</h3>
        <ul class="duels__historique">${historique.map((d) => {
          const attaque = d.attaquant === moi;
          const gagne = attaque ? d.victoire : !d.victoire;
          const delta = attaque ? (d.victoire ? `+${d.gain}` : `−${d.perte}`) : (d.victoire ? `−${d.perte}` : `+${d.gain}`);
          return `<li class="duels__ligne duels__ligne--${gagne ? "v" : "d"}">${attaque ? `Tu as attaqué <b>${echapper(d.pseudo_cible)}</b>` : `<b>${echapper(d.pseudo_attaquant)}</b> a attaqué ta défense`} : ${gagne ? "victoire" : "défaite"} <span>${delta}</span></li>`;
        }).join("")}</ul>
      </section>`;
  }

  function rendre() {
    zone.innerHTML = `
      <div class="duels">
        <p class="arene__intro">PvP en défense classée : même règle pour tous (niveau, étoiles et éveil comptent ; l'équipement et les talents non). Les points repartent à 1000 chaque mois.</p>
        ${message ? `<p class="case__message ${erreur ? "case__message--erreur" : ""}" role="status">${message}</p>` : ""}
        ${htmlDefense()}
        ${htmlAdversaires()}
        ${htmlHistorique()}
      </div>`;
    chargerPortraits((id) => rafraichirPortrait(zone, id));
  }

  async function attaquer(id) {
    const a = adversaires?.find((x) => x.joueur === id);
    if (!a || enCombat) return;
    enCombat = id;
    dire("");
    rendre();
    const graine = Math.floor(Math.random() * 2147483647);
    await jouerCombatDirect({ config: configDuel(a.equipe, graine), titre: `Duel contre ${echapper(a.pseudo)}`, sousTitre: `${rangDuel(a.points).nom} · ${nombre(a.points)} points` });
    const r = jouerDuel(a.equipe, graine);
    try {
      const s = await resultatDuel(id, r.victoire, r.graine);
      const rec = recompenserDuel(r.victoire);
      dire(`${r.victoire ? "Victoire" : "Défaite"} contre ${echapper(a.pseudo)} en ${Math.round(r.duree)} s (${r.koB} KO infligés, ${r.koA} subis) : ${s.gain > 0 ? "+" : ""}${s.gain} points${rec ? `, +${rec.encre} encre, +${rec.invocations} invocations` : ""}.`, !r.victoire);
      r.victoire ? sonRarete("rare") : sonCarte();
      annoncerTampons(verifierTampons());
      majNavigation?.();
    } catch (e) {
      dire(e.message, true);
    }
    enCombat = null;
    charger();
  }

  zone.onclick = async (e) => {
    const b = e.target.closest("[data-duel]");
    if (!b || b.disabled) return;
    const a = b.dataset.duel;
    if (a === "equipe") naviguer("equipe");
    if (a === "actualiser") { dire(""); charger(); }
    if (a === "attaquer") attaquer(b.dataset.id);
    if (a === "defense") {
      b.disabled = true;
      const equipe = equipeDuel(equipeSauvee());
      try {
        await enregistrerDefense(equipe, puissanceEquipe(equipe));
        dire("Défense enregistrée : les autres joueurs peuvent maintenant l'attaquer.");
      } catch (err) {
        dire(err.message, true);
      }
      charger();
    }
  };

  rendre();
  charger();
}
