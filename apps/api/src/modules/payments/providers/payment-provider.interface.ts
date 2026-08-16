// Provider-abstraction pattern (see ARCHITECTURE.md / DECISIONS.md — same
// shape used for AI-analysis/maps/email/SMS/search): call sites depend only
// on this interface, so swapping in Stripe/Telr/Checkout.com later touches
// only this file's DI binding, never the Orders module.
export interface CreatePaymentIntentParams {
  orderId: string;
  amountMinor: number;
  currency: string;
  idempotencyKey: string;
  // Mock-only control surface, so the required "payment failure/retry" test
  // path is deterministic instead of random — a real provider has no such
  // parameter, the frontend only surfaces this choice in demo mode (see
  // CLAUDE.md "clearly labeled ... demo mode banner").
  simulateFailure?: boolean;
}

export interface PaymentIntentResult {
  providerReference: string;
  status: "succeeded" | "failed";
  failureReason?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
}

export const PAYMENT_PROVIDER = Symbol("PAYMENT_PROVIDER");
