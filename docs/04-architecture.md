# GetGoat – Architecture (v1)

## 1. Stack

| Part | Choice | Why |
|---|---|---|
| App | Next.js (App Router, TypeScript), mobile-first, PWA-ready | One codebase for buyer pages, seller admin and API. Server rendering gives fast first load and WhatsApp link previews. |
| Hosting | Vercel (Hobby → Pro if needed) | Zero-ops, HTTPS, custom domain, preview deploys per branch. |
| Database | PostgreSQL on Neon (free tier) + Prisma ORM | Relational data (orders, items), row locking for reservations. |
| Media | Cloudinary (free tier) | Auto-compress, resize, WebP/AVIF, video transcoding. Critical for 3G. |
| Payments | Payfast (redirect + ITN webhook) | South African, supports card, Instant EFT, Capitec Pay, SnapScan. |
| PDF | `pdf-lib` on the server | Small, no headless browser, works on Vercel functions. |
| Email | Resend (free tier) | Seller notification on paid order. |
| Auth | Single seller account: email + password (Auth.js credentials) with TOTP optional later | One user only. |

Estimated running cost at ≤50 goats / month: **R0 – R300 / month** (all free tiers; domain extra). Payfast fees per transaction apply.

## 2. Data model

```
Seller (1 row)
  id, businessName, companyRegNo, repName, repIdNumber(enc), farmName,
  farmAddress, cellphone, email, idMark, idMarkRegNo, signatureImageUrl?

Goat
  id, code (short, for links), breed, sex (BUCK|DOE|WETHER), ageMonths,
  weightKg, colour, idMarkType (TATTOO|BRAND|EAR_TAG), idMarkValue,
  priceCents, notes,
  pregnant (YES|NO|UNKNOWN)?, dueMonth?, hasKidded?, kiddingCount?,   -- doe only
  status (AVAILABLE|RESERVED|SOLD|COLLECTED|HIDDEN),
  reservedUntil?, createdAt, updatedAt

GoatMedia
  id, goatId, kind (PHOTO|VIDEO), cloudinaryId, sortOrder

Buyer
  id, fullName, idNumber(enc), cellphone, address, email?

Order
  id, number (GG-00001), buyerId, totalCents,
  status (PENDING|PAID|COLLECTED|CANCELLED|EXPIRED|REFUND_NEEDED|REFUNDED),
  driverName?, driverIdNumber(enc)?, vehicleReg?,
  payfastPaymentId?, paidAt?, collectedAt?, documentUrl?, createdAt

OrderItem
  id, orderId, goatId, priceCents          -- v1: exactly 1 per order; v2: cart
```

## 3. Key flows

### 3.1 Reserve and pay

1. Buyer submits details → server action, in one DB transaction:
   - `SELECT … FOR UPDATE` the goat.
   - If `AVAILABLE` (or `RESERVED` with `reservedUntil < now`): set `RESERVED`, `reservedUntil = now + 15 min`.
   - Create `Buyer`, `Order(PENDING)`, `OrderItem`.
   - Else: return "Someone is buying this goat now".
2. Server builds Payfast form fields (`merchant_id`, `merchant_key`, `return_url`, `cancel_url`, `notify_url`, `m_payment_id = order.id`, `amount`, `item_name`) + MD5 `signature` with passphrase. Browser auto-posts to Payfast.
3. Payfast → `POST /api/payfast/itn`:
   - Verify signature, source IP (Payfast ranges), amount = order total, and confirm with Payfast `validate` endpoint.
   - On `COMPLETE`: in one transaction set `Order=PAID`, goat `SOLD`. If goat was already sold to another order → `REFUND_NEEDED`, email seller.
   - Generate PDF, store, email seller. Idempotent: repeated ITN does nothing.
4. `return_url` → success page polls order status (ITN can arrive after redirect).
5. Expiry: reservations are checked lazily on every read + a Vercel cron every 5 min sets stale `PENDING` orders to `EXPIRED` and frees goats.

### 3.2 Removal document

- Generated server-side with `pdf-lib` from Order + Buyer + OrderItems. Seller section and removal date are printed as blank lines, completed by hand.
- Stored privately (Vercel Blob or Cloudinary private raw). Seller downloads via signed URL from the order page only.
- Seller signature image placed on the signature line if uploaded. Print-and-sign is the legal route.

### 3.3 Sharing

- Goat link: `/g/{code}`. Marketplace: `/goats`.
- Each page sets Open Graph tags (`og:image` = 1200×630 Cloudinary crop of first photo, `og:title` = "Boer doe · R 1 800"). WhatsApp shows this preview.
- Seller "Share" button opens `https://wa.me/?text=<message + link>`.

## 4. Security and POPIA

- ID numbers encrypted at rest (AES-256-GCM, key in env var). Masked in UI lists. Never in email.
- Seller area behind login; rate-limited.
- Payfast ITN verified 4 ways (signature, IP, amount, server validate).
- Retention job: anonymise buyer PII 3 years after order.
- Privacy notice page; consent tick stored with timestamp on order.

## 5. Environments and secrets

| Env var | Sandbox (now) | Live (go-live) |
|---|---|---|
| `PAYFAST_MERCHANT_ID` | `10000100` (Payfast public test account) | Your live ID |
| `PAYFAST_MERCHANT_KEY` | `46f0cd694581a` (public test) | Your live key |
| `PAYFAST_PASSPHRASE` | `jt7NOE43FZPn` (public test) | Your live passphrase |
| `PAYFAST_HOST` | `sandbox.payfast.co.za` | `www.payfast.co.za` |
| `DATABASE_URL`, `CLOUDINARY_URL`, `RESEND_API_KEY`, `ENCRYPTION_KEY`, `AUTH_SECRET` | per environment | per environment |

Secrets live only in Vercel project settings and a local `.env.local` (git-ignored). Never in the repo or chat.

## 6. Build slices

| # | Slice | Done when |
|---|---|---|
| 1 | Scaffold, DB, seller login, deploy to test domain | Seller can log in on phone at the test URL |
| 2 | Add / edit goat with photos + video | Goat with photos visible in admin |
| 3 | Public marketplace + goat page + OG previews + share | Link in WhatsApp shows preview, opens goat |
| 4 | Buyer details + reservation + Payfast sandbox + ITN | Sandbox payment marks goat SOLD |
| 5 | Orders admin + email + mark collected | Seller gets email, sees order, releases goat |
| 6 | Removal document PDF | PDF downloads with all fields |
| 7 | Hardening: expiry cron, refunds flag, POPIA, error pages, 3G test | Edge cases in flows doc pass |
| 8 | Go live: live Payfast keys, real domain | First real sale |

## 7. Visual design

"Veld" theme (sand / thornveld green / acacia red / ochre; Bricolage Grotesque + Figtree): https://claude.ai/artifact/VPKyQBQfdeXXP9skejdCMX
