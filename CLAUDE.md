# Projet Crossover — mémo pour Claude

Jeu navigateur gratuit (fan game assumé) : un crossover manga/anime avec boosters de cartes (78 persos, 14 séries),
campagne, chasse façon Dofus, Tour infinie, éveil, boss de la semaine, liens entre persos.
Ce fichier résume tout ce qu'il faut savoir pour reprendre le projet.

## Règles de travail (demandées par le créateur du jeu)

- Toujours répondre et commenter en français.
- Demander avant de coder un gros changement : proposer une conception, poser les questions utiles.
- Être honnête : dire ce qui n'est pas testé, ce qui est fragile, ce qui coûte.
- Penser comme un développeur de jeu complet (game design, équilibrage, UX, performance).
- Après chaque étape : vérifier, puis livrer un jeu qui marche.
- Mise en ligne automatique : une fois les changements vérifiés, ouvrir la pull request et la fusionner sur `main`
  sans attendre (le créateur veut voir chaque modification sur le site, GitHub Pages se met à jour en 1 à 2 min).

## Pile technique

- HTML + CSS + JavaScript pur, modules ES, aucun framework, aucune étape de build.
- Lancer en local : `python3 -m http.server 8765` puis ouvrir http://localhost:8765
- Vérifications rapides du moteur : `node tests/verifier.mjs`
- Laboratoire (combats, tournoi, simulateurs d'économie) : `test-moteur.html`
- Sauvegarde : localStorage, clé `crossover:partie` (validée et migrée dans `js/services/partie.js` ; une ancienne sauvegarde reçoit 3 tickets de booster).
- Portraits : PokéAPI (Pokémon) et AniList GraphQL (les autres), en cache dans localStorage.

## Architecture

- `js/donnees/` : toutes les données et tous les chiffres à régler (persos, objets, zones, campagne, tour, tampons...).
  `boosters.js` : éditions, taux par case, pitié, variantes, prix, tickets, poussière. `series.js` : couleurs et motif du cadre de chaque manga.
  `calibrage.js` est écrit par `node js/outils/calibrer.mjs` (coefficient PV/ATQ par perso) : ne pas le modifier à la main.
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

Après avoir ajouté ou retouché des persos : lancer `node js/outils/calibrer.mjs` (environ 4 min),
qui ajuste automatiquement un coefficient de PV/ATQ par perso. Si un coefficient sort de 0,8-1,2,
c'est le kit qu'il faut corriger à la main. Ensuite, contrôler au tournoi d'équilibrage du labo
(équipes rangées comme un joueur, niveau 30). Cibles : chaque rôle entre 47 et 53 %,
chaque perso entre 42 et 58 % sans bonus de rareté. Le tournoi « placement au hasard »
cache le poids des rôles : il ne sert qu'à tester la robustesse au placement.
Les persos servent aussi d'ennemis : après un rééquilibrage, recaler `MULT_PAR_CHAPITRE`
(campagne.js) au simulateur.

## Feuille de route

- Fait : V0.1 combat, V0.2 gacha et progression, V0.3 campagne + équipement + chasse + histoire, mise à jour Longévité (13 étapes),
  mise à jour « Audit » : rééquilibrage mesuré, Rage d'encre, équipe conseillée, cartes premium, boss / Tour / saisons / missions revus,
  Volume 2 (8 persos : C-18, Tsunade, Nami, Dracaufeu, Chevalier Squelette, Nobara, Shinobu, Hisoka ; 32 persos, 4 par série),
  refonte « Boosters » : 78 persos (6 nouvelles séries), obtention par boosters de 4 éditions à thème, tickets gratuits,
  atelier à la poussière, variantes Holo et Dorée, cadre de carte propre à chaque manga.
- Mise en ligne : GitHub Pages sur la branche `main` (https://romaindac.github.io/Crossover/), mise à jour automatique à chaque fusion.
- À venir : retours de test et corrections, roguelite (V0.4), jeu en ligne avec comptes Supabase et PvP (V0.5).
