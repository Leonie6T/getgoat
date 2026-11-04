# GetGoat – Legal Requirements Memo (v1)

> Not legal advice. Verify the final field list with the SAPS Stock Theft Unit or a lawyer before go-live.

## 1. Stock Theft Act 57 of 1959

### Section 6 – Document of identification (seller → buyer)

- A seller who delivers stock must give the receiver a document of identification at delivery.
- No person may receive stock without this document.
- The document is void if a required particular is missing.
- The receiver must keep it for at least **one year**.
- A false statement in it is an offence.
- The 1990 amendment (Act 28 of 1990) added particulars to s6(1)(a).

### Section 8 – Removal of stock

- A person who moves stock must carry a document from the owner (or authorised agent) that identifies the stock.
- The official removal certificate form asks for the **full name and identity number** of the issuer and of the person who moves the stock, their addresses, signature and date.

### Conclusion for GetGoat

The buyer usually collects. So the buyer (or the buyer's driver) is the person who moves the stock. **Collect the buyer's ID number, and the driver's ID number when someone else collects.**

## 2. Animal Identification Act 6 of 2002

- Goats must carry the owner's registered identification mark (tattoo or brand).
- The mark must be on the document. Each goat record stores the mark.

## 3. Document content (proposed)

**Title:** Document of Identification / Stock Removal Certificate (Stock Theft Act 57 of 1959, s6 and s8)

| Section | Fields |
|---|---|
| Document | Document number (= order number), date of sale, date of removal |
| Seller / owner | Full name, ID number, farm name, address (place of removal), cellphone, registered mark + registration number |
| Buyer / receiver | Full name, ID / passport number, address (destination), cellphone |
| Person removing (if not buyer) | Full name, ID number |
| Transport | Vehicle registration (optional) |
| Stock | Number of animals, kind (goat), breed, sex, age, colour, identification marks (tattoo / brand / ear tag) |
| Signatures | Seller signature + date (printed line, or uploaded image). Buyer / remover signature + date (printed line) |

## 4. Signature

- ECTA 25 of 2002 s13(1): when a law requires a signature and does not say which type, only an **advanced electronic signature** (accredited provider) is valid.
- **Decision:** v1 uses the print route. The seller prints the PDF and signs by hand at collection. An uploaded signature image is a convenience only. Do not depend on it as a legal signature.

## 5. Veterinary movement

- Some areas need a veterinary movement permit (disease control), mainly for moves between provinces or out of controlled areas.
- v1: show a reminder on the seller's order page. Out of system scope.

## 6. POPIA (Protection of Personal Information Act 4 of 2013)

- Lawful basis: performance of the sale and a legal obligation (Stock Theft Act).
- Collect the minimum only (see Product Brief §7).
- Show a short privacy notice and a consent tick at checkout.
- Protect ID numbers: encrypt at rest, show masked in lists, no ID numbers in emails.
- Retention: keep order and document at least 1 year (s6). Proposed: 3 years, then delete or anonymise.
- Name an information officer (the seller).

## 7. Open items to verify

1. Exact current s6(1)(a) particulars (session could not open acts.co.za).
2. Whether a newer prescribed form replaces the 1991 removal certificate.
3. Provincial veterinary movement rules for the seller's area.

## Sources

- Stock Theft Act 57 of 1959 – https://www.gov.za/sites/default/files/gcis_document/201505/act-57-1959.pdf
- Stock Theft Amendment Act 28 of 1990 – https://www.gov.za/sites/default/files/gcis_document/201503/act-28-1990.pdf
- Animal Identification Act 6 of 2002 – https://www.gov.za/sites/default/files/gcis_document/201409/a6-02.pdf
- 1991 gazette removal certificate form – https://archive.gazettes.africa/archive/na/1991/na-government-gazette-dated-1991-10-22-no-282.pdf
- Grain SA, "Animal identification is essential" – https://www.grainsa.co.za/animal-identification-is-essential
