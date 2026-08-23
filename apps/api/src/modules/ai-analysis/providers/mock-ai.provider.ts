import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { AI_INDICATOR_KEYS, type AiIndicatorKey, type SkinType } from "@ioma/config";
import type { ImageQualityAssessment, VisionObservations } from "@ioma/types";
import type {
  AIProvider,
  AnalyzeImageParams,
  AnalyzeImageResult,
} from "./ai-provider.interface";

@Injectable()
export class MockAIProvider implements AIProvider {
  readonly name = "mock";

  async analyze(params: AnalyzeImageParams): Promise<AnalyzeImageResult> {
    const digest = createHash("sha256").update(params.imageBuffer).digest();

    const indicators = Object.fromEntries(
      AI_INDICATOR_KEYS.map((key, index) => {
        const byteA = digest[(index * 2) % digest.length] ?? 0;
        const byteB = digest[(index * 2 + 1) % digest.length] ?? 0;
        const raw = (byteA * 256 + byteB) % 71;
        const score = 15 + raw;
        return [key, score];
      }),
    ) as Record<AiIndicatorKey, number>;

    const detectedSkinType: SkinType =
      indicators.texture > 60 && indicators.pores > 60
        ? "oily"
        : indicators.hydration < 40
          ? "dry"
          : indicators.redness > 55
            ? "sensitive"
            : "combination";

    const imageQuality: ImageQualityAssessment = {
      isValid: true,
      brightness: "optimal",
      clarity: "sharp",
      faceCentered: true,
      notes: "Face well centered with even lighting.",
    };

    const observations: VisionObservations = {
      hydrationAppearance: {
        score: indicators.hydration,
        level: indicators.hydration < 45 ? "Dehydrated" : "Moderate",
        note: "Surface moisture levels measured across T-zone and cheeks.",
      },
      visiblePores: {
        score: indicators.pores,
        level: indicators.pores > 55 ? "Visible" : "Refined",
        note: "Pore dilation evaluated in central facial zones.",
      },
      rednessAppearance: {
        score: indicators.redness,
        level: indicators.redness > 50 ? "Noticeable" : "Calm",
        note: "Vascular reactivity and environmental sensitivity index.",
      },
      pigmentationAppearance: {
        score: indicators.spots,
        level: indicators.spots > 50 ? "Localized Spots" : "Even",
        note: "Photodamage and uneven tone distribution.",
      },
      fineLinesAppearance: {
        score: indicators.fineLines,
        level: indicators.fineLines > 50 ? "Early Expressions" : "Smooth",
        note: "Early micro-lines in periorbital and expression areas.",
      },
      textureAppearance: {
        score: indicators.texture,
        level: indicators.texture > 50 ? "Silky" : "Balanced",
        note: "Epidermal smoothness and micro-relief regularity.",
      },
      radianceAppearance: {
        score: indicators.radiance,
        level: indicators.radiance > 50 ? "Luminous" : "Balanced",
        note: "Light scattering capacity and skin vitality.",
      },
      imperfectionsAppearance: {
        score: indicators.imperfections,
        level: indicators.imperfections > 50 ? "Minimal" : "Clear",
        note: "Blemish activity and pore congestion.",
      },
    };

    return {
      indicators,
      observations,
      imageQuality,
      confidence: 0.9,
      detectedSkinType,
      primaryConcerns: indicators.hydration < 50 ? ["dehydration"] : ["fatigue-dullness"],
      diagnosticNarrative: {
        en: "Your visual analysis indicates combination skin with localized dehydration tendencies under Dubai indoor air conditioning.",
        fr: "Votre analyse visuelle indique une peau mixte avec des tendances à la déshydratation sous l'effet de la climatisation de Dubaï.",
        ar: "يشير تحليلك البصري إلى بشرة مختلطة مع ميل للجفاف تحت تأثير تكييف الهواء الشائع في دبي.",
      },
      isSimulated: true,
    };
  }
}
