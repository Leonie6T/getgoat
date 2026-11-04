type Props = { size?: number; inverted?: boolean };

export function LogoMark({ size = 36, inverted = false }: Props) {
  const bg = inverted ? "#FFFBF3" : "#1F4A2E";
  const horn = inverted ? "#1F4A2E" : "#F4ECDD";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="14" fill={bg} />
      <path d="M17 27c-6-3-9-12-4-18 0 6 4 9 9 11" stroke={horn} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M31 27c6-3 9-12 4-18 0 6-4 9-9 11" stroke={horn} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M18 24c0 8 3 14 6 14s6-6 6-14c-2-2-10-2-12 0z" fill="#E2A33B" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[26px] font-extrabold tracking-tight">getgoat</span>
    </span>
  );
}
