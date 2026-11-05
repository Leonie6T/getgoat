import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitButton } from "@/components/SubmitButton";
import { TopBar } from "@/components/TopBar";
import { IconChat, IconPhone } from "@/components/icons";
import { decrypt, maskId } from "@/lib/crypto";
import { db } from "@/lib/db";
import { formatRand, goatTitle, mediaUrl } from "@/lib/goats";
import { STATUS_BADGE } from "@/lib/order-status";
import { orderNumber } from "@/lib/payfast";
import { cellphoneToWa } from "@/lib/validate";
import { markCollected, markRefunded, undoCollected } from "../actions";

export const dynamic = "force-dynamic";

const when = (d: Date) =>
  d.toLocaleString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { buyer: true, items: { include: { goat: { include: { media: { where: { kind: "PHOTO" }, orderBy: { sortOrder: "asc" }, take: 1 } } } } } },
  });
  if (!order) notFound();
  const goat = order.items[0].goat;
  const photo = goat.media[0];
  const badge = STATUS_BADGE[order.status];
  const idNumber = maskId(await decrypt(order.buyer.idNumberEnc).catch(() => "??????"));
  const waText = `Hi ${order.buyer.fullName.split(" ")[0]}, this is Brofour Farming about your goat (${goatTitle(goat)}, order ${orderNumber(order.number)}). When can you collect?`;
  const paid = order.status === "PAID" || order.status === "COLLECTED";

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-10">
      <TopBar
        back={{ href: "/seller/orders", label: "Orders" }}
        title={orderNumber(order.number)}
        right={<span className={`rounded-full px-2 py-1 text-[12px] font-bold ${badge.className}`}>{badge.label}</span>}
      />
      <main className="flex flex-col gap-3 p-4">
        <div className="flex overflow-hidden rounded-xl border border-line bg-card">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(photo.thumbPathname ?? photo.pathname)} alt="" className="w-24 object-cover" />
          )}
          <div className="p-3">
            <div className="text-[22px] font-extrabold">{formatRand(order.totalCents)}</div>
            <div className="font-bold">
              {goatTitle(goat)} · {goat.idMarkValue}
            </div>
            <div className="text-[13px] text-muted">
              {order.paidAt ? `Paid ${when(order.paidAt)}` : ""}
              {order.payfastPaymentId ? ` · Payfast ${order.payfastPaymentId}` : ""}
            </div>
          </div>
        </div>

        {order.status === "REFUND_NEEDED" && (
          <div role="alert" className="rounded-xl bg-[#fbe3dc] p-3 text-[15px] text-[#7a2a17]">
            This buyer paid after the goat was sold to someone else. Refund them in Payfast (Transactions → Refund), then tap
            “Refund done”.
          </div>
        )}

        <section className="rounded-xl border border-line bg-card p-3.5 text-[15px]">
          <h2 className="pb-1 text-[12px] font-bold tracking-wider text-muted">BUYER</h2>
          <div className="pb-1 text-lg font-bold">{order.buyer.fullName}</div>
          {row(order.buyer.idType === "PASSPORT" ? "Passport" : "ID", idNumber)}
          {row("Cell", <a href={`tel:${order.buyer.cellphone.replace(/\s/g, "")}`}>{order.buyer.cellphone}</a>)}
          {row("Goes to", order.buyer.address)}
          {row("Collects", order.driverName ? `${order.driverName} (driver)` : "Buyer")}
          {order.vehicleReg && row("Vehicle", order.vehicleReg)}
          {order.buyer.email && row("Email", order.buyer.email)}
        </section>

        {paid && (
          <a
            href={`/seller/orders/${order.id}/document`}
            className="flex min-h-14 items-center justify-center rounded-xl bg-green text-[17px] font-bold text-white no-underline"
          >
            Removal document (PDF)
          </a>
        )}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/${cellphoneToWa(order.buyer.cellphone)}?text=${encodeURIComponent(waText)}`}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-[#25a244] font-bold text-white no-underline"
          >
            <IconChat className="size-5" /> WhatsApp buyer
          </a>
          <a
            href={`tel:${order.buyer.cellphone.replace(/\s/g, "")}`}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-line bg-card font-bold no-underline"
          >
            <IconPhone className="size-5" /> Call buyer
          </a>
        </div>

        {order.status === "PAID" && (
          <form action={markCollected.bind(null, order.id)}>
            <SubmitButton pendingText="Saving…" className="min-h-14 w-full rounded-xl border-2 border-ink bg-card text-[17px] font-bold">
              Mark as collected
            </SubmitButton>
          </form>
        )}
        {order.status === "COLLECTED" && (
          <div className="flex items-center justify-between rounded-xl bg-green-tint p-3 text-green">
            <span className="font-semibold">Collected {order.collectedAt ? when(order.collectedAt) : ""}</span>
            <form action={undoCollected.bind(null, order.id)}>
              <SubmitButton pendingText="…" className="min-h-10 rounded-lg px-3 text-sm font-semibold underline">
                Undo
              </SubmitButton>
            </form>
          </div>
        )}
        {order.status === "REFUND_NEEDED" && (
          <form action={markRefunded.bind(null, order.id)}>
            <ConfirmButton
              label="Refund done"
              confirmLabel="Tap again: buyer has been refunded"
              className="min-h-14 w-full rounded-xl border-2 border-ink bg-card text-[17px] font-bold"
            />
          </form>
        )}

        {paid && (
          <p className="rounded-xl bg-[#eef3f8] p-3 text-[13px] text-[#33404d]">
            Print the document. Fill in the seller section, then you and the buyer (or driver) sign at collection. Check if
            the destination needs a veterinary movement permit.
          </p>
        )}
      </main>
    </div>
  );
}
