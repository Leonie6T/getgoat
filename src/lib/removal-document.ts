import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { MARK_LABEL, SEX_LABEL, ageLabel } from "./goats";

export type RemovalDocumentData = {
  orderNumber: string;
  saleDate: Date;
  buyer: { fullName: string; idLabel: string; idNumber: string; address: string; cellphone: string };
  remover: { name: string; idNumber: string } | null;
  vehicleReg: string | null;
  goats: {
    breed: string;
    sex: keyof typeof SEX_LABEL;
    ageMonths: number | null;
    colour: string | null;
    idMarkType: keyof typeof MARK_LABEL;
    idMarkValue: string;
  }[];
  paymentRef: string | null;
};

const A4 = { w: 595.28, h: 841.89 };
const M = 40;
const INK = rgb(0.1, 0.1, 0.1);
const GREY = rgb(0.35, 0.35, 0.35);
const LINE = rgb(0.55, 0.55, 0.55);
const HEAD_BG = rgb(0.92, 0.92, 0.92);

/** Standard PDF fonts only cover Latin-1; replace anything else. */
const safe = (s: string) => s.normalize("NFKD").replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
/** dd/mm/yyyy in South African time. */
function fmtDate(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Africa/Johannesburg" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`;
}

/**
 * Document of Identification / Stock Removal Certificate (Stock Theft Act 57 of 1959, s6 and s8).
 * Buyer, remover and stock come from the order; the seller section, removal date and
 * signatures stay blank for completion by hand (owner decision).
 */
export async function buildRemovalDocument(d: RemovalDocumentData) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Stock removal document ${d.orderNumber}`);
  pdf.setCreator("Online Goat Market");
  const page = pdf.addPage([A4.w, A4.h]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = A4.w - 2 * M;
  let y = A4.h - M;

  const text = (s: string, x: number, yy: number, size = 9, f: PDFFont = font, color = INK) =>
    page.drawText(safe(s), { x, y: yy, size, font: f, color });

  // Title block
  text("DOCUMENT OF IDENTIFICATION / STOCK REMOVAL CERTIFICATE", M, y - 14, 13, bold);
  text("Stock Theft Act 57 of 1959, sections 6 and 8", M, y - 28, 9, font, GREY);
  const right = (s: string, yy: number, f: PDFFont = font) => text(s, A4.w - M - f.widthOfTextAtSize(safe(s), 9), yy, 9, f);
  right(`No. ${d.orderNumber}`, y - 14, bold);
  right(`Date of sale: ${fmtDate(d.saleDate)}`, y - 27);
  right("Date of removal: ____ / ____ / ________", y - 40);
  y -= 58;

  // Key/value table helper
  const ROW = 22;
  const table = (title: string, rows: [string, string][]) => {
    page.drawRectangle({ x: M, y: y - 18, width, height: 18, color: HEAD_BG, borderColor: LINE, borderWidth: 0.7 });
    text(title, M + 6, y - 13, 9, bold);
    y -= 18;
    for (const [label, value] of rows) {
      cell(page, M, y, width * 0.38, ROW);
      cell(page, M + width * 0.38, y, width * 0.62, ROW);
      text(label, M + 6, y - 14, 9);
      if (value) text(value, M + width * 0.38 + 6, y - 14, 10, bold);
      y -= ROW;
    }
    y -= 10;
  };

  table("1. SELLER / OWNER (complete by hand)", [
    ["Business name / company reg. no.", ""],
    ["Authorised representative / ID number", ""],
    ["Farm and address (place of removal)", ""],
    ["Cellphone", ""],
    ["Registered identification mark / reg. no.", ""],
  ]);
  table("2. BUYER / RECEIVER", [
    ["Full name", d.buyer.fullName],
    [d.buyer.idLabel, d.buyer.idNumber],
    ["Address (destination)", d.buyer.address],
    ["Cellphone", d.buyer.cellphone],
  ]);
  table("3. PERSON REMOVING THE STOCK (if not the buyer)", [
    ["Full name / ID or passport number", d.remover ? `${d.remover.name} / ${d.remover.idNumber}` : "Buyer"],
    ["Vehicle registration", d.vehicleReg ?? ""],
  ]);

  // Stock table
  const cols = [
    { h: "#", w: 0.05 },
    { h: "Kind", w: 0.09 },
    { h: "Breed", w: 0.17 },
    { h: "Sex", w: 0.1 },
    { h: "Age", w: 0.12 },
    { h: "Colour", w: 0.17 },
    { h: "Identification mark", w: 0.3 },
  ];
  page.drawRectangle({ x: M, y: y - 18, width, height: 18, color: HEAD_BG, borderColor: LINE, borderWidth: 0.7 });
  text(`4. STOCK (number of animals: ${d.goats.length})`, M + 6, y - 13, 9, bold);
  y -= 18;
  const row = (values: string[], f: PDFFont) => {
    let x = M;
    cols.forEach((c, i) => {
      cell(page, x, y, width * c.w, ROW);
      text(values[i], x + 4, y - 14, 9, f);
      x += width * c.w;
    });
    y -= ROW;
  };
  row(cols.map((c) => c.h), bold);
  d.goats.forEach((g, i) =>
    row(
      [String(i + 1), "Goat", g.breed, SEX_LABEL[g.sex], ageLabel(g.ageMonths) ?? "", g.colour ?? "", `${MARK_LABEL[g.idMarkType]} ${g.idMarkValue}`],
      font,
    ),
  );
  y -= 14;

  text("I certify that the particulars above are true and that I am the owner (or authorised agent) of the stock described.", M, y, 8.5, font, GREY);
  y -= 50;

  // Signatures
  const sigW = (width - 30) / 2;
  for (const [i, label] of ["Seller / owner signature", "Buyer / person removing - signature"].entries()) {
    const x = M + i * (sigW + 30);
    page.drawLine({ start: { x, y }, end: { x: x + sigW, y }, thickness: 0.8, color: INK });
    text(label, x, y - 12, 9);
    text("Date: ____ / ____ / ________", x, y - 26, 9);
    text("Place: ______________________", x, y - 40, 9);
  }

  // Footer
  const foot = `The receiver must keep this document for at least one year (s6). Generated by Online Goat Market${
    d.paymentRef ? ` - Payfast ref ${d.paymentRef}` : ""
  }.`;
  page.drawLine({ start: { x: M, y: M + 14 }, end: { x: A4.w - M, y: M + 14 }, thickness: 0.5, color: LINE });
  text(foot, M, M, 7.5, font, GREY);

  return pdf.save();
}

function cell(page: PDFPage, x: number, top: number, w: number, h: number) {
  page.drawRectangle({ x, y: top - h, width: w, height: h, borderColor: LINE, borderWidth: 0.7 });
}
