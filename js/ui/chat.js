// ==========================================================
// CHAT : canaux publics et messages prives (onglet Social)
// Les nouveaux messages arrivent par interrogation reguliere du
// serveur (toutes les 4 s quand le chat est ouvert). Tout texte
// venu du serveur est echappe avant affichage.
// ==========================================================

import {
  CANAUX, monId, messagesCanal, envoyerMessage, effacerMessage, messagesPrives, envoyerPrive,
  marquerLus, joueursParIds, chercherJoueurs, mesBlocages, bloquer, debloquer, signaler, suisModerateur,
  rafraichirNonLus,
} from "../services/enligne.js";

const ATTENTE = 4000;
const echapper = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const heure = (iso) => {
  const d = new Date(iso);
  const auj = new Date().toDateString() === d.toDateString();
  return auj ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

// ouvrirJoueur(profil) : affiche la vitrine d'un joueur (fourni par l'ecran Social)

// Une annonce automatique de l'autel a une forme precise (voir autel.js) : un message tape a la main
// qui commence juste par « [Autel] » ne s'affiche pas comme une annonce doree.
export const estAnnonceAutel = (texte) =>
  /^\[Autel\] (SECRET ! vient de percer un secret de l'autel : [^!<>]{1,40} !|vient d'invoquer [^!<>]{1,40} (Légendaire|Épique|Rare|Peu commun|Commun|Secret)(, bordure [^!<>]{1,30})? !)$/.test(texte);

export function brancherChat(zone, { ouvrirJoueur }) {
  const moi = monId();
  let vue = { type: "canal", id: "general" };
  const canaux = {};               // id -> liste de messages
  let prives = [];                 // tous mes messages prives
  const profils = {};              // id -> profil public (pseudo, vitrine...)
  let bloques = new Set();
  let moderateur = false;
  let recherche = null;            // null, ou { texte, resultats }
  let erreur = "";
  let minuteur = null;

  zone.innerHTML = `
    <div class="chat">
      <aside class="chat__menu" aria-label="Conversations"></aside>
      <section class="chat__fil" aria-live="polite">
        <header class="chat__entete"></header>
        <div class="chat__messages" tabindex="0"></div>
        <form class="chat__saisie">
          <textarea class="chat__champ" maxlength="500" rows="1" placeholder="Écris un message…" aria-label="Message"></textarea>
          <button type="submit" class="bouton bouton--obi-petit chat__envoyer">Envoyer</button>
        </form>
        <p class="chat__erreur" role="status"></p>
      </section>
    </div>
    <div class="chat__voile-zone"></div>`;
  const $ = (s) => zone.querySelector(s);

  // ---------- Conversations privees ----------
  function conversations() {
    const parAutre = new Map();
    for (const m of prives) {
      const autre = m.de === moi ? m.a : m.de;
      if (bloques.has(autre)) continue;
      const c = parAutre.get(autre) ?? { id: autre, dernier: m, nonLus: 0 };
      c.dernier = m;
      if (m.a === moi && !m.lu) c.nonLus += 1;
      parAutre.set(autre, c);
    }
    return [...parAutre.values()].sort((a, b) => b.dernier.id - a.dernier.id);
  }

  const pseudoDe = (id) => profils[id]?.pseudo ?? "…";

  async function chargerProfils(ids) {
    const manquants = [...new Set(ids)].filter((id) => id && !profils[id]);
    if (!manquants.length) return;
    for (const p of await joueursParIds(manquants).catch(() => [])) profils[p.id] = p;
  }

  // ---------- Rendu ----------
  function rendreMenu() {
    const convs = conversations();
    $(".chat__menu").innerHTML = `
      <p class="chat__rubrique">Canaux</p>
      ${CANAUX.map((c) => `
        <button type="button" class="chat__lien ${vue.type === "canal" && vue.id === c.id ? "chat__lien--actif" : ""}" data-chat="canal" data-id="${c.id}">
          <span class="chat__diese" aria-hidden="true">#</span>${c.nom}
        </button>`).join("")}
      <p class="chat__rubrique">Messages privés</p>
      ${convs.map((c) => `
        <button type="button" class="chat__lien ${vue.type === "prive" && vue.id === c.id ? "chat__lien--actif" : ""}" data-chat="prive" data-id="${c.id}">
          <span class="chat__avatar" aria-hidden="true">${echapper(pseudoDe(c.id).slice(0, 1).toUpperCase())}</span>
          <span class="chat__lien-nom">${echapper(pseudoDe(c.id))}</span>
          ${c.nonLus ? `<span class="chat__non-lus" aria-label="${c.nonLus} non lus">${c.nonLus}</span>` : ""}
        </button>`).join("") || '<p class="chat__vide-menu">Aucune conversation.</p>'}
      ${recherche ? `
        <div class="chat__recherche">
          <input type="search" class="chat__champ-recherche" placeholder="Pseudo du joueur" value="${echapper(recherche.texte)}" aria-label="Chercher un joueur" maxlength="20">
          ${recherche.resultats.map((p) => p.id === moi ? "" : `<button type="button" class="chat__resultat" data-chat="nouveau" data-id="${p.id}">${echapper(p.pseudo)}</button>`).join("")}
        </div>`
        : '<button type="button" class="bouton-texte chat__nouveau" data-chat="chercher">+ Nouveau message</button>'}`;
    if (recherche) {
      const champ = $(".chat__champ-recherche");
      champ.focus();
      champ.setSelectionRange(champ.value.length, champ.value.length);
    }
  }

  function rendreFil({ garderBas = true } = {}) {
    const liste = $(".chat__messages");
    const etaitEnBas = liste.scrollHeight - liste.scrollTop - liste.clientHeight < 80;
    let messages, titre, sousTitre;
    if (vue.type === "canal") {
      const c = CANAUX.find((x) => x.id === vue.id);
      messages = (canaux[vue.id] ?? []).filter((m) => !bloques.has(m.auteur));
      titre = `<span class="chat__diese">#</span>${c.nom}`;
      sousTitre = c.texte;
    } else {
      messages = prives.filter((m) => (m.de === vue.id && m.a === moi) || (m.de === moi && m.a === vue.id))
        .map((m) => ({ ...m, auteur: m.de, pseudo: pseudoDe(m.de) }));
      titre = echapper(pseudoDe(vue.id));
      sousTitre = "Conversation privée : vous seuls la voyez.";
    }
    $(".chat__entete").innerHTML = `
      <button type="button" class="chat__retour" data-chat="retour" aria-label="Retour aux conversations">‹</button>
      <div><h3 class="chat__titre">${titre}</h3><p class="chat__sous-titre">${sousTitre}</p></div>
      ${vue.type === "prive" ? `<button type="button" class="bouton-texte" data-chat="joueur" data-id="${vue.id}">Profil</button>` : ""}`;
    liste.innerHTML = messages.length ? messages.map((m, i) => {
      const suite = i > 0 && messages[i - 1].auteur === m.auteur && new Date(m.cree) - new Date(messages[i - 1].cree) < 5 * 60000;
      const mien = m.auteur === moi;
      // Annonce automatique d'une invocation tres rare : une ligne dorée au milieu du fil
      if (estAnnonceAutel(m.texte)) {
        return `<p class="msg-annonce"><b>${echapper(m.pseudo)}</b> ${echapper(m.texte.slice(8))} <time>${heure(m.cree)}</time></p>`;
      }
      return `
        <div class="msg ${mien ? "msg--moi" : ""} ${suite ? "msg--suite" : ""}">
          ${suite ? "" : `<div class="msg__tete">
            ${mien ? `<span class="msg__pseudo msg__pseudo--moi">Toi</span>` : `<button type="button" class="msg__pseudo" data-chat="joueur" data-id="${m.auteur}">${echapper(m.pseudo)}</button>`}
            <time class="msg__heure">${heure(m.cree)}</time>
          </div>`}
          <div class="msg__bulle">
            <p class="msg__texte">${echapper(m.texte)}</p>
            ${vue.type === "canal" ? `<button type="button" class="msg__menu" data-chat="menu-message" data-id="${m.id}" aria-label="Actions sur ce message">⋯</button>` : ""}
          </div>
        </div>`;
    }).join("") : `<p class="chat__vide">${vue.type === "canal" ? "Aucun message pour l'instant : lance la conversation !" : "Dis bonjour !"}</p>`;
    if (garderBas && etaitEnBas) liste.scrollTop = liste.scrollHeight;
    $(".chat__erreur").textContent = erreur;
    zone.querySelector(".chat").classList.toggle("chat--fil-ouvert", Boolean(vue.ouvert));
  }

  // ---------- Fenetre d'actions (joueur ou message) ----------
  function fermerVoile() { $(".chat__voile-zone").innerHTML = ""; }

  function ouvrirActionsJoueur(id, message = null) {
    const p = profils[id];
    const estBloque = bloques.has(id);
    const peutEffacer = message && (message.auteur === moi || moderateur);
    $(".chat__voile-zone").innerHTML = `
      <div class="voile chat__voile" data-chat="fermer">
        <div class="resultat chat__actions" role="dialog" aria-modal="true" aria-label="Actions">
          <h3 class="resultat__titre">${echapper(p?.pseudo ?? message?.pseudo ?? "Joueur")}</h3>
          ${message ? `<blockquote class="chat__citation">${echapper(message.texte)}</blockquote>` : ""}
          <div class="chat__actions-liste">
            ${id !== moi ? `<button type="button" class="bouton bouton--obi-petit" data-chat="ecrire" data-id="${id}">Message privé</button>` : ""}
            ${p ? `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-chat="vitrine" data-id="${id}">Voir sa vitrine</button>` : ""}
            ${peutEffacer ? `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-chat="effacer" data-id="${message.id}">Supprimer le message</button>` : ""}
            ${id !== moi ? `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-chat="${estBloque ? "debloquer" : "bloquer"}" data-id="${id}">${estBloque ? "Débloquer" : "Bloquer"}</button>` : ""}
            ${id !== moi ? `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-chat="signaler" data-id="${id}" data-message="${message?.id ?? ""}">Signaler</button>` : ""}
            <button type="button" class="bouton-texte" data-chat="fermer">Fermer</button>
          </div>
        </div>
      </div>`;
  }

  // ---------- Chargement ----------
  // Un seul chargement a la fois (minuterie, envoi et changement de canal pouvaient se croiser
  // et empiler deux fois les memes messages) ; un appel pendant un chargement est rejoue apres.
  let chargement = null;
  let aRejouer = false;
  async function rafraichir() {
    if (chargement) { aRejouer = true; return chargement; }
    chargement = rafraichirUneFois();
    try { await chargement; } finally { chargement = null; }
    if (aRejouer && zone.isConnected) { aRejouer = false; return rafraichir(); }
  }
  const ajouterSansDoublon = (liste, nouveaux) => {
    const vus = new Set(liste.map((m) => m.id));
    for (const m of nouveaux) if (!vus.has(m.id)) { vus.add(m.id); liste.push(m); }
  };

  async function rafraichirUneFois() {
    if (!zone.isConnected) return arreter();
    try {
      if (vue.type === "canal") {
        const liste = canaux[vue.id] ?? (canaux[vue.id] = []);
        const nouveaux = await messagesCanal(vue.id, liste.at(-1)?.id ?? 0);
        if (nouveaux.length) { ajouterSansDoublon(liste, nouveaux); canaux[vue.id] = liste.slice(-200); }
      }
      const nouveauxPrives = await messagesPrives(prives.at(-1)?.id ?? 0);
      if (nouveauxPrives.length) ajouterSansDoublon(prives, nouveauxPrives);
      await chargerProfils(prives.map((m) => (m.de === moi ? m.a : m.de)));
      if (vue.type === "prive" && prives.some((m) => m.de === vue.id && m.a === moi && !m.lu)) {
        await marquerLus(vue.id);
        prives.forEach((m) => { if (m.de === vue.id && m.a === moi) m.lu = true; });
        rafraichirNonLus();
      }
      erreur = "";
    } catch (e) {
      erreur = e.message;
    }
    if (!zone.isConnected) return arreter();
    if (!recherche) rendreMenu();
    rendreFil();
  }

  function boucle() {
    clearTimeout(minuteur);
    minuteur = setTimeout(async () => {
      if (!document.hidden) await rafraichir();
      if (zone.isConnected) boucle();
    }, ATTENTE);
  }
  function arreter() { clearTimeout(minuteur); }

  async function changerVue(nouvelle) {
    vue = { ...nouvelle, ouvert: true };
    recherche = null;
    rendreMenu();
    rendreFil();
    $(".chat__messages").scrollTop = $(".chat__messages").scrollHeight;
    await rafraichir();
    $(".chat__messages").scrollTop = $(".chat__messages").scrollHeight;
  }

  // ---------- Evenements ----------
  zone.addEventListener("click", async (e) => {
    const cible = e.target.closest("[data-chat]");
    if (!cible) return;
    const action = cible.dataset.chat;
    const id = cible.dataset.id;
    if (action === "fermer") { if (e.target === cible || cible.tagName === "BUTTON") fermerVoile(); return; }
    if (action === "canal") return changerVue({ type: "canal", id });
    if (action === "prive" || action === "nouveau") { await chargerProfils([id]); if (action === "nouveau") { const r = recherche?.resultats.find((p) => p.id === id); if (r) profils[id] = r; } return changerVue({ type: "prive", id }); }
    if (action === "retour") { vue = { ...vue, ouvert: false }; return rendreFil({ garderBas: false }); }
    if (action === "chercher") { recherche = { texte: "", resultats: [] }; return rendreMenu(); }
    if (action === "joueur") { await chargerProfils([id]); return ouvrirActionsJoueur(id); }
    if (action === "menu-message") {
      const m = (canaux[vue.id] ?? []).find((x) => String(x.id) === id);
      if (!m) return;
      await chargerProfils([m.auteur]);
      return ouvrirActionsJoueur(m.auteur, m);
    }
    if (action === "ecrire") { fermerVoile(); return changerVue({ type: "prive", id }); }
    if (action === "vitrine") { fermerVoile(); if (profils[id]) ouvrirJoueur(profils[id]); return; }
    try {
      if (action === "effacer") {
        await effacerMessage(id);
        for (const k in canaux) canaux[k] = canaux[k].filter((m) => String(m.id) !== id);
        fermerVoile(); erreur = "Message supprimé."; rendreFil({ garderBas: false });
      }
      if (action === "bloquer") {
        await bloquer(id); bloques.add(id);
        fermerVoile(); erreur = "Joueur bloqué : tu ne vois plus ses messages, et il ne peut plus t'écrire en privé.";
        if (vue.type === "prive" && vue.id === id) vue = { type: "canal", id: "general", ouvert: false };
        rendreMenu(); rendreFil();
      }
      if (action === "debloquer") { await debloquer(id); bloques.delete(id); fermerVoile(); erreur = "Joueur débloqué."; rendreMenu(); rendreFil(); }
      if (action === "signaler") {
        const m = (canaux[vue.id] ?? []).find((x) => String(x.id) === cible.dataset.message);
        await signaler({ cible: id, messageId: m?.id ?? null, texte: m?.texte ?? "" });
        fermerVoile(); erreur = "Merci, le signalement a été envoyé aux modérateurs."; rendreFil({ garderBas: false });
      }
    } catch (err) {
      fermerVoile(); erreur = err.message; rendreFil({ garderBas: false });
    }
  });

  let delaiRecherche = null;
  zone.addEventListener("input", (e) => {
    if (e.target.classList.contains("chat__champ-recherche")) {
      recherche.texte = e.target.value;
      clearTimeout(delaiRecherche);
      delaiRecherche = setTimeout(async () => {
        recherche.resultats = await chercherJoueurs(recherche.texte).catch(() => []);
        if (recherche) rendreMenu();
      }, 300);
    }
    if (e.target.classList.contains("chat__champ")) {
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
    }
  });

  const champ = $(".chat__champ");
  champ.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $(".chat__saisie").requestSubmit(); }
  });

  $(".chat__saisie").addEventListener("submit", async (e) => {
    e.preventDefault();
    const texte = champ.value.trim();
    if (!texte) return;
    const bouton = $(".chat__envoyer");
    bouton.disabled = true;
    try {
      if (vue.type === "canal") await envoyerMessage(vue.id, texte);
      else await envoyerPrive(vue.id, texte);
      champ.value = "";
      champ.style.height = "auto";
      erreur = "";
      await rafraichir();
      $(".chat__messages").scrollTop = $(".chat__messages").scrollHeight;
    } catch (err) {
      erreur = err.message;
      rendreFil();
    } finally {
      bouton.disabled = false;
      champ.focus();
    }
  });

  // ---------- Demarrage ----------
  (async () => {
    rendreMenu();
    rendreFil();
    bloques = new Set(await mesBlocages().catch(() => []));
    moderateur = await suisModerateur();
    await rafraichir();
    $(".chat__messages").scrollTop = $(".chat__messages").scrollHeight;
    boucle();
  })();

  return arreter;
}
