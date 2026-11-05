import "server-only";
import { formatRand, goatTitle } from "./goats";
import { orderNumber } from "./payfast";
import { APP_NAME, SELLER_NOTIFY_EMAIL } from "./site";

/**
 * Sends email through Resend's HTTP API. Without RESEND_API_KEY it logs and skips.
 * Until a domain is verified at Resend, the sender is onboarding@resend.dev, which can only
 * deliver to the Resend account owner's address.
 */
async function sendEmail(to: string, subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("Email skipped (no RESEND_API_KEY):", subject);
    return false;
  }
  const from = process.env.EMAIL_FROM || `${APP_NAME} <onboarding@resend.dev>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  if (!res.ok) {
    console.error("Email failed", res.status, await res.text());
    return false;
  }
  return true;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

type SaleEmail = {
  orderId: string;
  number: number;
  totalCents: number;
  refundNeeded: boolean;
  buyer: { fullName: string; cellphone: string; address: string };
  goat: { breed: string; sex: "BUCK" | "DOE" | "WETHER"; idMarkValue: string };
  origin: string;
};

/** Seller notification. Never contains ID numbers (POPIA). */
export async function sendSaleEmail(sale: SaleEmail) {
  const no = orderNumber(sale.number);
  const goat = `${goatTitle(sale.goat)} · ${sale.goat.idMarkValue}`;
  const link = `${sale.origin}/seller/orders/${sale.orderId}`;
  const subject = sale.refundNeeded
    ? `Refund needed: ${no} – goat was already sold`
    : `Sold: ${goat} – ${formatRand(sale.totalCents)} (${no})`;
  const lines = [
    sale.refundNeeded
      ? "A buyer paid, but this goat was already sold to someone else. Please refund the buyer in Payfast."
      : "A goat has been paid for. Release it when the buyer collects.",
    `Order: ${no}`,
    `Goat: ${goat}`,
    `Amount: ${formatRand(sale.totalCents)}`,
    `Buyer: ${sale.buyer.fullName}`,
    `Cellphone: ${sale.buyer.cellphone}`,
    `Goes to: ${sale.buyer.address}`,
  ];
  const html = `<div style="font-family:system-ui,sans-serif;font-size:16px;color:#1f2321">
<p>${esc(lines[0])}</p>
<table style="border-collapse:collapse">${lines
    .slice(1)
    .map((l) => {
      const [k, ...v] = l.split(": ");
      return `<tr><td style="padding:4px 12px 4px 0;color:#555">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(v.join(": "))}</strong></td></tr>`;
    })
    .join("")}</table>
<p><a href="${esc(link)}" style="display:inline-block;margin-top:12px;padding:12px 20px;background:#1f6b3a;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold">Open order and removal document</a></p>
</div>`;
  return sendEmail(SELLER_NOTIFY_EMAIL, subject, html, `${lines.join("\n")}\n\n${link}`);
}
