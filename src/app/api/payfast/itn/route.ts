import { db } from "@/lib/db";
import { sendSaleEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";
import { markOrderPaid, releaseOrder } from "@/lib/orders";
import { confirmWithPayfast, isPayfastIp, itnSignatureOk, payfastConfig } from "@/lib/payfast";

/**
 * Payfast ITN (server-to-server payment notification). Checks, in order:
 * signature, source IP, amount, and confirmation with Payfast's validate endpoint.
 * Always answers 200 quickly so Payfast stops retrying; problems are logged.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const fields = [...new URLSearchParams(raw).entries()];
  const data = Object.fromEntries(fields);
  const cfg = payfastConfig();

  if (!itnSignatureOk(fields, data.signature)) {
    console.warn("ITN rejected: bad signature", data.m_payment_id);
    return new Response("OK");
  }

  // Remote checks run on Vercel only; local tests post simulated notifications.
  if (process.env.VERCEL) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
    if (!(await isPayfastIp(ip))) {
      console.warn("ITN rejected: unknown source IP", ip);
      return new Response("OK");
    }
  }

  const order = await db.order.findUnique({ where: { id: data.m_payment_id ?? "" } });
  if (!order) {
    console.warn("ITN for unknown order", data.m_payment_id);
    return new Response("OK");
  }
  if (Math.abs(Number(data.amount_gross) * 100 - order.totalCents) > 1) {
    console.warn("ITN rejected: amount mismatch", order.id, data.amount_gross);
    return new Response("OK");
  }
  if (data.merchant_id !== cfg.merchantId) {
    console.warn("ITN rejected: merchant mismatch", order.id);
    return new Response("OK");
  }
  if (process.env.VERCEL && !(await confirmWithPayfast(raw))) {
    console.warn("ITN rejected: Payfast did not confirm", order.id);
    return new Response("OK");
  }

  if (data.payment_status === "COMPLETE") {
    const outcome = await markOrderPaid(order.id, data.pf_payment_id ?? "");
    console.info("ITN complete", order.id, outcome.result);
    if (outcome.result === "paid" || outcome.result === "refund-needed") {
      // Notify once; an email problem must not fail the payment notification.
      await notifySeller(order.id, outcome.result === "refund-needed").catch((e) => console.error("Sale email failed", e));
    }
  } else if (data.payment_status === "CANCELLED") {
    await releaseOrder(order.id, "CANCELLED");
  }
  return new Response("OK");
}

async function notifySeller(orderId: string, refundNeeded: boolean) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { buyer: true, items: { include: { goat: true } } } });
  await sendSaleEmail({
    orderId: order.id,
    number: order.number,
    totalCents: order.totalCents,
    refundNeeded,
    buyer: order.buyer,
    goat: order.items[0].goat,
    origin: await siteUrl(),
  });
}
