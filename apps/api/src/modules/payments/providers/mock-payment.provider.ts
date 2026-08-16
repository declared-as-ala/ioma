import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import type {
  CreatePaymentIntentParams,
  PaymentIntentResult,
  PaymentProvider,
} from "./payment-provider.interface";

// Default provider — see ENVIRONMENT.md `PAYMENT_PROVIDER=mock` and
// CLIENT_REQUIREMENTS.md (no real gateway credentials supplied yet). Settles
// synchronously and immediately, unlike a real gateway's async webhook
// round-trip; OrdersService still runs every state transition through the
// same idempotent PaymentsService.handleProviderEvent path a real webhook
// would use, so swapping providers later doesn't change that flow.
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    if (params.simulateFailure) {
      return {
        providerReference: `mock_${nanoid(12)}`,
        status: "failed",
        failureReason: "Simulated decline (demo mode).",
      };
    }
    return {
      providerReference: `mock_${nanoid(12)}`,
      status: "succeeded",
    };
  }
}
