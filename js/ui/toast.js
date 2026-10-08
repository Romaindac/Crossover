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
export function annoncerTampons(tampons) {
  for (const tp of tampons) {
    afficherToast(`<span class="toast__tampon" aria-hidden="true">印</span><span><strong>Tampon obtenu : ${tp.nom}</strong><br>${tp.texte}</span>`);
  }
}
