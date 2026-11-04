import "server-only";
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { db } from "./db";

/**
 * AES-256-GCM for ID numbers at rest (POPIA).
 * - "e1": key from the ENCRYPTION_KEY env var (preferred when set).
 * - "d1": random key the app creates once and keeps in AppSetting, so checkout never
 *   depends on hosting settings. Each value records which key it used.
 * Format: <version>.<iv>.<tag>.<ciphertext> (base64url).
 */
type Version = "e1" | "d1";

let dbKey: Promise<Buffer> | null = null;

function envKey() {
  const secret = process.env.ENCRYPTION_KEY;
  return secret && secret.length >= 32 ? Buffer.from(hkdfSync("sha256", secret, "getgoat", "id-number-encryption", 32)) : null;
}

function storedKey() {
  dbKey ??= (async () => {
    const name = "data-encryption-key";
    const fresh = randomBytes(32).toString("base64url");
    await db.appSetting.upsert({ where: { key: name }, create: { key: name, value: fresh }, update: {} });
    const row = await db.appSetting.findUniqueOrThrow({ where: { key: name } });
    return Buffer.from(row.value, "base64url");
  })().catch((error) => {
    dbKey = null;
    throw error;
  });
  return dbKey;
}

async function keyFor(version: Version) {
  if (version === "e1") {
    const key = envKey();
    if (!key) throw new Error("ENCRYPTION_KEY is needed to read this value");
    return key;
  }
  return storedKey();
}

export async function encrypt(plain: string) {
  const version: Version = envKey() ? "e1" : "d1";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", await keyFor(version), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [version, iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export async function decrypt(token: string) {
  const [version, iv, tag, data] = token.split(".");
  if (version !== "e1" && version !== "d1") throw new Error("Unknown encryption format");
  const decipher = createDecipheriv("aes-256-gcm", await keyFor(version), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}

/** 8501015800083 -> 8501 •••• ••83 */
export function maskId(id: string) {
  return id.length <= 6 ? "••••" : `${id.slice(0, 4)} •••• ••${id.slice(-2)}`;
}
