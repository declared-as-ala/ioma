import { RecommendationEngineService } from "./recommendation-engine.service";
import type { ProductKnowledgeService } from "./product-knowledge.service";
import type { SkinProfile } from "@ioma/types";

describe("RecommendationEngineService", () => {
  let service: RecommendationEngineService;
  let mockProductKnowledge: Partial<ProductKnowledgeService>;

  const mockProfile: SkinProfile = {
    skinType: "combination",
    hydrationTendency: "Dehydrated",
    sensitivityLevel: "low",
    priorities: [
      {
        id: "hydration",
        rank: 1,
        title: { en: "Hydration", fr: "Hydratation", ar: "ترطيب" },
        rationale: { en: "Restore water balance", fr: "Hydrater", ar: "ترطيب" },
      },
    ],
    goals: ["dehydration"],
    currentRoutine: { vitaminC: true },
    climateContext: { acExposure: "high", sunExposure: "moderate" },
    routinePreference: "balanced",
    budgetPreference: "no_preference",
    confidence: 0.95,
  };

  const mockCatalogue = [
    {
      product: {
        _id: "prod-1",
        slug: "hydra-serum-intense",
        name: { en: "Hydra Intense Serum", fr: "Sérum Hydra Intense", ar: "سيروم هيدرا" },
        shortBenefit: { en: "Hydration boost", fr: "Booste l'hydratation", ar: "ترطيب" },
        routineStep: "both",
        howToUse: { en: "Apply AM/PM", fr: "Appliquer", ar: "يستخدم" },
        categoryIds: ["cat-serums"],
      } as any,
      range: {
        _id: "range-1",
        slug: "hydra",
        name: { en: "Hydra", fr: "Hydra", ar: "هيدرا" },
      } as any,
      variants: [
        {
          _id: "var-1",
          sku: "HYD-SERUM-30",
          size: "30ml",
          b2cPriceMinor: 38000,
          quantityOnHand: 10,
          quantityReserved: 0,
          backorderAllowed: true,
        } as any,
      ],
    },
    {
      product: {
        _id: "prod-2",
        slug: "hydra-creme-riche",
        name: { en: "Hydra Rich Cream", fr: "Crème Hydra Riche", ar: "كريم هيدرا" },
        shortBenefit: { en: "Rich comfort", fr: "Confort riche", ar: "راحة" },
        routineStep: "both",
        howToUse: { en: "Apply as last step", fr: "Appliquer", ar: "يستخدم" },
        categoryIds: ["cat-creams"],
      } as any,
      range: {
        _id: "range-1",
        slug: "hydra",
        name: { en: "Hydra", fr: "Hydra", ar: "هيدرا" },
      } as any,
      variants: [
        {
          _id: "var-2",
          sku: "HYD-CREAM-50",
          size: "50ml",
          b2cPriceMinor: 32000,
          quantityOnHand: 15,
          quantityReserved: 0,
          backorderAllowed: true,
        } as any,
      ],
    },
    {
      product: {
        _id: "prod-3",
        slug: "purete-gel-nettoyant",
        name: { en: "Pureté Cleansing Gel", fr: "Gel Nettoyant Pureté", ar: "جل منظف" },
        shortBenefit: { en: "Gentle cleanse", fr: "Nettoie en douceur", ar: "تنظيف" },
        routineStep: "both",
        howToUse: { en: "Wash face", fr: "Laver", ar: "غسيل" },
        categoryIds: ["cat-cleansers"],
      } as any,
      range: {
        _id: "range-2",
        slug: "purete",
        name: { en: "Pureté", fr: "Pureté", ar: "بوريتيه" },
      } as any,
      variants: [
        {
          _id: "var-3",
          sku: "PUR-GEL-150",
          size: "150ml",
          b2cPriceMinor: 18000,
          quantityOnHand: 20,
          quantityReserved: 0,
          backorderAllowed: true,
        } as any,
      ],
    },
  ];

  beforeEach(() => {
    mockProductKnowledge = {
      getAllPublishedCatalogue: jest.fn().mockResolvedValue(mockCatalogue),
      getRangeBySlug: jest
        .fn()
        .mockResolvedValue({
          slug: "hydra",
          name: { en: "Hydra", fr: "Hydra", ar: "هيدرا" },
        } as any),
    };
    service = new RecommendationEngineService(
      mockProductKnowledge as ProductKnowledgeService,
    );
  });

  it("generates Essential, Complete, and Premium routine tiers from real catalogue", async () => {
    const result = await service.generateRoutines(mockProfile);

    expect(result.primaryRange.slug).toBe("hydra");
    expect(result.essential).toBeDefined();
    expect(result.complete).toBeDefined();
    expect(result.premium).toBeDefined();

    // Essential tier should have morning and evening steps
    expect(result.essential.morningSteps.length).toBeGreaterThan(0);
    expect(result.essential.totalPriceMinor).toBeGreaterThan(0);

    // Every product must have whyThisProduct and priceMinor from DB
    const firstProduct = result.essential.morningSteps[0]!;
    expect(firstProduct.whyThisProduct.en).toBeDefined();
    expect(firstProduct.priceMinor).toBeGreaterThan(0);
    expect(firstProduct.inStock).toBe(true);
  });
});
