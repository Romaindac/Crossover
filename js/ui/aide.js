// ==========================================================
// PAGE D'AIDE « DEVENIR PLUS FORT »
// Ouverte depuis le bouton « ? » de la barre. Tous les chiffres
// viennent des fichiers de donnees : la page reste juste si on
// les regle.
// ==========================================================

import { RARETES, ORDRE_RARETES } from "../donnees/raretes.js";
import { AFFINITES, BONUS_AFFINITE } from "../donnees/roles.js";
import { BONUS_NIVEAU, BONUS_ETOILE, NIVEAU_MAX, ETOILES_MAX } from "../donnees/progression.js";
import { BONUS_EVEIL, EVEILS } from "../donnees/eveil.js";
import { NIVEAU_MAX_PIECE, BONUS_PAR_NIVEAU } from "../donnees/equipement.js";
import { BONUS_SERIE } from "../moteur/stats.js";
import { LIENS, VICTOIRES_DECOUVERTE, BONUS_PAR_NIVEAU_LIEN } from "../donnees/liens.js";
import { BONUS_HONNEUR } from "../donnees/hebdo.js";
import { COULEURS_AFFINITE, iconeRole } from "./cartes.js";

const pct = (x) => Math.round(x * 100);
const C = COULEURS_AFFINITE;

// Le cycle des affinites, dessine
export function schemaAffinites() {
  const rond = (x, y, a) => `
    <circle cx="${x}" cy="${y}" r="27" fill="${C[a]}" stroke="#17192d" stroke-width="3"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#fff">${AFFINITES[a]}</text>`;
  const fleche = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#17192d" stroke-width="3" marker-end="url(#pointe)"/>`;
  return `
    <svg class="aide__schema" viewBox="0 0 345 172" role="img" aria-label="Puissance bat Technique, Technique bat Vitesse, Vitesse bat Puissance. Esprit et Chaos se battent l'un l'autre.">
      <defs><marker id="pointe" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#17192d"/></marker></defs>
      ${fleche(97, 55, 134, 113)}${fleche(122, 138, 62, 138)}${fleche(42, 114, 68, 60)}
      ${rond(82, 32, "puissance")}${rond(150, 138, "technique")}${rond(30, 138, "vitesse")}
      ${fleche(238, 74, 280, 74)}${fleche(282, 96, 240, 96)}
      ${rond(210, 85, "esprit")}${rond(312, 85, "chaos")}
    </svg>`;
}

// La formation : 2 devant, 3 derriere
export function schemaFormation() {
  const place = (role, texte) => `<span class="aide__place">${iconeRole(role)}<span>${texte}</span></span>`;
  return `
    <div class="aide__formation" role="img" aria-label="Ligne avant : tank et attaquant. Ligne arrière : assassin, soutien, contrôle.">
      <span class="aide__ligne-nom">Avant</span>
      <div class="aide__ligne">${place("tank", "Tank")}${place("attaquant", "Attaquant")}</div>
      <span class="aide__ligne-nom">Arrière</span>
      <div class="aide__ligne">${place("assassin", "Assassin")}${place("soutien", "Soutien")}${place("controle", "Contrôle")}</div>
    </div>`;
}

export function htmlDevenirFort() {
  const eveilMax = EVEILS[EVEILS.length - 1];
  const tuile = (chiffre, titre, texte) => `
    <div class="aide__tuile">
      <span class="aide__chiffre">${chiffre}</span>
      <span class="aide__tuile-titre">${titre}</span>
      <span class="aide__tuile-texte">${texte}</span>
    </div>`;
  const etape = (n, titre, texte) => `<li class="aide__etape"><span class="aide__num">${n}</span><span><b>${titre}</b> ${texte}</span></li>`;
  return `
    <div class="aide">
      <section class="aide__section">
        <h3 class="aide__titre">Monter un perso</h3>
        <div class="aide__tuiles">
          ${tuile("×2", "Rareté", `à niveau égal, une Légendaire a 2 fois les PV et l'ATQ d'une Commune (${ORDRE_RARETES.slice().reverse().map((r) => `${RARETES[r].nom} ×${String(1 + RARETES[r].bonus).replace(".", ",")}`).join(", ")}).`)}
          ${tuile(`+${pct(BONUS_NIVEAU)} %`, `Niveau 1 à ${NIVEAU_MAX}`, "par niveau, en PV et ATQ. Chaque combat donne de l'XP, l'expédition aussi.")}
          ${tuile(`+${pct(BONUS_ETOILE)} %`, `Étoiles 1 à ${ETOILES_MAX}`, "par étoile. Les doublons de l'autel et des boosters, ou l'Atelier avec la poussière.")}
          ${tuile(`+${pct(BONUS_EVEIL)} %`, `Éveil I à ${["", "I", "II", "III", "IV"][EVEILS.length]}`, `par palier, sur toutes les stats, jusqu'au niveau ${eveilMax.niveauMax}, avec un talent au choix. Fragments et éclats.`)}
          ${tuile("4", "Emplacements", "arme, tenue, accessoire, relique. Le plus gros gain une fois le niveau maximum atteint.")}
        </div>
      </section>

      <section class="aide__section">
        <h3 class="aide__titre">S'équiper</h3>
        <ol class="aide__etapes">
          ${etape(1, "Chasse.", "Aventure, onglet Chasse : chaque victoire peut donner un objet. Plus la zone est avancée, meilleur il est.")}
          ${etape(2, "Équipe.", "Touche un perso, puis « Équiper le meilleur ». « Équiper toute l'équipe » fait les 5 d'un coup.")}
          ${etape(3, "Améliore.", `Collection, onglet Équipement : jusqu'au niveau ${NIVEAU_MAX_PIECE}, +${pct(BONUS_PAR_NIVEAU)} % sur toutes les lignes à chaque niveau. La retouche relance une ligne, et tu choisis le jet que tu gardes.`)}
          ${etape(4, "Vise les panoplies.", "2, 3 puis 4 pièces de la même panoplie sur un perso : le bonus à 4 pièces est un vrai effet en combat (bouclier, ultime renforcé…).")}
        </ol>
      </section>

      <section class="aide__section">
        <h3 class="aide__titre">Les synergies</h3>
        <div class="aide__duo">
          <div class="aide__bloc">
            <p class="aide__sous-titre">Placement</p>
            ${schemaFormation()}
            <p class="aide__texte">Les ennemis frappent d'abord la ligne avant en face d'eux. Seuls les assassins et certains ultimes atteignent la ligne arrière.</p>
          </div>
          <div class="aide__bloc">
            <p class="aide__sous-titre">Affinités : +${pct(BONUS_AFFINITE)} % de dégâts</p>
            ${schemaAffinites()}
            <p class="aide__texte">Regarde l'affinité des ennemis du prochain combat et amène les persos qui les dominent.</p>
          </div>
        </div>
        <div class="aide__tuiles aide__tuiles--trois">
          ${tuile(`+${pct(BONUS_SERIE[3].atq)} %`, "Même manga", `2 persos : ATQ +${pct(BONUS_SERIE[2].atq)} %. 3 persos : ATQ +${pct(BONUS_SERIE[3].atq)} % et PV +${pct(BONUS_SERIE[3].pv)} %.`)}
          ${tuile(`+${5 * BONUS_PAR_NIVEAU_LIEN} %`, `${LIENS.length} liens`, `Deux persos de mangas différents : le lien se découvre après ${VICTOIRES_DECOUVERTE} victoires ensemble, puis monte au niveau 5 (+${BONUS_PAR_NIVEAU_LIEN} % par niveau).`)}
          ${tuile(`+${BONUS_HONNEUR} %`, "Série à l'honneur", "Chaque semaine, une série gagne un bonus de PV et d'ATQ, et plus de butin en chasse.")}
        </div>
      </section>

      <section class="aide__section aide__section--reflexe">
        <h3 class="aide__titre">Le bon réflexe</h3>
        <p class="aide__texte">Écran Équipe : <b>« Équipe conseillée »</b> teste des centaines de combats simulés et propose la meilleure équipe contre la prochaine étape. Le panneau <b>Synergies</b>, juste en dessous, montre en direct les bonus actifs, les liens à portée, les affinités et les erreurs de placement. Commence par le conseil, puis ajuste avec les synergies.</p>
      </section>
    </div>`;
}
