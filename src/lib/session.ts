import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/** Server-side guard for seller actions and routes (middleware also protects /seller). */
export async function requireSeller() {
  const session = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/seller/login");
  return session;
}

export async function isSeller() {
  return Boolean(await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value));
}
