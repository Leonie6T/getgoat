import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TopBar } from "@/components/TopBar";

export default function GoatsPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar
        title={<Logo />}
        right={
          <p className="text-right text-[13px] text-muted">
            Brofour Farming
            <br />
            <a href="tel:+27834426012" className="text-muted">083 442 6012</a>
          </p>
        }
      />
      <main className="flex-1 px-4 pb-4">
        <h1 className="pb-2 pt-4 text-lg font-semibold">Goats for sale (0)</h1>
        <div className="rounded-xl border border-line bg-card p-6 text-center">
          <p className="text-lg font-semibold">No goats listed yet.</p>
          <p className="mt-1 text-muted">Check back soon.</p>
        </div>
      </main>
      <footer className="border-t border-line px-4 py-3 text-center text-sm">
        <Link href="/seller" className="text-muted">Seller login</Link>
      </footer>
    </div>
  );
}
