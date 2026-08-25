import { AiBeautyAdvisorService } from "./ai-beauty-advisor.service";
import { ConfigService } from "@nestjs/config";
import type { RoutineTierData, SkinProfile } from "@ioma/types";

describe("AiBeautyAdvisorService Contextual Responses & Grounding", () => {
  let service: AiBeautyAdvisorService;
  let mockConfigService: Partial<ConfigService>;

  const mockSkinProfile: SkinProfile = {
    skinType: "combination",
    hydrationTendency: "Dehydrated",
    sensitivityLevel: "moderate",
    priorities: [
      {
        id: "hydration",
        rank: 1,
        title: {
          en: "Hydration Barrier Defense",
          fr: "Hydratation",
          ar: "الترطيب العميق",
        },
        rationale: { en: "Continuous AC moisture depletion", fr: "", ar: "" },
      },
      {
        id: "pores",
        rank: 2,
        title: { en: "T-Zone Pore Refinement", fr: "Pores", ar: "تضييق المسام" },
        rationale: { en: "Lipid imbalance", fr: "", ar: "" },
      },
    ],
    goals: ["hydration", "anti_aging"],
    currentRoutine: {
      cleanser: "CeraVe Hydrating Cleanser",
      retinoid: true,
      rawText: "Retinol 0.5% twice a week, gentle wash",
    },
    climateContext: {
      acExposure: "high",
      sunExposure: "moderate",
    },
    routinePreference: "complete",
    budgetPreference: "500_1000",
    confidence: 0.92,
  };

  const mockActiveTierData: RoutineTierData = {
    tier: "complete",
    totalPriceMinor: 102000,
    description: { en: "Complete 4-Step Ritual", fr: "", ar: "" },
    morningSteps: [
      {
        productId: "p_cleanser_1",
        variantId: "v_cleanser_1",
        sku: "IBP101",
        slug: "gentle-cleansing-foam",
        name: {
          en: "Gentle Cleansing Foam",
          fr: "Mousse Nettoyante",
          ar: "رغوة التنظيف اللطيفة",
        },
        shortBenefit: { en: "Deep purification without dryness", fr: "", ar: "" },
        size: "150ml",
        priceMinor: 22000,
        routineStep: "both",
        whyThisProduct: { en: "Calms cutaneous surface", fr: "", ar: "" },
        howToUse: { en: "", fr: "", ar: "" },
        whenToUse: { en: "", fr: "", ar: "" },
        orderIndex: 1,
        inStock: true,
        range: { slug: "hydra", name: { en: "Hydra", fr: "Hydra", ar: "هيدرا" } },
      },
      {
        productId: "p_serum_1",
        variantId: "v_serum_1",
        sku: "IBP119",
        slug: "optimum-moisture-serum",
        name: {
          en: "Optimum Moisture Serum",
          fr: "Sérum Hydratation",
          ar: "سيروم الترطيب المكثف",
        },
        shortBenefit: { en: "Cellular hydration infusion", fr: "", ar: "" },
        size: "30ml",
        priceMinor: 38000,
        routineStep: "both",
        whyThisProduct: { en: "Primary barrier defense", fr: "", ar: "" },
        howToUse: { en: "", fr: "", ar: "" },
        whenToUse: { en: "", fr: "", ar: "" },
        orderIndex: 2,
        inStock: true,
        range: { slug: "hydra", name: { en: "Hydra", fr: "Hydra", ar: "هيدرا" } },
      },
      {
        productId: "p_cream_1",
        variantId: "v_cream_1",
        sku: "IBP125",
        slug: "hydra-barrier-day-cream",
        name: {
          en: "Hydra Barrier Day Cream",
          fr: "Crème Barrière",
          ar: "كريم الترطيب وحماية الحاجز",
        },
        shortBenefit: { en: "Anti-pollution and AC shield", fr: "", ar: "" },
        size: "50ml",
        priceMinor: 42000,
        routineStep: "morning",
        whyThisProduct: { en: "Locks active ingredients", fr: "", ar: "" },
        howToUse: { en: "", fr: "", ar: "" },
        whenToUse: { en: "", fr: "", ar: "" },
        orderIndex: 3,
        inStock: true,
        range: { slug: "hydra", name: { en: "Hydra", fr: "Hydra", ar: "هيدرا" } },
      },
    ],
    eveningSteps: [],
    weeklyRitual: [],
  };

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue(null),
    };
    service = new AiBeautyAdvisorService(mockConfigService as ConfigService);
  });

  it("produces meaningfully different and contextual responses for 8 distinct questions", async () => {
    const questions = [
      "Why do I need this serum?",
      "Which concern is most important?",
      "Can I remove one product?",
      "Can you make the routine cheaper?",
      "Can I keep my current cleanser?",
      "What should I use in the morning?",
      "Why is my skin considered dehydrated?",
      "What did you observe around my pores?",
    ];

    const responses: string[] = [];

    for (const q of questions) {
      const res = await service.askAdvisor({
        message: q,
        locale: "en",
        skinProfile: mockSkinProfile,
        activeTierData: mockActiveTierData,
        chatHistory: [],
      });

      expect(res.message.length).toBeGreaterThan(30);
      expect(res.suggestedQuestions.length).toBe(3);
      responses.push(res.message);
    }

    // Verify all 8 responses are distinct from each other
    const uniqueResponses = new Set(responses);
    expect(uniqueResponses.size).toBe(questions.length);

    // Question 1 (Serum) must mention the actual serum and its price
    expect(responses[0]).toContain("Optimum Moisture Serum");
    expect(responses[0]).toContain("380 AED");

    // Question 2 (Most Important Concern) must mention Hydration & Barrier Defense
    expect(responses[1]).toContain("Hydration Barrier Defense");

    // Question 4 (Make it cheaper) must offer 3 core essentials with price calculation
    expect(responses[3]).toContain("1020");

    // Question 5 (Keep current cleanser) must provide layering rules
    expect(responses[4]).toContain("Optimum Moisture Serum");
    expect(responses[4]).toContain("retinol");

    // Question 6 (Morning routine) must list step-by-step numbers
    expect(responses[5]).toContain("Gentle Cleansing");
    expect(responses[5]).toContain("Sun Defense");

    // Question 8 (Pores) must discuss T-zone and pores
    expect(responses[7]).toContain("pore");
  });

  it("provides Arabic responses with feminine phrasing and Arabic product names", async () => {
    const res = await service.askAdvisor({
      message: "لماذا أحتاج إلى هذا السيروم؟",
      locale: "ar",
      skinProfile: mockSkinProfile,
      activeTierData: mockActiveTierData,
      chatHistory: [],
    });

    expect(res.message).toContain("سيروم الترطيب المكثف");
    expect(res.message).toContain("درهم إماراتي");
    expect(res.suggestedQuestions.length).toBe(3);
  });

  it("safely triggers medical disclaimer if clinical conditions are inquired", async () => {
    const res = await service.askAdvisor({
      message: "How can I cure my facial eczema and psoriasis?",
      locale: "en",
      skinProfile: mockSkinProfile,
      activeTierData: mockActiveTierData,
      chatHistory: [],
    });

    expect(res.message).toContain("licensed healthcare professional");
    expect(res.suggestedQuestions.length).toBe(3);
  });
});
