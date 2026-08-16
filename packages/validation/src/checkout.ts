import { z } from "zod";
import { EMIRATES } from "@ioma/config";

// Mirrors apps/api/src/modules/orders/dto/order-address.dto.ts.
const emirateCodes = EMIRATES.map((e) => e.code) as [string, ...string[]];

export const orderAddressSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(6).max(20),
  emirate: z.enum(emirateCodes),
  city: z.string().min(1).max(80),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).optional(),
});

export type OrderAddressInput = z.infer<typeof orderAddressSchema>;

export const checkoutSchema = z.object({
  shippingAddress: orderAddressSchema,
  deliveryMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["mock_success", "mock_failure"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
