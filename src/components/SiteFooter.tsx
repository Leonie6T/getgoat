import Link from "next/link";
import { SELLER_NAME } from "@/lib/site";

/** Buyer page footer: seller, Terms, Privacy, seller login. */
export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line px-4 py-3 text-sm text-muted">
      <span>Sold by {SELLER_NAME}</span>
      <nav className="flex gap-4">
        <Link href="/terms" className="text-muted">Terms</Link>
        <Link href="/privacy" className="text-muted">Privacy</Link>
        <Link href="/seller" className="text-muted">Seller login</Link>
      </nav>
    </footer>
  );
}
