// ==========================================================
// L'ARENE DES BOSS : un deck (ton equipe de 5) contre un boss
// geant. Chaque monde (un par edition, comme les autels) a 8 boss,
// des plus faibles aux Legendaires. Le premier KO d'un boss donne
// sa CARTE BOSS : le perso, avec la bordure Boss (seulement ici).
// Tous les chiffres a regler sont ici.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "./persos.js";
import { EDITIONS_PAR_ID } from "./boosters.js";
import { MONDES } from "./invocations.js";
import { CALIBRAGE_BOSS } from "./calibrage-arene.js";

export const BOSS_PAR_MONDE = 8;
const ORDRE = { epique: 1, legendaire: 2 };

// Niveau du boss k (0 a 7) du monde m (0 a 3) : il suit la campagne
// (le monde m s'ouvre a la fin du chapitre m)
export const niveauBoss = (m, k) => 3 + m * 7 + k;

// Le boss est un perso gonfle : ses PV et son ATQ sont multiplies, puis un
// coefficient par boss (calibrage-arene.js, ecrit par node js/outils/calibrer-arene.mjs)
// vise : equipe au niveau du boss, 2 etoiles, 80 % de victoire contre le premier
// boss du monde, 45 % contre le dernier.
export const pvBoss = (k) => 7 + 0.9 * k;
export const atqBoss = (k) => 2.2 + 0.12 * k;
export const victoireVisee = (k) => 0.8 - 0.05 * k;

// Les 8 boss d'un monde : les Epiques puis les Legendaires de l'edition
export function bossDuMonde(edition) {
  const series = EDITIONS_PAR_ID[edition].series;
  return PERSOS.filter((p) => series.includes(p.serie) && ORDRE[p.rarete])
    .sort((a, b) => ORDRE[a.rarete] - ORDRE[b.rarete] || series.indexOf(a.serie) - series.indexOf(b.serie) || a.nom.localeCompare(b.nom))
    .slice(-BOSS_PAR_MONDE)
    .map((p) => p.id);
}

export const idBoss = (persoId) => `boss_${persoId}`;
export const persoDuBoss = (bossId) => bossId.replace(/^boss_/, "");

// Tous les boss, enregistres comme des persos a part (le moteur de combat les retrouve par leur id)
export const BOSS_ARENE = MONDES.flatMap((monde, m) => bossDuMonde(monde.edition).map((id, k) => {
  const perso = PERSOS_PAR_ID[id];
  const c = CALIBRAGE_BOSS[idBoss(id)] ?? 1;
  const boss = {
    ...perso,
    id: idBoss(id),
    nom: perso.nom,
    boss: true,
    mods: { ...(perso.mods ?? {}), pv: (perso.mods?.pv ?? 1) * pvBoss(k) * c, atq: (perso.mods?.atq ?? 1) * atqBoss(k) * c },
  };
  PERSOS_PAR_ID[boss.id] = boss;
  return { id: boss.id, perso: id, monde: monde.edition, indexMonde: m, rang: k, niveau: niveauBoss(m, k) };
}));
export const BOSS_ARENE_PAR_ID = Object.fromEntries(BOSS_ARENE.map((b) => [b.id, b]));
export const bossDe = (edition) => BOSS_ARENE.filter((b) => b.monde === edition);

// ---------- Recompenses ----------
// Premier KO : la carte Boss, des invocations, une potion et de l'encre
export const recompensePremierKo = (b) => ({ encre: 120 + 40 * b.rang + 150 * b.indexMonde, invocations: 10, potion: true });
// Les KO suivants (coutent de l'energie) : un peu d'encre, des invocations, parfois une carte Boss en double
export const recompenseKo = (b) => ({ encre: 15 + 4 * b.rang + 10 * b.indexMonde, invocations: 2 });
export const CHANCE_CARTE_BOSS_REJOUE = 0.08;
export const CHANCE_POTION_REJOUE = 0.25;
