"use client";

import { useActionState } from "react";
import { LogoMark } from "@/components/Logo";
import { TopBar } from "@/components/TopBar";
import { login, type LoginState } from "./actions";

const inputClass =
  "min-h-12 rounded-[10px] border border-[#9a9a94] bg-card px-3 text-[17px] font-normal outline-none focus:border-green focus:ring-2 focus:ring-green-tint";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar back={{ href: "/goats", label: "All goats" }} />
      <main className="flex flex-1 flex-col justify-center px-4 pb-16">
        <div className="mb-5 flex items-center gap-3">
          <LogoMark size={40} />
          <h1 className="text-[22px] font-extrabold">Seller login</h1>
        </div>
        <form action={formAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-[15px] font-semibold">
            Email
            <input
              key={state.email}
              name="email"
              type="email"
              defaultValue={state.email}
              autoComplete="username"
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-[15px] font-semibold">
            Password
            <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
          </label>
          {state.error && (
            <p role="alert" className="rounded-[10px] bg-amber-tint px-3 py-2 text-[15px] text-amber-ink">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 min-h-14 rounded-xl bg-green text-xl font-bold text-white disabled:opacity-60"
          >
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>
      </main>
    </div>
  );
}
