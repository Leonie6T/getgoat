"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cancelAwaitingOrder, markPaidByHand } from "@/lib/orders";
import { requireSeller } from "@/lib/session";

/** Buyer collected the goat: close the order and the goat. */
export async function markCollected(orderId: string) {
  await requireSeller();
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status !== "PAID") return;
  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "COLLECTED", collectedAt: new Date() } }),
    db.goat.updateMany({ where: { id: { in: order.items.map((i) => i.goatId) }, status: "SOLD" }, data: { status: "COLLECTED" } }),
  ]);
  revalidateOrders(orderId);
}

/** Undo a mistaken "collected". */
export async function undoCollected(orderId: string) {
  await requireSeller();
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status !== "COLLECTED") return;
  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "PAID", collectedAt: null } }),
    db.goat.updateMany({ where: { id: { in: order.items.map((i) => i.goatId) }, status: "COLLECTED" }, data: { status: "SOLD" } }),
  ]);
  revalidateOrders(orderId);
}

/** Seller refunded the buyer in Payfast (double payment). */
export async function markRefunded(orderId: string) {
  await requireSeller();
  await db.order.updateMany({ where: { id: orderId, status: "REFUND_NEEDED" }, data: { status: "REFUNDED" } });
  revalidateOrders(orderId);
}

function revalidateOrders(orderId: string) {
  revalidatePath("/seller");
  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderId}`);
  revalidatePath("/goats");
}

/** EFT money is in the bank, or cash was paid at collection. */
export async function confirmPayment(orderId: string) {
  await requireSeller();
  let error: string | null = null;
  try {
    await markPaidByHand(orderId);
  } catch (e) {
    error = (e as Error).message;
  }
  revalidateOrders(orderId);
  if (error) redirect(`/seller/orders/${orderId}?error=${encodeURIComponent(error)}`);
}

/** Buyer did not pay: cancel. The goat stays hidden until the seller shows it again. */
export async function cancelUnpaid(orderId: string) {
  await requireSeller();
  await cancelAwaitingOrder(orderId);
  revalidateOrders(orderId);
}
