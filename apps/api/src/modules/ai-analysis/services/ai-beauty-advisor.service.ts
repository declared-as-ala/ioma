import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AiChatMessage,
  RecommendedProduct,
  RoutineTierData,
  SkinProfile,
} from "@ioma/types";

export interface AskAdvisorParams {
  message: string;
  locale: "en" | "fr" | "ar";
  skinProfile: SkinProfile;
  activeTierData: RoutineTierData;
  chatHistory: AiChatMessage[];
}

export interface AdvisorResponse {
  message: string;
  suggestedQuestions: string[];
}

@Injectable()
export class AiBeautyAdvisorService {
  private readonly logger = new Logger(AiBeautyAdvisorService.name);

  constructor(private readonly configService: ConfigService) {}

  async askAdvisor(params: AskAdvisorParams): Promise<AdvisorResponse> {
    const apiKey =
      this.configService.get<string>("AI_PROVIDER_API_KEY") ||
      this.configService.get<string>("GEMINI_API_KEY") ||
      process.env.GEMINI_API_KEY ||
      process.env.AI_PROVIDER_API_KEY;

    // Safety filter: check if user asks for medical diagnosis
    const lower = params.message.toLowerCase();
    if (
      lower.includes("eczema") ||
      lower.includes("rosacea") ||
      lower.includes("melanoma") ||
      lower.includes("cancer") ||
      lower.includes("infection") ||
      lower.includes("dermatitis") ||
      lower.includes("psoriasis")
    ) {
      return this.medicalDisclaimerResponse(params.locale);
    }

    if (!apiKey) {
      return this.fallbackAdvisorResponse(params);
    }

    try {
      const productList = [
        ...params.activeTierData.morningSteps,
        ...params.activeTierData.eveningSteps,
      ]
        .map(
          (p) =>
            `- ${p.name.en} (${p.size}, ${(p.priceMinor / 100).toFixed(0)} AED): ${p.shortBenefit.en}`,
        )
        .join("\n");

      const systemPrompt = `You are a private luxury beauty consultant for IOMA Paris Dubai.
Tone: LUXURY, EDITORIAL, SCIENTIFIC, CALM, TRUSTWORTHY, PERSONALIZED.
You speak fluent French luxury skincare maison style, adapted to ${params.locale === "ar" ? "Arabic" : params.locale === "fr" ? "French" : "English"}.

CLIENT CONTEXT:
- Skin Type: ${params.skinProfile.skinType}
- Hydration Tendency: ${params.skinProfile.hydrationTendency}
- Top Priority: ${params.skinProfile.priorities[0]?.title.en || "Hydration"}
- Dubai AC Exposure: ${params.skinProfile.climateContext.acExposure}
- Current Client Products: ${JSON.stringify(params.skinProfile.currentRoutine)}
- Active Routine Tier: ${params.activeTierData.tier.toUpperCase()} (${(params.activeTierData.totalPriceMinor / 100).toFixed(0)} AED total)

RECOMMENDED REAL IOMA PRODUCTS:
${productList}

RULES:
1. ONLY recommend real products listed above. Never invent products, clinical percentages, or fake prices.
2. If client asks about keeping their existing products (like a cleanser, retinol, or Vitamin C), give intelligent, encouraging advice on how to layer them synergistically with their IOMA ritual.
3. If client asks to simplify or reduce budget, recommend focusing on the 3 core essentials (Cleanser + Targeted Serum + Moisturizer).
4. Strictly abide by cosmetic skincare boundaries. If client describes severe or medical skin issues, recommend an in-person session with a medical professional.
5. Answer in ${params.locale === "ar" ? "Arabic" : params.locale === "fr" ? "French" : "English"}.
6. Keep answers concise, elegant, and reassuring (2-4 paragraphs max).

Also return 3 short, contextual follow-up questions the client might ask next in the JSON response format:
{
  "message": "your elegant response string",
  "suggestedQuestions": ["Question 1", "Question 2", "Question 3"]
}`;

      const historyFormatted = params.chatHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: systemPrompt }],
              },
              ...historyFormatted,
              {
                role: "user",
                parts: [{ text: params.message }],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.3,
            },
          }),
        },
      );

      if (!response.ok) {
        return this.fallbackAdvisorResponse(params);
      }

      const data = (await response.json()) as any;
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) {
        return this.fallbackAdvisorResponse(params);
      }

      const parsed = JSON.parse(textOutput.trim());
      return {
        message: parsed.message || textOutput,
        suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
          ? parsed.suggestedQuestions.slice(0, 3)
          : this.defaultSuggestedQuestions(params.locale),
      };
    } catch (err) {
      this.logger.error("Error in AI Beauty Advisor response:", err);
      return this.fallbackAdvisorResponse(params);
    }
  }

  private medicalDisclaimerResponse(locale: "en" | "fr" | "ar"): AdvisorResponse {
    if (locale === "fr") {
      return {
        message:
          "En tant que conseiller cosmétique IOMA, je suis formé pour vous guider dans vos rituels de soin et votre confort cutané au quotidien. Les conditions dermatologiques médicales nécessitent l'avis attentif d'un dermatologue ou d'un médecin qualifié. Pour votre rituel de confort, nous vous invitons également à réserver une consultation personnalisée avec un expert IOMA dans l'un de nos instituts partenaires à Dubaï.",
        suggestedQuestions: [
          "Quels soins apaisants conviennent à ma peau ?",
          "Comment protéger ma peau de la climatisation ?",
          "Prendre rendez-vous en institut",
        ],
      };
    }
    if (locale === "ar") {
      return {
        message:
          "بصفتي مستشار تجميل من إيوما باريس، تقتصر إرشاداتي على العناية التجميلية اليومية وترطيب البشرة. الحالات والأمراض الجلدية الطبية تستوجب استشارة طبيب جلدية مختص. للحصول على تقييم تجميلي مباشر لروتينك، يمكنك أيضًا حجز موعد مع خبير إيوما في أحد مراكزنا الشريكة في دبي.",
        suggestedQuestions: [
          "ما هي أفضل المنتجات المهدئة لبشرتي؟",
          "كيف أحمي بشرتي من جفاف التكييف؟",
          "حجز استشارة في المركز",
        ],
      };
    }
    return {
      message:
        "As your IOMA beauty consultant, I provide personalized cosmetic skincare guidance. Clinical dermatological conditions require the expertise of a licensed healthcare professional. For cosmetic comfort, you can also book a private consultation with an IOMA skin expert at one of our partner institutes in Dubai.",
      suggestedQuestions: [
        "Which calming products suit my skin best?",
        "How do I counter indoor AC dehydration?",
        "Book an in-institute consultation",
      ],
    };
  }

  private fallbackAdvisorResponse(params: AskAdvisorParams): AdvisorResponse {
    const topProd =
      params.activeTierData.morningSteps[1] || params.activeTierData.morningSteps[0];
    const prodName = topProd ? topProd.name[params.locale] : "IOMA";

    if (params.locale === "fr") {
      return {
        message: `Votre rituel ${params.activeTierData.tier.toUpperCase()} a été spécialement conçu pour répondre à votre besoin prioritaire : ${params.skinProfile.priorities[0]?.title.fr || "l'hydratation"}. Le soin ${prodName} agit en profondeur pour protéger votre épiderme de la climatisation et préserver l'équilibre naturel de votre peau. Vous pouvez tout à fait conserver votre nettoyant actuel et intégrer ces soins en toute sécurité.`,
        suggestedQuestions: [
          "Pourquoi ce sérum en particulier ?",
          "Puis-je l'utiliser avec du rétinol ?",
          "Comment simplifier mon rituel ?",
        ],
      };
    }
    if (params.locale === "ar") {
      return {
        message: `تم تصميم روتينك (${params.activeTierData.tier.toUpperCase()}) خصيصًا لتلبية احتياج بشرتك الأهم: ${params.skinProfile.priorities[0]?.title.ar || "الترطيب"}. يعمل مستحضر ${prodName} بفعالية لمواجهة جفاف التكييف المستمر في دبي وحماية مرونة البشرة. يمكنكِ الحفاظ على غسولك المعتاد ودمج هذه المنتجات بكل سهولة.`,
        suggestedQuestions: [
          "لماذا تم اختيار هذا السيروم بالتحديد؟",
          "هل يمكن استخدامه مع الريتينول؟",
          "كيف أبسط خطوات الروتين؟",
        ],
      };
    }
    return {
      message: `Your ${params.activeTierData.tier.toUpperCase()} ritual is formulated to address your primary focus: ${params.skinProfile.priorities[0]?.title.en || "Hydration"}. The ${prodName} works synergistically to counter Dubai's indoor AC dehydration while strengthening your cutaneous barrier. You can comfortably maintain your current gentle cleanser alongside this routine.`,
      suggestedQuestions: [
        "Why was this serum selected?",
        "Can I use this with my retinol?",
        "How can I simplify my routine?",
      ],
    };
  }

  defaultSuggestedQuestions(locale: "en" | "fr" | "ar"): string[] {
    if (locale === "fr") {
      return [
        "Pourquoi cette routine a-t-elle été choisie ?",
        "Puis-je l'associer à mon rétinol ?",
        "Proposez-moi une routine sous 500 AED",
      ];
    }
    if (locale === "ar") {
      return [
        "لماذا تم اختيار هذا الروتين بالتحديد؟",
        "هل يمكن دمجه مع فيتامين سي والريتينول؟",
        "اقترح روتينًا بميزانية أقل من 500 درهم",
      ];
    }
    return [
      "Why was this routine selected?",
      "Can I use this with my retinol?",
      "Build a routine under 500 AED",
    ];
  }
}
