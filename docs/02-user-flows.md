# Online Goat Market – User Flows (v1)

## A. Seller: add a goat

1. Open app → **Goats** → **+ Add goat**.
2. Take or upload photos (min 1, max 8). Optional video (max 30 s).
3. Fill details: breed, sex, age, weight, colour, ID mark (tattoo / brand / ear tag), price.
4. Tap **Save**. Goat is **Available**.

## B. Seller: share

- **One goat:** goat card → **Share on WhatsApp**. WhatsApp opens with message + link `getgoat.co.za/g/<code>`.
- **All goats:** home → **Share all goats**. WhatsApp opens with link `getgoat.co.za/goats`.
- Seller picks the chat and sends.
- WhatsApp shows a preview: photo, name, price.

## C. Buyer: browse and buy

1. Tap link in WhatsApp.
2. **Marketplace** (if all goats link): grid of large photos with price. Sold goats show SOLD sign and cannot be bought.
3. **Goat page:** photo gallery, video (tap to play), price, key facts as icons (sex, age, weight, breed). Main button: **Buy this goat**.
4. **Your details** (one short page, large fields):
   - Full name
   - ID / passport number
   - Cellphone number
   - Address where the goat goes
   - "Will someone else collect?" Yes / No → if Yes: driver name, driver ID
   - Vehicle registration (optional)
   - Email (optional)
   - Consent tick
   - Button: **Pay R X**
5. Goat is **reserved for 5 minutes**. Timer shows on the page.
6. **Payfast** page: buyer pays.
7. **Success page:** big tick, goat photo with SOLD, order number, text: "Payment received. The seller will contact you about collection." Button: **Back to goats**.
8. **Cancel / fail page:** "Payment not done. Try again." Form data kept. Reservation released after 5 minutes.

## D. System after payment

1. Payfast sends ITN to server. Server checks signature, amount and source.
2. Order → **Paid**. Goat → **Sold**.
3. Server generates removal document PDF.
4. Server sends email to seller: buyer name, cellphone, goat, amount, link to order.

## E. Seller: handle the order

1. Open app → **Orders**. List shows: goat photo, buyer name, amount, status badge.
2. Tap order → details:
   - Buyer details.
   - **Download document (PDF)**.
   - **Open WhatsApp chat with buyer** (opens chat with buyer's cellphone; seller attaches PDF by hand).
   - **Mark as collected**.
3. At collection: seller prints document, both sign, buyer keeps copy, seller keeps copy.

## F. Edge cases

| Case | Behaviour |
|---|---|
| Two buyers tap Buy on the same goat | First gets 5-minute reservation. Second sees "Someone is buying this goat now. Try again in 5 minutes." |
| Payment succeeds after reservation expired | Server still accepts it if goat is not sold to someone else. If it is, order is flagged for manual refund and seller is emailed. |
| Buyer closes Payfast page | Reservation expires. Goat is available again. |
| Seller edits price during reservation | Not allowed while reserved. |
| Slow network | Pages show photo placeholders. Form is saved locally. |

## Wireframes

Clickable low-fidelity wireframes (10 screens): https://claude.ai/artifact/D8Pzo4AvNZTAfGHcrVA1ir
