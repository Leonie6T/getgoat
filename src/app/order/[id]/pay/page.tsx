import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { goatTitle } from "@/lib/goats";
import { orderNumber, paymentFields } from "@/lib/payfast";
import { siteUrl } from "@/lib/site";
import { AutoSubmit } from "./AutoSubmit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Going to Payfast…", robots: { index: false } };

/** Posts the signed payment form to Payfast. */
export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { buyer: true, items: { include: { goat: true } } } });
  if (!order) notFound();
  if (order.status !== "PENDING" || order.expiresAt < new Date()) redirect(`/order/${order.id}`);

  const goat = order.items[0].goat;
  const { action, fields } = paymentFields({
    orderId: order.id,
    orderNumber: orderNumber(order.number),
    amountCents: order.totalCents,
    itemName: `${goatTitle(goat)} ${goat.idMarkValue}`,
    buyerName: order.buyer.fullName,
    buyerEmail: order.buyer.email,
    buyerCell: order.buyer.cellphone,
    origin: await siteUrl(),
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="size-12 animate-spin rounded-full border-4 border-line border-t-green" aria-hidden="true" />
      <p className="text-lg font-bold">Going to Payfast to pay…</p>
      <form id="payfast" action={action} method="post">
        {fields.map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button type="submit" className="mt-2 min-h-12 rounded-xl bg-green px-6 font-bold text-white">
          Tap here if nothing happens
        </button>
      </form>
      <AutoSubmit formId="payfast" />
    </main>
  );
}
