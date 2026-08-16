import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TrainingBookingDocument = HydratedDocument<TrainingBooking>;

export type TrainingBookingStatus = "booked" | "cancelled" | "attended" | "no_show";

@Schema({ timestamps: true })
export class TrainingBooking {
  @Prop({ type: Types.ObjectId, ref: "TrainingSession", required: true, index: true })
  sessionId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  attendeeUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "ProfessionalProfile", default: null, index: true })
  professionalProfileId!: Types.ObjectId | null;

  @Prop({
    required: true,
    default: "booked",
    enum: ["booked", "cancelled", "attended", "no_show"],
  })
  status!: TrainingBookingStatus;

  @Prop({ type: Types.ObjectId, ref: "Document", default: null })
  certificateDocumentId!: Types.ObjectId | null;
}

export const TrainingBookingSchema = SchemaFactory.createForClass(TrainingBooking);
TrainingBookingSchema.index({ sessionId: 1, attendeeUserId: 1 }, { unique: true });
