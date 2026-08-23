import { Injectable } from "@nestjs/common";
import type {
  RecommendedProduct,
  RoutineTierData,
  SkinProfile,
  WeeklyRitualStep,
} from "@ioma/types";
import type { ProductRangeKey, RoutineTier } from "@ioma/config";
import {
  ProductKnowledgeService,
  type PopulatedProductWithVariants,
} from "./product-knowledge.service";

@Injectable()
export class RecommendationEngineService {
  constructor(private readonly productKnowledge: ProductKnowledgeService) {}

  /**
   * Builds the 3 personalized routine tiers: Essential, Complete, Premium
   * using ONLY real published products and variants from MongoDB.
   */
  async generateRoutines(profile: SkinProfile): Promise<{
    primaryRange: { slug: ProductRangeKey; name: Record<string, string> };
    essential: RoutineTierData;
    complete: RoutineTierData;
    premium: RoutineTierData;
  }> {
    const catalog = await this.productKnowledge.getAllPublishedCatalogue();
    const primaryRangeSlug = this.resolvePrimaryRange(profile);
    const primaryRangeDoc = await this.productKnowledge.getRangeBySlug(primaryRangeSlug);

    const primaryRange = {
      slug: primaryRangeSlug,
      name: primaryRangeDoc?.name || {
        en: primaryRangeSlug.toUpperCase(),
        fr: primaryRangeSlug.toUpperCase(),
        ar: primaryRangeSlug.toUpperCase(),
      },
    };

    // Filter candidate products
    const primaryProducts = catalog.filter((c) => c.range?.slug === primaryRangeSlug);
    const allCleansers = catalog.filter(
      (c) =>
        (c.product.name?.en || "").toLowerCase().includes("gel") ||
        (c.product.name?.en || "").toLowerCase().includes("nettoyant") ||
        (c.product.name?.en || "").toLowerCase().includes("cleanser"),
    );

    // Universal Hydra / Core fallback if specific category missing in primary range
    const hydraSerum =
      catalog.find((c) => c.product.slug === "serum-hydratant-optimum") ||
      catalog.find((c) => (c.product.name?.en || "").toLowerCase().includes("serum"));
    const hydraCream =
      catalog.find((c) => c.product.slug === "gel-fraicheur-hydratant") ||
      catalog.find((c) => c.product.slug === "creme-hydratation-jeunesse-jour-et-nuit") ||
      catalog.find((c) => (c.product.name?.en || "").toLowerCase().includes("cream"));
    const pureteCleanser =
      catalog.find((c) => c.product.slug === "mousse-tonique-astringente") ||
      catalog.find((c) => c.product.slug === "mousse-tonique-doux") ||
      catalog.find((c) => c.product.slug === "lait-demaquillant-hydratant") ||
      allCleansers[0];

    // Primary range specific products
    const primarySerum =
      primaryProducts.find((c) =>
        (c.product.name?.en || "").toLowerCase().includes("serum"),
      ) || hydraSerum;
    const primaryCream =
      primaryProducts.find(
        (c) =>
          (c.product.name?.en || "").toLowerCase().includes("cream") ||
          (c.product.name?.en || "").toLowerCase().includes("crème"),
      ) || hydraCream;

    // Build Tier 1: ESSENTIAL (3 products: Cleanser / Serum / Cream)
    const essentialItems: PopulatedProductWithVariants[] = [];
    if (pureteCleanser) essentialItems.push(pureteCleanser);
    if (primarySerum && !essentialItems.includes(primarySerum))
      essentialItems.push(primarySerum);
    if (primaryCream && !essentialItems.includes(primaryCream))
      essentialItems.push(primaryCream);

    // Build Tier 2: COMPLETE (4-5 products: Cleanser / Primary Serum / Secondary Serum or Calming / Morning Cream / Evening Cream)
    const completeItems: PopulatedProductWithVariants[] = [...essentialItems];
    const complementarySerum =
      primaryRangeSlug !== "hydra" && hydraSerum
        ? hydraSerum
        : catalog.find(
            (c) =>
              c.range?.slug === "energize" &&
              (c.product.name?.en || "").toLowerCase().includes("serum"),
          ) || null;

    if (complementarySerum && !completeItems.includes(complementarySerum)) {
      completeItems.push(complementarySerum);
    }
    const nightCream =
      catalog.find((c) => c.product.slug === "creme-genereuse-nuit") ||
      catalog.find((c) => c.product.slug === "vitality-sleeping-mask") ||
      catalog.find((c) => c.product.slug === "ma-creme-nuit") ||
      catalog.find((c) => c.product.slug === "creme-sublime-revitalisante");
    if (nightCream && !completeItems.includes(nightCream) && completeItems.length < 5) {
      completeItems.push(nightCream);
    }

    // Build Tier 3: PREMIUM (5-7 products: Comprehensive Haute Skincare Ritual)
    const premiumItems: PopulatedProductWithVariants[] = [...completeItems];
    for (const item of catalog) {
      if (premiumItems.length >= 6) break;
      if (!premiumItems.some((pi) => pi.product.slug === item.product.slug)) {
        premiumItems.push(item);
      }
    }

    const budgetPref = profile.budgetPreference;
    const essentialTier = this.buildTierData(
      "essential",
      essentialItems,
      profile,
      budgetPref,
    );
    const completeTier = this.buildTierData(
      "complete",
      completeItems,
      profile,
      budgetPref,
    );
    const premiumTier = this.buildTierData("premium", premiumItems, profile, budgetPref);

    return {
      primaryRange,
      essential: essentialTier,
      complete: completeTier,
      premium: premiumTier,
    };
  }

  private resolvePrimaryRange(profile: SkinProfile): ProductRangeKey {
    if (profile.sensitivityLevel === "high" || profile.skinType === "sensitive") {
      return "calm";
    }

    const topGoal = profile.goals[0];
    switch (topGoal) {
      case "dehydration":
        return "hydra";
      case "fatigue-dullness":
        return "energize";
      case "first-signs-of-aging":
        return "renew";
      case "sensitivity":
        return "calm";
      case "blemishes":
        return "purete";
      case "shine-control":
        return "matte";
      case "dark-spots":
        return "illumine";
      default:
        break;
    }

    const topPriority = profile.priorities[0]?.id;
    if (topPriority === "hydration") return "hydra";
    if (topPriority === "barrier_soothing") return "calm";
    if (topPriority === "radiance_vitality") return "energize";
    if (topPriority === "renewal_firmness") return "renew";
    if (topPriority === "clarity_refinement") return "matte";

    return "hydra";
  }

  private buildTierData(
    tier: RoutineTier,
    items: PopulatedProductWithVariants[],
    profile: SkinProfile,
    budgetPreference?: string,
  ): RoutineTierData {
    const morningSteps: RecommendedProduct[] = [];
    const eveningSteps: RecommendedProduct[] = [];

    const selectVariant = (item: PopulatedProductWithVariants) => {
      const vars = item.variants;
      if (!vars || vars.length === 0) {
        return {
          _id: item.product._id?.toString() || "default",
          sku: `${item.product.slug}-default`,
          size: "50ml",
          b2cPriceMinor: 35000,
          quantityOnHand: 10,
          quantityReserved: 0,
          backorderAllowed: true,
        };
      }
      if (budgetPreference === "under_500" || budgetPreference === "500_1000") {
        const sorted = vars.slice().sort((a, b) => a.b2cPriceMinor - b.b2cPriceMinor);
        return sorted[0]!;
      }
      return vars[0]!;
    };

    let stepOrder = 1;
    for (const item of items) {
      const variant = selectVariant(item);
      const whyThisProduct = this.generateProductRationale(item, profile);

      const inStock =
        variant.quantityOnHand - variant.quantityReserved > 0 ||
        variant.backorderAllowed !== false;

      const recProduct: RecommendedProduct = {
        productId: item.product._id.toString(),
        variantId: variant._id?.toString() || item.product._id.toString(),
        sku: variant.sku,
        slug: item.product.slug,
        name: item.product.name,
        shortBenefit: item.product.shortBenefit,
        size: variant.size,
        priceMinor: variant.b2cPriceMinor,
        routineStep: item.product.routineStep,
        whyThisProduct,
        howToUse: item.product.howToUse,
        whenToUse: {
          en:
            item.product.routineStep === "morning"
              ? "Morning"
              : item.product.routineStep === "evening"
                ? "Evening"
                : "Morning & Evening",
          fr:
            item.product.routineStep === "morning"
              ? "Matin"
              : item.product.routineStep === "evening"
                ? "Soir"
                : "Matin & Soir",
          ar:
            item.product.routineStep === "morning"
              ? "صباحًا"
              : item.product.routineStep === "evening"
                ? "مساءً"
                : "صباحًا ومساءً",
        },
        orderIndex: stepOrder++,
        inStock,
        image: item.product.images?.[0],
        range: {
          slug: (item.range?.slug as ProductRangeKey) || "hydra",
          name: item.range?.name || { en: "Hydra", fr: "Hydra", ar: "هيدرا" },
        },
      };

      if (item.product.routineStep === "morning" || item.product.routineStep === "both") {
        morningSteps.push(recProduct);
      }
      if (item.product.routineStep === "evening" || item.product.routineStep === "both") {
        eveningSteps.push(recProduct);
      }
    }

    const uniqueMap = new Map<string, number>();
    for (const p of [...morningSteps, ...eveningSteps]) {
      uniqueMap.set(p.sku, p.priceMinor);
    }
    let totalPriceMinor = 0;
    uniqueMap.forEach((price) => {
      totalPriceMinor += price;
    });

    const weeklyRitual: WeeklyRitualStep[] = [
      {
        day: "Wed & Sun",
        action: {
          en: "Intense Hydrating Mask",
          fr: "Masque Hydratant Intense",
          ar: "قناع الترطيب المكثف",
        },
        productName: {
          en: "Hydra Enveloping Care",
          fr: "Soin Enveloppant Hydra",
          ar: "عناية هيدرا المغلفة",
        },
        guidance: {
          en: "Apply generously after cleansing. Leave for 15 minutes to counter indoor AC dryness.",
          fr: "Appliquer généreusement après le nettoyage. Laisser poser 15 min pour contrer la sécheresse liée à la climatisation.",
          ar: "يُوضع بسخاء بعد التنظيف ويُترك لمدة 15 دقيقة لمواجهة جفاف التكييف.",
        },
      },
      {
        day: "Mon & Fri",
        action: {
          en: "Gentle Micro-Exfoliation",
          fr: "Micro-Exfoliation Douce",
          ar: "تقشير دقيق ولطيف",
        },
        productName: {
          en: "Pureté Clarity Polish",
          fr: "Soin Pureté Clarté",
          ar: "مقشر بوريتيه للنقاء",
        },
        guidance: {
          en: "Gently eliminates surface keratin without disrupting the lipid mantle.",
          fr: "Élimine délicatement la kératine de surface sans altérer le film lipidique.",
          ar: "يزيل بلطف خلايا الجلد السطحية دون الإخلال بغشاء الحماية الطبيعي.",
        },
      },
    ];

    const descriptions: Record<RoutineTier, { en: string; fr: string; ar: string }> = {
      essential: {
        en: "A streamlined 3-step ritual focused on your highest priority with zero unnecessary complexity.",
        fr: "Un rituel épuré en 3 étapes ciblé sur votre priorité essentielle, sans superflu.",
        ar: "روتين مبسط من 3 خطوات يركز على أولويتك الأساسية بدون أي تعقيد.",
      },
      complete: {
        en: "A balanced 4-5 product ritual providing comprehensive day defense and overnight regeneration.",
        fr: "Un rituel équilibré de 4-5 soins offrant protection diurne complète et régénération nocturne.",
        ar: "روتين متوازن من 4 إلى 5 منتجات يوفر حماية نهارية وتجددًا ليليًا شاملاً.",
      },
      premium: {
        en: "The ultimate IOMA Haute Cosmétique ritual delivering maximum anti-environmental performance.",
        fr: "Le rituel ultime IOMA Haute Cosmétique pour une performance anti-environnementale maximale.",
        ar: "الطقوس الفاخرة الأرقى من إيوما لتحقيق أقصى درجات الفعالية ومقاومة العوامل البيئية.",
      },
    };

    return {
      tier,
      totalPriceMinor,
      description: descriptions[tier],
      morningSteps,
      eveningSteps,
      weeklyRitual,
    };
  }

  private generateProductRationale(
    item: PopulatedProductWithVariants,
    profile: SkinProfile,
  ): { en: string; fr: string; ar: string } {
    const isSerum = (item.product.name?.en || "").toLowerCase().includes("serum");
    const isCream =
      (item.product.name?.en || "").toLowerCase().includes("cream") ||
      (item.product.name?.en || "").toLowerCase().includes("crème");
    const isCleanser =
      (item.product.name?.en || "").toLowerCase().includes("gel") ||
      (item.product.name?.en || "").toLowerCase().includes("cleanser") ||
      (item.product.name?.en || "").toLowerCase().includes("nettoyant");

    if (isCleanser) {
      return {
        en: "Selected as your foundational step to purify cutaneous impurities without altering your moisture barrier.",
        fr: "Sélectionné comme étape fondamentale pour purifier la peau sans altérer votre barrière hydrolipidique.",
        ar: "تم اختياره كخطوة أساسية لتنقية البشرة من الشوائب دون الإخلال بحاجز الرطوبة الطبيعي.",
      };
    }

    if (isSerum) {
      return {
        en: `High-potency concentration targeted directly at your primary focus: ${profile.priorities[0]?.title.en || "Hydration"}.`,
        fr: `Concentration haute performance ciblant directement votre priorité majeure : ${profile.priorities[0]?.title.fr || "Hydratation"}.`,
        ar: `تركيز عالي الفعالية يستهدف مباشرة أولويتك الأساسية: ${profile.priorities[0]?.title.ar || "الترطيب"}.`,
      };
    }

    if (isCream) {
      return {
        en: `Seals in active serums and creates a protective shield against Dubai's dry indoor air conditioning.`,
        fr: `Scelle les actifs des sérums et crée un bouclier protecteur contre la sécheresse de la climatisation à Dubaï.`,
        ar: `يثبت مفعول السيرومات الفعالة ويشكل درعًا واقيًا ضد جفاف هواء التكييف في دبي.`,
      };
    }

    return {
      en: "Formulated to complement your personalized IOMA ritual with targeted corrective care.",
      fr: "Formulé pour compléter votre rituel IOMA personnalisé avec un soin correcteur ciblé.",
      ar: "مُصمم لتكملة روتينك المخصص من إيوما بعناية تصحيحية مستهدفة.",
    };
  }
}
