// ==========================================================
// STYLE DES SERIES
// Chaque manga a son cadre : deux couleurs et un motif, repris sur
// toutes ses cartes. On reconnait une famille d'un coup d'oeil ;
// la rarete, elle, se lit sur l'obi et sur l'eclat de la carte.
// motif : points, rayures, damier, vagues, etoiles, spirale, eclairs,
//         ecailles, croix, flammes (voir css/series.css)
// ==========================================================

export const STYLES_SERIES = {
  "Dragon Ball":          { abrege: "DB",   c1: "#f08a1c", c2: "#1f4fa8", motif: "etoiles" },
  "Naruto":               { abrege: "NRT",  c1: "#f2711c", c2: "#2b2b3a", motif: "spirale" },
  "One Piece":            { abrege: "OP",   c1: "#c8322d", c2: "#e9c46a", motif: "vagues" },
  "Pokémon":              { abrege: "PKM",  c1: "#d62f2f", c2: "#f4f4f4", motif: "points" },
  "Berserk":              { abrege: "BSK",  c1: "#7a1010", c2: "#1a1a1a", motif: "croix" },
  "Jujutsu Kaisen":       { abrege: "JJK",  c1: "#5b2a86", c2: "#12121c", motif: "eclairs" },
  "Demon Slayer":         { abrege: "DS",   c1: "#1f7a5a", c2: "#151515", motif: "damier" },
  "Hunter x Hunter":      { abrege: "HxH",  c1: "#2e8b3e", c2: "#e8e0c8", motif: "rayures" },
  "Bleach":               { abrege: "BLC",  c1: "#1b1b1b", c2: "#e8e8e8", motif: "rayures" },
  "My Hero Academia":     { abrege: "MHA",  c1: "#2a6fdb", c2: "#e63946", motif: "eclairs" },
  "L'Attaque des Titans": { abrege: "SNK",  c1: "#4a5a3a", c2: "#c9b48a", motif: "croix" },
  "Chainsaw Man":         { abrege: "CSM",  c1: "#e8590c", c2: "#1a1a1a", motif: "ecailles" },
  "Frieren":              { abrege: "FRN",  c1: "#7fb3c9", c2: "#e8dcc0", motif: "etoiles" },
  "Fairy Tail":           { abrege: "FT",   c1: "#d6336c", c2: "#f3d36b", motif: "flammes" },
  "Saint Seiya":          { abrege: "STS",  c1: "#d4a017", c2: "#1d3a8a", motif: "etoiles" },
  "Black Clover":         { abrege: "BC",   c1: "#14532d", c2: "#0f0f0f", motif: "croix" },
  "Solo Leveling":        { abrege: "SL",   c1: "#3b5bdb", c2: "#0b0b1a", motif: "eclairs" },
  "Fullmetal Alchemist":  { abrege: "FMA",  c1: "#b91c1c", c2: "#c9a227", motif: "spirale" },
  "Tokyo Ghoul":          { abrege: "TG",   c1: "#9f1239", c2: "#e5e5e5", motif: "ecailles" },
  "JoJo":                 { abrege: "JOJO", c1: "#7c3aed", c2: "#facc15", motif: "damier" },
  "Hell's Paradise":      { abrege: "HP",   c1: "#c2185b", c2: "#f3e5ab", motif: "flammes" },
  "Dandadan":             { abrege: "DDD",  c1: "#e6007e", c2: "#1de9b6", motif: "spirale" },
  "Kaiju n°8":            { abrege: "K8",   c1: "#1e88e5", c2: "#263238", motif: "ecailles" },
  "Spy x Family":         { abrege: "SxF",  c1: "#2e7d32", c2: "#f8bbd0", motif: "points" },
  "Blue Lock":            { abrege: "BL",   c1: "#1565c0", c2: "#e0f7fa", motif: "rayures" },
};

const PAR_DEFAUT = { abrege: "", c1: "#17192d", c2: "#f2f0ea", motif: "points" };
export const styleSerie = (serie) => STYLES_SERIES[serie] ?? PAR_DEFAUT;

// A poser sur un cadre de carte : les deux couleurs (variables CSS) et le motif
export const varsSerie = (serie) => `--s1: ${styleSerie(serie).c1}; --s2: ${styleSerie(serie).c2}`;
export const motifSerie = (serie) => styleSerie(serie).motif;
