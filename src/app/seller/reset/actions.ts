"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { deleteMedia } from "@/lib/media";
import { requireSeller } from "@/lib/session";

export type ResetState = { error?: string };

/**
 * One-time go-live reset: deletes every goat (with photos and videos), order, buyer and
 * notification. Keeps the login, app keys and phone-alert subscriptions.
 */
export async function clearTestData(_prev: ResetState, formData: FormData): Promise<ResetState> {
  await requireSeller();
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "CLEAR") {
    return { error: 'Type CLEAR to confirm.' };
  }

  const media = await db.goatMedia.findMany({ select: { pathname: true, thumbPathname: true } });
  await db.$transaction([
    db.orderItem.deleteMany(),
    db.order.deleteMany(),
    db.buyer.deleteMany(),
    db.goatMedia.deleteMany(),
    db.goat.deleteMany(),
    db.notification.deleteMany(),
    db.rateLimit.deleteMany(),
  ]);
  // Order numbers start again at GG-00001.
  await db.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Order"', 'number'), 1, false)`);
  // Delete files in batches; a storage error must not undo the database reset.
  const paths = media.flatMap((m) => [m.pathname, m.thumbPathname ?? ""]).filter(Boolean);
  for (let i = 0; i < paths.length; i += 100) {
    await deleteMedia(paths.slice(i, i + 100)).catch((e) => console.error("Media delete failed", e));
  }

  revalidatePath("/", "layout");
  redirect("/seller?reset=1");
}
