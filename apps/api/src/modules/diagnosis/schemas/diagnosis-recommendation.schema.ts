import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type DiagnosisRecommendationDocument = HydratedDocument<DiagnosisRecommendation>;
export type RuleOperator = "equals" | "in";

// One condition against a single submitted DiagnosisAnswer.
export class RuleCondition {
  @Prop({ required: true })
  questionKey!: string;

  @Prop({ required: true, enum: ["equals", "in"] })
  operator!: RuleOperator;

  // "equals" compares against `value`; "in" compares against `values`.
  @Prop({ type: String, default: null })
  value!: string | null;

  @Prop({ type: [String], default: [] })
  values!: string[];
}

// See DATA_MODEL.md "DiagnosisRecommendation" — admin-managed rules-engine
// data (seeded for now, editable via Sprint 10's admin backoffice once it
// exists), not hardcoded recommendation logic in application code. See
// diagnosis-rules.service.ts for the evaluator.
@Schema({ timestamps: true })
export class DiagnosisRecommendation {
  @Prop({ type: [RuleCondition], required: true })
  conditions!: RuleCondition[];

  @Prop({ type: Types.ObjectId, ref: "ProductRange", required: true })
  resultRangeId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "SkinConcern", default: [] })
  resultConcernIds!: Types.ObjectId[];

  // Higher priority is evaluated first; the first rule whose every
  // condition matches the submitted answers wins.
  @Prop({ required: true, default: 0 })
  priority!: number;
}

export const DiagnosisRecommendationSchema = SchemaFactory.createForClass(
  DiagnosisRecommendation,
);
