/**
 * Seed data for the standard-diagnosis rules engine (Sprint 6). Each
 * concern maps 1:1 to its product range (mirrors CONCERN_SEED in
 * catalog-data.ts) at a base priority; one higher-priority override rule
 * is seeded on top so the "rules engine, not hardcoded" acceptance
 * criteria (SPRINTS.md Sprint 6) is genuinely exercised — sensitive skin
 * always routes to the Calm range regardless of the stated main concern.
 * These are admin-managed data documents (DiagnosisRecommendation), not
 * application code; Sprint 10's admin backoffice will make them editable.
 */
import { MAIN_CONCERNS, type ProductRangeKey } from "@ioma/config";

export interface RecommendationSeed {
  conditions: {
    questionKey: string;
    operator: "equals" | "in";
    value: string | null;
    values: string[];
  }[];
  resultRange: ProductRangeKey;
  resultConcernSlugs: string[];
  priority: number;
}

export const DIAGNOSIS_RECOMMENDATION_SEED: RecommendationSeed[] = [
  ...MAIN_CONCERNS.map((concern) => ({
    conditions: [
      {
        questionKey: "mainConcern",
        operator: "equals" as const,
        value: concern.slug,
        values: [],
      },
    ],
    resultRange: concern.range,
    resultConcernSlugs: [concern.slug],
    priority: 50,
  })),
  {
    conditions: [
      { questionKey: "skinType", operator: "equals", value: "sensitive", values: [] },
    ],
    resultRange: "calm",
    resultConcernSlugs: ["sensitivity"],
    priority: 100,
  },
];
