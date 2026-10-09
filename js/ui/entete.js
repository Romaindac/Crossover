// ==========================================================
// L'EN-TETE COMMUN DES ECRANS : un bandeau d'encre avec un grand
// kanji, le titre, une phrase d'accroche et les onglets de l'ecran.
// Chaque ecran garde ses propres classes d'onglets (ses clics en
// dependent) ; la classe « onglet-page » leur donne le style commun.
// ==========================================================

export function htmlEntete({ titre, kanji, accroche = "", theme = "", onglets = "", libelleOnglets = titre, extra = "", classe = "" }) {
  return `
    <header class="entete-page ${theme ? `entete-page--${theme}` : ""} ${classe}">
      <span class="entete-page__kanji" aria-hidden="true">${kanji}</span>
      <div class="entete-page__texte">
        <h1 class="entete-page__titre">${titre}</h1>
        ${accroche ? `<p class="entete-page__accroche">${accroche}</p>` : ""}
        ${extra}
      </div>
      ${onglets ? `<div class="entete-page__onglets" role="tablist" aria-label="${libelleOnglets}">${onglets}</div>` : ""}
    </header>`;
}

// Un onglet : garde la classe et les donnees propres a l'ecran
export const htmlOnglet = (texte, { classe = "", donnees = "" } = {}) =>
  `<button type="button" role="tab" class="onglet-page ${classe}" ${donnees}>${texte}</button>`;
