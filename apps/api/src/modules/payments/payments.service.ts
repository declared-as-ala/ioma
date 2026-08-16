import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { nanoid } from "nanoid";
import { Payment, PaymentDocument } from "./schemas/payment.schema";
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from "./providers/payment-provider.interface";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  async createPending(
    orderId: Types.ObjectId,
    amountMinor: number,
  ): Promise<PaymentDocument> {
    return this.paymentModel.create({
      orderId,
      provider: this.provider.name,
      amountMinor,
      status: "pending",
      idempotencyKey: nanoid(24),
    });
  }

  /**
   * Runs the actual charge attempt against the provider, then applies the
   * result through the same idempotent path a real async webhook would use
   * (see handleProviderEvent) — even though the mock provider itself
   * resolves synchronously.
   */
  async charge(
    payment: PaymentDocument,
    simulateFailure: boolean,
  ): Promise<PaymentDocument> {
    const result = await this.provider.createIntent({
      orderId: payment.orderId.toString(),
      amountMinor: payment.amountMinor,
      currency: "AED",
      idempotencyKey: payment.idempotencyKey,
      simulateFailure,
    });

    return this.handleProviderEvent(payment.idempotencyKey, {
      eventId: result.providerReference,
      status: result.status,
      providerReference: result.providerReference,
      failureReason: result.failureReason,
    });
  }

  /**
   * Idempotent by design: a webhook/event can be delivered more than once
   * (at-least-once delivery is standard for real providers) and must only
   * apply its effect the first time. `eventId` is deduped against
   * `webhookEventsReceived` before any state change.
   */
  async handleProviderEvent(
    idempotencyKey: string,
    event: {
      eventId: string;
      status: "succeeded" | "failed";
      providerReference: string;
      failureReason?: string;
    },
  ): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findOne({ idempotencyKey });
    if (!payment) throw new NotFoundException("Payment not found for idempotency key.");

    if (payment.webhookEventsReceived.includes(event.eventId)) {
      return payment;
    }

    payment.webhookEventsReceived.push(event.eventId);
    payment.status = event.status;
    payment.providerReference = event.providerReference;
    payment.failureReason = event.failureReason ?? null;
    await payment.save();
    return payment;
  }

  findByOrderId(orderId: Types.ObjectId) {
    return this.paymentModel.find({ orderId }).sort({ createdAt: -1 }).lean();
  }
}
