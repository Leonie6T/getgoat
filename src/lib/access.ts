/** Test-mode gate: when SITE_PASSWORD is set, the whole site needs that password once per device. */
export const ACCESS_COOKIE = "gg_access";

export function sitePassword() {
  return process.env.SITE_PASSWORD?.trim() || null;
}

/** Cookie value proving the visitor knows the current password (changes when the password changes). */
export async function accessToken(password: string) {
  const data = new TextEncoder().encode(`online-goat-market-access:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
