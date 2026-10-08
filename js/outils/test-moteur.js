// ==========================================================
// LABORATOIRE DU MOTEUR
// Une page de test sans graphismes : on choisit deux equipes,
// on lance des combats, et on lit ce qui s'est passe.
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { ROLES } from "../donnees/roles.js";
import { PALIERS } from "../donnees/ennemis.js";
import { simulerCombat } from "../moteur/simulation.js";
import { creerHasard, nouvelleGraine } from "../moteur/hasard.js";
import { bonusSerie } from "../moteur/stats.js";
import { nomEffet } from "../moteur/regles.js";
import { EFFETS } from "../moteur/effets.js";
import { simulerJoueur, simulerJours, mediane } from "./simulateur.js";
import { simulerJoueurV03 } from "./simulateur-v03.js";

const PLACES = ["Avant, place 1", "Avant, place 2", "Arrière, place 1", "Arrière, place 2", "Arrière, place 3"];
const EQUIPE_DEFAUT = ["ronflex", "guts", "goku", "sakura", "pikachu"];
const TYPES_FORTS = ["ultime", "ko", "passif", "fin"];

const app = document.getElementById("app");
let dernierResultat = null;

// ---------- Petits outils d'affichage ----------

const nombre = (n) => Math.round(n).toLocaleString("fr-FR");
const pourcent = (x) => `${(x * 100).toFixed(1).replace(".", ",")} %`;
const secondes = (s) => `${s.toFixed(1).replace(".", ",")} s`;

function optionsPersos(selection) {
  const series = [...new Set(PERSOS.map((p) => p.serie))];
  return series.map((serie) => `
    <optgroup label="${serie}">
      ${PERSOS.filter((p) => p.serie === serie).map((p) => `
        <option value="${p.id}" ${p.id === selection ? "selected" : ""}>${p.nom} (${ROLES[p.role].nom})</option>
      `).join("")}
    </optgroup>
  `).join("");
}

// ---------- La page ----------

app.innerHTML = `
  <main class="labo">
    <header class="labo__entete">
      <div>
        <h1 class="labo__titre">Laboratoire du moteur</h1>
        <p class="labo__intro">Choisis ton équipe et un adversaire, puis lance des combats. Tout est calculé, rien n'est encore animé.</p>
      </div>
      <a class="labo__retour" href="index.html">Retour à l'accueil</a>
    </header>

    <section class="panneau" aria-labelledby="titre-reglages">
      <h2 id="titre-reglages">Réglages</h2>
      <div class="reglages">
        <div>
          <div class="ligne-equipe">
            <span class="ligne-equipe__nom">Ton équipe</span>
            ${PLACES.map((place, i) => `
              <label class="champ">${place}
                <select data-place="${i}">${optionsPersos(EQUIPE_DEFAUT[i])}</select>
              </label>
            `).join("")}
          </div>
          <p class="bonus-serie" id="bonus-serie"></p>
          <p class="erreur" id="erreur-equipe" role="alert"></p>
        </div>

        <div>
          <label class="champ">Adversaire
            <select id="choix-palier">
              ${PALIERS.map((p) => `<option value="${p.palier}">Palier ${p.palier} : ${p.nom} (niveau ${p.niveau}, x${String(p.multiplicateur).replace(".", ",")})</option>`).join("")}
            </select>
          </label>
          <label class="champ" style="margin-top: 1rem">Niveau de ton équipe
            <input type="number" id="niveau-equipe" min="1" max="30" step="1" value="1">
          </label>
          <p class="aide" id="equipe-ennemie"></p>

          <div class="graine" style="margin-top: 1.25rem">
            <label class="champ">Graine du combat
              <input type="number" id="graine" min="0" step="1">
            </label>
            <button class="bouton bouton--petit" type="button" id="nouvelle-graine">Nouvelle graine</button>
          </div>
          <p class="aide">Même graine et mêmes équipes : exactement le même combat.</p>
        </div>
      </div>

      <div class="actions">
        <button class="bouton bouton--principal" type="button" id="lancer">Lancer le combat</button>
        <button class="bouton bouton--obi" type="button" id="serie">500 combats contre ce palier</button>
        <button class="bouton bouton--obi" type="button" id="tournoi">Tournoi d'équilibrage</button>
        <button class="bouton bouton--clair" type="button" id="tournoi-hasard">Tournoi, placement au hasard</button>
        <button class="bouton bouton--obi" type="button" id="economie">Simuler l'économie</button>
        <button class="bouton bouton--obi" type="button" id="quotidien">Simuler 2 semaines</button>
        <button class="bouton bouton--obi" type="button" id="v03">Simuler la V0.3 (30 jours)</button>
      </div>
    </section>

    <section class="panneau" id="resultats" aria-live="polite" hidden></section>
  </main>
`;

const selects = [...app.querySelectorAll("select[data-place]")];
const choixPalier = app.querySelector("#choix-palier");
const champGraine = app.querySelector("#graine");
const champNiveau = app.querySelector("#niveau-equipe");
const niveauEquipe = () => Math.min(30, Math.max(1, Number(champNiveau.value) || 1));
const equipeAvecNiveau = () => equipeChoisie().map((id) => ({ id, niveau: niveauEquipe() }));
const zoneResultats = app.querySelector("#resultats");
const boutons = [...app.querySelectorAll(".actions .bouton")];

champGraine.value = nouvelleGraine();

// ---------- Lecture des reglages ----------

function equipeChoisie() {
  return selects.map((s) => s.value);
}

function palierChoisi() {
  return PALIERS.find((p) => p.palier === Number(choixPalier.value));
}

function mettreAJourReglages() {
  const ids = equipeChoisie();
  const doublon = ids.length !== new Set(ids).size;
  app.querySelector("#erreur-equipe").textContent = doublon ? "Chaque perso ne peut être choisi qu'une fois." : "";
  boutons.slice(0, 2).forEach((b) => (b.disabled = doublon));

  // Bonus de serie actifs
  const persos = ids.map((id) => PERSOS_PAR_ID[id]);
  const vus = new Set();
  const bonus = [];
  for (const p of persos) {
    if (vus.has(p.serie)) continue;
    vus.add(p.serie);
    const b = bonusSerie(p, persos);
    if (b.atq > 0) {
      const n = persos.filter((x) => x.serie === p.serie).length;
      bonus.push(`${p.serie} x${n} (ATQ +${Math.round(b.atq * 100)} %${b.pv ? `, PV +${Math.round(b.pv * 100)} %` : ""})`);
    }
  }
  app.querySelector("#bonus-serie").textContent = bonus.length ? `Bonus de série : ${bonus.join(", ")}` : "Aucun bonus de série.";

  const palier = palierChoisi();
  app.querySelector("#equipe-ennemie").textContent =
    `Avant : ${palier.equipe.slice(0, 2).map((id) => PERSOS_PAR_ID[id].nom).join(", ")}. ` +
    `Arrière : ${palier.equipe.slice(2).map((id) => PERSOS_PAR_ID[id].nom).join(", ")}.`;
}

selects.forEach((s) => s.addEventListener("change", mettreAJourReglages));
choixPalier.addEventListener("change", mettreAJourReglages);
app.querySelector("#nouvelle-graine").addEventListener("click", () => (champGraine.value = nouvelleGraine()));
mettreAJourReglages();

// ---------- Un combat ----------

function texteEvenement(ev, nom) {
  switch (ev.type) {
    case "debut":
      return "Début du combat.";
    case "attaque": {
      let texte = `${nom(ev.source)} frappe ${nom(ev.cible)} : ${nombre(ev.degats)} dégâts`;
      if (ev.critique) texte += ", critique";
      if (ev.avantage) texte += ", avantage d'affinité";
      if (ev.absorbe) texte += ` (${nombre(ev.absorbe)} absorbés par le bouclier)`;
      return texte;
    }
    case "esquive":
      return `${nom(ev.cible)} esquive l'attaque de ${nom(ev.source)}`;
    case "annule":
      return `${ev.nom} : ${nom(ev.cible)} ne subit pas l'attaque de ${nom(ev.source)}`;
    case "ultime":
      return `${nom(ev.source)} lance ${ev.nom}`;
    case "soin":
      return ev.source === ev.cible
        ? `${nom(ev.cible)} récupère ${nombre(ev.montant)} PV`
        : `${nom(ev.source)} soigne ${nom(ev.cible)} : +${nombre(ev.montant)} PV`;
    case "effet": {
      const positif = EFFETS[ev.effet]?.positif;
      const valeur = ev.effet === "bouclier" ? ` de ${nombre(ev.valeur)} PV` : "";
      return `${nom(ev.cible)} ${positif ? "gagne" : "subit"} ${nomEffet(ev.effet)}${valeur} (${String(ev.duree).replace(".", ",")} s)`;
    }
    case "resiste":
      return `${nom(ev.cible)} résiste à ${nomEffet(ev.effet)}`;
    case "energie":
      return `${nom(ev.cible)} gagne ${ev.montant} d'énergie`;
    case "perte":
      return `${nom(ev.cible)} perd ${nombre(ev.montant)} PV (${ev.origine})`;
    case "passif":
      return `Passif de ${nom(ev.source)}, ${ev.nom} : ${ev.detail}`;
    case "ko":
      return `${nom(ev.cible)} est KO`;
    case "fin":
      if (ev.vainqueur === 0) return "Victoire de ton équipe.";
      return ev.raison === "temps" ? "Temps écoulé : défaite." : "Défaite.";
    default:
      return ev.type;
  }
}

function afficherCombat(resultat, seulementFort = false) {
  const parUid = Object.fromEntries(resultat.unites.map((u) => [u.uid, u]));
  const nom = (uid) => {
    const u = parUid[uid];
    return u ? `<span class="nom nom--${u.camp === 0 ? "a" : "b"}">${u.nom}</span>` : "?";
  };

  const victoire = resultat.vainqueur === 0;
  const raison = resultat.raison === "temps" ? "Temps écoulé au bout de 90 secondes." : `Combat terminé en ${secondes(resultat.duree)}.`;

  const lignes = resultat.journal
    .filter((ev) => !seulementFort || TYPES_FORTS.includes(ev.type))
    .map((ev) => `
      <li class="${TYPES_FORTS.includes(ev.type) ? "fort" : ""} ${ev.type === "ultime" ? "ultime" : ""}">
        <span class="journal__temps">${secondes(ev.t / 10)}</span>
        <span>${texteEvenement(ev, nom)}</span>
      </li>
    `).join("");

  zoneResultats.hidden = false;
  zoneResultats.innerHTML = `
    <h2 class="resultat-titre resultat-titre--${victoire ? "victoire" : "defaite"}">${victoire ? "Victoire" : "Défaite"}</h2>
    <p class="resultat-detail">${raison} Graine ${champGraine.value}.</p>

    <div class="defile">
      <table>
        <thead>
          <tr>
            <th>Perso</th><th>Camp</th>
            <th class="nombre">PV restants</th><th class="nombre">Dégâts infligés</th>
            <th class="nombre">Dégâts reçus</th><th class="nombre">Soins</th>
          </tr>
        </thead>
        <tbody>
          ${resultat.unites.map((u) => `
            <tr class="${u.pv <= 0 ? "ko" : ""}">
              <td>${nom(u.uid)}</td>
              <td>${u.camp === 0 ? "Toi" : "Ennemi"}</td>
              <td class="nombre">${u.pv <= 0 ? "KO" : `${nombre(u.pv)} / ${nombre(u.pvMax)}`}</td>
              <td class="nombre">${nombre(u.bilan.inflige)}</td>
              <td class="nombre">${nombre(u.bilan.recu)}</td>
              <td class="nombre">${nombre(u.bilan.soins)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <label class="journal__options">
      <input type="checkbox" id="seulement-fort" ${seulementFort ? "checked" : ""}>
      Afficher seulement les moments forts
    </label>
    <ol class="journal">${lignes}</ol>
  `;

  zoneResultats.querySelector("#seulement-fort").addEventListener("change", (e) => {
    afficherCombat(resultat, e.target.checked);
  });
}

app.querySelector("#lancer").addEventListener("click", () => {
  const palier = palierChoisi();
  dernierResultat = simulerCombat({
    equipeA: equipeAvecNiveau(),
    equipeB: palier.equipe,
    niveauB: palier.niveau,
    multiplicateurB: palier.multiplicateur,
    graine: Number(champGraine.value) || 0,
  });
  afficherCombat(dernierResultat);
});

// ---------- Plusieurs combats a la suite (sans bloquer la page) ----------

async function enBoucle(total, faire, progression) {
  boutons.forEach((b) => (b.disabled = true));
  for (let i = 0; i < total; i++) {
    faire(i);
    if (i % 50 === 49) {
      progression(i + 1);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  boutons.forEach((b) => (b.disabled = false));
  mettreAJourReglages();
}

function afficherProgression(titre, fait, total) {
  zoneResultats.hidden = false;
  zoneResultats.innerHTML = `<h2>${titre}</h2><p class="progression">Calcul en cours : ${Math.round((fait / total) * 100)} %</p>`;
}

app.querySelector("#serie").addEventListener("click", async () => {
  const palier = palierChoisi();
  const equipe = equipeAvecNiveau();
  const total = 500;
  let victoires = 0, duree = 0, tempsEcoule = 0;

  await enBoucle(total, (i) => {
    const r = simulerCombat({ equipeA: equipe, equipeB: palier.equipe, niveauB: palier.niveau, multiplicateurB: palier.multiplicateur, graine: i + 1, journal: false });
    if (r.vainqueur === 0) victoires++;
    if (r.raison === "temps") tempsEcoule++;
    duree += r.duree;
  }, (fait) => afficherProgression("500 combats", fait, total));

  zoneResultats.innerHTML = `
    <h2>500 combats contre le palier ${palier.palier} : ${palier.nom}, avec ton équipe au niveau ${niveauEquipe()}</h2>
    <div class="chiffres">
      <div><div class="chiffre__valeur">${pourcent(victoires / total)}</div><div class="chiffre__nom">de victoires (${victoires} sur ${total})</div></div>
      <div><div class="chiffre__valeur">${secondes(duree / total)}</div><div class="chiffre__nom">durée moyenne</div></div>
      <div><div class="chiffre__valeur">${tempsEcoule}</div><div class="chiffre__nom">combats perdus au temps</div></div>
    </div>
    <p class="aide">Les graines vont de 1 à 500 : relancer donne toujours le même résultat, tant que les règles ne changent pas.</p>
  `;
});

// Tournoi d'equilibrage. Par defaut, les equipes sont rangees comme un joueur le ferait
// (tanks et attaquants devant, assassins derriere) : sinon les assassins se retrouvent
// souvent devant, meurent vite, et le desequilibre des roles ne se voit plus.
async function tournoi({ realiste }) {
  const total = realiste ? 6000 : 3000;
  const hasard = creerHasard(2026);
  const ids = PERSOS.map((p) => p.id);
  const stats = Object.fromEntries(ids.map((id) => [id, { matchs: 0, victoires: 0, degats: 0, soins: 0 }]));
  let duree = 0;
  const ordreDevant = ["tank", "attaquant", "controle", "soutien", "assassin"];
  const ranger = (equipe) => {
    const avant = [...equipe].sort((a, b) => ordreDevant.indexOf(PERSOS_PAR_ID[a].role) - ordreDevant.indexOf(PERSOS_PAR_ID[b].role)).slice(0, 2);
    return [...avant, ...equipe.filter((i) => !avant.includes(i))];
  };
  const tirerEquipe = (reserve) => {
    const equipe = Array.from({ length: 5 }, () => reserve.splice(Math.floor(hasard.nombre() * reserve.length), 1)[0]);
    return realiste ? ranger(equipe) : equipe;
  };
  const niveau = realiste ? 30 : 1;

  await enBoucle(total, (i) => {
    const reserve = [...ids];
    // Tournoi a egalite : sans bonus de rarete, pour comparer les kits entre eux
    const r = simulerCombat({
      equipeA: tirerEquipe(reserve).map((id) => ({ id, niveau })),
      equipeB: tirerEquipe(reserve).map((id) => ({ id, niveau })),
      avecRarete: false, graine: i + 1, journal: false,
    });
    duree += r.duree;
    for (const u of r.unites) {
      const s = stats[u.id];
      s.matchs++;
      s.degats += u.bilan.inflige;
      s.soins += u.bilan.soins;
      if (r.raison === "ko" && u.camp === r.vainqueur) s.victoires++;
    }
  }, (fait) => afficherProgression("Tournoi d'équilibrage", fait, total));

  const lignes = ids
    .map((id) => ({ perso: PERSOS_PAR_ID[id], ...stats[id], taux: stats[id].victoires / Math.max(1, stats[id].matchs) }))
    .sort((a, b) => b.taux - a.taux);
  const parRole = Object.keys(ROLES).map((r) => {
    const l = lignes.filter((x) => x.perso.role === r);
    return { nom: ROLES[r].nom, taux: l.reduce((t, x) => t + x.taux, 0) / Math.max(1, l.length) };
  }).sort((a, b) => b.taux - a.taux);

  zoneResultats.innerHTML = `
    <h2>Tournoi d'équilibrage : ${nombre(total)} combats entre équipes tirées au hasard${realiste ? ", rangées comme un joueur" : ", placées au hasard"}</h2>
    <p class="resultat-detail">Durée moyenne d'un combat : ${secondes(duree / total)}. Les persos sont comparés à égalité (niveau ${niveau}, sans bonus de rareté). ${realiste
      ? "Chaque équipe est rangée comme dans le jeu : tanks et attaquants devant, assassins derrière."
      : "Les places sont tirées au hasard : ce mode cache le poids des rôles, il sert seulement à tester la robustesse au placement."} Un perso bien équilibré gagne autour de 50 % de ses combats. Le hasard fait varier chaque résultat d'environ 2 points.</p>
    <p class="resultat-detail">Par rôle : ${parRole.map((r) => `${r.nom} ${pourcent(r.taux)}`).join(", ")}.</p>
    <div class="defile">
      <table>
        <thead>
          <tr>
            <th>Perso</th><th>Série</th><th>Rôle</th>
            <th class="nombre">Victoires</th><th class="nombre">Dégâts moyens</th><th class="nombre">Soins moyens</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${lignes.map((l) => `
            <tr>
              <td><strong>${l.perso.nom}</strong></td>
              <td>${l.perso.serie}</td>
              <td>${ROLES[l.perso.role].nom}</td>
              <td class="nombre">${pourcent(l.taux)}</td>
              <td class="nombre">${nombre(l.degats / l.matchs)}</td>
              <td class="nombre">${nombre(l.soins / l.matchs)}</td>
              <td>${l.taux > 0.58 ? '<span class="etiquette etiquette--fort">Trop fort ?</span>' : l.taux < 0.42 ? '<span class="etiquette etiquette--faible">Trop faible ?</span>' : ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

app.querySelector("#tournoi").addEventListener("click", () => tournoi({ realiste: true }));
app.querySelector("#tournoi-hasard").addEventListener("click", () => tournoi({ realiste: false }));

// ---------- Simulateur d'economie : 20 joueurs virtuels ----------

app.querySelector("#economie").addEventListener("click", async () => {
  const total = 20;
  const resultats = [];
  boutons.forEach((b) => (b.disabled = true));
  for (let i = 0; i < total; i++) {
    afficherProgression("Simulation de l'économie", i, total);
    await new Promise((r) => setTimeout(r, 0));
    resultats.push(simulerJoueur({ graine: i + 1, heros: ["naruto", "luffy", "tanjiro"][i % 3], heuresMax: 10 }));
  }
  boutons.forEach((b) => (b.disabled = false));
  mettreAJourReglages();

  const lignesPaliers = PALIERS.map((p) => {
    const temps = resultats.map((r) => r.jalons[p.palier]).filter((x) => x !== undefined);
    return `<tr><td>Palier ${p.palier} : ${p.nom}</td><td class="nombre">${temps.length} sur ${total}</td><td class="nombre">${temps.length ? `${Math.round(mediane(temps))} min` : "jamais"}</td></tr>`;
  }).join("");
  const lignesHeures = [1, 2, 4, 6].map((h) => {
    const b = resultats.map((r) => r.bilans.find((x) => x.heure === h)).filter(Boolean);
    return b.length ? `<tr><td>Après ${h} h</td><td class="nombre">${mediane(b.map((x) => x.collection))} sur ${PERSOS.length}</td><td class="nombre">${mediane(b.map((x) => x.palier))}</td></tr>` : "";
  }).join("");

  zoneResultats.innerHTML = `
    <h2>Simulation de l'économie : ${total} joueurs virtuels, 10 h de jeu au plus</h2>
    <p class="resultat-detail">Chaque joueur prend sa meilleure équipe, tente le palier suivant, s'entraîne sur le précédent après 2 défaites, et fait un tirage x10 dès qu'il a 900 d'encre. Un combat compte pour sa durée en vitesse x2, plus 10 secondes de menus.</p>
    <div class="defile"><table>
      <thead><tr><th>Palier</th><th class="nombre">Joueurs qui l'ont battu</th><th class="nombre">Temps médian</th></tr></thead>
      <tbody>${lignesPaliers}</tbody>
    </table></div>
    <div class="defile" style="margin-top: 1.25rem"><table>
      <thead><tr><th>Moment</th><th class="nombre">Collection médiane</th><th class="nombre">Palier médian battu</th></tr></thead>
      <tbody>${lignesHeures}</tbody>
    </table></div>
  `;
});

// ---------- Simulateur quotidien : 45 min de jeu par jour + expedition ----------

app.querySelector("#quotidien").addEventListener("click", async () => {
  const total = 16;
  const resultats = [];
  boutons.forEach((b) => (b.disabled = true));
  for (let i = 0; i < total; i++) {
    afficherProgression("Simulation de 2 semaines", i, total);
    await new Promise((r) => setTimeout(r, 0));
    resultats.push(simulerJours({ graine: i + 1, heros: ["naruto", "luffy", "tanjiro"][i % 3], minutesParJour: 45, jours: 14 }));
  }
  boutons.forEach((b) => (b.disabled = false));
  mettreAJourReglages();

  const lignes = PALIERS.map((p) => {
    const jours = resultats.map((r) => r.jalons[p.palier]).filter((x) => x !== undefined);
    return `<tr><td>Palier ${p.palier} : ${p.nom}</td><td class="nombre">${jours.length} sur ${total}</td><td class="nombre">${jours.length ? `jour ${mediane(jours)}` : "pas en 2 semaines"}</td></tr>`;
  }).join("");
  const jours = [1, 3, 7, 14].map((d) => {
    const b = resultats.map((r) => r.bilans.find((x) => x.jour === d)).filter(Boolean);
    return b.length ? `<tr><td>Jour ${d}</td><td class="nombre">${mediane(b.map((x) => x.collection))} sur ${PERSOS.length}</td><td class="nombre">${mediane(b.map((x) => x.palier))}</td></tr>` : "";
  }).join("");

  zoneResultats.innerHTML = `
    <h2>Simulation de 2 semaines : ${total} joueurs, 45 minutes de jeu par jour</h2>
    <p class="resultat-detail">Le reste du temps, l'expédition tourne (12 h au plus par jour). Les joueurs s'arrêtent quand les 10 paliers sont battus.</p>
    <div class="defile"><table>
      <thead><tr><th>Palier</th><th class="nombre">Joueurs qui l'ont battu</th><th class="nombre">Jour médian</th></tr></thead>
      <tbody>${lignes}</tbody>
    </table></div>
    <div class="defile" style="margin-top: 1.25rem"><table>
      <thead><tr><th>Moment</th><th class="nombre">Collection médiane</th><th class="nombre">Palier médian battu</th></tr></thead>
      <tbody>${jours}</tbody>
    </table></div>
  `;
});

// ---------- Simulateur V0.3 : campagne, chasse, equipement, 45 min par jour ----------

app.querySelector("#v03").addEventListener("click", async () => {
  const total = 8;
  const resultats = [];
  boutons.forEach((b) => (b.disabled = true));
  for (let i = 0; i < total; i++) {
    afficherProgression("Simulation de la V0.3", i, total);
    await new Promise((r) => setTimeout(r, 0));
    resultats.push(simulerJoueurV03({ graine: i + 1, heros: ["naruto", "luffy", "tanjiro"][i % 3], minutesParJour: 45, jours: 30 }));
  }
  boutons.forEach((b) => (b.disabled = false));
  mettreAJourReglages();

  const chapitres = [1, 2, 3, 4, 5].map((c) => {
    const jours = resultats.map((r) => r.jalons[c]).filter((x) => x !== undefined);
    return `<tr><td>Chapitre ${c}</td><td class="nombre">${jours.length} sur ${total}</td><td class="nombre">${jours.length ? `jour ${mediane(jours)}` : "pas en 30 jours"}</td></tr>`;
  }).join("");
  const jours = [1, 3, 7, 14, 21].map((d) => {
    const b = resultats.map((r) => r.bilans.find((x) => x.jour === d)).filter(Boolean);
    return b.length ? `<tr><td>Jour ${d}</td><td class="nombre">${mediane(b.map((x) => x.etape))} / 40</td><td class="nombre">${mediane(b.map((x) => x.niveau))}</td><td class="nombre">${mediane(b.map((x) => x.collection))}</td><td class="nombre">+${mediane(b.map((x) => x.ameliorationMoyenne)).toFixed(1).replace(".", ",")}</td></tr>` : "";
  }).join("");

  zoneResultats.innerHTML = `
    <h2>Simulation de la V0.3 : ${total} joueurs, 45 minutes par jour, 30 jours au plus</h2>
    <p class="resultat-detail">Les joueurs avancent en campagne, chassent en boucle quand ils bloquent, équipent le meilleur, améliorent leurs pièces, tirent dès qu'ils ont 900 d'encre et récupèrent leur expédition chaque jour.</p>
    <div class="defile"><table>
      <thead><tr><th>Chapitre</th><th class="nombre">Joueurs qui l'ont fini</th><th class="nombre">Jour médian</th></tr></thead>
      <tbody>${chapitres}</tbody>
    </table></div>
    <div class="defile" style="margin-top: 1.25rem"><table>
      <thead><tr><th>Moment</th><th class="nombre">Étape</th><th class="nombre">Niveau</th><th class="nombre">Collection</th><th class="nombre">Amélioration moyenne</th></tr></thead>
      <tbody>${jours}</tbody>
    </table></div>
  `;
});
