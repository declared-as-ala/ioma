import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { AI_INDICATOR_KEYS, type AiIndicatorKey, type SkinType } from "@ioma/config";
import type { ImageQualityAssessment, VisionObservations } from "@ioma/types";
import type {
  AIProvider,
  AnalyzeImageParams,
  AnalyzeImageResult,
} from "./ai-provider.interface";

@Injectable()
export class GeminiAIProvider implements AIProvider {
  readonly name = "gemini";
  private readonly logger = new Logger(GeminiAIProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async analyze(params: AnalyzeImageParams): Promise<AnalyzeImageResult> {
    const apiKey =
      this.configService.get<string>("AI_PROVIDER_API_KEY") ||
      this.configService.get<string>("GEMINI_API_KEY") ||
      process.env.GEMINI_API_KEY ||
      process.env.AI_PROVIDER_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        "No Gemini API key supplied. Falling back to deterministic simulation.",
      );
      return this.fallbackAnalysis(params.imageBuffer);
    }

    try {
      const base64Data = params.imageBuffer.toString("base64");
      const mimeType = params.mimeType || "image/jpeg";

      const promptText = `You are the lead cosmetic skin science diagnostic AI for IOMA Paris Dubai.
Analyze this high-resolution facial skin image for a luxury digital skincare consultation.
Provide a thorough cosmetic evaluation adhering strictly to non-medical skincare advisory boundaries.
Do NOT diagnose medical diseases (such as eczema, rosacea, melanoma, or cystic acne).

Return a valid JSON object strictly matching this schema:
{
  "imageQuality": {
    "isValid": boolean,
    "brightness": "low" | "optimal" | "high",
    "clarity": "sharp" | "acceptable" | "blurry",
    "faceCentered": boolean,
    "notes": string
  },
  "detectedSkinType": "dry" | "oily" | "combination" | "normal" | "sensitive",
  "confidence": number (0.0 to 1.0),
  "primaryConcerns": ["dehydration" | "fatigue-dullness" | "first-signs-of-aging" | "sensitivity" | "blemishes" | "shine-control" | "dark-spots"],
  "indicators": {
    "hydration": number (0 to 100),
    "fineLines": number (0 to 100),
    "wrinkles": number (0 to 100),
    "pores": number (0 to 100),
    "spots": number (0 to 100),
    "unevenTone": number (0 to 100),
    "redness": number (0 to 100),
    "imperfections": number (0 to 100),
    "texture": number (0 to 100),
    "radiance": number (0 to 100),
    "firmness": number (0 to 100)
  },
  "observations": {
    "hydrationAppearance": { "score": number, "level": "Optimal" | "Moderate" | "Dehydrated", "note": string },
    "visiblePores": { "score": number, "level": "Refined" | "Moderate" | "Visible", "note": string },
    "rednessAppearance": { "score": number, "level": "Calm" | "Mild" | "Noticeable", "note": string },
    "pigmentationAppearance": { "score": number, "level": "Even" | "Mild Variations" | "Localized Spots", "note": string },
    "fineLinesAppearance": { "score": number, "level": "Smooth" | "Early Expressions" | "Marked", "note": string },
    "textureAppearance": { "score": number, "level": "Silky" | "Balanced" | "Uneven", "note": string },
    "radianceAppearance": { "score": number, "level": "Luminous" | "Balanced" | "Dull", "note": string },
    "imperfectionsAppearance": { "score": number, "level": "Clear" | "Minimal" | "Active", "note": string }
  },
  "diagnosticNarrative": {
    "en": "A 2-3 sentence luxury editorial skincare diagnosis summary interpreting the visual indicators and climate context.",
    "fr": "Un résumé d'analyse cosmétique luxueux et précis en français de 2-3 phrases.",
    "ar": "ملخص تحليلي تجميلي فاخر ودقيق للبشرة باللغة العربية في 2-3 جمل."
  }
}
Format strictly as JSON without extra markdown backticks or commentary outside the JSON.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.2,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API returned status ${response.status}: ${errorText}`);
        return this.fallbackAnalysis(params.imageBuffer);
      }

      const responseData = (await response.json()) as any;
      const textOutput = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        this.logger.error("Gemini API response did not contain candidates content.");
        return this.fallbackAnalysis(params.imageBuffer);
      }

      const parsed = JSON.parse(textOutput.trim());

      const indicators = {} as Record<AiIndicatorKey, number>;
      for (const key of AI_INDICATOR_KEYS) {
        const val = Number(parsed.indicators?.[key]);
        indicators[key] = !isNaN(val) && val >= 0 && val <= 100 ? Math.round(val) : 55;
      }

      const validSkinTypes: SkinType[] = [
        "dry",
        "oily",
        "combination",
        "normal",
        "sensitive",
      ];
      const detectedSkinType: SkinType = validSkinTypes.includes(parsed.detectedSkinType)
        ? parsed.detectedSkinType
        : "combination";

      const imageQuality: ImageQualityAssessment = {
        isValid: parsed.imageQuality?.isValid ?? true,
        brightness: parsed.imageQuality?.brightness ?? "optimal",
        clarity: parsed.imageQuality?.clarity ?? "sharp",
        faceCentered: parsed.imageQuality?.faceCentered ?? true,
        notes: parsed.imageQuality?.notes ?? "Face well framed with good lighting.",
      };

      const observations: VisionObservations = {
        hydrationAppearance: parsed.observations?.hydrationAppearance ?? {
          score: indicators.hydration,
          level:
            indicators.hydration > 65
              ? "Optimal"
              : indicators.hydration > 40
                ? "Moderate"
                : "Dehydrated",
          note: "Hydration levels assessed across cheeks and forehead.",
        },
        visiblePores: parsed.observations?.visiblePores ?? {
          score: indicators.pores,
          level:
            indicators.pores < 40
              ? "Refined"
              : indicators.pores < 70
                ? "Moderate"
                : "Visible",
          note: "Pore visibility evaluated in T-zone.",
        },
        rednessAppearance: parsed.observations?.rednessAppearance ?? {
          score: indicators.redness,
          level:
            indicators.redness < 35
              ? "Calm"
              : indicators.redness < 65
                ? "Mild"
                : "Noticeable",
          note: "Skin surface reactivity and micro-vascular tone.",
        },
        pigmentationAppearance: parsed.observations?.pigmentationAppearance ?? {
          score: indicators.spots,
          level:
            indicators.spots < 35
              ? "Even"
              : indicators.spots < 65
                ? "Mild Variations"
                : "Localized Spots",
          note: "Evenness of complexion and sun exposure markers.",
        },
        fineLinesAppearance: parsed.observations?.fineLinesAppearance ?? {
          score: indicators.fineLines,
          level:
            indicators.fineLines < 35
              ? "Smooth"
              : indicators.fineLines < 65
                ? "Early Expressions"
                : "Marked",
          note: "Micro-relief around eye contour and smile area.",
        },
        textureAppearance: parsed.observations?.textureAppearance ?? {
          score: indicators.texture,
          level: indicators.texture > 60 ? "Silky" : "Balanced",
          note: "Skin surface smoothness and cutaneous regularity.",
        },
        radianceAppearance: parsed.observations?.radianceAppearance ?? {
          score: indicators.radiance,
          level: indicators.radiance > 60 ? "Luminous" : "Balanced",
          note: "Natural light reflection across the high points of the face.",
        },
        imperfectionsAppearance: parsed.observations?.imperfectionsAppearance ?? {
          score: indicators.imperfections,
          level: indicators.imperfections < 35 ? "Clear" : "Minimal",
          note: "Cutaneous clarity and surface balance.",
        },
      };

      const diagnosticNarrative = {
        en:
          parsed.diagnosticNarrative?.en ||
          "Your visual analysis reveals a refined cutaneous texture with localized dehydration markers, characteristic of indoor air conditioning exposure.",
        fr:
          parsed.diagnosticNarrative?.fr ||
          "Votre analyse visuelle révèle une texture cutanée affinée avec des marqueurs de déshydratation localisés, typiques de l'exposition à la climatisation.",
        ar:
          parsed.diagnosticNarrative?.ar ||
          "يُظهر تحليلك البصري ملمسًا جلديًا دقيقًا مع علامات جفاف موضعية ناتجة عن التعرض المستمر لتكييف الهواء.",
      };

      this.logger.log("Successfully analyzed skin photo using Gemini Vision AI!");
      return {
        indicators,
        observations,
        imageQuality,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.92,
        detectedSkinType,
        primaryConcerns:
          Array.isArray(parsed.primaryConcerns) && parsed.primaryConcerns.length > 0
            ? parsed.primaryConcerns
            : ["dehydration"],
        diagnosticNarrative,
        isSimulated: false,
      };
    } catch (error) {
      this.logger.error("Error executing Gemini Vision AI analysis:", error);
      return this.fallbackAnalysis(params.imageBuffer);
    }
  }

  private fallbackAnalysis(imageBuffer: Buffer): AnalyzeImageResult {
    const digest = createHash("sha256").update(imageBuffer).digest();
    const indicators = Object.fromEntries(
      AI_INDICATOR_KEYS.map((key, index) => {
        const byteA = digest[(index * 2) % digest.length] ?? 0;
        const byteB = digest[(index * 2 + 1) % digest.length] ?? 0;
        const raw = (byteA * 256 + byteB) % 65;
        const score = 25 + raw;
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

    const observations: VisionObservations = {
      hydrationAppearance: {
        score: indicators.hydration,
        level: indicators.hydration < 45 ? "Dehydrated" : "Moderate",
        note: "Surface moisture retention shows early signs of environmental dehydration.",
      },
      visiblePores: {
        score: indicators.pores,
        level: indicators.pores > 55 ? "Visible" : "Refined",
        note: "T-zone pores show mild enlargement typical of warm climates.",
      },
      rednessAppearance: {
        score: indicators.redness,
        level: indicators.redness > 50 ? "Noticeable" : "Calm",
        note: "Vascular reactivity remains balanced with subtle cheek flushing.",
      },
      pigmentationAppearance: {
        score: indicators.spots,
        level: indicators.spots > 50 ? "Localized Spots" : "Even",
        note: "Even tone with minimal UV-related pigment variations.",
      },
      fineLinesAppearance: {
        score: indicators.fineLines,
        level: indicators.fineLines > 50 ? "Early Expressions" : "Smooth",
        note: "Fine expression lines visible along dynamic facial zones.",
      },
      textureAppearance: {
        score: indicators.texture,
        level: indicators.texture > 50 ? "Silky" : "Balanced",
        note: "Overall cutaneous smoothness is well preserved.",
      },
      radianceAppearance: {
        score: indicators.radiance,
        level: indicators.radiance > 50 ? "Luminous" : "Balanced",
        note: "Healthy skin reflectance with opportunities to boost cellular vitality.",
      },
      imperfectionsAppearance: {
        score: indicators.imperfections,
        level: indicators.imperfections > 50 ? "Minimal" : "Clear",
        note: "Clear complexion with low comedogenic activity.",
      },
    };

    return {
      indicators,
      observations,
      imageQuality: {
        isValid: true,
        brightness: "optimal",
        clarity: "sharp",
        faceCentered: true,
        notes: "Image parameters validated for cosmetic evaluation.",
      },
      confidence: 0.88,
      detectedSkinType,
      primaryConcerns: indicators.hydration < 50 ? ["dehydration"] : ["fatigue-dullness"],
      diagnosticNarrative: {
        en: "Your visual analysis indicates combination skin with mild dehydration tendencies under typical Dubai indoor air conditioning.",
        fr: "Votre analyse visuelle indique une peau mixte avec des tendances à la déshydratation sous l'effet de la climatisation de Dubaï.",
        ar: "يشير تحليلك البصري إلى بشرة مختلطة مع ميل للجفاف تحت تأثير تكييف الهواء الشائع في دبي.",
      },
      isSimulated: true,
    };
  }
}
