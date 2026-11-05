import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { db } from "@/lib/db";
import { MARK_LABEL, formatRand, goatTitle } from "@/lib/goats";
import { orderNumber } from "@/lib/payfast";
import { COLLECTION_POINT, SELLER_NAME, SELLER_PHONE, collectionFrom, formatDay, sellerWhatsApp } from "@/lib/site";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Receipt", robots: { index: false, follow: false } };

const date = (d: Date) =>
  d.toLocaleString("en-ZA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });

/**
 * Permanent receipt. The link uses the unguessable order id and is shared with the buyer on WhatsApp.
 * Shows no ID numbers or address.
 */
export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { buyer: true, items: { include: { goat: true } } } });
  if (!order || !order.paidAt || !["PAID", "COLLECTED", "REFUND_NEEDED", "REFUNDED"].includes(order.status)) notFound();

  const status =
    order.status === "COLLECTED"
      ? { label: "PAID · COLLECTED", className: "bg-green text-white" }
      : order.status === "PAID"
        ? { label: "PAID", className: "bg-green text-white" }
        : { label: order.status === "REFUNDED" ? "REFUNDED" : "REFUND DUE", className: "bg-amber-tint text-amber-ink" };

  const row = (label: string, value: string) => (
    <div className="flex justify-between gap-4 border-b border-line py-2 last:border-0">
      <span className="text-muted">{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 bg-card p-5 print:max-w-none">
      <header className="flex items-center justify-between border-b border-line pb-3">
        <Logo size={40} />
        <span className={`rounded-full px-3 py-1 text-[13px] font-extrabold ${status.className}`}>{status.label}</span>
      </header>
      <div>
        <h1 className="text-[26px] font-extrabold">Receipt</h1>
        <p className="text-muted">{orderNumber(order.number)}</p>
      </div>
      <section className="text-[16px]">
        {row("Date paid", date(order.paidAt!))}
        {row("Buyer", order.buyer.fullName)}
        {order.items.map((i) =>
          row("Goat", `${goatTitle(i.goat)} · ${MARK_LABEL[i.goat.idMarkType]} ${i.goat.idMarkValue}`),
        )}
        {row("Amount paid", formatRand(order.totalCents))}
        {row("Paid with", order.payfastPaymentId ? `Payfast · ref ${order.payfastPaymentId}` : "Payfast")}
        {row("Collection point", COLLECTION_POINT)}
        {order.collectedAt
          ? row("Collected", date(order.collectedAt))
          : row("Available from", formatDay(collectionFrom(order.paidAt!)))}
      </section>
      <section className="rounded-xl bg-ground p-3 text-[15px]">
        <p>
          <strong>Seller:</strong> {SELLER_NAME}
        </p>
        <p>
          <strong>WhatsApp:</strong> <a href={sellerWhatsApp(`Hi, about my order ${orderNumber(order.number)}.`)}>{SELLER_PHONE}</a>
        </p>
        <p className="mt-1 text-[13px] text-muted">
          Bring this receipt and your ID when you collect. The stock removal document is signed at collection.{" "}
          <a href="/terms">Terms</a>
        </p>
      </section>
      <PrintButton />
      <p className="text-center text-[12px] text-muted">Keep this link. It always shows your receipt.</p>
    </main>
  );
}
