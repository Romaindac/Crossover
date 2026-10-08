// ==========================================================
// JEU EN LIGNE (Supabase)
// L'adresse du projet et la cle « anon public » sont faites pour etre
// publiques : la securite repose sur les regles de supabase/schema.sql.
// Vides : le jeu fonctionne sans compte ni classement.
// ==========================================================

export const SUPABASE_URL = "";
export const SUPABASE_CLE = "";

export const enLigneDisponible = () => Boolean(SUPABASE_URL && SUPABASE_CLE);
