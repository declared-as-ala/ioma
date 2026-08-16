import type { ProductRangeKey } from "./ranges";

// The fixed standard-diagnosis question set. This is the shared contract
// between the frontend questionnaire, the API's validation DTO, and the
// rules engine's condition matching — a single source of truth so the three
// can never drift out of sync on which questionKeys/values are valid.
export const SKIN_TYPES = ["dry", "oily", "combination", "normal", "sensitive"] as const;
export type SkinType = (typeof SKIN_TYPES)[number];

export const HYDRATION_LEVELS = ["tight_or_dry", "comfortable", "well_hydrated"] as const;
export type HydrationLevel = (typeof HYDRATION_LEVELS)[number];

// Mirrors the 7 seeded SkinConcern slugs 1:1 (see apps/api/src/seed/catalog-data.ts
// CONCERN_SEED) so a selected concern maps directly to a product range.
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

export const DIAGNOSIS_QUESTION_KEYS = [
  "skinType",
  "hydrationLevel",
  "mainConcern",
  "sunExposure",
  "indoorClimateExposure",
] as const;
export type DiagnosisQuestionKey = (typeof DIAGNOSIS_QUESTION_KEYS)[number];

export const DIAGNOSIS_QUESTION_VALUES: Record<DiagnosisQuestionKey, readonly string[]> =
  {
    skinType: SKIN_TYPES,
    hydrationLevel: HYDRATION_LEVELS,
    mainConcern: MAIN_CONCERN_SLUGS,
    sunExposure: CLIMATE_EXPOSURE_LEVELS,
    indoorClimateExposure: CLIMATE_EXPOSURE_LEVELS,
  };

// AIAnalysis indicator keys — see DATA_MODEL.md "AIAnalysis". Each maps to a
// product range so the AI flow's mock result can drive the same
// range/routine recommendation logic as the standard questionnaire.
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

// Shared allow-list/size-cap contract for AI-analysis image uploads — the
// API enforces these server-side (never trust client-side checks alone,
// per CLAUDE.md/SECURITY.md) and the frontend uses the same constants so
// it can reject an obviously-invalid file before ever uploading it.
export const ALLOWED_AI_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_AI_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
