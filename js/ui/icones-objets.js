// ==========================================================
// ICONES DES OBJETS : une par type d'objet (epee, kimono, anneau...)
// Meme style que les icones d'emplacement : trait d'encre, rempli de
// blanc par la tuile. ICONE_DE_OBJET relie chaque objet a son type.
// ==========================================================

const DESSINS = {
  epee: '<path d="M18.5 3.5L21 3l-.5 2.5L9 17l-2-2z"/><path d="M5 13l6 6M6.5 17.5L4 20"/>',
  dague: '<path d="M16 4l3 1 1 3-8 8-4-4z"/><path d="M6 12l6 6M7 17l-3 3"/>',
  baton: '<rect x="10.7" y="1.5" width="2.6" height="21" rx="1.3" transform="rotate(40 12 12)"/><path d="M15.5 6.5l2 2M7 15.5l2 2"/>',
  sceptre: '<path d="M5 20l9-9"/><circle cx="16.5" cy="7.5" r="3.5"/><path d="M16.5 2v1.5M22 7.5h-1.5M20.4 3.6l-1 1"/>',
  gants: '<path d="M7 11V6a1.5 1.5 0 013 0v4M10 10V5a1.5 1.5 0 013 0v5M13 10V6a1.5 1.5 0 013 0v6c0 4-2.5 7-6 7s-5-2-5-5v-2a1.5 1.5 0 013 0"/>',
  lance: '<path d="M4 20L15 9"/><path d="M13 7l7-4-4 7-1.5.5-2-2z"/><path d="M11 13l-2-2"/>',
  masse: '<path d="M4 20l8-8"/><circle cx="15.5" cy="8.5" r="4"/><path d="M15.5 2.5v2M21.5 8.5h-2M19.7 4.3l-1.4 1.4"/>',
  hache: '<path d="M6 21L15 6"/><path d="M12 5c3-2 7-1 8 2-2 0-4 1-5 4z"/>',
  arbalete: '<path d="M3 9c4-4 14-4 18 0"/><path d="M3 9l9 4 9-4"/><path d="M12 6v15M10 19h4"/>',
  shuriken: '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/><circle cx="12" cy="12" r="1.8"/>',
  eventail: '<path d="M12 20L3 9a12 12 0 0118 0z"/><path d="M12 20L7.5 6M12 20V5M12 20l4.5-14"/>',
  plume: '<path d="M20 3C12 4 7 9 5 17l2 1c1-3 3-6 6-8"/><path d="M20 3c-1 7-5 11-11 13"/><path d="M5 17l-2 4"/>',
  livre: '<path d="M4 4h7a2 2 0 012 2v14a2 2 0 00-2-2H4z"/><path d="M20 4h-7a2 2 0 00-2 2v14a2 2 0 012-2h7z"/>',
  marquePage: '<path d="M7 3h10v18l-5-4-5 4z"/><path d="M10 8h4"/>',
  kimono: '<path d="M8 3l4 5 4-5 5 4-3 3v11H6V10L3 7z"/><path d="M12 8l-3 6M12 8l3 6M6 14h12"/>',
  manteau: '<path d="M9 3h6l5 5-2 2v11H6V10L4 8z"/><path d="M12 3v18M9 3l3 5 3-5"/>',
  tunique: '<path d="M8 3l4 2 4-2 4 4-3 3v11H7V10L4 7z"/><path d="M9 14h6"/>',
  armure: '<path d="M6 4h12l2 4-2 2v8l-6 3-6-3v-8L4 8z"/><path d="M12 4v17M6 10h12"/>',
  bouclier: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M12 7v10M8 11h8"/>',
  bandeau: '<path d="M3 10c6-3 12-3 18 0v4c-6-3-12-3-18 0z"/><path d="M19 13l2 6M17 13l1 6"/>',
  botte: '<path d="M7 3h6v9l6 3a2 2 0 011 2v3H6V3z"/><path d="M6 17h14"/>',
  trefle: '<circle cx="12" cy="7.5" r="3.2"/><circle cx="7.5" cy="12" r="3.2"/><circle cx="16.5" cy="12" r="3.2"/><path d="M12 13v8"/>',
  ferACheval: '<path d="M5 4v8a7 7 0 0014 0V4h-4v8a3 3 0 01-6 0V4z"/><path d="M5 8h4M15 8h4"/>',
  gantelet: '<path d="M7 21v-8L5 9l2-1 2 3V4h2v7V3h2v8V4h2v8l2-3 2 1-3 6v5z"/><path d="M7 16h11"/>',
  chaine: '<rect x="2.5" y="9" width="8" height="6" rx="3"/><rect x="13.5" y="9" width="8" height="6" rx="3"/><path d="M9 12h6"/>',
  chapelet: '<circle cx="12" cy="4.5" r="1.8"/><circle cx="6.5" cy="7.5" r="1.8"/><circle cx="17.5" cy="7.5" r="1.8"/><circle cx="5" cy="13" r="1.8"/><circle cx="19" cy="13" r="1.8"/><circle cx="12" cy="19" r="2.6"/><path d="M7 16l3.5 2M17 16l-3.5 2"/>',
  grappin: '<path d="M12 2v12M10 2h4"/><path d="M12 14c-4 0-6 3-6 6M12 14c4 0 6 3 6 6M12 14v6"/>',
  lanterne: '<path d="M9 3h6M12 3v2"/><path d="M8 7h8l1 3v6l-1 3H8l-1-3v-6z"/><path d="M7 10h10M7 16h10M10 21h4"/>',
  masque: '<path d="M3 8c5-3 13-3 18 0 0 6-3 11-9 11S3 14 3 8z"/><path d="M7 11l3 1M17 11l-3 1M10 16h4"/>',
  lune: '<path d="M15.5 3.2A9 9 0 1020.8 15 7.2 7.2 0 0115.5 3.2z"/>',
  cloche: '<path d="M12 3a6 6 0 016 6v5l2 3H4l2-3V9a6 6 0 016-6z"/><path d="M10 20a2 2 0 004 0"/>',
  talisman: '<path d="M7 2h10v20H7z"/><path d="M10 6h4M12 6v12M9.5 10h5M10 14l2 2 2-2"/>',
  anneau: '<circle cx="12" cy="14" r="6.5"/><path d="M9 4h6l-1.5 3h-3z"/>',
  miroir: '<ellipse cx="12" cy="9" rx="6" ry="7"/><path d="M12 16v6M9 22h6M9.5 6.5l2-2"/>',
  couronne: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/><path d="M5 19h14"/>',
  encrier: '<path d="M7 10h10l1 11H6z"/><path d="M9 10V7h6v3"/><path d="M14 4l5-2-3 6"/>',
  goutte: '<path d="M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z"/><path d="M9 14a3 3 0 003 3"/>',
  pierre: '<path d="M6 8l5-4 7 3 2 7-5 6-8-2-3-6z"/><path d="M11 4l1 7 8 3M12 11l-6 7"/>',
  medaille: '<path d="M8 2l4 6 4-6"/><circle cx="12" cy="15" r="6"/><path d="M12 12l1 2h2l-1.6 1.3.6 2.2L12 16.4 10 17.5l.6-2.2L9 14h2z"/>',
  parchemin: '<path d="M7 4h11a2 2 0 010 4H7"/><path d="M7 4a2 2 0 00-2 2v12a2 2 0 002 2h11a2 2 0 000-4H9V6a2 2 0 00-2-2z"/><path d="M11 10h5M11 13h5"/>',
  sceau: '<path d="M9 3h6v6H9z"/><path d="M7 9h10l1 6H6z"/><path d="M5 15h14v4H5z"/>',
  cle: '<circle cx="7.5" cy="12" r="4.5"/><path d="M12 12h9M18 12v4M21 12v3"/>',
  fiole: '<path d="M10 3h4M10 3v5l-5 9a3 3 0 003 4h8a3 3 0 003-4l-5-9V3"/><path d="M7 15h10"/>',
  oeil: '<path d="M2 12c4-6 16-6 20 0-4 6-16 6-20 0z"/><circle cx="12" cy="12" r="3.5"/>',
  encens: '<path d="M8 21h8M10 21l1-9h2l1 9"/><path d="M12 9c-2-2 2-3 0-6M14 8c-1-1 1-2 0-4"/>',
  cristal: '<path d="M12 2l5 6-5 14-5-14z"/><path d="M7 8h10M12 2v20"/>',
  etoile: '<path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  coeur: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/><path d="M12 9l-1.5 3h3L12 15"/>',
};

// Chaque objet du catalogue et son type d'icone
export const ICONE_DE_OBJET = {
  // Armes
  "baton-disciple": "baton", "lame-serment": "epee", "bokken-maitre": "baton", "gourdin-apprenti": "baton", "gants-sparring": "gants",
  "pique-garnison": "lance", "masse-fer": "masse", "hallebarde-eternelle": "lance", "epee-rouillee": "epee", "arbalete-rempart": "arbalete",
  "kunai-ombre": "dague", "kunai-vent": "dague", "katana-nocturne": "epee", "shuriken-ebreche": "shuriken", "tanto-silencieux": "dague",
  "murasame-encre": "epee", "baton-initie": "baton", "sceptre-scelle": "sceptre", "baton-sage": "sceptre", "eventail-papier": "eventail",
  "chakram-runique": "shuriken", "lame-braise": "epee", "epee-legende": "epee", "plume-lame": "plume", "hachette-cendre": "hache",
  "lance-phenix": "lance", "signet-oublie": "marquePage", "fermoir-acier": "livre", "coupe-papier": "dague", "plume-finale": "plume",
  "plume-dernier-mot": "plume",
  // Tenues
  "kimono-disciple": "kimono", "manteau-heros": "manteau", "hakama-maitre": "kimono", "tunique-rapiecee": "tunique", "plastron-bambou": "armure",
  "cotte-garnison": "armure", "armure-rempart": "armure", "cuirasse-eternelle": "armure", "gambison": "tunique", "cape-assiege": "manteau",
  "bouclier-colosse": "bouclier", "tenue-ombre": "tunique", "cape-legere": "manteau", "kimono-nocturne": "kimono", "manteau-toits": "manteau",
  "haori-veilleur": "kimono", "robe-initie": "kimono", "voile-scelle": "manteau", "robe-sage": "kimono", "chale-brume": "manteau",
  "toge-rituel": "kimono", "cuirasse-braise": "armure", "armure-legende": "armure", "manteau-encre": "manteau", "tunique-ignifugee": "tunique",
  "ecailles-dragon": "armure", "couverture-oubliee": "livre", "reliure-acier": "livre", "jaquette-rouge": "tunique", "manteau-epilogue": "manteau",
  "reliure-resurrection": "livre",
  // Accessoires
  "bandeau-disciple": "bandeau", "bandeau-promesse": "bandeau", "ceinture-noire": "bandeau", "sandales-course": "botte", "trefle-porte-bonheur": "trefle",
  "bandeau-aube": "bandeau", "brassard-garnison": "bandeau", "gantelet-acier": "gantelet", "chaine-gardien": "chaine", "bottes-ferrees": "botte",
  "lanterne-ronde": "lanterne", "masque-ombre": "masque", "sandales-vent": "botte", "fourreau-lune": "lune", "grappin": "grappin",
  "clochette-muette": "cloche", "talisman-initie": "talisman", "bague-sceau": "anneau", "chapelet-jade": "chapelet", "perles-priere": "chapelet",
  "miroir-ames": "miroir", "anneau-braise": "anneau", "couronne-legende": "couronne", "encrier-sans-fond": "encrier", "bracelet-lave": "anneau",
  "fer-a-cheval-dore": "ferACheval", "ruban-oublie": "marquePage", "coins-acier": "livre", "marque-page-sanglant": "marquePage", "sceau-editeur": "sceau",
  "signet-temps": "marquePage",
  // Reliques
  "pierre-concentration": "pierre", "medaille-volonte": "medaille", "parchemin-katas": "parchemin", "cloche-dojo": "cloche", "insigne-garnison": "medaille",
  "sceau-rempart": "sceau", "cle-forteresse": "cle", "blason-fendu": "bouclier", "fiole-fumee": "fiole", "plume-orage": "plume",
  "pierre-lunaire": "lune", "oeil-de-chat": "oeil", "encens-initie": "encens", "sceau-verite": "sceau", "lanterne-esprit": "lanterne",
  "fragment-domaine": "cristal", "oeil-domaine": "oeil", "charbon-ardent": "pierre", "etoile-legende": "etoile", "page-blanche": "parchemin",
  "coeur-volcan": "coeur", "plume-rature": "plume", "tranche-oubliee": "livre", "dos-acier": "livre", "goutte-encre-rouge": "goutte",
  "derniere-page": "parchemin", "encre-abysses": "encrier",
};

export const TYPES_ICONES = Object.keys(DESSINS);

// L'icone d'un objet (par son id), ou null si on ne la connait pas
export function iconeObjet(objetId) {
  const dessin = DESSINS[ICONE_DE_OBJET[objetId]];
  return dessin
    ? `<svg class="icone-emplacement icone-objet" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${dessin}</svg>`
    : null;
}
