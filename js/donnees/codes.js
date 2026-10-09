// ==========================================================
// CODES CADEAUX
// Seule l'empreinte SHA-256 de « crossover:CODE » est gardee ici :
// le code lui-meme ne se lit pas dans le source. Pour en ajouter un :
// node -e "console.log(require('crypto').createHash('sha256').update('crossover:MONCODE').digest('hex'))"
// recompense : { encre, invocations, ticketsDores, tickets, potions: { chance, bordure, vitesse, lune } }
// ==========================================================

export const CODES_CADEAUX = [
  { empreinte: "8402542b84cbb58c824fc798f16d8b1574284c978f5cd8b0617b6fc5471ef40a", nom: "Bienvenue dans Crossover", recompense: {invocations: 30,potions: {chance: 1,lune: 1}} },
  { empreinte: "e99023c1ca0dad29618086f1a0bf681e8da93254b559d92656c2cfebff94216b", nom: "Le code du créateur", recompense: {encre: 500,potions: {bordure: 2}} },
  { empreinte: "229029f7cf3cb7c71251cc7861e0da0a585a9e354ab05b255a3dd6db9b072ee0", nom: "Pour les chasseurs de boss", bossMin: 3, recompense: {invocations: 40,potions: {lune: 1,vitesse: 1}} },
  { empreinte: "a0d1faaa3a4227b2a9b4c71747793286987b6cc88c856db13d7c3305dc28c720", nom: "Mille invocations", invocationsMin: 1000, recompense: {ticketsDores: 1,potions: {chance: 2}} },
  { empreinte: "551749c8545cfe93fb65e845a69e7002aed392b72d4b52c541225b89ea46ba00", nom: "Cinq mille invocations", invocationsMin: 5000, recompense: {ticketsDores: 1,potions: {lune: 3,bordure: 3}} },
];
