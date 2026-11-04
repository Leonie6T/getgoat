import Link from "next/link";
import { BrofourLogo } from "@/components/BrofourLogo";
import { ShareLink } from "@/components/ShareButton";
import { TopBar } from "@/components/TopBar";
import { db } from "@/lib/db";
import { STATUS_LABEL, buyerStatus, formatRand, goatTitle } from "@/lib/goats";
import { siteUrl } from "@/lib/site";
import { logout } from "./login/actions";

export const dynamic = "force-dynamic";

export default async function SellerHome() {
  const [goats, origin] = await Promise.all([
    db.goat.findMany({
      where: { status: { not: "COLLECTED" } },
      orderBy: { createdAt: "desc" },
      include: { media: { where: { kind: "PHOTO" }, orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    siteUrl(),
  ]);
  const forSale = goats.filter((g) => buyerStatus(g) === "AVAILABLE").length;
  const toRelease = goats.filter((g) => g.status === "SOLD").length;

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-10">
      <TopBar
        title={<BrofourLogo />}
        right={
          <form action={logout}>
            <button className="min-h-11 px-1 text-sm text-muted">Log out</button>
          </form>
        }
      />
      <main>
        <div className="grid grid-cols-2 gap-2 p-4">
          <div className="rounded-xl border border-[#e3c98f] bg-amber-tint p-3">
            <div className="text-[28px] font-extrabold">{toRelease}</div>
            <div className="text-sm">Paid – to release</div>
          </div>
          <div className="rounded-xl border border-line bg-card p-3">
            <div className="text-[28px] font-extrabold">{forSale}</div>
            <div className="text-sm">Goats for sale</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <ShareLink
            text={`Goats for sale from Brofour Farming:\n${origin}/goats`}
            label="Share all goats on WhatsApp"
            className="min-h-[52px] rounded-xl text-[17px]"
          />
          <Link href="/goats" className="text-center text-sm font-semibold">
            View marketplace
          </Link>
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <h1 className="text-lg font-bold">My goats</h1>
          <Link
            href="/seller/goats/new"
            className="flex min-h-11 items-center rounded-[10px] border-2 border-ink px-3.5 font-bold text-ink no-underline"
          >
            + Add goat
          </Link>
        </div>
        <ul className="flex flex-col gap-2 px-4">
          {goats.length === 0 && <li className="text-muted">No goats yet. Tap “+ Add goat”.</li>}
          {goats.map((g) => {
            const photo = g.media[0];
            return (
              <li key={g.id} className="flex items-center gap-2.5 rounded-xl border border-line bg-card p-2">
                <Link href={`/seller/goats/${g.id}`} className="flex min-w-0 flex-1 items-center gap-2.5 text-ink no-underline">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/m/${photo.thumbPathname ?? photo.pathname}`} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-ground text-[11px] text-muted">
                      No photo
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-bold">
                      {goatTitle(g)} · {g.idMarkValue}
                    </div>
                    <div className="text-[13px] text-muted">
                      {formatRand(g.priceCents)} · <strong>{STATUS_LABEL[buyerStatus(g)]}</strong>
                    </div>
                  </div>
                </Link>
                {buyerStatus(g) === "AVAILABLE" && (
                  <ShareLink text={`${goatTitle(g)} · ${formatRand(g.priceCents)}\n${origin}/g/${g.code}`} />
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
