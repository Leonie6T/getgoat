import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { TopBar } from "@/components/TopBar";
import { db } from "@/lib/db";
import { formatRand, goatTitle, mediaUrl } from "@/lib/goats";
import { STATUS_BADGE } from "@/lib/order-status";
import { orderNumber } from "@/lib/payfast";

export const dynamic = "force-dynamic";

const TABS: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "release", label: "To release", statuses: ["PAID", "REFUND_NEEDED"] },
  { key: "collected", label: "Collected", statuses: ["COLLECTED"] },
  { key: "all", label: "All paid", statuses: ["PAID", "COLLECTED", "REFUND_NEEDED", "REFUNDED"] },
];


const when = (d: Date) =>
  d.toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: tabKey } = await searchParams;
  const tab = TABS.find((t) => t.key === tabKey) ?? TABS[0];
  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: { status: { in: tab.statuses } },
      orderBy: { paidAt: "desc" },
      include: {
        buyer: true,
        items: { include: { goat: { include: { media: { where: { kind: "PHOTO" }, orderBy: { sortOrder: "asc" }, take: 1 } } } } },
      },
      take: 100,
    }),
    db.order.count({ where: { status: { in: TABS[0].statuses } } }),
  ]);

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-10">
      <TopBar back={{ href: "/seller", label: "Home" }} title="Orders" />
      <nav className="flex gap-2 overflow-x-auto px-4 py-3" aria-label="Order filter">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/seller/orders?tab=${t.key}`}
            aria-current={t.key === tab.key ? "page" : undefined}
            className={`flex min-h-10 shrink-0 items-center rounded-full border-2 px-3.5 text-sm font-bold no-underline ${
              t.key === tab.key ? "border-ink bg-ink text-white" : "border-line bg-card text-ink"
            }`}
          >
            {t.label}
            {t.key === "release" && counts > 0 ? ` (${counts})` : ""}
          </Link>
        ))}
      </nav>
      <ul className="flex flex-col gap-2 px-4">
        {orders.length === 0 && <li className="py-6 text-center text-muted">No orders here.</li>}
        {orders.map((o) => {
          const goat = o.items[0].goat;
          const photo = goat.media[0];
          const badge = STATUS_BADGE[o.status];
          return (
            <li key={o.id}>
              <Link href={`/seller/orders/${o.id}`} className="flex items-center gap-2.5 rounded-xl border border-line bg-card p-2.5 text-ink no-underline">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(photo.thumbPathname ?? photo.pathname)} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="size-14 shrink-0 rounded-lg bg-ground" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{o.buyer.fullName}</div>
                  <div className="truncate text-[13px] text-muted">
                    {goatTitle(goat)} · {goat.idMarkValue}
                  </div>
                  <div className="text-[13px] text-muted">
                    {orderNumber(o.number)} · {o.paidAt ? when(o.paidAt) : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <strong>{formatRand(o.totalCents)}</strong>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>{badge.label}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
