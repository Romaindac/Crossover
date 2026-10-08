// ==========================================================
// JEU EN LIGNE (Supabase)
// L'adresse du projet et la cle publique (« publishable » ou ancienne « anon ») sont faites pour etre
// publiques : la securite repose sur les regles de supabase/schema.sql.
// Vides : le jeu fonctionne sans compte ni classement.
// ==========================================================

export const SUPABASE_URL = "https://cqymvhwaiafjoycbslvr.supabase.co";
export const SUPABASE_CLE = "";

export const enLigneDisponible = () => Boolean(SUPABASE_URL && SUPABASE_CLE);
