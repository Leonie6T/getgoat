import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { db } from "@/lib/db";
import { buyerStatus, formatRand, goatTitle, mediaUrl } from "@/lib/goats";
import { BuyForm } from "./BuyForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your details", robots: { index: false } };

export default async function BuyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const goat = await db.goat.findUnique({
    where: { code: code.toUpperCase() },
    include: { media: { where: { kind: "PHOTO" }, orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  if (!goat || goat.status === "HIDDEN") notFound();
  const status = buyerStatus(goat);
  const photo = goat.media[0];

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-8">
      <TopBar
        back={{ href: `/g/${goat.code}`, label: "Back" }}
        title={
          <span className="flex items-center gap-2.5 text-[15px] font-normal">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(photo.thumbPathname ?? photo.pathname)} alt="" className="size-11 rounded-md object-cover" />
            )}
            <strong>
              {goatTitle(goat)} · {formatRand(goat.priceCents)}
            </strong>
          </span>
        }
      />
      <main className="px-4">
        <h1 className="pb-1 pt-4 text-[22px] font-extrabold">Your details</h1>
        <p className="pb-4 text-[14px] text-muted">Needed for the stock removal document (Stock Theft Act).</p>
        {status === "AVAILABLE" ? (
          <BuyForm code={goat.code} price={formatRand(goat.priceCents)} />
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 text-center">
            <p className="text-lg font-bold">
              {status === "RESERVED" ? "Someone is paying for this goat right now." : "This goat is sold."}
            </p>
            <p className="text-muted">{status === "RESERVED" ? "Try again in 5 minutes." : "See the other goats for sale."}</p>
            <Link href="/goats" className="flex min-h-12 items-center justify-center rounded-xl bg-green font-bold text-white no-underline">
              See goats for sale
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
