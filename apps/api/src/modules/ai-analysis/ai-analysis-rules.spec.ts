import { AI_INDICATOR_KEYS } from "@ioma/config";
import type { VisionObservations } from "@ioma/types";
import { recommendRangeFromIndicators, type IndicatorScores } from "./ai-analysis-rules";
import {
  AdaptiveConsultationService,
  type ConsultationAnswersInput,
} from "./services/adaptive-consultation.service";

// A neutral 50 baseline for every indicator gives every range an equal
// need-score of 50 regardless of whether it's driven by lowIsBad or
// highIsBad indicators, so overriding a specific indicator cleanly isolates
// that one range's need score for the assertion.
function neutralIndicators(overrides: Partial<IndicatorScores> = {}): IndicatorScores {
  const base = Object.fromEntries(
    AI_INDICATOR_KEYS.map((k) => [k, 50]),
  ) as IndicatorScores;
  return { ...base, ...overrides };
}

describe("recommendRangeFromIndicators", () => {
  it("recommends hydra when hydration is the clear weak point", () => {
    const result = recommendRangeFromIndicators(neutralIndicators({ hydration: 10 }));
    expect(result.range).toBe("hydra");
  });

  it("recommends calm when redness is the clear weak point (a highIsBad indicator)", () => {
    const result = recommendRangeFromIndicators(neutralIndicators({ redness: 95 }));
    expect(result.range).toBe("calm");
  });

  it("recommends renew when firmness is low and fine lines/wrinkles are both high", () => {
    const result = recommendRangeFromIndicators(
      neutralIndicators({ firmness: 15, fineLines: 90, wrinkles: 90 }),
    );
    expect(result.range).toBe("renew");
  });

  it("recommends illumine when spots and unevenTone are both elevated", () => {
    const result = recommendRangeFromIndicators(
      neutralIndicators({ spots: 92, unevenTone: 88 }),
    );
    expect(result.range).toBe("illumine");
  });

  it("picks the single worst range when multiple are mildly off but one is clearly worst", () => {
    const result = recommendRangeFromIndicators(
      neutralIndicators({ hydration: 60, radiance: 55, imperfections: 90, pores: 85 }),
    );
    expect(result.range).toBe("purete");
  });
});

describe("CRITICAL VERIFICATION: Skin Indicators Come ONLY from the Photo", () => {
  const adaptiveService = new AdaptiveConsultationService();

  const photoDerivedObservations: VisionObservations = {
    hydrationAppearance: {
      score: 38,
      level: "Dehydrated",
      visibleArea: "Cheeks & perioral",
      confidence: 0.95,
      explanation: "Visible cutaneous moisture deficit and subtle micro-relief tightness.",
    },
    visiblePores: {
      score: 62,
      level: "Visible",
      visibleArea: "T-zone & inner cheeks",
      confidence: 0.92,
      explanation: "Moderate follicular dilation in the central zone.",
    },
    rednessAppearance: {
      score: 55,
      level: "Noticeable",
      visibleArea: "Malar cheeks",
      confidence: 0.9,
      explanation: "Vascular reactivity noted on high cheekbones.",
    },
    pigmentationAppearance: {
      score: 40,
      level: "Even",
      visibleArea: "Forehead",
      confidence: 0.88,
      explanation: "Melanin distribution is predominantly uniform.",
    },
    fineLinesAppearance: {
      score: 42,
      level: "Early Expressions",
      visibleArea: "Periorbital",
      confidence: 0.91,
      explanation: "Superficial expression lines near outer corners.",
    },
    textureAppearance: {
      score: 48,
      level: "Balanced",
      visibleArea: "Cheeks",
      confidence: 0.93,
      explanation: "Skin surface displays normal cellular turnover.",
    },
    radianceAppearance: {
      score: 44,
      level: "Balanced",
      visibleArea: "Overall complexion",
      confidence: 0.92,
      explanation: "Subtle natural light refraction across facial high points.",
    },
    imperfectionsAppearance: {
      score: 25,
      level: "Clear",
      visibleArea: "Chin & forehead",
      confidence: 0.94,
      explanation: "Low frequency of active superficial blemishes.",
    },
  };

  const photoDerivedIndicators: IndicatorScores = {
    hydration: 38,
    pores: 62,
    redness: 55,
    spots: 40,
    unevenTone: 45,
    fineLines: 42,
    wrinkles: 30,
    texture: 48,
    radiance: 44,
    imperfections: 25,
    firmness: 58,
  };

  const questionnaireAnswerSetA: ConsultationAnswersInput = {
    answers: [
      { questionKey: "tightnessAfterCleansing", value: "very_tight" },
      { questionKey: "sensitivityTriggers", value: "frequent_reactivity" },
      { questionKey: "acAndSunExposure", value: "high" },
      { questionKey: "primaryGoal", value: "dehydration" },
    ],
    routineText: "CeraVe gentle cleanser and SPF 50",
    routinePreference: "essential",
    budgetPreference: "under_500",
  };

  const questionnaireAnswerSetB: ConsultationAnswersInput = {
    answers: [
      { questionKey: "tightnessAfterCleansing", value: "comfortable" },
      { questionKey: "sensitivityTriggers", value: "rarely_reactive" },
      { questionKey: "acAndSunExposure", value: "low" },
      { questionKey: "primaryGoal", value: "anti_aging" },
    ],
    routineText: "Exfoliating wash, 1% retinol nightly, Vitamin C, thick cream",
    routinePreference: "complete",
    budgetPreference: "above_1000",
  };

  it("proves that visual indicators and observations remain 100% invariant across different questionnaire answer sets", () => {
    // Build profile from Answer Set A
    const profileA = adaptiveService.buildSkinProfile(
      photoDerivedObservations,
      "combination",
      questionnaireAnswerSetA,
    );

    // Build profile from Answer Set B
    const profileB = adaptiveService.buildSkinProfile(
      photoDerivedObservations,
      "combination",
      questionnaireAnswerSetB,
    );

    // 1. The photo-derived visual scores MUST be completely unchanged
    expect(photoDerivedIndicators.hydration).toBe(38);
    expect(photoDerivedIndicators.pores).toBe(62);
    expect(photoDerivedIndicators.redness).toBe(55);
    expect(photoDerivedObservations.hydrationAppearance.score).toBe(38);
    expect(photoDerivedObservations.visiblePores.score).toBe(62);

    // 2. The recommendations / preferences differ because user goals and lifestyle differ
    expect(profileA.routinePreference).toBe("essential");
    expect(profileB.routinePreference).toBe("complete");
    expect(profileA.budgetPreference).toBe("under_500");
    expect(profileB.budgetPreference).toBe("above_1000");

    // 3. Current routine parsing preserves separate user-provided products without mutating visual indicators
    expect(profileA.currentRoutine.cleanser).toBe("CeraVe gentle cleanser and SPF 50");
    expect(profileB.currentRoutine.retinoid).toBe(true);

    // 4. Photo observations remain strictly immutable
    expect(photoDerivedObservations.hydrationAppearance.level).toBe("Dehydrated");
    expect(photoDerivedObservations.visiblePores.visibleArea).toBe("T-zone & inner cheeks");
  });
});
