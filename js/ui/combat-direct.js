// ==========================================================
// COMBAT EN DIRECT (5 contre 5), par-dessus l'ecran
// Utilise par le Donjon et les Duels : le moteur etant deterministe,
// on rejoue ici exactement le combat que la partie va compter.
// Barres de vie, chiffres de degats, annonces d'ultime ; vitesse
// x1/x2/x4 et bouton « Passer ».
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { creerCombat, avancer } from "../moteur/simulation.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait } from "./cartes.js";

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// Renvoie une promesse : { vainqueur, duree } quand le combat est fini (ou passe)
export function jouerCombatDirect({ config, titre = "", sousTitre = "", vitesse = 2 }) {
  const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const etat = creerCombat({ ...config, journal: false });
  const voile = document.createElement("div");
  voile.className = "combat-direct";
  voile.setAttribute("role", "dialog");
  voile.setAttribute("aria-modal", "true");
  const htmlCamp = (camp) => etat.equipes[camp].map((u) => `
    <div class="combat-direct__carte" data-uid="${u.uid}">
      <span class="combat-direct__portrait">${htmlPortrait(PERSOS_PAR_ID[u.id])}</span>
      <span class="combat-direct__barre combat-direct__barre--pv"><span></span></span>
      <span class="combat-direct__barre combat-direct__barre--energie"><span></span></span>
      <span class="combat-direct__nom">${PERSOS_PAR_ID[u.id]?.nom ?? ""}</span>
    </div>`).join("");
  voile.innerHTML = `
    <div class="combat-direct__cadre">
      <header class="combat-direct__haut"><p class="combat-direct__titre">${titre}<small>${sousTitre}</small></p><p class="combat-direct__chrono"></p></header>
      <div class="combat-direct__camp combat-direct__camp--ennemi">${htmlCamp(1)}</div>
      <p class="combat-direct__annonce" aria-live="polite"></p>
      <div class="combat-direct__camp">${htmlCamp(0)}</div>
      <div class="combat-direct__commandes">
        <button type="button" class="bouton bouton--clair" data-cd="vitesse">Vitesse ×${vitesse}</button>
        <button type="button" class="bouton bouton--clair" data-cd="passer">Passer</button>
      </div>
      <p class="combat-direct__fin" hidden></p>
    </div>`;
  document.body.append(voile);
  chargerPortraits((id) => rafraichirPortrait(voile, id));
  const $ = (s) => voile.querySelector(s);

  const carte = (uid) => voile.querySelector(`.combat-direct__carte[data-uid="${uid}"]`);
  function flotter(uid, texte, classe) {
    if (mouvementReduit) return;
    const c = carte(uid);
    if (!c) return;
    const s = document.createElement("span");
    s.className = `combat-direct__chiffre ${classe}`;
    s.textContent = texte;
    c.appendChild(s);
    setTimeout(() => s.remove(), 850);
  }
  function maj() {
    for (const u of etat.unites) {
      const c = carte(u.uid);
      if (!c) continue;
      c.querySelector(".combat-direct__barre--pv span").style.width = `${Math.max(0, u.pv / u.pvMax) * 100}%`;
      c.querySelector(".combat-direct__barre--energie span").style.width = `${Math.min(1, u.energie / 100) * 100}%`;
      c.classList.toggle("combat-direct__carte--ko", u.pv <= 0);
    }
    $(".combat-direct__chrono").textContent = `${Math.max(0, Math.ceil(90 - etat.t / 10))} s`;
  }
  function traiter(evenements) {
    for (const e of evenements) {
      if (e.type === "attaque" || e.type === "perte") {
        const m = e.degats ?? e.montant ?? 0;
        if (m > 0) flotter(e.cible, nombre(m), e.critique ? "combat-direct__chiffre--crit" : "");
        if (e.type === "attaque" && !mouvementReduit) carte(e.source)?.animate([{ transform: "translateY(0)" }, { transform: `translateY(${e.source.startsWith("A") ? -8 : 8}px)` }, { transform: "none" }], { duration: 180 });
      }
      if (e.type === "soin" && e.montant > 0) flotter(e.cible, `+${nombre(e.montant)}`, "combat-direct__chiffre--soin");
      if (e.type === "ultime") {
        const u = etat.unites.find((x) => x.uid === e.source);
        const a = $(".combat-direct__annonce");
        a.textContent = `${u?.nom ?? ""} : ${e.nom} !`;
        a.className = `combat-direct__annonce ${e.source.startsWith("B") ? "combat-direct__annonce--ennemi" : ""}`;
        void a.offsetWidth;
        a.classList.add("combat-direct__annonce--vue");
      }
    }
  }

  return new Promise((resoudre) => {
    let minuteur = null;
    let fini = false;
    async function terminer() {
      if (fini) return;
      fini = true;
      clearTimeout(minuteur);
      maj();
      const fin = $(".combat-direct__fin");
      fin.textContent = etat.vainqueur === 0 ? "Victoire !" : etat.raison === "temps" ? "Temps écoulé" : "Défaite";
      fin.className = `combat-direct__fin combat-direct__fin--${etat.vainqueur === 0 ? "v" : "d"}`;
      fin.hidden = false;
      $(".combat-direct__commandes").hidden = true;
      await pause(mouvementReduit ? 300 : 1100);
      voile.remove();
      resoudre({ vainqueur: etat.vainqueur, duree: etat.t / 10 });
    }
    function tic() {
      if (fini) return;
      for (let i = 0; i < vitesse && !etat.fini; i++) traiter(avancer(etat));
      maj();
      if (etat.fini) return terminer();
      minuteur = setTimeout(tic, 100);
    }
    voile.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-cd]");
      if (!b) return;
      if (b.dataset.cd === "vitesse") { vitesse = vitesse === 1 ? 2 : vitesse === 2 ? 4 : 1; b.textContent = `Vitesse ×${vitesse}`; }
      if (b.dataset.cd === "passer") { clearTimeout(minuteur); while (!etat.fini) avancer(etat); terminer(); }
    });
    maj();
    tic();
  });
}
