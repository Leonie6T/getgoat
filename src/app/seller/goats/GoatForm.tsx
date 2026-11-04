"use client";

import { startTransition, useActionState, useState } from "react";
import type { Goat } from "@prisma/client";
import { Field, inputClass, primaryButton } from "@/components/ui";
import { BREEDS } from "@/lib/goats";
import { saveGoat, type GoatFormState } from "./actions";

type GoatValues = Omit<Goat, "weightKg"> & { weightKg: string | null };

export function GoatForm({ goat }: { goat?: GoatValues }) {
  const [state, action, pending] = useActionState<GoatFormState, FormData>(saveGoat.bind(null, goat?.id ?? null), {});
  const [sex, setSex] = useState(goat?.sex ?? "BUCK");
  const [pregnant, setPregnant] = useState(goat?.pregnant ?? "UNKNOWN");
  const [hasKidded, setHasKidded] = useState(goat?.hasKidded ? "yes" : "no");
  const err = state.fieldErrors ?? {};

  return (
    <form
      // Submit manually: a form `action` resets every field after an error, losing the seller's typing.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Breed" error={err.breed}>
          <select name="breed" defaultValue={goat?.breed ?? "Boer"} className={inputClass}>
            {BREEDS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Sex" error={err.sex}>
          <select name="sex" value={sex} onChange={(e) => setSex(e.target.value as typeof sex)} className={inputClass}>
            <option value="BUCK">Buck</option>
            <option value="DOE">Doe</option>
            <option value="WETHER">Wether</option>
          </select>
        </Field>
        <Field label="Age (months)" error={err.ageMonths}>
          <input name="ageMonths" inputMode="numeric" defaultValue={goat?.ageMonths ?? ""} placeholder="18" className={inputClass} />
        </Field>
        <Field label="Weight (kg)" error={err.weightKg}>
          <input name="weightKg" inputMode="decimal" defaultValue={goat?.weightKg ?? ""} placeholder="45" className={inputClass} />
        </Field>
        <Field label="Colour" error={err.colour}>
          <input name="colour" defaultValue={goat?.colour ?? ""} placeholder="Red / white" className={inputClass} />
        </Field>
        <Field label="Price (R)" error={err.priceRand}>
          <input
            name="priceRand"
            inputMode="numeric"
            defaultValue={goat ? goat.priceCents / 100 : ""}
            placeholder="2500"
            className={inputClass}
          />
        </Field>
        <Field label="ID mark type" error={err.idMarkType}>
          <select name="idMarkType" defaultValue={goat?.idMarkType ?? "EAR_TAG"} className={inputClass}>
            <option value="TATTOO">Tattoo</option>
            <option value="BRAND">Brand</option>
            <option value="EAR_TAG">Ear tag</option>
          </select>
        </Field>
        <Field label="ID mark / tag no." error={err.idMarkValue}>
          <input name="idMarkValue" defaultValue={goat?.idMarkValue ?? ""} placeholder="BG-0142" className={inputClass} />
        </Field>
      </div>

      {sex === "DOE" && (
        <fieldset className="grid grid-cols-2 gap-2.5 rounded-xl border border-line bg-green-tint/50 p-3">
          <legend className="px-1 text-[13px] font-bold text-green">Doe only</legend>
          <Field label="Pregnant?">
            <select
              name="pregnant"
              value={pregnant}
              onChange={(e) => setPregnant(e.target.value as typeof pregnant)}
              className={inputClass}
            >
              <option value="UNKNOWN">Not sure</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
          </Field>
          <Field label="Due (month)">
            <input
              name="dueMonth"
              defaultValue={goat?.dueMonth ?? ""}
              placeholder="Jan 2027"
              disabled={pregnant !== "YES"}
              className={`${inputClass} disabled:bg-ground`}
            />
          </Field>
          <Field label="Kids born before?">
            <select name="hasKidded" value={hasKidded} onChange={(e) => setHasKidded(e.target.value)} className={inputClass}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
          <Field label="How many times?" error={err.kiddingCount}>
            <input
              name="kiddingCount"
              inputMode="numeric"
              defaultValue={goat?.kiddingCount ?? ""}
              placeholder="2"
              disabled={hasKidded !== "yes"}
              className={`${inputClass} disabled:bg-ground`}
            />
          </Field>
        </fieldset>
      )}

      <Field label="Notes (optional)" error={err.notes}>
        <input name="notes" defaultValue={goat?.notes ?? ""} placeholder="Good breeding doe" className={inputClass} />
      </Field>

      {state.error && (
        <p role="alert" className="rounded-[10px] bg-amber-tint px-3 py-2 text-[15px] text-amber-ink">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Saving…" : goat ? "Save changes" : "Save goat"}
      </button>
    </form>
  );
}
