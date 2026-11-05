import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { TopBar } from "@/components/TopBar";
import { HOLD_MINUTES } from "@/lib/orders";
import { COLLECTION_POINT, SELLER_NAME, sellerWhatsApp } from "@/lib/site";

export const metadata: Metadata = { title: "Terms and conditions" };

const UPDATED = "6 November 2026";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-[17px] font-bold">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar back={{ href: "/goats", label: "All goats" }} title="Terms" />
      <main className="flex flex-col gap-5 p-4 text-[15px] leading-relaxed">
        <div>
          <h1 className="text-[22px] font-extrabold">Terms and conditions</h1>
          <p className="text-[13px] text-muted">Last updated {UPDATED}</p>
        </div>

        <Section n={1} title="Who sells">
          <p>
            {SELLER_NAME} (company registration 2021/853086/07) sells the goats on Online Goat Market. When you pay, you
            buy the goat from {SELLER_NAME}.
          </p>
        </Section>

        <Section n={2} title="The goats">
          <ul className="list-disc pl-5">
            <li>Photos and details show each goat as honestly as we can.</li>
            <li>Pregnancy and due dates are our best estimate. We cannot guarantee them.</li>
            <li>Check the goat and its tag when you collect.</li>
          </ul>
        </Section>

        <Section n={3} title="Price and payment">
          <ul className="list-disc pl-5">
            <li>Prices are in South African rand. You pay the full price.</li>
            <li>
              <strong>Card (Payfast):</strong> the goat is held for {HOLD_MINUTES} minutes while you pay. The sale is
              complete when Payfast confirms your payment.
            </li>
            <li>
              <strong>EFT:</strong> pay into our FNB account with your order number as reference and email the proof of
              payment. The goat is reserved for you. The sale is complete when the money is in our account. If we do
              not receive payment, we may cancel the order.
            </li>
            <li>
              <strong>Cash at collection:</strong> the goat is reserved for you. Pay the full amount in cash when you
              collect. If you do not collect, we may cancel the order.
            </li>
            <li>You get your receipt when your payment is confirmed.</li>
          </ul>
        </Section>

        <Section n={4} title="Collection">
          <ul className="list-disc pl-5">
            <li>
              All goats are collected at <strong>{COLLECTION_POINT}</strong>.
            </li>
            <li>Collection is possible from the day after you pay. Agree a time with us on WhatsApp.</li>
            <li>Show your receipt (on your phone is fine) when you collect. If someone collects for you, give them the receipt link.</li>
            <li>
              You (or your driver) and the seller sign the stock removal document at collection, as the Stock Theft Act
              requires. Keep your copy for at least one year.
            </li>
            <li>
              From collection, you are responsible for the goat: transport, care, and any veterinary movement permit
              for its destination.
            </li>
          </ul>
        </Section>

        <Section n={5} title="Cancellations and refunds">
          <ul className="list-disc pl-5">
            <li>
              <strong>Refunds take 10 to 15 working days</strong> and are paid back through Payfast to the way you paid.
            </li>
            <li>If two buyers pay for the same goat, the later payment is refunded in full.</li>
            <li>
              If the goat becomes ill or dies before collection, we refund you in full or, if you agree, offer another
              goat.
            </li>
            <li>To cancel a purchase, WhatsApp us before collection.</li>
            <li>
              This does not limit your rights under the Consumer Protection Act and the Electronic Communications and
              Transactions Act.
            </li>
          </ul>
        </Section>

        <Section n={6} title="Your details">
          <p>
            We use your details only for the sale and the stock removal document. See the{" "}
            <a href="/privacy">privacy notice</a>.
          </p>
        </Section>

        <Section n={7} title="Contact and law">
          <p>
            Questions or complaints: <a href={sellerWhatsApp("Hi, I have a question about the terms.")}>WhatsApp us</a>.
            South African law applies.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
