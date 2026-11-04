import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { logout } from "./login/actions";

export default function SellerHome() {
  return (
    <main className="mx-auto max-w-md">
      <section className="flex flex-col gap-4 rounded-b-3xl bg-veld px-4 pb-6 pt-5 text-milk">
        <div className="flex items-center gap-2.5">
          <LogoMark size={32} inverted />
          <h1 className="font-display text-[22px] font-extrabold">Brofour Farming</h1>
          <form action={logout} className="ml-auto">
            <button className="min-h-11 rounded-xl px-3 text-sm font-semibold text-milk/80">Log out</button>
          </form>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat value="0" label="To release" highlight />
          <Stat value="0" label="For sale" />
          <Stat value="R 0" label="This month" />
        </div>
      </section>
      <div className="grid grid-cols-2 gap-2.5 p-4">
        <Link
          href="/goats"
          className="flex min-h-14 items-center justify-center rounded-2xl bg-veld font-bold text-milk no-underline shadow-[0_3px_0_var(--color-veld-dark)]"
        >
          View marketplace
        </Link>
        <span className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-ink/30 font-bold text-ink/40">
          + Add goat (next)
        </span>
      </div>
      <p className="px-4 text-muted">Slice 1 is live. Adding goats comes in slice 2.</p>
    </main>
  );
}

function Stat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-2.5 ${highlight ? "bg-ochre text-ink" : "bg-milk/10"}`}>
      <div className="font-display text-[28px] font-extrabold">{value}</div>
      <div className="text-[13px] font-semibold">{label}</div>
    </div>
  );
}
