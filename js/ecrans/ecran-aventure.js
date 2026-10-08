// ==========================================================
// AVENTURE : le mode Chasse
// 5 zones, chacune avec 3 sous-zones et un boss. On choisit un
// groupe de reflets, on voit son butin possible, et on combat
// une fois ou en boucle automatique.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES } from "../donnees/raretes.js";
import { OBJETS_PAR_ID, OBJETS } from "../donnees/objets.js";
import { ZONES, NOMS_SOUS_ZONES, tableButin, CHANCE_DORE, MULT_SOUS_ZONE, MULT_BOSS, BONUS_DORE } from "../donnees/zones.js";
import { tauxVictoire, libelleChances } from "../moteur/estimation.js";
import {
  equipeSauvee, entreeCombat, zoneOuverte, bossBattu, objetsDecouverts, butinEquipe,
  etoilesEtape, etapeBattue, etapeOuverte, chapitreOuvert, etoilesChapitre, prochaineEtape,
  coffreOuvert, ouvrirCoffre, sceneVue, tourOuverte, etatTour, ouvrirCoffreSemaine, ressources,
  raidOuvert, etatRaid, equipesRaid, tenterRaid, reclamerPalierRaid,
  deluxeOuverte, etoilesDeluxe, etapeDeluxeBattue, etapeDeluxeOuverte, etapeDeluxe, chapitreTermine,
} from "../services/partie.js";
import { reglage, changerReglage } from "../services/reglages.js";
import { PALIERS_RAID, NIVEAU_BOSS_RAID } from "../donnees/raid.js";
import { etageTour, estBoss, finDeSemaine, COFFRES_SEMAINE } from "../donnees/tour.js";
import { MOMENTS, ORDRE_MOMENTS } from "../donnees/histoire.js";
import { jouerScene } from "../ui/scene.js";
import { CHAPITRES, COFFRES, encreEtape, nombreEtoiles } from "../donnees/campagne.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait } from "../ui/cartes.js";
import { htmlDecor } from "../ui/decors.js";
import { iconeEmplacement } from "../ui/equipement-ui.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";
import { creerHasard } from "../moteur/hasard.js";
import { lire, ecrire } from "../services/sauvegarde.js";

const DUREE_CRENEAU_DORE = 10 * 60 * 1000;

const KANJI = { terrain: "修行", forteresse: "鉄壁", toits: "暗殺", domaine: "領域", brasier: "伝説" };
const pourcent = (x) => `${String(Math.round(x * 1000) / 10).replace(".", ",")} %`;

const ETOILE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';

export function afficherAventure(conteneur, { naviguer, onglet = null, chapitre = null, zoneId = null, index = 0, deluxe = false }) {
  const equipe = equipeSauvee();
  const equipeComplete = equipe.every(Boolean);
  const derniereOuverte = [...ZONES].reverse().find((z) => zoneOuverte(z.id))?.id ?? 1;
  let zoneChoisie = zoneId && zoneOuverte(zoneId) ? zoneId : derniereOuverte;
  let indexChoisi = index;
  let dores = [];      // quels groupes sont dores (fixe pour un creneau de 10 minutes)
  let calcul = 0;
  let vue = onglet ?? (zoneId ? "chasse" : "campagne");
  let chapitreChoisi = chapitre ?? prochaineEtape().chapitre;
  let enDeluxe = deluxe && deluxeOuverte();

  conteneur.innerHTML = `
    ${htmlNavigation("aventure")}
    <div class="aventure">
      <header class="aventure__entete">
        <h1 class="equipe__titre">Aventure</h1>
        <div class="onglets-collection" role="tablist" aria-label="Aventure">
          <button type="button" role="tab" class="onglet-collection" data-action="vue" data-vue="campagne">Campagne</button>
          <button type="button" role="tab" class="onglet-collection" data-action="vue" data-vue="chasse">Chasse</button>
          <button type="button" role="tab" class="onglet-collection" data-action="vue" data-vue="tour">Tour</button>
          <button type="button" role="tab" class="onglet-collection" data-action="vue" data-vue="raid">Boss</button>
        </div>
      </header>
      <div id="vue" class="aventure__vue"></div>
    </div>
  `;

  const $ = (sel) => conteneur.querySelector(sel);
  const majNavigation = brancherNavigation(conteneur, naviguer, "aventure");

  function rendreZones() {
    const trouves = new Set(objetsDecouverts());
    $("#zones").innerHTML = ZONES.map((z) => {
      const ouverte = zoneOuverte(z.id);
      const n = OBJETS.filter((o) => o.zone === z.id && trouves.has(o.id)).length;
      return `
        <button type="button" role="tab" class="zone-carte ${ouverte ? "" : "zone-carte--fermee"}" data-action="zone" data-zone="${z.id}"
          aria-selected="${z.id === zoneChoisie}" ${ouverte ? "" : "disabled"}>
          <span class="zone-carte__kanji" aria-hidden="true">${KANJI[z.decor]}</span>
          <span class="zone-carte__nom">${z.nom}</span>
          <span class="zone-carte__info">Niv. ${z.niveaux[0]} à ${z.niveaux[1]}</span>
          <span class="zone-carte__info">${ouverte ? `${n} / 20 objets${bossBattu(z.id) ? ", boss battu" : ""}` : `Bats le boss de la zone ${z.id - 1}`}</span>
        </button>`;
    }).join("");
  }

  function groupesAffiches(zone) {
    if (indexChoisi === 3) return [{ ...zone.boss, boss: true, niveau: zone.boss.niveau, dore: false, numero: 0 }];
    const sz = zone.sousZones[indexChoisi];
    return sz.groupes.map((g, i) => ({ ...g, niveau: sz.niveau + (dores[i] ? BONUS_DORE.niveau : 0), dore: dores[i], numero: i }));
  }

  function rendreZone() {
    const zone = ZONES.find((z) => z.id === zoneChoisie);
    const trouves = new Set(objetsDecouverts());
    const bonusButin = butinEquipe(equipe);
    const table = tableButin(zone, indexChoisi);
    const groupes = groupesAffiches(zone);

    $("#zone").innerHTML = `
      <div class="zone__bandeau">
        ${htmlDecor(zone.decor, { centre: true })}
        <div class="zone__titre">
          <h2>${zone.nom}</h2>
          <p>Niveaux ${zone.niveaux[0]} à ${zone.niveaux[1]}</p>
        </div>
      </div>

      <div class="sous-zones" role="tablist" aria-label="Sous-zones">
        ${NOMS_SOUS_ZONES.map((nom, i) => `
          <button type="button" role="tab" class="filtre" data-action="sous-zone" data-index="${i}" aria-pressed="${i === indexChoisi}">
            ${nom} <em>niv. ${i === 3 ? zone.boss.niveau : zone.sousZones[i].niveau}</em>${i === 3 && bossBattu(zone.id) ? " ✓" : ""}
          </button>`).join("")}
      </div>

      <div class="zone__corps">
        <div class="zone__groupes">
          <p class="case__aide">${equipeComplete ? `Ton équipe : Butin +${Math.round(bonusButin)} %.` : "Ton équipe n'est pas complète : compose-la dans l'onglet Équipe."}
            <button type="button" class="bouton-texte" data-action="equipe">Modifier l'équipe</button></p>
          ${groupes.map((g) => `
            <article class="groupe ${g.dore ? "groupe--dore" : ""} ${g.boss ? "groupe--boss" : ""}">
              <div class="groupe__entete">
                <h3 class="groupe__nom">${g.nom}</h3>
                ${g.dore ? '<span class="badge-dore">Doré : butin x2</span>' : ""}
                ${g.boss ? '<span class="badge-boss">Boss</span>' : ""}
              </div>
              <p class="case__aide">Niveau ${g.niveau}</p>
              <div class="mini-equipe">
                ${g.equipe.map((id) => `<span class="mini-equipe__perso" title="${PERSOS_PAR_ID[id].nom}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}
              </div>
              <p class="groupe__chances" data-chances="${g.numero}">${equipeComplete ? "Estimation..." : ""}</p>
              <button type="button" class="bouton bouton--principal bouton--petit-texte" data-action="combattre" data-groupe="${g.numero}" ${equipeComplete ? "" : "disabled"}>Combattre</button>
            </article>`).join("")}

          <div class="boucle">
            <h3 class="case__titre">Boucle automatique</h3>
            <p class="case__aide">Enchaîne les combats dans cette ${indexChoisi === 3 ? "salle du boss" : "sous-zone"}, contre des groupes au hasard, en vitesse x3. La boucle s'arrête à la première défaite. Laisse l'onglet ouvert pendant qu'elle tourne.</p>
            <div class="boucle__choix">
              ${[10, 25, 50, 100].map((n) => `<button type="button" class="bouton bouton--obi bouton--petit-texte" data-action="boucle" data-total="${n}" ${equipeComplete ? "" : "disabled"}>${n} combats</button>`).join("")}
            </div>
            <label class="interrupteur"><input type="checkbox" data-action="opt-continuer" ${reglage("boucleContinuer") ? "checked" : ""}><span>Continuer après une défaite</span></label>
            <label class="interrupteur"><input type="checkbox" data-action="opt-recyclage" ${reglage("recyclageAuto") ? "checked" : ""}><span>Recycler les Communes libres pendant la boucle</span></label>
          </div>
        </div>

        <aside class="zone__butin" aria-labelledby="titre-butin">
          <h3 class="case__titre" id="titre-butin">Butin possible</h3>
          <p class="case__aide">Chances par victoire, avec le Butin % de ton équipe${indexChoisi < 3 ? ". Un groupe doré double toutes les chances" : ""}.</p>
          <ul class="table-butin">
            ${table.map((t) => {
              const o = OBJETS_PAR_ID[t.objet];
              const chance = Math.min(0.95, t.chance * (1 + bonusButin / 100));
              return `
                <li class="table-butin__ligne piece--${o.rarete} ${trouves.has(o.id) ? "" : "table-butin__ligne--nouveau"}">
                  ${iconeEmplacement(o.emplacement)}
                  <span class="table-butin__nom">${o.nom}<small>${RARETES[o.rarete].nom}, niv. ${o.niveau}${trouves.has(o.id) ? "" : ", jamais trouvé"}</small></span>
                  <span class="table-butin__chance">${pourcent(chance)}</span>
                </li>`;
            }).join("")}
          </ul>
        </aside>
      </div>
    `;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
    estimer(zone, groupes);
  }

  // Chances de victoire contre chaque groupe affiche
  async function estimer(zone, groupes) {
    if (!equipeComplete) return;
    const jeton = ++calcul;
    const entrees = equipe.map(entreeCombat);
    for (const g of groupes) {
      await new Promise((r) => setTimeout(r, 30));
      if (jeton !== calcul || !conteneur.isConnected) return;
      const palier = {
        equipe: g.equipe,
        niveau: g.niveau,
        multiplicateur: (g.boss ? MULT_BOSS : MULT_SOUS_ZONE) * (g.dore ? BONUS_DORE.mult : 1),
      };
      const taux = tauxVictoire(entrees, palier, 20);
      const { classe, mot } = libelleChances(taux);
      const zoneTexte = conteneur.querySelector(`[data-chances="${g.numero}"]`);
      if (zoneTexte) zoneTexte.innerHTML = `<span class="chances chances--${classe}">${mot} : ${Math.round(taux * 100)} %</span>`;
    }
  }

  // ---------- Vue campagne ----------

  function rendreCampagne(message = "") {
    if (enDeluxe) return rendreDeluxe();
    const ch = CHAPITRES[chapitreChoisi - 1];
    const prochaine = prochaineEtape();
    const total = etoilesChapitre(ch.id);
    $("#vue").innerHTML = `
      ${basculeEdition()}
      <div class="zones" role="tablist" aria-label="Chapitres">
        ${CHAPITRES.map((c) => {
          const ouvert = chapitreOuvert(c.id);
          return `
            <button type="button" role="tab" class="zone-carte ${ouvert ? "" : "zone-carte--fermee"}" data-action="chapitre" data-chapitre="${c.id}"
              aria-selected="${c.id === chapitreChoisi}" ${ouvert ? "" : "disabled"}>
              <span class="zone-carte__kanji" aria-hidden="true">${KANJI[c.decor]}</span>
              <span class="zone-carte__info">Chapitre ${c.id}</span>
              <span class="zone-carte__nom">${c.nom}</span>
              <span class="zone-carte__info">${ouvert ? `${etoilesChapitre(c.id)} / 24 étoiles` : `Termine le chapitre ${c.id - 1}`}</span>
            </button>`;
        }).join("")}
      </div>

      <div class="zone__bandeau">
        ${htmlDecor(ch.decor, { centre: true })}
        <div class="zone__titre">
          <h2>Chapitre ${ch.id} : ${ch.nom}</h2>
          <p>Niveaux ${ch.etapes[0].niveau} à ${ch.etapes[7].niveau}, ${total} étoile${total > 1 ? "s" : ""} sur 24</p>
        </div>
      </div>

      <div class="coffres" aria-label="Coffres d'étoiles">
        ${COFFRES.map((c, i) => {
          const ouvert = coffreOuvert(ch.id, i);
          const pret = !ouvert && total >= c.etoiles;
          return `
            <button type="button" class="coffre ${ouvert ? "coffre--ouvert" : pret ? "coffre--pret" : ""}" data-action="coffre" data-index="${i}" ${pret ? "" : "disabled"}>
              <span class="coffre__etoiles">${ETOILE}${c.etoiles}</span>
              <span class="coffre__contenu">${c.encre} d'encre, ${c.eclats} éclats${c.objet ? `, un objet ${c.objet === "rare" ? "Rare" : "Épique"}` : ""}</span>
              <span class="coffre__etat">${ouvert ? "Ouvert" : pret ? "À ouvrir !" : `${total} / ${c.etoiles}`}</span>
            </button>`;
        }).join("")}
      </div>
      <p class="case__message" role="status" aria-live="polite">${message}</p>

      ${equipeComplete ? "" : '<p class="case__aide">Ton équipe n\'est pas complète : compose-la dans l\'onglet Équipe.</p>'}
      <div class="planche-etapes">
        ${ch.etapes.map((et) => {
          const ouverte = etapeOuverte(et.chapitre, et.numero);
          const masque = etoilesEtape(et.chapitre, et.numero);
          const battue = etapeBattue(et.chapitre, et.numero);
          const estProchaine = et === prochaine;
          return `
            <article class="etape etape--${et.type} ${ouverte ? "" : "etape--fermee"} ${estProchaine ? "etape--prochaine" : ""}">
              <div class="etape__entete">
                <span class="etape__numero">Étape ${et.numero}</span>
                ${et.type !== "normal" ? `<span class="badge-${et.type === "boss" ? "boss" : "dore"}">${et.type === "boss" ? "Boss" : "Élite"}</span>` : ""}
              </div>
              <h3 class="etape__nom">${et.nom}</h3>
              <p class="case__aide">Niveau ${et.niveau}</p>
              ${ouverte ? `
                <div class="mini-equipe">${et.equipe.map((id) => `<span class="mini-equipe__perso" title="${PERSOS_PAR_ID[id].nom}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}</div>
                <ul class="etape__etoiles" aria-label="${nombreEtoiles(masque)} étoile${nombreEtoiles(masque) > 1 ? "s" : ""} sur 3">
                  ${[1, 2, 4].map((bit) => `<li class="${masque & bit ? "obtenue" : ""}">${ETOILE}</li>`).join("")}
                </ul>
                <p class="etape__gain">${battue ? `Rejouer : ${encreEtape(et, false)} d'encre` : `Première victoire : ${encreEtape(et, true)} d'encre`}</p>
                <p class="groupe__chances" data-chances-etape="${et.numero}"></p>
                <button type="button" class="bouton ${estProchaine ? "bouton--principal" : "bouton--clair"} bouton--petit-texte" data-action="jouer-etape" data-numero="${et.numero}" ${equipeComplete ? "" : "disabled"}>${battue ? "Rejouer" : "Jouer"}</button>`
                : `<p class="case__aide">Bats l'étape précédente pour l'ouvrir.</p>`}
            </article>`;
        }).join("")}
      </div>
      <div class="scenes-chapitre">
        <h3 class="case__titre">Scènes du chapitre</h3>
        <div class="scenes-chapitre__liste">
          ${ORDRE_MOMENTS.map((m) => {
            const cle = `${ch.id}-${m}`;
            return sceneVue(cle)
              ? `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="revoir-scene" data-cle="${cle}" data-moment="${m}">${MOMENTS[m].nom}</button>`
              : `<span class="scene-a-venir">${MOMENTS[m].nom} : pas encore vue</span>`;
          }).join("")}
        </div>
      </div>
      <p class="case__aide">Étoiles : une pour la victoire, une si aucun de tes persos n'est KO, une si tu gagnes en moins de 40 secondes. Terminer un chapitre ouvre le suivant et une nouvelle zone de chasse.</p>
    `;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
    estimerEtapes(ch);
  }

  // Bascule entre l'edition normale et l'Edition deluxe (une fois la campagne finie)
  function basculeEdition() {
    if (!deluxeOuverte()) return "";
    return `
      <div class="filtres" role="group" aria-label="Édition">
        <button type="button" class="filtre" data-action="edition" data-deluxe="0" aria-pressed="${!enDeluxe}">Édition normale</button>
        <button type="button" class="filtre" data-action="edition" data-deluxe="1" aria-pressed="${enDeluxe}">Édition deluxe</button>
      </div>`;
  }

  function rendreDeluxe() {
    const ch = CHAPITRES[chapitreChoisi - 1];
    const etapes = ch.etapes.map((et) => etapeDeluxe(et.chapitre, et.numero));
    $("#vue").innerHTML = `
      ${basculeEdition()}
      <div class="zones" role="tablist" aria-label="Chapitres deluxe">
        ${CHAPITRES.map((c) => {
          const ouvert = etapeDeluxeOuverte(c.id, 1) || etapeDeluxeBattue(c.id, 1);
          const n = c.etapes.reduce((s, et) => s + nombreEtoiles(etoilesDeluxe(c.id, et.numero)), 0);
          return `
            <button type="button" role="tab" class="zone-carte zone-carte--deluxe ${ouvert ? "" : "zone-carte--fermee"}" data-action="chapitre" data-chapitre="${c.id}" aria-selected="${c.id === chapitreChoisi}" ${ouvert ? "" : "disabled"}>
              <span class="zone-carte__kanji" aria-hidden="true">${KANJI[c.decor]}</span>
              <span class="zone-carte__info">Deluxe, chapitre ${c.id}</span>
              <span class="zone-carte__nom">${c.nom}</span>
              <span class="zone-carte__info">${ouvert ? `${n} / 24 étoiles` : `Termine le chapitre ${c.id - 1} deluxe`}</span>
            </button>`;
        }).join("")}
      </div>
      <div class="zone__bandeau zone__bandeau--deluxe">
        ${htmlDecor(ch.decor, { centre: true, crepuscule: true })}
        <div class="zone__titre">
          <h2>Édition deluxe : ${ch.nom}</h2>
          <p>Niveaux ${etapes[0].niveau} à ${etapes[7].niveau}. Récompenses : fragments d'éveil, objets de la Tour sur le boss, et une couverture variante en finissant le chapitre.</p>
        </div>
      </div>
      <div class="planche-etapes">
        ${etapes.map((et) => {
          const ouverte = etapeDeluxeOuverte(et.chapitre, et.numero) || etapeDeluxeBattue(et.chapitre, et.numero);
          const masque = etoilesDeluxe(et.chapitre, et.numero);
          return `
            <article class="etape etape--${et.type} ${ouverte ? "" : "etape--fermee"}">
              <div class="etape__entete"><span class="etape__numero">Étape ${et.numero}</span>${et.type !== "normal" ? `<span class="badge-${et.type === "boss" ? "boss" : "dore"}">${et.type === "boss" ? "Boss" : "Élite"}</span>` : ""}</div>
              <h3 class="etape__nom">${et.nom}</h3>
              <p class="case__aide">Niveau ${et.niveau}</p>
              ${ouverte ? `
                <ul class="etape__etoiles">${[1, 2, 4].map((bit) => `<li class="${masque & bit ? "obtenue" : ""}">${ETOILE}</li>`).join("")}</ul>
                <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="jouer-deluxe" data-numero="${et.numero}" ${equipeComplete ? "" : "disabled"}>${masque ? "Rejouer" : "Jouer"}</button>`
                : '<p class="case__aide">Bats l\'étape précédente.</p>'}
            </article>`;
        }).join("")}
      </div>`;
  }

  async function estimerEtapes(ch) {
    if (!equipeComplete) return;
    const jeton = ++calcul;
    const entrees = equipe.map(entreeCombat);
    for (const et of ch.etapes.filter((x) => etapeOuverte(x.chapitre, x.numero))) {
      await new Promise((r) => setTimeout(r, 30));
      if (jeton !== calcul || !conteneur.isConnected) return;
      const taux = tauxVictoire(entrees, et, 20);
      const { classe, mot } = libelleChances(taux);
      const zoneTexte = conteneur.querySelector(`[data-chances-etape="${et.numero}"]`);
      if (zoneTexte) zoneTexte.innerHTML = `<span class="chances chances--${classe}">${mot} : ${Math.round(taux * 100)} %</span>`;
    }
  }

  // ---------- Vue Tour des Mille Volumes ----------

  function dureeAvant(ms) {
    const h = Math.max(0, Math.floor(ms / 3600000));
    return h >= 24 ? `${Math.floor(h / 24)} j ${h % 24} h` : `${h} h`;
  }

  function rendreTour(message = "") {
    if (!tourOuverte()) {
      $("#vue").innerHTML = `
        <div class="tour-fermee">
          <p class="tour-fermee__kanji" aria-hidden="true">千巻</p>
          <h2 class="case__titre">La Tour des Mille Volumes</h2>
          <p class="case__aide">Sous la Bibliothèque s'enfonce une tour de tomes sans fin. Termine le chapitre 2 de la campagne pour l'ouvrir.</p>
        </div>`;
      return;
    }
    const t = etatTour();
    const r = ressources();
    const prochain = etageTour(t.prochain);
    const debut = Math.max(1, t.record - 3);
    const etages = Array.from({ length: 10 }, (_, i) => debut + i);
    const raccourcis = [];
    for (let n = 1; n <= t.record + 1; n += 10) raccourcis.push(n);

    $("#vue").innerHTML = `
      <div class="tour">
        <div class="tour__pile" aria-label="Les volumes de la Tour">
          ${etages.map((n) => `
            <div class="volume ${estBoss(n) ? "volume--boss" : ""} ${n <= t.record ? "volume--franchi" : ""} ${n === t.prochain ? "volume--prochain" : ""}" style="--i: ${n % 7}">
              <span class="volume__numero">${n}</span>
              <span class="volume__nom">${estBoss(n) ? `Gardien du volume ${n}` : `Volume ${n}`}</span>
              ${n === t.record ? '<span class="volume__marque" title="Ton record">Record</span>' : ""}
            </div>`).join("")}
          <p class="tour__profondeur" aria-hidden="true">⋮ sans fin</p>
        </div>

        <div class="tour__infos">
          <div class="arc-semaine">
            <p class="case__surtitre">Cette semaine, jusqu'à lundi (${dureeAvant(finDeSemaine() - Date.now())})</p>
            <h2 class="arc-semaine__nom">${t.arc.nom}</h2>
            <p>${t.arc.regle}</p>
          </div>

          <div class="tour__chiffres">
            <div><span>Record</span><strong>${t.record ? `Étage ${t.record}` : "Aucun"}</strong></div>
            <div><span>Fragments d'éveil</span><strong>${r.fragments}</strong></div>
            <div><span>Encre sacrée</span><strong>${r.encreSacree}</strong></div>
          </div>

          <article class="groupe ${prochain.boss ? "groupe--boss" : ""}">
            <div class="groupe__entete">
              <h3 class="groupe__nom">${prochain.nom}</h3>
              ${prochain.boss ? '<span class="badge-boss">Boss</span>' : ""}
            </div>
            <p class="case__aide">Prochain étage, niveau ${prochain.niveau}${prochain.boss ? ", donne des fragments d'éveil" : ""}</p>
            <div class="mini-equipe">${prochain.equipe.map((id) => `<span class="mini-equipe__perso" title="${PERSOS_PAR_ID[id].nom}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}</div>
            <p class="groupe__chances" data-chances-tour></p>
            <button type="button" class="bouton bouton--principal bouton--petit-texte" data-action="tour-combat" data-etage="${t.prochain}" ${equipeComplete ? "" : "disabled"}>Combattre</button>
          </article>

          <div class="boucle">
            <h3 class="case__titre">Descente en boucle</h3>
            <p class="case__aide">Enchaîne les étages tout seul, en vitesse x3, jusqu'à la première défaite.</p>
            <div class="boucle__choix">
              <button type="button" class="bouton bouton--obi bouton--petit-texte" data-action="tour-boucle" data-etage="${t.prochain}" ${equipeComplete ? "" : "disabled"}>Descendre depuis l'étage ${t.prochain}</button>
              ${raccourcis.length > 1 ? `
                <label class="champ-compact">Raccourci
                  <select data-action="raccourci">${raccourcis.map((n) => `<option value="${n}">Étage ${n}</option>`).join("")}</select>
                </label>
                <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="tour-raccourci" ${equipeComplete ? "" : "disabled"}>Descendre depuis ce raccourci</button>` : ""}
            </div>
          </div>

          <div class="coffres">
            ${COFFRES_SEMAINE.map((c, i) => {
              const ouvert = t.coffresSemaine.includes(i);
              const pret = !ouvert && t.etagesSemaine >= c.etages;
              return `
                <button type="button" class="coffre ${ouvert ? "coffre--ouvert" : pret ? "coffre--pret" : ""}" data-action="coffre-semaine" data-index="${i}" ${pret ? "" : "disabled"}>
                  <span class="coffre__etoiles">${c.etages} étages</span>
                  <span class="coffre__contenu">${c.encre} d'encre, ${c.fragments} fragments${c.encreSacree ? ", 1 encre sacrée" : ""}</span>
                  <span class="coffre__etat">${ouvert ? "Ouvert" : pret ? "À ouvrir !" : `${t.etagesSemaine} / ${c.etages} cette semaine`}</span>
                </button>`;
            }).join("")}
          </div>
          <p class="case__message" role="status" aria-live="polite">${message}</p>
        </div>
      </div>`;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
    if (equipeComplete) {
      const jeton = ++calcul;
      setTimeout(() => {
        if (jeton !== calcul || !conteneur.isConnected) return;
        const taux = tauxVictoire(equipe.map(entreeCombat), prochain, 20);
        const { classe, mot } = libelleChances(taux);
        const zone = conteneur.querySelector("[data-chances-tour]");
        if (zone) zone.innerHTML = `<span class="chances chances--${classe}">${mot} : ${Math.round(taux * 100)} %</span> <span class="case__aide">(sans l'arc de la semaine)</span>`;
      }, 60);
    }
  }

  // ---------- Vue Boss de la semaine ----------

  const nombreFr = (n) => Math.round(n).toLocaleString("fr-FR");

  function rendreRaid(resultat = null, message = "") {
    if (!raidOuvert()) {
      $("#vue").innerHTML = `
        <div class="tour-fermee">
          <p class="tour-fermee__kanji" aria-hidden="true">強敵</p>
          <h2 class="case__titre">Le boss de la semaine</h2>
          <p class="case__aide">Chaque semaine, un antagoniste d'encre surgit des pages. Termine le chapitre 2 de la campagne pour l'affronter.</p>
        </div>`;
      return;
    }
    const r = etatRaid();
    const equipes = equipesRaid();
    $("#vue").innerHTML = `
      <div class="raid">
        <section class="raid__boss">
          <div class="raid__portrait">${htmlPortrait(r.boss)}</div>
          <div class="raid__texte">
            <p class="case__surtitre">Boss de la semaine, niveau ${NIVEAU_BOSS_RAID}</p>
            <h2 class="arc-semaine__nom">${r.boss.nom}</h2>
            <p><strong>${r.boss.passif.nom} :</strong> ${r.boss.mecanique}</p>
            <p><strong>Ultime, ${r.boss.ultime.nom} :</strong> ${r.boss.ultime.description}.</p>
          </div>
        </section>

        <div class="tour__chiffres">
          <div><span>Tentatives aujourd'hui</span><strong>${r.tentativesRestantes} / 3</strong></div>
          <div><span>Meilleur score cette semaine</span><strong>${nombreFr(r.meilleur)}</strong></div>
          <div><span>Ton record contre lui</span><strong>${nombreFr(r.record)}</strong></div>
        </div>

        <section class="raid__equipes">
          <h3 class="case__titre">Tes trois équipes</h3>
          <p class="case__aide">Composées automatiquement avec tes 15 meilleurs persos, sans doublon. Chaque équipe combat 90 secondes ; le score est le total des dégâts infligés au boss.</p>
          ${equipes.map((ids, i) => `
            <div class="raid__equipe">
              <span class="raid__numero">${i + 1}</span>
              <div class="mini-equipe">${ids.map((id) => `<span class="mini-equipe__perso" title="${PERSOS_PAR_ID[id].nom}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}</div>
              ${resultat ? `<strong class="raid__degats">${nombreFr(resultat.resultats[i]?.degats ?? 0)}</strong>` : ""}
            </div>`).join("")}
          ${resultat ? `<p class="raid__total">Total : <strong>${nombreFr(resultat.score)}</strong>${resultat.nouveauMeilleur ? ' <span class="badge-dore">Nouveau meilleur score !</span>' : ""}</p>` : ""}
          <button type="button" class="bouton bouton--principal" data-action="raid-tenter" ${r.tentativesRestantes > 0 ? "" : "disabled"}>${r.tentativesRestantes > 0 ? "Lancer une tentative" : "Reviens demain"}</button>
        </section>

        <div class="paliers-raid">
          ${PALIERS_RAID.map((p, i) => {
            const pris = r.paliers.includes(i);
            const pret = !pris && r.meilleur >= p.score;
            return `
              <button type="button" class="coffre ${pris ? "coffre--ouvert" : pret ? "coffre--pret" : ""}" data-action="raid-palier" data-index="${i}" ${pret ? "" : "disabled"}>
                <span class="coffre__etoiles">${nombreFr(p.score)}</span>
                <span class="coffre__contenu">${p.encre} d'encre${p.fragments ? `, ${p.fragments} fragments` : ""}${p.encreSacree ? ", 1 encre sacrée" : ""}</span>
                <span class="coffre__etat">${pris ? "Récupéré" : pret ? "À récupérer !" : "À atteindre"}</span>
              </button>`;
          }).join("")}
        </div>
        <p class="case__message" role="status" aria-live="polite">${message}</p>
      </div>`;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
  }

  function rendreVue() {
    conteneur.querySelectorAll("[data-action='vue']").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.vue === vue)));
    if (vue === "campagne") return rendreCampagne();
    if (vue === "chasse" && !chapitreTermine(1)) {
      $("#vue").innerHTML = `
        <div class="tour-fermee">
          <p class="tour-fermee__kanji" aria-hidden="true">狩</p>
          <h2 class="case__titre">La chasse</h2>
          <p class="case__aide">Termine le chapitre 1 de la campagne pour partir chasser les reflets et leur butin.</p>
        </div>`;
      return;
    }
    if (vue === "tour") return rendreTour();
    if (vue === "raid") return rendreRaid();
    $("#vue").innerHTML = `
      <div class="zones" id="zones" role="tablist" aria-label="Zones de chasse"></div>
      <section class="zone" id="zone"></section>`;
    rendreZones();
    rendreZone();
  }

  // Les groupes dores dependent du creneau de 10 minutes (et non d'un clic) :
  // recliquer sur l'onglet ne les relance plus. Un groupe dore deja combattu
  // ne revient pas avant le creneau suivant.
  function creneauDores() {
    return Math.floor(Date.now() / DUREE_CRENEAU_DORE);
  }
  function cleDore(numero) {
    return `${zoneChoisie}:${indexChoisi}:${numero}`;
  }
  function doresCombattus() {
    const vus = lire("dores", null);
    return vus && vus.creneau === creneauDores() && Array.isArray(vus.cles) ? vus.cles : [];
  }
  function marquerDoreCombattu(numero) {
    ecrire("dores", { creneau: creneauDores(), cles: [...doresCombattus(), cleDore(numero)] });
  }
  function tirerDores() {
    const h = creerHasard((creneauDores() * 7919 + zoneChoisie * 131 + indexChoisi * 17) >>> 0);
    const combattus = doresCombattus();
    dores = [0, 1, 2].map((numero) => h.nombre() < CHANCE_DORE && !combattus.includes(cleDore(numero)));
  }

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible || cible.disabled) return;
    const action = cible.dataset.action;
    if (action === "opt-continuer") return changerReglage("boucleContinuer", cible.checked);
    if (action === "opt-recyclage") return changerReglage("recyclageAuto", cible.checked);
    if (action === "vue") {
      vue = cible.dataset.vue;
      return rendreVue();
    }
    if (action === "raid-tenter") {
      const r = tenterRaid();
      return r.ok ? rendreRaid(r) : rendreRaid(null, r.erreur);
    }
    if (action === "raid-palier") {
      const p = reclamerPalierRaid(Number(cible.dataset.index));
      if (p) majNavigation();
      return rendreRaid(null, p ? `+${p.encre} d'encre${p.fragments ? `, +${p.fragments} fragments` : ""}${p.encreSacree ? ", +1 encre sacrée" : ""} !` : "");
    }
    if (action === "tour-combat") {
      return naviguer("combat", { equipe, tour: { etage: Number(cible.dataset.etage), boucle: null }, retour: "aventure" });
    }
    if (action === "tour-boucle" || action === "tour-raccourci") {
      const etage = action === "tour-boucle" ? Number(cible.dataset.etage) : Number(conteneur.querySelector("[data-action='raccourci']").value);
      return naviguer("combat", { equipe, tour: { etage, boucle: { fait: 0, eclats: 0, encre: 0, fragments: 0, encreSacree: 0 } }, retour: "aventure" });
    }
    if (action === "coffre-semaine") {
      const g = ouvrirCoffreSemaine(Number(cible.dataset.index));
      if (g) {
        majNavigation();
        return rendreTour(`Coffre de la semaine : +${g.encre} d'encre, +${g.fragments} fragments${g.encreSacree ? ", +1 encre sacrée" : ""} !`);
      }
      return;
    }
    if (action === "chapitre") {
      chapitreChoisi = Number(cible.dataset.chapitre);
      return rendreCampagne();
    }
    if (action === "revoir-scene") {
      jouerScene(conteneur, cible.dataset.cle, { titre: `Chapitre ${chapitreChoisi} : ${MOMENTS[cible.dataset.moment].nom}` });
      return;
    }
    if (action === "edition") {
      enDeluxe = cible.dataset.deluxe === "1";
      return rendreCampagne();
    }
    if (action === "jouer-deluxe") {
      return naviguer("combat", { equipe, campagne: { chapitre: chapitreChoisi, numero: Number(cible.dataset.numero), deluxe: true }, retour: "aventure" });
    }
    if (action === "jouer-etape") {
      return naviguer("combat", { equipe, campagne: { chapitre: chapitreChoisi, numero: Number(cible.dataset.numero) }, retour: "aventure" });
    }
    if (action === "coffre") {
      const r = ouvrirCoffre(chapitreChoisi, Number(cible.dataset.index));
      if (r) {
        majNavigation();
        return rendreCampagne(`Coffre ouvert : +${r.encre} d'encre, +${r.eclats} éclats${r.objets.length ? `, ${r.objets.map((p) => OBJETS_PAR_ID[p.objet].nom).join(", ")}` : ""} !`);
      }
      return;
    }
    if (action === "zone") {
      zoneChoisie = Number(cible.dataset.zone);
      indexChoisi = 0;
      tirerDores();
      rendreZones();
      rendreZone();
    }
    if (action === "sous-zone") {
      indexChoisi = Number(cible.dataset.index);
      tirerDores();
      rendreZone();
    }
    if (action === "equipe") naviguer("equipe");
    if (action === "combattre") {
      const numero = Number(cible.dataset.groupe);
      if (indexChoisi < 3 && dores[numero]) marquerDoreCombattu(numero);
      naviguer("combat", {
        equipe,
        chasse: { zoneId: zoneChoisie, index: indexChoisi, groupe: numero, dore: indexChoisi < 3 && dores[numero], boucle: null },
        retour: "aventure",
      });
    }
    if (action === "boucle") {
      const total = Number(cible.dataset.total);
      const zone = ZONES.find((z) => z.id === zoneChoisie);
      const groupe = indexChoisi === 3 ? 0 : Math.floor(Math.random() * zone.sousZones[indexChoisi].groupes.length);
      naviguer("combat", {
        equipe,
        chasse: {
          zoneId: zoneChoisie, index: indexChoisi, groupe,
          dore: indexChoisi < 3 && Math.random() < CHANCE_DORE,
          boucle: { total, fait: 0, victoires: 0, butin: [], eclats: 0 },
        },
        retour: "aventure",
      });
    }
  });

  tirerDores();
  rendreVue();
}
