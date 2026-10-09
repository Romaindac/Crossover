// ==========================================================
// CATALOGUE DES OBJETS POUR LE SERVEUR (outil, hors du jeu)
// Lancer avec : node js/outils/catalogue-sql.mjs
// Ecrit supabase/catalogue.sql : la liste des objets et de leurs
// fourchettes, pour que l'hotel des ventes refuse les objets impossibles,
// et la liste des persos avec leur rarete (echanges de cartes).
// Ecrit aussi supabase/a-coller.sql : schema.sql + catalogue, en un seul
// fichier a coller d'un coup dans Supabase.
// A relancer (et a recoller dans Supabase) si on change objets.js, les persos ou schema.sql.
// ==========================================================

import { writeFileSync, readFileSync } from "node:fs";
import { OBJETS } from "../donnees/objets.js";
import { PERSOS_JOUABLES } from "../donnees/persos.js";

export function catalogueSql() {
  const lignes = OBJETS.map((o) => {
    const json = JSON.stringify(o.lignes).replace(/'/g, "''");
    return `  ('${o.id}', '${o.rarete}', '${o.emplacement}', '${json}'::jsonb)`;
  });
  return `-- Fichier genere par node js/outils/catalogue-sql.mjs : ne pas modifier a la main.
-- A coller dans Supabase (SQL Editor) apres schema.sql.
insert into public.objets_catalogue (id, rarete, emplacement, lignes) values
${lignes.join(",\n")}
on conflict (id) do update set rarete = excluded.rarete, emplacement = excluded.emplacement, lignes = excluded.lignes;

-- Les persos et leur rarete (pour les echanges de cartes)
insert into public.persos_catalogue (id, rarete) values
${PERSOS_JOUABLES.map((p) => `  ('${p.id}', '${p.rarete}')`).join(",\n")}
on conflict (id) do update set rarete = excluded.rarete;
`;
}

// Tout en un : le schema puis le catalogue
export function toutSql() {
  const schema = readFileSync(new URL("../../supabase/schema.sql", import.meta.url), "utf8");
  return `-- CROSSOVER : tout le serveur en un seul fichier (genere par node js/outils/catalogue-sql.mjs).
-- Supabase > SQL Editor > New query : coller tout ce fichier, puis Run. Peut etre relance sans risque.

${schema}
${catalogueSql()}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL("../../supabase/catalogue.sql", import.meta.url), catalogueSql());
  writeFileSync(new URL("../../supabase/a-coller.sql", import.meta.url), toutSql());
  console.log(`supabase/catalogue.sql et supabase/a-coller.sql ecrits (${OBJETS.length} objets).`);
}
