import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TreatmentDocument = HydratedDocument<Treatment>;

@Schema({ timestamps: true })
export class Treatment {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  name!: { en: string; fr: string; ar: string };

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  description!: { en: string; fr: string; ar: string };

  @Prop({ type: Number, required: true })
  durationMinutes!: number;

  @Prop({ type: [Types.ObjectId], ref: "Product", default: [] })
  relatedProductIds!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  mediaIds!: string[];
}

export const TreatmentSchema = SchemaFactory.createForClass(Treatment);
