import type { Metadata } from "next";
import Link from "next/link";
import { GoatCard } from "@/components/GoatCard";
import { BrofourMark } from "@/components/BrofourLogo";
import { APP_NAME, Logo } from "@/components/Logo";
import { TopBar } from "@/components/TopBar";
import { db } from "@/lib/db";
import { ageLabel, buyerStatus, formatRand, mediaUrl } from "@/lib/goats";
import { SELLER_NAME, SELLER_PHONE, SELLER_PHONE_TEL, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const SOLD_VISIBLE_DAYS = 14;

export async function generateMetadata(): Promise<Metadata> {
  const origin = await siteUrl();
  const cover = await db.goatMedia.findFirst({
    where: { kind: "PHOTO", goat: { status: "AVAILABLE" } },
    orderBy: [{ goat: { createdAt: "desc" } }, { sortOrder: "asc" }],
  });
  const title = `Goats for sale · ${APP_NAME}`;
  return {
    title,
    description: `Tap to see goats for sale from ${SELLER_NAME}.`,
    openGraph: {
      title,
      siteName: APP_NAME,
      url: `${origin}/goats`,
      images: [cover ? `${origin}${mediaUrl(cover.pathname)}` : `${origin}/brand/online-goat-market-1200.jpg`],
    },
  };
}

export default async function GoatsPage({ searchParams }: { searchParams: Promise<{ sex?: string }> }) {
  const { sex } = await searchParams;
  const soldSince = new Date(Date.now() - SOLD_VISIBLE_DAYS * 24 * 3600 * 1000);
  const goats = await db.goat.findMany({
    where: {
      OR: [{ status: { in: ["AVAILABLE", "RESERVED"] } }, { status: "SOLD", updatedAt: { gte: soldSince } }],
      ...(sex === "DOE" || sex === "BUCK" ? { sex } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { media: { where: { kind: "PHOTO" }, orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  // Available goats first, sold ones at the end.
  goats.sort((a, b) => Number(buyerStatus(a) === "SOLD") - Number(buyerStatus(b) === "SOLD"));
  const available = goats.filter((g) => buyerStatus(g) !== "SOLD").length;

  const filters = [
    { label: "All", value: undefined },
    { label: "Does", value: "DOE" },
    { label: "Bucks", value: "BUCK" },
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar
        title={<Logo />}
        right={
          <a href={`tel:${SELLER_PHONE_TEL}`} className="flex min-h-11 items-center text-[14px] font-semibold">
            {SELLER_PHONE}
          </a>
        }
      />
      <main className="flex-1 px-4 pb-4">
        <h1 className="pb-2 pt-4 text-lg font-semibold">Goats for sale ({available})</h1>
        <nav className="mb-3 flex gap-2" aria-label="Filter goats">
          {filters.map((f) => {
            const active = sex === f.value || (!f.value && !sex);
            return (
              <Link
                key={f.label}
                href={f.value ? `/goats?sex=${f.value}` : "/goats"}
                className={`flex min-h-10 items-center rounded-full border-2 px-4 text-sm font-bold no-underline ${
                  active ? "border-ink bg-ink text-white" : "border-line bg-card text-ink"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
        {goats.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-6 text-center">
            <p className="text-lg font-semibold">No goats listed right now.</p>
            <p className="mt-1 text-muted">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {goats.map((g) => {
              const photo = g.media[0];
              const age = ageLabel(g.ageMonths);
              return (
                <GoatCard
                  key={g.id}
                  href={`/g/${g.code}`}
                  photo={photo ? mediaUrl(photo.thumbPathname ?? photo.pathname) : null}
                  price={formatRand(g.priceCents)}
                  meta={[g.breed, g.sex === "DOE" ? "Doe" : g.sex === "BUCK" ? "Buck" : "Wether", age].filter(Boolean).join(" · ")}
                  sold={buyerStatus(g) === "SOLD"}
                  pregnant={g.pregnant === "YES"}
                />
              );
            })}
          </div>
        )}
      </main>
      <footer className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          <BrofourMark size={20} /> Sold by {SELLER_NAME}
        </span>
        <Link href="/seller" className="text-muted">
          Seller login
        </Link>
      </footer>
    </div>
  );
}
