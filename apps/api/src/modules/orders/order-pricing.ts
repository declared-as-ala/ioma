export const VAT_RATE = 0.05; // UAE standard VAT — real, current law, not invented.
export const STANDARD_SHIPPING_MINOR = 2000; // AED 20
export const EXPRESS_SHIPPING_MINOR = 3000; // AED 30
export const FREE_SHIPPING_THRESHOLD_MINOR = 30000; // AED 300

export interface OrderTotals {
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
}

// Pulled out of OrdersService as a pure function so cart pricing/tax math
// can be unit tested in isolation from Mongoose/cart/payment wiring — see
// order-pricing.spec.ts and SPRINTS.md Sprint 4 test requirements.
export function computeOrderTotals(
  subtotalMinor: number,
  deliveryMethod: "standard" | "express",
): OrderTotals {
  const taxMinor = Math.round(subtotalMinor * VAT_RATE);
  const shippingMinor =
    deliveryMethod === "express"
      ? EXPRESS_SHIPPING_MINOR
      : subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR
        ? 0
        : STANDARD_SHIPPING_MINOR;
  const totalMinor = subtotalMinor + taxMinor + shippingMinor;

  return { subtotalMinor, taxMinor, shippingMinor, totalMinor };
}
