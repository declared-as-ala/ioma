import { AiBeautyAdvisorService } from "./ai-beauty-advisor.service";
import { ConfigService } from "@nestjs/config";

describe("AiBeautyAdvisorService", () => {
  let service: AiBeautyAdvisorService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue(null),
    };
    service = new AiBeautyAdvisorService(mockConfigService as ConfigService);
  });

  it("safely provides medical disclaimers when client mentions dermatological disease", async () => {
    const response = await service.askAdvisor({
      message: "Can this cure my severe eczema and dermatitis?",
      locale: "en",
      skinProfile: {} as any,
      activeTierData: {
        tier: "complete",
        totalPriceMinor: 50000,
        morningSteps: [],
        eveningSteps: [],
        weeklyRitual: [],
        description: { en: "", fr: "", ar: "" },
      },
      chatHistory: [],
    });

    expect(response.message).toContain("licensed healthcare professional");
    expect(response.suggestedQuestions.length).toBe(3);
  });

  it("returns editorial guidance and suggested questions for skincare questions", async () => {
    const response = await service.askAdvisor({
      message: "Why was this routine selected for my skin?",
      locale: "en",
      skinProfile: {
        skinType: "combination",
        hydrationTendency: "Dehydrated",
        priorities: [
          {
            id: "hydration",
            rank: 1,
            title: { en: "Hydration", fr: "", ar: "" },
            rationale: { en: "", fr: "", ar: "" },
          },
        ],
        climateContext: { acExposure: "high", sunExposure: "moderate" },
      } as any,
      activeTierData: {
        tier: "complete",
        totalPriceMinor: 88000,
        morningSteps: [
          {
            productId: "1",
            variantId: "1",
            sku: "HYD-1",
            slug: "hydra-serum",
            name: { en: "Hydra Serum", fr: "Sérum Hydra", ar: "سيروم هيدرا" },
            shortBenefit: { en: "Hydrate", fr: "Hydrate", ar: "ترطيب" },
            size: "30ml",
            priceMinor: 38000,
            routineStep: "both",
            whyThisProduct: { en: "Focus", fr: "", ar: "" },
            howToUse: { en: "", fr: "", ar: "" },
            whenToUse: { en: "", fr: "", ar: "" },
            orderIndex: 1,
            inStock: true,
            range: { slug: "hydra", name: { en: "Hydra", fr: "", ar: "" } },
          },
        ],
        eveningSteps: [],
        weeklyRitual: [],
        description: { en: "", fr: "", ar: "" },
      },
      chatHistory: [],
    });

    expect(response.message.length).toBeGreaterThan(20);
    expect(response.suggestedQuestions.length).toBe(3);
  });
});
