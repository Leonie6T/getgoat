import "server-only";
import { db } from "./db";

export const HOLD_MINUTES = 5;

/**
 * Atomically holds a goat for one order. Succeeds when the goat is available,
 * or its previous hold has run out. Returns false when someone else holds or bought it.
 */
export async function holdGoat(goatId: string, orderId: string, until: Date) {
  const { count } = await db.goat.updateMany({
    where: {
      id: goatId,
      OR: [{ status: "AVAILABLE" }, { status: "RESERVED", reservedUntil: { lt: new Date() } }],
    },
    data: { status: "RESERVED", reservedUntil: until, reservedOrderId: orderId },
  });
  return count === 1;
}

/** Frees the goat when this order still holds it (cancelled or failed payment). */
export async function releaseOrder(orderId: string, status: "CANCELLED" | "EXPIRED") {
  await db.$transaction([
    db.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status } }),
    db.goat.updateMany({
      where: { reservedOrderId: orderId, status: "RESERVED" },
      data: { status: "AVAILABLE", reservedUntil: null, reservedOrderId: null },
    }),
  ]);
}

/**
 * Payment confirmed. Marks the order PAID and its goats SOLD.
 * If a goat was meanwhile sold to another buyer, the order needs a refund instead.
 * Safe to call more than once (Payfast may repeat the ITN).
 */
export async function markOrderPaid(orderId: string, payfastPaymentId: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return { result: "not-found" as const };
    if (order.status === "PAID" || order.status === "COLLECTED" || order.status === "REFUND_NEEDED") {
      return { result: "already" as const, order };
    }

    let conflict = false;
    for (const item of order.items) {
      const { count } = await tx.goat.updateMany({
        where: { id: item.goatId, status: { in: ["AVAILABLE", "RESERVED"] } },
        data: { status: "SOLD", reservedUntil: null, reservedOrderId: null },
      });
      if (count === 0) conflict = true;
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: conflict ? "REFUND_NEEDED" : "PAID", paidAt: new Date(), payfastPaymentId },
    });
    return { result: conflict ? ("refund-needed" as const) : ("paid" as const), order: updated };
  });
}
