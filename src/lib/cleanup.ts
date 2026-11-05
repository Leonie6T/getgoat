import "server-only";
import { db } from "./db";

const DAY = 24 * 3600 * 1000;
/** POPIA: buyer identity data is kept 3 years after the sale (privacy page). */
export const RETENTION_YEARS = 3;

/** Daily housekeeping. Safe to run more than once. */
export async function runCleanup(now = new Date()) {
  // Payments that never completed: hold ended over an hour ago.
  const expired = await db.order.updateMany({
    where: { status: "PENDING", expiresAt: { lt: new Date(now.getTime() - 3600 * 1000) } },
    data: { status: "EXPIRED" },
  });
  // Goats still marked held after their hold ran out.
  const freed = await db.goat.updateMany({
    where: { status: "RESERVED", reservedUntil: { lt: now } },
    data: { status: "AVAILABLE", reservedUntil: null, reservedOrderId: null },
  });

  // Remove ID numbers and addresses after the retention period. Orders stay for the books.
  const cutoff = new Date(now.getTime() - RETENTION_YEARS * 365 * DAY);
  const oldOrders = await db.order.findMany({
    where: { createdAt: { lt: cutoff }, OR: [{ driverIdNumberEnc: { not: null } }, { buyer: { address: { not: "" } } }] },
    select: { id: true, buyerId: true },
  });
  if (oldOrders.length) {
    await db.$transaction([
      db.order.updateMany({ where: { id: { in: oldOrders.map((o) => o.id) } }, data: { driverIdNumberEnc: null, driverName: null } }),
      db.buyer.updateMany({
        where: { id: { in: oldOrders.map((o) => o.buyerId) } },
        data: { idNumberEnc: "removed", address: "", email: null },
      }),
    ]);
  }

  const notifications = await db.notification.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - 180 * DAY) } } });
  const limits = await db.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(now.getTime() - DAY) } } });

  return {
    expiredOrders: expired.count,
    freedGoats: freed.count,
    anonymisedOrders: oldOrders.length,
    deletedNotifications: notifications.count,
    clearedRateLimits: limits.count,
  };
}
