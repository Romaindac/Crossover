// ==========================================================
// PANNEAU SYNERGIES (ecran Equipe)
// Tout ce qui rend une equipe plus forte que la somme de ses persos,
// en direct : bonus de serie, liens, affinites contre le prochain
// combat, placement. Uniquement de l'affichage.
// ==========================================================

import { PERSOS_PAR_ID } from "../donnees/persos.js";
import { AFFINITES, DOMINE, BONUS_AFFINITE } from "../donnees/roles.js";
import { BONUS_SERIE } from "../moteur/stats.js";
import { LIENS, niveauLien, VICTOIRES_DECOUVERTE, BONUS_PAR_NIVEAU_LIEN } from "../donnees/liens.js";
import { serieDeLaSemaine, BONUS_HONNEUR } from "../donnees/hebdo.js";
import { styleSerie } from "../donnees/series.js";
import { possede, victoiresLien } from "../services/partie.js";
import { COULEURS_AFFINITE, iconeRole } from "./cartes.js";

const pct = (x) => Math.round(x * 100);
const nom = (id) => PERSOS_PAR_ID[id]?.nom ?? id;

const ICONES = {
  serie: '<path d="M4 5h7v14H4zM13 5h7v14h-7z" fill="none" stroke="currentColor" stroke-width="2"/>',
  lien: '<path d="M9 15l6-6M7.5 11.5l-2 2a3.5 3.5 0 005 5l2-2M16.5 12.5l2-2a3.5 3.5 0 00-5-5l-2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  affinite: '<path d="M12 3l8 15H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="2" fill="currentColor"/>',
  placement: '<rect x="3" y="4" width="8" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="4" width="8" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="5" height="6" rx="1.5" fill="currentColor"/><rect x="9.5" y="14" width="5" height="6" rx="1.5" fill="currentColor"/><rect x="16" y="14" width="5" height="6" rx="1.5" fill="currentColor"/>',
};
const icone = (cle) => `<svg class="synergie__icone" viewBox="0 0 24 24" aria-hidden="true">${ICONES[cle]}</svg>`;

// Une pastille : etat = "actif" (en place), "piste" (a portee) ou "danger"
const pastille = (etat, texte, detail = "", style = "") =>
  `<li class="pastille-syn pastille-syn--${etat}"${style ? ` style="${style}"` : ""}><span class="pastille-syn__texte">${texte}</span>${detail ? `<span class="pastille-syn__detail">${detail}</span>` : ""}</li>`;

// ---------- Series ----------
function blocSeries(ids) {
  const persos = ids.map((id) => PERSOS_PAR_ID[id]);
  const compte = {};
  for (const p of persos) compte[p.serie] = (compte[p.serie] ?? 0) + 1;
  const items = Object.entries(compte).sort((a, b) => b[1] - a[1]).map(([serie, n]) => {
    const s = styleSerie(serie);
    const style = `--s1: ${s.c1}; --s2: ${s.c2}`;
    if (n >= 3) return pastille("actif", `${serie} x${n}`, `ATQ +${pct(BONUS_SERIE[3].atq)} %, PV +${pct(BONUS_SERIE[3].pv)} % (maximum)`, style);
    if (n === 2) return pastille("actif", `${serie} x2`, `ATQ +${pct(BONUS_SERIE[2].atq)} %. Un 3e : ATQ +${pct(BONUS_SERIE[3].atq)} %, PV +${pct(BONUS_SERIE[3].pv)} %`, style);
    return pastille("piste", `${serie} x1`, `Un 2e perso ${s.abrege || serie} : ATQ +${pct(BONUS_SERIE[2].atq)} %`, style);
  });
  const honneur = serieDeLaSemaine();
  const nHonneur = compte[honneur] ?? 0;
  items.push(nHonneur
    ? pastille("actif", `À l'honneur : ${honneur}`, `${nHonneur} perso${nHonneur > 1 ? "s" : ""} à +${BONUS_HONNEUR} % de PV et d'ATQ cette semaine`)
    : pastille("piste", `À l'honneur : ${honneur}`, `Ses persos gagnent +${BONUS_HONNEUR} % de PV et d'ATQ cette semaine`));
  return items;
}

// ---------- Liens ----------
function blocLiens(ids) {
  const dans = new Set(ids);
  const items = [];
  const actifs = LIENS.filter((l) => dans.has(l.a) && dans.has(l.b));
  for (const l of actifs) {
    const v = victoiresLien(l.cle);
    const niv = niveauLien(v);
    const prochain = niv === 0 ? VICTOIRES_DECOUVERTE : VICTOIRES_DECOUVERTE + niv * 25;
    const barre = niv >= 5 ? 1 : Math.min(1, v / prochain);
    const detail = niv === 0
      ? `${nom(l.a)} + ${nom(l.b)} · ${v} / ${VICTOIRES_DECOUVERTE} victoires ensemble pour le découvrir`
      : `${nom(l.a)} + ${nom(l.b)} · niveau ${niv} / 5 : PV et ATQ +${niv * BONUS_PAR_NIVEAU_LIEN} %${niv < 5 ? ` · niveau suivant à ${prochain} victoires (${v})` : ""}`;
    items.push(`<li class="pastille-syn pastille-syn--${niv ? "actif" : "piste"}"><span class="pastille-syn__texte">« ${l.nom} »</span><span class="pastille-syn__detail">${detail}</span><span class="jauge-syn"><span style="--v: ${barre}"></span></span></li>`);
  }
  // Les liens a portee : un perso est dans l'equipe, l'autre dans ta collection
  const pistes = LIENS.filter((l) => (dans.has(l.a) !== dans.has(l.b)) && possede(dans.has(l.a) ? l.b : l.a))
    .sort((a, b) => victoiresLien(b.cle) - victoiresLien(a.cle)).slice(0, 4);
  for (const l of pistes) {
    const manque = dans.has(l.a) ? l.b : l.a;
    const v = victoiresLien(l.cle);
    items.push(pastille("piste", `Ajoute ${nom(manque)}`, `pour « ${l.nom} » avec ${nom(dans.has(l.a) ? l.a : l.b)}${v ? ` (${v} victoires déjà)` : ""}`));
  }
  if (!items.length) items.push(pastille("vide", "Aucun lien possible", "Les liens unissent 2 persos de mangas différents (Collection, onglet Liens)"));
  return items;
}

// ---------- Affinites contre le prochain combat ----------
function blocAffinites(ids, etape) {
  if (!etape) return [pastille("vide", "Pas de prochain combat", "")];
  const ennemis = etape.equipe.map((id) => PERSOS_PAR_ID[id]).filter(Boolean);
  const miens = ids.map((id) => PERSOS_PAR_ID[id]);
  const items = [];
  for (const p of miens) {
    const cibles = ennemis.filter((e) => DOMINE[p.affinite]?.includes(e.affinite));
    if (cibles.length) items.push(pastille("actif", `${p.nom} frappe fort`, `+${pct(BONUS_AFFINITE)} % contre ${cibles.map((e) => e.nom).join(", ")}`, `--aff: ${COULEURS_AFFINITE[p.affinite]}`));
  }
  for (const e of ennemis) {
    const cibles = miens.filter((p) => DOMINE[e.affinite]?.includes(p.affinite));
    if (cibles.length >= 2) items.push(pastille("danger", `${e.nom} te menace`, `+${pct(BONUS_AFFINITE)} % contre ${cibles.map((p) => p.nom).join(", ")}`, `--aff: ${COULEURS_AFFINITE[e.affinite]}`));
  }
  if (!items.length) items.push(pastille("vide", "Match neutre", "Aucune affinité ne joue : ni avantage, ni danger"));
  return items;
}

// ---------- Placement ----------
function blocPlacement(equipe, vises) {
  const items = [];
  const vides = equipe.filter((id) => !id).length;
  if (vides) items.push(pastille("danger", `${vides} place${vides > 1 ? "s" : ""} vide${vides > 1 ? "s" : ""}`, "Il faut 5 persos pour combattre"));
  const role = (i) => PERSOS_PAR_ID[equipe[i]]?.role;
  const avant = [0, 1], arriere = [2, 3, 4];
  const roles = equipe.filter(Boolean).map((id) => PERSOS_PAR_ID[id].role);
  if (!roles.includes("tank")) items.push(pastille("danger", "Pas de tank", "Un tank devant encaisse les coups à la place des plus fragiles"));
  for (const i of arriere) if (role(i) === "tank") items.push(pastille("piste", `${nom(equipe[i])} est derrière`, "Un tank protège mieux en ligne avant"));
  for (const i of avant) if (role(i) === "assassin") items.push(pastille("danger", `${nom(equipe[i])} est devant`, "Un assassin est fragile : derrière, il frappe directement la ligne arrière ennemie"));
  for (const i of avant) if (role(i) === "soutien") items.push(pastille("danger", `${nom(equipe[i])} est exposé`, "Un soutien soigne mieux à l'abri en ligne arrière"));
  if (roles.length === 5 && !roles.some((r) => r === "soutien" || r === "controle")) items.push(pastille("piste", "Ni soutien ni contrôle", "Un soin ou un étourdissement change souvent l'issue d'un combat"));
  for (const i of avant) if ((vises?.[i]?.length ?? 0) >= 3) items.push(pastille("danger", `${nom(equipe[i])} visé par ${vises[i].length}`, `Au début du combat : ${vises[i].join(", ")}`));
  if (!items.length) items.push(pastille("actif", "Placement solide", "Tank devant, fragiles à l'abri : rien à redire"));
  return items;
}

export function htmlSynergies({ equipe, etape, vises }) {
  const ids = equipe.filter(Boolean);
  if (!ids.length) return '<p class="case__aide">Place des persos pour voir leurs synergies.</p>';
  const bloc = (cle, titre, items, aide) => `
    <div class="synergie synergie--${cle}">
      <h3 class="synergie__titre">${icone(cle)}${titre}</h3>
      <ul class="synergie__liste">${items.join("")}</ul>
      ${aide ? `<p class="synergie__aide">${aide}</p>` : ""}
    </div>`;
  const legende = `Cycle : ${["puissance", "technique", "vitesse"].map((a) => `<b style="--aff: ${COULEURS_AFFINITE[a]}">${AFFINITES[a]}</b>`).join(" › ")} › ${AFFINITES.puissance}. <b style="--aff: ${COULEURS_AFFINITE.esprit}">${AFFINITES.esprit}</b> et <b style="--aff: ${COULEURS_AFFINITE.chaos}">${AFFINITES.chaos}</b> se battent l'un l'autre.`;
  return `
    <div class="synergies">
      ${bloc("serie", "Séries", blocSeries(ids))}
      ${bloc("lien", "Liens", blocLiens(ids))}
      ${bloc("affinite", "Affinités contre le prochain combat", blocAffinites(ids, etape), legende)}
      ${bloc("placement", "Placement", blocPlacement(equipe, vises), `${iconeRole("tank")} devant · ${iconeRole("assassin")} ${iconeRole("soutien")} derrière`)}
    </div>`;
}

