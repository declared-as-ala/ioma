import { computeOrderTotals } from "./order-pricing";

describe("computeOrderTotals", () => {
  it("applies 5% VAT and standard shipping below the free-shipping threshold", () => {
    const totals = computeOrderTotals(9400, "standard");
    expect(totals).toEqual({
      subtotalMinor: 9400,
      taxMinor: 470,
      shippingMinor: 2000,
      totalMinor: 11870,
    });
  });

  it("waives standard shipping at or above the AED 300 free-shipping threshold", () => {
    const atThreshold = computeOrderTotals(30000, "standard");
    expect(atThreshold.shippingMinor).toBe(0);
    expect(atThreshold.totalMinor).toBe(30000 + 1500);

    const belowThreshold = computeOrderTotals(29999, "standard");
    expect(belowThreshold.shippingMinor).toBe(2000);
  });

  it("charges a flat express shipping fee regardless of subtotal", () => {
    const smallOrder = computeOrderTotals(5000, "express");
    expect(smallOrder.shippingMinor).toBe(3000);

    const largeOrder = computeOrderTotals(50000, "express");
    expect(largeOrder.shippingMinor).toBe(3000);
  });

  it("rounds VAT to the nearest fils", () => {
    const totals = computeOrderTotals(3333, "standard");
    expect(totals.taxMinor).toBe(Math.round(3333 * 0.05));
    expect(totals.taxMinor).toBe(167);
  });

  it("sums subtotal, tax, and shipping into the total", () => {
    const totals = computeOrderTotals(12000, "standard");
    expect(totals.totalMinor).toBe(
      totals.subtotalMinor + totals.taxMinor + totals.shippingMinor,
    );
  });
});
