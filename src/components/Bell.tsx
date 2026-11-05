import Link from "next/link";

/** Notification bell with unread count. */
export function Bell({ unread }: { unread: number }) {
  return (
    <Link
      href="/seller/notifications"
      aria-label={unread ? `${unread} new notifications` : "Notifications"}
      className="relative flex size-11 items-center justify-center text-ink"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[#c0392b] px-1 text-[11px] font-bold leading-5 text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
