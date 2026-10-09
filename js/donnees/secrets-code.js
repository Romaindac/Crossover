// ==========================================================
// LE CODAGE DES SECRETS : du JSON en base64, a l'envers.
// Juste assez pour que les noms ne se lisent pas dans le code du site.
// Fonctionne dans le navigateur et dans Node (atob, btoa, TextEncoder).
// ==========================================================

export function coder(valeur) {
  const octets = new TextEncoder().encode(JSON.stringify(valeur));
  let binaire = "";
  for (const o of octets) binaire += String.fromCharCode(o);
  return btoa(binaire).split("").reverse().join("");
}

export function decoder(code) {
  const binaire = atob(code.split("").reverse().join(""));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binaire, (c) => c.charCodeAt(0))));
}
