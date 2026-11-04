"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { HOLD_MINUTES, holdGoat } from "@/lib/orders";
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
  if (!v) return { error: "Please check the marked fields.", fieldErrors };

  const goat = await db.goat.findUnique({ where: { code: goatCode } });
  if (!goat || goat.status === "HIDDEN") return { error: "This goat is no longer listed." };

  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
  const order = await db.order.create({
    data: {
      totalCents: goat.priceCents,
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
