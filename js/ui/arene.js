// ==========================================================
// L'ARENE DES BOSS (affichage)
// Choisir un monde puis un boss (8 par monde, dans l'ordre), et
// l'affronter avec son deck (l'equipe de 5). Le combat se joue en
// direct : la barre de vie geante du boss fond, les degats volent.
// Le moteur de combat habituel calcule tout en coulisse.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { EDITIONS_PAR_ID } from "../donnees/boosters.js";
import { MONDES, POTIONS_PAR_ID } from "../donnees/invocations.js";
import { CHAPITRES } from "../donnees/campagne.js";
import {
  bossDe, recompensePremierKo, recompenseKo, CHANCE_CARTE_BOSS_REJOUE, CHANCE_POTION_REJOUE, BOSS_ARENE,
} from "../donnees/arene.js";
import { creerCombat, avancer } from "../moteur/simulation.js";
import { tauxVictoire, libelleChances } from "../moteur/estimation.js";
import { calculerStatsFinales } from "../moteur/stats.js";
import {
  equipeSauvee, entreeCombat, mondeOuvert, bossAreneBattu, bossAreneOuvert, appliquerResultatArene,
  combatGratuit, coutEnergie, assezDEnergie, payerEnergie, progressionDe, verifierTampons,
} from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait, htmlCarteStatique } from "./cartes.js";
import { annoncerTampons } from "./toast.js";
import { sonRarete, sonComplete, sonCarte } from "./sons.js";

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const pourcent = (x) => `${Math.round(x * 100)} %`;
const RANGS = ["Sbire d'élite", "Lieutenant", "Capitaine", "Commandant", "Général", "Seigneur", "Calamité", "Souverain"];

export function afficherArene(zone, { conteneur, naviguer, majNavigation }) {
  const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const premierOuvert = () => MONDES.find((m) => mondeOuvert(m.edition) && bossDe(m.edition).some((b) => !bossAreneBattu(b.id)))?.edition ?? MONDES[0].edition;
  let monde = premierOuvert();
  let choisi = null;
  let combat = null;
  const $ = (s) => zone.querySelector(s);

  const prochainBoss = () => bossDe(monde).find((b) => bossAreneOuvert(b.id) && !bossAreneBattu(b.id)) ?? bossDe(monde).filter((b) => bossAreneOuvert(b.id)).at(-1) ?? bossDe(monde)[0];

  zone.innerHTML = `
    <section class="arene">
      <p class="arene__intro">Ton deck, c'est ton équipe de 5. Bats les 8 boss de chaque monde dans l'ordre : le premier KO te donne la <b>carte Boss</b> du perso (bordure Boss, introuvable ailleurs), des invocations et une potion.</p>
      <div class="autel__mondes arene__mondes" role="radiogroup" aria-label="Choisir le monde"></div>
      <div class="arene__echelle" role="list"></div>
      <div class="arene__detail"></div>
    </section>
    <div class="arene__combat-zone"></div>`;

  function rendreMondes() {
    $(".arene__mondes").innerHTML = MONDES.map((m) => {
      const ed = EDITIONS_PAR_ID[m.edition];
      const ouvert = mondeOuvert(m.edition);
      const n = bossDe(m.edition).filter((b) => bossAreneBattu(b.id)).length;
      return `
        <button type="button" role="radio" class="autel__monde" data-arene="monde" data-edition="${m.edition}" aria-checked="${monde === m.edition}" ${ouvert ? "" : "disabled"}
          style="--p1: ${ed.couleurs[0]}; --p2: ${ed.couleurs[1]}; --p3: ${ed.couleurs[2]}">
          <span class="autel__monde-nom">${ed.nom}</span>
          <span class="autel__monde-info">${ouvert ? `${n} / 8 boss vaincus` : `Fin du chapitre ${m.chapitre} : ${CHAPITRES[m.chapitre - 1]?.nom ?? ""}`}</span>
        </button>`;
    }).join("");
  }

  function rendreEchelle() {
    const liste = bossDe(monde);
    $(".arene__echelle").innerHTML = liste.map((b) => {
      const p = PERSOS_PAR_ID[b.perso];
      const battu = bossAreneBattu(b.id);
      const ouvert = bossAreneOuvert(b.id);
      return `
        <button type="button" role="listitem" class="arene__boss ${battu ? "arene__boss--battu" : ""} ${choisi?.id === b.id ? "arene__boss--choisi" : ""}" data-arene="boss" data-boss="${b.id}" ${ouvert ? "" : "disabled"}
          aria-label="${p.nom}, boss ${b.rang + 1} sur 8, niveau ${b.niveau}${battu ? ", vaincu" : ouvert ? "" : ", verrouillé"}">
          <span class="arene__boss-portrait">${ouvert ? htmlPortrait(p) : '<span class="arene__cadenas" aria-hidden="true">?</span>'}</span>
          <span class="arene__boss-rang">${b.rang + 1}</span>
          <span class="arene__boss-nom">${ouvert ? p.nom : "???"}</span>
          <span class="arene__boss-niveau">Niv. ${b.niveau}</span>
          ${battu ? '<span class="arene__boss-ko">KO</span>' : ""}
        </button>`;
    }).join("");
  }

  function rendreDetail() {
    const b = choisi;
    const p = PERSOS_PAR_ID[b.perso];
    const equipe = equipeSauvee();
    const ids = equipe.filter(Boolean);
    const battu = bossAreneBattu(b.id);
    const gratuit = combatGratuit({ arene: b.id });
    const cout = coutEnergie("arene");
    const stats = calculerStatsFinales(PERSOS_PAR_ID[b.id], { niveau: b.niveau });
    const chances = ids.length ? libelleChances(tauxVictoire(equipe.map((id, i) => (id ? entreeCombat(id, i, equipe) : null)).filter(Boolean), { equipe: [b.id], niveau: b.niveau, multiplicateur: 1 }, 12)) : null;
    const rec = battu ? recompenseKo(b) : recompensePremierKo(b);
    const carte = htmlCarteStatique(p, { progression: { ...progressionDe(b.perso), variantes: ["boss"] } });
    zone.querySelector(".arene__detail").innerHTML = `
      <article class="arene__fiche" style="--p1: ${EDITIONS_PAR_ID[b.monde].couleurs[0]}">
        <div class="arene__affiche">
          <span class="arene__affiche-portrait">${htmlPortrait(p)}</span>
          <span class="arene__affiche-titre">${RANGS[b.rang]}</span>
        </div>
        <div class="arene__infos">
          <h2 class="arene__nom">${p.nom} <small>Niv. ${b.niveau}</small></h2>
          <p class="arene__stats"><span><b>${nombre(stats.pv)}</b> PV</span><span><b>${nombre(stats.atq)}</b> ATQ</span><span>Ultime : <b>${p.ultime.nom}</b></span></p>
          <p class="arene__ultime">${p.ultime.description}</p>
          ${chances ? `<p class="arene__chances">Tes chances : <span class="chances chances--${chances.classe}">${chances.mot}</span></p>` : ""}
          <div class="arene__recompenses">
            <p class="arene__rubrique">${battu ? "À chaque KO" : "Premier KO"}</p>
            <ul>
              <li><b>+${nombre(rec.encre)}</b> encre</li>
              <li><b>+${rec.invocations}</b> invocations</li>
              <li>${battu ? `${pourcent(CHANCE_POTION_REJOUE)} : une potion` : "Une potion au hasard"}</li>
              <li>${battu ? `${pourcent(CHANCE_CARTE_BOSS_REJOUE)} : la carte Boss en double (une étoile)` : "<b>La carte Boss</b>"}</li>
            </ul>
          </div>
          <div class="arene__actions">
            ${ids.length < 5 ? '<p class="arene__alerte">Ton deck n\'est pas complet : choisis 5 persos dans l\'écran Équipe.</p>' : ""}
            <button type="button" class="bouton autel__invoquer arene__lancer" data-arene="lancer" ${ids.length ? "" : "disabled"}>Affronter <small>${gratuit ? "· gratuit" : `· ${cout} énergie si tu gagnes`}</small></button>
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-arene="equipe">Changer le deck</button>
          </div>
        </div>
        <div class="arene__carte-boss" aria-label="La carte Boss">
          <span class="arene__rubrique">Carte Boss</span>
          <span class="tome--boss">${carte}</span>
        </div>
      </article>`;
    chargerPortraits((id) => rafraichirPortrait(zone, id));
  }

  function rendre() {
    if (!choisi || choisi.monde !== monde) choisi = prochainBoss();
    rendreMondes();
    rendreEchelle();
    rendreDetail();
    chargerPortraits((id) => rafraichirPortrait(zone, id));
  }

  // ---------- Le combat en direct ----------

  function lancer() {
    const b = choisi;
    const equipe = equipeSauvee();
    const ids = equipe.filter(Boolean);
    const gratuit = combatGratuit({ arene: b.id });
    if (!gratuit && !assezDEnergie("arene")) {
      $(".arene__actions").insertAdjacentHTML("afterbegin", `<p class="arene__alerte">Pas assez d'énergie (${coutEnergie("arene")} pour un KO). Elle remonte toute seule, ou recharge-la à l'encre au QG.</p>`);
      return;
    }
    const entrees = equipe.map((id, i) => (id ? entreeCombat(id, i, equipe) : null)).filter(Boolean);
    const etat = creerCombat({ equipeA: entrees, equipeB: [b.id], niveauB: b.niveau, graine: Math.floor(Math.random() * 2147483647), journal: false });
    const bossU = etat.equipes[1][0];
    const p = PERSOS_PAR_ID[b.perso];
    combat = { etat, b, ids, gratuit, vitesse: 2, minuteur: null, fini: false, ultimesManuels: 0 };
    const ed = EDITIONS_PAR_ID[b.monde];
    $(".arene__combat-zone").innerHTML = `
      <div class="arene-combat" role="dialog" aria-modal="true" aria-label="Combat contre ${p.nom}" style="--p1: ${ed.couleurs[0]}; --p3: ${ed.couleurs[2]}">
        <header class="arene-combat__haut">
          <p class="arene-combat__nom">${p.nom} <small>${RANGS[b.rang]} · Niv. ${b.niveau}</small></p>
          <div class="arene-combat__pv"><span class="arene-combat__pv-retard"></span><span class="arene-combat__pv-plein"></span><span class="arene-combat__pv-texte"></span></div>
          <p class="arene-combat__chrono"></p>
        </header>
        <div class="arene-combat__scene">
          <div class="arene-combat__boss">${htmlPortrait(p)}</div>
          <div class="arene-combat__degats" aria-hidden="true"></div>
          <p class="arene-combat__annonce" aria-live="polite"></p>
        </div>
        <div class="arene-combat__deck">
          ${etat.equipes[0].map((u) => `
            <div class="arene-combat__carte" data-uid="${u.uid}">
              <span class="arene-combat__portrait">${htmlPortrait(PERSOS_PAR_ID[u.id])}</span>
              <span class="arene-combat__barre arene-combat__barre--pv"><span></span></span>
              <span class="arene-combat__barre arene-combat__barre--energie"><span></span></span>
              <span class="arene-combat__carte-nom">${PERSOS_PAR_ID[u.id].nom}</span>
            </div>`).join("")}
        </div>
        <div class="arene-combat__commandes">
          <button type="button" class="bouton bouton--clair" data-arene="vitesse">Vitesse ×2</button>
          <button type="button" class="bouton bouton--clair" data-arene="passer">Passer</button>
        </div>
        <div class="arene-combat__fin" hidden></div>
      </div>`;
    chargerPortraits((id) => rafraichirPortrait($(".arene__combat-zone"), id));
    combat.bossU = bossU;
    majCombat();
    tic();
  }

  function flotter(texte, classe, cible = null) {
    if (mouvementReduit) return;
    const z = cible ? $(`.arene-combat__carte[data-uid="${cible}"]`) : $(".arene-combat__degats");
    if (!z) return;
    const s = document.createElement("span");
    s.className = `arene-combat__chiffre ${classe}`;
    s.textContent = texte;
    s.style.left = `${cible ? 50 : 25 + Math.random() * 50}%`;
    s.style.top = `${cible ? 20 : 25 + Math.random() * 35}%`;
    z.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }

  function majCombat() {
    const { etat, bossU } = combat;
    const v = Math.max(0, bossU.pv / bossU.pvMax);
    $(".arene-combat__pv-plein").style.width = `${v * 100}%`;
    $(".arene-combat__pv-retard").style.width = `${v * 100}%`;
    $(".arene-combat__pv-texte").textContent = `${nombre(Math.max(0, bossU.pv))} / ${nombre(bossU.pvMax)}`;
    $(".arene-combat__chrono").textContent = `${Math.max(0, Math.ceil(90 - etat.t / 10))} s`;
    for (const u of etat.equipes[0]) {
      const c = $(`.arene-combat__carte[data-uid="${u.uid}"]`);
      if (!c) continue;
      c.querySelector(".arene-combat__barre--pv span").style.width = `${Math.max(0, u.pv / u.pvMax) * 100}%`;
      c.querySelector(".arene-combat__barre--energie span").style.width = `${Math.min(1, u.energie / 100) * 100}%`;
      c.classList.toggle("arene-combat__carte--ko", u.pv <= 0);
    }
  }

  function traiter(evenements) {
    const { bossU } = combat;
    for (const e of evenements) {
      if (e.type === "attaque" || e.type === "perte") {
        const montant = e.degats ?? e.montant ?? 0;
        if (e.cible === bossU.uid) {
          if (montant > 0) flotter(nombre(montant), e.critique ? "arene-combat__chiffre--crit" : "");
          $(".arene-combat__boss").classList.remove("arene-combat__boss--touche");
          void $(".arene-combat__boss").offsetWidth;
          $(".arene-combat__boss").classList.add("arene-combat__boss--touche");
        } else if (montant > 0) {
          flotter(`-${nombre(montant)}`, "arene-combat__chiffre--subi", e.cible);
          $(`.arene-combat__carte[data-uid="${e.cible}"]`)?.animate([{ transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "none" }], { duration: 160 });
        }
        if (e.type === "attaque" && e.source !== bossU.uid) {
          $(`.arene-combat__carte[data-uid="${e.source}"]`)?.animate([{ transform: "translateY(0)" }, { transform: "translateY(-10px)" }, { transform: "none" }], { duration: 200 });
        }
      }
      if (e.type === "soin" && e.cible !== bossU.uid && e.montant > 0) flotter(`+${nombre(e.montant)}`, "arene-combat__chiffre--soin", e.cible);
      if (e.type === "ultime") {
        const u = combat.etat.unites.find((x) => x.uid === e.source);
        const annonce = $(".arene-combat__annonce");
        annonce.textContent = `${u?.nom ?? ""} : ${e.nom} !`;
        annonce.className = `arene-combat__annonce ${e.source === bossU.uid ? "arene-combat__annonce--boss" : ""}`;
        void annonce.offsetWidth;
        annonce.classList.add("arene-combat__annonce--vue");
        if (e.source === bossU.uid && !mouvementReduit) $(".arene-combat").animate([{ transform: "translate(0,0)" }, { transform: "translate(-6px,4px)" }, { transform: "translate(5px,-3px)" }, { transform: "none" }], { duration: 300 });
      }
      if (e.type === "ko" && e.cible === bossU.uid) flotter("KO !", "arene-combat__chiffre--ko");
    }
  }

  function tic() {
    if (!combat || combat.fini) return;
    if (!zone.isConnected) { combat = null; return; }
    const pas = combat.vitesse === 4 ? 4 : combat.vitesse === 2 ? 2 : 1;
    for (let i = 0; i < pas && !combat.etat.fini; i++) traiter(avancer(combat.etat));
    majCombat();
    if (combat.etat.fini) return terminer();
    combat.minuteur = setTimeout(tic, 100);
  }

  function passer() {
    if (!combat || combat.fini) return;
    clearTimeout(combat.minuteur);
    while (!combat.etat.fini) avancer(combat.etat);
    majCombat();
    terminer();
  }

  function terminer() {
    const c = combat;
    c.fini = true;
    clearTimeout(c.minuteur);
    const etat = c.etat;
    const victoire = etat.vainqueur === 0;
    const degats = c.bossU.pvMax - Math.max(0, c.bossU.pv);
    const koAllies = etat.equipes[0].filter((u) => u.pv <= 0).length;
    if (victoire && !c.gratuit) payerEnergie("arene");
    const r = appliquerResultatArene({ bossId: c.b.id, victoire, ids: c.ids, duree: etat.t / 10, koAllies, degats });
    const p = PERSOS_PAR_ID[c.b.perso];
    const suivant = BOSS_ARENE.find((x) => x.monde === c.b.monde && x.rang === c.b.rang + 1);
    const carte = r.carte ? `
      <div class="arene-fin__carte tome--boss">
        ${htmlCarteStatique(p, { progression: { ...progressionDe(c.b.perso), variantes: ["boss"] } })}
        <span class="badge-variante badge-variante--boss">Carte Boss${r.carte.nouveau ? " · nouveau perso !" : r.carte.nouvelleVariante ? " · nouvelle !" : " · une étoile"}</span>
      </div>` : "";
    $(".arene-combat__fin").innerHTML = `
      <div class="arene-fin ${victoire ? "arene-fin--victoire" : "arene-fin--defaite"}">
        <p class="arene-fin__titre">${victoire ? "Boss vaincu !" : etat.raison === "temps" ? "Temps écoulé" : "Défaite"}</p>
        <p class="arene-fin__degats">${nombre(degats)} dégâts · ${pourcent(degats / c.bossU.pvMax)} de ses PV</p>
        ${carte}
        ${victoire ? `<ul class="arene-fin__gains">
          <li>+${nombre(r.encre)} encre</li>
          <li>+${r.invocations} invocations</li>
          ${r.potion ? `<li>${POTIONS_PAR_ID[r.potion].nom}</li>` : ""}
          ${c.gratuit ? "<li>Premier KO : énergie offerte</li>" : `<li>Énergie −${coutEnergie("arene")}</li>`}
        </ul>` : `<p class="arene-fin__conseil">Monte le niveau de tes persos (campagne, chasse), équipe-les, ou essaie un autre deck : l'écran Équipe a un bouton « Équipe conseillée ».</p>`}
        ${(r.completions ?? []).map((x) => `<p class="bilan__complete">${x.type === "edition" ? "Édition" : "Série"} complète : ${x.nom} !</p>`).join("")}
        <div class="arene-fin__actions">
          ${victoire && suivant && r.premier ? '<button type="button" class="bouton autel__invoquer" data-arene="suivant">Boss suivant</button>' : ""}
          <button type="button" class="bouton bouton--secondaire" data-arene="rejouer">${victoire ? "Rejouer" : "Réessayer"}</button>
          <button type="button" class="bouton bouton--clair" data-arene="fermer">Fermer</button>
        </div>
      </div>`;
    $(".arene-combat__fin").hidden = false;
    $(".arene-combat__commandes").hidden = true;
    chargerPortraits((id) => rafraichirPortrait($(".arene__combat-zone"), id));
    if (victoire) { sonRarete(r.carte ? p.rarete : "rare"); if (r.completions?.length) setTimeout(sonComplete, 400); } else sonCarte();
    annoncerTampons(verifierTampons());
    majNavigation?.();
  }

  function fermerCombat() {
    if (combat) clearTimeout(combat.minuteur);
    combat = null;
    $(".arene__combat-zone").innerHTML = "";
    rendre();
  }

  zone.addEventListener("click", (e) => {
    const b = e.target.closest("[data-arene]");
    if (!b || b.disabled) return;
    const a = b.dataset.arene;
    if (a === "monde") { monde = b.dataset.edition; choisi = null; rendre(); }
    if (a === "boss") { choisi = BOSS_ARENE.find((x) => x.id === b.dataset.boss); rendreEchelle(); rendreDetail(); }
    if (a === "lancer") lancer();
    if (a === "equipe") naviguer("equipe");
    if (a === "vitesse" && combat) { combat.vitesse = combat.vitesse === 1 ? 2 : combat.vitesse === 2 ? 4 : 1; b.textContent = `Vitesse ×${combat.vitesse}`; }
    if (a === "passer") passer();
    if (a === "fermer") fermerCombat();
    if (a === "rejouer") { const x = combat?.b; fermerCombat(); choisi = x ?? choisi; rendreDetail(); lancer(); }
    if (a === "suivant") {
      const x = combat?.b;
      fermerCombat();
      choisi = BOSS_ARENE.find((y) => y.monde === x.monde && y.rang === x.rang + 1) ?? choisi;
      rendreEchelle(); rendreDetail();
    }
  });

  rendre();
}
