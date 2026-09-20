import { describe, expect, it } from "vitest";
import { computeCommission } from "./commission";

describe("computeCommission", () => {
  it("charges 2.5% of the deal value", () => {
    const r = computeCommission(1_000_000_00, 250);
    expect(r.totalMinor).toBe(25_000_00);
    expect(r.platformMinor).toBe(25_000_00);
    expect(r.brokerMinor).toBe(0);
  });

  it("splits with a broker and never loses a minor unit", () => {
    const r = computeCommission(333_333_33, 250, { hasBroker: true, brokerShareBps: 4000 });
    expect(r.platformMinor + r.brokerMinor).toBe(r.totalMinor);
    expect(r.brokerMinor).toBe(Math.floor((r.totalMinor * 4000) / 10_000));
  });

  it("ignores the broker share when there is no broker", () => {
    const r = computeCommission(500_000_00, 250, { hasBroker: false, brokerShareBps: 4000 });
    expect(r.brokerMinor).toBe(0);
  });

  it("returns zero for a zero-value deal", () => {
    expect(computeCommission(0, 250).totalMinor).toBe(0);
  });

  it("rejects invalid input", () => {
    expect(() => computeCommission(-1, 250)).toThrow(RangeError);
    expect(() => computeCommission(100, 10_001)).toThrow(RangeError);
    expect(() => computeCommission(1.5, 250)).toThrow(RangeError);
  });
});
