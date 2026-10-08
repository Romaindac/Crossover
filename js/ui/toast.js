// ==========================================================
// MESSAGES FLOTTANTS : un tampon obtenu, une nouveaute...
// ==========================================================

export function afficherToast(html, { duree = 3800 } = {}) {
  let pile = document.querySelector(".toasts");
  if (!pile) {
    pile = document.createElement("div");
    pile.className = "toasts";
    pile.setAttribute("role", "status");
    pile.setAttribute("aria-live", "polite");
    document.body.appendChild(pile);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = html;
  pile.appendChild(el);
  setTimeout(() => el.remove(), duree);
}

// Annonce des tampons nouvellement obtenus
// Au-dela de 3 tampons d'un coup, un seul message les resume (ils restent tous dans le Carnet)
export function annoncerTampons(tampons) {
  const montres = tampons.length > 3 ? tampons.slice(0, 2) : tampons;
  for (const tp of montres) {
    afficherToast(`<span class="toast__tampon" aria-hidden="true">印</span><span><strong>Tampon obtenu : ${tp.nom}</strong><br>${tp.texte}</span>`);
  }
  if (tampons.length > 3) {
    afficherToast(`<span class="toast__tampon" aria-hidden="true">印</span><span><strong>+${tampons.length - 2} autres tampons !</strong><br>Retrouve-les dans Collection, onglet Carnet.</span>`);
  }
}
