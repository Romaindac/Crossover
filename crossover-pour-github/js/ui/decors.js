// ==========================================================
// DECORS DE COMBAT (version manga premium)
// Plus de dessins figuratifs : des fonds abstraits comme sur
// les pages de manga. Trames de points en degrade, lignes de
// vitesse, sol en perspective et un grand kanji qui donne le ton.
// Le dessin fait 1600 x 900 ; l'horizon est a y = 600.
// ==========================================================

const ENCRE = "#17192d";

// Chaque decor : couleurs, kanji et petits elements propres
const AMBIANCES = {
  terrain: {
    kanji: "修行",          // shugyo : l'entrainement
    ciel: ["#efece4", "#dfe3e2"],
    sol: ["#e2dccd", "#cfc6b3"],
    trame: ENCRE,
    encreKanji: ENCRE,
    astre: { x: 1270, y: 190, r: 120, couleur: "#f3d67a" },
  },
  forteresse: {
    kanji: "鉄壁",          // teppeki : le mur de fer
    ciel: ["#e6e7ea", "#cfd4dc"],
    sol: ["#d6d4ce", "#bdb9b0"],
    trame: ENCRE,
    encreKanji: ENCRE,
    murs: true,
  },
  toits: {
    kanji: "暗殺",          // ansatsu : l'assassinat
    ciel: ["#1d2040", "#343a6b"],
    sol: ["#262a52", "#1a1d3b"],
    trame: "#f2f0ea",
    encreKanji: "#f2f0ea",
    astre: { x: 1240, y: 200, r: 105, couleur: "#f4ecd2" },
    nuit: true,
  },
  domaine: {
    kanji: "領域",          // ryoiki : le domaine
    ciel: ["#ebe6f2", "#d3c9e8"],
    sol: ["#ddd5ec", "#c7bce0"],
    trame: "#3c2a6e",
    encreKanji: "#3c2a6e",
    cercles: true,
  },
  brasier: {
    kanji: "伝説",          // densetsu : la legende
    ciel: ["#f6dcc0", "#eba487"],
    sol: ["#e6b896", "#cf8f6c"],
    trame: "#5a1d14",
    encreKanji: "#5a1d14",
    astre: { x: 800, y: 600, r: 300, couleur: "#f7cf7a" },
    braises: true,
  },
};

const degrade = (id, [haut, bas]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/></linearGradient>`;

// Trame de points dont la densite s'efface (masque en degrade radial)
function trameDegradee(id, couleur, cx, cy, rayon, opacite) {
  return `
    <pattern id="${id}-p" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="5.5" cy="5.5" r="2.3" fill="${couleur}" fill-opacity="${opacite}"/>
    </pattern>
    <radialGradient id="${id}-g" cx="${cx}" cy="${cy}" r="${rayon}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/>
    </radialGradient>
    <mask id="${id}-m"><rect width="1600" height="900" fill="url(#${id}-g)"/></mask>`;
}

// Lignes de vitesse depuis un point, plus denses sur les bords
function lignesDeVitesse(cx, cy, couleur, opacite) {
  let lignes = "";
  for (let i = 0; i < 70; i++) {
    const angle = (i / 70) * Math.PI * 2 + (i % 3) * 0.013;
    const debut = 330 + ((i * 37) % 120);
    const x1 = cx + Math.cos(angle) * debut;
    const y1 = cy + Math.sin(angle) * debut;
    const x2 = cx + Math.cos(angle) * 1400;
    const y2 = cy + Math.sin(angle) * 1400;
    const largeur = 1 + ((i * 7) % 4);
    lignes += `<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="${couleur}" stroke-width="${largeur}" stroke-opacity="${opacite}"/>`;
  }
  return `<g class="decor__vitesse">${lignes}</g>`;
}

// Sol : degrade, trame dense vers l'avant, lignes de perspective vers le centre
function sol(a) {
  let perspective = "";
  for (let i = -8; i <= 8; i++) {
    perspective += `<line x1="${800 + i * 30}" y1="600" x2="${800 + i * 260}" y2="900" stroke="${a.trame}" stroke-width="1.5" stroke-opacity="0.18"/>`;
  }
  for (const y of [640, 700, 790]) {
    perspective += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="${a.trame}" stroke-width="1.2" stroke-opacity="0.12"/>`;
  }
  return `
    <rect y="600" width="1600" height="300" fill="url(#d-sol)"/>
    <rect y="600" width="1600" height="300" fill="url(#d-trame-sol-p)" mask="url(#d-trame-sol-m)"/>
    ${perspective}
    <line x1="0" y1="600" x2="1600" y2="600" stroke="${a.nuit ? "#0b0c1c" : ENCRE}" stroke-width="4"/>`;
}

function dessiner(nom) {
  const a = AMBIANCES[nom] ?? AMBIANCES.terrain;
  let extras = "";

  if (a.astre) {
    extras += `
      <circle cx="${a.astre.x}" cy="${a.astre.y}" r="${a.astre.r}" fill="${a.astre.couleur}"/>
      <circle cx="${a.astre.x}" cy="${a.astre.y}" r="${a.astre.r}" fill="url(#d-trame-astre-p)" mask="url(#d-trame-astre-m)"/>`;
  }
  if (a.murs) {
    // Un rempart en aplat d'encre leger, sur toute la largeur, avec ses creneaux
    let creneaux = "M0 600 V430";
    for (let x = 0; x < 1600; x += 80) creneaux += ` H${x + 46} V400 H${x + 80} V430`;
    extras += `<path d="${creneaux} V600 Z" fill="${ENCRE}" fill-opacity="0.16"/>
      <path d="M0 520 H1600" stroke="${ENCRE}" stroke-opacity="0.12" stroke-width="2"/>`;
  }
  if (a.cercles) {
    extras += `<g class="decor__onde">${[110, 210, 310, 410, 510].map((r, i) =>
      `<circle cx="800" cy="300" r="${r}" fill="none" stroke="#5b3aa8" stroke-width="${3 - i * 0.4}" stroke-opacity="${0.5 - i * 0.08}" ${i % 2 ? 'stroke-dasharray="20 14"' : ""}/>`).join("")}</g>`;
  }
  if (a.nuit) {
    extras += [[120, 90], [300, 160], [470, 70], [640, 140], [900, 60], [1050, 130], [1450, 110], [1540, 260], [200, 300], [1000, 280]]
      .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 2 : 3}" fill="#f2f0ea" fill-opacity="${0.5 + (i % 3) * 0.2}"/>`).join("");
  }
  if (a.braises) {
    extras += [140, 330, 520, 700, 880, 1060, 1250, 1430].map((x, i) => `
      <circle cx="${x}" cy="880" r="${3 + (i % 3)}" fill="#f08a3c">
        <animate attributeName="cy" values="880;240" dur="${5 + (i % 4)}s" begin="${-i * 0.9}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="${5 + (i % 4)}s" begin="${-i * 0.9}s" repeatCount="indefinite"/>
      </circle>`).join("");
  }

  return `
    <defs>
      ${degrade("d-ciel", a.ciel)}
      ${degrade("d-sol", a.sol)}
      ${trameDegradee("d-trame-ciel", a.trame, 1600, 0, 1100, a.nuit ? 0.12 : 0.14)}
      ${trameDegradee("d-trame-sol", a.trame, 800, 980, 900, a.nuit ? 0.16 : 0.2)}
      ${trameDegradee("d-trame-astre", ENCRE, a.astre?.x ?? 0, (a.astre?.y ?? 0) + (a.astre?.r ?? 0), (a.astre?.r ?? 1) * 1.6, 0.18)}
    </defs>
    <rect width="1600" height="900" fill="url(#d-ciel)"/>
    <rect width="1600" height="900" fill="url(#d-trame-ciel-p)" mask="url(#d-trame-ciel-m)"/>
    ${extras}
    <text x="800" y="470" text-anchor="middle" font-family="'Dela Gothic One', 'Yu Gothic', sans-serif" font-size="440"
      fill="none" stroke="${a.encreKanji}" stroke-width="3" stroke-opacity="${a.nuit ? 0.22 : 0.14}" letter-spacing="40">${a.kanji}</text>
    ${lignesDeVitesse(800, 380, a.nuit ? "#f2f0ea" : ENCRE, a.nuit ? 0.07 : 0.06)}
    ${sol(a)}
  `;
}

// crepuscule = true pour la version "II" des paliers
// centre = true pour une case large et basse : on garde le milieu du decor
// (ciel, kanji, horizon) au lieu du bas
export function htmlDecor(nom, { crepuscule = false, centre = false } = {}) {
  return `
    <div class="decor decor--${nom}${crepuscule ? " decor--crepuscule" : ""}" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidY${centre ? "Mid" : "Max"} slice" xmlns="http://www.w3.org/2000/svg">${dessiner(nom)}</svg>
    </div>`;
}
