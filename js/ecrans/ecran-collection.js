// ==========================================================
// COLLECTION : l'etagere des persos et l'inventaire d'equipement
// ==========================================================

import { PERSOS, PERSOS_PAR_ID } from "../donnees/persos.js";
import { RARETES, ORDRE_RARETES } from "../donnees/raretes.js";
import { EMPLACEMENTS, ORDRE_EMPLACEMENTS, NIVEAU_MAX_PIECE } from "../donnees/equipement.js";
import { PANOPLIES } from "../donnees/panoplies.js";
import { OBJETS } from "../donnees/objets.js";
import { ZONES } from "../donnees/zones.js";
import { nomPiece, objetDe, coutAmelioration, coutRetouche, fourchetteLigne, ligneParfaite, valeurLigne, pieceParfaite } from "../moteur/equipement.js";
import {
  possede, progressionDe, idsPossedes, vedette, definirVedette, equiperMeilleur,
  inventaire, pieceParUid, eclats, ameliorerPiece, recyclerPiece, recyclerCommunesLibres,
  basculerVerrou, equiperPiece, retirerPiece, gainRecyclage, objetsDecouverts,
  retoucherLigne, retouchePendante, choisirRetouche, sublimerLigne, ressources, eveiller, choisirTalent, victoiresLien,
  verifierTampons, tamponsObtenus, tamponsNouveaux, marquerTamponsVus, titresObtenus, titreActuel, choisirTitre,
  cadresObtenus, cadreActuel, choisirCadre,
} from "../services/partie.js";
import { NOMS_STATS } from "../donnees/equipement.js";
import { chargerPortraits } from "../services/portraits.js";
import { htmlPortrait, rafraichirPortrait, htmlCarteStatique, nomBordure } from "../ui/cartes.js";
import { varsSerie, motifSerie, styleSerie } from "../donnees/series.js";
import { editionDeSerie } from "../donnees/boosters.js";
import { htmlFiche } from "../ui/fiche.js";
import { jouerEveil } from "../ui/eveil.js";
import { jouerScene } from "../ui/scene.js";
import { annoncerTampons } from "../ui/toast.js";
import { TAMPONS, PAGES } from "../donnees/tampons.js";
import { CADRES } from "../donnees/saisons.js";
import { LIENS, LIENS_PAR_CLE, niveauLien, VICTOIRES_DECOUVERTE, BONUS_PAR_NIVEAU_LIEN } from "../donnees/liens.js";
import { ouvrirChoixPiece, htmlDetailsPiece, iconeEmplacement, ligneTexte, texteOrigine, htmlPieceCarte } from "../ui/equipement-ui.js";
import { htmlNavigation, brancherNavigation } from "../ui/navigation.js";
import { afficherHotel } from "../ui/hotel.js";

export function afficherCollection(conteneur, { naviguer, onglet = "persos" }) {
  const series = [...new Set(PERSOS.map((p) => p.serie))];
  const total = PERSOS.length;
  let filtres = { emplacement: "tous", rarete: "toutes", ensemble: "tous" };
  let zoneEncyclo = 1;

  conteneur.innerHTML = `
    ${htmlNavigation("collection")}
    <div class="collection">
      <header class="collection__entete">
        <h1 class="equipe__titre">Collection</h1>
        <div class="onglets-collection" role="tablist" aria-label="Collection">
          <button type="button" role="tab" class="onglet-collection" data-action="onglet" data-onglet="persos">Persos</button>
          <button type="button" role="tab" class="onglet-collection" data-action="onglet" data-onglet="equipement">Équipement</button>
          <button type="button" role="tab" class="onglet-collection" data-action="onglet" data-onglet="hotel">Hôtel des ventes</button>
          <button type="button" role="tab" class="onglet-collection" data-action="onglet" data-onglet="encyclopedie">Encyclopédie</button>
          <button type="button" role="tab" class="onglet-collection" data-action="onglet" data-onglet="liens">Liens</button>
          <button type="button" role="tab" class="onglet-collection" data-action="onglet" data-onglet="carnet">Carnet</button>
        </div>
      </header>
      <div class="collection__contenu" id="contenu"></div>
    </div>
    <div id="fiche"></div>
  `;

  const $ = (sel) => conteneur.querySelector(sel);
  const majNavigation = brancherNavigation(conteneur, naviguer, "collection");

  // ---------- Onglet persos : l'etagere ----------

  function htmlTome(p) {
    if (!possede(p.id)) {
      return `
        <div class="carte-manquante carte-manquante--${p.rarete}" data-motif="${motifSerie(p.serie)}" style="${varsSerie(p.serie)}" aria-label="${p.nom}, ${RARETES[p.rarete].nom}, à obtenir">
          <span class="carte-manquante__visuel">
            ${htmlPortrait(p)}
            <span class="carte-manquante__cadenas" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0110 0v2h1.5v11h-13V10zm2 0h6V8a3 3 0 00-6 0z" fill="currentColor"/></svg></span>
            <span class="obi-rarete obi-rarete--${p.rarete}">${RARETES[p.rarete].nom}</span>
          </span>
          <span class="carte-manquante__nom">${p.nom}</span>
          <span class="carte-manquante__info">À obtenir</span>
        </div>`;
    }
    const prog = progressionDe(p.id);
    const variantes = prog.variantes ?? [];
    const carte = htmlCarteStatique(p, { progression: prog });
    return `
      <button type="button" class="carte-collection" data-action="fiche" data-perso="${p.id}" aria-label="${p.nom}, niveau ${prog.niveau}, ${prog.etoiles} étoiles${variantes.length ? `, versions : ${variantes.join(", ")}` : ""}. Voir sa fiche.">
        ${carte}
        ${prog.eveil ? `<span class="badge-eveil carte-collection__eveil">覚醒 ${["", "I", "II", "III", "IV"][prog.eveil]}</span>` : ""}
        ${variantes.length ? `<span class="carte-collection__variantes">${variantes.map((v) => `<span class="badge-variante badge-variante--${v}">${nomBordure(v)}</span>`).join("")}</span>` : ""}
      </button>`;
  }

  function htmlEnteteSerie(serie) {
    const membres = PERSOS.filter((p) => p.serie === serie);
    const n = membres.filter((p) => possede(p.id)).length;
    const st = styleSerie(serie);
    const edition = editionDeSerie(serie);
    return `
      <header class="entete-serie" data-motif="${motifSerie(serie)}" style="${varsSerie(serie)}">
        <span class="entete-serie__medaillon" aria-hidden="true">${st.abrege}</span>
        <span class="entete-serie__titre"><h2 class="etagere__serie">${serie}</h2>${edition ? `<span class="entete-serie__edition">${edition.nom}</span>` : ""}</span>
        <span class="entete-serie__compte ${n === membres.length ? "entete-serie__compte--complet" : ""}"><span class="entete-serie__nombre"><strong>${n}</strong> / ${membres.length}</span><span class="entete-serie__jauge"><span style="--v: ${n / membres.length}"></span></span></span>
      </header>`;
  }

  function rendrePersos() {
    const obtenus = idsPossedes().length;
    $("#contenu").innerHTML = `
      <div class="collection__progression">
        <p><strong>${obtenus} sur ${total}</strong> persos obtenus</p>
        <span class="barre-xp"><span class="barre-xp__rempli barre-pitie" style="--xp: ${obtenus / total}"></span></span>
      </div>
      <div class="etageres">
        ${series.map((serie) => `
          <section class="etagere etagere--cartes" aria-label="${serie}">
            ${htmlEnteteSerie(serie)}
            <div class="etagere__rang etagere__rang--cartes">${PERSOS.filter((p) => p.serie === serie).map(htmlTome).join("")}</div>
          </section>`).join("")}
      </div>`;
  }

  function ouvrirFiche(id) {
    const p = PERSOS_PAR_ID[id];
    $("#fiche").innerHTML = `
      <div class="voile" data-action="fermer-fiche">
        <div class="resultat fiche" role="dialog" aria-modal="true" aria-label="Fiche de ${p.nom}">
          <div class="detail detail--fiche">${htmlFiche(p, progressionDe(id), { avecDoublons: true })}</div>
          <div class="resultat__actions">
            ${vedette() === id
              ? '<p class="fiche__vedette">En vedette au QG</p>'
              : `<button type="button" class="bouton bouton--obi" data-action="vedette" data-perso="${id}">Mettre en vedette au QG</button>`}
            <button type="button" class="bouton bouton--clair" data-action="fermer-fiche">Fermer</button>
          </div>
        </div>
      </div>`;
    $("#fiche .resultat__actions .bouton").focus();
  }

  // ---------- Onglet equipement : l'inventaire ----------

  function piecesFiltrees() {
    return inventaire()
      .filter((p) => filtres.emplacement === "tous" || p.emplacement === filtres.emplacement)
      .filter((p) => filtres.rarete === "toutes" || p.rarete === filtres.rarete)
      .filter((p) => filtres.ensemble === "tous" || p.panoplie === filtres.ensemble)
      .sort((a, b) => RARETES[b.rarete].ordre - RARETES[a.rarete].ordre || b.niveau - a.niveau);
  }

  function rendreEquipement(message = "") {
    const toutes = inventaire();
    const communesLibres = toutes.filter((p) => p.rarete === "commun" && !p.porteur && !p.verrou).length;
    const liste = piecesFiltrees();
    const option = (val, texte, actuel) => `<option value="${val}" ${val === actuel ? "selected" : ""}>${texte}</option>`;

    $("#contenu").innerHTML = `
      <div class="inventaire__barre">
        <p class="inventaire__eclats"><span class="eclat" aria-hidden="true"></span><strong>${eclats().toLocaleString("fr-FR")}</strong> éclats d'encre</p>
        <p class="case__aide">${toutes.length} pièce${toutes.length > 1 ? "s" : ""} sur 150</p>
        <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="recycler-communes" ${communesLibres ? "" : "disabled"}>Recycler les Communes libres (${communesLibres})</button>
      </div>
      <div class="inventaire__filtres">
        <div class="filtres" role="group" aria-label="Filtrer par emplacement">
          ${["tous", ...ORDRE_EMPLACEMENTS].map((e) => `
            <button type="button" class="filtre" data-action="filtre-emplacement" data-valeur="${e}" aria-pressed="${filtres.emplacement === e}">
              ${e === "tous" ? "Tout" : `${iconeEmplacement(e)}${EMPLACEMENTS[e].nom}`}
            </button>`).join("")}
        </div>
        <label class="champ-compact">Rareté
          <select data-action="filtre-rarete">
            ${option("toutes", "Toutes", filtres.rarete)}${ORDRE_RARETES.map((r) => option(r, RARETES[r].nom, filtres.rarete)).join("")}
          </select>
        </label>
        <label class="champ-compact">Panoplie
          <select data-action="filtre-ensemble">
            ${option("tous", "Toutes", filtres.ensemble)}${Object.entries(PANOPLIES).map(([k, e]) => option(k, e.nom, filtres.ensemble)).join("")}
          </select>
        </label>
      </div>
      <p class="case__message" role="status" aria-live="polite">${message}</p>
      ${liste.length ? `
        <div class="inventaire">
          ${liste.map((p) => htmlPieceCarte(p, {
            attributs: `data-action="piece" data-uid="${p.uid}" aria-label="${nomPiece(p)}, ${RARETES[p.rarete].nom}${p.niveau ? `, +${p.niveau}` : ""}${p.porteur ? `, portée par ${PERSOS_PAR_ID[p.porteur].nom}` : ""}"`,
            porteur: p.porteur, verrou: p.verrou, parfaite: pieceParfaite(p),
          })).join("")}
        </div>`
        : `<p class="case__aide">${toutes.length ? "Aucune pièce ne correspond à ces filtres." : "Aucune pièce pour l'instant : va chasser dans les zones de l'Aventure pour en trouver."}</p>`}
    `;
  }

  function ouvrirPiece(uid, message = "") {
    const p = pieceParUid(uid);
    if (!p) return fermerFenetre();
    const cout = coutAmelioration(p.niveau);
    const auMax = p.niveau >= NIVEAU_MAX_PIECE;
    const options = idsPossedes().map((id) => `<option value="${id}" ${id === p.porteur ? "selected" : ""}>${PERSOS_PAR_ID[id].nom}</option>`).join("");
    $("#fiche").innerHTML = `
      <div class="voile" data-action="fermer-fiche">
        <div class="resultat fenetre-piece piece--${p.rarete}" role="dialog" aria-modal="true" aria-label="${nomPiece(p)}">
          ${htmlDetailsPiece(p)}
          ${p.panoplie ? `<p class="case__aide">Panoplie ${PANOPLIES[p.panoplie].nom} : 2 pièces, ${PANOPLIES[p.panoplie].textes[2]} ; 3 pièces, ${PANOPLIES[p.panoplie].textes[3]} ; 4 pièces, ${PANOPLIES[p.panoplie].textes[4]}.</p>` : ""}
          <div class="fenetre-piece__actions">
            <button type="button" class="bouton bouton--obi bouton--petit-texte" data-action="ameliorer" data-uid="${uid}" ${auMax || eclats() < cout ? "disabled" : ""}>
              ${auMax ? "Niveau maximum" : `Améliorer à +${p.niveau + 1} (${cout} éclats)`}
            </button>
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="verrou" data-uid="${uid}">${p.verrou ? "Retirer le cadenas" : "Protéger (cadenas)"}</button>
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="recycler" data-uid="${uid}" ${p.verrou || p.porteur ? "disabled" : ""}>Recycler (+${gainRecyclage(p)} éclats)</button>
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="vendre-hotel" data-uid="${uid}" ${p.verrou ? "disabled" : ""}>Vendre à l'hôtel</button>
          </div>
          ${htmlRetouche(p)}
          <div class="fenetre-piece__porteur">
            <label class="champ-compact">Portée par
              <select data-action="porteur" data-uid="${uid}">
                <option value="" ${p.porteur ? "" : "selected"}>Personne</option>${options}
              </select>
            </label>
          </div>
          <p class="case__message" role="status" aria-live="polite">${message}</p>
          <div class="resultat__actions">
            <button type="button" class="bouton bouton--clair" data-action="fermer-fiche">Fermer</button>
          </div>
        </div>
      </div>`;
  }

  // La retouche a l'encre : repasser une ligne, puis choisir l'ancien ou le nouveau jet
  function htmlRetouche(p) {
    const pendante = retouchePendante(p.uid);
    const fmt = (stat, v) => `${String(Math.round(v * 10) / 10).replace(".", ",")}${/Pct$|butin/.test(stat) ? " %" : ""}`;
    if (pendante) {
      const l = p.lignes[pendante.index];
      const mieux = pendante.valeur > l.valeur;
      return `
        <div class="retouche retouche--choix">
          <p class="detail__type">Retouche à l'encre : ${NOMS_STATS[l.stat]}</p>
          <div class="retouche__comparaison">
            <div class="retouche__case"><span>Ancien jet</span><strong>${fmt(l.stat, l.valeur)}</strong></div>
            <div class="retouche__case retouche__case--nouveau ${mieux ? "retouche__case--mieux" : ""}"><span>Nouveau jet</span><strong>${fmt(l.stat, pendante.valeur)}</strong></div>
          </div>
          <div class="fenetre-piece__actions">
            <button type="button" class="bouton bouton--obi bouton--petit-texte" data-action="garder-retouche" data-uid="${p.uid}" data-nouveau="1">Garder le nouveau</button>
            <button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="garder-retouche" data-uid="${p.uid}" data-nouveau="0">Garder l'ancien</button>
          </div>
        </div>`;
    }
    const cout = coutRetouche(p);
    return `
      <div class="retouche">
        <p class="detail__type">Retouche à l'encre</p>
        <p class="case__aide">Repasse une ligne pour la retirer dans sa fourchette, puis choisis le jet que tu gardes. Coût : ${cout} éclats (il augmente à chaque retouche de cet objet). Une ligne parfaite peut être sublimée avec une encre sacrée (tu en as ${ressources().encreSacree}) : elle dépasse alors son maximum de 15 %, une seule fois par objet.</p>
        <ul class="retouche__lignes">
          ${p.lignes.map((l, i) => {
            const [min, max] = fourchetteLigne(p, i);
            const parfaite = ligneParfaite(p, i);
            const remplissage = max > min ? (l.valeur - min) / (max - min) : 1;
            return `
              <li class="${parfaite ? "ligne-parfaite" : ""}">
                <span class="retouche__stat">${NOMS_STATS[l.stat]}</span>
                <span class="retouche__jauge" title="Fourchette : ${fmt(l.stat, min)} à ${fmt(l.stat, max)}"><span style="--jet: ${remplissage}"></span></span>
                <span class="retouche__valeur">${fmt(l.stat, l.valeur)} <small>/ ${fmt(l.stat, max)}</small></span>
                ${p.sublime === i
                  ? '<span class="marque-parfaite marque-sublimee">Sublimée</span>'
                  : parfaite && p.sublime === undefined && ressources().encreSacree > 0
                  ? `<button type="button" class="bouton bouton--obi bouton--petit-texte" data-action="sublimer" data-uid="${p.uid}" data-index="${i}">Sublimer</button>`
                  : `<button type="button" class="bouton bouton--clair bouton--petit-texte" data-action="retoucher" data-uid="${p.uid}" data-index="${i}" ${eclats() < cout || parfaite ? "disabled" : ""}>${parfaite ? "Parfait" : "Repasser"}</button>`}
              </li>`;
          }).join("")}
        </ul>
      </div>`;
  }

  function fermerFenetre() {
    $("#fiche").innerHTML = "";
  }

  // ---------- Onglet encyclopedie : les 100 objets ----------

  function rendreEncyclopedie() {
    const trouves = new Set(objetsDecouverts());
    const zone = ZONES.find((z) => z.id === zoneEncyclo) ?? { id: 6, nom: "Tour", niveaux: [35, 50] };
    const liste = OBJETS.filter((o) => o.zone === zoneEncyclo);
    $("#contenu").innerHTML = `
      <div class="collection__progression">
        <p><strong>${trouves.size} sur ${OBJETS.length}</strong> objets découverts</p>
        <span class="barre-xp"><span class="barre-xp__rempli barre-pitie" style="--xp: ${trouves.size / OBJETS.length}"></span></span>
      </div>
      <div class="filtres" role="group" aria-label="Zone">
        ${[...ZONES, { id: 6, nom: "Tour", niveaux: [35, 50] }].map((z) => {
          const n = OBJETS.filter((o) => o.zone === z.id && trouves.has(o.id)).length;
          return `<button type="button" class="filtre" data-action="zone-encyclo" data-zone="${z.id}" aria-pressed="${z.id === zoneEncyclo}">${z.nom} <em>${n}/20</em></button>`;
        }).join("")}
      </div>
      <p class="case__aide">Niveaux ${zone.niveaux[0]} à ${zone.niveaux[1]}. Les objets non trouvés montrent leurs fourchettes de stats et l'endroit où les chercher.</p>
      <div class="encyclopedie">
        ${liste.map((o) => `
          <article class="encyclo-objet piece--${o.rarete} ${trouves.has(o.id) ? "" : "encyclo-objet--inconnu"}">
            <div class="encyclo-objet__icone">${iconeEmplacement(o.emplacement)}</div>
            ${htmlDetailsPiece(null, { objet: o })}
            <p class="encyclo-objet__origine">${trouves.has(o.id) ? "Trouvé" : "Pas encore trouvé"}, ${texteOrigine(o)}</p>
          </article>`).join("")}
      </div>`;
  }

  // ---------- Onglet liens : l'album des duos ----------

  function rendreLiens() {
    const trouves = LIENS.filter((x) => victoiresLien(x.cle) >= VICTOIRES_DECOUVERTE).length;
    $("#contenu").innerHTML = `
      <div class="collection__progression">
        <p><strong>${trouves} sur ${LIENS.length}</strong> liens découverts</p>
        <span class="barre-xp"><span class="barre-xp__rempli barre-pitie" style="--xp: ${trouves / LIENS.length}"></span></span>
      </div>
      <p class="case__aide">Certains persos de séries différentes s'entendent à merveille. Gagne 10 combats avec les deux dans la même équipe pour découvrir leur lien, puis continue pour le faire monter jusqu'au niveau 5 : +${BONUS_PAR_NIVEAU_LIEN} % de PV et d'ATQ par niveau pour les deux, quand ils combattent ensemble.</p>
      <div class="album-liens">
        ${LIENS.map((x) => {
          const v = victoiresLien(x.cle);
          const niveau = niveauLien(v);
          const a = PERSOS_PAR_ID[x.a], b = PERSOS_PAR_ID[x.b];
          if (!niveau) {
            return `
              <article class="lien lien--cache">
                <p class="lien__nom">Lien caché</p>
                <p class="case__aide">Un perso de ${a.serie} et un perso de ${b.serie}.</p>
                ${v ? `<span class="barre-xp"><span class="barre-xp__rempli" style="--xp: ${v / VICTOIRES_DECOUVERTE}"></span></span>` : ""}
              </article>`;
          }
          const prochain = niveau < 5 ? VICTOIRES_DECOUVERTE + (niveau) * 25 : null;
          return `
            <article class="lien">
              <div class="lien__duo">
                <span class="lien__visage">${htmlPortrait(a)}</span>
                <span class="lien__plus" aria-hidden="true">×</span>
                <span class="lien__visage">${htmlPortrait(b)}</span>
              </div>
              <p class="lien__nom">${x.nom}</p>
              <p class="case__aide">${a.nom} et ${b.nom}, niveau ${niveau} sur 5 : +${niveau * BONUS_PAR_NIVEAU_LIEN} % de PV et d'ATQ ensemble.</p>
              ${prochain ? `<p class="case__aide">${v} victoires ensemble, prochain niveau à ${prochain}.</p>` : '<p class="case__aide">Lien au maximum !</p>'}
              <button type="button" class="bouton-texte" data-action="scene-lien" data-cle="${x.cle}">Revoir leur scène</button>
            </article>`;
        }).join("")}
      </div>`;
    chargerPortraits((id) => rafraichirPortrait(conteneur, id));
  }

  // ---------- Onglet carnet : tampons et titres ----------

  function rendreCarnet() {
    const obtenus = new Set(tamponsObtenus());
    const nouveaux = new Set(tamponsNouveaux());
    const titres = titresObtenus();
    $("#contenu").innerHTML = `
      <div class="collection__progression">
        <p><strong>${obtenus.size} sur ${TAMPONS.length}</strong> tampons</p>
        <span class="barre-xp"><span class="barre-xp__rempli barre-pitie" style="--xp: ${obtenus.size / TAMPONS.length}"></span></span>
      </div>
      <section class="titres">
        <h2 class="case__titre">Ton titre</h2>
        <p class="case__aide">Compléter une page du carnet donne un titre. Il s'affiche au QG, sous ta vedette.</p>
        <div class="filtres">
          ${titres.map((t) => `<button type="button" class="filtre" data-action="titre" data-titre="${t}" aria-pressed="${t === titreActuel()}">${t}</button>`).join("")}
        </div>
        <h2 class="case__titre">Cadre de ta vedette</h2>
        <div class="filtres">
          ${CADRES.map((c) => {
            const a = cadresObtenus().some((x) => x.id === c.id);
            return `<button type="button" class="filtre" data-action="cadre" data-cadre="${c.id}" aria-pressed="${c.id === cadreActuel()}" ${a ? "" : "disabled"} title="${c.origine}">${c.nom}</button>`;
          }).join("")}
        </div>
      </section>
      <div class="carnet">
        ${PAGES.map((pg) => {
          const liste = TAMPONS.filter((tp) => tp.page === pg.id);
          const n = liste.filter((tp) => obtenus.has(tp.id)).length;
          return `
            <section class="carnet__page" aria-label="${pg.nom}">
              <header class="carnet__entete">
                <h2 class="case__titre">${pg.nom}</h2>
                <span class="case__aide">${n} / ${liste.length}, titre : « ${pg.titre} »</span>
              </header>
              <div class="carnet__tampons">
                ${liste.map((tp, i) => {
                  const a = obtenus.has(tp.id);
                  const cache = tp.cache && !a;
                  return `
                    <div class="tampon-carnet ${a ? "tampon-carnet--obtenu" : ""} ${nouveaux.has(tp.id) ? "tampon-carnet--nouveau" : ""}" style="--rot: ${(i % 5 - 2) * 4}deg" title="${cache ? "Tampon caché" : tp.texte}">
                      <span class="tampon-carnet__sceau">${cache ? "?" : tp.nom}</span>
                      <span class="tampon-carnet__texte">${cache ? "Tampon caché : à toi de le trouver." : tp.texte}</span>
                    </div>`;
                }).join("")}
              </div>
            </section>`;
        }).join("")}
      </div>`;
    if (nouveaux.size) marquerTamponsVus();
  }

  // ---------- Onglets ----------

  function afficherOnglet(nom, options = {}) {
    onglet = nom;
    conteneur.querySelectorAll(".onglet-collection").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.onglet === nom)));
    if (nom === "hotel") afficherHotel($("#contenu"), { naviguer, apresChangement: majNavigation, vendreUid: options.vendreUid ?? null });
    else if (nom === "persos") rendrePersos();
    else if (nom === "equipement") rendreEquipement();
    else if (nom === "liens") rendreLiens();
    else if (nom === "carnet") { annoncerTampons(verifierTampons()); rendreCarnet(); }
    else rendreEncyclopedie();
  }

  // ---------- Clics et changements ----------

  conteneur.addEventListener("click", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    const action = cible.dataset.action;

    if (action === "onglet") return afficherOnglet(cible.dataset.onglet);
    if (action === "vendre-hotel") { fermerFenetre(); return afficherOnglet("hotel", { vendreUid: cible.dataset.uid }); }
    if (action === "fiche") return ouvrirFiche(cible.dataset.perso);
    if (action === "fermer-fiche" && (cible.tagName === "BUTTON" || e.target === cible)) {
      fermerFenetre();
      if (onglet === "equipement") rendreEquipement();
      return;
    }
    if (action === "emplacement") {
      const id = cible.dataset.perso;
      return ouvrirChoixPiece(conteneur, id, cible.dataset.emplacement, () => ouvrirFiche(id));
    }
    if (action === "equiper-meilleur") {
      equiperMeilleur(cible.dataset.perso);
      return ouvrirFiche(cible.dataset.perso);
    }
    if (action === "eveiller") {
      const id = cible.dataset.perso;
      const r = eveiller(id);
      if (r.ok) jouerEveil(conteneur, PERSOS_PAR_ID[id], r.palier).then(() => ouvrirFiche(id));
      return;
    }
    if (action === "talent") {
      choisirTalent(cible.dataset.perso, Number(cible.dataset.palier), cible.dataset.choix);
      return ouvrirFiche(cible.dataset.perso);
    }
    if (action === "vedette") {
      definirVedette(cible.dataset.perso);
      return ouvrirFiche(cible.dataset.perso);
    }
    if (action === "filtre-emplacement") {
      filtres.emplacement = cible.dataset.valeur;
      return rendreEquipement();
    }
    if (action === "piece") return ouvrirPiece(cible.dataset.uid);
    if (action === "cadre") {
      choisirCadre(cible.dataset.cadre);
      return rendreCarnet();
    }
    if (action === "titre") {
      choisirTitre(cible.dataset.titre);
      return rendreCarnet();
    }
    if (action === "scene-lien") {
      const x = LIENS_PAR_CLE[cible.dataset.cle];
      return jouerScene(conteneur, x.scene, { titre: `Lien : ${x.nom}` });
    }
    if (action === "zone-encyclo") {
      zoneEncyclo = Number(cible.dataset.zone);
      return rendreEncyclopedie();
    }
    if (action === "ameliorer") {
      const r = ameliorerPiece(cible.dataset.uid);
      const texte = r.ok ? `Pièce améliorée : +5 % sur toutes ses lignes (-${r.cout} éclats).` : r.erreur;
      return ouvrirPiece(cible.dataset.uid, texte);
    }
    if (action === "retoucher") {
      const r = retoucherLigne(cible.dataset.uid, Number(cible.dataset.index));
      return ouvrirPiece(cible.dataset.uid, r.ok ? `Retouche : -${r.cout} éclats.` : r.erreur);
    }
    if (action === "sublimer") {
      const r = sublimerLigne(cible.dataset.uid, Number(cible.dataset.index));
      return ouvrirPiece(cible.dataset.uid, r.ok ? "Ligne sublimée à l'encre sacrée : elle dépasse son maximum !" : r.erreur);
    }
    if (action === "garder-retouche") {
      const nouveau = cible.dataset.nouveau === "1";
      choisirRetouche(cible.dataset.uid, nouveau);
      const p = pieceParUid(cible.dataset.uid);
      return ouvrirPiece(cible.dataset.uid, nouveau ? (pieceParfaite(p) ? "Objet parfait ! Toutes ses lignes sont au maximum." : "Nouveau jet gardé.") : "Ancien jet gardé.");
    }
    if (action === "verrou") {
      basculerVerrou(cible.dataset.uid);
      return ouvrirPiece(cible.dataset.uid);
    }
    if (action === "recycler") {
      const r = recyclerPiece(cible.dataset.uid);
      if (!r.ok) return ouvrirPiece(cible.dataset.uid, r.erreur);
      fermerFenetre();
      return rendreEquipement(`Pièce recyclée : +${r.gain} éclats.`);
    }
    if (action === "recycler-communes") {
      const r = recyclerCommunesLibres();
      return rendreEquipement(`${r.nombre} pièce${r.nombre > 1 ? "s" : ""} recyclée${r.nombre > 1 ? "s" : ""} : +${r.gain} éclats.`);
    }
  });

  conteneur.addEventListener("change", (e) => {
    const cible = e.target.closest("[data-action]");
    if (!cible) return;
    if (cible.dataset.action === "filtre-rarete") {
      filtres.rarete = cible.value;
      rendreEquipement();
    }
    if (cible.dataset.action === "filtre-ensemble") {
      filtres.ensemble = cible.value;
      rendreEquipement();
    }
    if (cible.dataset.action === "porteur") {
      if (cible.value) {
        const r = equiperPiece(cible.dataset.uid, cible.value);
        ouvrirPiece(cible.dataset.uid, r.ok ? `Équipée sur ${PERSOS_PAR_ID[cible.value].nom}.` : r.erreur);
      } else {
        retirerPiece(cible.dataset.uid);
        ouvrirPiece(cible.dataset.uid, "Pièce retirée.");
      }
    }
  });

  // Echap ferme la fenetre ouverte, meme si le focus a quitte l'ecran
  const clavier = (e) => {
    if (!conteneur.isConnected) return document.removeEventListener("keydown", clavier);
    if (e.key === "Escape" && $("#fiche").innerHTML) {
      fermerFenetre();
      if (onglet === "equipement") rendreEquipement();
    }
  };
  document.addEventListener("keydown", clavier);

  afficherOnglet(onglet);
  majNavigation();
  chargerPortraits((id) => rafraichirPortrait(conteneur, id));
}
