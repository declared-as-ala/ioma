import type {
  AiIndicatorKey,
  ProductRangeKey,
  RoutineComplexityPreference,
  RoutineTier,
  SkinType,
} from "@ioma/config";
import type { LocalizedText } from "./api";

export interface RoutineVariant {
  sku: string;
  size: string;
  priceMinor: number;
  name: LocalizedText;
  image?: string;
}

export interface DiagnosisRangeSummary {
  slug: ProductRangeKey;
  name: LocalizedText;
}

export type AiAnalysisStatus = "queued" | "processing" | "completed" | "failed";

export interface ImageQualityAssessment {
  isValid: boolean;
  brightness: "low" | "optimal" | "high";
  clarity: "sharp" | "acceptable" | "blurry";
  faceCentered: boolean;
  notes?: string;
}

export interface VisionObservations {
  hydrationAppearance: { score: number; level: string; note: string };
  visiblePores: { score: number; level: string; note: string };
  rednessAppearance: { score: number; level: string; note: string };
  pigmentationAppearance: { score: number; level: string; note: string };
  fineLinesAppearance: { score: number; level: string; note: string };
  textureAppearance: { score: number; level: string; note: string };
  radianceAppearance: { score: number; level: string; note: string };
  imperfectionsAppearance: { score: number; level: string; note: string };
}

export interface CurrentSkincareRoutine {
  cleanser?: string;
  vitaminC?: boolean;
  retinoid?: boolean;
  exfoliant?: boolean;
  sunscreen?: boolean;
  moisturizer?: string;
  rawText?: string;
}

export interface DubaiClimateContext {
  acExposure: "low" | "moderate" | "high";
  sunExposure: "low" | "moderate" | "high";
  heatSensitivity?: "low" | "moderate" | "high";
  frequentTravel?: boolean;
}

export interface SkinPriority {
  id: string;
  rank: number;
  title: LocalizedText;
  rationale: LocalizedText;
}

export interface SkinProfile {
  skinType: SkinType;
  hydrationTendency: string;
  sensitivityLevel: "low" | "moderate" | "high";
  priorities: SkinPriority[];
  goals: string[];
  currentRoutine: CurrentSkincareRoutine;
  climateContext: DubaiClimateContext;
  routinePreference: RoutineComplexityPreference;
  budgetPreference: string;
  confidence: number;
}

export interface RecommendedProduct {
  productId: string;
  variantId: string;
  sku: string;
  slug: string;
  name: LocalizedText;
  shortBenefit: LocalizedText;
  size: string;
  priceMinor: number;
  routineStep: "morning" | "evening" | "both";
  whyThisProduct: LocalizedText;
  howToUse: LocalizedText;
  whenToUse: LocalizedText;
  orderIndex: number;
  inStock: boolean;
  image?: string;
  range: DiagnosisRangeSummary;
}

export interface WeeklyRitualStep {
  day: string;
  action: LocalizedText;
  productName: LocalizedText;
  guidance: LocalizedText;
}

export interface RoutineTierData {
  tier: RoutineTier;
  totalPriceMinor: number;
  description: LocalizedText;
  morningSteps: RecommendedProduct[];
  eveningSteps: RecommendedProduct[];
  weeklyRitual: WeeklyRitualStep[];
}

export interface AdaptiveQuestionOption {
  value: string;
  label: LocalizedText;
  description?: LocalizedText;
}

export interface AdaptiveQuestion {
  id: string;
  questionKey: string;
  category: "hydration" | "sensitivity" | "routine" | "climate" | "goals" | "budget";
  title: LocalizedText;
  subtitle?: LocalizedText;
  type: "single" | "multi" | "text";
  options?: AdaptiveQuestionOption[];
  placeholder?: LocalizedText;
  contextReason?: LocalizedText;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  suggestedQuestions?: string[];
}

export interface FollowUpCheckin {
  day: number;
  completedAt: string;
  comfortRating: number;
  tightnessAfterCleansing: boolean;
  irritationNoticed: boolean;
  notes?: string;
}

export interface AiAnalysisResult {
  id: string;
  status: AiAnalysisStatus;
  isSimulated: boolean;
  imageUrl?: string | null;
  imageQuality?: ImageQualityAssessment | null;
  observations: VisionObservations | null;
  indicators: Record<AiIndicatorKey, number> | null;
  diagnosticNarrative?: LocalizedText | null;
  skinProfile: SkinProfile | null;
  recommendedRange: DiagnosisRangeSummary | null;
  routines: {
    essential: RoutineTierData;
    complete: RoutineTierData;
    premium: RoutineTierData;
  } | null;
  activeTier: RoutineTier;
  morningRoutine: RoutineVariant[];
  eveningRoutine: RoutineVariant[];
  chatHistory: AiChatMessage[];
  suggestedQuestions?: string[];
  followUpCheckins?: FollowUpCheckin[];
  failureReason: string | null;
  createdAt: string | null;
}

export interface AiAnalysisSummary {
  id: string;
  status: AiAnalysisStatus;
  range: DiagnosisRangeSummary | null;
  skinType?: string;
  activeTier?: RoutineTier;
  createdAt: string | null;
}

export interface BeforeAfterComparison {
  previousId: string;
  previousDate: string;
  currentId: string;
  currentDate: string;
  daySpan: number;
  indicatorChanges: {
    key: AiIndicatorKey;
    previousScore: number;
    currentScore: number;
    diff: number;
    trend: "improved" | "stable" | "needs_attention";
  }[];
  narrative: LocalizedText;
}

export interface DiagnosisAnswer {
  questionKey: string;
  value: string;
}

export interface StandardDiagnosisResult {
  id: string;
  skinType: SkinType;
  hydrationScore: number;
  priorityConcerns: string[];
  range: DiagnosisRangeSummary;
  morningRoutine: RoutineVariant[];
  eveningRoutine: RoutineVariant[];
  createdAt: string | null;
}

export interface StandardDiagnosisSummary {
  id: string;
  range: DiagnosisRangeSummary;
  createdAt: string | null;
}
