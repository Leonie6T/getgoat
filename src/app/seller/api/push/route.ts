import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendTestPush, vapidKeys } from "@/lib/notify";
import { isSeller } from "@/lib/session";

/** Public key the browser needs to subscribe. */
export async function GET() {
  if (!(await isSeller())) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  return NextResponse.json({ publicKey: (await vapidKeys()).publicKey });
}

const subscription = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

/** Saves this phone's subscription and sends a test alert. */
export async function POST(request: Request) {
  if (!(await isSeller())) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const parsed = subscription.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  const { endpoint, keys } = parsed.data;
  await db.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: request.headers.get("user-agent")?.slice(0, 200) },
    update: { p256dh: keys.p256dh, auth: keys.auth },
  });
  return NextResponse.json({ ok: true });
}

/** Removes this phone's subscription. */
export async function DELETE(request: Request) {
  if (!(await isSeller())) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const { endpoint } = (await request.json()) as { endpoint?: string };
  if (endpoint) await db.pushSubscription.deleteMany({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}

/** Test alert to all subscribed phones (not saved in the inbox). */
export async function PUT() {
  if (!(await isSeller())) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  await sendTestPush();
  return NextResponse.json({ ok: true });
}
