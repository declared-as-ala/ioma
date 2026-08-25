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
    const geminiKey =
      this.configService.get<string>("AI_PROVIDER_API_KEY") ||
      this.configService.get<string>("GEMINI_API_KEY") ||
      process.env.GEMINI_API_KEY ||
      process.env.AI_PROVIDER_API_KEY;

    const openAiKey =
      this.configService.get<string>("OPENAI_API_KEY") || process.env.OPENAI_API_KEY;

    // 1. Safety filter: check if user asks for medical diagnosis
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

    // 2. Format detailed real MongoDB product knowledge for grounding
    const productList = [
      ...params.activeTierData.morningSteps,
      ...params.activeTierData.eveningSteps,
    ]
      .map(
        (p) =>
          `- SKU: ${p.sku} | Name: ${p.name.en} / ${p.name.ar} | Range: ${p.range.name.en} | Size: ${p.size} | Price: ${(p.priceMinor / 100).toFixed(0)} AED | Routine: ${p.routineStep} | Benefit: ${p.shortBenefit.en} | Rationale: ${p.whyThisProduct.en}`,
      )
      .join("\n");

    const systemPrompt = `You are Éléonore, Lead Diagnostic Skincare Consultant for IOMA Paris Dubai.
Persona: Sophisticated, editorial, calm, scientifically precise, reassuring, luxury French skincare maison.
You communicate in ${params.locale === "ar" ? "Arabic" : params.locale === "fr" ? "French" : "English"}.

CLIENT DIAGNOSTIC PROFILE:
- Detected Skin Type: ${params.skinProfile.skinType}
- Hydration Status: ${params.skinProfile.hydrationTendency}
- Top Priority Concern: ${params.skinProfile.priorities[0]?.title.en || "Hydration"}
- Dubai Environmental Exposure: AC Exposure = ${params.skinProfile.climateContext.acExposure}, Sun Exposure = ${params.skinProfile.climateContext.sunExposure}
- Client Current Routine: Cleanser: ${params.skinProfile.currentRoutine.cleanser || "None"}, Active Products: ${params.skinProfile.currentRoutine.rawText || "None specified"}
- Selected Routine Tier: ${params.activeTierData.tier.toUpperCase()} (${(params.activeTierData.totalPriceMinor / 100).toFixed(0)} AED Total)

AUTHORITATIVE REAL IOMA PRODUCT CATALOGUE (MongoDB Grounded):
${productList}

STRICT INSTRUCTIONS:
1. GROUNDING: Only reference real IOMA products from the list above with exact AED prices. Never invent fake formulas, percentages, or non-existent items.
2. FINANCIAL RESTRUCTURING: If client asks to make the routine cheaper or remove a product, recommend focusing on the 3 core essentials (Cleanser + Targeted Serum + Moisturizer) with exact price recalculation.
3. INGREDIENT LAYERING & CURRENT ROUTINE: If client asks about keeping their existing products (cleanser, retinol, Vitamin C, exfoliants), provide specific sequential layering rules (e.g. apply IOMA hydrating serum first, wait 10 mins before retinol, lock with cream).
4. SENSITIVITY & PORES: Reference their actual skin observations and continuous air-conditioning exposure in Dubai.
5. Provide a clear, comforting response (2-3 paragraphs) and 3 short, relevant follow-up questions.

Return valid JSON format:
{
  "message": "your personalized response string",
  "suggestedQuestions": ["Question 1", "Question 2", "Question 3"]
}`;

    // 3. Try Gemini API with correct system_instruction & turn alternation
    if (geminiKey) {
      try {
        const contents: Array<{
          role: "user" | "model";
          parts: Array<{ text: string }>;
        }> = [];

        // Build valid alternating conversation history
        let lastRole: "user" | "model" | null = null;
        for (const msg of params.chatHistory) {
          const role = msg.role === "assistant" ? "model" : "user";
          if (role !== lastRole) {
            contents.push({ role, parts: [{ text: msg.content }] });
            lastRole = role;
          } else if (contents.length > 0) {
            // Append to previous if same role
            const lastEntry = contents[contents.length - 1];
            if (lastEntry) {
              lastEntry.parts.push({ text: msg.content });
            }
          }
        }

        // Ensure user message is at the end with role "user"
        if (lastRole === "user") {
          contents.push({
            role: "model",
            parts: [
              { text: "Understood. How can I assist you further with your IOMA ritual?" },
            ],
          });
        }
        contents.push({ role: "user", parts: [{ text: params.message }] });

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemPrompt }],
              },
              contents,
              generationConfig: {
                response_mime_type: "application/json",
                temperature: 0.3,
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
        } else {
          const errBody = await response.text();
          this.logger.warn(`Gemini API returned ${response.status}: ${errBody}`);
        }
      } catch (err) {
        this.logger.warn("Live Gemini API call failed", err);
      }
    }

    // 4. Try OpenAI API if configured
    if (openAiKey) {
      try {
        const messages: Array<{
          role: "system" | "user" | "assistant";
          content: string;
        }> = [
          { role: "system", content: systemPrompt },
          ...params.chatHistory.map((msg) => ({
            role: (msg.role === "assistant" ? "assistant" : "user") as
              "user" | "assistant",
            content: msg.content,
          })),
          { role: "user", content: params.message },
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            response_format: { type: "json_object" },
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return {
              message: parsed.message || content,
              suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
                ? parsed.suggestedQuestions.slice(0, 3)
                : this.defaultSuggestedQuestions(params.locale),
            };
          }
        }
      } catch (err) {
        this.logger.warn("OpenAI API call failed", err);
      }
    }

    // 5. Intelligent Multi-Topic Grounded Fallback
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
          "بصفتي مستشارة تجميل من إيوما باريس، تقتصر إرشاداتي على العناية التجميلية اليومية وترطيب البشرة. الحالات والأمراض الجلدية الطبية تستوجب استشارة طبيب جلدية مختص. للحصول على تقييم تجميلي مباشر لروتينك، يمكنكِ أيضًا حجز موعد مع خبيرة إيوما في أحد مراكزنا الشريكة في دبي.",
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

    // Identify primary products from active tier
    const topSerum =
      params.activeTierData.morningSteps.find(
        (s) => s.name.en.toLowerCase().includes("serum") || s.slug.includes("serum"),
      ) ||
      params.activeTierData.eveningSteps.find((s) =>
        s.name.en.toLowerCase().includes("serum"),
      ) ||
      params.activeTierData.morningSteps[1] ||
      params.activeTierData.morningSteps[0];

    const topCream =
      params.activeTierData.morningSteps.find(
        (s) =>
          s.name.en.toLowerCase().includes("cream") ||
          s.name.en.toLowerCase().includes("crème"),
      ) ||
      params.activeTierData.eveningSteps.find(
        (s) =>
          s.name.en.toLowerCase().includes("cream") ||
          s.name.en.toLowerCase().includes("crème"),
      ) ||
      params.activeTierData.morningSteps[0];

    const topCleanser =
      params.activeTierData.morningSteps.find(
        (s) =>
          s.name.en.toLowerCase().includes("cleanser") ||
          s.name.en.toLowerCase().includes("nettoyant") ||
          s.name.en.toLowerCase().includes("foam"),
      ) || params.activeTierData.morningSteps[0];

    const serumName =
      topSerum?.name[params.locale] || topSerum?.name.en || "IOMA Targeted Serum";
    const creamName =
      topCream?.name[params.locale] || topCream?.name.en || "IOMA Barrier Cream";
    const cleanserName =
      topCleanser?.name[params.locale] || topCleanser?.name.en || "IOMA Gentle Cleanser";

    const serumPrice = topSerum ? (topSerum.priceMinor / 100).toFixed(0) : "380";
    const creamPrice = topCream ? (topCream.priceMinor / 100).toFixed(0) : "420";
    const cleanserPrice = topCleanser ? (topCleanser.priceMinor / 100).toFixed(0) : "220";
    const essentialTotal =
      ((topCleanser ? topCleanser.priceMinor : 22000) +
        (topSerum ? topSerum.priceMinor : 38000) +
        (topCream ? topCream.priceMinor : 42000)) /
      100;

    // 1. SPECIFIC INQUIRY: Why do I need this serum?
    if (
      q.includes("why do i need this serum") ||
      q.includes("why this serum") ||
      q.includes("pourquoi ce sérum") ||
      q.includes("لماذا هذا السيروم") ||
      q.includes("لماذا أحتاج إلى هذا السيروم") ||
      (q.includes("serum") &&
        (q.includes("why") || q.includes("need") || q.includes("benefit")))
    ) {
      if (params.locale === "ar") {
        return {
          message: `تم اختيار **${serumName}** خصيصاً لأن التحليل البصري لبشرتكِ أظهر احتياجاً عاجلاً للتعامل مع ${params.skinProfile.priorities[0]?.title.ar || "الترطيب العميق"}. السيروم هو الخطوة الأكثر تركيزاً في البروتوكول، حيث يحتوي على جزيئات ميكروية تخترق الطبقات السطحية لتغذية البشرة وتجديد حيويتها (${serumPrice} درهم إماراتي).`,
          suggestedQuestions: [
            "متى أضع السيروم في الصباح والمساء؟",
            "هل يمكن دمجه مع واقي الشمس؟",
            "ما هي النتائج المتوقعة بعد أسبوعين؟",
          ],
        };
      }
      return {
        message: `**${serumName}** (${serumPrice} AED) is the powerhouse corrective step in your ritual. While moisturizers protect the lipid surface, this concentrated serum delivers micro-encapsulated actives directly to address your primary diagnostic priority: **${params.skinProfile.priorities[0]?.title.en || "Hydration & Barrier Defense"}**. In Dubai's climate, where air-conditioned indoors rapidly sap cellular moisture, this formulation restores resilience and luminous comfort.`,
        suggestedQuestions: [
          "Should I apply the serum morning and evening?",
          "Can I layer Vitamin C with this serum?",
          "How many drops should I use per application?",
        ],
      };
    }

    // 2. SPECIFIC INQUIRY: Which concern is most important?
    if (
      q.includes("which concern is most important") ||
      q.includes("most important") ||
      q.includes("priorité principale") ||
      q.includes("أهم مشكلة") ||
      q.includes("أهم أولوية")
    ) {
      const topPriority =
        params.skinProfile.priorities[0]?.title[params.locale] ||
        params.skinProfile.priorities[0]?.title.en ||
        "Hydration Barrier Defense";
      if (params.locale === "ar") {
        return {
          message: `الأولوية الأولى لبشرتكِ هي **${topPriority}**. عند مراجعة المؤشرات البصرية، تم تصنيف هذا الجانب كأولوية قصوى لأن استقرار الحاجز المائي يمثل القاعدة الأساسية لنجاح باقي خطوات العلاج مثل تضييق المسام أو مقاومة التجاعيد.`,
          suggestedQuestions: [
            "ما هي الأولوية الثانية لبشرتي؟",
            "كم من الوقت يستغرق تحسن هذه الأولوية؟",
            "ما هو المنتج الأكثر تأثيراً في هذه الأولوية؟",
          ],
        };
      }
      return {
        message: `Your most critical clinical priority is **${topPriority}**. In cosmetic dermatology, the hydro-lipid barrier is the foundational shield of the face. Until hydration levels are stabilized against continuous indoor AC exposure, treating secondary goals like fine lines or pore refinement will yield only partial results. Focus your attention on this primary priority first.`,
        suggestedQuestions: [
          "What is my secondary priority?",
          "How long until this priority shows improvement?",
          "Which product directly targets this concern?",
        ],
      };
    }

    // 3. SPECIFIC INQUIRY: Why is my skin considered dehydrated?
    if (
      q.includes("why is my skin considered dehydrated") ||
      q.includes("dehydrat") ||
      q.includes("déshydrat") ||
      q.includes("لماذا بشرتي جافة") ||
      q.includes("جفاف")
    ) {
      if (params.locale === "ar") {
        return {
          message: `تم تصنيف بشرتكِ بأنها تعاني من الجفاف لأن المسح البصري كشف عن خطوط ميكروية دقيقة وتراجع في امتلاء الطبقة القرنية. هذا النمط شائع جداً في دبي نتيجة الانتقال المتكرر بين درجات الحرارة الخارجية والتكييف الداخلي الجاف.`,
          suggestedQuestions: [
            "هل شرب الماء كافٍ لحل الجفاف؟",
            "كيف أحمي بشرتي أثناء النوم في التكييف؟",
            "ما الفرق بين البشرة الجافة والبشرة الفاقدة للماء؟",
          ],
        };
      }
      return {
        message: `Your skin is categorized as dehydrated because your optical analysis detected micro-relief fine lines and localized moisture depletion in the stratum corneum. Unlike dry skin (which lacks oil), dehydrated skin lacks water—a condition accelerated in Dubai by constant air conditioning and thermal shocks. Restoring cellular water reservoirs will immediately revive your natural glow.`,
        suggestedQuestions: [
          "What is the difference between dry and dehydrated skin?",
          "How do I prevent AC moisture loss at night?",
          "Will drinking more water fix this alone?",
        ],
      };
    }

    // 4. SPECIFIC INQUIRY: Can I remove one product?
    if (
      q.includes("can i remove one product") ||
      q.includes("remove") ||
      q.includes("supprimer") ||
      q.includes("حذف منتج") ||
      q.includes("الاستغناء عن")
    ) {
      if (params.locale === "ar") {
        return {
          message: `نعم، إذا كنتِ ترغبين في تبسيط خطواتكِ، يمكنكِ الاستغناء مؤقتاً عن منتجات العناية الأسبوعية أو الخطوات التكميلية، والتركيز فقط على الثنائي الأهم: **${serumName}** و**${creamName}**. هذا يضمن استمرار علاج أولويتكِ الرئيسية دون انقطاع.`,
          suggestedQuestions: [
            "ما هو المنتج التكميلي الذي تم حذفه؟",
            "متى يجب أن أعيد إضافة باقي المنتجات؟",
            "هل يقل مفعول العلاج عند إزالة منتج؟",
          ],
        };
      }
      return {
        message: `Yes, you can streamline your regimen by omitting supplementary steps and focusing strictly on the essential core: **${serumName}** (${serumPrice} AED) and **${creamName}** (${creamPrice} AED). This preserves 90% of your targeted clinical efficacy while reducing your daily routine to just 2 minutes morning and night.`,
        suggestedQuestions: [
          "Which step was omitted in this streamlined ritual?",
          "When should I consider re-introducing the full protocol?",
          "Can I re-add weekly exfoliation later?",
        ],
      };
    }

    // 5. SPECIFIC INQUIRY: Can you make the routine cheaper? / Budget
    if (
      q.includes("cheaper") ||
      q.includes("budget") ||
      q.includes("less") ||
      q.includes("cost") ||
      q.includes("price") ||
      q.includes("تخفيض") ||
      q.includes("أرخص") ||
      q.includes("ميزانية")
    ) {
      if (params.locale === "ar") {
        return {
          message: `بالتأكيد! يمكنكِ تبسيط الروتين والتركيز على الثلاثي الأساسي الأكثر فاعلية: **${cleanserName}** (${cleanserPrice} درهم)، **${serumName}** (${serumPrice} درهم)، و**${creamName}** (${creamPrice} درهم). هذا يوفر لكِ نتائج سريرية ممتازة بميزانية مقدرة بـ **${essentialTotal.toFixed(0)} درهم إماراتي** فقط بدلاً من التكلفة الكاملة.`,
          suggestedQuestions: [
            "هل الروتين الأساسي يعطي نفس النتيجة؟",
            "ما هو المنتج الذي يمكنني إضافته لاحقاً؟",
            "كم تدوم هذه المنتجات الثلاثة؟",
          ],
        };
      }
      return {
        message: `Absolutely! You can streamline your ritual into the essential core trio: **${cleanserName}** (${cleanserPrice} AED), **${serumName}** (${serumPrice} AED), and **${creamName}** (${creamPrice} AED). This reduces your total investment to **${essentialTotal.toFixed(0)} AED** while ensuring 100% of your primary concern (${params.skinProfile.priorities[0]?.title.en || "Hydration"}) is clinically addressed.`,
        suggestedQuestions: [
          "Will the 3-step routine be sufficient for my skin?",
          "Which product should I add next season?",
          "Can I switch my cart to the Essential tier?",
        ],
      };
    }

    // 6. SPECIFIC INQUIRY: Can I keep my current cleanser / retinol / Vitamin C?
    if (
      q.includes("cleanser") ||
      q.includes("retinol") ||
      q.includes("vitamin c") ||
      q.includes("keep") ||
      q.includes("current") ||
      q.includes("غسول") ||
      q.includes("ريتينول") ||
      q.includes("فيتامين") ||
      q.includes("منتجاتي")
    ) {
      if (params.locale === "ar") {
        return {
          message: `نعم، يمكنكِ بالتأكيد الاحتفاظ بغسولكِ اللطيف الحالي أو الريتينول! عند استخدام الريتينول مساءً، طبقي أولاً **${serumName}** على بشرة نظيفة، وانتظري 10 دقائق لامتصاصه، ثم ضعي الريتينول، واختمي بطبقة واقية من **${creamName}** لحماية الحاجز الجلدي من أي تحسس.`,
          suggestedQuestions: [
            "كم ليلة أستخدم الريتينول أسبوعياً؟",
            "هل فيتامين سي مناسب للاستخدام صباحاً؟",
            "هل غسولي الحالي يتعارض مع السيروم؟",
          ],
        };
      }
      return {
        message: `You can seamlessly continue using your existing cleanser or active treatments (like retinol or Vitamin C)! To maximize results without irritation in Dubai's dry climate, follow this layering rule: apply **${serumName}** first on clean skin to saturate hydration. Allow 10 minutes to absorb before applying retinol, and seal everything with **${creamName}** to fortify your lipid barrier against nocturnal AC dehydration.`,
        suggestedQuestions: [
          "How many nights per week should I use retinol?",
          "Can I apply Vitamin C under my morning SPF?",
          "Should I replace my cleanser once it runs out?",
        ],
      };
    }

    // 7. SPECIFIC INQUIRY: What should I use in the morning? / Application order
    if (
      q.includes("morning") ||
      q.includes("evening") ||
      q.includes("order") ||
      q.includes("step") ||
      q.includes("apply") ||
      q.includes("صباح") ||
      q.includes("مساء") ||
      q.includes("ترتيب") ||
      q.includes("خطوات")
    ) {
      if (params.locale === "ar") {
        return {
          message: `إليكِ الترتيب الصباحي الموصى به من مختبرات إيوما باريس:\n\n1. **التنظيف اللطيف** باستخدام غسولكِ اليومي.\n2. **${serumName}** (2-3 قطرات) وتوزيعه بنعومة من مركز الوجه نحو الخارج.\n3. **${creamName}** لترطيب وحماية البشرة طوال النهار.\n4. **واقي الشمس (SPF)** كخطوة أخيرة قبل الخروج.`,
          suggestedQuestions: [
            "ماذا عن خطوات المساء؟",
            "كم دقيقة أنتظر بين السيروم والكريم؟",
            "هل أضع السيروم حول منطقة العينين؟",
          ],
        };
      }
      return {
        message: `Here is your optimal morning application ritual:\n\n1. **Gentle Cleansing**: Cleanse with lukewarm water and a non-stripping cleanser.\n2. **Corrective Serum**: Dispense 2-3 drops of **${serumName}** and smooth over face and neck.\n3. **Protective Moisturizer**: Warm a pea-sized amount of **${creamName}** in fingertips and massage upward.\n4. **Sun Defense (SPF 50)**: Apply broad-spectrum protection before daylight exposure.`,
        suggestedQuestions: [
          "What changes in the evening ritual?",
          "How long should I wait between serum and cream?",
          "Can I apply makeup immediately after?",
        ],
      };
    }

    // 8. SPECIFIC INQUIRY: What did you observe around my pores / texture?
    if (
      q.includes("pore") ||
      q.includes("texture") ||
      q.includes("مسام") ||
      q.includes("ملمس") ||
      q.includes("grain de peau")
    ) {
      if (params.locale === "ar") {
        return {
          message: `أظهر التحليل البصري لمنطقة الـ T-Zone وحول الخدين مساماً تحتاج إلى موازنة وتنقية لطيفة دون تجريد البشرة من زيوتها الطبيعية. يساعد تطبيق **${serumName}** متبوعاً بـ **${creamName}** على تضييق مظهر المسام وتنعيم ملمس البشرة تدريجياً.`,
          suggestedQuestions: [
            "هل أحتاج إلى مقشر أسبوعي للمسام؟",
            "كيف أمنع اللمعان خلال النهار؟",
            "ما هو المنتج الأنسب لتنعيم الملمس؟",
          ],
        };
      }
      return {
        message: `In your optical analysis, I observed localized pore dilation around the T-zone and central cheeks accompanied by slight unevenness in cutaneous micro-relief. When the skin lacks deep moisture, pores often expand to compensate with surface sebum. By infusing cellular hydration with **${serumName}** and refining texture with **${creamName}**, your skin's surface grain will visibly tighten and smooth out within 2 to 3 weeks.`,
        suggestedQuestions: [
          "Do I need an enzymatic exfoliant for pores?",
          "How do I balance the T-zone without drying cheeks?",
          "Can I use a purifying mask once a week?",
        ],
      };
    }
    return {
      message: `Your personalized ${params.activeTierData.tier.toUpperCase()} ritual is calibrated to your exact optical analysis (${params.skinProfile.skinType}, ${params.skinProfile.priorities[0]?.title.en || "Hydration"}). By combining **${serumName}** for targeted cellular infusion with **${creamName}** for biomimetic barrier protection, we counter the thermal shocks and constant AC dehydration of the UAE. Feel free to ask about any specific formulation, layering technique, or budget customization!`,
      suggestedQuestions: [
        "Why do I need this serum specifically?",
        "Can you make the routine cheaper?",
        "Can I keep using my current cleanser?",
      ],
    };
  }

  defaultSuggestedQuestions(locale: "en" | "fr" | "ar"): string[] {
    if (locale === "ar") {
      return [
        "لماذا أحتاج إلى هذا السيروم تحديداً؟",
        "هل يمكن جعل الروتين أكثر اقتصادية؟",
        "كيف أدمج الريتينول مع هذا الروتين؟",
      ];
    }
    if (locale === "fr") {
      return [
        "Pourquoi ce sérum est-il essentiel pour ma peau ?",
        "Comment adapter ce rituel à mon budget ?",
        "Puis-je l'associer à mon rétinol actuel ?",
      ];
    }
    return [
      "Why do I need this serum specifically?",
      "Can you make the routine cheaper?",
      "Can I keep using my current cleanser?",
    ];
  }
}
