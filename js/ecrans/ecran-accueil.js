// ==========================================================
// ECRAN D'ACCUEIL : la couverture du tome
// L'illustration de couverture montre tes persos (ou des
// heros iconiques si tu n'as pas encore commence).
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { PALIERS } from "../donnees/ennemis.js";
import { aUnePartie, equipeSauvee, idsPossedes, palierMaxDebloque, estBattu } from "../services/partie.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait } from "../ui/cartes.js";

const VITRINE = ["naruto", "luffy", "goku", "pikachu", "guts"];

export function afficherAccueil(conteneur, { naviguer }) {
  const partie = aUnePartie();
  const equipe = partie ? equipeSauvee().filter(Boolean) : [];
  const vitrine = (equipe.length >= 3 ? equipe : VITRINE).slice(0, 5);
  const meilleurBattu = PALIERS.filter((p) => estBattu(p.palier)).length;

  const accroche = partie
    ? `<p class="obi__accroche">Bon retour parmi les héros.</p>
       <p class="obi__detail">${meilleurBattu ? `${meilleurBattu} palier${meilleurBattu > 1 ? "s" : ""} battu${meilleurBattu > 1 ? "s" : ""} sur ${PALIERS.length}` : "Aucun palier battu pour l'instant"}, ${idsPossedes().length} persos sur ${PERSOS.length}.</p>`
    : `<p class="obi__accroche">Goku, Naruto, Pikachu et Guts dans la même équipe.</p>
       <p class="obi__detail">Les héros de tous les mangas, enfin réunis.</p>`;

  conteneur.innerHTML = `
    <main class="accueil">
      <div class="accueil__trame accueil__trame--rose" aria-hidden="true"></div>
      <div class="accueil__trame accueil__trame--ciel" aria-hidden="true"></div>
      <p class="accueil__tranche" aria-hidden="true">Crossover, volume 0.2</p>

      <div class="accueil__couverture">
        <div class="vitrine" aria-hidden="true">
          ${vitrine.map((id, i) => {
            const ecart = i - (vitrine.length - 1) / 2;
            return `<span class="vitrine__carte" style="--i: ${i}; --angle: ${ecart * 9}deg; --bas: ${Math.abs(ecart) * 0.9}rem">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`;
          }).join("")}
        </div>
        <div class="accueil__impact">
          <h1 class="accueil__titre">Crossover</h1>
        </div>
      </div>

      <div class="obi">
        <div class="obi__texte">${accroche}</div>
        <div class="obi__action">
          <button class="bouton bouton--principal" id="bouton-jouer" type="button">${partie ? "Continuer" : "Jouer"}</button>
        </div>
      </div>
    </main>
  `;

  // Jouer : choix du premier heros la premiere fois, puis l'equipe
  conteneur.querySelector("#bouton-jouer").addEventListener("click", () => naviguer(partie ? "qg" : "debut"));
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}
