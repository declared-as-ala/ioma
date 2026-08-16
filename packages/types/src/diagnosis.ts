import type { AiIndicatorKey, ProductRangeKey } from "@ioma/config";
import type { LocalizedText } from "./api";

export interface DiagnosisAnswer {
  questionKey: string;
  value: string;
}

export interface RoutineVariant {
  sku: string;
  size: string;
  priceMinor: number;
  name: LocalizedText;
}

export interface DiagnosisRangeSummary {
  slug: ProductRangeKey;
  name: LocalizedText;
}

export interface StandardDiagnosisResult {
  id: string;
  answers: DiagnosisAnswer[];
  resultProfile: {
    skinType: string;
    priorityConcerns: string[];
    hydrationScore: number;
  };
  range: DiagnosisRangeSummary;
  morningRoutine: RoutineVariant[];
  eveningRoutine: RoutineVariant[];
  createdAt: string | null;
}

export interface StandardDiagnosisSummary {
  id: string;
  resultProfile: StandardDiagnosisResult["resultProfile"];
  range: DiagnosisRangeSummary;
  createdAt: string | null;
}

export type AiAnalysisStatus = "queued" | "processing" | "completed" | "failed";

export interface AiAnalysisResult {
  id: string;
  status: AiAnalysisStatus;
  isSimulated: boolean;
  indicators: Record<AiIndicatorKey, number> | null;
  range: DiagnosisRangeSummary | null;
  morningRoutine: RoutineVariant[];
  eveningRoutine: RoutineVariant[];
  failureReason: string | null;
  createdAt: string | null;
}

export interface AiAnalysisSummary {
  id: string;
  status: AiAnalysisStatus;
  range: DiagnosisRangeSummary | null;
  createdAt: string | null;
}
