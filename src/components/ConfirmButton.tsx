"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

/**
 * Two-tap button for destructive actions inside a server-action form.
 * Always a submit button; the first tap is cancelled and only arms it, so a state
 * change during the click can never turn the first tap into a submit.
 */
export function ConfirmButton({ label, confirmLabel, className }: { label: string; confirmLabel: string; className: string }) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!armed) {
          e.preventDefault();
          setArmed(true);
        }
      }}
      onBlur={() => setArmed(false)}
      disabled={pending}
      className={`${className} disabled:opacity-60`}
    >
      {pending ? "Deleting…" : armed ? confirmLabel : label}
    </button>
  );
}
