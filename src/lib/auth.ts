import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "gg_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

let cachedKey: Promise<Uint8Array> | null = null;

/**
 * Session signing key. Uses AUTH_SECRET when set (32+ chars). Otherwise derives a key
 * from the seller credentials with PBKDF2, so a missing AUTH_SECRET does not block login.
 * Changing the seller password then logs out all sessions.
 */
function signingKey(): Promise<Uint8Array> {
  cachedKey ??= deriveKey();
  return cachedKey;
}

async function deriveKey() {
  const authSecret = process.env.AUTH_SECRET;
  if (authSecret && authSecret.length >= 32) return new TextEncoder().encode(authSecret);

  const material = process.env.SELLER_PASSWORD_HASH || process.env.SELLER_PASSWORD;
  const email = process.env.SELLER_EMAIL;
  if (!material || !email) throw new Error("Set AUTH_SECRET or SELLER_EMAIL + SELLER_PASSWORD.");

  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(material), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(`getgoat-session:${email.toLowerCase()}`), iterations: 210_000 },
    base,
    256,
  );
  return new Uint8Array(bits);
}

export async function createSessionToken(email: string) {
  return new SignJWT({ role: "seller" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(await signingKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await signingKey());
    return payload.role === "seller" ? payload : null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
