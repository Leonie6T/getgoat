# Online Goat Market (getgoat)

Mobile-first goat marketplace for Brofour Farming. Seller shares goats on WhatsApp; buyers view, pay with Payfast and get a stock removal document.

Docs: `docs/` (brief, flows, legal memo, architecture).

## Develop

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Create the seller password hash with `npm run hash-password -- 'your password'`.
