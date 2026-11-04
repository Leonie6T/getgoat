"use client";

/** Friendly fallback instead of a technical error page (often a dropped connection). */
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-xl font-bold">Something went wrong.</p>
      <p className="text-muted">Check your signal and try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 flex min-h-14 w-full items-center justify-center rounded-xl bg-green text-xl font-bold text-white"
      >
        Try again
      </button>
    </main>
  );
}
