// ==========================================================
// LES SECRETS, EN CLAIR (outil, hors du jeu)
// Le fichier js/donnees/persos-secrets.js garde les Secrets codes, pour
// qu'un joueur curieux ne lise pas leurs noms dans le code du site.
//
//   node js/outils/secrets.mjs lire > secrets.json      : les Secrets en clair
//   (modifier secrets.json, sans le mettre dans le depot : il est public)
//   node js/outils/secrets.mjs ecrire secrets.json      : recode le fichier du jeu
//
// Ce n'est pas un coffre-fort (le jeu doit pouvoir les decoder), juste
// un rideau : il faut le vouloir pour regarder derriere.
// ==========================================================

import { readFileSync, writeFileSync } from "node:fs";
import { coder, decoder } from "../donnees/secrets-code.js";

const [action, fichier] = process.argv.slice(2);
const cible = new URL("../donnees/persos-secrets.js", import.meta.url);

if (action === "lire") {
  const { PERSOS_SECRETS } = await import("../donnees/persos-secrets.js");
  console.log(JSON.stringify(PERSOS_SECRETS, null, 2));
} else if (action === "ecrire" && fichier) {
  const liste = JSON.parse(readFileSync(fichier, "utf8"));
  const actuel = readFileSync(cible, "utf8");
  const anciens = actuel.match(/const ANCIENS_IDS = "([^"]*)"/)?.[1] ?? coder({});
  writeFileSync(cible, fichierJeu(coder(liste), anciens));
  console.log(`${liste.length} Secrets recodes dans js/donnees/persos-secrets.js`);
} else {
  console.log("Utilisation : node js/outils/secrets.mjs lire | ecrire secrets.json");
}

export function fichierJeu(code, anciens) {
  return `// ==========================================================
// LES SECRETS : la rarete au-dessus de Legendaire
// Un par manga. Leur identite reste cachee dans la Collection (silhouette
// « ??? ») tant qu'on ne les a pas invoques. Ils ne servent jamais
// d'ennemis et ne comptent pas dans les series (8 / 8) ni les editions.
// Les fiches sont codees pour ne pas etre lues dans le code du site :
// pour les voir ou les modifier, node js/outils/secrets.mjs (lire / ecrire).
// Apres une modification : node js/outils/calibrer.mjs secrets
// ==========================================================

import { decoder } from "./secrets-code.js";

const CODE = "${code}";
// Les identifiants de la premiere version, convertis a la lecture des sauvegardes
const ANCIENS_IDS = "${anciens}";

export const PERSOS_SECRETS = decoder(CODE);
export const IDS_SECRETS = new Set(PERSOS_SECRETS.map((p) => p.id));
export const estSecret = (id) => IDS_SECRETS.has(id);
export const ANCIENS_IDS_SECRETS = decoder(ANCIENS_IDS);
`;
}

void decoder;
