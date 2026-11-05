import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const when = (d: Date) =>
  d.toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });

/** Seller inbox. Opening it marks everything as read. */
export default async function NotificationsPage() {
  const items = await db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  await db.notification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-10">
      <TopBar back={{ href: "/seller", label: "Home" }} title="Notifications" />
      <ul className="flex flex-col gap-2 p-4">
        {items.length === 0 && <li className="py-8 text-center text-muted">No notifications yet. Sales show here.</li>}
        {items.map((n) => (
          <li key={n.id}>
            <Link
              href={n.url}
              className={`flex flex-col gap-0.5 rounded-xl border p-3 text-ink no-underline ${
                n.readAt ? "border-line bg-card" : "border-green bg-green-tint"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <strong className={n.kind === "REFUND_NEEDED" ? "text-[#a3341b]" : ""}>{n.title}</strong>
                {!n.readAt && <span className="rounded-full bg-green px-2 text-[11px] font-bold text-white">NEW</span>}
              </span>
              <span className="text-[14px] text-muted">{n.body}</span>
              <span className="text-[12px] text-muted">{when(n.createdAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
