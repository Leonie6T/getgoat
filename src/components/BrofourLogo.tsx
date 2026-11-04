/** Brofour Farming logo (option C: acacia on the veld). */
export function BrofourMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1F6B3A" />
      <circle cx="44" cy="20" r="7" fill="#F2C14E" />
      <path d="M10 26c8-6 36-6 44 0-8 3-36 3-44 0z" fill="#FFFFFF" />
      <path d="M32 28v18M32 34l-7-6M32 33l7-5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 50h52" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function BrofourLogo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2" aria-label="Brofour Farming">
      <BrofourMark size={size} />
      <span className="leading-none">
        <span className="block text-[18px] font-extrabold tracking-wide">BROFOUR</span>
        <span className="block text-[11px] tracking-[0.3em] text-muted">FARMING</span>
      </span>
    </span>
  );
}
