import type { Metadata } from "next";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SELLER_NAME, sellerWhatsApp } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar back={{ href: "/goats", label: "All goats" }} title="Privacy" />
      <main className="flex flex-col gap-3 p-4 text-[15px] leading-relaxed">
        <p>
          {SELLER_NAME} collects your name, ID or passport number, cellphone number, address and (if you give it) email
          when you buy a goat.
        </p>
        <p>
          <strong>Why:</strong> to complete the sale and to fill in the stock removal document that the Stock Theft Act
          (57 of 1959) requires when goats are moved.
        </p>
        <p>
          <strong>Safety:</strong> ID numbers are encrypted. Only the seller can see your details. We do not sell or
          share them, except with Payfast to process payment.
        </p>
        <p>
          <strong>How long:</strong> at least one year (as the law requires), then up to three years, after which we
          delete them.
        </p>
        <p>
          <strong>Your rights (POPIA):</strong> you can ask to see, correct or delete your details.{" "}
          <a href={sellerWhatsApp("Hi, I have a privacy request.")}>WhatsApp us</a>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
