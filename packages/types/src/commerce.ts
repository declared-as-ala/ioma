import type { ProductRangeKey } from "@ioma/config";
import type { LocalizedText } from "./api";

export interface RangeSummary {
  slug: ProductRangeKey;
  name: LocalizedText;
}

export interface ProductVariantSummary {
  sku: string;
  size: string;
  priceMinor: number;
  inStock: boolean;
}

export interface ProductListItem {
  slug: string;
  name: LocalizedText;
  shortBenefit: LocalizedText;
  description?: LocalizedText;
  routineStep: "morning" | "evening" | "both";
  images: string[];
  range: RangeSummary;
  priceFromMinor: number | null;
  isBestSeller?: boolean;
  rating?: number;
  reviewCount?: number;
  uaeAvailability?: "AVAILABLE" | "PENDING";
  variants?: ProductVariantSummary[];
}

export interface CategorySummary {
  slug: string;
  name: LocalizedText;
}

export interface ConcernSummary {
  slug: string;
  name: LocalizedText;
  icon: string;
}

export interface ProductDetail {
  id: string;
  slug: string;
  range: RangeSummary;
  name: LocalizedText;
  shortBenefit: LocalizedText;
  description: LocalizedText;
  howToUse: LocalizedText;
  routineStep: "morning" | "evening" | "both";
  fullIngredientsText: LocalizedText;
  images: string[];
  categories: CategorySummary[];
  concerns: ConcernSummary[];
  variants: ProductVariantSummary[];
}

export interface CartItem {
  sku: string;
  size: string | null;
  qty: number;
  priceMinorSnapshot: number;
  lineTotalMinor: number;
  product: { slug: string; name: LocalizedText; images: string[] } | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotalMinor: number;
  itemCount: number;
}

export interface WishlistItem {
  sku: string;
  size: string;
  priceMinor: number;
  product: { slug: string; name: LocalizedText; images: string[] } | null;
}

export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";
export type FulfillmentStatus =
  "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderAddress {
  fullName: string;
  phone: string;
  emirate: string;
  city: string;
  addressLine1: string;
  addressLine2?: string | null;
}

export interface OrderItem {
  sku: string;
  productNameSnapshot: LocalizedText;
  qty: number;
  unitPriceMinorSnapshot: number;
  totalMinor: number;
}

export interface Order {
  orderNumber: string;
  guestToken: string | null;
  items: OrderItem[];
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
  currency: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  statusHistory: { status: string; at: string }[];
  createdAt: string;
}
