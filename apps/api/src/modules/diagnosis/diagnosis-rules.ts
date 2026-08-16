import { HYDRATION_LEVELS, CLIMATE_EXPOSURE_LEVELS } from "@ioma/config";

// Pulled out as pure functions (no Mongoose/DB dependency) so the rules
// engine can be unit tested in isolation — see diagnosis-rules.spec.ts and
// SPRINTS.md Sprint 6 test requirements ("Jest tests for the rules engine
// (given inputs → expected recommendation)").

export interface AnswerLike {
  questionKey: string;
  value: string;
}

export interface RuleConditionLike {
  questionKey: string;
  operator: "equals" | "in";
  value: string | null;
  values: string[];
}

export interface RecommendationRuleLike {
  id: string;
  conditions: RuleConditionLike[];
  resultRangeSlug: string;
  resultConcernSlugs: string[];
  priority: number;
}

function conditionMatches(condition: RuleConditionLike, answers: AnswerLike[]): boolean {
  const answer = answers.find((a) => a.questionKey === condition.questionKey);
  if (!answer) return false;
  return condition.operator === "equals"
    ? answer.value === condition.value
    : condition.values.includes(answer.value);
}

// Evaluates rules highest-priority-first; returns the first rule whose
// every condition matches, or null if nothing matches (caller decides the
// fallback). Rules are admin-managed data (DiagnosisRecommendation
// documents), not a hardcoded if/else chain — this function only knows how
// to evaluate a condition list, never a specific range or concern.
export function evaluateRecommendationRules(
  rules: RecommendationRuleLike[],
  answers: AnswerLike[],
): RecommendationRuleLike | null {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);
  return (
    sorted.find((rule) => rule.conditions.every((c) => conditionMatches(c, answers))) ??
    null
  );
}

const HYDRATION_SCORE_BY_LEVEL: Record<string, number> = {
  [HYDRATION_LEVELS[0]]: 30, // tight_or_dry
  [HYDRATION_LEVELS[1]]: 60, // comfortable
  [HYDRATION_LEVELS[2]]: 85, // well_hydrated
};

const CLIMATE_PENALTY_BY_LEVEL: Record<string, number> = {
  [CLIMATE_EXPOSURE_LEVELS[0]]: 0, // low
  [CLIMATE_EXPOSURE_LEVELS[1]]: 5, // moderate
  [CLIMATE_EXPOSURE_LEVELS[2]]: 10, // high
};

// Dubai's climate (high sun + heavy AC exposure) genuinely dehydrates skin
// faster — reflected as a small penalty on the self-reported hydration
// score, not an invented clinical statistic (CLAUDE.md).
export function computeHydrationScore(answers: AnswerLike[]): number {
  const level = answers.find((a) => a.questionKey === "hydrationLevel")?.value ?? "";
  const base = HYDRATION_SCORE_BY_LEVEL[level] ?? 50;
  const sunPenalty =
    CLIMATE_PENALTY_BY_LEVEL[
      answers.find((a) => a.questionKey === "sunExposure")?.value ?? ""
    ] ?? 0;
  const acPenalty =
    CLIMATE_PENALTY_BY_LEVEL[
      answers.find((a) => a.questionKey === "indoorClimateExposure")?.value ?? ""
    ] ?? 0;
  return Math.max(0, Math.min(100, base - sunPenalty - acPenalty));
}

export function computePriorityConcerns(
  answers: AnswerLike[],
  resultConcernSlugs: string[],
): string[] {
  const mainConcern = answers.find((a) => a.questionKey === "mainConcern")?.value;
  const concerns = [...resultConcernSlugs];
  if (mainConcern && !concerns.includes(mainConcern)) {
    concerns.unshift(mainConcern);
  }
  return concerns;
}
