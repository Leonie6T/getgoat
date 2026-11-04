/* eslint-disable @next/next/no-img-element */

export const APP_NAME = "Online Goat Market";

/** Round Online Goat Market badge. */
export function LogoMark({ size = 32 }: { size?: number }) {
  const src = size > 64 ? "/brand/online-goat-market-256.png" : "/brand/online-goat-market-128.png";
  return <img src={src} width={size} height={size} alt="" aria-hidden="true" className="shrink-0 rounded-full" />;
}

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={size} />
      <strong className="text-[17px] leading-tight">{APP_NAME}</strong>
    </span>
  );
}
