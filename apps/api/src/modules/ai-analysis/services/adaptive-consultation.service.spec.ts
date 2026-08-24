import { AdaptiveConsultationService } from "./adaptive-consultation.service";
import type { VisionObservations } from "@ioma/types";

describe("AdaptiveConsultationService", () => {
  let service: AdaptiveConsultationService;

  const mockObservations: VisionObservations = {
    hydrationAppearance: {
      score: 35,
      level: "Dehydrated",
      visibleArea: "Cheeks",
      confidence: 0.94,
      explanation: "Tightness markers detected",
    },
    visiblePores: {
      score: 65,
      level: "Visible",
      visibleArea: "T-zone",
      confidence: 0.92,
      explanation: "T-zone pore dilation",
    },
    rednessAppearance: {
      score: 60,
      level: "Noticeable",
      visibleArea: "Malar cheeks",
      confidence: 0.9,
      explanation: "Cheek redness",
    },
    pigmentationAppearance: {
      score: 40,
      level: "Even",
      visibleArea: "Cheekbones",
      confidence: 0.88,
      explanation: "Minimal spots",
    },
    fineLinesAppearance: {
      score: 45,
      level: "Early Expressions",
      visibleArea: "Periorbital",
      confidence: 0.92,
      explanation: "Fine lines",
    },
    textureAppearance: {
      score: 50,
      level: "Balanced",
      visibleArea: "Forehead",
      confidence: 0.9,
      explanation: "Smooth surface",
    },
    radianceAppearance: {
      score: 45,
      level: "Balanced",
      visibleArea: "Complexion",
      confidence: 0.93,
      explanation: "Medium radiance",
    },
    imperfectionsAppearance: {
      score: 30,
      level: "Clear",
      visibleArea: "Chin",
      confidence: 0.89,
      explanation: "Low blemishes",
    },
  };

  beforeEach(() => {
    service = new AdaptiveConsultationService();
  });

  it("generates contextual questions based on visual signals", () => {
    const questions = service.generateQuestions(mockObservations, "combination");
    expect(questions.length).toBeGreaterThanOrEqual(4);

    const questionKeys = questions.map((q) => q.questionKey);
    expect(questionKeys).toContain("tightnessAfterCleansing");
    expect(questionKeys).toContain("sensitivityTriggers");
    expect(questionKeys).toContain("currentRoutineProducts");
    expect(questionKeys).toContain("acAndSunExposure");
    expect(questionKeys).toContain("primaryGoal");
  });

  it("parses natural language routine descriptions into structured routine", () => {
    const parsed = service.parseRoutineText(
      "I use CeraVe gentle foaming cleanser, Vitamin C serum in the morning, retinol 0.3% twice a week, and La Roche-Posay SPF 50",
    );

    expect(parsed.vitaminC).toBe(true);
    expect(parsed.retinoid).toBe(true);
    expect(parsed.sunscreen).toBe(true);
    expect(parsed.cleanser).toBeDefined();
  });

  it("builds a complete structured SkinProfile from observations and answers", () => {
    const profile = service.buildSkinProfile(mockObservations, "combination", {
      answers: [
        { questionKey: "tightnessAfterCleansing", value: "very_tight" },
        { questionKey: "sensitivityTriggers", value: "frequent_reactivity" },
        { questionKey: "acAndSunExposure", value: "high" },
        { questionKey: "primaryGoal", value: "dehydration" },
      ],
      routineText: "Gentle cleanser and SPF",
      budgetPreference: "500_1000",
      routinePreference: "balanced",
    });

    expect(profile.skinType).toBe("sensitive");
    expect(profile.priorities.length).toBe(4);
    expect(profile.priorities[0]!.id).toBe("hydration");
    expect(profile.climateContext.acExposure).toBe("high");
    expect(profile.confidence).toBeGreaterThan(0.9);
  });
});
