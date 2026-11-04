# GetGoat – Product Brief (v1)

## 1. Problem

A single goat seller in South Africa sells to individuals and businesses. Most buyers find the seller and negotiate on WhatsApp. Many buyers have low literacy. Today the seller sends loose photos, takes payment by hand, and writes the removal document on paper.

## 2. Goal

Let the seller:

1. Share one goat, or all goats for sale, as a WhatsApp link.
2. Let the buyer view, choose and pay in the app.
3. Record the buyer's details that the law requires.
4. Generate the stock removal document automatically.

## 3. Users

| User | Device | Needs |
|---|---|---|
| Seller (one person, admin) | Smartphone | Fast listing, share to WhatsApp, see who paid, release goats, download permit |
| Buyer (individual or business) | Low-cost Android, mobile data | Clear photos and price, few words, simple payment, proof of purchase |

## 4. Design principles

- **Pictures first.** Large photos and video. Large price in Rand. Icons with short labels.
- **Few words, plain words.** English and isiXhosa. Language switch on every page.
- **One action per screen.** One large main button.
- **Light pages.** Must load fast on 3G. Compressed images. Video loads only on tap.
- **Ask late.** Ask for buyer details only after the buyer taps "Buy".
- **Forgiving.** Clear error messages. Form keeps data if payment fails.

## 5. Scope

### v1 (in)

- Seller login (one account).
- Goat listing: photos, video, breed, sex, age, weight, colour, identification mark (tattoo / brand / ear tag), price, status.
- Goat status: Available → Reserved (during payment) → Sold → Collected.
- Share one goat to WhatsApp (link + short message + rich preview).
- Share marketplace (all available goats) to WhatsApp.
- Buyer marketplace page and goat page. Sold goats show a **SOLD** sign.
- Buy one goat per order.
- Buyer details form (see §7).
- Payfast payment (sandbox first, then live).
- Order record in the app. Seller sees who paid and whether to release.
- Email to seller when payment is confirmed.
- Stock removal document generated automatically as PDF. Seller downloads it and sends it on WhatsApp by hand. Seller prints and signs by hand at collection. Optional uploaded signature image on the PDF.
- English and isiXhosa.
- POPIA consent and privacy notice.

### v2 (later)

- Several goats in one order (cart). One payment, one document that lists all animals.
- Automatic WhatsApp messages (WhatsApp Business API).
- Push notifications.
- More languages.
- Deposits.

## 6. Multi-goat readiness

v1 sells one goat per order, but the data model supports many:

- `Order` has many `OrderItem`. Each `OrderItem` links to one `Goat`.
- The removal document is generated per `Order` and lists all items.
- v1 UI makes orders with exactly one item. v2 adds a cart. No data migration needed.

## 7. Buyer details collected

Collected after "Buy" and before payment:

| Field | Required | Reason |
|---|---|---|
| Full name | Yes | Removal document |
| SA ID number or passport number | Yes | Removal document (identity of receiver / remover) |
| Cellphone number | Yes | Contact, WhatsApp |
| Physical address (destination of goats) | Yes | Removal document |
| Collection by another person? | Yes (yes/no) | Removal document |
| – Driver full name | If yes | Removal document |
| – Driver ID number | If yes | Removal document |
| Vehicle registration | Optional | Common on removal forms |
| Email | Optional | Copy of receipt |
| POPIA consent tick | Yes | Legal |

See `03-legal-memo.md` for the legal basis.

## 8. Seller details (stored once in settings)

Full name, ID number, farm name, farm physical address (place of removal), cellphone, email, registered identification mark and registration number, optional signature image.

## 9. Order states

| State | Meaning | Who changes it |
|---|---|---|
| Pending payment | Buyer is on Payfast. Goat is reserved for 15 minutes. | System |
| Paid | Payfast confirmed (ITN). Goat is SOLD. Email sent. Document generated. | System |
| Released / Collected | Buyer collected the goat. | Seller |
| Cancelled / Expired | Payment failed or timed out. Goat is available again. | System |
| Refunded | Manual refund done in Payfast. | Seller |

## 10. Success measures

- Seller shares a goat in under 15 seconds.
- Buyer pays in under 3 minutes from opening the link.
- Zero double-sales of one goat.
- Every paid order has a complete removal document.

## 11. Proposed stack (confirm in architecture step)

- Next.js (mobile-first web app, installable later as PWA), hosted on Vercel.
- PostgreSQL (Neon or Supabase).
- Image and video storage with automatic compression (Cloudinary or Supabase Storage).
- Payfast (onsite redirect, ITN webhook, signature check).
- PDF generation on the server (pdf-lib or React-PDF).
- Transactional email (Resend or Postmark).
- i18n: English and isiXhosa.

Volume: 50 or fewer goats a month. Free or low-cost tiers are enough.
