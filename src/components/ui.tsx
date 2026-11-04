/** Shared wireframe-style form pieces. */

export const inputClass =
  "min-h-12 w-full rounded-[10px] border border-[#9a9a94] bg-card px-3 text-[17px] font-normal outline-none focus:border-green focus:ring-2 focus:ring-green-tint aria-[invalid=true]:border-[#a3341b]";

export const primaryButton =
  "flex min-h-14 w-full items-center justify-center rounded-xl bg-green text-xl font-bold text-white no-underline disabled:opacity-60";

export const secondaryButton =
  "flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-ink bg-card text-[17px] font-bold text-ink no-underline disabled:opacity-60";

export function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-semibold ${className}`}>
      {label}
      {children}
      {error && <span className="text-[13px] font-normal text-[#a3341b]">{error}</span>}
    </label>
  );
}
