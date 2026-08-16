import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AppointmentDocument = HydratedDocument<Appointment>;

export type AppointmentStatus =
  "confirmed" | "rescheduled" | "cancelled" | "completed" | "no_show";

class StatusHistoryEntry {
  @Prop({ required: true })
  status!: string;

  @Prop({ required: true })
  at!: Date;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  by!: Types.ObjectId | null;
}

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Partner", required: true, index: true })
  partnerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Service", required: true })
  serviceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  specialistId!: Types.ObjectId | null;

  @Prop({ type: Date, required: true, index: true })
  startsAt!: Date;

  @Prop({ type: Date, required: true })
  endsAt!: Date;

  @Prop({
    type: String,
    default: "confirmed",
    enum: ["confirmed", "rescheduled", "cancelled", "completed", "no_show"],
    index: true,
  })
  status!: AppointmentStatus;

  @Prop({ type: String, default: null })
  notes!: string | null;

  @Prop({ type: Types.ObjectId, ref: "StandardDiagnosis", default: null })
  diagnosisId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: "Treatment", default: null })
  treatmentId!: Types.ObjectId | null;

  @Prop({ type: [StatusHistoryEntry], default: [] })
  statusHistory!: StatusHistoryEntry[];
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
// Compound index for concurrent booking prevention — the application layer
// uses this with a transactional slot-reservation check to prevent double-booking.
AppointmentSchema.index(
  { partnerId: 1, specialistId: 1, startsAt: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } },
);
AppointmentSchema.index({ userId: 1, createdAt: -1 });
