// ==========================================================
// HASARD REPRODUCTIBLE
// Meme graine = memes tirages = meme combat.
// C'est ce qui permettra de reverifier les combats PvP.
// ==========================================================

export function creerHasard(graine) {
  let etat = graine >>> 0;

  // Generateur "mulberry32" : rapide et suffisant pour un jeu
  function suivant() {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    nombre: suivant,                                   // entre 0 et 1
    entre: (min, max) => min + (max - min) * suivant(), // entre min et max
    chance: (probabilite) => suivant() < probabilite,   // vrai ou faux
    choisir: (liste) => liste[Math.floor(suivant() * liste.length)],
  };
}

export function nouvelleGraine() {
  return Math.floor(Math.random() * 2147483647);
}
