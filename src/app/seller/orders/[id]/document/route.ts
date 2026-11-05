import { decrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { orderNumber } from "@/lib/payfast";
import { buildRemovalDocument } from "@/lib/removal-document";
import { isSeller } from "@/lib/session";

/** Removal document PDF, generated on request so it always reflects the order. Seller only. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isSeller())) return new Response("Not logged in", { status: 401 });
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { buyer: true, items: { include: { goat: true } } } });
  if (!order || !(order.status === "PAID" || order.status === "COLLECTED")) return new Response("Not found", { status: 404 });

  const no = orderNumber(order.number);
  const bytes = await buildRemovalDocument({
    orderNumber: no,
    saleDate: order.paidAt ?? order.createdAt,
    buyer: {
      fullName: order.buyer.fullName,
      idLabel: order.buyer.idType === "PASSPORT" ? "Passport number" : "ID number",
      idNumber: await decrypt(order.buyer.idNumberEnc).catch(() => "Removed (POPIA retention)"),
      address: order.buyer.address,
      cellphone: order.buyer.cellphone,
    },
    remover:
      order.driverName && order.driverIdNumberEnc
        ? { name: order.driverName, idNumber: await decrypt(order.driverIdNumberEnc).catch(() => "Removed") }
        : null,
    vehicleReg: order.vehicleReg,
    goats: order.items.map((i) => i.goat),
    paymentRef: order.payfastPaymentId,
  });

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="removal-document-${no}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
