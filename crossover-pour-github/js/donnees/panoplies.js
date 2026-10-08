// ==========================================================
// LES 15 PANOPLIES (3 par zone)
// Bonus cumules a 2, 3 et 4 pieces. Le bonus a 4 pieces est
// un effet en combat. Tous les noms sont originaux.
// ==========================================================

export const PANOPLIES = {
  // ---------- Zone 1 : terrain d'entrainement ----------
  disciple: { nom: "Disciple", zone: 1,
    bonus: { 2: { pvPct: 5 }, 3: { atqPct: 4 }, 4: { energie: 10 } },
    textes: { 2: "PV +5 %", 3: "ATQ +4 %", 4: "+10 d'énergie de départ" } },
  volonte: { nom: "Volonté du héros", zone: 1,
    bonus: { 2: { atqPct: 6 }, 3: { critPct: 3 }, 4: { bonusUltime: 0.15 } },
    textes: { 2: "ATQ +6 %", 3: "Critique +3 %", 4: "Ultime : +15 % de dégâts" } },
  dojo: { nom: "Maître du dojo", zone: 1,
    bonus: { 2: { defPct: 8 }, 3: { pvPct: 8 }, 4: { regenDepart: true } },
    textes: { 2: "DEF +8 %", 3: "PV +8 %", 4: "Régénération pendant 5 s au début du combat" } },

  // ---------- Zone 2 : forteresse de fer ----------
  garnison: { nom: "Garnison", zone: 2,
    bonus: { 2: { defPct: 6 }, 3: { pvPct: 5 }, 4: { bouclierDepart: 0.08 } },
    textes: { 2: "DEF +6 %", 3: "PV +5 %", 4: "Bouclier de 8 % des PV au début du combat" } },
  fer: { nom: "Garde de fer", zone: 2,
    bonus: { 2: { defPct: 10 }, 3: { pvPct: 7 }, 4: { bouclierDepart: 0.12 } },
    textes: { 2: "DEF +10 %", 3: "PV +7 %", 4: "Bouclier de 12 % des PV au début du combat" } },
  rempart: { nom: "Rempart éternel", zone: 2,
    bonus: { 2: { pvPct: 10 }, 3: { defPct: 10 }, 4: { epines: 0.15 } },
    textes: { 2: "PV +10 %", 3: "DEF +10 %", 4: "Renvoie 15 % des dégâts reçus" } },

  // ---------- Zone 3 : toits de la nuit ----------
  ombre: { nom: "Ombre", zone: 3,
    bonus: { 2: { vitPct: 4 }, 3: { critPct: 3 }, 4: { esquive: 0.08 } },
    textes: { 2: "VIT +4 %", 3: "Critique +3 %", 4: "8 % de chance d'esquiver une attaque de base" } },
  vent: { nom: "Pas du vent", zone: 3,
    bonus: { 2: { vitPct: 6 }, 3: { atqPct: 6 }, 4: { energie: 30 } },
    textes: { 2: "VIT +6 %", 3: "ATQ +6 %", 4: "+30 d'énergie de départ" } },
  nocturne: { nom: "Lame nocturne", zone: 3,
    bonus: { 2: { critPct: 6 }, 3: { atqPct: 8 }, 4: { multCrit: 1.8 } },
    textes: { 2: "Critique +6 %", 3: "ATQ +8 %", 4: "Critiques à x1,8 au lieu de x1,5" } },

  // ---------- Zone 4 : domaine ----------
  initie: { nom: "Initié", zone: 4,
    bonus: { 2: { energie: 10 }, 3: { pvPct: 5 }, 4: { regenDepart: true } },
    textes: { 2: "+10 d'énergie de départ", 3: "PV +5 %", 4: "Régénération pendant 5 s au début du combat" } },
  sceau: { nom: "Sceau du domaine", zone: 4,
    bonus: { 2: { atqPct: 7 }, 3: { vitPct: 5 }, 4: { immuniteEtourdi: true } },
    textes: { 2: "ATQ +7 %", 3: "VIT +5 %", 4: "Résiste au premier étourdissement" } },
  sage: { nom: "Cœur du sage", zone: 4,
    bonus: { 2: { pvPct: 10 }, 3: { energie: 15 }, 4: { bonusSoins: 0.25 } },
    textes: { 2: "PV +10 %", 3: "+15 d'énergie de départ", 4: "Soins donnés +25 %" } },

  // ---------- Zone 5 : brasier ----------
  braise: { nom: "Braise", zone: 5,
    bonus: { 2: { atqPct: 6 }, 3: { critPct: 3 }, 4: { bruleBase: 0.2 } },
    textes: { 2: "ATQ +6 %", 3: "Critique +3 %", 4: "Attaques de base : 20 % de chance de brûler" } },
  legende: { nom: "Légende vivante", zone: 5,
    bonus: { 2: { atqPct: 8 }, 3: { pvPct: 8 }, 4: { bonusUltime: 0.2 } },
    textes: { 2: "ATQ +8 %", 3: "PV +8 %", 4: "Ultime : +20 % de dégâts" } },
  originelle: { nom: "Encre originelle", zone: 5,
    bonus: { 2: { atqPct: 8 }, 3: { critPct: 6 }, 4: { volDeVie: 0.12 } },
    textes: { 2: "ATQ +8 %", 3: "Critique +6 %", 4: "Vol de vie : 12 % des dégâts infligés" } },

  // ---------- Tour des Mille Volumes ----------
  volumeOublie: { nom: "Volume oublié", zone: 6,
    bonus: { 2: { atqPct: 5, pvPct: 5 }, 3: { defPct: 8, vitPct: 4 }, 4: { atqPct: 6, pvPct: 6, defPct: 6 } },
    textes: { 2: "ATQ et PV +5 %", 3: "DEF +8 % et VIT +4 %", 4: "ATQ, PV et DEF +6 %" } },
  reliure: { nom: "Reliure d'acier", zone: 6,
    bonus: { 2: { pvPct: 10 }, 3: { defPct: 12 }, 4: { bouclierDepart: 0.2 } },
    textes: { 2: "PV +10 %", 3: "DEF +12 %", 4: "Bouclier de 20 % des PV au début du combat" } },
  marquePage: { nom: "Marque-page sanglant", zone: 6,
    bonus: { 2: { critPct: 6 }, 3: { atqPct: 8 }, 4: { atqParKoEquip: 0.1 } },
    textes: { 2: "Critique +6 %", 3: "ATQ +8 %", 4: "Chaque KO réalisé donne +10 % d'ATQ (3 fois au plus)" } },
  dernierePage: { nom: "Dernière page", zone: 6,
    bonus: { 2: { energie: 15 }, 3: { atqPct: 8 }, 4: { rechargeUltime: 0.25 } },
    textes: { 2: "+15 d'énergie de départ", 3: "ATQ +8 %", 4: "L'ultime se recharge 25 % plus vite" } },
};
