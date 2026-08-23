import type { ProductRangeKey } from "./ranges";

export const SKIN_TYPES = ["dry", "oily", "combination", "normal", "sensitive"] as const;
export type SkinType = (typeof SKIN_TYPES)[number];

export const HYDRATION_LEVELS = ["tight_or_dry", "comfortable", "well_hydrated"] as const;
export type HydrationLevel = (typeof HYDRATION_LEVELS)[number];

export const MAIN_CONCERNS: { slug: string; range: ProductRangeKey }[] = [
  { slug: "dehydration", range: "hydra" },
  { slug: "fatigue-dullness", range: "energize" },
  { slug: "first-signs-of-aging", range: "renew" },
  { slug: "sensitivity", range: "calm" },
  { slug: "blemishes", range: "purete" },
  { slug: "shine-control", range: "matte" },
  { slug: "dark-spots", range: "illumine" },
];
export const MAIN_CONCERN_SLUGS = MAIN_CONCERNS.map((c) => c.slug);

export const CLIMATE_EXPOSURE_LEVELS = ["low", "moderate", "high"] as const;
export type ClimateExposureLevel = (typeof CLIMATE_EXPOSURE_LEVELS)[number];

export const ROUTINE_TIERS = ["essential", "complete", "premium"] as const;
export type RoutineTier = (typeof ROUTINE_TIERS)[number];

export const ROUTINE_COMPLEXITY_PREFERENCES = [
  "essential",
  "balanced",
  "complete",
] as const;
export type RoutineComplexityPreference = (typeof ROUTINE_COMPLEXITY_PREFERENCES)[number];

export const BUDGET_PREFERENCES = [
  "under_500",
  "500_1000",
  "above_1000",
  "no_preference",
] as const;
export type BudgetPreference = (typeof BUDGET_PREFERENCES)[number];

export const AI_INDICATOR_KEYS = [
  "hydration",
  "fineLines",
  "wrinkles",
  "pores",
  "spots",
  "unevenTone",
  "redness",
  "imperfections",
  "texture",
  "radiance",
  "firmness",
] as const;
export type AiIndicatorKey = (typeof AI_INDICATOR_KEYS)[number];

export const AI_OBSERVATION_KEYS = [
  "hydrationAppearance",
  "visiblePores",
  "rednessAppearance",
  "pigmentationAppearance",
  "fineLinesAppearance",
  "textureAppearance",
  "radianceAppearance",
  "imperfectionsAppearance",
] as const;
export type AiObservationKey = (typeof AI_OBSERVATION_KEYS)[number];

export const ALLOWED_AI_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_AI_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export const DIAGNOSIS_QUESTION_KEYS = [
  "skinType",
  "hydrationLevel",
  "mainConcern",
  "sunExposure",
  "indoorClimateExposure",
] as const;
export type DiagnosisQuestionKey = (typeof DIAGNOSIS_QUESTION_KEYS)[number];
