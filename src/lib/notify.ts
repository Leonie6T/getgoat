import "server-only";
import webpush from "web-push";
import type { NotificationKind } from "@prisma/client";
import { db } from "./db";
import { APP_NAME } from "./site";

/**
 * Seller notifications: saved in the app inbox and pushed to subscribed phones.
 * VAPID keys come from VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY, else the app generates
 * them once and keeps them in AppSetting (no hosting setup needed).
 */
let keys: Promise<{ publicKey: string; privateKey: string }> | null = null;

export function vapidKeys() {
  keys ??= (async () => {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
    }
    const name = "vapid-keys";
    const fresh = JSON.stringify(webpush.generateVAPIDKeys());
    await db.appSetting.upsert({ where: { key: name }, create: { key: name, value: fresh }, update: {} });
    const row = await db.appSetting.findUniqueOrThrow({ where: { key: name } });
    return JSON.parse(row.value) as { publicKey: string; privateKey: string };
  })().catch((error) => {
    keys = null;
    throw error;
  });
  return keys;
}

export async function notifySeller(n: { kind: NotificationKind; title: string; body: string; url: string }) {
  await db.notification.create({ data: n });
  await pushToDevices({ title: n.title, body: n.body, url: n.url }).catch((e) => console.error("Push failed", e));
}

async function pushToDevices(payload: { title: string; body: string; url: string }) {
  const subs = await db.pushSubscription.findMany();
  if (subs.length === 0) return;
  const { publicKey, privateKey } = await vapidKeys();
  const options = { vapidDetails: { subject: "mailto:noreply@onlinegoatmarket.app", publicKey, privateKey }, TTL: 24 * 3600, urgency: "high" as const };
  const body = JSON.stringify({ ...payload, appName: APP_NAME });

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, options);
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        // Gone or invalid: the phone unsubscribed or the app was removed.
        if (status === 404 || status === 410) await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        else console.error("Push to device failed", status, (error as Error).message);
      }
    }),
  );
}

/** Confirms alerts work on the seller's phone. */
export async function sendTestPush() {
  await pushToDevices({ title: "Phone alerts are on ✓", body: "You will get an alert like this when a goat is sold.", url: "/seller" });
}

export async function unreadCount() {
  return db.notification.count({ where: { readAt: null } });
}
