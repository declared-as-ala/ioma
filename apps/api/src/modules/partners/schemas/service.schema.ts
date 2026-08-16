import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ServiceDocument = HydratedDocument<Service>;

export type ServiceCategory = "diagnosis" | "treatment" | "training";

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  name!: { en: string; fr: string; ar: string };

  @Prop({ type: Number, required: true })
  durationMinutes!: number;

  @Prop({
    type: String,
    required: true,
    enum: ["diagnosis", "treatment", "training"],
  })
  category!: ServiceCategory;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
