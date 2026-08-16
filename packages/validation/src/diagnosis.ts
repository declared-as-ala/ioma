import { z } from "zod";
import { DIAGNOSIS_QUESTION_KEYS, DIAGNOSIS_QUESTION_VALUES } from "@ioma/config";

// Mirrors apps/api/src/modules/diagnosis/dto/submit-standard-diagnosis.dto.ts.
const diagnosisAnswerSchema = z
  .object({
    questionKey: z.enum(DIAGNOSIS_QUESTION_KEYS),
    value: z.string().min(1),
  })
  .superRefine((answer, ctx) => {
    const allowed = DIAGNOSIS_QUESTION_VALUES[answer.questionKey];
    if (!allowed.includes(answer.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"${answer.value}" is not a valid value for "${answer.questionKey}".`,
        path: ["value"],
      });
    }
  });

export const submitStandardDiagnosisSchema = z.object({
  answers: z.array(diagnosisAnswerSchema).length(DIAGNOSIS_QUESTION_KEYS.length),
});

export type SubmitStandardDiagnosisInput = z.infer<typeof submitStandardDiagnosisSchema>;

// The questionnaire wizard's per-step form state — one answer at a time,
// keyed by question, before assembling the final `answers` array on submit.
export const standardDiagnosisAnswersSchema = z.object(
  Object.fromEntries(
    DIAGNOSIS_QUESTION_KEYS.map((key) => [
      key,
      z.string().min(1, "Please make a selection."),
    ]),
  ) as Record<(typeof DIAGNOSIS_QUESTION_KEYS)[number], z.ZodString>,
);

export type StandardDiagnosisAnswersInput = z.infer<
  typeof standardDiagnosisAnswersSchema
>;
