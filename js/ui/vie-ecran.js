// ==========================================================
// VIE D'UN ECRAN
// Les ecouteurs poses sur window ou document par un ecran (compte,
// messages non lus, clavier...) gardaient l'ancien ecran en memoire
// apres un changement d'ecran (fuite constatee : des centaines de
// milliers de noeuds apres quelques tours). Chaque ecran recoit un
// signal, coupe a l'affichage de l'ecran suivant : ses ecouteurs
// disparaissent tout seuls.
//   window.addEventListener("x", f, { signal: signalEcran() })
// ==========================================================

let controleur = new AbortController();

export const signalEcran = () => controleur.signal;

// Appele par naviguer() juste avant d'afficher un nouvel ecran
export function nouvelEcran() {
  controleur.abort();
  controleur = new AbortController();
}
