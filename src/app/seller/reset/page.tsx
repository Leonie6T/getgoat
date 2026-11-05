"use client";

import { useActionState } from "react";
import { TopBar } from "@/components/TopBar";
import { inputClass } from "@/components/ui";
import { clearTestData, type ResetState } from "./actions";

/** One-time screen to remove test data before go-live. */
export default function ResetPage() {
  const [state, action, pending] = useActionState<ResetState, FormData>(clearTestData, {});
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar back={{ href: "/seller", label: "Home" }} title="Clear test data" />
      <main className="flex flex-col gap-4 p-4">
        <div className="rounded-xl border-2 border-[#a3341b] bg-[#fbe3dc] p-3 text-[15px] text-[#7a2a17]">
          <p className="font-bold">This deletes everything you have tested with:</p>
          <ul className="mt-1 list-disc pl-5">
            <li>all goats, with their photos and videos</li>
            <li>all orders, buyers and receipts</li>
            <li>all notifications</li>
          </ul>
          <p className="mt-2">Your login and phone alerts stay. Order numbers start again at GG-00001. This cannot be undone.</p>
        </div>
        <form action={action} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-[15px] font-semibold">
            Type CLEAR to confirm
            <input name="confirm" autoComplete="off" autoCapitalize="characters" className={inputClass} />
          </label>
          {state.error && (
            <p role="alert" className="rounded-[10px] bg-amber-tint px-3 py-2 text-[15px] text-amber-ink">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="min-h-14 rounded-xl bg-[#a3341b] text-lg font-bold text-white disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Delete all test data"}
          </button>
        </form>
      </main>
    </div>
  );
}
