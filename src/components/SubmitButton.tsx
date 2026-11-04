"use client";

import { useFormStatus } from "react-dom";

/** Submit button that shows progress while its server-action form runs. */
export function SubmitButton({ children, pendingText, className }: { children: React.ReactNode; pendingText: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? pendingText : children}
    </button>
  );
}
