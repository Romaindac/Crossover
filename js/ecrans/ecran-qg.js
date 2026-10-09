// ==========================================================
// LE QG : le tableau de bord du joueur
// Une planche de manga : chaque case donne acces a une partie
// du jeu, avec ce qui compte maintenant (prochain combat,
// expedition, missions du jour...).
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES } from "../donnees/raretes.js";
import { CHAPITRES, TOUTES_LES_ETAPES } from "../donnees/campagne.js";
import { ROLES } from "../donnees/roles.js";
import { bonusSerie } from "../moteur/stats.js";
import { tauxVictoire, libelleChances } from "../moteur/estimation.js";
import {
  encre, idsPossedes, progressionDe, equipeSauvee, estBattu,
  etatBoosters, statistiques, etatEvenements, reclamerDefi, reclamerCalendrier, reclamerPalierTournoi, etatEnergie, missionsDuJour, reclamerMission,
  reclamerBonusMissions, etatExpedition, recupererExpedition, vedette, entreeCombat, prochaineEtape, etapeBattue,
  missionsDeLaSemaine, reclamerMissionSemaine, chapitreTermine,
  cadreActuel, etatSaison, reclamerSaisonPrecedente, nouveautes, etatGuide, reclamerGuide,
  emplacementsExpedition, lancerExpeditionCiblee, recupererExpeditionCiblee, DUREES_EXPEDITION, zoneOuverte,
  titreActuel, noterJourJoue, verifierTampons, tamponsNouveaux,
  etatPasse, reclamerPasse,
} from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, htmlObi, htmlEtoiles, iconeRole, rafraichirPortrait, COULEURS_AFFINITE } from "../ui/cartes.js";
import { htmlDecor } from "../ui/decors.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";
import { ouvrirCompte } from "../ui/compte.js";
import { ouvrirTutoriel, tutorielVu } from "../ui/tutoriel.js";
import { enLigneDisponible, connecte } from "../services/enligne.js";
import { lire as lireReglage, ecrire as ecrireReglage } from "../services/sauvegarde.js";
import { annoncerTampons } from "../ui/toast.js";
import { serieDeLaSemaine, numeroDuMagazine, BONUS_HONNEUR, BUTIN_HONNEUR } from "../donnees/hebdo.js";
import { finDeSemaine } from "../donnees/tour.js";
import { nomSaison } from "../donnees/saisons.js";
import { ZONES } from "../donnees/zones.js";

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");

function duree(heures) {
  const h = Math.floor(heures);
  const m = Math.floor((heures - h) * 60);
  return h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}

function tempsAvantMinuit() {
  const maintenant = new Date();
  const minuit = new Date(maintenant);
  minuit.setHours(24, 0, 0, 0);
  return duree((minuit - maintenant) / 3600000);
}

export function afficherQg(conteneur, { naviguer }) {
  noterJourJoue();
  const tamponsDuJour = verifierTampons();
  const equipe = equipeSauvee();
  const equipeComplete = equipe.every(Boolean);
  const prochain = prochaineEtape();
  const toutBattu = TOUTES_LES_ETAPES.every((et) => etapeBattue(et.chapitre, et.numero));
  const star = PERSOS_PAR_ID[vedette()] ?? PERSOS_PAR_ID[equipe.find(Boolean)];

  // Resume de l'equipe : niveau moyen, roles et bonus de serie
  const membres = equipe.filter(Boolean).map((id) => PERSOS_PAR_ID[id]);
  const niveauMoyen = membres.length ? Math.round(membres.reduce((s, p) => s + progressionDe(p.id).niveau, 0) / membres.length) : 0;
  const roles = Object.keys(ROLES).map((r) => [r, membres.filter((p) => p.role === r).length]).filter(([, n]) => n);
  const bonus = [...new Set(membres.map((p) => p.serie))]
    .map((serie) => {
      const p = membres.find((x) => x.serie === serie);
      const b = bonusSerie(p, membres);
      return b.atq ? `${serie} : ATQ +${Math.round(b.atq * 100)} %` : null;
    })
    .filter(Boolean);
  const progStar = star ? progressionDe(star.id) : null;

  conteneur.innerHTML = `
    ${htmlNavigation("qg")}
    <main class="qg">
      <h1 class="visuellement-cache">Ton QG</h1>
      <div class="quoi-de-neuf" id="quoi-de-neuf"></div>
      <div id="bandeau-compte"></div>
      <div id="guide"></div>
      <div id="passe"></div>
      <div class="planche">

        ${star ? `
        <section class="case case--vedette cadre--${cadreActuel()}" aria-label="Ton perso en vedette : ${star.nom}" style="--aff: ${COULEURS_AFFINITE[star.affinite]}">
          <div class="vedette__image">${htmlPortrait(star)}</div>
          <p class="vedette__nom">${star.nom}</p>
          <div class="vedette__pied">
            ${htmlObi(star)}
            <p class="vedette__titre">« ${titreActuel()} »</p>
            <p class="vedette__infos"><span>${star.serie}</span><span>Niv. ${progStar.niveau}</span>${htmlEtoiles(progStar.etoiles)}</p>
            <button type="button" class="vedette__changer" data-action="collection">Changer de vedette</button>
          </div>
        </section>` : ""}

        <section class="case case--combat" aria-labelledby="titre-prochain">
          ${htmlDecor(CHAPITRES[prochain.chapitre - 1].decor, { centre: true })}
          <div class="case--combat__contenu">
            <p class="case__surtitre">${toutBattu ? "Campagne terminée : rejoue le boss final" : `Campagne, chapitre ${prochain.chapitre}, étape ${prochain.numero}`}</p>
            <h2 class="case--combat__titre" id="titre-prochain">${prochain.nom}</h2>
            <p class="case--combat__niveau">Niveau ennemi ${prochain.niveau}</p>
            <div class="mini-equipe" aria-label="Équipe ennemie">
              ${prochain.equipe.map((id) => `<span class="mini-equipe__perso" title="${PERSOS_PAR_ID[id].nom}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}
            </div>
            <p id="chances-prochain" class="case--combat__chances">${equipeComplete ? "Estimation des chances..." : "Ton équipe n'est pas complète."}</p>
            <div class="case__boutons">
              <button type="button" class="bouton bouton--principal" data-action="combattre" ${equipeComplete ? "" : "disabled"}>Combattre</button>
              <button type="button" class="bouton bouton--clair" data-action="aventure">Voir la campagne</button>
            </div>
          </div>
        </section>

        <section class="case case--evenements" aria-labelledby="titre-evenements">
          <h2 class="case__titre" id="titre-evenements">Événements</h2>
          <div id="evenements"></div>
        </section>

        <section class="case case--equipe" aria-labelledby="titre-equipe">
          <h2 class="case__titre" id="titre-equipe">Ton équipe</h2>
          <div class="qg-equipe">
            ${equipe.map((id) => id
              ? `<span class="qg-equipe__perso" style="--aff: ${COULEURS_AFFINITE[PERSOS_PAR_ID[id].affinite]}">${htmlPortrait(PERSOS_PAR_ID[id])}<span class="qg-equipe__niveau">${progressionDe(id).niveau}</span></span>`
              : '<span class="qg-equipe__perso qg-equipe__perso--vide"></span>').join("")}
          </div>
          <dl class="qg-resume">
            <div><dt>Niveau moyen</dt><dd>${niveauMoyen}</dd></div>
            <div><dt>Rôles</dt><dd class="qg-resume__roles">${roles.map(([r, n]) => `<span title="${ROLES[r].nom}">${iconeRole(r)}${n > 1 ? `x${n}` : ""}</span>`).join("")}</dd></div>
          </dl>
          <p class="case__aide">${bonus.length ? `Bonus de série : ${bonus.join(", ")}.` : "Aucun bonus de série : place 2 persos de la même série pour en gagner un."}</p>
          <button type="button" class="bouton-texte" data-action="equipe">Modifier l'équipe</button>
        </section>

        <section class="case case--expedition" aria-labelledby="titre-expedition">
          <h2 class="case__titre" id="titre-expedition">Expédition</h2>
          <div id="expedition"></div>
        </section>

        <section class="case case--missions" aria-labelledby="titre-missions">
          <div class="case__entete">
            <h2 class="case__titre" id="titre-missions">Missions du jour</h2>
            <p class="case__aide">Nouvelles missions dans ${tempsAvantMinuit()}</p>
          </div>
          <div id="missions"></div>
        </section>

        <section class="case case--tirages" aria-labelledby="titre-tirages">
          <h2 class="case__titre" id="titre-tirages">Boosters</h2>
          <p class="case__chiffre" id="qg-encre"></p>
          <p class="case__aide">${etatBoosters().tickets} ticket${etatBoosters().tickets > 1 ? "s" : ""} de booster. Légendaire garanti dans ${etatBoosters().avantLegendaire} boosters au plus.</p>
          <button type="button" class="bouton bouton--obi-petit" data-action="tirages">Ouvrir des boosters</button>
        </section>

        <section class="case case--collection" aria-labelledby="titre-collection">
          <h2 class="case__titre" id="titre-collection">Collection</h2>
          <p class="case__chiffre">${idsPossedes().length}<span> sur ${PERSOS.length}</span></p>
          <span class="barre-xp"><span class="barre-xp__rempli barre-pitie" style="--xp: ${idsPossedes().length / PERSOS.length}"></span></span>
          <div class="qg-derniers" aria-label="Derniers persos obtenus">
            ${idsPossedes().slice(-3).reverse().map((id) => `<span class="qg-derniers__perso">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}
          </div>
          <button type="button" class="bouton-texte" data-action="collection">Voir l'étagère</button>
        </section>

        <section class="case case--stats" aria-labelledby="titre-stats">
          <h2 class="case__titre" id="titre-stats">Tes statistiques</h2>
          <dl class="qg-stats" id="stats"></dl>
        </section>

        <section class="case case--hebdo" aria-labelledby="titre-hebdo" id="hebdo"></section>

      </div>
    </main>
  `;

  const $ = (sel) => conteneur.querySelector(sel);
  const majNavigation = brancherNavigation(conteneur, naviguer, "qg");

  // ---------- Zones qui changent ----------

  function rendreEncre() {
    $("#qg-encre").innerHTML = `${nombre(encre())}<span> d'encre</span>`;
    majNavigation();
  }

  function rendreExpedition(message = "") {
    const e = etatExpedition();
    if (!e) {
      $("#expedition").innerHTML = `<p class="case__aide">Gagne ta première étape de campagne : ton équipe pourra ensuite s'entraîner seule, même quand le jeu est fermé.</p>${htmlExpeditionsCiblees()}`;
      return;
    }
    $("#expedition").innerHTML = `
      <p class="case__aide">Ton équipe s'entraîne seule sur « ${e.etape.nom} » (chapitre ${e.etape.chapitre}), même jeu fermé : un combat toutes les 15 minutes, pendant ${e.heuresMax} h au plus.${e.bonus ? ` Bonus d'expérience : +${Math.round(e.bonus * 100)} % d'XP (étapes deluxe et record de la Tour).` : ""}</p>
      <p class="expedition__gains"><strong>+${nombre(e.encre)}</strong> d'encre<br><strong>+${nombre(e.xp)}</strong> XP par perso<br><strong>+${e.pieces}</strong> pièce${e.pieces > 1 ? "s" : ""} d'équipement</p>
      <span class="barre-xp" role="img" aria-label="Expédition remplie à ${Math.round((e.heures / e.heuresMax) * 100)} %"><span class="barre-xp__rempli" style="--xp: ${e.heures / e.heuresMax}"></span></span>
      <p class="case__aide">${e.pleine ? "Expédition pleine : récupère vite tes gains !" : `Depuis ${duree(e.heures)}, pleine dans ${duree(e.heuresMax - e.heures)}.`}</p>
      <button type="button" class="bouton bouton--obi-petit" data-action="expedition" ${e.combats ? "" : "disabled"}>Récupérer</button>
      <p class="case__message" role="status" aria-live="polite">${message}</p>
      ${htmlExpeditionsCiblees()}
    `;
  }

  // Quoi de neuf : tout ce qui attend le joueur, en un coup d'oeil
  function rendreNouveautes() {
    const liste = nouveautes();
    $("#quoi-de-neuf").innerHTML = liste.length ? `
      <p class="quoi-de-neuf__titre">Quoi de neuf</p>
      <ul>${liste.map((n) => `<li><button type="button" class="quoi-de-neuf__lien" data-action="aller" data-nav="${n.nav}" data-onglet="${n.onglet ?? ""}">${n.texte}</button></li>`).join("")}</ul>` : "";
  }

  // Les expeditions ciblees, sous l'expedition principale
  function htmlExpeditionsCiblees() {
    const ouvertes = ZONES.filter((z) => zoneOuverte(z.id));
    return `
      <div class="expeditions-ciblees">
        <p class="detail__type">Expéditions ciblées</p>
        ${emplacementsExpedition().map((e) => {
          if (!e.ouvert) return `<p class="case__aide">Emplacement ${e.index + 2} : ${e.condition.toLowerCase()} pour l'ouvrir.</p>`;
          if (!e.mission) return `
            <div class="expedition-ciblee">
              <select data-zone-exp="${e.index}" aria-label="Zone">${ouvertes.map((z) => `<option value="${z.id}">${z.nom}</option>`).join("")}</select>
              <select data-duree-exp="${e.index}" aria-label="Durée">${DUREES_EXPEDITION.map((d) => `<option value="${d}">${d} h</option>`).join("")}</select>
              <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="lancer-exp" data-index="${e.index}">Envoyer</button>
            </div>`;
          const zone = ZONES.find((z) => z.id === e.mission.zone);
          const h = Math.floor(e.restant / 3600000), mn = Math.floor((e.restant % 3600000) / 60000);
          return `
            <div class="expedition-ciblee">
              <span>${e.mission.equipe.map((id) => PERSOS_PAR_ID[id].nom).join(", ")} en ${zone.nom}</span>
              ${e.finie
                ? `<button type="button" class="bouton bouton--obi-petit" data-action="recuperer-exp" data-index="${e.index}">Récupérer</button>`
                : `<span class="case__aide">Retour dans ${h} h ${String(mn).padStart(2, "0")}</span>`}
            </div>`;
        }).join("")}
      </div>`;
  }

  // ---------- Evenements : heure folle, defi du jour, calendrier, tournoi ----------
  function dans(ms) {
    const minutes = Math.max(1, Math.ceil(ms / 60000));
    return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`;
  }

  function rendreEvenements(message = "") {
    const ev = etatEvenements();
    const en = etatEnergie();
    const d = ev.defi;
    const t = ev.tournoi;
    const prochainPalier = t.paliers.find((x) => !x.atteint);
    $("#evenements").innerHTML = `
      <div class="evenement evenement--heure">
        <p class="evenement__quand">Heure folle · encore ${dans(ev.heure.fin - Date.now())}</p>
        <p class="evenement__nom">${ev.heure.nom}</p>
        <p class="case__aide">${ev.heure.texte}. Un nouveau bonus chaque heure.</p>
      </div>
      <div class="evenement">
        <p class="evenement__quand">Défi du jour · encore ${dans(d.fin - Date.now())}</p>
        <p class="evenement__nom">${d.victoires} / ${d.cible} victoires avec au moins ${d.persosSerie} persos ${d.serie}</p>
        <span class="barre-xp"><span class="barre-xp__rempli" style="--xp: ${d.victoires / d.cible}"></span></span>
        ${d.reclame ? '<p class="case__aide">Récompense réclamée. Nouveau défi demain.</p>'
          : `<button type="button" class="bouton bouton--obi-petit" data-action="defi" ${d.victoires >= d.cible ? "" : "disabled"}>${d.recompense.tickets} boosters + ${d.recompense.energie} énergie</button>`}
      </div>
      <div class="evenement">
        <p class="evenement__quand">Calendrier de connexion</p>
        <ol class="calendrier">
          ${ev.calendrier.cases.map((c, i) => `<li class="calendrier__case ${i < ev.calendrier.case || (i === ev.calendrier.case && ev.calendrier.reclame) ? "calendrier__case--prise" : ""} ${i === ev.calendrier.case ? "calendrier__case--jour" : ""}"><span>J${i + 1}</span>${c.texte}</li>`).join("")}
        </ol>
        ${ev.calendrier.reclame ? '<p class="case__aide">Reviens demain pour la case suivante.</p>'
          : `<button type="button" class="bouton bouton--obi-petit" data-action="calendrier">Réclamer : ${ev.calendrier.cases[ev.calendrier.case].texte}</button>`}
      </div>
      <div class="evenement">
        <p class="evenement__quand">Tournoi de la semaine · ${t.serie}</p>
        <p class="evenement__nom">${t.points} points</p>
        <p class="case__aide">1 point par victoire avec un perso ${t.serie}, 2 avec au moins 3.${prochainPalier ? ` Prochain palier à ${prochainPalier.points} : ${prochainPalier.texte}.` : " Tous les paliers sont atteints !"}</p>
        <div class="tournoi__paliers">
          ${t.paliers.map((x, i) => x.reclame ? `<span class="tournoi__palier tournoi__palier--pris">${x.points} · ${x.texte}</span>`
            : `<button type="button" class="tournoi__palier" data-action="palier-tournoi" data-index="${i}" ${x.atteint ? "" : "disabled"}>${x.points} · ${x.texte}</button>`).join("")}
        </div>
      </div>
      <p class="case__aide">Énergie : <strong>${en.valeur} / ${en.max}</strong>${en.prochain ? `, +1 dans ${dans(en.prochain - Date.now())}` : " (pleine)"}. Les combats en coûtent seulement si tu gagnes.</p>
      <p class="case__message" role="status" aria-live="polite">${message}</p>`;
  }

  // ---------- Guide du debutant ----------
  function texteRecompense(r) {
    return [r.encre && `${r.encre} d'encre`, r.tickets && `${r.tickets} booster${r.tickets > 1 ? "s" : ""}`, r.energie && `${r.energie} d'énergie`].filter(Boolean).join(" + ");
  }

  // ---------- Bandeau « joue en ligne » ----------
  function rendreBandeauCompte() {
    const zone = $("#bandeau-compte");
    if (!enLigneDisponible() || connecte() || lireReglage("bandeau-compte-masque", false)) { zone.innerHTML = ""; return; }
    zone.innerHTML = `
      <section class="bandeau-compte" aria-label="Jouer en ligne">
        <p class="bandeau-compte__texte"><strong>Joue avec les autres</strong>Crée ton compte (pseudo et mot de passe, sans mail) : sauvegarde en ligne, chat, hôtel des ventes et classements.</p>
        <button type="button" class="bouton bouton--obi-petit" data-action="ouvrir-compte">Créer mon compte</button>
        <button type="button" class="bouton-texte" data-action="masquer-bandeau-compte">Plus tard</button>
      </section>`;
  }

  function rendreGuide(message = "") {
    const g = etatGuide();
    const zone = $("#guide");
    if (!g) { zone.innerHTML = message ? `<p class="guide guide--fini">${message}</p>` : ""; return; }
    const o = g.objectif;
    zone.innerHTML = `
      <section class="guide ${g.atteint ? "guide--pret" : ""}" aria-labelledby="titre-guide">
        <p class="guide__numero" id="titre-guide">Guide du débutant · ${g.numero} / ${g.total}</p>
        <p class="guide__objectif">${o.texte}</p>
        <p class="guide__aide">${o.aide}</p>
        <div class="guide__actions">
          ${g.atteint
            ? `<button type="button" class="bouton bouton--obi-petit" data-action="guide">Réclamer : ${texteRecompense(o.recompense)}</button>`
            : `<span class="guide__gain">Récompense : ${texteRecompense(o.recompense)}</span>${o.nav !== "qg" ? `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="aller" data-nav="${o.nav}" data-onglet="${o.onglet ?? ""}">Y aller</button>` : ""}`}
        </div>
        ${message ? `<p class="case__message" role="status">${message}</p>` : ""}
      </section>`;
  }

  // Le passe de saison : la barre, les 5 prochains paliers, et tout reclamer d'un coup
  function textePasse(r) {
    const noms = { chance: "de chance", bordure: "de bordure", vitesse: "de vitesse", lune: "de lune" };
    return [r.encre && `${r.encre} encre`, r.invocations && `${r.invocations} invocations`, r.tickets && `${r.tickets} tickets`, r.ticketsDores && `${r.ticketsDores} booster${r.ticketsDores > 1 ? "s" : ""} doré${r.ticketsDores > 1 ? "s" : ""}`,
      ...Object.entries(r.potions ?? {}).filter(([, n]) => n).map(([id, n]) => `${n} potion${n > 1 ? "s" : ""} ${noms[id]}`)].filter(Boolean).join(", ");
  }
  function rendrePasse(message = "") {
    const p = etatPasse();
    const v = p.atteints >= p.total ? 1 : (p.xp % p.xpParPalier) / p.xpParPalier;
    const debut = Math.max(0, Math.min(p.total - 5, p.atteints - 1));
    $("#passe").innerHTML = `
      <section class="passe" aria-labelledby="titre-passe">
        <div class="passe__tete">
          <p class="passe__titre" id="titre-passe">Passe de ${nomSaison(p.saison).replace("Saison de ", "")} <b>${p.atteints} / ${p.total}</b></p>
          ${p.aReclamer ? `<button type="button" class="bouton bouton--obi-petit" data-action="passe">Réclamer ${p.aReclamer} palier${p.aReclamer > 1 ? "s" : ""}</button>` : ""}
        </div>
        <span class="autel__jauge"><span style="--v: ${v}"></span></span>
        <p class="passe__aide">${p.atteints >= p.total ? "Passe complet ! Il repart à zéro le mois prochain." : `${p.xp % p.xpParPalier} / ${p.xpParPalier} XP vers le palier ${p.atteints + 1}`} · XP : 1 par invocation, 5 par victoire, 40 par mission du jour.</p>
        <ol class="passe__paliers">${p.paliers.slice(debut, debut + 5).map((x, k) => `
          <li class="passe__palier ${x.reclame ? "passe__palier--pris" : x.atteint ? "passe__palier--pret" : ""} ${(debut + k + 1) % 10 === 0 ? "passe__palier--gros" : ""}">
            <b>${debut + k + 1}</b><span>${textePasse(x.recompense)}</span>
          </li>`).join("")}</ol>
        ${message ? `<p class="case__message" role="status">${message}</p>` : ""}
      </section>`;
  }

  function rendreMissions(message = "") {
    const m = missionsDuJour();
    const toutes = m.liste.every((x) => x.reclamee);
    $("#missions").innerHTML = `
      <ul class="missions">
        ${m.liste.map((x) => {
          const finie = x.progres >= x.cible;
          return `
          <li class="mission ${x.reclamee ? "mission--faite" : ""}">
            <div class="mission__texte">
              <span>${x.texte}</span>
              <span class="barre-xp"><span class="barre-xp__rempli" style="--xp: ${x.progres / x.cible}"></span></span>
              <span class="case__aide">${x.progres} sur ${x.cible}</span>
            </div>
            ${x.reclamee
              ? '<span class="mission__etat">Réclamée</span>'
              : `<button type="button" class="bouton bouton--obi-petit mission__bouton" data-action="mission" data-mission="${x.id}" ${finie ? "" : "disabled"}>+${x.recompense}</button>`}
          </li>`;
        }).join("")}
      </ul>
      <div class="missions__bonus">
        <span>Toutes les missions réussies : <strong>+${m.bonus} d'encre</strong></span>
        ${m.bonusReclame
          ? '<span class="mission__etat">Réclamé</span>'
          : `<button type="button" class="bouton bouton--obi-petit" data-action="bonus" ${toutes ? "" : "disabled"}>Bonus</button>`}
      </div>
      <p class="case__message" role="status" aria-live="polite">${message}</p>
    `;
  }

  // La couverture de Crossover Hebdo et les missions de la semaine
  function rendreHebdo(message = "") {
    const serie = serieDeLaSemaine();
    const persos = PERSOS.filter((p) => p.serie === serie);
    const ouvert = chapitreTermine(2);
    const jours = Math.max(0, Math.floor((finDeSemaine() - Date.now()) / 86400000));
    $("#hebdo").innerHTML = `
      <div class="hebdo__couverture">
        <p class="hebdo__magazine">Crossover Hebdo</p>
        <p class="hebdo__numero">N° ${numeroDuMagazine()}</p>
        <div class="hebdo__persos">${persos.map((p) => `<span class="hebdo__perso">${htmlPortrait(p)}</span>`).join("")}</div>
        <p class="hebdo__obi">À l'honneur : ${serie}</p>
      </div>
      <div class="hebdo__contenu">
        <h2 class="case__titre" id="titre-hebdo">Le numéro de la semaine</h2>
        <p class="case__aide">Encore ${jours} jour${jours > 1 ? "s" : ""}. Les persos de ${serie} ont +${BONUS_HONNEUR} % de PV et d'ATQ partout, deux fois plus de chances aux tirages dans leur rareté, et +${BUTIN_HONNEUR} % de butin en chasse.</p>
        ${ouvert ? `
          <ul class="missions">
            ${missionsDeLaSemaine().map((m) => `
              <li class="mission ${m.reclamee ? "mission--faite" : ""}">
                <div class="mission__texte">
                  <span>${m.texte}</span>
                  <span class="barre-xp"><span class="barre-xp__rempli" style="--xp: ${m.progres / m.cible}"></span></span>
                  <span class="case__aide">${m.progres} sur ${m.cible} : ${[m.recompense.encre ? `${m.recompense.encre} d'encre` : "", m.recompense.eclats ? `${m.recompense.eclats} éclats` : "", m.recompense.fragments ? `${m.recompense.fragments} fragments` : ""].filter(Boolean).join(", ")}</span>
                </div>
                ${m.reclamee ? '<span class="mission__etat">Réclamée</span>' : `<button type="button" class="bouton bouton--obi-petit mission__bouton" data-action="mission-semaine" data-mission="${m.id}" ${m.progres >= m.cible ? "" : "disabled"}>Réclamer</button>`}
              </li>`).join("")}
          </ul>` : '<p class="case__aide">Les missions de la semaine s\'ouvrent avec le chapitre 2 de la campagne.</p>'}
        <p class="case__message" role="status" aria-live="polite">${message}</p>
      </div>`;
  }

  function rendreStats() {
    const s = statistiques();
    const taux = s.combats ? Math.round((s.victoires / s.combats) * 100) : 0;
    $("#stats").innerHTML = `
      <div><dt>Combats</dt><dd>${nombre(s.combats)}</dd></div>
      <div><dt>Victoires</dt><dd>${taux} %</dd></div>
      <div><dt>Tomes ouverts</dt><dd>${nombre(s.tirages)}</dd></div>
      <div><dt>Légendaires</dt><dd>${nombre(s.legendaires)}</dd></div>
    `;
    const saison = etatSaison();
    const zone = conteneur.querySelector("#saison") ?? (() => {
      const p = document.createElement("div");
      p.id = "saison";
      p.className = "qg-saison";
      $("#stats").after(p);
      return p;
    })();
    zone.innerHTML = chapitreTermine(2) ? `
      <p class="case__surtitre">${nomSaison(saison.id)}</p>
      <p><strong>${saison.rang ? `Rang ${saison.rang.nom}` : "Pas encore classé"}</strong>, ${saison.points} points${saison.suivant ? ` (rang ${saison.suivant.nom} à ${saison.suivant.points})` : ""}</p>
      <p class="case__aide">Ce mois-ci : ${saison.detail.tour} point${saison.detail.tour > 1 ? "s" : ""} de Tour (1 par 5 étages du record), ${saison.detail.raid} de boss (1 par 50 000 dégâts, chaque semaine, 15 au plus par semaine), ${saison.detail.jours} jour${saison.detail.jours > 1 ? "s" : ""} actif${saison.detail.jours > 1 ? "s" : ""} (les 3 missions du jour réclamées).</p>
      ${saison.precedente && !saison.precedente.reclamee ? `<button type="button" class="bouton bouton--obi-petit" data-action="saison-precedente">Récompense de la saison passée</button>` : ""}` : "";
  }

  // Chances contre la prochaine etape, calculees sans bloquer l'ecran
  async function estimerProchain() {
    if (!equipeComplete) return;
    await new Promise((r) => setTimeout(r, 200));
    if (!conteneur.isConnected) return;
    const taux = tauxVictoire(equipe.map(entreeCombat), prochain);
    const { classe, mot } = libelleChances(taux);
    $("#chances-prochain").innerHTML = `<span class="chances chances--${classe}">${mot} : ${Math.round(taux * 100)} %</span> de victoire estimée avec ton équipe`;
  }

  // ---------- Clics ----------

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    const action = cible.dataset.action;
    if (action === "combattre" && equipeComplete) {
      naviguer("combat", { equipe, campagne: { chapitre: prochain.chapitre, numero: prochain.numero }, retour: "qg" });
    }
    if (action === "equipe") naviguer("equipe");
    if (action === "aventure") naviguer("aventure", { onglet: "campagne" });
    if (action === "tirages") naviguer("tirages");
    if (action === "collection") naviguer("collection");
    if (action === "expedition") {
      const r = recupererExpedition();
      if (!r) return;
      const montees = r.xpDetail.filter((x) => x.niveauApres > x.niveauAvant).length;
      rendreExpedition(`+${nombre(r.encre)} d'encre${r.butin.length ? `, ${r.butin.length} pièce${r.butin.length > 1 ? "s" : ""} d'équipement` : ""}${montees ? `, ${montees} perso${montees > 1 ? "s" : ""} montent de niveau` : ""} !`);
      rendreEncre();
      rendreMissions();
    }
    if (action === "mission") {
      const gain = reclamerMission(cible.dataset.mission);
      if (gain) rendreMissions(`+${gain} d'encre !`);
      rendreEncre();
    }
    if (action === "aller") {
      return naviguer(cible.dataset.nav, cible.dataset.onglet ? { onglet: cible.dataset.onglet } : {});
    }
    if (action === "lancer-exp") {
      const i = cible.dataset.index;
      const r = lancerExpeditionCiblee(Number(i), Number(conteneur.querySelector(`[data-zone-exp="${i}"]`).value), Number(conteneur.querySelector(`[data-duree-exp="${i}"]`).value));
      return rendreExpedition(r.ok ? "Expédition ciblée envoyée !" : r.erreur);
    }
    if (action === "recuperer-exp") {
      const g = recupererExpeditionCiblee(Number(cible.dataset.index));
      if (g) { rendreEncre(); rendreNouveautes(); }
      return rendreExpedition(g ? `Expédition ciblée : +${g.encre} d'encre, +${g.eclats} éclats, ${g.butin.length} objet${g.butin.length > 1 ? "s" : ""}.` : "");
    }
    if (action === "saison-precedente") {
      const r = reclamerSaisonPrecedente();
      if (r) rendreStats();
      rendreEncre();
      return;
    }
    if (action === "mission-semaine") {
      const r = reclamerMissionSemaine(cible.dataset.mission);
      if (r) rendreHebdo(`Mission de la semaine réclamée !`);
      rendreEncre();
      return;
    }
    if (action === "ouvrir-compte") return ouvrirCompte();
    if (action === "masquer-bandeau-compte") { ecrireReglage("bandeau-compte-masque", true); return rendreBandeauCompte(); }
    if (action === "passe") {
      const t = reclamerPasse();
      rendrePasse(t ? `Reçu : ${textePasse(t)}.` : "");
      majNavigation?.();
      return;
    }
    if (action === "guide") {
      const o = reclamerGuide();
      if (o) {
        rendreGuide(etatGuide() ? `Bravo ! Objectif suivant débloqué.` : "Guide terminé : tu connais tout le jeu. À toi de jouer !");
        rendreEncre(); rendreNouveautes();
      }
      return;
    }
    if (action === "defi") {
      if (reclamerDefi()) { rendreEvenements("Défi du jour réussi : boosters et énergie ajoutés !"); rendreEncre(); rendreNouveautes(); }
      return;
    }
    if (action === "calendrier") {
      const c = reclamerCalendrier();
      if (c) { rendreEvenements(`Calendrier : ${c.texte} !`); rendreEncre(); rendreNouveautes(); }
      return;
    }
    if (action === "palier-tournoi") {
      if (reclamerPalierTournoi(Number(cible.dataset.index))) { rendreEvenements("Palier du tournoi réclamé !"); rendreEncre(); rendreNouveautes(); }
      return;
    }
    if (action === "bonus") {
      const gain = reclamerBonusMissions();
      if (gain) rendreMissions(`Bonus du jour : +${gain} d'encre !`);
      rendreEncre();
    }
  });

  // L'expedition avance pendant qu'on regarde
  const minuteur = setInterval(() => {
    if (!conteneur.isConnected) return clearInterval(minuteur);
    if (!conteneur.querySelector(".case__message")?.textContent) { rendreExpedition(); rendreEvenements(); }
  }, 30000);

  annoncerTampons(tamponsDuJour);
  rendreNouveautes();
  rendreEncre();
  rendreExpedition();
  rendreBandeauCompte();
  rendreGuide();
  rendrePasse();
  rendreMissions();
  const surCompte = () => { if (conteneur.isConnected) rendreBandeauCompte(); else window.removeEventListener("crossover:compte", surCompte); };
  window.addEventListener("crossover:compte", surCompte);
  // Premiere visite au QG : le tutoriel de depart
  if (!tutorielVu()) setTimeout(() => { if (conteneur.isConnected) ouvrirTutoriel(); }, 400);
  rendreEvenements();
  rendreStats();
  rendreHebdo();
  estimerProchain();
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}
