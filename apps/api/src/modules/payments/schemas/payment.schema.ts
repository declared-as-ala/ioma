import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type PaymentDocument = HydratedDocument<Payment>;
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

// See DATA_MODEL.md "Payment". `idempotencyKey` is what makes
// PaymentsService.handleProviderEvent safe to call more than once for the
// same event (required by SPRINTS.md Sprint 4 "idempotent webhook
// handling").
@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: "Order", required: true, index: true })
  orderId!: Types.ObjectId;

  @Prop({ required: true })
  provider!: string;

  @Prop({ type: String, default: null })
  providerReference!: string | null;

  @Prop({ required: true })
  amountMinor!: number;

  @Prop({
    type: String,
    default: "pending",
    enum: ["pending", "succeeded", "failed", "refunded"],
  })
  status!: PaymentStatus;

  @Prop({ required: true, unique: true, index: true })
  idempotencyKey!: string;

  @Prop({ type: [String], default: [] })
  webhookEventsReceived!: string[];

  @Prop({ type: String, default: null })
  failureReason!: string | null;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
