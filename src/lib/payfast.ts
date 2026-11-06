import "server-only";
import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";

/**
 * Payfast onsite redirect + ITN (instant transaction notification).
 * Without credentials the app uses Payfast's shared public sandbox merchant. Its passphrase
 * is not reliable (shared account), so sandbox signs without one unless PAYFAST_PASSPHRASE is set.
 */
const SANDBOX = { merchantId: "10000100", merchantKey: "46f0cd694581a" };
const SANDBOX_KNOWN_PASSPHRASES = ["", "jt7NOE43FZPn"];

export function payfastConfig() {
  const live = process.env.PAYFAST_MODE === "live";
  return {
    live,
    host: live ? "www.payfast.co.za" : "sandbox.payfast.co.za",
    merchantId: process.env.PAYFAST_MERCHANT_ID || (live ? "" : SANDBOX.merchantId),
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || (live ? "" : SANDBOX.merchantKey),
    passphrase: process.env.PAYFAST_PASSPHRASE ?? "",
  };
}

/** Card payments are offered to buyers only with live Payfast keys (PAYFAST_MODE=live). */
export function cardPaymentsEnabled() {
  return payfastConfig().live;
}

/** ITN signature check. In sandbox, also accept the shared account's known passphrase variants. */
export function itnSignatureOk(fields: [string, string][], signature: string | undefined) {
  if (!signature) return false;
  const cfg = payfastConfig();
  const candidates = cfg.live ? [cfg.passphrase] : [...new Set([cfg.passphrase, ...SANDBOX_KNOWN_PASSPHRASES])];
  return candidates.some((p) => payfastSignature(fields, p, true) === signature);
}

/** PHP urlencode, which Payfast signs with: spaces as +, and !'()*~ encoded. */
function phpUrlencode(value: string) {
  return encodeURIComponent(value)
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
}

/**
 * Signature over the fields in the given order, without `signature`.
 * Payment requests skip empty values; ITN checks keep every posted field (`keepEmpty`).
 */
export function payfastSignature(fields: [string, string][], passphrase: string, keepEmpty = false) {
  const parts = fields
    .filter(([k, v]) => k !== "signature" && (keepEmpty || v !== ""))
    .map(([k, v]) => `${k}=${phpUrlencode(keepEmpty ? v : v.trim())}`);
  if (passphrase) parts.push(`passphrase=${phpUrlencode(passphrase.trim())}`);
  return createHash("md5").update(parts.join("&")).digest("hex");
}

export type PaymentRequest = {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  itemName: string;
  buyerName: string;
  buyerEmail?: string | null;
  buyerCell: string;
  origin: string;
};

/**
 * Payfast's signature check is sensitive to special characters (brackets, quotes, accents).
 * Keep only plain letters, digits and simple punctuation in free-text fields.
 */
function plain(value: string, max = 100) {
  return value
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9 .,\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Ordered form fields for the redirect to Payfast (order matters for the signature). */
export function paymentFields(req: PaymentRequest) {
  const cfg = payfastConfig();
  const [first, ...rest] = req.buyerName.trim().split(/\s+/);
  const fields: [string, string][] = [
    ["merchant_id", cfg.merchantId],
    ["merchant_key", cfg.merchantKey],
    ["return_url", `${req.origin}/order/${req.orderId}`],
    ["cancel_url", `${req.origin}/order/${req.orderId}/cancel`],
    ["notify_url", `${req.origin}/api/payfast/itn`],
    ["name_first", plain(first ?? "", 100)],
    ["name_last", plain(rest.join(" "), 100)],
    ["email_address", req.buyerEmail ?? ""],
    ["cell_number", req.buyerCell.replace(/\D/g, "")],
    // Readable merchant reference in Payfast reports, e.g. GG-00007.
    ["m_payment_id", req.orderNumber],
    ["amount", (req.amountCents / 100).toFixed(2)],
    ["item_name", plain(req.itemName)],
    ["item_description", plain(`Order ${req.orderNumber}`)],
  ];
  // The posted values must be exactly the signed values: trim, then drop empty ones.
  const nonEmpty = fields.map(([k, v]) => [k, v.trim()] as [string, string]).filter(([, v]) => v !== "");
  return {
    action: `https://${cfg.host}/eng/process`,
    fields: [...nonEmpty, ["signature", payfastSignature(nonEmpty, cfg.passphrase)]] as [string, string][],
  };
}

const PAYFAST_HOSTS = ["www.payfast.co.za", "sandbox.payfast.co.za", "w1w.payfast.co.za", "w2w.payfast.co.za"];

export async function isPayfastIp(ip: string | null) {
  if (!ip) return false;
  const lists = await Promise.all(PAYFAST_HOSTS.map((h) => lookup(h, { all: true }).catch(() => [])));
  return lists.flat().some((a) => a.address === ip);
}

/** Asks Payfast to confirm the ITN data is genuine. */
export async function confirmWithPayfast(rawBody: string) {
  const res = await fetch(`https://${payfastConfig().host}/eng/query/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: rawBody,
  });
  return (await res.text()).trim() === "VALID";
}

export function orderNumber(n: number) {
  return `GG-${String(n).padStart(5, "0")}`;
}
