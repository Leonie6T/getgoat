"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-12 w-full rounded-xl border-2 border-ink bg-card text-[17px] font-bold print:hidden"
    >
      Print or save as PDF
    </button>
  );
}
