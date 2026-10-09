// ==========================================================
// LE CARNET DE TAMPONS : succes et titres
// Chaque tampon a une condition sur le "contexte" (un resume de
// la partie calcule par partie.js) et une petite recompense.
// Completer une page donne un titre.
// ==========================================================

const t = (id, page, nom, texte, condition, recompense = { encre: 30 }, cache = false) => ({ id, page, nom, texte, condition, recompense, cache });

export const PAGES = [
  { id: "campagne", nom: "Campagne", titre: "Briseur de Rature" },
  { id: "chasse", nom: "Chasse", titre: "Chasseur de reflets" },
  { id: "collection", nom: "Collection", titre: "Grand archiviste" },
  { id: "equipement", nom: "Équipement", titre: "Maître de la retouche" },
  { id: "tour", nom: "Tour", titre: "Plongeur des abysses" },
  { id: "legendes", nom: "Légendes", titre: "Légende vivante" },
  { id: "insolites", nom: "Combats insolites", titre: "Esprit libre" },
  { id: "fidelite", nom: "Fidélité", titre: "Lecteur assidu" },
];
export const TITRE_DE_DEPART = "Apprenti archiviste";

export const TAMPONS = [
  // ---------- Campagne ----------
  ...[1, 2, 3, 4, 5].map((c) => t(`chapitre-${c}`, "campagne", `Chapitre ${c}`, `Terminer le chapitre ${c}`, (x) => x.chapitres >= c, { encre: 30 + 20 * c })),
  t("trois-etoiles", "campagne", "Sans faute", "Obtenir les 24 étoiles d'un chapitre", (x) => x.chapitreParfait, { encre: 100, fragments: 2 }),
  t("etoiles-60", "campagne", "Constellation", "Obtenir 60 étoiles de campagne", (x) => x.etoiles >= 60, { encre: 80 }),
  t("etoiles-120", "campagne", "Ciel étoilé", "Obtenir les 120 étoiles de campagne", (x) => x.etoiles >= 120, { encre: 200, fragments: 5 }),
  t("rature-sans-ko", "campagne", "Page immaculée", "Battre la Rature sans aucun KO", (x) => x.ratureSansKo, { encre: 150, fragments: 5 }, true),

  // ---------- Chasse ----------
  ...[1, 3, 5].map((n) => t(`boss-zone-${n}`, "chasse", `${n} boss`, `Battre ${n} boss de zone`, (x) => x.bossChasse >= n, { encre: 30 * n, eclats: 50 * n })),
  t("dores-10", "chasse", "Chercheur d'or", "Vaincre 10 groupes dorés", (x) => x.dores >= 10, { encre: 60 }),
  t("dores-50", "chasse", "Ruée vers l'or", "Vaincre 50 groupes dorés", (x) => x.dores >= 50, { encre: 150, fragments: 3 }),
  t("chasse-100", "chasse", "Traqueur", "Gagner 100 combats de chasse", (x) => x.victoiresChasse >= 100, { eclats: 200 }),
  t("chasse-1000", "chasse", "Infatigable", "Gagner 1 000 combats de chasse", (x) => x.victoiresChasse >= 1000, { eclats: 1000, fragments: 5 }),
  t("boucle-50", "chasse", "Machine", "Gagner 50 combats d'affilée dans une boucle", (x) => x.boucleMax >= 50, { encre: 100 }),

  // ---------- Collection ----------
  ...[10, 25, 50, 78, 120, 160, 200].map((n) => t(`collection-${n}`, "collection", `${n} persos`, `Réunir ${n} persos`, (x) => x.collection >= n, { encre: 5 * n })),
  t("cinq-etoiles", "collection", "Étoile pleine", "Monter un perso à 5 étoiles", (x) => x.cinqEtoiles, { encre: 100 }),
  t("serie-complete", "collection", "Série complète", "Réunir tous les persos d'une série", (x) => x.serieComplete, { encre: 60 }),
  t("legendaires-3", "collection", "Trio légendaire", "Posséder 3 Légendaires", (x) => x.legendaires >= 3, { encre: 150, fragments: 3 }),
  t("legendaires-5", "collection", "Panthéon", "Posséder 6 Légendaires", (x) => x.legendaires >= 6, { encre: 250, fragments: 5 }),
  t("legendaires-11", "collection", "Toutes les légendes", "Posséder les 11 Légendaires", (x) => x.legendaires >= 11, { encre: 500, fragments: 8 }),
  t("tirages-100", "collection", "Gros lecteur", "Ouvrir 25 boosters", (x) => x.boosters >= 25, { encre: 100 }),
  t("boosters-100", "collection", "Collectionneur", "Ouvrir 100 boosters", (x) => x.boosters >= 100, { encre: 300, fragments: 3 }),
  t("secret-1", "collection", "Le secret", "Invoquer un perso Secret", (x) => x.secrets >= 1, { encre: 500, fragments: 10 }, true),
  t("secret-5", "collection", "Gardien des secrets", "Posséder 5 persos Secrets", (x) => x.secrets >= 5, { encre: 1500, fragments: 20 }, true),
  t("variante-doree", "collection", "Or pur", "Obtenir une carte dorée", (x) => x.dorees >= 1, { encre: 150 }),

  // ---------- Equipement ----------
  ...[10, 30, 60, 100, 120].map((n) => t(`objets-${n}`, "equipement", `${n} objets`, `Découvrir ${n} objets différents`, (x) => x.objets >= n, { eclats: 2 * n })),
  t("panoplie", "equipement", "Tenue complète", "Porter une panoplie complète sur un perso", (x) => x.panoplieComplete, { encre: 60 }),
  t("parfait-1", "equipement", "Trait parfait", "Obtenir un objet parfait", (x) => x.parfaits >= 1, { eclats: 200 }),
  t("parfait-10", "equipement", "Perfectionniste", "Posséder 10 objets parfaits", (x) => x.parfaits >= 10, { eclats: 800, fragments: 3 }),
  t("sublime", "equipement", "Au-delà du maximum", "Sublimer une ligne à l'encre sacrée", (x) => x.sublimes >= 1, { encre: 100 }),
  t("retouches-100", "equipement", "Main sûre", "Faire 100 retouches à l'encre", (x) => x.retouches >= 100, { eclats: 500 }),

  // ---------- Tour ----------
  ...[10, 25, 50, 100, 150].map((n) => t(`tour-${n}`, "tour", `Étage ${n}`, `Atteindre l'étage ${n} de la Tour`, (x) => x.tour >= n, { encre: n * 2, fragments: Math.floor(n / 25) })),
  t("coffre-semaine", "tour", "Semaine bien remplie", "Ouvrir un coffre de la semaine", (x) => x.coffresSemaine >= 1, { encre: 40 }),

  // ---------- Legendes : boss de la semaine, liens, eveil ----------
  t("raid-1", "legendes", "Premier affrontement", "Tenter le boss de la semaine", (x) => x.raids >= 1, { encre: 30 }),
  t("raid-400k", "legendes", "Gros dégâts", "Infliger 400 000 dégâts au boss de la semaine", (x) => x.raidRecord >= 400000, { encre: 100, fragments: 2 }),
  // (l'identifiant garde l'ancien seuil pour ne pas toucher aux sauvegardes)
  t("raid-1500k", "legendes", "Dévastateur", "Infliger 1 000 000 dégâts au boss de la semaine", (x) => x.raidRecord >= 1000000, { encre: 300, fragments: 6 }),
  t("liens-5", "legendes", "Amitiés", "Découvrir 5 liens", (x) => x.liens >= 5, { encre: 80 }),
  t("liens-20", "legendes", "Tous liés", "Découvrir les 20 liens", (x) => x.liens >= 20, { encre: 300, fragments: 5 }),
  t("lien-max", "legendes", "Inséparables", "Monter un lien au niveau 5", (x) => x.lienMax, { encre: 150 }),
  t("eveil-1", "legendes", "Premier éveil", "Éveiller un perso", (x) => x.eveils >= 1, { encre: 100 }),
  t("eveil-4", "legendes", "Éveil total", "Monter un perso en éveil IV", (x) => x.eveilIV, { encre: 300, fragments: 5 }),

  // ---------- Combats insolites (certains sont caches) ----------
  t("cinq-series", "insolites", "Vrai crossover", "Gagner avec 5 persos de 5 séries différentes", (x) => x.insolites.cinqSeries, { encre: 50 }),
  t("trois-pokemon", "insolites", "Dresseur", "Gagner avec 3 Pokémon dans l'équipe", (x) => x.insolites.pokemon, { encre: 50 }, true),
  t("eclair", "insolites", "Éclair", "Gagner un combat en moins de 15 secondes", (x) => x.insolites.eclair, { encre: 80 }),
  t("survivant", "insolites", "Dernier debout", "Gagner avec un seul perso encore debout", (x) => x.insolites.survivant, { encre: 80 }, true),
  t("communs", "insolites", "Petits budgets", "Gagner une étape de campagne avec 5 persos Communs", (x) => x.insolites.communs, { encre: 80 }, true),
  t("victoires-1000", "insolites", "Mille victoires", "Gagner 1 000 combats, tous modes confondus", (x) => x.victoires >= 1000, { encre: 200, fragments: 3 }),

  // ---------- Fidelite ----------
  ...[7, 30, 100].map((n) => t(`jours-${n}`, "fidelite", `${n} jours`, `Jouer ${n} jours différents`, (x) => x.jours >= n, { encre: 2 * n, fragments: Math.floor(n / 30) })),
  t("missions-50", "fidelite", "Toujours au rendez-vous", "Réclamer 50 missions du jour", (x) => x.missions >= 50, { encre: 150 }),
  t("coffres-10", "fidelite", "Habitué", "Ouvrir 10 coffres de la semaine", (x) => x.coffresSemaine >= 10, { encre: 200, fragments: 3 }),
];
