// ==========================================================
// PORTRAITS
// Recupere l'image de chaque perso une seule fois, puis la
// garde en memoire dans le navigateur. Si une image manque,
// la carte affiche les initiales a la place.
//
// Source : l'API publique d'AniList. On lui envoie peu de
// requetes (3 en tout), car elle limite le nombre d'appels.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { SOURCES_PORTRAITS } from "../donnees/portraits.js";
import { lire, ecrire } from "./sauvegarde.js";

const API_ANILIST = "https://graphql.anilist.co";
// v3 : les images sont maintenant verifiees par la serie (les anciennes, parfois
// fausses, sont rechargees une fois)
const CLE_CACHE = "portraits-v3";
const PERSOS_PAR_REQUETE = 5;
const ATTENTE_ENTRE_REQUETES = 2500; // on reste tres en dessous de la limite
const DELAI_MAX = 10000;             // on abandonne une requete au bout de 10 s

const portraits = lire(CLE_CACHE, {});

// Les Pokemon sont cherches sur AniList comme les autres (une image tiree de l'anime).
// En attendant, ou si AniList ne les trouve pas, on affiche leur illustration
// officielle (PokeAPI) en secours.
const secours = new Set();
for (const [id, source] of Object.entries(SOURCES_PORTRAITS)) {
  if (source.pokemon && !portraits[id]) {
    portraits[id] = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${source.pokemon}.png`;
    secours.add(id);
  }
}

export function portraitDe(id) {
  return portraits[id] ?? null;
}

// Vrai si le perso affiche l'illustration officielle d'un Pokemon (cadrage particulier)
export function estPokemon(id) {
  return secours.has(id);
}

export function nombrePortraits() {
  return PERSOS.filter((p) => portraits[p.id]).length;
}

function sauverCache() {
  const aGarder = Object.fromEntries(
    Object.entries(portraits).filter(([id]) => !secours.has(id))
  );
  ecrire(CLE_CACHE, aGarder);
}

// ---------- Appel a AniList ----------

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// Les mots qui reconnaissent chaque serie dans les titres AniList (romaji ou anglais)
const TITRES_SERIES = {
  "Dragon Ball": ["dragon ball"], "Naruto": ["naruto", "boruto"], "One Piece": ["one piece"], "Bleach": ["bleach"],
  "Saint Seiya": ["saint seiya"], "Jujutsu Kaisen": ["jujutsu kaisen"], "Demon Slayer": ["kimetsu", "demon slayer"],
  "My Hero Academia": ["boku no hero", "my hero academia"], "Black Clover": ["black clover"],
  "Solo Leveling": ["solo leveling", "ore dake level", "na honjaman"], "Pokémon": ["pok", "pocket monster"],
  "Hunter x Hunter": ["hunter"], "Fairy Tail": ["fairy tail"], "Frieren": ["frieren", "sousou"],
  "Fullmetal Alchemist": ["hagane", "fullmetal"], "Berserk": ["berserk"], "L'Attaque des Titans": ["shingeki", "attack on titan"],
  "Chainsaw Man": ["chainsaw"], "Tokyo Ghoul": ["tokyo ghoul", "tokyo kushu"], "JoJo": ["jojo"],
};

// Une seule requete demande plusieurs persos a la fois, avec les oeuvres de chaque resultat
async function demanderLot(ids) {
  const champs = ids.map((id) => `
    ${id}: Page(perPage: 8) {
      characters(search: ${JSON.stringify(SOURCES_PORTRAITS[id].recherche)}, sort: [FAVOURITES_DESC]) {
        name { full alternative }
        image { large }
        media(perPage: 4, sort: [POPULARITY_DESC]) { nodes { title { romaji english } } }
      }
    }`).join("\n");

  const controle = new AbortController();
  const minuteur = setTimeout(() => controle.abort(), DELAI_MAX);
  try {
    const reponse = await fetch(API_ANILIST, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: `query {${champs}\n}` }),
      signal: controle.signal,
    });
    const json = await reponse.json().catch(() => null);
    if (reponse.status === 429) throw new Error("AniList reçoit trop de demandes, réessaie dans une minute");
    if (!json?.data) throw new Error(`AniList a répondu ${reponse.status}`);
    return json.data;
  } catch (erreur) {
    if (erreur.name === "AbortError") throw new Error("AniList ne répond pas");
    if (erreur instanceof TypeError) throw new Error("impossible de joindre AniList");
    throw erreur;
  } finally {
    clearTimeout(minuteur);
  }
}

// verif : un mot (ou une liste de mots) qui doit apparaitre dans le nom trouve ;
// serie : le perso doit venir d'une oeuvre de cette serie (sinon : pas d'image,
// les initiales plutot qu'un autre perso du meme nom)
function choisirImage(page, verif, serie) {
  const mots = Array.isArray(verif) ? verif : [verif];
  const titres = TITRES_SERIES[serie] ?? [];
  const deLaSerie = (perso) => {
    const oeuvres = perso.media?.nodes;
    if (!Array.isArray(oeuvres) || !titres.length) return true;   // pas d'info : on ne bloque pas
    const texte = oeuvres.map((m) => `${m?.title?.romaji ?? ""} ${m?.title?.english ?? ""}`).join(" ").toLowerCase();
    return titres.some((t) => texte.includes(t));
  };
  const trouve = (page?.characters ?? []).find((perso) => {
    const noms = [perso.name?.full, ...(perso.name?.alternative ?? [])].join(" ").toLowerCase();
    return mots.some((mot) => noms.includes(mot)) && deLaSerie(perso);
  });
  const url = trouve?.image?.large ?? null;
  return url && !url.includes("default") ? url : null;
}

// ---------- Chargement de tous les portraits manquants ----------

let chargementEnCours = null;

// Renvoie { manquants, erreur } une fois termine
export function chargerPortraits(surProgression = () => {}) {
  if (chargementEnCours) return chargementEnCours;

  chargementEnCours = (async () => {
    const ids = PERSOS.map((p) => p.id).filter((id) => (!portraits[id] || secours.has(id)) && SOURCES_PORTRAITS[id]?.recherche);
    let erreur = null;

    for (let i = 0; i < ids.length; i += PERSOS_PAR_REQUETE) {
      const lot = ids.slice(i, i + PERSOS_PAR_REQUETE);
      if (i > 0) await pause(ATTENTE_ENTRE_REQUETES);
      try {
        const donnees = await demanderLot(lot);
        for (const id of lot) {
          const url = choisirImage(donnees[id], SOURCES_PORTRAITS[id].verif, PERSOS_PAR_ID[id]?.serie);
          if (url) {
            portraits[id] = url;
            secours.delete(id);
          }
          surProgression(id);
        }
        sauverCache();
      } catch (e) {
        erreur = e.message;
        console.warn("Portraits :", e.message);
        break; // inutile d'insister si AniList ne repond pas
      }
    }

    chargementEnCours = null;
    return { manquants: PERSOS.length - nombrePortraits(), erreur };
  })();

  return chargementEnCours;
}
