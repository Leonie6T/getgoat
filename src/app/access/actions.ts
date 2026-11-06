"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, accessToken, sitePassword } from "@/lib/access";
import { clientIp, withinLimit } from "@/lib/rate-limit";

export type AccessState = { error?: string };

export async function enter(_prev: AccessState, formData: FormData): Promise<AccessState> {
  const password = sitePassword();
  const next = String(formData.get("next") ?? "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (!password) redirect(safeNext);

  if (!(await withinLimit(`access:${await clientIp()}`, 10, 15 * 60))) {
    return { error: "Too many tries. Wait 15 minutes." };
  }
  if (String(formData.get("password") ?? "").trim() !== password) return { error: "Wrong password." };

  (await cookies()).set(ACCESS_COOKIE, await accessToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  redirect(safeNext);
}
