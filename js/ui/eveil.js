// ==========================================================
// SCENE D'EVEIL : courte et spectaculaire
// Le portrait sur des lignes de vitesse dorees, le kanji 覚醒
// qui s'imprime, et l'onomatopee ゴゴゴ.
// ==========================================================

import { CHIFFRES_ROMAINS } from "../donnees/eveil.js";
import { htmlPortrait } from "./cartes.js";

export function jouerEveil(racine, perso, palier) {
  return new Promise((resoudre) => {
    const zone = document.createElement("div");
    zone.className = "scene-eveil";
    zone.setAttribute("role", "dialog");
    zone.setAttribute("aria-label", `${perso.nom} s'éveille : palier ${CHIFFRES_ROMAINS[palier]}`);
    zone.innerHTML = `
      <div class="scene-eveil__portrait">${htmlPortrait(perso)}</div>
      <p class="scene-eveil__kanji">覚醒<span>${CHIFFRES_ROMAINS[palier]}</span></p>
      <p class="scene-eveil__ono" aria-hidden="true">ゴゴゴ</p>
      <p class="scene-eveil__texte">${perso.nom} dépasse ses limites ! Niveau maximum : ${30 + 5 * palier}.</p>`;
    racine.appendChild(zone);
    const fermer = () => {
      zone.remove();
      resoudre();
    };
    zone.addEventListener("click", fermer);
    setTimeout(() => zone.isConnected && fermer(), 3200);
  });
}

// SCENE D'ASCENSION : la meme mise en scene, en rouge, avec le kanji 昇華
export function jouerAscension(racine, perso, palier) {
  return new Promise((resoudre) => {
    const zone = document.createElement("div");
    zone.className = "scene-eveil scene-eveil--ascension";
    zone.setAttribute("role", "dialog");
    zone.setAttribute("aria-label", `${perso.nom} : étoile rouge ${palier}`);
    zone.innerHTML = `
      <div class="scene-eveil__portrait">${htmlPortrait(perso)}</div>
      <p class="scene-eveil__kanji">昇華<span>${"★".repeat(palier)}</span></p>
      <p class="scene-eveil__ono" aria-hidden="true">ドン</p>
      <p class="scene-eveil__texte">${perso.nom} gagne sa ${palier === 1 ? "1re" : `${palier}e`} étoile rouge : +${palier * 10} % de PV et d'ATQ.</p>`;
    racine.appendChild(zone);
    const fermer = () => { zone.remove(); resoudre(); };
    zone.addEventListener("click", fermer);
    setTimeout(() => zone.isConnected && fermer(), 3200);
  });
}
