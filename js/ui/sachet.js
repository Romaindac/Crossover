// ==========================================================
// LE SACHET D'UN BOOSTER (affichage partage : boutique, ouverture,
// booster de depart)
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { CARTES_PAR_BOOSTER } from "../donnees/boosters.js";
import { htmlPortrait } from "./cartes.js";

// Le sachet d'un booster : feuille metallisee aux couleurs de l'edition,
// bords soudes, et ses 3 vedettes en eventail dans la fenetre
export function htmlSachet(edition, { attributs = "" } = {}) {
  const [c1, c2, c3] = edition.couleurs;
  return `
    <span class="sachet" style="--p1: ${c1}; --p2: ${c2}; --p3: ${c3}" ${attributs}>
      <span class="sachet__soudure sachet__soudure--haut" aria-hidden="true"></span>
      <span class="sachet__logo">Crossover</span>
      <span class="sachet__edition">${edition.etiquette ?? `Édition ${edition.numero}`}</span>
      <span class="sachet__fenetre" aria-hidden="true">
        ${edition.vedettes.map((id, i) => `<span class="sachet__vedette sachet__vedette--${i}">${htmlPortrait(PERSOS_PAR_ID[id])}</span>`).join("")}
      </span>
      <span class="sachet__nom">${edition.nom}</span>
      <span class="sachet__badge">${edition.cartes ?? CARTES_PAR_BOOSTER} cartes</span>
      <span class="sachet__reflet" aria-hidden="true"></span>
      <span class="sachet__soudure sachet__soudure--bas" aria-hidden="true"></span>
    </span>`;
}
