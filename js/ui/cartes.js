// ==========================================================
// CARTES DE PERSO
// Le meme cadre pour tous les persos, quel que soit le style
// de leur serie : c'est ce qui garde l'ensemble coherent.
// ==========================================================

import { ORDRE_BORDURES, BORDURES_PAR_ID } from "../donnees/invocations.js";
import { ROLES, AFFINITES } from "../donnees/roles.js";
import { RARETES } from "../donnees/raretes.js";
import { ETOILES_MAX } from "../donnees/progression.js";
import { portraitDe, estPokemon } from "../services/portraits.js";
import { SOURCES_PORTRAITS } from "../donnees/portraits.js";
import { styleSerie, varsSerie, motifSerie } from "../donnees/series.js";

export const COULEURS_AFFINITE = {
  puissance: "#e8772e",
  technique: "#2f6fd6",
  vitesse: "#1f9a66",
  esprit: "#8a5cd8",
  chaos: "#a3264b",
};

// Icones de role, dessinees a la main en SVG
const ICONES_ROLE = {
  tank: '<path d="M12 3l7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6z"/>',
  attaquant: '<path d="M14 4h6v6l-9 9-6-6z"/><path d="M4 20l3-3"/>',
  assassin: '<path d="M20 4l-8 3-5 5 5 5 5-5 3-8z"/><path d="M7 17l-3 3"/>',
  soutien: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M7.5 12h9"/>',
  controle: '<circle cx="9" cy="12" r="4.5"/><circle cx="15" cy="12" r="4.5"/>',
};

export function iconeRole(role) {
  return `<svg class="icone-role" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONES_ROLE[role]}</svg>`;
}

export function initiales(nom) {
  return nom.slice(0, 2).toUpperCase();
}

// Le portrait seul (utilise dans les cartes, les places et le detail)
const PORTRAIT_RATURE = `
  <svg class="portrait__rature" viewBox="0 0 100 120" aria-hidden="true">
    <rect width="100" height="120" fill="#e9e5dc"/>
    <path d="M50 14c14 0 30 8 33 24 4 4 9 12 4 18 5 10-2 20-10 22 2 8-2 16-8 14-1 9-4 18-8 10-3 8-7 14-10 4-6 6-10 0-8-8-9 4-14-4-10-12-10-2-15-12-8-20-6-8 0-16 6-18-2-16 14-28 19-28z" fill="#17192d"/>
    <path d="M28 96c0 8-2 14 1 16M47 102c0 6 0 10 2 12M66 98c1 6 1 10-1 13" stroke="#17192d" stroke-width="4" stroke-linecap="round" fill="none"/>
    <ellipse cx="38" cy="52" rx="9" ry="12" fill="#f2f0ea"/><ellipse cx="63" cy="52" rx="9" ry="12" fill="#f2f0ea"/>
    <circle cx="40" cy="55" r="4" fill="#c4372b"/><circle cx="61" cy="55" r="4" fill="#c4372b"/>
    <path d="M36 78q14 8 28 0" stroke="#f2f0ea" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;

const corps = (fond, yeux, extra) => `
  <svg class="portrait__rature" viewBox="0 0 100 120" aria-hidden="true">
    <rect width="100" height="120" fill="${fond}"/>${extra}
    <ellipse cx="38" cy="52" rx="9" ry="12" fill="#f2f0ea"/><ellipse cx="63" cy="52" rx="9" ry="12" fill="#f2f0ea"/>
    <circle cx="40" cy="55" r="4" fill="${yeux}"/><circle cx="61" cy="55" r="4" fill="${yeux}"/>
  </svg>`;
const PORTRAITS_ORIGINAUX = {
  kraken: corps("#d6e3ea", "#2f63b8", `<path d="M50 16c18 0 32 14 32 34 0 14-8 22-16 26 6 10 14 18 22 20-10 4-20-2-26-10-2 10-4 22-12 30-2-10-4-20-4-30-6 8-16 14-26 10 8-2 16-10 22-20-8-4-16-12-16-26 0-20 14-34 24-34z" fill="#17192d"/>`),
  demon: corps("#17192d", "#c4372b", `<path d="M50 14c16 0 30 12 30 30 0 20-10 30-12 46-6-6-10-4-18 6-8-10-12-12-18-6-2-16-12-26-12-46 0-18 14-30 30-30z M24 22l8 14M76 22l-8 14" fill="#f2f0ea" stroke="#f2f0ea" stroke-width="4"/>`),
  editeur: corps("#efe3d0", "#17192d", `<path d="M50 14c16 0 32 12 32 32 0 24-14 40-32 52-18-12-32-28-32-52 0-20 16-32 32-32z" fill="#17192d"/><circle cx="38" cy="52" r="13" fill="none" stroke="#c4372b" stroke-width="3"/><circle cx="63" cy="52" r="13" fill="none" stroke="#c4372b" stroke-width="3"/><path d="M51 52h-0M70 92l18-30" stroke="#c4372b" stroke-width="4"/>`),
  golem: corps("#e4dfd4", "#efbd2b", `<rect x="20" y="20" width="60" height="80" rx="4" fill="#17192d"/><path d="M20 40h60M20 72h60M30 20v80" stroke="#5d5f72" stroke-width="3"/>`),
};

export function htmlPortrait(perso) {
  if (perso.id === "rature") {
    return `<span class="portrait portrait--rature" data-portrait="rature" style="--aff: ${COULEURS_AFFINITE[perso.affinite]}">${PORTRAIT_RATURE}</span>`;
  }
  if (PORTRAITS_ORIGINAUX[perso.id]) {
    return `<span class="portrait portrait--rature" data-portrait="${perso.id}" style="--aff: ${COULEURS_AFFINITE[perso.affinite]}">${PORTRAITS_ORIGINAUX[perso.id]}</span>`;
  }
  const pid = perso.base ?? perso.id;   // un Secret reprend le portrait de son heros de base
  const url = portraitDe(pid);
  const classe = estPokemon(pid) ? "portrait portrait--pokemon" : "portrait";
  const cadrage = SOURCES_PORTRAITS[pid]?.cadrage;
  const zoom = SOURCES_PORTRAITS[pid]?.zoom;   // Pokemon : agrandissement propre a l'illustration
  return `
    <span class="${classe}" data-portrait="${pid}" style="--aff: ${COULEURS_AFFINITE[perso.affinite]}${cadrage ? `; --cadrage: ${cadrage}` : ""}${zoom ? `; --zoom: ${zoom}` : ""}">
      <span class="portrait__initiales" aria-hidden="true">${initiales(perso.nom)}</span>
      ${url ? `<img src="${url}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}
    </span>
  `;
}

// Met a jour les portraits deja affiches quand une image arrive
export function rafraichirPortrait(racine, persoId) {
  const url = portraitDe(persoId);
  if (!url) return;
  racine.querySelectorAll(`[data-portrait="${persoId}"]`).forEach((zone) => {
    const img = zone.querySelector("img");
    if (img) {
      // L'image de l'anime remplace l'illustration de secours d'un Pokemon
      if (img.getAttribute("src") !== url) {
        img.setAttribute("src", url);
        zone.classList.remove("portrait--pokemon");
      }
      return;
    }
    zone.insertAdjacentHTML("beforeend", `<img src="${url}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`);
  });
}

// Etoiles dessinees en SVG (pas de caracteres speciaux)
const ETOILE = '<path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>';

export function htmlEtoiles(etoiles) {
  const liste = Array.from({ length: ETOILES_MAX }, (_, i) =>
    `<svg class="etoile ${i < etoiles ? "etoile--pleine" : ""}" viewBox="0 0 24 24" aria-hidden="true">${ETOILE}</svg>`
  ).join("");
  return `<span class="etoiles" title="${etoiles} étoile${etoiles > 1 ? "s" : ""} sur ${ETOILES_MAX}">${liste}</span>`;
}

// L'obi : la bande de couleur qui annonce la rarete, comme sur un tome
export function htmlObi(perso) {
  return `<span class="obi-rarete obi-rarete--${perso.rarete}">${RARETES[perso.rarete].nom}</span>`;
}

// La plus belle bordure possedee (neant > arc-en-ciel > doree > holo), ou null
export const meilleureVariante = (progression) =>
  [...ORDRE_BORDURES].reverse().find((v) => progression?.variantes?.includes(v)) ?? null;
export const nomBordure = (v) => BORDURES_PAR_ID[v]?.nom ?? v;

export function htmlCarte(perso, { dansEquipe = false, progression = null } = {}) {
  const variante = meilleureVariante(progression);
  const meta = progression
    ? `<span class="carte__meta">Niv. ${progression.niveau}</span>${htmlEtoiles(progression.etoiles)}`
    : `<span class="carte__meta">${ROLES[perso.role].nom}</span>`;
  return `
    <button type="button" class="carte carte--${perso.rarete} ${variante ? `carte--${variante}` : ""} ${dansEquipe ? "carte--prise" : ""}"
      data-action="choisir-perso" data-perso="${perso.id}" draggable="true" data-motif="${motifSerie(perso.serie)}"
      aria-pressed="${dansEquipe}" style="--aff: ${COULEURS_AFFINITE[perso.affinite]}; ${varsSerie(perso.serie)}"
      aria-label="${perso.nom}, ${RARETES[perso.rarete].nom}, ${ROLES[perso.role].nom}${progression ? `, niveau ${progression.niveau}, ${progression.etoiles} étoiles` : ""}${dansEquipe ? ", dans ton équipe" : ""}">
      <span class="carte__role" title="${ROLES[perso.role].nom}, ${AFFINITES[perso.affinite]}">${iconeRole(perso.role)}</span>
      <span class="carte__visuel">${htmlPortrait(perso)}${htmlObi(perso)}</span>
      <span class="carte__infos">
        <span class="carte__bande" aria-hidden="true"></span>
        <span class="carte__serie" aria-hidden="true">${styleSerie(perso.serie).abrege}</span>
        <span class="carte__nom">${perso.nom}</span>
        <span class="carte__ligne">${meta}</span>
      </span>
      ${dansEquipe ? '<span class="carte__bandeau">Dans l\'équipe</span>' : ""}
    </button>
  `;
}

// Une carte non cliquable (revelation des boosters, vitrines) : meme rendu, sans bouton
export function htmlCarteStatique(perso, options = {}) {
  return htmlCarte(perso, options)
    .replace(/^\s*<button type="button"/, "<span")
    .replace(/<\/button>\s*$/, "</span>")
    .replace(' data-action="choisir-perso"', "")
    .replace(' draggable="true"', "")
    .replace(/ aria-pressed="[^"]*"/, "");
}
