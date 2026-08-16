import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StandardDiagnosisDocument = HydratedDocument<StandardDiagnosis>;

// See DATA_MODEL.md "StandardDiagnosis" / "DiagnosisAnswer".
export class DiagnosisAnswer {
  @Prop({ required: true })
  questionKey!: string;

  @Prop({ required: true })
  value!: string;
}

export class ResultProfile {
  @Prop({ required: true })
  skinType!: string;

  @Prop({ type: [String], required: true })
  priorityConcerns!: string[];

  @Prop({ required: true, min: 0, max: 100 })
  hydrationScore!: number;
}

@Schema({ timestamps: true })
export class StandardDiagnosis {
  // Nullable: a guest can take the questionnaire before creating an
  // account. The result is still returned/persisted by id so it can be
  // added to cart in the same session (see SPRINTS.md Sprint 6 acceptance
  // criteria) without requiring login first.
  @Prop({ type: Types.ObjectId, ref: "User", default: null, index: true })
  userId!: Types.ObjectId | null;

  @Prop({ type: [DiagnosisAnswer], required: true })
  answers!: DiagnosisAnswer[];

  @Prop({ type: ResultProfile, required: true })
  resultProfile!: ResultProfile;

  @Prop({ type: Types.ObjectId, ref: "ProductRange", required: true })
  recommendedRangeId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "ProductVariant", default: [] })
  morningRoutine!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: "ProductVariant", default: [] })
  eveningRoutine!: Types.ObjectId[];
}

export const StandardDiagnosisSchema = SchemaFactory.createForClass(StandardDiagnosis);
