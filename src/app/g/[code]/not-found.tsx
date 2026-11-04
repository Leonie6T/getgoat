import Link from "next/link";
import { TopBar } from "@/components/TopBar";

/** Old WhatsApp links to removed or hidden goats land here. */
export default function GoatNotFound() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar back={{ href: "/goats", label: "All goats" }} />
      <main className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-xl font-bold">This goat is no longer listed.</p>
        <p className="text-muted">It may be sold. See the goats for sale now.</p>
        <Link
          href="/goats"
          className="mt-2 flex min-h-14 w-full items-center justify-center rounded-xl bg-green text-xl font-bold text-white no-underline"
        >
          See goats for sale
        </Link>
      </main>
    </div>
  );
}
