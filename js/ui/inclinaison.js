// ==========================================================
// INCLINAISON DES CARTES
// La carte survolee s'incline vers la souris (ou le doigt) et son
// reflet la suit. Un seul ecouteur pour toute la page.
// ==========================================================

export function brancherInclinaison() {
  const reduit = matchMedia("(prefers-reduced-motion: reduce)");
  document.addEventListener("pointermove", (e) => {
    if (reduit.matches || e.pointerType === "touch") return;
    const carte = e.target.closest?.(".carte, .sachet");
    if (!carte) return;
    const r = carte.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    carte.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    carte.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    carte.style.setProperty("--mx", `${x * 100}%`);
    carte.style.setProperty("--my", `${y * 100}%`);
  }, { passive: true });
  document.addEventListener("pointerout", (e) => {
    const carte = e.target.closest?.(".carte, .sachet");
    if (!carte || carte.contains(e.relatedTarget)) return;
    for (const v of ["--rx", "--ry", "--mx", "--my"]) carte.style.removeProperty(v);
  });
}
