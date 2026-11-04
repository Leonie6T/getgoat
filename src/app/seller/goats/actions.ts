"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { newGoatCode } from "@/lib/goats";
import { deleteMedia, isPublicMediaPath } from "@/lib/media";
import { requireSeller } from "@/lib/session";

export type GoatFormState = { error?: string; fieldErrors?: Record<string, string> };

const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().min(0).max(1000).nullable(),
);

const goatSchema = z
  .object({
    breed: z.string().trim().min(1, "Choose a breed").max(40),
    sex: z.enum(["BUCK", "DOE", "WETHER"]),
    ageMonths: optionalInt,
    weightKg: z.preprocess(
      (v) => (v === "" || v == null ? null : Number(String(v).replace(",", "."))),
      z.number().min(0).max(300).nullable(),
    ),
    colour: z.string().trim().max(40).optional(),
    idMarkType: z.enum(["TATTOO", "BRAND", "EAR_TAG"]),
    idMarkValue: z.string().trim().min(1, "Enter the tag or mark").max(40),
    priceRand: z.preprocess(
      (v) => Number(String(v ?? "").replace(/[\s,R]/g, "")),
      z.number({ message: "Enter a price" }).int("Whole rands only").min(1, "Enter a price").max(1_000_000),
    ),
    notes: z.string().trim().max(500).optional(),
    pregnant: z.enum(["YES", "NO", "UNKNOWN"]).optional(),
    dueMonth: z.string().trim().max(20).optional(),
    hasKidded: z.enum(["yes", "no"]).optional(),
    kiddingCount: optionalInt,
  })
  .transform((g) => {
    const doe = g.sex === "DOE";
    return {
      breed: g.breed,
      sex: g.sex,
      ageMonths: g.ageMonths,
      weightKg: g.weightKg,
      colour: g.colour || null,
      idMarkType: g.idMarkType,
      idMarkValue: g.idMarkValue,
      priceCents: g.priceRand * 100,
      notes: g.notes || null,
      pregnant: doe ? (g.pregnant ?? "UNKNOWN") : null,
      dueMonth: doe && g.pregnant === "YES" ? g.dueMonth || null : null,
      hasKidded: doe ? g.hasKidded === "yes" : null,
      kiddingCount: doe && g.hasKidded === "yes" ? g.kiddingCount : null,
    };
  });

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const result = goatSchema.safeParse(raw);
  if (result.success) return { data: result.data };
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  return { fieldErrors };
}

export async function saveGoat(goatId: string | null, _prev: GoatFormState, formData: FormData): Promise<GoatFormState> {
  await requireSeller();
  const { data, fieldErrors } = parse(formData);
  if (!data) return { error: "Please check the marked fields.", fieldErrors };

  let id = goatId;
  if (id) {
    const goat = await db.goat.findUnique({ where: { id } });
    if (!goat) return { error: "Goat not found." };
    if (goat.status === "RESERVED" && goat.priceCents !== data.priceCents) {
      return { error: "A buyer is paying for this goat now. Change the price later." };
    }
    await db.goat.update({ where: { id }, data });
  } else {
    const goat = await createWithUniqueCode(data);
    id = goat.id;
  }

  revalidatePath("/goats");
  revalidatePath("/seller");
  redirect(goatId ? `/seller/goats/${id}?saved=1` : `/seller/goats/${id}?new=1`);
}

async function createWithUniqueCode(data: NonNullable<ReturnType<typeof parse>["data"]>) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await db.goat.create({ data: { ...data, code: newGoatCode() } });
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
    }
  }
  throw new Error("Could not create a unique goat code");
}

export async function setGoatHidden(goatId: string, hidden: boolean) {
  await requireSeller();
  const goat = await db.goat.findUnique({ where: { id: goatId } });
  if (!goat) return;
  if (hidden && goat.status === "AVAILABLE") await db.goat.update({ where: { id: goatId }, data: { status: "HIDDEN" } });
  if (!hidden && goat.status === "HIDDEN") await db.goat.update({ where: { id: goatId }, data: { status: "AVAILABLE" } });
  revalidatePath("/goats");
  revalidatePath(`/seller/goats/${goatId}`);
  revalidatePath("/seller");
}

export async function deleteGoat(goatId: string) {
  await requireSeller();
  const goat = await db.goat.findUnique({ where: { id: goatId }, include: { media: true, orderItems: true } });
  if (!goat) redirect("/seller");
  if (goat.orderItems.length > 0) {
    // Goats with orders stay for the record; hide instead.
    await db.goat.update({ where: { id: goatId }, data: { status: goat.status === "AVAILABLE" ? "HIDDEN" : goat.status } });
  } else {
    await db.goat.delete({ where: { id: goatId } });
    await deleteMedia(goat.media.flatMap((m) => [m.pathname, m.thumbPathname ?? ""]));
  }
  revalidatePath("/goats");
  revalidatePath("/seller");
  redirect("/seller");
}

const mediaInput = z.object({
  kind: z.enum(["PHOTO", "VIDEO"]),
  pathname: z.string(),
  thumbPathname: z.string().nullable(),
});

/** Called by the browser after it uploaded the files to storage. */
export async function attachMedia(goatId: string, items: z.input<typeof mediaInput>[]) {
  await requireSeller();
  const parsed = z.array(mediaInput).max(10).parse(items);
  for (const item of parsed) {
    const prefix = `goats/${goatId}/`;
    if (!item.pathname.startsWith(prefix) || !isPublicMediaPath(item.pathname)) throw new Error("Bad media path");
    if (item.thumbPathname && (!item.thumbPathname.startsWith(prefix) || !isPublicMediaPath(item.thumbPathname))) {
      throw new Error("Bad media path");
    }
  }
  const last = await db.goatMedia.findFirst({ where: { goatId }, orderBy: { sortOrder: "desc" } });
  let order = (last?.sortOrder ?? -1) + 1;
  await db.goatMedia.createMany({
    data: parsed.map((m) => ({ goatId, kind: m.kind, pathname: m.pathname, thumbPathname: m.thumbPathname, sortOrder: order++ })),
  });
  revalidatePath(`/seller/goats/${goatId}`);
  revalidatePath("/goats");
}

export async function removeMedia(mediaId: string) {
  await requireSeller();
  const media = await db.goatMedia.delete({ where: { id: mediaId } });
  await deleteMedia([media.pathname, media.thumbPathname ?? ""]);
  revalidatePath(`/seller/goats/${media.goatId}`);
  revalidatePath("/goats");
}

/** Makes a photo the first one (cover for cards and link previews). */
export async function makeCover(mediaId: string) {
  await requireSeller();
  const media = await db.goatMedia.findUnique({ where: { id: mediaId } });
  if (!media) return;
  const first = await db.goatMedia.findFirst({ where: { goatId: media.goatId }, orderBy: { sortOrder: "asc" } });
  await db.goatMedia.update({ where: { id: mediaId }, data: { sortOrder: (first?.sortOrder ?? 0) - 1 } });
  revalidatePath(`/seller/goats/${media.goatId}`);
  revalidatePath("/goats");
}
