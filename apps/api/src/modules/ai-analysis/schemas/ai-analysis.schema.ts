import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiAnalysisDocument = HydratedDocument<AiAnalysis>;
export type AiAnalysisStatus = "queued" | "processing" | "completed" | "failed";

export class AiIndicators {
  @Prop({ required: true, min: 0, max: 100 })
  hydration!: number;

  @Prop({ required: true, min: 0, max: 100 })
  fineLines!: number;

  @Prop({ required: true, min: 0, max: 100 })
  wrinkles!: number;

  @Prop({ required: true, min: 0, max: 100 })
  pores!: number;

  @Prop({ required: true, min: 0, max: 100 })
  spots!: number;

  @Prop({ required: true, min: 0, max: 100 })
  unevenTone!: number;

  @Prop({ required: true, min: 0, max: 100 })
  redness!: number;

  @Prop({ required: true, min: 0, max: 100 })
  imperfections!: number;

  @Prop({ required: true, min: 0, max: 100 })
  texture!: number;

  @Prop({ required: true, min: 0, max: 100 })
  radiance!: number;

  @Prop({ required: true, min: 0, max: 100 })
  firmness!: number;
}

// See DATA_MODEL.md "AIAnalysis". `recommendedRoutineRefs` is modeled as
// two explicit variant-id arrays (mirrors StandardDiagnosis's
// morningRoutine/eveningRoutine) rather than one flat array, for the same
// reason: the frontend and cart flow need morning/evening separated, not a
// single undifferentiated list.
@Schema({ timestamps: true })
export class AiAnalysis {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "AiConsent", required: true })
  consentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "DocumentRecord", default: null })
  imageDocumentId!: Types.ObjectId | null;

  @Prop({ required: true, default: "mock" })
  provider!: string;

  @Prop({
    type: String,
    required: true,
    enum: ["queued", "processing", "completed", "failed"],
    default: "queued",
  })
  status!: AiAnalysisStatus;

  @Prop({ type: AiIndicators, default: null })
  indicators!: AiIndicators | null;

  @Prop({ required: true, default: true })
  isSimulated!: boolean;

  @Prop({ type: String, default: null })
  resultVersion!: string | null;

  @Prop({ type: Types.ObjectId, ref: "ProductRange", default: null })
  recommendedRangeId!: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], ref: "ProductVariant", default: [] })
  morningRoutine!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: "ProductVariant", default: [] })
  eveningRoutine!: Types.ObjectId[];

  @Prop({ type: String, default: null })
  failureReason!: string | null;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const AiAnalysisSchema = SchemaFactory.createForClass(AiAnalysis);
