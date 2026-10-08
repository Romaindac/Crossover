// ==========================================================
// ICONES DES EFFETS DE STATUT (dessins SVG faits maison)
// ==========================================================

const DESSINS = {
  etourdi: '<path d="M12 12a1.6 1.6 0 1 1 1.6 1.6A3.2 3.2 0 1 1 16.8 12a4.8 4.8 0 1 1-4.8-4.8"/>',
  brulure: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 2 2 3 2 0-2-1-4 0-6z"/>',
  ralenti: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  bouclier: '<path d="M12 3l7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6z"/>',
  provocation: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  renforcement: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  regeneration: '<path d="M12 6v12M6 12h12"/>',
  acceleration: '<path d="M5 7l5 5-5 5M13 7l5 5-5 5"/>',
  vulnerabilite: '<path d="M12 4l-2 6 4 2-2 8"/><path d="M6 6l12 12"/>',
};

export function iconeEffet(type) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${DESSINS[type] ?? ""}</svg>`;
}
