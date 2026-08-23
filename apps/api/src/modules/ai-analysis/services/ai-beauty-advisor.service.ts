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

    if (apiKey) {
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
4. Strictly abide by cosmetic skincare boundaries.
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

        // Try gemini-1.5-flash or gemini-2.0-flash
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                temperature: 0.4,
              },
            }),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textOutput) {
            const parsed = JSON.parse(textOutput.trim());
            return {
              message: parsed.message || textOutput,
              suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
                ? parsed.suggestedQuestions.slice(0, 3)
                : this.defaultSuggestedQuestions(params.locale),
            };
          }
        }
      } catch (err) {
        this.logger.warn("Live Gemini API call failed, using intelligent contextual fallback", err);
      }
    }

    return this.fallbackAdvisorResponse(params);
  }

  private medicalDisclaimerResponse(locale: "en" | "fr" | "ar"): AdvisorResponse {
    if (locale === "fr") {
      return {
        message:
          "En tant que conseiller cosmétique IOMA Paris, je suis formé pour vous guider dans vos rituels de soin et le confort de votre peau au quotidien. Les conditions dermatologiques médicales nécessitent l'avis attentif d'un dermatologue qualifié. Pour votre rituel de confort et d'hydratation, nous vous invitons également à réserver une consultation personnalisée avec un expert IOMA dans l'un de nos instituts partenaires à Dubaï.",
        suggestedQuestions: [
          "Quels soins apaisants conviennent à ma peau ?",
          "Comment protéger ma peau de la climatisation ?",
          "Prendre rendez-vous en institut à Dubaï",
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
    const q = params.message.toLowerCase();
    const topSerum = params.activeTierData.morningSteps.find((s) =>
      s.name.en.toLowerCase().includes("serum"),
    ) || params.activeTierData.morningSteps[1] || params.activeTierData.morningSteps[0];
    const topCream = params.activeTierData.morningSteps.find((s) =>
      s.name.en.toLowerCase().includes("cream") || s.name.en.toLowerCase().includes("crème"),
    ) || params.activeTierData.eveningSteps[1] || params.activeTierData.eveningSteps[0];

    const serumName = topSerum?.name[params.locale] || "Sérum IOMA";
    const creamName = topCream?.name[params.locale] || "Crème IOMA";

    // 1. Questions regarding Retinol / AHA / Actives
    if (q.includes("retinol") || q.includes("rétinol") || q.includes("actif") || q.includes("vitamin c") || q.includes("acide")) {
      if (params.locale === "fr") {
        return {
          message: `Vous pouvez tout à fait associer votre rétinol ou vitamine C à ce protocole IOMA ! Nous vous conseillons d'appliquer d'abord le **${serumName}** sur peau propre, d'attendre 10 à 15 minutes, puis d'appliquer votre actif. Terminez impérativement par la **${creamName}** pour restaurer le film lipidique et prévenir tout risque d'irritation sous la climatisation.`,
          suggestedQuestions: [
            "Quelle est la fréquence recommandée le soir ?",
            "Puis-je appliquer une protection UV le matin ?",
            "Comment simplifier mon rituel ?",
          ],
        };
      }
      if (params.locale === "ar") {
        return {
          message: `نعم، يمكنكِ بالتأكيد دمج الريتينول أو فيتامين سي مع هذا الروتين! ننصح بتطبيق **${serumName}** أولاً على بشرة نظيفة لترطيبها، ثم الانتظار لمدة 10 دقائق قبل وضع الريتينول. بعد ذلك، طبقي **${creamName}** لتهدئة البشرة وحمايتها من الجفاف.`,
          suggestedQuestions: [
            "كم مرة أستخدم الريتينول أسبوعيًا؟",
            "هل أحتاج واقي شمس صباحًا؟",
            "كيف أبسط خطوات الروتين؟",
          ],
        };
      }
      return {
        message: `You can seamlessly layer retinol or Vitamin C with your IOMA ritual! We recommend applying **${serumName}** first on cleansed skin to infuse hydration. Allow 10 minutes to absorb, then apply your active. Finish with **${creamName}** to lock in moisture and protect your lipid barrier against Dubai's dry AC environment.`,
        suggestedQuestions: [
          "What is the ideal evening application order?",
          "Can I use Vitamin C in the morning?",
          "How do I prevent sensitivity?",
        ],
      };
    }

    // 2. Questions regarding Budget, Price, or Simplification
    if (q.includes("budget") || q.includes("prix") || q.includes("cher") || q.includes("price") || q.includes("cost") || q.includes("aed") || q.includes("simplif") || q.includes("moins")) {
      const essentialPrice = (params.activeTierData.totalPriceMinor / 100).toFixed(0);
      if (params.locale === "fr") {
        return {
          message: `Pour optimiser votre investissement tout en garantissant des résultats cliniques optimaux, nous vous conseillons de vous concentrer sur le trio fondamental : le Nettoyant Doux, le **${serumName}** (hautement concentré en principes actifs) et la **${creamName}**. Ce rituel essentiel permet de traiter votre priorité cutanée tout en maîtrisant votre budget.`,
          suggestedQuestions: [
            "Quelle est la durée moyenne d'un flacon ?",
            "Puis-je commencer par le rituel Essentiel ?",
            "Quels sont les résultats après 28 jours ?",
          ],
        };
      }
      if (params.locale === "ar") {
        return {
          message: `للحصول على أفضل النتائج بأفضل ميزانية، ننصحكِ بالتركيز على المنتجات الأساسية: الغسول اليومي، **${serumName}** المركز، و**${creamName}**. هذا الثلاثي يمنح بشرتك كل ما تحتاجه من ترطيب وتغذية فعالة بميزانية مناسبة.`,
          suggestedQuestions: [
            "كم تدوم عبوة المنتج عادة؟",
            "هل أبدأ بالروتين الأساسي أولاً؟",
            "ما هي النتائج المتوقعة بعد 4 أسابيع؟",
          ],
        };
      }
      return {
        message: `To optimize your skincare investment while securing visible clinical results, you can focus on the core essentials: your daily cleanser, **${serumName}** (the high-potency corrective step), and **${creamName}**. This targeted trio directly tackles your primary skin concern within a focused budget.`,
        suggestedQuestions: [
          "How long does each product last?",
          "Can I switch to the Essential tier?",
          "What results can I expect in 28 days?",
        ],
      };
    }

    // 3. Questions regarding Application Order / Routine Steps
    if (q.includes("ordre") || q.includes("order") || q.includes("step") || q.includes("étape") || q.includes("matin") || q.includes("soir") || q.includes("morning") || q.includes("night") || q.includes("apply") || q.includes("appliquer")) {
      if (params.locale === "fr") {
        return {
          message: `Voici l'ordre d'application idéal recommandé par les laboratoires IOMA Paris :\n\n1. **Nettoyage doux** matin et soir sur visage humide.\n2. **${serumName}** (2 à 3 gouttes) par légers effleurages de l'intérieur vers l'extérieur du visage.\n3. **${creamName}** en effectuant de légers massages ascendants pour sceller les actifs.\n4. **Protection UV** le matin avant toute exposition extérieure.`,
          suggestedQuestions: [
            "Combien de temps entre le sérum et la crème ?",
            "Puis-je appliquer le sérum sur le contour des yeux ?",
            "Faut-il masser ou tapoter ?",
          ],
        };
      }
      if (params.locale === "ar") {
        return {
          message: `إليكِ الترتيب المثالي لتطبيق المنتجات حسب إرشادات خبراء إيوما باريس:\n\n1. **تنظيف البشرة** صباحًا ومساءً بغسول لطيف.\n2. **${serumName}** (قطرتان إلى 3 قطرات) وتوزيعه بلطف على الوجه والرقبة.\n3. **${creamName}** بحركات مساج خفيفة للأعلى لتثبيت الترطيب.\n4. **واقي الشمس** صباحًا قبل الخروج.`,
          suggestedQuestions: [
            "كم دقيقة أنتظر بين السيروم والكريم؟",
            "هل يمكن استخدام السيروم حول العينين؟",
            "كيف أحمي بشرتي ليلاً؟",
          ],
        };
      }
      return {
        message: `Here is the optimal application order crafted by IOMA Paris scientists:\n\n1. **Gentle Cleansing** morning and evening on damp skin.\n2. **${serumName}** (2-3 drops) applied with gentle smoothing motions from center outwards.\n3. **${creamName}** massaged upward to lock in active ingredients.\n4. **Sun Protection (SPF)** in the morning before stepping outdoors.`,
        suggestedQuestions: [
          "How long should I wait between serum and moisturizer?",
          "Can I apply the serum around the eye area?",
          "Should I pat or massage the cream?",
        ],
      };
    }

    // 4. Default Personalized Consultation Response
    if (params.locale === "fr") {
      return {
        message: `Votre rituel ${params.activeTierData.tier.toUpperCase()} a été formulé avec une précision chirurgicale pour votre profil (${params.skinProfile.skinType}, ${params.skinProfile.priorities[0]?.title.fr || "Hydratation"}). Le **${serumName}** apporte une concentration ciblée en peptides et actifs biotechnologiques, tandis que la **${creamName}** forme un bouclier protecteur contre le dessèchement causé par la climatisation à Dubaï.`,
        suggestedQuestions: [
          "Pourquoi cette formule en particulier ?",
          "Puis-je l'associer à mon nettoyant actuel ?",
          "Comment adapter mon soin selon la météo ?",
        ],
      };
    }
    if (params.locale === "ar") {
      return {
        message: `تم اختيار روتين (${params.activeTierData.tier.toUpperCase()}) بدقة فائقة لتلبية احتياجات بشرتك (${params.skinProfile.skinType}، ${params.skinProfile.priorities[0]?.title.ar || "الترطيب"}). يعمل **${serumName}** على تغذية خلايا البشرة بعمق، بينما يقوم **${creamName}** بحماية الحاجز الجلدي من تأثير التكييف الجاف في دبي.`,
        suggestedQuestions: [
          "لماذا تم اختيار هذه التركيبة تحديداً؟",
          "هل يمكن دمجها مع غسولي الحالي؟",
          "كيف أعدل الروتين بحسب الطقس؟",
        ],
      };
    }
    return {
      message: `Your ${params.activeTierData.tier.toUpperCase()} ritual is formulated with scientific precision for your profile (${params.skinProfile.skinType}, ${params.skinProfile.priorities[0]?.title.en || "Hydration"}). The **${serumName}** delivers concentrated peptide complexes, while the **${creamName}** forms a biomimetic barrier against indoor AC dehydration in the UAE.`,
      suggestedQuestions: [
        "Why was this exact formulation selected?",
        "Can I keep using my current cleanser?",
        "How do I adjust my routine with seasonal changes?",
      ],
    };
  }

  defaultSuggestedQuestions(locale: "en" | "fr" | "ar"): string[] {
    if (locale === "fr") {
      return [
        "Pourquoi cette routine a-t-elle été choisie ?",
        "Puis-je l'associer à mon rétinol ou vitamine C ?",
        "Comment simplifier mon rituel ?",
      ];
    }
    if (locale === "ar") {
      return [
        "لماذا تم اختيار هذا الروتين بالتحديد؟",
        "هل يمكن دمجه مع الريتينول وفيتامين سي؟",
        "كيف أبسط خطوات الروتين؟",
      ];
    }
    return [
      "Why was this routine selected for my skin?",
      "Can I use this alongside my retinol or Vitamin C?",
      "How can I simplify my routine?",
    ];
  }
}
