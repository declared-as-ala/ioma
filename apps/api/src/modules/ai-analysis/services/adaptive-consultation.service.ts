import { Injectable } from "@nestjs/common";
import type {
  AdaptiveQuestion,
  CurrentSkincareRoutine,
  DubaiClimateContext,
  SkinPriority,
  SkinProfile,
  VisionObservations,
} from "@ioma/types";
import type {
  BudgetPreference,
  RoutineComplexityPreference,
  SkinType,
} from "@ioma/config";

export interface ConsultationAnswersInput {
  answers: { questionKey: string; value: string | string[] }[];
  routineText?: string;
  budgetPreference?: BudgetPreference;
  routinePreference?: RoutineComplexityPreference;
}

@Injectable()
export class AdaptiveConsultationService {
  /**
   * Generates 3-7 contextual consultation questions tailored to the visual skin observations.
   */
  generateQuestions(
    observations: VisionObservations | null | undefined,
    detectedSkinType: SkinType = "combination",
  ): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    const hydrationScore = observations?.hydrationAppearance?.score ?? 50;
    const rednessScore = observations?.rednessAppearance?.score ?? 45;
    const pigmentationScore = observations?.pigmentationAppearance?.score ?? 30;

    // 1. Contextual Hydration & Barrier question
    if (hydrationScore < 70) {
      questions.push({
        id: "q_hydration_tightness",
        questionKey: "tightnessAfterCleansing",
        category: "hydration",
        title: {
          en: "How does your skin feel within 10 minutes after cleansing?",
          fr: "Comment ressentez-vous votre peau dans les 10 minutes suivant le nettoyage ?",
          ar: "كيف تشعر بشرتك خلال 10 دقائق بعد تنظيفها بالماء أو الغسول؟",
        },
        subtitle: {
          en: "Our vision AI detected subtle surface dehydration markers.",
          fr: "Notre IA visuelle a détecté de légers marqueurs de déshydratation en surface.",
          ar: "اكتشف الذكاء الاصطناعي البصري علامات جفاف سطحية طفيفة.",
        },
        type: "single",
        options: [
          {
            value: "very_tight",
            label: {
              en: "Tight, uncomfortable or slightly dry",
              fr: "Tiraillements, inconfort ou légère sécheresse",
              ar: "شد أو جفاف ملحوظ وغير مريح",
            },
          },
          {
            value: "comfortable",
            label: {
              en: "Comfortable and balanced",
              fr: "Confortable et équilibrée",
              ar: "مريحة ومتوازنة",
            },
          },
          {
            value: "oily_quickly",
            label: {
              en: "Quickly develops shine",
              fr: "Brille rapidement",
              ar: "تبدأ باللمعان سريعًا",
            },
          },
        ],
        contextReason: {
          en: "Helps calibrate whether your skin needs deep humectant replenishment or lipid barrier reinforcement.",
          fr: "Permet de calibrer le besoin en hydratation profonde ou en renfort de la barrière lipidique.",
          ar: "يساعد في تحديد ما إذا كانت بشرتك تحتاج إلى ترطيب عميق أو تعزيز حاجز الحماية.",
        },
      });
    }

    // 2. Sensitivity or Redness question if redness is detected
    if (rednessScore > 40 || detectedSkinType === "sensitive") {
      questions.push({
        id: "q_sensitivity_triggers",
        questionKey: "sensitivityTriggers",
        category: "sensitivity",
        title: {
          en: "Does your skin easily flush or react to temperature shifts?",
          fr: "Votre peau rougit-elle facilement face aux variations de température ?",
          ar: "هل تصاب بشرتك بالاحمرار أو التهيج بسهولة عند تغير درجات الحرارة؟",
        },
        type: "single",
        options: [
          {
            value: "frequent_reactivity",
            label: {
              en: "Frequently reacts to heat, AC, or active ingredients",
              fr: "Réagit fréquemment à la chaleur, la climatisation ou aux actifs",
              ar: "تتفاعل كثيرًا مع الحرارة والتكييف أو المكونات النشطة",
            },
          },
          {
            value: "mild_transient",
            label: {
              en: "Occasional mild flushing that calms quickly",
              fr: "Rougeurs légères et passagères qui s'apaisent vite",
              ar: "احمرار خفيف وعابر يهدأ سريعًا",
            },
          },
          {
            value: "resilient",
            label: {
              en: "Very resilient, rarely feels irritated",
              fr: "Très résistante, rarement irritée",
              ar: "مرنة جدًا ونادرًا ما تتهيج",
            },
          },
        ],
      });
    }

    // 3. Pigmentation / Sun spots question if detected
    if (pigmentationScore > 35) {
      questions.push({
        id: "q_pigmentation_history",
        questionKey: "pigmentationHistory",
        category: "goals",
        title: {
          en: "Have these tone variations appeared recently or over time?",
          fr: "Ces variations de teint sont-elles récentes ou installées depuis longtemps ?",
          ar: "هل ظهرت هذه التصبغات أو البقع حديثاً أم أنها موجودة منذ فترة طويلة؟",
        },
        type: "single",
        options: [
          {
            value: "recent_sun",
            label: {
              en: "Appeared recently following intense sun or outdoor exposure",
              fr: "Apparues récemment après une exposition solaire intense",
              ar: "ظهرت حديثًا بعد التعرض القوي للشمس في الخارج",
            },
          },
          {
            value: "long_term",
            label: {
              en: "Long-standing spots requiring gentle brightening",
              fr: "Taches anciennes nécessitant un éclaircissement doux",
              ar: "بقع قديمة وثابتة تحتاج إلى تفتيح لطيف وتوحيد للون",
            },
          },
          {
            value: "post_blemish",
            label: {
              en: "Marks left after past blemishes or irritation",
              fr: "Marques résiduelles après d'anciennes imperfections",
              ar: "آثار متبقية بعد بثور أو تهيجات سابقة",
            },
          },
        ],
      });
    }

    // 4. Current Skincare Routine (Natural Language Input)
    questions.push({
      id: "q_current_routine",
      questionKey: "currentRoutineProducts",
      category: "routine",
      title: {
        en: "What products do you currently use in your daily ritual?",
        fr: "Quels soins utilisez-vous actuellement dans votre rituel quotidien ?",
        ar: "ما هي المنتجات التي تستخدمينها حاليًا في روتينك اليومي؟",
      },
      subtitle: {
        en: "Tell us about your cleanser, active serums (Vitamin C, retinol, AHA/BHA), moisturizer, or SPF.",
        fr: "Indiquez votre nettoyant, sérums actifs (Vitamine C, rétinol, AHA/BHA), crème ou protection solaire.",
        ar: "أخبرينا عن الغسول، السيرومات الفعالة (فيتامين سي، ريتينول، أحماض)، المرطب، أو واقي الشمس.",
      },
      type: "text",
      placeholder: {
        en: "e.g., CeraVe gentle cleanser, Vitamin C serum in morning, Retinol 2x a week, daily SPF 50...",
        fr: "ex: Nettoyant doux CeraVe, Sérum Vitamine C le matin, Rétinol 2x par semaine, SPF 50...",
        ar: "مثال: غسول سيرافي اللطيف، سيروم فيتامين سي صباحًا، ريتينول مرتين أسبوعيًا، واقي شمس يومي...",
      },
      contextReason: {
        en: "We respect your current favourites and build your IOMA ritual synergistically around them.",
        fr: "Nous respectons vos soins favoris et construisons votre rituel IOMA en parfaite synergie.",
        ar: "نحترم منتجاتك المفضلة الحالية ونبني روتين إيوما بتناغم تام معها دون الحاجة لاستبدال كل شيء.",
      },
    });

    // 5. Dubai Climate & AC Exposure
    questions.push({
      id: "q_climate_ac",
      questionKey: "acAndSunExposure",
      category: "climate",
      title: {
        en: "How much of your day is spent in air-conditioned environments?",
        fr: "Combien de temps passez-vous quotidiennement en environnement climatisé ?",
        ar: "كم تقضين من يومك في بيئات مكيفة الهواء في دبي؟",
      },
      type: "single",
      options: [
        {
          value: "high",
          label: {
            en: "Most of the day (> 8 hours in home/office AC)",
            fr: "La majeure partie de la journée (> 8h en climatisation)",
            ar: "معظم اليوم (أكثر من 8 ساعات في تكييف المنزل أو المكتب)",
          },
        },
        {
          value: "moderate",
          label: {
            en: "Balanced indoor/outdoor exposure (4-8 hours)",
            fr: "Équilibré entre intérieur et extérieur (4-8h)",
            ar: "متوازن بين الأماكن المغلقة والمفتوحة (4-8 ساعات)",
          },
        },
        {
          value: "low",
          label: {
            en: "Frequent outdoor or naturally ventilated spaces",
            fr: "Espaces extérieurs ou aération naturelle fréquente",
            ar: "في الهواء الطلق أو أماكن جيدة التهوية الطبيعية",
          },
        },
      ],
    });

    // 6. Primary Skincare Goal
    questions.push({
      id: "q_primary_goal",
      questionKey: "primaryGoal",
      category: "goals",
      title: {
        en: "What is your primary skincare priority right now?",
        fr: "Quelle est votre priorité beauté principale en ce moment ?",
        ar: "ما هو هدفك الأساسي والأكثر أهمية لبشرتك حاليًا؟",
      },
      type: "single",
      options: [
        {
          value: "dehydration",
          label: {
            en: "Intense Hydration & Moisture Barrier Support",
            fr: "Hydratation intense et renfort de la barrière cutanée",
            ar: "ترطيب مكثف ودعم حاجز الرطوبة الطبيعي",
          },
        },
        {
          value: "fatigue-dullness",
          label: {
            en: "Radiance, Energy & Countering Urban Fatigue",
            fr: "Éclat, vitalité et lutte contre la fatigue urbaine",
            ar: "إشراقة ونضارة ومكافحة مظهر التعب والإرهاق",
          },
        },
        {
          value: "first-signs-of-aging",
          label: {
            en: "Firmness, Elasticity & Smoothing Fine Lines",
            fr: "Fermeté, élasticité et lissage des premières ridules",
            ar: "شد البشرة وتعزيز المرونة وتنعيم الخطوط التعبيرية",
          },
        },
        {
          value: "sensitivity",
          label: {
            en: "Calming Comfort & Reducing Redness",
            fr: "Apaisement, confort et réduction des rougeurs",
            ar: "تهدئة البشرة والراحة وتقليل الاحمرار والتحسس",
          },
        },
        {
          value: "shine-control",
          label: {
            en: "Refined Pores & Mattifying Shine Control",
            fr: "Pores resserrés et contrôle matifiant de la brillance",
            ar: "تنقية المسام والتحكم باللمعان والتوازن",
          },
        },
        {
          value: "dark-spots",
          label: {
            en: "Even Skin Tone & Targeting Dark Spots",
            fr: "Unification du teint et atténuation des taches pigmentaires",
            ar: "توحيد لون البشرة وتفتيح البقع الداكنة",
          },
        },
      ],
    });

    // 7. Routine Complexity & Budget Preference
    questions.push({
      id: "q_routine_complexity",
      questionKey: "routineComplexity",
      category: "routine",
      title: {
        en: "What kind of skincare ritual fits your daily lifestyle?",
        fr: "Quel type de rituel correspond à votre rythme de vie ?",
        ar: "ما نوع الروتين الذي يناسب نمط حياتك اليومي؟",
      },
      type: "single",
      options: [
        {
          value: "essential",
          label: {
            en: "Essential (3 core products — fast and focused)",
            fr: "Essentiel (3 soins clés — rapide et ciblé)",
            ar: "أساسي (3 منتجات رئيسية — سريع وفعال)",
          },
        },
        {
          value: "balanced",
          label: {
            en: "Balanced Complete (4-5 products — optimal performance)",
            fr: "Complet Équilibré (4-5 soins — performance optimale)",
            ar: "متكامل ومتوازن (4-5 منتجات — أداء مثالي)",
          },
        },
        {
          value: "complete",
          label: {
            en: "Haute Skincare Ritual (5-7 products — luxury comprehensive care)",
            fr: "Haute Cosmétique (5-7 soins — soin global luxueux)",
            ar: "طقوس فاخرة متكاملة (5-7 منتجات — عناية شاملة وفائقة)",
          },
        },
      ],
    });

    return questions;
  }

  /**
   * Parses natural language routine descriptions into a structured object.
   */
  parseRoutineText(text?: string): CurrentSkincareRoutine {
    if (!text || text.trim().length === 0) {
      return { rawText: "", preservedProducts: [] };
    }

    const lower = text.toLowerCase();
    const preserved: string[] = [];

    const hasCleanser =
      lower.includes("cleanser") ||
      lower.includes("gel") ||
      lower.includes("foam") ||
      lower.includes("nettoyant") ||
      lower.includes("cerave") ||
      lower.includes("cetaphil") ||
      lower.includes("غسول");

    if (hasCleanser) {
      preserved.push("Current Gentle Cleanser");
    }

    const hasVitC =
      lower.includes("vitamin c") ||
      lower.includes("vitamine c") ||
      lower.includes("vit c") ||
      lower.includes("ascorbic") ||
      lower.includes("فيتامين سي");

    if (hasVitC) {
      preserved.push("Morning Vitamin C");
    }

    const hasRetinol =
      lower.includes("retinol") ||
      lower.includes("retinoid") ||
      lower.includes("tretinoin") ||
      lower.includes("rétinol") ||
      lower.includes("ريتينول");

    if (hasRetinol) {
      preserved.push("Evening Retinoid Treatment");
    }

    const hasSPF =
      lower.includes("spf") ||
      lower.includes("sunscreen") ||
      lower.includes("sun") ||
      lower.includes("solaire") ||
      lower.includes("واقي");

    if (hasSPF) {
      preserved.push("Daily High-Protection SPF");
    }

    return {
      cleanser: hasCleanser ? text.slice(0, 80) : undefined,
      vitaminC: hasVitC,
      retinoid: hasRetinol,
      exfoliant:
        lower.includes("aha") ||
        lower.includes("bha") ||
        lower.includes("glycolic") ||
        lower.includes("salicylic") ||
        lower.includes("acid") ||
        lower.includes("acide") ||
        lower.includes("تقشير"),
      sunscreen: hasSPF,
      moisturizer:
        lower.includes("cream") ||
        lower.includes("moisturizer") ||
        lower.includes("crème") ||
        lower.includes("lotion") ||
        lower.includes("مرطب")
          ? text.slice(0, 80)
          : undefined,
      rawText: text.trim(),
      preservedProducts: preserved,
    };
  }

  /**
   * Synthesizes all inputs into the final structured SkinProfile.
   */
  buildSkinProfile(
    observations: VisionObservations,
    detectedSkinType: SkinType,
    inputs: ConsultationAnswersInput,
  ): SkinProfile {
    const answerMap = new Map<string, string | string[]>();
    for (const ans of inputs.answers) {
      answerMap.set(ans.questionKey, ans.value);
    }

    const tightness = answerMap.get("tightnessAfterCleansing") as string | undefined;
    const sensitivityTrigger = answerMap.get("sensitivityTriggers") as string | undefined;
    const acExposure =
      (answerMap.get("acAndSunExposure") as "low" | "moderate" | "high") || "high";
    const primaryGoal = (answerMap.get("primaryGoal") as string) || "dehydration";

    const currentRoutine = this.parseRoutineText(inputs.routineText);

    // Determine final skin type considering answers
    let skinType = detectedSkinType;
    if (tightness === "very_tight" && skinType !== "dry") {
      skinType = skinType === "oily" ? "combination" : "dry";
    }
    if (sensitivityTrigger === "frequent_reactivity") {
      skinType = "sensitive";
    }

    const climateContext: DubaiClimateContext = {
      acExposure,
      sunExposure: "moderate",
      heatSensitivity: sensitivityTrigger === "frequent_reactivity" ? "high" : "moderate",
      frequentTravel: false,
      tightnessInAC: acExposure === "high" || tightness === "very_tight",
    };

    // Calculate ranked priorities (01 to 04)
    const priorities = this.rankPriorities(
      observations,
      primaryGoal,
      skinType,
      acExposure,
    );

    const expertSummary = this.generateExpertSummary(
      skinType,
      priorities,
      currentRoutine,
      climateContext,
    );

    return {
      skinType,
      hydrationTendency:
        observations.hydrationAppearance.score < 45 || tightness === "very_tight"
          ? "Dehydrated under Gulf AC"
          : "Balanced",
      sensitivityLevel:
        skinType === "sensitive" || observations.rednessAppearance.score > 55
          ? "high"
          : observations.rednessAppearance.score > 40
            ? "moderate"
            : "low",
      priorities,
      goals: [primaryGoal],
      currentRoutine,
      climateContext,
      routinePreference: inputs.routinePreference || "balanced",
      budgetPreference: inputs.budgetPreference || "no_preference",
      confidence: 0.94,
      expertConsultationSummary: expertSummary,
    };
  }

  private generateExpertSummary(
    skinType: SkinType,
    priorities: SkinPriority[],
    currentRoutine: CurrentSkincareRoutine,
    climate: DubaiClimateContext,
  ): { en: string; fr: string; ar: string } {
    const p1 = priorities[0]?.title.en || "Hydration";
    const hasRetinol = currentRoutine.retinoid;
    const hasCleanser = currentRoutine.cleanser;

    const enRetinolNote = hasRetinol
      ? " We have calibrated your ritual to seamlessly layer with your evening retinoid."
      : "";
    const frRetinolNote = hasRetinol
      ? " Nous avons calibré votre rituel pour s'associer parfaitement à votre rétinol du soir."
      : "";
    const arRetinolNote = hasRetinol
      ? " تم تصميم الروتين ليتناغم تمامًا مع استخدامك للريتينول المسائي."
      : "";

    const enCleanserNote = hasCleanser
      ? " You can comfortably keep your current cleanser while we focus on the treatment serums and barrier creams."
      : "";
    const frCleanserNote = hasCleanser
      ? " Vous pouvez tout à fait conserver votre nettoyant habituel ; nous concentrons l'action sur les sérums experts et la crème barrière."
      : "";
    const arCleanserNote = hasCleanser
      ? " يمكنكِ الاحتفاظ بغسولكِ المعتاد بينما نركز على السيرومات العلاجية وكريم الحماية."
      : "";

    return {
      en: `Your skin exhibits a ${skinType} profile with a primary focus on ${p1}.${enCleanserNote}${enRetinolNote} Under continuous Dubai AC conditions, our recommendation prioritizes cellular water infusion and lipid mantle protection.`,
      fr: `Votre peau présente un profil ${skinType} avec une priorité essentielle axée sur ${priorities[0]?.title.fr || "l'hydratation"}.${frCleanserNote}${frRetinolNote} Face à la climatisation continue de Dubaï, notre recommandation privilégie l'infusion d'eau cellulaire et le renfort lipidique.`,
      ar: `تُظهر بشرتكِ نمطاً ${skinType === "dry" ? "جافاً" : skinType === "oily" ? "دهنياً" : skinType === "sensitive" ? "حساساً" : "مختلطاً"} مع أولوية قصوى لـ ${priorities[0]?.title.ar || "الترطيب"}.${arCleanserNote}${arRetinolNote} لمواجهة جفاف التكييف المستمر في دبي، نركز على تغذية الخلايا بالماء وحماية الغشاء الدهني الطبيعي.`,
    };
  }

  private rankPriorities(
    observations: VisionObservations,
    primaryGoal: string,
    skinType: SkinType,
    acExposure: "low" | "moderate" | "high",
  ): SkinPriority[] {
    const list: {
      id: string;
      score: number;
      titleEn: string;
      titleFr: string;
      titleAr: string;
      rationaleEn: string;
      rationaleFr: string;
      rationaleAr: string;
      targetVisualConcern: string;
    }[] = [];

    // Hydration priority
    const hydraNeed =
      100 -
      observations.hydrationAppearance.score +
      (acExposure === "high" ? 25 : 10) +
      (primaryGoal === "dehydration" ? 40 : 0);
    list.push({
      id: "hydration",
      score: hydraNeed,
      titleEn: "Deep Cutaneous Hydration",
      titleFr: "Hydratation Cutanée Profonde",
      titleAr: "الترطيب الجلدي العميق",
      rationaleEn:
        "Restores cellular water balance and prevents moisture loss caused by constant indoor air conditioning.",
      rationaleFr:
        "Restaure l'équilibre hydrique cellulaire et prévient l'évaporation causée par la climatisation continue.",
      rationaleAr:
        "يستعيد التوازن المائي للخلايا ويمنع فقدان الرطوبة الناتج عن التكييف المستمر.",
      targetVisualConcern: "hydrationAppearance",
    });

    // Barrier & Sensitivity
    const barrierNeed =
      observations.rednessAppearance.score +
      (skinType === "sensitive" ? 40 : 0) +
      (primaryGoal === "sensitivity" ? 45 : 0);
    list.push({
      id: "barrier_soothing",
      score: barrierNeed,
      titleEn: "Barrier Fortification & Calming",
      titleFr: "Renfort de la Barrière & Apaisement",
      titleAr: "تقوية حاجز البشرة والتهدئة",
      rationaleEn:
        "Reinforces the hydrolipidic film to shield against environmental reactivity and temperature shock.",
      rationaleFr:
        "Renforce le film hydrolipidique pour protéger contre la réactivité environnementale et les chocs thermiques.",
      rationaleAr:
        "يعزز الغشاء الدهني المائي للحماية من التحسس البيئي والصدمات الحرارية.",
      targetVisualConcern: "rednessAppearance",
    });

    // Radiance & Energy
    const radianceNeed =
      100 -
      observations.radianceAppearance.score +
      (primaryGoal === "fatigue-dullness" ? 45 : 10);
    list.push({
      id: "radiance_vitality",
      score: radianceNeed,
      titleEn: "Radiance & Cellular Energy",
      titleFr: "Éclat & Vitalité Cellulaire",
      titleAr: "الإشراقة والحيوية الخلوية",
      rationaleEn:
        "Revitalizes microcirculation and provides active anti-fatigue antioxidants.",
      rationaleFr:
        "Revitalise la microcirculation et apporte des antioxydants énergisants anti-fatigue.",
      rationaleAr:
        "ينشط الدورة الدموية الدقيقة ويوفر مضادات أكسدة فعالة لمكافحة مظهر الإجهاد.",
      targetVisualConcern: "radianceAppearance",
    });

    // Firmness & Youth Renewal
    const renewNeed =
      observations.fineLinesAppearance.score +
      (primaryGoal === "first-signs-of-aging" ? 50 : 15);
    list.push({
      id: "renewal_firmness",
      score: renewNeed,
      titleEn: "Firmness & Preventive Renewal",
      titleFr: "Fermeté & Renouvellement Préventif",
      titleAr: "الشد والتجديد الوقائي",
      rationaleEn:
        "Supports collagen synthesis and strengthens skin elasticity across dynamic expression lines.",
      rationaleFr:
        "Soutient la synthèse de collagène et raffermit l'élasticité cutanée sur les zones d'expression.",
      rationaleAr: "يدعم إنتاج الكولاجين ويعزز مرونة الجلد على خطوط التعبير.",
      targetVisualConcern: "fineLinesAppearance",
    });

    // Pores & Balance
    const matteNeed =
      observations.visiblePores.score +
      (skinType === "oily" ? 35 : 0) +
      (primaryGoal === "shine-control" || primaryGoal === "blemishes" ? 45 : 0);
    list.push({
      id: "clarity_refinement",
      score: matteNeed,
      titleEn: "Pore Refinement & Clarity",
      titleFr: "Affinement des Pores & Pureté",
      titleAr: "تنقية المسام وتحسين الملمس",
      rationaleEn:
        "Regulates sebum flow and clarifies the cutaneous micro-relief without drying.",
      rationaleFr: "Régule le sébum et clarifie le micro-relief sans assécher.",
      rationaleAr: "ينظم الإفرازات الدهنية وينقي الملمس الدقيق للبشرة دون أن يجففها.",
      targetVisualConcern: "visiblePores",
    });

    list.sort((a, b) => b.score - a.score);

    return list.slice(0, 4).map((item, idx) => ({
      id: item.id,
      rank: idx + 1,
      title: { en: item.titleEn, fr: item.titleFr, ar: item.titleAr },
      rationale: { en: item.rationaleEn, fr: item.rationaleFr, ar: item.rationaleAr },
      targetVisualConcern: item.targetVisualConcern,
    }));
  }
}
