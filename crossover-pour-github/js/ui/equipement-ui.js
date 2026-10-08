// ==========================================================
// EQUIPEMENT A L'ECRAN
// Les 4 emplacements d'un perso, les objets, et la fenetre
// pour choisir une piece (avec la comparaison des stats).
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES } from "../donnees/raretes.js";
import { EMPLACEMENTS, ORDRE_EMPLACEMENTS, NOMS_STATS } from "../donnees/equipement.js";
import { PANOPLIES } from "../donnees/panoplies.js";
import { ZONES } from "../donnees/zones.js";
import { objetDe, nomPiece, valeurLigne, comptesPanoplies, qualiteJet, ligneParfaite, pieceParfaite } from "../moteur/equipement.js";
import { inventaire, piecesDe, equiperPiece, retirerPiece, peutPorter, progressionDe } from "../services/partie.js";

const ICONES = {
  arme: '<path d="M14 4h6v6l-9 9-6-6z"/><path d="M4 20l3-3"/>',
  tenue: '<path d="M8 3l4 3 4-3 4 4-3 3v10H7V10L4 7z"/>',
  accessoire: '<circle cx="12" cy="13" r="6.5"/><path d="M9 4h6l-1.5 2.6h-3z"/>',
  relique: '<path d="M12 3l7 5-2.7 9H7.7L5 8z"/><path d="M12 3v14M5 8l7 3 7-3"/>',
};

export function iconeEmplacement(emplacement) {
  return `<svg class="icone-emplacement" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONES[emplacement]}</svg>`;
}

// "+12" ou "+3,5 %"
export function texteStat(stat, valeur) {
  const nombre = String(Math.round(valeur * 10) / 10).replace(".", ",");
  return /Pct$|butin/.test(stat) ? `+${nombre} %` : `+${nombre}`;
}

const nomCourt = (stat) => NOMS_STATS[stat].replace(" %", "");
export const ligneTexte = (piece, l) => `${texteStat(l.stat, valeurLigne(piece, l))} ${nomCourt(l.stat)}`;

// Les bonus de panoplie actifs pour une liste de pieces
export function htmlPanopliesActives(pieces) {
  return Object.entries(comptesPanoplies(pieces))
    .filter(([, n]) => n >= 2)
    .map(([cle, n]) => {
      const p = PANOPLIES[cle];
      const actifs = [2, 3, 4].filter((k) => n >= k).map((k) => p.textes[k]).join(", ");
      return `<li><strong>${p.nom}</strong> (${n}/4) : ${actifs}</li>`;
    })
    .join("");
}

// Les 4 emplacements d'un perso, cliquables
export function htmlEmplacements(persoId) {
  const portees = piecesDe(persoId);
  const actifs = htmlPanopliesActives(portees);
  return `
    <div class="equipement-perso">
      <p class="detail__type">Équipement</p>
      <div class="emplacements">
        ${ORDRE_EMPLACEMENTS.map((e) => {
          const piece = portees.find((p) => p.emplacement === e);
          return `
            <button type="button" class="emplacement ${piece ? `emplacement--plein piece--${piece.rarete}` : ""}"
              data-action="emplacement" data-perso="${persoId}" data-emplacement="${e}"
              aria-label="${EMPLACEMENTS[e].nom} : ${piece ? `${nomPiece(piece)}, ${RARETES[piece.rarete].nom}` : "vide"}. Changer.">
              ${iconeEmplacement(e)}
              <span class="emplacement__nom">${piece ? nomPiece(piece) : EMPLACEMENTS[e].nom}</span>
              <span class="emplacement__stat">${piece ? `${ligneTexte(piece, piece.lignes[0])}${piece.niveau ? `, +${piece.niveau}` : ""}` : "Vide"}</span>
            </button>`;
        }).join("")}
      </div>
      ${actifs ? `<ul class="ensembles-actifs">${actifs}</ul>` : ""}
      <button type="button" class="bouton-texte" data-action="equiper-meilleur" data-perso="${persoId}">Équiper le meilleur</button>
    </div>`;
}

// Ou trouver un objet
export function texteOrigine(objet) {
  if (objet.zone === 6) return `Tour des Mille Volumes, étage 30 et plus${objet.rarete === "legendaire" ? " (boss, étage 50 et plus)" : ""}`;
  const zone = ZONES.find((z) => z.id === objet.zone);
  const boss = objet.rarete === "epique" || objet.rarete === "legendaire";
  return `${zone.nom}${boss ? `, boss : ${zone.boss.nom}` : ""}`;
}

// Description complete d'une piece (ou d'un objet du catalogue si piece = null)
export function htmlDetailsPiece(piece, { comparaison = null, objet = null } = {}) {
  const o = objet ?? objetDe(piece);
  const lignes = piece
    ? piece.lignes.map((l, i) => ({ texte: texteStat(l.stat, valeurLigne(piece, l)), stat: l.stat, i }))
    : o.lignes.map(([stat, min, max]) => ({ texte: `${texteStat(stat, min).replace(" %", "")} à ${texteStat(stat, max).slice(1)}`, stat }));
  const valeurDans = (p, stat) => (p ? p.lignes.filter((l) => l.stat === stat).reduce((s, l) => s + valeurLigne(p, l), 0) : 0);
  const qualite = piece ? Math.round(qualiteJet(piece) * 100) : null;

  return `
    <div class="piece-details ${piece && pieceParfaite(piece) ? "piece-details--parfaite" : ""}">
      <p class="piece-details__nom">${o.nom}${piece?.niveau ? ` <span>+${piece.niveau}</span>` : ""}${piece && pieceParfaite(piece) ? ' <span class="tampon-parfait" title="Objet parfait">完璧</span>' : ""}</p>
      <p class="piece-details__meta">
        <span class="obi-rarete obi-rarete--${o.rarete} obi-rarete--pastille">${RARETES[o.rarete].nom}</span>
        <span>${EMPLACEMENTS[o.emplacement].nom}, niveau ${o.niveau}</span>
        ${o.panoplie ? `<span>Panoplie ${PANOPLIES[o.panoplie].nom}</span>` : ""}
      </p>
      <ul class="piece-details__stats">
        ${lignes.map((l, k) => {
          let diff = "";
          if (piece && comparaison !== null && k === 0) {
            const d = valeurDans(piece, l.stat) - valeurDans(comparaison, l.stat);
            if (Math.abs(d) >= 0.05) diff = `<span class="diff ${d > 0 ? "diff--plus" : "diff--moins"}">${d > 0 ? "+" : ""}${String(Math.round(d * 10) / 10).replace(".", ",")}</span>`;
          }
          const parfaite = piece && ligneParfaite(piece, k);
          const sublimee = piece && piece.sublime === k;
          return `<li class="${k === 0 ? "principale" : ""} ${parfaite ? "ligne-parfaite" : ""}"><span>${NOMS_STATS[l.stat]}${sublimee ? ' <span class="marque-parfaite marque-sublimee" title="Sublimée à l\'encre sacrée">Sublimée</span>' : parfaite ? ' <span class="marque-parfaite" title="Jet parfait">Max</span>' : ""}</span><span>${l.texte}${diff}</span></li>`;
        }).join("")}
      </ul>
      ${o.effet ? `<p class="piece-details__effet">${o.effet.texte}</p>` : ""}
      ${qualite !== null ? `<p class="piece-details__jet">Qualité du jet : ${qualite} %${qualite >= 100 ? ", jet parfait !" : qualite >= 90 ? ", excellent jet" : ""}</p>` : ""}
      <p class="piece-details__texte">« ${o.texte} »</p>
    </div>`;
}

// Fenetre de choix d'une piece pour un emplacement. apres() est appelee apres un changement.
export function ouvrirChoixPiece(racine, persoId, emplacement, apres = () => {}) {
  const perso = PERSOS_PAR_ID[persoId];
  const niveauPerso = progressionDe(persoId).niveau;
  const actuelle = piecesDe(persoId).find((p) => p.emplacement === emplacement) ?? null;
  const candidates = inventaire()
    .filter((p) => p.emplacement === emplacement && p.uid !== actuelle?.uid)
    .sort((a, b) => (peutPorter(persoId, b) ? 1 : 0) - (peutPorter(persoId, a) ? 1 : 0)
      || RARETES[b.rarete].ordre - RARETES[a.rarete].ordre || b.niveau - a.niveau);

  const zone = document.createElement("div");
  zone.className = "voile voile--piece";
  zone.innerHTML = `
    <div class="resultat choix-piece" role="dialog" aria-modal="true" aria-label="${EMPLACEMENTS[emplacement].nom} de ${perso.nom}">
      <h2 class="choix-piece__titre">${EMPLACEMENTS[emplacement].nom} de ${perso.nom} <span>niveau ${niveauPerso}</span></h2>
      ${actuelle ? `
        <div class="choix-piece__actuelle">
          <p class="detail__type">Portée actuellement</p>
          ${htmlDetailsPiece(actuelle)}
          <button type="button" class="bouton bouton--clair bouton--petit-texte" data-choix="retirer" data-uid="${actuelle.uid}">Retirer</button>
        </div>` : ""}
      <p class="detail__type">${candidates.length ? `${candidates.length} pièce${candidates.length > 1 ? "s" : ""} pour cet emplacement` : "Aucune autre pièce pour cet emplacement. Va chasser pour en trouver !"}</p>
      <ul class="choix-piece__liste">
        ${candidates.map((p) => {
          const possible = peutPorter(persoId, p);
          return `
          <li class="choix-piece__ligne piece--${p.rarete} ${possible ? "" : "choix-piece__ligne--bloquee"}">
            ${htmlDetailsPiece(p, { comparaison: actuelle })}
            <div class="choix-piece__action">
              ${p.porteur ? `<span class="case__aide">Portée par ${PERSOS_PAR_ID[p.porteur]?.nom ?? "?"}</span>` : ""}
              ${possible
                ? `<button type="button" class="bouton bouton--obi bouton--petit-texte" data-choix="equiper" data-uid="${p.uid}">Équiper</button>`
                : `<span class="choix-piece__requis">Niveau ${objetDe(p).niveau} requis</span>`}
            </div>
          </li>`;
        }).join("")}
      </ul>
      <div class="resultat__actions">
        <button type="button" class="bouton bouton--clair" data-choix="fermer">Fermer</button>
      </div>
    </div>`;
  racine.appendChild(zone);
  zone.querySelector("[data-choix='fermer']").focus();

  const fermer = () => {
    zone.remove();
    document.removeEventListener("keydown", clavier);
  };
  const clavier = (e) => {
    if (e.key === "Escape") fermer();
  };
  document.addEventListener("keydown", clavier);

  zone.addEventListener("click", (e) => {
    if (e.target === zone) return fermer();
    const cible = e.target.closest("[data-choix]");
    if (!cible) return;
    if (cible.dataset.choix === "equiper") equiperPiece(cible.dataset.uid, persoId);
    if (cible.dataset.choix === "retirer") retirerPiece(cible.dataset.uid);
    fermer();
    if (cible.dataset.choix !== "fermer") apres();
  });
}
