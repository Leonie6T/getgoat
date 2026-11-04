"use client";

import { useState } from "react";

/** Two-tap button for destructive actions inside a server-action form. */
export function ConfirmButton({ label, confirmLabel, className }: { label: string; confirmLabel: string; className: string }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type={armed ? "submit" : "button"}
      onClick={() => setArmed(true)}
      onBlur={() => setArmed(false)}
      className={className}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
