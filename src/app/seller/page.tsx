import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { logout } from "./login/actions";

export default function SellerHome() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar
        title="GetGoat · Seller"
        right={
          <form action={logout}>
            <button className="min-h-11 px-1 text-sm text-muted">Log out</button>
          </form>
        }
      />
      <main>
        <div className="grid grid-cols-2 gap-2 p-4">
          <Link
            href="/seller"
            className="rounded-xl border border-[#e3c98f] bg-amber-tint p-3 text-ink no-underline"
          >
            <div className="text-[28px] font-extrabold">0</div>
            <div className="text-sm">Paid – to release</div>
          </Link>
          <div className="rounded-xl border border-line bg-card p-3">
            <div className="text-[28px] font-extrabold">0</div>
            <div className="text-sm">Goats for sale</div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <Link
            href="/goats"
            className="flex min-h-[52px] items-center justify-center rounded-xl bg-green text-[17px] font-bold text-white no-underline"
          >
            View marketplace
          </Link>
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-lg font-bold">My goats</span>
          <span className="flex min-h-11 items-center rounded-[10px] border-2 border-line px-3.5 font-bold text-muted">
            + Add goat
          </span>
        </div>
        <p className="px-4 text-muted">No goats yet. Adding goats comes in the next update.</p>
      </main>
    </div>
  );
}
