// ==========================================================
// CATALOGUE DES OBJETS POUR LE SERVEUR (outil, hors du jeu)
// Lancer avec : node js/outils/catalogue-sql.mjs
// Ecrit supabase/catalogue.sql : la liste des objets et de leurs
// fourchettes, pour que l'hotel des ventes refuse les objets impossibles.
// A relancer (et a recoller dans Supabase) si on change objets.js.
// ==========================================================

import { writeFileSync } from "node:fs";
import { OBJETS } from "../donnees/objets.js";

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
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL("../../supabase/catalogue.sql", import.meta.url), catalogueSql());
  console.log(`supabase/catalogue.sql ecrit (${OBJETS.length} objets).`);
}
