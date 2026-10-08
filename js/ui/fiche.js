// ==========================================================
// FICHE D'UN PERSO
// Portrait, rarete, role, affinite, niveau, etoiles, stats,
// passif et ultime. Utilisee par l'equipe et la collection.
// ==========================================================

import { ROLES, AFFINITES, DOMINE, REGLES_ROLES } from "../donnees/roles.js";
import { ETOILES_MAX, xpPourNiveau, doublonsPourEtoile } from "../donnees/progression.js";
import { EVEILS, TALENTS, CHIFFRES_ROMAINS, niveauMaxDe, COUT_CHANGER_TALENT } from "../donnees/eveil.js";
import { ressources, eclats } from "../services/partie.js";
import { calculerStatsFinales } from "../moteur/stats.js";
import { htmlPortrait, htmlObi, htmlEtoiles, iconeRole, COULEURS_AFFINITE } from "./cartes.js";
import { htmlEmplacements } from "./equipement-ui.js";
import { piecesDe } from "../services/partie.js";

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");

export function texteAffinite(affinite) {
  const domine = DOMINE[affinite].map((a) => AFFINITES[a]).join(", ");
  const dominePar = Object.keys(DOMINE).filter((a) => DOMINE[a].includes(affinite)).map((a) => AFFINITES[a]).join(", ");
  return domine === dominePar
    ? `Duo avec ${domine} : chacun fait +25 % de dégâts à l'autre.`
    : `+25 % de dégâts contre ${domine}. Subit +25 % de ${dominePar}.`;
}

// avecDoublons : affiche aussi la progression vers l'etoile suivante
// avecEquipement : affiche les 4 emplacements (pour un perso possede)
export function htmlFiche(perso, prog, { avecDoublons = false, avecEquipement = true } = {}) {
  const equipement = avecEquipement ? piecesDe(perso.id) : [];
  const stats = calculerStatsFinales(perso, { niveau: prog.niveau, etoiles: prog.etoiles, equipement, eveil: prog.eveil ?? 0, talents: prog.talents ?? [] });
  const auMax = prog.niveau >= niveauMaxDe(prog);
  const besoin = xpPourNiveau(prog.niveau);
  const etoilesMax = prog.etoiles >= ETOILES_MAX;

  return `
    <div class="detail__haut" style="--aff: ${COULEURS_AFFINITE[perso.affinite]}">
      <div class="detail__visuel">${htmlPortrait(perso)}${htmlObi(perso)}</div>
      <div>
        <p class="detail__serie">${perso.serie}</p>
        <h2 class="detail__nom">${perso.nom}</h2>
        <p class="detail__role">${iconeRole(perso.role)} ${ROLES[perso.role].nom}</p>
        <p class="detail__aide">${REGLES_ROLES[perso.role]}</p>
        <p class="detail__affinite"><span class="pastille"></span>${AFFINITES[perso.affinite]}</p>
        <p class="detail__aide">${texteAffinite(perso.affinite)}</p>
      </div>
    </div>
    <div class="detail__progression">
      <div class="detail__niveau">
        <span><strong>Niveau ${prog.niveau}</strong>${auMax ? " (maximum)" : ""}${prog.eveil ? ` <span class="badge-eveil">覚醒 ${CHIFFRES_ROMAINS[prog.eveil]}</span>` : ""}</span>
        ${htmlEtoiles(prog.etoiles)}
      </div>
      <span class="barre-xp" role="img" aria-label="${auMax ? "Niveau maximum" : `${prog.xp} points d'expérience sur ${besoin}`}">
        <span class="barre-xp__rempli" style="--xp: ${auMax ? 1 : prog.xp / besoin}"></span>
      </span>
      <span class="detail__xp">${auMax ? "Niveau maximum atteint" : `${nombre(prog.xp)} / ${nombre(besoin)} XP`}</span>
      ${avecDoublons ? `<span class="detail__xp">${etoilesMax ? "Étoiles au maximum : les doublons donnent de l'encre." : `Doublons : ${prog.doublons} sur ${doublonsPourEtoile(prog.etoiles)} pour la ${prog.etoiles + 1}e étoile.`}</span>` : ""}
    </div>
    <dl class="detail__stats">
      <div><dt>PV</dt><dd>${nombre(stats.pv)}</dd></div>
      <div><dt>ATQ</dt><dd>${stats.atq}</dd></div>
      <div><dt>DEF</dt><dd>${stats.def}</dd></div>
      <div><dt>VIT</dt><dd>${stats.vit}</dd></div>
    </dl>
    ${avecEquipement ? htmlEveil(perso, prog) : ""}
    ${avecEquipement ? htmlEmplacements(perso.id) : ""}
    <div class="detail__competence">
      <p class="detail__type">Passif</p>
      <p class="detail__titre-comp">${perso.passif.nom}</p>
      <p>${perso.passif.description}.</p>
    </div>
    <div class="detail__competence detail__competence--ultime">
      <p class="detail__type">Ultime</p>
      <p class="detail__titre-comp">${perso.ultime.nom}</p>
      <p>${perso.ultime.description}.</p>
    </div>
  `;
}

// ---------- L'eveil dans la fiche ----------
export function htmlEveil(perso, prog) {
  const eveil = prog.eveil ?? 0;
  if (prog.niveau < 30 && !eveil) return "";
  const suivant = EVEILS[eveil];
  const r = ressources();
  const conditions = suivant ? [
    [prog.niveau >= niveauMaxDe(prog), `Niveau ${niveauMaxDe(prog)}`],
    [prog.etoiles >= suivant.etoiles, `${suivant.etoiles} étoiles`],
    [r.fragments >= suivant.fragments, `${suivant.fragments} fragments d'éveil (tu en as ${r.fragments})`],
    [eclats() >= suivant.eclats, `${suivant.eclats.toLocaleString("fr-FR")} éclats`],
  ] : [];
  const pret = suivant && conditions.every(([ok]) => ok);
  const talents = TALENTS[perso.role];
  return `
    <div class="eveil-fiche">
      <p class="detail__type">Éveil ${eveil ? `: palier ${CHIFFRES_ROMAINS[eveil]}` : ""}</p>
      ${suivant ? `
        <ul class="eveil-fiche__conditions">
          ${conditions.map(([ok, texte]) => `<li class="${ok ? "ok" : ""}">${ok ? "✓" : "○"} ${texte}</li>`).join("")}
        </ul>
        <button type="button" class="bouton bouton--obi bouton--petit-texte" data-action="eveiller" data-perso="${perso.id}" ${pret ? "" : "disabled"}>Éveil ${CHIFFRES_ROMAINS[eveil + 1]} : niveau max ${suivant.niveauMax}</button>`
        : '<p class="case__aide">Éveil complet : niveau 50 atteint.</p>'}
      ${eveil ? `
        <div class="talents">
          ${Array.from({ length: eveil }, (_, i) => {
            const choix = prog.talents?.[i];
            return `
              <div class="talents__palier">
                <span class="talents__numero">${CHIFFRES_ROMAINS[i + 1]}</span>
                ${["a", "b"].map((c) => `
                  <button type="button" class="talent ${choix === c ? "talent--choisi" : ""}" data-action="talent" data-perso="${perso.id}" data-palier="${i}" data-choix="${c}" ${choix === c ? "disabled" : ""}>
                    <strong>${talents[c].nom}</strong><span>${talents[c].texte}</span>
                  </button>`).join("")}
              </div>`;
          }).join("")}
          <p class="case__aide">Choisir un talent est gratuit ; en changer coûte ${COUT_CHANGER_TALENT} éclats.</p>
        </div>` : ""}
    </div>`;
}
