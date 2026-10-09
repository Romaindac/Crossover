// ==========================================================
// REGLAGES : options de combat et sauvegarde
// ==========================================================

import { NOMS_CASES, NOMS_PORTRAITS, reglage, changerReglage, tousLesReglages, restaurerReglages } from "../services/reglages.js";
import { exporterPartie, importerPartie, effacerPartie } from "../services/partie.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";

export function afficherReglages(conteneur, { naviguer }) {
  conteneur.innerHTML = `
    ${htmlNavigation("reglages")}
    <div class="reglages-page">
      <h1 class="equipe__titre">Réglages</h1>

      <section class="carte-reglage" aria-labelledby="titre-combat">
        <h2 id="titre-combat">Combat</h2>
        <div class="reglage">
          <p class="reglage__nom">Grandes cases d'ultime</p>
          <p class="reglage__aide">La case manga qui traverse l'écran quand un de tes persos lance son ultime. Tu peux aussi la passer d'un clic, ou changer ce réglage pendant une pause.</p>
          <div class="choix-segmente choix-segmente--gauche" role="radiogroup" aria-label="Grandes cases d'ultime">
            ${Object.entries(NOMS_CASES).map(([val, nom]) => `
              <button type="button" role="radio" class="choix-segmente__option" data-action="cases" data-valeur="${val}" aria-checked="${reglage("cases") === val}">${nom}</button>`).join("")}
          </div>
        </div>
        <div class="reglage">
          <label class="interrupteur">
            <input type="checkbox" data-action="secousses" ${reglage("secousses") ? "checked" : ""}>
            <span>Secousses de l'écran</span>
          </label>
          <p class="reglage__aide">Les tremblements sur les coups critiques, les ultimes et les KO.</p>
        </div>
        <div class="reglage">
          <label class="interrupteur"><input type="checkbox" data-action="opt-continuer" ${reglage("boucleContinuer") ? "checked" : ""}><span>Boucle de chasse : continuer après une défaite</span></label>
          <label class="interrupteur"><input type="checkbox" data-action="opt-recyclage" ${reglage("recyclageAuto") ? "checked" : ""}><span>Boucles : recycler automatiquement les Communes libres</span></label>
          <p class="reglage__aide">En mode manuel, les touches 1 à 5 lancent l'ultime du perso correspondant.</p>
        </div>
      </section>

      <section class="carte-reglage" aria-labelledby="titre-affichage">
        <h2 id="titre-affichage">Affichage</h2>
        <div class="reglage">
          <p class="reglage__nom">Style des portraits</p>
          <p class="reglage__aide">Les portraits viennent de sources aux styles différents. « Encre » les passe tous en monochrome teinté, comme les pages d'un même tome.</p>
          <div class="choix-segmente choix-segmente--gauche" role="radiogroup" aria-label="Style des portraits">
            ${Object.entries(NOMS_PORTRAITS).map(([val, nom]) => `
              <button type="button" role="radio" class="choix-segmente__option" data-action="portraits" data-valeur="${val}" aria-checked="${reglage("portraits") === val}">${nom}</button>`).join("")}
          </div>
        </div>
      </section>

      <section class="carte-reglage" aria-labelledby="titre-sons">
        <h2 id="titre-sons">Sons</h2>
        <div class="reglage">
          <label class="interrupteur"><input type="checkbox" data-action="sons" ${reglage("sons") ? "checked" : ""}><span>Effets sonores</span></label>
          <p class="reglage__aide">La déchirure du sachet, les cartes qui se retournent, le carillon des grosses raretés.</p>
        </div>
      </section>

      <section class="carte-reglage" aria-labelledby="titre-sauvegarde">
        <h2 id="titre-sauvegarde">Sauvegarde</h2>
        <p class="reglage__aide">Ta partie est gardée dans ce navigateur. Si tu vides ses données, elle disparaît : exporte-la de temps en temps et garde le texte quelque part (un fichier, un mail à toi-même).</p>

        <div class="reglage">
          <p class="reglage__nom">Exporter</p>
          <div class="reglage__boutons">
            <button type="button" class="bouton bouton--obi-petit" data-action="exporter">Créer le texte de sauvegarde</button>
          </div>
          <textarea class="zone-sauvegarde" id="export" readonly hidden aria-label="Texte de sauvegarde"></textarea>
          <div class="reglage__boutons" id="export-actions" hidden>
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="copier">Copier</button>
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="telecharger">Télécharger en fichier</button>
          </div>
        </div>

        <div class="reglage">
          <p class="reglage__nom">Importer</p>
          <textarea class="zone-sauvegarde" id="import" placeholder="Colle ici un texte de sauvegarde (il commence par CROSSOVER1:)" aria-label="Texte de sauvegarde à importer"></textarea>
          <div class="reglage__boutons">
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="importer">Importer</button>
          </div>
          <p class="reglage__aide">Attention : importer remplace ta partie actuelle.</p>
        </div>
        <p class="reglage__message" id="message" role="status" aria-live="polite"></p>
      </section>

      <section class="carte-reglage" aria-labelledby="titre-labo">
        <h2 id="titre-labo">Laboratoire</h2>
        <p class="reglage__aide">Pour les curieux : la page de test du moteur. Combats coup par coup, tournoi d'équilibrage et simulation de l'économie.</p>
        <div class="reglage__boutons">
          <a class="bouton bouton--clair bouton--petit-texte" href="test-moteur.html">Ouvrir le laboratoire</a>
        </div>
      </section>

      <section class="carte-reglage carte-reglage--danger" aria-labelledby="titre-effacer">
        <h2 id="titre-effacer">Recommencer à zéro</h2>
        <p class="reglage__aide">Efface ta collection, ton encre et ta progression. Exporte ta partie avant si tu veux pouvoir revenir en arrière.</p>
        <div class="reglage__boutons">
          <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="effacer">Effacer ma partie</button>
        </div>
      </section>
    </div>
  `;

  const $ = (sel) => conteneur.querySelector(sel);
  const majEncre = brancherNavigation(conteneur, naviguer, "reglages");
  const message = (texte, erreur = false) => {
    $("#message").textContent = texte;
    $("#message").classList.toggle("reglage__message--erreur", erreur);
  };
  let confirmationEffacement = false;

  conteneur.addEventListener("click", async (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    const action = cible.dataset.action;

    if (action === "cases") {
      changerReglage("cases", cible.dataset.valeur);
      conteneur.querySelectorAll("[data-action='cases']").forEach((b) => b.setAttribute("aria-checked", String(b === cible)));
    }
    if (action === "secousses") changerReglage("secousses", cible.checked);
    if (action === "sons") changerReglage("sons", cible.checked);
    if (action === "portraits") {
      changerReglage("portraits", cible.dataset.valeur);
      document.body.classList.toggle("portraits-encre", cible.dataset.valeur === "encre");
      conteneur.querySelectorAll("[data-action='portraits']").forEach((b) => b.setAttribute("aria-checked", String(b === cible)));
    }
    if (action === "opt-continuer") changerReglage("boucleContinuer", cible.checked);
    if (action === "opt-recyclage") changerReglage("recyclageAuto", cible.checked);

    if (action === "exporter") {
      $("#export").value = exporterPartie(tousLesReglages());
      $("#export").hidden = false;
      $("#export-actions").hidden = false;
      $("#export").select();
      message("Texte de sauvegarde créé : copie-le ou télécharge-le.");
    }
    if (action === "copier") {
      try {
        await navigator.clipboard.writeText($("#export").value);
        message("Copié ! Colle-le dans un endroit sûr.");
      } catch {
        $("#export").select();
        message("La copie automatique a échoué : le texte est sélectionné, fais Ctrl+C.", true);
      }
    }
    if (action === "telecharger") {
      const lien = document.createElement("a");
      lien.href = URL.createObjectURL(new Blob([$("#export").value], { type: "text/plain" }));
      lien.download = `crossover-sauvegarde-${new Date().toISOString().slice(0, 10)}.txt`;
      lien.click();
      URL.revokeObjectURL(lien.href);
      message("Fichier téléchargé.");
    }
    if (action === "importer") {
      const resultat = importerPartie($("#import").value);
      if (!resultat.ok) return message(resultat.erreur, true);
      restaurerReglages(resultat.reglages);
      majEncre();
      $("#import").value = "";
      message("Partie importée !");
    }
    if (action === "effacer") {
      if (!confirmationEffacement) {
        confirmationEffacement = true;
        cible.textContent = "Clique encore pour confirmer";
        cible.classList.add("bouton--danger");
        return;
      }
      effacerPartie();
      naviguer("accueil");
    }
  });
}
