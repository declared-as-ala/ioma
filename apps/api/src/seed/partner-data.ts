export interface ServiceSeed {
  slug: string;
  name: { en: string; fr: string; ar: string };
  durationMinutes: number;
  category: "diagnosis" | "treatment" | "training";
}

export interface TreatmentSeed {
  slug: string;
  name: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  durationMinutes: number;
}

export interface PartnerSeed {
  slug: string;
  type:
    | "spa"
    | "clinic"
    | "beauty_institute"
    | "hotel"
    | "retail"
    | "diagnostic_center"
    | "distributor";
  name: string;
  description: { en: string; fr: string; ar: string };
  emirate: string;
  city: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  diagnosisAvailable: boolean;
  serviceSlugs: string[];
}

export const SERVICE_SEED: ServiceSeed[] = [
  {
    slug: "skin-diagnosis",
    name: {
      en: "Skin Diagnosis",
      fr: "Diagnostic Peau",
      ar: "تشخيص البشرة",
    },
    durationMinutes: 30,
    category: "diagnosis",
  },
  {
    slug: "ai-analysis-session",
    name: {
      en: "AI Skin Analysis",
      fr: "Analyse IA de la Peau",
      ar: "تحليل البشرة بالذكاء الاصطناعي",
    },
    durationMinutes: 20,
    category: "diagnosis",
  },
  {
    slug: "hydra-facial",
    name: {
      en: "Hydra Facial Treatment",
      fr: "Soin Hydra Facial",
      ar: "علاج هايدرا للوجه",
    },
    durationMinutes: 60,
    category: "treatment",
  },
  {
    slug: "radiance-boost",
    name: {
      en: "Radiance Boost Facial",
      fr: "Soin Éclat du Teint",
      ar: "علاج إشراقة الوجه",
    },
    durationMinutes: 45,
    category: "treatment",
  },
  {
    slug: "calm-sensitivity-treatment",
    name: {
      en: "Calm & Sensitivity Treatment",
      fr: "Soin Apaisant Sensibilité",
      ar: "علاج التهدئة والحساسية",
    },
    durationMinutes: 50,
    category: "treatment",
  },
  {
    slug: "professional-training-intro",
    name: {
      en: "IOMA Protocol Introduction",
      fr: "Introduction aux Protocoles IOMA",
      ar: "مقدمة بروتوكولات IOMA",
    },
    durationMinutes: 120,
    category: "training",
  },
];

export const TREATMENT_SEED: TreatmentSeed[] = [
  {
    slug: "hydra-protocol-professional",
    name: {
      en: "Hydra Protocol — Professional",
      fr: "Protocole Hydra — Professionnel",
      ar: "بروتوكول هايدرا — احترافي",
    },
    description: {
      en: "A deep-hydration facial protocol using IOMA Hydra range products, designed for dry or dehydrated skin exposed to the Gulf climate.",
      fr: "Un protocole facial d'hydratation intense utilisant les produits de la gamme Hydra d'IOMA, conçu pour les peaux sèches ou déshydratées exposées au climat du Golfe.",
      ar: "بروتوكول ترطيب عميق للوجه باستخدام منتجات مجموعة Hydra من IOMA، مصمم للبشرة الجافة أو المهددة بالجفاف المعرضة لمناخ الخليج.",
    },
    durationMinutes: 60,
  },
  {
    slug: "renew-protocol-professional",
    name: {
      en: "Renew Protocol — Professional",
      fr: "Protocole Renouveau — Professionnel",
      ar: "بروتوكول التجديد — احترافي",
    },
    description: {
      en: "A firming and anti-aging protocol from the IOMA Renew range, targeting fine lines and loss of elasticity.",
      fr: "Un protocole raffermissant et anti-âge de la gamme Renouveau d'IOMA, ciblant les ridules et la perte d'élasticité.",
      ar: "بروتوكول شد ومضاد للشيخوخة من مجموعة Renew من IOMA، يستهدف الخطوط الدقيقة وفقدان المرونة.",
    },
    durationMinutes: 55,
  },
  {
    slug: "calm-protocol-professional",
    name: {
      en: "Calm Protocol — Professional",
      fr: "Protocole Apaisant — Professionnel",
      ar: "بروتوكول التهدئة — احترافي",
    },
    description: {
      en: "A soothing treatment protocol for reactive or sensitive skin, using the Calm range to restore comfort and reduce visible redness.",
      fr: "Un protocole de soin apaisant pour les peaux réactives ou sensibles, utilisant la gamme Calm pour retrouver du confort et réduire les rougeurs visibles.",
      ar: "بروتوكول علاج مهدئ للبشرة التفاعلية أو الحساسة، يستخدم مجموعة Calm لاستعادة الراحة وتقليل الاحمرار المرئي.",
    },
    durationMinutes: 50,
  },
];

// Dubai coordinates (approximate)
const DUBAI_COORDS = {
  DIFC: { lat: 25.2144, lng: 55.2708 },
  JBR: { lat: 25.0793, lng: 55.1335 },
  DOWNTOWN: { lat: 25.1972, lng: 55.2744 },
  MARINA: { lat: 25.0805, lng: 55.1344 },
  PALM: { lat: 25.1124, lng: 55.139 },
};

export const PARTNER_SEED: PartnerSeed[] = [
  {
    slug: "ioma-difc-flagship",
    type: "beauty_institute",
    name: "IOMA Paris — DIFC Flagship",
    description: {
      en: "The flagship IOMA institute in Dubai's financial centre. Full diagnosis counter, treatment rooms, and the complete retail range.",
      fr: "L'institut IOMA phare dans le centre financier de Dubai. Comptoir de diagnostic complet, salles de soin et la gamme de détail intégrale.",
      ar: "المعهد الرئيسي لـ IOMA في مركز دبي المالي. عداد تشخيص كامل، وغرف علاج، ومجموعة التجزئة الكاملة.",
    },
    emirate: "DXB",
    city: "Dubai",
    address: "Gate Village, Building 4, DIFC, Dubai",
    coordinates: DUBAI_COORDS.DIFC,
    phone: "+971-4-XXX-XXXX",
    diagnosisAvailable: true,
    serviceSlugs: [
      "skin-diagnosis",
      "ai-analysis-session",
      "hydra-facial",
      "radiance-boost",
    ],
  },
  {
    slug: "spa-jumeirah-beach-residence",
    type: "spa",
    name: "Serenity Spa — JBR",
    description: {
      en: "A luxury day spa at Jumeirah Beach Residence offering IOMA facial protocols alongside a full wellness menu.",
      fr: "Un spa de luxe à Jumeirah Beach Residence offrant les protocoles faciaux IOMA aux côtés d'un menu bien-être complet.",
      ar: "سبا فاخر في جميرا بيتش ريزيدنس يقدم بروتوكولات IOMA للوجه مع قائمة عافية كاملة.",
    },
    emirate: "DXB",
    city: "Dubai",
    address: "The Walk, JBR, Dubai",
    coordinates: DUBAI_COORDS.JBR,
    phone: "+971-4-XXX-XXXX",
    diagnosisAvailable: true,
    serviceSlugs: ["skin-diagnosis", "hydra-facial", "calm-sensitivity-treatment"],
  },
  {
    slug: "clinic-downtown-aesthetics",
    type: "clinic",
    name: "Downtown Aesthetics & Dermatology",
    description: {
      en: "A dermatology clinic in Downtown Dubai offering medical-grade skin diagnostics and IOMA treatment protocols.",
      fr: "Une clinique de dermatologie à Downtown Dubai offrant des diagnostics cutanés de qualité médicale et des protocoles de soin IOMA.",
      ar: "عيادة جلدية في وسط دبي تقدم تشخيصات بشرة طبية وبروتوكولات علاج IOMA.",
    },
    emirate: "DXB",
    city: "Dubai",
    address: "Financial Center Road, Downtown Dubai",
    coordinates: DUBAI_COORDS.DOWNTOWN,
    phone: "+971-4-XXX-XXXX",
    diagnosisAvailable: true,
    serviceSlugs: [
      "skin-diagnosis",
      "ai-analysis-session",
      "radiance-boost",
      "calm-sensitivity-treatment",
    ],
  },
  {
    slug: "hotel- Kempinski-marina",
    type: "hotel",
    name: "Kempinski Hotel — Marina Spa",
    description: {
      en: "The Kempinski Marina's spa precinct featuring IOMA's professional treatment protocols for hotel guests and walk-ins.",
      fr: "L'espace spa du Kempinski Marina proposant les protocoles de soin professionnels IOMA pour les clients de l'hôtel et les visites sans rendez-vous.",
      ar: "منطقة السبا في كمبينسكي مارينا تعرض بروتوكولات العلاج الاحترافية من IOMA لضيوف الفندق والزوار.",
    },
    emirate: "DXB",
    city: "Dubai",
    address: "King Salman Bin Abdulaziz Al Saud St, Dubai Marina",
    coordinates: DUBAI_COORDS.MARINA,
    phone: "+971-4-XXX-XXXX",
    diagnosisAvailable: false,
    serviceSlugs: ["hydra-facial", "radiance-boost"],
  },
  {
    slug: "retail-apothecary-palm-jumeirah",
    type: "retail",
    name: "The Apothecary — Palm Jumeirah",
    description: {
      en: "A curated skincare retail destination on the Palm, carrying the full IOMA retail range with trained skin advisors.",
      fr: "Une destination de vente au détail de soins de la peau sur le Palm, proposant la gamme complète IOMA avec des conseillers formés.",
      ar: "وجهة تجزئة منتجات العناية بالبشرة على نخلة جميرا، تعرض مجموعة IOMA الكاملة مع مستشارين مدربين.",
    },
    emirate: "DXB",
    city: "Dubai",
    address: "Golden Mile 10, Palm Jumeirah, Dubai",
    coordinates: DUBAI_COORDS.PALM,
    phone: "+971-4-XXX-XXXX",
    diagnosisAvailable: false,
    serviceSlugs: ["skin-diagnosis"],
  },
];

export const AVAILABILITY_SEED = [
  {
    partnerSlug: "ioma-difc-flagship",
    weeklyHours: [
      { day: 0, open: "10:00", close: "18:00" }, // Sunday
      { day: 1, open: "09:00", close: "20:00" }, // Monday
      { day: 2, open: "09:00", close: "20:00" }, // Tuesday
      { day: 3, open: "09:00", close: "20:00" }, // Wednesday
      { day: 4, open: "09:00", close: "20:00" }, // Thursday
      { day: 5, open: "10:00", close: "20:00" }, // Friday
      { day: 6, open: "10:00", close: "18:00" }, // Saturday
    ],
    breaks: [
      { day: 1, start: "13:00", end: "14:00" },
      { day: 2, start: "13:00", end: "14:00" },
      { day: 3, start: "13:00", end: "14:00" },
      { day: 4, start: "13:00", end: "14:00" },
      { day: 5, start: "13:00", end: "14:00" },
    ],
    capacityPerSlot: 3,
  },
  {
    partnerSlug: "spa-jumeirah-beach-residence",
    weeklyHours: [
      { day: 0, open: "10:00", close: "20:00" },
      { day: 1, open: "09:00", close: "21:00" },
      { day: 2, open: "09:00", close: "21:00" },
      { day: 3, open: "09:00", close: "21:00" },
      { day: 4, open: "09:00", close: "21:00" },
      { day: 5, open: "10:00", close: "22:00" },
      { day: 6, open: "10:00", close: "20:00" },
    ],
    breaks: [],
    capacityPerSlot: 2,
  },
  {
    partnerSlug: "clinic-downtown-aesthetics",
    weeklyHours: [
      { day: 0, open: "10:00", close: "17:00" },
      { day: 1, open: "09:00", close: "19:00" },
      { day: 2, open: "09:00", close: "19:00" },
      { day: 3, open: "09:00", close: "19:00" },
      { day: 4, open: "09:00", close: "19:00" },
      { day: 5, open: "09:00", close: "14:00" },
    ],
    breaks: [
      { day: 1, start: "12:30", end: "13:30" },
      { day: 2, start: "12:30", end: "13:30" },
      { day: 3, start: "12:30", end: "13:30" },
      { day: 4, start: "12:30", end: "13:30" },
    ],
    capacityPerSlot: 1,
  },
];
