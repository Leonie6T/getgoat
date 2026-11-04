"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogoMark } from "@/components/Logo";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <div className="mb-6 flex items-center gap-3">
        <LogoMark size={44} />
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">Seller login</h1>
      </div>
      <form action={formAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-[15px] font-bold">
          Email
          <input
            key={state.email}
            name="email"
            type="email"
            defaultValue={state.email}
            autoComplete="username"
            required
            className="min-h-[52px] rounded-[14px] border-2 border-line bg-milk px-3.5 text-[17px] font-normal outline-none focus:border-veld"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[15px] font-bold">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="min-h-[52px] rounded-[14px] border-2 border-line bg-milk px-3.5 text-[17px] font-normal outline-none focus:border-veld"
          />
        </label>
        {state.error && (
          <p role="alert" className="rounded-xl bg-[#F6DCD4] px-3 py-2 text-[15px] text-[#7A2A17]">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 min-h-[58px] rounded-[18px] bg-veld text-lg font-bold text-milk shadow-[0_4px_0_var(--color-veld-dark)] disabled:opacity-60"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <Link href="/goats" className="mt-6 flex min-h-11 items-center justify-center font-semibold">
        ← Back to goats
      </Link>
    </main>
  );
}
