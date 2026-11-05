"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { clientIp, resetLimit, withinLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  // Slow down password guessing: 8 tries per device and 40 overall per 15 minutes.
  const ipKey = `login:${await clientIp()}`;
  if (!(await withinLimit(ipKey, 8, 15 * 60)) || !(await withinLimit("login:all", 40, 15 * 60))) {
    return { error: "Too many tries. Wait 15 minutes, then try again.", email };
  }
  const password = String(formData.get("password") ?? "");

  const expectedEmail = process.env.SELLER_EMAIL?.trim().toLowerCase();
  const hash = process.env.SELLER_PASSWORD_HASH;
  const plain = process.env.SELLER_PASSWORD;
  if (!expectedEmail || (!hash && !plain)) {
    return { error: "Login is not set up yet. Add SELLER_EMAIL and SELLER_PASSWORD.", email };
  }

  const passwordOk = hash ? await bcrypt.compare(password, hash) : sameText(password, plain!);
  const ok = email === expectedEmail && passwordOk;
  if (!ok) return { error: "Wrong email or password.", email };

  await resetLimit(ipKey);
  const token = await createSessionToken(email);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect("/seller");
}

function sameText(a: string, b: string) {
  const digest = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/seller/login");
}
