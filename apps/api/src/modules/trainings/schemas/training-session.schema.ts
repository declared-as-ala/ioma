import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TrainingSessionDocument = HydratedDocument<TrainingSession>;

@Schema({ timestamps: true })
export class TrainingSession {
  @Prop({ type: Types.ObjectId, ref: "Training", required: true, index: true })
  trainingId!: Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  startsAt!: Date;

  @Prop({ type: Date, required: true })
  endsAt!: Date;

  @Prop({ type: String, default: null })
  location!: string | null;

  @Prop({ required: true, default: 10 })
  capacity!: number;

  @Prop({ required: true, default: 0 })
  seatsBooked!: number;

  @Prop({ type: Number, default: null })
  priceMinor!: number | null;
}

export const TrainingSessionSchema = SchemaFactory.createForClass(TrainingSession);
