import type { Metadata } from "next";
import Link from "next/link";
import { sellerWhatsApp } from "@/lib/site";

export const metadata: Metadata = {
  title: "Brofour Farming – cattle and goats, East London",
  description: "Brofour Farming is a livestock farming business owned by the Brody brothers, farming cattle and goats in the East London area.",
  openGraph: {
    title: "Brofour Farming",
    description: "Cattle and goats · East London",
    images: ["/brand/online-goat-market-1200.jpg"],
  },
};

/** Simple company page: brief overview, link to the marketplace and WhatsApp contact. */
export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-ground">
      <header className="flex flex-col items-center gap-4 bg-green px-5 pb-10 pt-12 text-center text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/online-goat-market-256.png"
          alt="Brofour Farming logo"
          width={136}
          height={136}
          className="rounded-full border-4 border-white bg-white"
        />
        <h1 className="text-[36px] font-extrabold leading-tight">Brofour Farming</h1>
        <p className="text-[17px]">Cattle and goats · East London</p>
      </header>

      <main className="flex flex-col gap-4 px-5 pt-7">
        <p className="text-[17px] leading-relaxed">
          Brofour Farming is a livestock farming business owned by the Brody brothers. We farm cattle and goats in the East
          London area of the Eastern Cape.
        </p>
        <p className="text-sm text-muted">Brofour Farming (Pty) Ltd · Reg. 2021/853086/07</p>
        <Link
          href="/goats"
          className="mt-3 flex min-h-14 items-center justify-center rounded-xl bg-green text-lg font-bold text-white no-underline"
        >
          Goats for sale – Online Goat Market
        </Link>
        <a
          href={sellerWhatsApp("Hi Brofour Farming, ")}
          className="flex min-h-14 items-center justify-center rounded-xl bg-[#25a244] text-lg font-bold text-white no-underline"
        >
          Contact us on WhatsApp
        </a>
      </main>

      <footer className="mt-auto border-t border-line px-5 py-4 text-[13px] text-muted">© Brofour Farming (Pty) Ltd</footer>
    </div>
  );
}
