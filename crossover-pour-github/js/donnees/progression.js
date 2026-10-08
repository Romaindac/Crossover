// ==========================================================
// PROGRESSION ET ECONOMIE
// Tous les chiffres a regler sont ici, au meme endroit.
// ==========================================================

// ---------- Depart du joueur ----------
export const PERSOS_DE_DEPART = ["ronflex", "gon", "sakura", "megumi"];
export const HEROS_AU_CHOIX = ["naruto", "luffy", "tanjiro"];
export const ENCRE_DE_DEPART = 1000;

// ---------- Niveaux ----------
export const NIVEAU_MAX = 30;
export const BONUS_NIVEAU = 0.03;              // +3 % par niveau
// XP pour passer au niveau suivant : la courbe se raidit avec le niveau
export const xpPourNiveau = (niveau) => Math.round(35 * niveau ** 1.5);
export const xpCombat = (palier, victoire) => (victoire ? 40 + 10 * palier : 15);
export const PART_XP_RESERVE = 0.25;   // les persos hors de l'equipe gagnent 25 % de l'XP

// ---------- Etoiles ----------
export const ETOILES_MAX = 5;
export const BONUS_ETOILE = 0.06;              // +6 % par etoile au-dela de la premiere
export const doublonsPourEtoile = (etoiles) => etoiles;   // 1 doublon pour la 2e, 2 pour la 3e...
export const ENCRE_PAR_DOUBLON_EN_TROP = 30;

// ---------- Encre gagnee en combat ----------
export const encreCombat = (palier, victoire, premiereVictoire) => {
  if (!victoire) return 2;
  return premiereVictoire ? 80 + 40 * palier : 2 + palier;
};

// ---------- Tirages ----------
export const COUT_TIRAGE = 100;
export const COUT_TIRAGE_X10 = 900;
export const PITIE_LEGENDAIRE = 60;          // Legendaire garanti au 60e tirage sans Legendaire

// ---------- Expedition (l'equipe s'entraine seule, meme hors du jeu) ----------
export const EXPEDITION_COMBATS_PAR_HEURE = 4;    // un combat virtuel toutes les 15 minutes
export const EXPEDITION_HEURES_MAX = 12;          // au-dela, l'expedition est pleine

// ---------- Missions du jour ----------
export const MISSIONS_PAR_JOUR = 3;
export const BONUS_TOUTES_MISSIONS = 60;
