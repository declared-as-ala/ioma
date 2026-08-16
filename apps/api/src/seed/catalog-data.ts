/**
 * Demo/seed catalog data. IOMA Paris has not yet supplied real SKUs,
 * pricing, or INCI ingredient lists for the Dubai launch catalogue — this
 * data exists so the full commerce engine (PLP/PDP/cart/checkout/tax math)
 * is real and functional end to end, per CLAUDE.md's "build the real
 * interface against a documented mock, log the gap" rule. Logged in
 * CLIENT_REQUIREMENTS.md. Product names/positioning are grounded in the
 * charter's 7 real ranges and the concern angles already approved for the
 * homepage (see apps/web/messages/*.json "Home.ranges"); prices are
 * illustrative AED figures, not client-confirmed retail prices; ingredient
 * lists are explicitly marked pending real INCI data rather than invented.
 */
import type { ProductRangeKey } from "@ioma/config";

interface LocalizedText {
  en: string;
  fr: string;
  ar: string;
}

const PENDING_INGREDIENTS: LocalizedText = {
  en: "Full INCI ingredient list to be supplied by IOMA Paris.",
  fr: "Liste INCI complète à fournir par IOMA Paris.",
  ar: "سيتم توفير القائمة الكاملة لمكونات INCI من قِبل IOMA Paris.",
};

export const RANGE_SEED: {
  slug: ProductRangeKey;
  name: LocalizedText;
  description: LocalizedText;
}[] = [
  {
    slug: "hydra",
    name: { en: "Hydra", fr: "Hydra", ar: "هيدرا" },
    description: {
      en: "Lasting hydration for skin that feels tight or dull.",
      fr: "Une hydratation durable pour les peaux qui tiraillent ou manquent d'éclat.",
      ar: "ترطيب طويل الأمد للبشرة التي تشعر بالشد أو تفتقر للحيوية.",
    },
  },
  {
    slug: "energize",
    name: { en: "Energize", fr: "Energize", ar: "إنرجايز" },
    description: {
      en: "Radiance and vitality for tired-looking skin.",
      fr: "Éclat et vitalité pour les peaux fatiguées.",
      ar: "إشراقة وحيوية للبشرة التي تبدو متعبة.",
    },
  },
  {
    slug: "renew",
    name: { en: "Renew", fr: "Renew", ar: "رينيو" },
    description: {
      en: "Firmness for the first signs of time.",
      fr: "Fermeté pour les premiers signes du temps.",
      ar: "شد ونضارة للتعامل مع أولى علامات التقدم في السن.",
    },
  },
  {
    slug: "calm",
    name: { en: "Calm", fr: "Calm", ar: "كالم" },
    description: {
      en: "Comfort for reactive, sensitive skin.",
      fr: "Confort pour les peaux réactives et sensibles.",
      ar: "راحة للبشرة الحساسة وسريعة التفاعل.",
    },
  },
  {
    slug: "purete",
    name: { en: "Pureté", fr: "Pureté", ar: "بوريتيه" },
    description: {
      en: "Purifying clarity for oily, blemish-prone skin.",
      fr: "Clarté purifiante pour les peaux grasses sujettes aux imperfections.",
      ar: "نقاء منقٍّ للبشرة الدهنية المعرضة للشوائب.",
    },
  },
  {
    slug: "matte",
    name: { en: "Matte", fr: "Matte", ar: "مات" },
    description: {
      en: "Balance and shine control for oily skin.",
      fr: "Équilibre et contrôle de la brillance pour les peaux grasses.",
      ar: "توازن وتحكم في اللمعان للبشرة الدهنية.",
    },
  },
  {
    slug: "illumine",
    name: { en: "Illumine", fr: "Illumine", ar: "إيلومين" },
    description: {
      en: "Even tone against dark spots.",
      fr: "Un teint uniforme contre les taches pigmentaires.",
      ar: "توحيد لون البشرة لمواجهة البقع الداكنة.",
    },
  },
];

export const CATEGORY_SEED: { slug: string; name: LocalizedText }[] = [
  { slug: "serums", name: { en: "Serums", fr: "Sérums", ar: "سيروم" } },
  { slug: "creams", name: { en: "Creams", fr: "Crèmes", ar: "كريمات" } },
  { slug: "cleansers", name: { en: "Cleansers", fr: "Nettoyants", ar: "منظفات" } },
];

export const CONCERN_SEED: {
  slug: string;
  name: LocalizedText;
  icon: string;
  range: ProductRangeKey;
}[] = [
  {
    slug: "dehydration",
    name: { en: "Dehydration", fr: "Déshydratation", ar: "الجفاف" },
    icon: "droplet",
    range: "hydra",
  },
  {
    slug: "fatigue-dullness",
    name: {
      en: "Fatigue & dullness",
      fr: "Fatigue et teint terne",
      ar: "التعب وبهتان البشرة",
    },
    icon: "sun",
    range: "energize",
  },
  {
    slug: "first-signs-of-aging",
    name: {
      en: "First signs of aging",
      fr: "Premiers signes de l'âge",
      ar: "علامات التقدم في السن الأولى",
    },
    icon: "sparkles",
    range: "renew",
  },
  {
    slug: "sensitivity",
    name: { en: "Sensitivity", fr: "Sensibilité", ar: "الحساسية" },
    icon: "leaf",
    range: "calm",
  },
  {
    slug: "blemishes",
    name: { en: "Blemishes", fr: "Imperfections", ar: "الشوائب" },
    icon: "shield",
    range: "purete",
  },
  {
    slug: "shine-control",
    name: { en: "Shine control", fr: "Contrôle de la brillance", ar: "التحكم باللمعان" },
    icon: "wind",
    range: "matte",
  },
  {
    slug: "dark-spots",
    name: { en: "Dark spots", fr: "Taches pigmentaires", ar: "البقع الداكنة" },
    icon: "circle-dot",
    range: "illumine",
  },
];

interface VariantSeed {
  size: string;
  b2cPriceMinor: number;
}

interface ProductSeed {
  slug: string;
  range: ProductRangeKey;
  category: string;
  concern: string;
  name: LocalizedText;
  shortBenefit: LocalizedText;
  description: LocalizedText;
  howToUse: LocalizedText;
  routineStep: "morning" | "evening" | "both";
  variants: VariantSeed[];
}

export const PRODUCT_SEED: ProductSeed[] = [
  {
    slug: "hydra-serum-intense",
    range: "hydra",
    category: "serums",
    concern: "dehydration",
    name: {
      en: "Hydra Intense Serum",
      fr: "Sérum Hydra Intense",
      ar: "سيروم هيدرا المكثف",
    },
    shortBenefit: {
      en: "A concentrated dose of lasting hydration.",
      fr: "Une dose concentrée d'hydratation durable.",
      ar: "جرعة مركزة من الترطيب طويل الأمد.",
    },
    description: {
      en: "A lightweight, fast-absorbing serum formulated for skin that feels tight or dehydrated throughout the day. Layers under your Hydra routine to restore comfort.",
      fr: "Un sérum léger à absorption rapide conçu pour les peaux qui tiraillent ou se déshydratent au fil de la journée. Se superpose à votre routine Hydra pour restaurer le confort.",
      ar: "سيروم خفيف سريع الامتصاص مصمم للبشرة التي تشعر بالشد أو الجفاف خلال اليوم. يُستخدم ضمن روتين هيدرا لاستعادة الراحة.",
    },
    howToUse: {
      en: "Apply morning and evening on cleansed skin before your moisturizer.",
      fr: "Appliquer matin et soir sur peau nettoyée, avant votre crème.",
      ar: "يُستخدم صباحًا ومساءً على بشرة نظيفة قبل الكريم المرطب.",
    },
    routineStep: "both",
    variants: [
      { size: "30ml", b2cPriceMinor: 38000 },
      { size: "50ml", b2cPriceMinor: 52000 },
    ],
  },
  {
    slug: "hydra-creme-riche",
    range: "hydra",
    category: "creams",
    concern: "dehydration",
    name: { en: "Hydra Rich Cream", fr: "Crème Hydra Riche", ar: "كريم هيدرا الغني" },
    shortBenefit: {
      en: "Comfort that lasts from morning to night.",
      fr: "Un confort qui dure du matin au soir.",
      ar: "راحة تدوم من الصباح حتى المساء.",
    },
    description: {
      en: "A rich, enveloping cream that reinforces the skin's moisture barrier — the finishing step of the Hydra routine for skin that needs more than a serum alone.",
      fr: "Une crème riche et enveloppante qui renforce la barrière hydrolipidique — l'étape finale de la routine Hydra pour les peaux qui ont besoin de plus qu'un sérum seul.",
      ar: "كريم غني يعزز حاجز رطوبة البشرة — الخطوة الأخيرة في روتين هيدرا للبشرة التي تحتاج إلى أكثر من السيروم وحده.",
    },
    howToUse: {
      en: "Smooth over face and neck as the last step of your morning or evening routine.",
      fr: "Lisser sur le visage et le cou en dernière étape de votre routine matin ou soir.",
      ar: "يُوزّع على الوجه والرقبة كخطوة أخيرة في روتين الصباح أو المساء.",
    },
    routineStep: "both",
    variants: [
      { size: "50ml", b2cPriceMinor: 32000 },
      { size: "100ml", b2cPriceMinor: 48000 },
    ],
  },
  {
    slug: "energize-serum-vitalite",
    range: "energize",
    category: "serums",
    concern: "fatigue-dullness",
    name: {
      en: "Energize Vitality Serum",
      fr: "Sérum Energize Vitalité",
      ar: "سيروم إنرجايز للحيوية",
    },
    shortBenefit: {
      en: "A morning boost for tired-looking skin.",
      fr: "Un coup d'éclat matinal pour les peaux fatiguées.",
      ar: "دفعة صباحية للبشرة التي تبدو متعبة.",
    },
    description: {
      en: "A radiance-focused serum designed to counter the dull, tired look brought on by heat, air conditioning, and short sleep — Dubai's real everyday skin conditions.",
      fr: "Un sérum axé sur l'éclat, conçu pour contrer le teint terne et fatigué causé par la chaleur, la climatisation et le manque de sommeil — les vraies conditions quotidiennes de la peau à Dubaï.",
      ar: "سيروم يركز على الإشراقة لمواجهة مظهر البشرة الباهت والمتعب الناتج عن الحرارة وتكييف الهواء وقلة النوم — وهي ظروف حقيقية تواجهها البشرة يوميًا في دبي.",
    },
    howToUse: {
      en: "Apply each morning on cleansed skin before your moisturizer and SPF.",
      fr: "Appliquer chaque matin sur peau nettoyée, avant votre crème et votre SPF.",
      ar: "يُستخدم كل صباح على بشرة نظيفة قبل الكريم المرطب وواقي الشمس.",
    },
    routineStep: "morning",
    variants: [{ size: "30ml", b2cPriceMinor: 39000 }],
  },
  {
    slug: "energize-creme-eclat",
    range: "energize",
    category: "creams",
    concern: "fatigue-dullness",
    name: {
      en: "Energize Radiance Cream",
      fr: "Crème Energize Éclat",
      ar: "كريم إنرجايز للإشراق",
    },
    shortBenefit: {
      en: "A light, radiance-boosting morning cream.",
      fr: "Une crème matinale légère qui booste l'éclat.",
      ar: "كريم صباحي خفيف يعزز إشراقة البشرة.",
    },
    description: {
      en: "A light-textured cream that finishes the Energize routine, leaving skin visibly awake without a heavy or greasy feel under makeup or SPF.",
      fr: "Une crème à la texture légère qui complète la routine Energize, laissant la peau visiblement réveillée sans effet gras ou lourd sous le maquillage ou le SPF.",
      ar: "كريم بقوام خفيف يُكمل روتين إنرجايز، ليمنح البشرة مظهرًا منتعشًا دون ثقل تحت المكياج أو واقي الشمس.",
    },
    howToUse: {
      en: "Apply each morning after your serum, before sun protection.",
      fr: "Appliquer chaque matin après votre sérum, avant la protection solaire.",
      ar: "يُستخدم كل صباح بعد السيروم وقبل واقي الشمس.",
    },
    routineStep: "morning",
    variants: [{ size: "50ml", b2cPriceMinor: 31000 }],
  },
  {
    slug: "renew-serum-fermete",
    range: "renew",
    category: "serums",
    concern: "first-signs-of-aging",
    name: {
      en: "Renew Firming Serum",
      fr: "Sérum Renew Fermeté",
      ar: "سيروم رينيو للشد",
    },
    shortBenefit: {
      en: "Firmness-focused care for the first signs of time.",
      fr: "Un soin ciblé fermeté pour les premiers signes du temps.",
      ar: "عناية مركزة على الشد لمواجهة أولى علامات التقدم في السن.",
    },
    description: {
      en: "An evening serum formulated for skin beginning to show its first fine lines and loss of firmness, working overnight alongside skin's natural renewal cycle.",
      fr: "Un sérum de nuit conçu pour les peaux qui commencent à montrer leurs premières ridules et un léger relâchement, agissant durant la nuit avec le cycle naturel de renouvellement de la peau.",
      ar: "سيروم ليلي مصمم للبشرة التي بدأت تظهر عليها أولى الخطوط الدقيقة وفقدان الشد، يعمل خلال الليل بالتوازي مع دورة التجدد الطبيعية للبشرة.",
    },
    howToUse: {
      en: "Apply each evening on cleansed skin before your night cream.",
      fr: "Appliquer chaque soir sur peau nettoyée, avant votre crème de nuit.",
      ar: "يُستخدم كل مساء على بشرة نظيفة قبل كريم الليل.",
    },
    routineStep: "evening",
    variants: [
      { size: "30ml", b2cPriceMinor: 42000 },
      { size: "50ml", b2cPriceMinor: 58000 },
    ],
  },
  {
    slug: "renew-creme-nuit",
    range: "renew",
    category: "creams",
    concern: "first-signs-of-aging",
    name: { en: "Renew Night Cream", fr: "Crème Renew Nuit", ar: "كريم رينيو الليلي" },
    shortBenefit: {
      en: "A restorative night cream for firmer-feeling skin.",
      fr: "Une crème de nuit réparatrice pour une peau plus ferme.",
      ar: "كريم ليلي مُجدِّد لبشرة تشعر بمزيد من الشد.",
    },
    description: {
      en: "A richer-textured night cream that seals in the Renew serum and supports skin through its overnight recovery.",
      fr: "Une crème de nuit à la texture plus riche qui scelle l'action du sérum Renew et accompagne la peau durant sa récupération nocturne.",
      ar: "كريم ليلي بقوام أكثر غنى يُثبّت مفعول سيروم رينيو ويدعم البشرة خلال عملية تجددها الليلي.",
    },
    howToUse: {
      en: "Apply each evening as the last step of your routine.",
      fr: "Appliquer chaque soir en dernière étape de votre routine.",
      ar: "يُستخدم كل مساء كخطوة أخيرة في روتين العناية.",
    },
    routineStep: "evening",
    variants: [{ size: "50ml", b2cPriceMinor: 36000 }],
  },
  {
    slug: "calm-serum-apaisant",
    range: "calm",
    category: "serums",
    concern: "sensitivity",
    name: {
      en: "Calm Soothing Serum",
      fr: "Sérum Calm Apaisant",
      ar: "سيروم كالم المهدئ",
    },
    shortBenefit: {
      en: "Immediate comfort for reactive skin.",
      fr: "Un confort immédiat pour les peaux réactives.",
      ar: "راحة فورية للبشرة سريعة التفاعل.",
    },
    description: {
      en: "A fragrance-conscious, gentle serum formulated to ease the tightness and reactivity common with sensitive skin, particularly under Dubai's air conditioning.",
      fr: "Un sérum doux et pensé pour minimiser les parfums, conçu pour apaiser les tiraillements et les réactions fréquentes sur peau sensible, notamment sous l'effet de la climatisation à Dubaï.",
      ar: "سيروم لطيف يراعي حساسية البشرة، مصمم لتهدئة الشد والتفاعل الشائعين لدى البشرة الحساسة، خصوصًا تحت تأثير تكييف الهواء في دبي.",
    },
    howToUse: {
      en: "Apply each evening on cleansed skin. Can also be used in the morning if needed.",
      fr: "Appliquer chaque soir sur peau nettoyée. Peut aussi s'utiliser le matin si besoin.",
      ar: "يُستخدم كل مساء على بشرة نظيفة، ويمكن استخدامه صباحًا أيضًا عند الحاجة.",
    },
    routineStep: "evening",
    variants: [{ size: "30ml", b2cPriceMinor: 37000 }],
  },
  {
    slug: "calm-creme-confort",
    range: "calm",
    category: "creams",
    concern: "sensitivity",
    name: { en: "Calm Comfort Cream", fr: "Crème Calm Confort", ar: "كريم كالم للراحة" },
    shortBenefit: {
      en: "A gentle everyday cream for sensitive skin.",
      fr: "Une crème douce du quotidien pour peau sensible.",
      ar: "كريم يومي لطيف للبشرة الحساسة.",
    },
    description: {
      en: "A minimalist, gentle cream formulated for daily use on reactive skin, morning and evening.",
      fr: "Une crème minimaliste et douce, formulée pour un usage quotidien sur peau réactive, matin et soir.",
      ar: "كريم بتركيبة بسيطة ولطيفة، مصمم للاستخدام اليومي على البشرة سريعة التفاعل، صباحًا ومساءً.",
    },
    howToUse: {
      en: "Apply morning and evening as the last step of your routine.",
      fr: "Appliquer matin et soir en dernière étape de votre routine.",
      ar: "يُستخدم صباحًا ومساءً كخطوة أخيرة في روتين العناية.",
    },
    routineStep: "both",
    variants: [{ size: "50ml", b2cPriceMinor: 29000 }],
  },
  {
    slug: "purete-serum-purifiant",
    range: "purete",
    category: "serums",
    concern: "blemishes",
    name: {
      en: "Pureté Purifying Serum",
      fr: "Sérum Pureté Purifiant",
      ar: "سيروم بوريتيه المنقّي",
    },
    shortBenefit: {
      en: "Purifying clarity for blemish-prone skin.",
      fr: "Une clarté purifiante pour les peaux à imperfections.",
      ar: "نقاء منقٍّ للبشرة المعرضة للشوائب.",
    },
    description: {
      en: "A lightweight, non-comedogenic serum for oily, blemish-prone skin, formulated to refine the look of pores and even skin texture over time.",
      fr: "Un sérum léger et non comédogène pour peaux grasses sujettes aux imperfections, conçu pour affiner l'aspect des pores et unifier le grain de peau dans le temps.",
      ar: "سيروم خفيف وغير مسبب لانسداد المسام، مخصص للبشرة الدهنية المعرضة للشوائب، ومصمم لتحسين مظهر المسام وتوحيد ملمس البشرة مع الوقت.",
    },
    howToUse: {
      en: "Apply each evening on cleansed skin.",
      fr: "Appliquer chaque soir sur peau nettoyée.",
      ar: "يُستخدم كل مساء على بشرة نظيفة.",
    },
    routineStep: "evening",
    variants: [{ size: "30ml", b2cPriceMinor: 36000 }],
  },
  {
    slug: "purete-gel-nettoyant",
    range: "purete",
    category: "cleansers",
    concern: "blemishes",
    name: {
      en: "Pureté Purifying Cleansing Gel",
      fr: "Gel Nettoyant Purifiant Pureté",
      ar: "جل بوريتيه المنظف والمنقّي",
    },
    shortBenefit: {
      en: "A daily cleanser that respects the skin barrier.",
      fr: "Un nettoyant quotidien qui respecte la barrière cutanée.",
      ar: "منظف يومي يحافظ على حاجز البشرة.",
    },
    description: {
      en: "A foaming gel cleanser that removes excess oil and impurities without over-stripping the skin — the first step of the Pureté routine.",
      fr: "Un gel nettoyant moussant qui élimine l'excès de sébum et les impuretés sans dessécher la peau — la première étape de la routine Pureté.",
      ar: "جل منظف رغوي يزيل الزيوت الزائدة والشوائب دون أن يجفف البشرة — الخطوة الأولى في روتين بوريتيه.",
    },
    howToUse: {
      en: "Massage onto damp skin morning and evening, then rinse.",
      fr: "Masser sur peau humide matin et soir, puis rincer.",
      ar: "يُدلَّك على بشرة رطبة صباحًا ومساءً، ثم يُشطف.",
    },
    routineStep: "both",
    variants: [{ size: "150ml", b2cPriceMinor: 18000 }],
  },
  {
    slug: "matte-serum-regulateur",
    range: "matte",
    category: "serums",
    concern: "shine-control",
    name: {
      en: "Matte Regulating Serum",
      fr: "Sérum Matte Régulateur",
      ar: "سيروم مات المنظّم",
    },
    shortBenefit: {
      en: "All-day shine control that starts in the morning.",
      fr: "Un contrôle de la brillance qui dure toute la journée.",
      ar: "تحكم باللمعان يدوم طوال اليوم يبدأ من الصباح.",
    },
    description: {
      en: "A mattifying serum that regulates the look of shine through the day, formulated for oily skin without over-drying it.",
      fr: "Un sérum matifiant qui régule l'aspect brillant tout au long de la journée, formulé pour les peaux grasses sans les dessécher.",
      ar: "سيروم مطفٍ للمعان ينظم مظهر اللمعان طوال اليوم، مصمم للبشرة الدهنية دون أن يُجففها.",
    },
    howToUse: {
      en: "Apply each morning on cleansed skin before your moisturizer.",
      fr: "Appliquer chaque matin sur peau nettoyée, avant votre crème.",
      ar: "يُستخدم كل صباح على بشرة نظيفة قبل الكريم المرطب.",
    },
    routineStep: "morning",
    variants: [{ size: "30ml", b2cPriceMinor: 37000 }],
  },
  {
    slug: "matte-creme-legere",
    range: "matte",
    category: "creams",
    concern: "shine-control",
    name: { en: "Matte Light Cream", fr: "Crème Matte Légère", ar: "كريم مات الخفيف" },
    shortBenefit: {
      en: "A shine-free finish, morning after morning.",
      fr: "Un fini sans brillance, matin après matin.",
      ar: "لمسة نهائية خالية من اللمعان، صباحًا بعد صباح.",
    },
    description: {
      en: "An oil-free, fast-absorbing cream that hydrates oily skin without adding shine — comfortable enough for daily use under makeup.",
      fr: "Une crème sans huile à absorption rapide qui hydrate les peaux grasses sans ajouter de brillance — assez confortable pour un usage quotidien sous le maquillage.",
      ar: "كريم خالٍ من الزيوت وسريع الامتصاص يرطب البشرة الدهنية دون إضافة لمعان — مريح بما يكفي للاستخدام اليومي تحت المكياج.",
    },
    howToUse: {
      en: "Apply each morning after your serum.",
      fr: "Appliquer chaque matin après votre sérum.",
      ar: "يُستخدم كل صباح بعد السيروم.",
    },
    routineStep: "morning",
    variants: [{ size: "50ml", b2cPriceMinor: 29000 }],
  },
  {
    slug: "illumine-serum-eclat",
    range: "illumine",
    category: "serums",
    concern: "dark-spots",
    name: {
      en: "Illumine Radiance Serum",
      fr: "Sérum Illumine Éclat",
      ar: "سيروم إيلومين للإشراق",
    },
    shortBenefit: {
      en: "Targeted care for a more even-looking tone.",
      fr: "Un soin ciblé pour un teint visiblement plus uniforme.",
      ar: "عناية مركزة لمظهر بشرة أكثر توحدًا في اللون.",
    },
    description: {
      en: "An evening serum formulated to work on the appearance of dark spots and uneven tone over consistent use, paired with daily sun protection.",
      fr: "Un sérum de nuit conçu pour agir sur l'apparence des taches pigmentaires et du teint irrégulier avec un usage régulier, à associer à une protection solaire quotidienne.",
      ar: "سيروم ليلي مصمم للعمل على مظهر البقع الداكنة وعدم توحد لون البشرة مع الاستخدام المنتظم، ويُنصح بترافقه مع واقي شمس يومي.",
    },
    howToUse: {
      en: "Apply each evening on cleansed skin. Always pair with daily SPF.",
      fr: "Appliquer chaque soir sur peau nettoyée. Toujours associer à un SPF quotidien.",
      ar: "يُستخدم كل مساء على بشرة نظيفة، ويجب دائمًا ترافقه مع واقي شمس يومي.",
    },
    routineStep: "evening",
    variants: [
      { size: "30ml", b2cPriceMinor: 41000 },
      { size: "50ml", b2cPriceMinor: 56000 },
    ],
  },
  {
    slug: "illumine-creme-unifiante",
    range: "illumine",
    category: "creams",
    concern: "dark-spots",
    name: {
      en: "Illumine Unifying Cream",
      fr: "Crème Illumine Unifiante",
      ar: "كريم إيلومين الموحّد",
    },
    shortBenefit: {
      en: "A daily cream that supports an even-looking complexion.",
      fr: "Une crème quotidienne qui soutient un teint visiblement uniforme.",
      ar: "كريم يومي يدعم مظهر بشرة أكثر توحدًا.",
    },
    description: {
      en: "A daily moisturizer that complements the Illumine serum, formulated to support tone-evening results with continued use.",
      fr: "Une crème hydratante quotidienne qui complète le sérum Illumine, conçue pour soutenir les résultats d'unification du teint avec un usage continu.",
      ar: "كريم مرطب يومي يكمل سيروم إيلومين، مصمم لدعم نتائج توحيد لون البشرة مع الاستخدام المستمر.",
    },
    howToUse: {
      en: "Apply each morning after your serum, before sun protection.",
      fr: "Appliquer chaque matin après votre sérum, avant la protection solaire.",
      ar: "يُستخدم كل صباح بعد السيروم وقبل واقي الشمس.",
    },
    routineStep: "morning",
    variants: [{ size: "50ml", b2cPriceMinor: 33000 }],
  },
];

export { PENDING_INGREDIENTS };
export type { LocalizedText };
