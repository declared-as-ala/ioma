import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TrainingDocument = HydratedDocument<Training>;

class LocalizedText {
  @Prop({ required: true })
  en!: string;

  @Prop({ required: true })
  fr!: string;

  @Prop({ required: true })
  ar!: string;
}

@Schema({ timestamps: true })
export class Training {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ type: LocalizedText, required: true })
  name!: LocalizedText;

  @Prop({ type: LocalizedText, required: true })
  description!: LocalizedText;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  trainerId!: Types.ObjectId | null;

  @Prop({ required: true, enum: ["online", "physical"] })
  mode!: "online" | "physical";

  @Prop({ required: true, default: "all" })
  requiredLevel!: string;

  @Prop({ type: [String], default: [] })
  includedMaterials!: string[];
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
