import type { Goat, GoatMedia } from "@prisma/client";

export const SEX_LABEL = { BUCK: "Male", DOE: "Female", WETHER: "Kapater" } as const;
export const MARK_LABEL = { TATTOO: "Tattoo", BRAND: "Brand", EAR_TAG: "Ear tag" } as const;
export const PREGNANT_LABEL = { YES: "Yes", NO: "No", UNKNOWN: "Not sure" } as const;

export const BREEDS = ["Boer", "Mini Boer", "Kalahari Red", "Savanna", "Indigenous", "Other"];

export function formatRand(cents: number) {
  const rand = Math.round(cents / 100);
  return `R ${rand.toLocaleString("en-ZA").replace(/,/g, " ")}`;
}

export function goatTitle(goat: Pick<Goat, "breed" | "sex">) {
  return `${goat.breed} ${SEX_LABEL[goat.sex].toLowerCase()}`;
}

export function ageLabel(months: number | null) {
  if (months == null) return null;
  if (months < 24) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} yr ${rest} mo` : `${years} yr`;
}

/** Short, unambiguous code for share links: /g/7KQ2M */
export function newGoatCode() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export function mediaUrl(pathname: string) {
  return `/m/${pathname}`;
}

export function coverPhoto(media: GoatMedia[]) {
  return media.find((m) => m.kind === "PHOTO") ?? null;
}

/** Status as a buyer sees it. RESERVED past its hold time counts as available. */
export function buyerStatus(goat: Pick<Goat, "status" | "reservedUntil">) {
  if (goat.status === "RESERVED" && goat.reservedUntil && goat.reservedUntil < new Date()) return "AVAILABLE";
  return goat.status;
}

export const STATUS_LABEL: Record<Goat["status"], string> = {
  AVAILABLE: "For sale",
  RESERVED: "Held",
  SOLD: "Sold – to release",
  COLLECTED: "Collected",
  HIDDEN: "Hidden",
};
