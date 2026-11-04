export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#1F6B3A" />
      <path d="M17 27c-6-3-9-12-4-18 0 6 4 9 9 11" stroke="#FFFFFF" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M31 27c6-3 9-12 4-18 0 6-4 9-9 11" stroke="#FFFFFF" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M18 24c0 8 3 14 6 14s6-6 6-14c-2-2-10-2-12 0z" fill="#FFFFFF" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <strong className="text-[22px]">GetGoat</strong>
    </span>
  );
}
