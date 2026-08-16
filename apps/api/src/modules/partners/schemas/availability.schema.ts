import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AvailabilityDocument = HydratedDocument<Availability>;

export type AvailabilityResourceType = "partner" | "specialist";

class WeeklyHours {
  @Prop({ required: true })
  day!: number; // 0=Sunday, 6=Saturday

  @Prop({ required: true })
  open!: string; // "09:00"

  @Prop({ required: true })
  close!: string; // "18:00"
}

class BreakPeriod {
  @Prop({ required: true })
  day!: number;

  @Prop({ required: true })
  start!: string; // "12:00"

  @Prop({ required: true })
  end!: string; // "13:00"
}

@Schema({ timestamps: true })
export class Availability {
  @Prop({
    type: String,
    required: true,
    enum: ["partner", "specialist"],
  })
  resourceType!: AvailabilityResourceType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  resourceId!: Types.ObjectId;

  @Prop({ type: [WeeklyHours], default: [] })
  weeklyHours!: WeeklyHours[];

  @Prop({ type: [BreakPeriod], default: [] })
  breaks!: BreakPeriod[];

  @Prop({ type: [Date], default: [] })
  blockedDates!: Date[];

  @Prop({ type: Number, default: 1 })
  capacityPerSlot!: number;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
AvailabilitySchema.index({ resourceType: 1, resourceId: 1 });
