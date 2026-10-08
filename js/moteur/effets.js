// ==========================================================
// EFFETS DE STATUT
// Les durees sont comptees en "tics" (1 tic = 0,1 seconde),
// pour eviter les erreurs d'arrondi.
// ==========================================================

export const EFFETS = {
  etourdi:      { nom: "Étourdissement", positif: false },
  brulure:      { nom: "Brûlure",        positif: false },
  ralenti:      { nom: "Ralentissement", positif: false },
  bouclier:     { nom: "Bouclier",       positif: true },
  provocation:  { nom: "Provocation",    positif: true },
  renforcement: { nom: "Renforcement",   positif: true },
  regeneration: { nom: "Régénération",   positif: true },
  acceleration: { nom: "Accélération",   positif: true },
  vulnerabilite: { nom: "Vulnérabilité", positif: false },   // +25 % de degats subis
};

// Apres un etourdissement, 3 secondes d'immunite (en tics)
export const IMMUNITE_ETOURDI = 30;

export function trouverEffet(unite, type) {
  return unite.effets.find((e) => e.type === type);
}

export function aEffet(unite, type) {
  return unite.effets.some((e) => e.type === type);
}

export function retirerEffet(unite, type) {
  unite.effets = unite.effets.filter((e) => e.type !== type);
}

// Pose un effet. Retourne false si l'unite y resiste.
// Un meme effet ne se cumule pas : le reposer relance sa duree.
export function poserEffet(unite, type, dureeTics, { valeur = 0, source = null, temps = 0, force = false } = {}) {
  if (type === "etourdi" && !force && temps < unite.immuniteEtourdiJusqua) return false;

  const existant = trouverEffet(unite, type);
  if (existant) {
    existant.reste = dureeTics;
    existant.valeur = Math.max(existant.valeur, valeur);
    existant.source = source;
    return true;
  }
  unite.effets.push({ type, reste: dureeTics, valeur, source });
  return true;
}

// Fait passer un tic sur les effets d'une unite
export function vieillirEffets(unite, temps) {
  let finEtourdi = false;
  for (const effet of unite.effets) effet.reste -= 1;
  unite.effets = unite.effets.filter((effet) => {
    if (effet.reste > 0) return true;
    if (effet.type === "etourdi") finEtourdi = true;
    return false;
  });
  if (finEtourdi) unite.immuniteEtourdiJusqua = temps + IMMUNITE_ETOURDI;
}
