import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SkinConcernDocument = HydratedDocument<SkinConcern>;

// See DATA_MODEL.md "SkinConcern".
@Schema({ timestamps: true })
export class SkinConcern {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ type: { en: String, fr: String, ar: String }, required: true })
  name!: { en: string; fr: string; ar: string };

  @Prop({ required: true })
  icon!: string;
}

export const SkinConcernSchema = SchemaFactory.createForClass(SkinConcern);
