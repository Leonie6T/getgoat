"use client";

import { useActionState } from "react";
import { inputClass, primaryButton } from "@/components/ui";
import { enter, type AccessState } from "./actions";

export function AccessForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AccessState, FormData>(enter, {});
  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1 text-left text-[15px] font-semibold">
        Test password
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-[10px] bg-amber-tint px-3 py-2 text-[15px] text-amber-ink">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
