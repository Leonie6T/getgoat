"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { formatRand, goatTitle } from "@/lib/goats";
import { notifySeller } from "@/lib/notify";
import { HOLD_MINUTES, hideGoatForOrder, holdGoat } from "@/lib/orders";
import { orderNumber } from "@/lib/payfast";
import { clientIp, withinLimit } from "@/lib/rate-limit";
import { isValidPassport, isValidSaId, normaliseCellphone } from "@/lib/validate";

export type BuyState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type Checkout = {
  fullName: string;
  idType: "SA_ID" | "PASSPORT";
  idNumber: string;
  cellphone: string;
  address: string;
  collector: "me" | "other";
  driverName: string | null;
  driverIdNumber: string | null;
  vehicleReg: string | null;
  email: string | null;
};

/** Checks every field and reports all problems at once. */
function validate(form: FormData): { data?: Checkout; fieldErrors: Record<string, string> } {
  const text = (name: string) => String(form.get(name) ?? "").trim();
  const docId = (name: string) => text(name).toUpperCase().replace(/\s/g, "");
  const errors: Record<string, string> = {};

  const fullName = text("fullName");
  if (fullName.length < 3) errors.fullName = "Enter your full name";
  const idType = text("idType") === "PASSPORT" ? "PASSPORT" : "SA_ID";
  const idNumber = docId("idNumber");
  if (idType === "SA_ID" ? !isValidSaId(idNumber) : !isValidPassport(idNumber)) {
    errors.idNumber = idType === "SA_ID" ? "Check the ID number (13 digits)" : "Check the passport number";
  }
  const cellphone = normaliseCellphone(text("cellphone"));
  if (!cellphone) errors.cellphone = "Enter a SA cellphone number, e.g. 082 123 4567";
  const address = text("address");
  if (address.length < 5) errors.address = "Enter where the goat goes";

  const collector = text("collector") === "other" ? "other" : "me";
  const driverName = collector === "other" ? text("driverName") : "";
  const driverIdNumber = collector === "other" ? docId("driverIdNumber") : "";
  if (collector === "other") {
    if (driverName.length < 3) errors.driverName = "Enter the driver's full name";
    if (!isValidSaId(driverIdNumber) && !isValidPassport(driverIdNumber)) {
      errors.driverIdNumber = "Enter the driver's ID or passport number";
    }
  }
  const email = text("email");
  if (email && !z.string().email().safeParse(email).success) errors.email = "Check the email address";
  if (form.get("consent") !== "on") errors.consent = "Tick the box to continue";

  if (Object.keys(errors).length > 0) return { fieldErrors: errors };
  return {
    fieldErrors: {},
    data: {
      fullName: fullName.slice(0, 80),
      idType,
      idNumber,
      cellphone: cellphone!,
      address: address.slice(0, 200),
      collector,
      driverName: driverName ? driverName.slice(0, 80) : null,
      driverIdNumber: driverIdNumber || null,
      vehicleReg: text("vehicleReg").toUpperCase().slice(0, 20) || null,
      email: email || null,
    },
  };
}

export async function startCheckout(goatCode: string, _prev: BuyState, formData: FormData): Promise<BuyState> {
  const { data: v, fieldErrors } = validate(formData);
  const rawMethod = String(formData.get("paymentMethod") ?? "");
  const method = rawMethod === "CARD" || rawMethod === "EFT" || rawMethod === "CASH" ? rawMethod : null;
  if (!method) fieldErrors.paymentMethod = "Choose how you want to pay";
  if (!v || !method) return { error: "Please check the marked fields.", fieldErrors };

  // Stop fake holds that block goats: 3 per cellphone and 6 per device per hour.
  const okCell = await withinLimit(`hold:cell:${v.cellphone}`, 3, 3600);
  const okIp = await withinLimit(`hold:ip:${await clientIp()}`, 6, 3600);
  if (!okCell || !okIp) {
    return { error: "Too many tries. Please WhatsApp Brofour Farming to buy this goat." };
  }

  const goat = await db.goat.findUnique({ where: { code: goatCode } });
  if (!goat || goat.status === "HIDDEN") return { error: "This goat is no longer listed." };

  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
  const order = await db.order.create({
    data: {
      totalCents: goat.priceCents,
      paymentMethod: method,
      status: method === "CARD" ? "PENDING" : "AWAITING_PAYMENT",
      consentAt: new Date(),
      expiresAt,
      driverName: v.driverName,
      driverIdNumberEnc: v.driverIdNumber ? await encrypt(v.driverIdNumber) : null,
      vehicleReg: v.vehicleReg,
      buyer: {
        create: {
          fullName: v.fullName,
          idType: v.idType,
          idNumberEnc: await encrypt(v.idNumber),
          cellphone: v.cellphone,
          address: v.address,
          email: v.email,
        },
      },
      items: { create: { goatId: goat.id, priceCents: goat.priceCents } },
    },
  });

  if (method !== "CARD") {
    if (!(await hideGoatForOrder(goat.id, order.id))) {
      await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      return { error: "Sorry, this goat is no longer available." };
    }
    const label = method === "EFT" ? "EFT" : "cash at collection";
    await notifySeller({
      kind: "AWAITING_PAYMENT",
      title: `New order (${label}): ${goatTitle(goat)} ${goat.idMarkValue} – ${formatRand(goat.priceCents)}`,
      body: `${v.fullName}, ${orderNumber(order.number)}. Goat is hidden. Tap Mark as paid when the money is in.`,
      url: `/seller/orders/${order.id}`,
    }).catch((e) => console.error("Seller notification failed", e));
    redirect(`/order/${order.id}`);
  }

  if (!(await holdGoat(goat.id, order.id, expiresAt))) {
    await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    const fresh = await db.goat.findUnique({ where: { id: goat.id } });
    return {
      error:
        fresh?.status === "RESERVED"
          ? "Someone is paying for this goat right now. Try again in 5 minutes."
          : "Sorry, this goat has just been sold.",
    };
  }

  redirect(`/order/${order.id}/pay`);
}
