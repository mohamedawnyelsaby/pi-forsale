// Lightweight rule-based parser for free-text search ("Marwan v0").
// Extracts structured hints from Arabic/English text without calling any AI API,
// so search understands things like "شقة 3 غرف تحت 2 مليون" before a paid AI layer exists.
import type { KINDS, TYPES } from "./constants";

export type ParsedQuery = {
  kind?: (typeof KINDS)[number];
  type?: (typeof TYPES)[number];
  minBedrooms?: number;
  maxPriceEgp?: number; // interpreted amount, assumed EGP unless another currency is implied
  remainder: string; // free text left over, used for substring/ILIKE matching
};

const KIND_WORDS: Record<string, ParsedQuery["kind"]> = {
  "شقة": "apartment", "شقق": "apartment", "apartment": "apartment", "flat": "apartment",
  "فيلا": "villa", "فلة": "villa", "villa": "villa",
  "ارض": "land", "أرض": "land", "قطعة": "land", "land": "land", "plot": "land",
  "محل": "commercial", "تجاري": "commercial", "مكتب": "commercial", "commercial": "commercial", "shop": "commercial", "office": "commercial",
  "شاليه": "chalet", "شالية": "chalet", "chalet": "chalet",
  "عمارة": "building", "عماره": "building", "building": "building",
};

const TYPE_WORDS: Record<string, ParsedQuery["type"]> = {
  "للبيع": "sale", "بيع": "sale", "sale": "sale", "for sale": "sale",
  "للايجار": "rent", "للإيجار": "rent", "ايجار": "rent", "إيجار": "rent", "rent": "rent",
};

const ARABIC_DIGITS: Record<string, string> = { "٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9" };
function normalizeDigits(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => ARABIC_DIGITS[d] ?? d);
}

const WORD_NUMBERS: Record<string, number> = {
  "غرفة": 1, "غرفتين": 2, "ثلاثة": 3, "تلاتة": 3, "اربعة": 4, "أربعة": 4, "خمسة": 5,
  "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
};

function extractBedrooms(text: string): { value?: number; consumed: RegExp[] } {
  const consumed: RegExp[] = [];
  let m = text.match(/(\d+)\s*(غرف|غرفة|bed(room)?s?)/i);
  if (m) {
    consumed.push(new RegExp(m[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    return { value: Number(m[1]), consumed };
  }
  for (const [word, n] of Object.entries(WORD_NUMBERS)) {
    if (text.includes(word) && /غرف|bed(room)?s?/i.test(text)) {
      const re = new RegExp(`${word}\\s*(غرف[ةه]?)?`, "i");
      if (re.test(text)) {
        consumed.push(re);
        return { value: n, consumed };
      }
    }
  }
  return { consumed };
}

function extractMaxPrice(text: string): { value?: number; consumed: RegExp[] } {
  const consumed: RegExp[] = [];
  // "تحت 2 مليون" / "اقل من 500 الف" / "under 1000000" / "below 2 million"
  let m = text.match(/(?:تحت|أقل من|اقل من|under|below)\s*([\d.]+)\s*(مليون|million|الف|ألف|thousand)?/i);
  if (m) {
    let n = Number(m[1]);
    const unit = m[2]?.toLowerCase();
    if (unit && /مليون|million/.test(unit)) n *= 1_000_000;
    else if (unit && /الف|ألف|thousand/.test(unit)) n *= 1_000;
    consumed.push(new RegExp(m[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    return { value: n, consumed };
  }
  return { consumed };
}

export function parseQuery(raw: string): ParsedQuery {
  const text = normalizeDigits(raw.trim());
  let remainder = text;
  const result: ParsedQuery = { remainder: text };

  for (const [word, kind] of Object.entries(KIND_WORDS)) {
    if (remainder.includes(word)) {
      result.kind = kind;
      remainder = remainder.replace(new RegExp(word, "i"), " ");
      break;
    }
  }
  for (const [word, type] of Object.entries(TYPE_WORDS)) {
    if (remainder.includes(word)) {
      result.type = type;
      remainder = remainder.replace(new RegExp(word, "i"), " ");
      break;
    }
  }
  const beds = extractBedrooms(remainder);
  if (beds.value !== undefined) {
    result.minBedrooms = beds.value;
    for (const re of beds.consumed) remainder = remainder.replace(re, " ");
  }
  const price = extractMaxPrice(remainder);
  if (price.value !== undefined) {
    result.maxPriceEgp = price.value;
    for (const re of price.consumed) remainder = remainder.replace(re, " ");
  }

  result.remainder = remainder.replace(/\s+/g, " ").trim();
  return result;
}
