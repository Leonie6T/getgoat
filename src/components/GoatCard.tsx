import Link from "next/link";

export function SoldStamp({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
      <span
        className={`-rotate-12 rounded-md border-[3px] border-white font-extrabold text-white ${
          size === "lg" ? "px-4 py-1 text-[32px]" : "px-3 py-0.5 text-2xl"
        }`}
      >
        SOLD
      </span>
    </div>
  );
}

export function GoatCard({
  href,
  photo,
  price,
  meta,
  sold,
  pregnant,
}: {
  href: string;
  photo: string | null;
  price: string;
  meta: string;
  sold: boolean;
  pregnant: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col overflow-hidden rounded-xl border border-line bg-card text-ink no-underline">
      <div className="relative h-[140px] bg-[#cfcfc9]">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={meta} loading="lazy" className="size-full object-cover" />
        )}
        {sold && <SoldStamp />}
      </div>
      <div className="px-2.5 pb-2.5 pt-2">
        <div className="text-xl font-extrabold">{price}</div>
        <div className="text-[13px] text-muted">{meta}</div>
        {pregnant && !sold && (
          <span className="mt-1 inline-block rounded-full bg-green-tint px-2 py-0.5 text-[12px] font-bold text-green">
            Pregnant
          </span>
        )}
      </div>
    </Link>
  );
}
