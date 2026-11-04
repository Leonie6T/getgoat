"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const expectedEmail = process.env.SELLER_EMAIL?.trim().toLowerCase();
  const hash = process.env.SELLER_PASSWORD_HASH;
  if (!expectedEmail || !hash) {
    return { error: "Login is not set up yet. Add SELLER_EMAIL and SELLER_PASSWORD_HASH.", email };
  }

  const ok = email === expectedEmail && (await bcrypt.compare(password, hash));
  if (!ok) return { error: "Wrong email or password.", email };

  const token = await createSessionToken(email);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect("/seller");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/seller/login");
}
