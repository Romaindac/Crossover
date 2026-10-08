# Projet Crossover — mémo pour Claude

Jeu navigateur gratuit (fan game assumé) : un crossover manga/anime avec gacha,
campagne, chasse façon Dofus, Tour infinie, éveil, boss de la semaine, liens entre persos.
Ce fichier résume tout ce qu'il faut savoir pour reprendre le projet.

## Règles de travail (demandées par le créateur du jeu)

- Toujours répondre et commenter en français.
- Demander avant de coder un gros changement : proposer une conception, poser les questions utiles.
- Être honnête : dire ce qui n'est pas testé, ce qui est fragile, ce qui coûte.
- Penser comme un développeur de jeu complet (game design, équilibrage, UX, performance).
- Après chaque étape : vérifier, puis livrer un jeu qui marche.

## Pile technique

- HTML + CSS + JavaScript pur, modules ES, aucun framework, aucune étape de build.
- Lancer en local : `python3 -m http.server 8765` puis ouvrir http://localhost:8765
- Vérifications rapides du moteur : `node tests/verifier.mjs`
- Laboratoire (combats, tournoi, simulateurs d'économie) : `test-moteur.html`
- Sauvegarde : localStorage, clé `crossover:partie` (validée et migrée dans `js/services/partie.js`).
- Portraits : PokéAPI (Pokémon) et AniList GraphQL (les autres), en cache dans localStorage.

## Architecture

- `js/donnees/` : toutes les données et tous les chiffres à régler (persos, objets, zones, campagne, tour, tampons...).
- `js/moteur/` : logique pure, sans affichage. Le combat est déterministe (graine) : ne jamais utiliser Math.random dans le moteur.
- `js/services/partie.js` : l'état du joueur, toutes les règles de progression et de récompenses.
- `js/ui/` : composants d'affichage partagés (cartes, fiche, équipement, scènes, décors, navigation).
- `js/ecrans/` : un fichier par écran (accueil, qg, aventure, equipe, combat, tirages, collection, reglages...).
- `css/premium.css` est chargé en dernier : c'est la couche de finition « manga premium ».

## Direction artistique (manga premium)

- Papier journal (`--fond`), papier clair (`--papier`), encre indigo (`--encre`), or de l'obi (`--obi`), rouge des sceaux (`--sceau`).
- Titres en Shippori Mincho B1, interface en M PLUS 2, logo et onomatopées en Dela Gothic One.
- Une seule trame de points (`--trame`), seulement sur les grandes surfaces illustrées.
- Les « scènes » (combat, tirages, Tour, navigation) sont en encre ; les « documents » sont en papier.
- Aucun emoji. Tous les noms d'objets, d'ennemis originaux et les dialogues sont originaux.

## Équilibrage

Toujours vérifier au simulateur avant de changer un chiffre d'économie
(boutons du laboratoire, ou `js/outils/simulateur-v03.js`). Objectifs actuels :
campagne finie vers le jour 19 à 45 min/jour ; équipe en éveil IV en environ 2 mois de jeu actif.

## Feuille de route

- Fait : V0.1 combat, V0.2 gacha et progression, V0.3 campagne + équipement + chasse + histoire, mise à jour Longévité (13 étapes).
- À venir : retours de test et corrections, roguelite (V0.4), jeu en ligne avec comptes Supabase et PvP (V0.5).
