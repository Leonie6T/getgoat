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
export const SELLER_PHONE = "083 442 6012";
export const SELLER_PHONE_TEL = "+27834426012";

/** Where sale notifications go. Override with SELLER_NOTIFY_EMAIL. */
export const SELLER_NOTIFY_EMAIL = process.env.SELLER_NOTIFY_EMAIL || "leonie.stone@gmail.com";
export const APP_NAME = "Online Goat Market";
