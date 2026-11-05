import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SoldStamp } from "@/components/GoatCard";
import { db } from "@/lib/db";
import { formatRand, goatTitle, mediaUrl } from "@/lib/goats";
import { orderNumber } from "@/lib/payfast";
import { BANK_DETAILS, COLLECTION_POINT, POP_EMAIL, SELLER_NAME, SELLER_PHONE, collectionFrom, formatDay, sellerWhatsApp } from "@/lib/site";
import { RefreshWhilePending } from "./RefreshWhilePending";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order", robots: { index: false } };

const button = "flex min-h-14 w-full items-center justify-center rounded-xl text-lg font-bold no-underline";

/** Payfast return page. The order id is unguessable; the page shows no ID numbers. */
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { goat: { include: { media: { where: { kind: "PHOTO" }, orderBy: { sortOrder: "asc" }, take: 1 } } } } } },
  });
  if (!order) notFound();
  const goat = order.items[0].goat;
  const photo = goat.media[0];

  const summary = (
    <div className="w-full rounded-xl border border-line bg-card p-3.5 text-left text-base">
      <div className="flex justify-between py-0.5"><span className="text-muted">Order</span><strong>{orderNumber(order.number)}</strong></div>
      <div className="flex justify-between py-0.5"><span className="text-muted">Goat</span><strong>{goatTitle(goat)} · {goat.idMarkValue}</strong></div>
      <div className="flex justify-between py-0.5"><span className="text-muted">Amount</span><strong>{formatRand(order.totalCents)}</strong></div>
    </div>
  );

  if (order.status === "PAID" || order.status === "COLLECTED") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-4 px-4 pb-6 pt-10 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-green text-white" aria-hidden="true">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
        <h1 className="text-[28px] font-extrabold">Payment received</h1>
        {photo && (
          <div className="relative h-[180px] w-[240px] overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl(photo.thumbPathname ?? photo.pathname)} alt={goatTitle(goat)} className="size-full object-cover" />
            <SoldStamp />
          </div>
        )}
        {summary}
        <div className="w-full rounded-xl border-2 border-green bg-green-tint p-3.5 text-left text-[16px]">
          <div className="font-bold">Collect your goat</div>
          <div>{COLLECTION_POINT}</div>
          <div className="mt-1">
            Available from <strong>{formatDay(collectionFrom(order.paidAt ?? order.createdAt))}</strong>
          </div>
          <div className="mt-1 text-[14px] text-muted">
            WhatsApp {SELLER_NAME} on <strong className="text-ink">{SELLER_PHONE}</strong> to agree a time.
          </div>
        </div>
        <a
          href={sellerWhatsApp(`Hi, I paid for order ${orderNumber(order.number)} (${goatTitle(goat)}, ${goat.idMarkValue}). When can I collect?`)}
          className={`${button} bg-[#25a244] text-white`}
        >
          WhatsApp to arrange collection
        </a>
        <p className="text-[13px] text-muted">{SELLER_NAME} will also send your receipt link on WhatsApp.</p>
        <Link href={`/receipt/${order.id}`} className={`${button} bg-green text-white`}>View receipt</Link>
        <Link href="/goats" className={`${button} mt-auto border-2 border-ink text-ink`}>See more goats</Link>
      </main>
    );
  }

  if (order.status === "AWAITING_PAYMENT") {
    const ref = orderNumber(order.number);
    const eft = order.paymentMethod === "EFT";
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pb-8 pt-8">
        <h1 className="text-center text-[26px] font-extrabold">Order placed – {eft ? "pay by EFT" : "pay cash at collection"}</h1>
        <p className="text-center text-muted">The goat is reserved for you. Nobody else can buy it.</p>
        {summary}
        {eft ? (
          <>
            <section className="rounded-xl border-2 border-green bg-card p-3.5 text-[16px]">
              <h2 className="pb-1 font-bold">1. Pay {formatRand(order.totalCents)} into this account</h2>
              {BANK_DETAILS.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-line py-1.5 last:border-0">
                  <span className="text-muted">{k}</span>
                  <strong className="text-right">{v}</strong>
                </div>
              ))}
              <div className="mt-2 rounded-lg bg-amber-tint p-2.5 text-amber-ink">
                Payment reference: <strong className="text-[18px]">{ref}</strong>
              </div>
            </section>
            <section className="rounded-xl border border-line bg-card p-3.5 text-[16px]">
              <h2 className="pb-1 font-bold">2. Email your proof of payment</h2>
              <p>
                Send the proof of payment to <strong>{POP_EMAIL}</strong> with {ref} in the subject.
              </p>
              <a
                href={`mailto:${POP_EMAIL}?subject=${encodeURIComponent(`Proof of payment ${ref}`)}&body=${encodeURIComponent(`Hi, please find attached proof of payment for order ${ref} (${goatTitle(goat)}, ${goat.idMarkValue}, ${formatRand(order.totalCents)}).`)}`}
                className={`${button} mt-3 bg-green text-white`}
              >
                Email proof of payment
              </a>
            </section>
            <p className="text-center text-[15px]">
              3. When the money is in our account, {SELLER_NAME} sends your receipt on WhatsApp. Collection is at{" "}
              {COLLECTION_POINT}, from the day after payment is confirmed.
            </p>
          </>
        ) : (
          <section className="rounded-xl border-2 border-green bg-card p-3.5 text-[16px]">
            <h2 className="pb-1 font-bold">Pay {formatRand(order.totalCents)} cash when you collect</h2>
            <p>{COLLECTION_POINT}</p>
            <p className="mt-1">
              Available from <strong>{formatDay(collectionFrom(order.createdAt))}</strong>. Bring the exact amount.
            </p>
            <p className="mt-1 text-[14px] text-muted">You get your receipt when you have paid.</p>
          </section>
        )}
        <a
          href={sellerWhatsApp(`Hi, about my order ${ref} (${goatTitle(goat)}, ${goat.idMarkValue}).`)}
          className={`${button} bg-[#25a244] text-white`}
        >
          WhatsApp {SELLER_PHONE}
        </a>
        <p className="text-center text-[13px] text-muted">Keep this page. Its link always shows your order.</p>
      </main>
    );
  }

  if (order.status === "REFUND_NEEDED") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-4 px-4 pt-12 text-center">
        <h1 className="text-[24px] font-extrabold">Payment received, but the goat was just sold</h1>
        {summary}
        <p className="text-[17px]">
          Someone else paid for this goat moments before you. {SELLER_NAME} will refund you in full. Refunds take 10 to 15
          working days.
        </p>
        <a href={sellerWhatsApp(`Hi, my order ${orderNumber(order.number)} needs a refund.`)} className={`${button} bg-[#25a244] text-white`}>
          WhatsApp {SELLER_PHONE}
        </a>
      </main>
    );
  }

  // No confirmation 30 minutes after the hold ended: treat as not paid.
  const stale = order.status === "PENDING" && order.expiresAt.getTime() < Date.now() - 30 * 60 * 1000;

  if (order.status === "PENDING" && !stale) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-4 px-4 pt-16 text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-line border-t-green" aria-hidden="true" />
        <h1 className="text-[22px] font-extrabold" role="status">Checking your payment…</h1>
        <p className="text-muted">This takes a few seconds. Keep this page open.</p>
        {summary}
        <RefreshWhilePending />
        <p className="pt-4 text-[13px] text-muted">
          Not paid yet? <Link href={`/order/${order.id}/pay`}>Go to payment</Link>
        </p>
      </main>
    );
  }

  // CANCELLED, EXPIRED, REFUNDED
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-4 px-4 pt-16 text-center">
      <h1 className="text-[24px] font-extrabold">Payment not done</h1>
      <p className="text-[17px] text-muted">No money was taken. You can try again.</p>
      {summary}
      <Link href={`/g/${goat.code}/buy`} className={`${button} bg-green text-white`}>Try again</Link>
      <Link href="/goats" className="min-h-11 content-center font-semibold">See other goats</Link>
    </main>
  );
}
