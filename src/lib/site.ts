import { headers } from "next/headers";

/** Absolute site URL for share links and link previews. */
export async function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const SELLER_NAME = "Brofour Farming";
/** Shown to buyers only after they have paid (owner: avoid calls). */
export const SELLER_PHONE = "083 442 6012";
export const SELLER_PHONE_TEL = "+27834426012";

export const APP_NAME = "Online Goat Market";

/** Every goat is collected here. */
export const COLLECTION_POINT = "Glen Victor Meats & Abattoir, 20 Nahoon Dam Road";

/** WhatsApp chat with the seller, with an optional ready message. */
export function sellerWhatsApp(text?: string) {
  return `https://wa.me/${SELLER_PHONE_TEL.replace("+", "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** First collection day: the day after payment (South African date). */
export function collectionFrom(paidAt: Date) {
  const sast = new Date(paidAt.getTime() + 2 * 3600 * 1000);
  sast.setUTCHours(12, 0, 0, 0);
  sast.setUTCDate(sast.getUTCDate() + 1);
  return sast;
}

/** Buyers must collect within this many days after the first collection day. */
export const COLLECTION_DAYS = 7;

export function collectionDeadline(paidAt: Date) {
  const d = collectionFrom(paidAt);
  d.setUTCDate(d.getUTCDate() + COLLECTION_DAYS);
  return d;
}

export function formatDay(d: Date) {
  return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg" });
}

/** EFT payments (from the FNB account confirmation letter). */
export const BANK_DETAILS = [
  ["Account holder", "Brofour Farming (Pty) Ltd"],
  ["Bank", "FNB"],
  ["Account type", "Gold Business Account"],
  ["Account number", "62915963286"],
  ["Branch code", "210121 (East London)"],
] as const;
export const POP_EMAIL = "jonathanbrody26@gmail.com";
