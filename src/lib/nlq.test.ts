import { describe, expect, it } from "vitest";
import { parseQuery } from "./nlq";

describe("parseQuery", () => {
  it("extracts kind, bedrooms and a nearby-sea remainder", () => {
    const r = parseQuery("شقة 3 غرف قريبة من البحر");
    expect(r.kind).toBe("apartment");
    expect(r.minBedrooms).toBe(3);
    expect(r.remainder).toContain("البحر");
  });

  it("extracts a price ceiling in millions", () => {
    const r = parseQuery("فيلا تحت 2 مليون في القاهرة");
    expect(r.kind).toBe("villa");
    expect(r.maxPriceEgp).toBe(2_000_000);
    expect(r.remainder).toContain("القاهرة");
  });

  it("extracts price ceiling in thousands for rent", () => {
    const r = parseQuery("محل للايجار اقل من 500 الف");
    expect(r.type).toBe("rent");
    expect(r.kind).toBe("commercial");
    expect(r.maxPriceEgp).toBe(500_000);
  });

  it("handles English input", () => {
    const r = parseQuery("apartment for sale under 1000000 in Dubai");
    expect(r.kind).toBe("apartment");
    expect(r.type).toBe("sale");
    expect(r.maxPriceEgp).toBe(1_000_000);
    expect(r.remainder.toLowerCase()).toContain("dubai");
  });

  it("returns plain remainder when nothing matches", () => {
    const r = parseQuery("دمياط الجديدة");
    expect(r.kind).toBeUndefined();
    expect(r.maxPriceEgp).toBeUndefined();
    expect(r.remainder).toBe("دمياط الجديدة");
  });

  it("word-form bedroom counts in Arabic", () => {
    const r = parseQuery("شقة ثلاثة غرف في المعادي");
    expect(r.minBedrooms).toBe(3);
  });
});
