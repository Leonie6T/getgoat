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
import { COLLECTION_POINT, collectionFrom, formatDay, siteUrl } from "@/lib/site";
import { cellphoneToWa } from "@/lib/validate";
import { cancelUnpaid, confirmPayment, markCollected, markRefunded, undoCollected } from "../actions";

export const dynamic = "force-dynamic";

const when = (d: Date) =>
  d.toLocaleString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });

export default async function OrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const order = await db.order.findUnique({
    where: { id },
    include: { buyer: true, items: { include: { goat: { include: { media: { where: { kind: "PHOTO" }, orderBy: { sortOrder: "asc" }, take: 1 } } } } } },
  });
  if (!order) notFound();
  const goat = order.items[0].goat;
  const photo = goat.media[0];
  const awaiting = order.status === "AWAITING_PAYMENT";
  const badge = awaiting
    ? { ...STATUS_BADGE.AWAITING_PAYMENT, label: order.paymentMethod === "EFT" ? "AWAITING EFT" : "CASH AT COLLECTION" }
    : STATUS_BADGE[order.status];
  const methodLabel = { CARD: "Card (Payfast)", EFT: "EFT", CASH: "Cash at collection" }[order.paymentMethod];
  const idNumber = maskId(await decrypt(order.buyer.idNumberEnc).catch(() => "??????"));
  const receiptUrl = `${await siteUrl()}/receipt/${order.id}`;
  const paidOrDone = order.status === "PAID" || order.status === "COLLECTED";
  const orderUrl = receiptUrl.replace("/receipt/", "/order/");
  const waText = awaiting
    ? `Hi ${order.buyer.fullName.split(" ")[0]}, this is Brofour Farming about order ${orderNumber(order.number)} (${goatTitle(goat)}, ${goat.idMarkValue}). ${
        order.paymentMethod === "EFT"
          ? `Bank details and reference: ${orderUrl}`
          : `Please pay cash at collection at ${COLLECTION_POINT}. Details: ${orderUrl}`
      }`
    : paidOrDone
    ? `Hi ${order.buyer.fullName.split(" ")[0]}, this is Brofour Farming. Thank you for buying ${goatTitle(goat)} (${goat.idMarkValue}), order ${orderNumber(order.number)}.\n\nYour receipt: ${receiptUrl}\n\nCollect at ${COLLECTION_POINT}, from ${formatDay(collectionFrom(order.paidAt ?? order.createdAt))}. Please show this receipt when you collect. When can you come?`
    : `Hi ${order.buyer.fullName.split(" ")[0]}, this is Brofour Farming about order ${orderNumber(order.number)}.`;
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

        {error && (
          <p role="alert" className="rounded-xl bg-[#fbe3dc] p-3 text-[15px] text-[#7a2a17]">
            {error}
          </p>
        )}
        {awaiting && (
          <div className="rounded-xl bg-[#eef3f8] p-3 text-[15px] text-[#33404d]">
            {order.paymentMethod === "EFT"
              ? "Buyer pays by EFT. When the money is in your account (check the proof of payment email and your bank), tap Mark as paid."
              : "Buyer pays cash at collection. Take the cash, then tap Mark as paid and print the removal document."}{" "}
            The goat is hidden from the marketplace.
          </div>
        )}
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
          {row("Payment", methodLabel)}
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
            <IconChat className="size-5" /> {paidOrDone ? "Send receipt" : awaiting ? "Send details" : "WhatsApp buyer"}
          </a>
          <a
            href={`tel:${order.buyer.cellphone.replace(/\s/g, "")}`}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-line bg-card font-bold no-underline"
          >
            <IconPhone className="size-5" /> Call buyer
          </a>
        </div>

        {awaiting && (
          <>
            <form action={confirmPayment.bind(null, order.id)}>
              <ConfirmButton
                label="Mark as paid"
                confirmLabel={order.paymentMethod === "EFT" ? "Tap again: money is in the bank" : "Tap again: cash received"}
                className="min-h-14 w-full rounded-xl bg-green text-[17px] font-bold text-white"
              />
            </form>
            <form action={cancelUnpaid.bind(null, order.id)}>
              <ConfirmButton
                label="Cancel order (not paid)"
                confirmLabel="Tap again to cancel – goat stays hidden"
                className="min-h-12 w-full rounded-xl border border-[#e6b7aa] bg-card font-semibold text-[#a3341b]"
              />
            </form>
            <a href={`/seller/goats/${goat.id}`} className="text-center text-sm font-semibold">
              Open goat (to show it in the marketplace again)
            </a>
          </>
        )}
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
