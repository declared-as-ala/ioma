import type { AiIndicatorKey, ProductRangeKey } from "@ioma/config";

// Pure, DB-free mapping logic — unit-testable in isolation (see
// ai-analysis-rules.spec.ts), mirrors diagnosis-rules.ts's separation of
// pure decision logic from Mongoose/queue wiring.
//
// Each product range addresses one or more AIAnalysis indicators (see
// DATA_MODEL.md's fixed 11-indicator list). "lowIsBad" indicators (e.g.
// hydration) signal higher need for a range the lower they score;
// "highIsBad" indicators (e.g. redness) signal higher need the higher they
// score. This is directional routing logic for a clearly-labeled simulated
// demo, not a clinical claim — see CLAUDE.md.
interface RangeIndicatorRule {
  range: ProductRangeKey;
  lowIsBad: AiIndicatorKey[];
  highIsBad: AiIndicatorKey[];
}

const RANGE_INDICATOR_RULES: RangeIndicatorRule[] = [
  { range: "hydra", lowIsBad: ["hydration"], highIsBad: [] },
  { range: "energize", lowIsBad: ["radiance"], highIsBad: [] },
  { range: "renew", lowIsBad: ["firmness"], highIsBad: ["fineLines", "wrinkles"] },
  { range: "calm", lowIsBad: [], highIsBad: ["redness"] },
  { range: "purete", lowIsBad: [], highIsBad: ["imperfections", "pores"] },
  { range: "matte", lowIsBad: [], highIsBad: ["texture"] },
  { range: "illumine", lowIsBad: [], highIsBad: ["spots", "unevenTone"] },
];

export type IndicatorScores = Record<AiIndicatorKey, number>;

function needScoreForRange(
  rule: RangeIndicatorRule,
  indicators: IndicatorScores,
): number {
  const scores = [
    ...rule.lowIsBad.map((key) => 100 - indicators[key]),
    ...rule.highIsBad.map((key) => indicators[key]),
  ];
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export interface RangeRecommendation {
  range: ProductRangeKey;
  needScore: number;
}

// Returns the range with the highest "need" score — i.e. the range whose
// indicators are worst — highest score first.
export function recommendRangeFromIndicators(
  indicators: IndicatorScores,
): RangeRecommendation {
  const scored = RANGE_INDICATOR_RULES.map((rule) => ({
    range: rule.range,
    needScore: needScoreForRange(rule, indicators),
  })).sort((a, b) => b.needScore - a.needScore);

  // RANGE_INDICATOR_RULES is a fixed non-empty constant (7 ranges), so
  // `scored` can never be empty at runtime.
  const [worst] = scored;
  if (!worst) {
    throw new Error("RANGE_INDICATOR_RULES must not be empty.");
  }
  return worst;
}
