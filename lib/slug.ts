// Short URL-safe random slug. Collision-resistant enough for invite links.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l/i

export function newInviteSlug(len = 8): string {
  const arr = new Uint8Array(len);
  if (typeof crypto !== "undefined") crypto.getRandomValues(arr);
  else for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 256);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[arr[i] % ALPHABET.length];
  return out;
}
