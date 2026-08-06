import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const N = 16384;
const r = 8;
const p = 1;
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN, { N, r, p, maxmem: 32 * 1024 * 1024 });
  return `scrypt:${N}:${r}:${p}:${salt}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, n, rr, pp, salt, expectedHex] = stored.split(":");
  if (scheme !== "scrypt") return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, KEYLEN, {
    N: Number(n),
    r: Number(rr),
    p: Number(pp),
    maxmem: 32 * 1024 * 1024,
  });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function newToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: sha256(raw) };
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
