import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { PaymentsService } from "./payments.service";
import { Payment } from "./schemas/payment.schema";
import { PAYMENT_PROVIDER } from "./providers/payment-provider.interface";

// Mongoose document typing is too recursive for jest.Mocked<T> to unify
// cleanly here — see auth.service.spec.ts for the same rationale.
interface MockPaymentDoc {
  idempotencyKey: string;
  webhookEventsReceived: string[];
  status: string;
  providerReference: string | null;
  failureReason: string | null;
  save: jest.Mock;
}

describe("PaymentsService.handleProviderEvent", () => {
  let paymentsService: PaymentsService;
  let paymentModel: { findOne: jest.Mock };
  let payment: MockPaymentDoc;

  beforeEach(async () => {
    payment = {
      idempotencyKey: "test-key-123",
      webhookEventsReceived: [],
      status: "pending",
      providerReference: null,
      failureReason: null,
      save: jest.fn().mockResolvedValue(undefined),
    };

    paymentModel = {
      findOne: jest.fn().mockResolvedValue(payment),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getModelToken(Payment.name), useValue: paymentModel },
        {
          provide: PAYMENT_PROVIDER,
          useValue: { name: "mock", createIntent: jest.fn() },
        },
      ],
    }).compile();

    paymentsService = moduleRef.get(PaymentsService);
  });

  it("applies the first delivery of an event and records it", async () => {
    const result = await paymentsService.handleProviderEvent("test-key-123", {
      eventId: "evt_1",
      status: "succeeded",
      providerReference: "mock_ref_1",
    });

    expect(result.status).toBe("succeeded");
    expect(result.providerReference).toBe("mock_ref_1");
    expect(payment.webhookEventsReceived).toEqual(["evt_1"]);
    expect(payment.save).toHaveBeenCalledTimes(1);
  });

  it("is idempotent: a duplicate delivery of the same event is a no-op", async () => {
    await paymentsService.handleProviderEvent("test-key-123", {
      eventId: "evt_1",
      status: "succeeded",
      providerReference: "mock_ref_1",
    });

    // A late/duplicate delivery of the SAME event, this time claiming a
    // different (and wrong) outcome — must not be applied.
    const secondResult = await paymentsService.handleProviderEvent("test-key-123", {
      eventId: "evt_1",
      status: "failed",
      providerReference: "mock_ref_1",
      failureReason: "should never be applied",
    });

    expect(secondResult.status).toBe("succeeded");
    expect(payment.webhookEventsReceived).toEqual(["evt_1"]);
    // save() only called once, on the first (genuine) event.
    expect(payment.save).toHaveBeenCalledTimes(1);
  });

  it("applies a genuinely new event even after a prior one was processed", async () => {
    await paymentsService.handleProviderEvent("test-key-123", {
      eventId: "evt_1",
      status: "succeeded",
      providerReference: "mock_ref_1",
    });

    const result = await paymentsService.handleProviderEvent("test-key-123", {
      eventId: "evt_2_refund",
      status: "failed",
      providerReference: "mock_ref_1",
      failureReason: "refunded",
    });

    expect(result.status).toBe("failed");
    expect(payment.webhookEventsReceived).toEqual(["evt_1", "evt_2_refund"]);
    expect(payment.save).toHaveBeenCalledTimes(2);
  });

  it("throws NotFoundException for an unknown idempotency key", async () => {
    paymentModel.findOne.mockResolvedValue(null);

    await expect(
      paymentsService.handleProviderEvent("unknown-key", {
        eventId: "evt_x",
        status: "succeeded",
        providerReference: "ref_x",
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
