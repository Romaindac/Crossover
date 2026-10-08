// ==========================================================
// SAUVEGARDE DANS LE NAVIGATEUR
// Tout passe par ici : si le navigateur refuse (mode prive,
// stockage plein), le jeu continue sans planter.
// ==========================================================

const PREFIXE = "crossover:";

export function lire(cle, valeurParDefaut) {
  try {
    const texte = localStorage.getItem(PREFIXE + cle);
    return texte === null ? valeurParDefaut : JSON.parse(texte);
  } catch {
    return valeurParDefaut;
  }
}

export function ecrire(cle, valeur) {
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
  } catch {
    // Pas grave : on perd juste la sauvegarde
  }
}
