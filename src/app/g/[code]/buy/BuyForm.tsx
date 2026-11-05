"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Field, inputClass, primaryButton } from "@/components/ui";
import { startCheckout, type BuyState } from "./actions";

export function BuyForm({ code, price }: { code: string; price: string }) {
  const [state, action, pending] = useActionState<BuyState, FormData>(startCheckout.bind(null, code), {});
  const [idType, setIdType] = useState<"SA_ID" | "PASSPORT">("SA_ID");
  const [collector, setCollector] = useState<"me" | "other">("me");
  // Hide a field's error once the buyer edits that field.
  const [edited, setEdited] = useState<Set<string>>(new Set());
  useEffect(() => setEdited(new Set()), [state]);
  const err = Object.fromEntries(Object.entries(state.fieldErrors ?? {}).filter(([k]) => !edited.has(k)));

  const choice = (active: boolean) =>
    `min-h-12 rounded-[10px] border-2 text-[16px] font-bold ${active ? "border-green bg-green text-white" : "border-line bg-card text-ink"}`;

  return (
    <form
      // Manual submit keeps typed values if the server finds an error.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      onInput={(e) => {
        const name = (e.target as HTMLInputElement).name;
        if (name && !edited.has(name)) setEdited(new Set(edited).add(name));
      }}
      className="flex flex-col gap-3.5"
      noValidate
    >
      <Field label="Full name" error={err.fullName}>
        <input name="fullName" autoComplete="name" placeholder="e.g. Sipho Ndlovu" aria-invalid={!!err.fullName} className={inputClass} />
      </Field>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-semibold">ID document</legend>
        <input type="hidden" name="idType" value={idType} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setIdType("SA_ID")} className={choice(idType === "SA_ID")} aria-pressed={idType === "SA_ID"}>
            SA ID
          </button>
          <button type="button" onClick={() => setIdType("PASSPORT")} className={choice(idType === "PASSPORT")} aria-pressed={idType === "PASSPORT"}>
            Passport
          </button>
        </div>
      </fieldset>
      <Field label={idType === "SA_ID" ? "ID number" : "Passport number"} error={err.idNumber}>
        <input
          name="idNumber"
          inputMode={idType === "SA_ID" ? "numeric" : "text"}
          autoComplete="off"
          placeholder={idType === "SA_ID" ? "13 digits" : "e.g. A12345678"}
          aria-invalid={!!err.idNumber}
          className={inputClass}
        />
      </Field>

      <Field label="Cellphone number" error={err.cellphone}>
        <input name="cellphone" type="tel" inputMode="tel" autoComplete="tel" placeholder="082 123 4567" aria-invalid={!!err.cellphone} className={inputClass} />
      </Field>

      <Field label="Where does the goat go?" error={err.address}>
        <input name="address" autoComplete="street-address" placeholder="Street or farm, town" aria-invalid={!!err.address} className={inputClass} />
      </Field>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-semibold">Who collects the goat?</legend>
        <input type="hidden" name="collector" value={collector} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setCollector("me")} className={choice(collector === "me")} aria-pressed={collector === "me"}>
            Me
          </button>
          <button type="button" onClick={() => setCollector("other")} className={choice(collector === "other")} aria-pressed={collector === "other"}>
            Someone else
          </button>
        </div>
      </fieldset>
      {collector === "other" && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-card p-3">
          <Field label="Driver's full name" error={err.driverName}>
            <input name="driverName" aria-invalid={!!err.driverName} className={inputClass} />
          </Field>
          <Field label="Driver's ID or passport number" error={err.driverIdNumber}>
            <input name="driverIdNumber" autoComplete="off" aria-invalid={!!err.driverIdNumber} className={inputClass} />
          </Field>
        </div>
      )}

      <details className="rounded-xl border border-line bg-card px-3 py-2">
        <summary className="min-h-10 cursor-pointer content-center text-[15px] font-semibold">More (optional)</summary>
        <div className="flex flex-col gap-3 pb-2 pt-1">
          <Field label="Vehicle registration" error={err.vehicleReg}>
            <input name="vehicleReg" placeholder="e.g. CA 123-456" className={inputClass} />
          </Field>
          <Field label="Email (for a receipt)" error={err.email}>
            <input name="email" type="email" inputMode="email" autoComplete="email" aria-invalid={!!err.email} className={inputClass} />
          </Field>
        </div>
      </details>

      <label className="flex items-start gap-3 text-[14px]">
        <input type="checkbox" name="consent" className="mt-0.5 size-6 shrink-0 accent-green" aria-invalid={!!err.consent} />
        <span>
          I agree to the{" "}
          <a href="/terms" target="_blank">
            Terms
          </a>{" "}
          and that Brofour Farming keeps these details for this sale and the stock removal document (
          <a href="/privacy" target="_blank">
            Privacy
          </a>
          ).
          {err.consent && <span className="block text-[13px] text-[#a3341b]">{err.consent}</span>}
        </span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-[10px] bg-amber-tint px-3 py-2 text-[15px] text-amber-ink">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Please wait…" : `Pay ${price}`}
      </button>
      <p className="-mt-1 text-center text-[13px] text-muted">
        Secure payment with Payfast. The goat is held for you for 5 minutes.
      </p>
    </form>
  );
}
