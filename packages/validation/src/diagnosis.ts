import { z } from "zod";
import {
  BUDGET_PREFERENCES,
  ROUTINE_COMPLEXITY_PREFERENCES,
  ROUTINE_TIERS,
} from "@ioma/config";

export const adaptiveQuestionAnswerSchema = z.object({
  questionKey: z.string().min(1),
  value: z.union([z.string(), z.array(z.string())]),
});

export const submitAdaptiveAnswersSchema = z.object({
  answers: z.array(adaptiveQuestionAnswerSchema),
  routineText: z.string().optional(),
  budgetPreference: z.enum(BUDGET_PREFERENCES).optional(),
  routinePreference: z.enum(ROUTINE_COMPLEXITY_PREFERENCES).optional(),
});

export type SubmitAdaptiveAnswersInput = z.infer<typeof submitAdaptiveAnswersSchema>;

export const askAiConsultantSchema = z.object({
  message: z.string().min(1).max(1000),
  locale: z.enum(["en", "fr", "ar"]).default("en"),
});

export type AskAiConsultantInput = z.infer<typeof askAiConsultantSchema>;

export const selectRoutineTierSchema = z.object({
  tier: z.enum(ROUTINE_TIERS),
});

export type SelectRoutineTierInput = z.infer<typeof selectRoutineTierSchema>;

export const submitFollowUpCheckinSchema = z.object({
  day: z.number().int().min(1),
  comfortRating: z.number().int().min(1).max(5),
  tightnessAfterCleansing: z.boolean(),
  irritationNoticed: z.boolean(),
  notes: z.string().max(500).optional(),
});

export type SubmitFollowUpCheckinInput = z.infer<typeof submitFollowUpCheckinSchema>;
