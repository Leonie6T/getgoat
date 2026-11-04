/** South African ID: 13 digits, valid date of birth, Luhn check digit. */
export function isValidSaId(id: string) {
  if (!/^\d{13}$/.test(id)) return false;
  const month = Number(id.slice(2, 4));
  const day = Number(id.slice(4, 6));
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let d = Number(id[12 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function isValidPassport(value: string) {
  return /^[A-Z0-9]{6,12}$/.test(value);
}

/** Accepts 082 123 4567, 0821234567, +27 82 123 4567, 27821234567. Returns 082 123 4567 or null. */
export function normaliseCellphone(input: string) {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+27")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("27") && digits.length === 11) digits = `0${digits.slice(2)}`;
  if (!/^0[6-8]\d{8}$/.test(digits)) return null;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/** 082 123 4567 -> 27821234567 (for wa.me links) */
export function cellphoneToWa(cell: string) {
  return `27${cell.replace(/\D/g, "").slice(1)}`;
}
