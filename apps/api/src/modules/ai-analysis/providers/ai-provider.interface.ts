import type { AiIndicatorKey } from "@ioma/config";

// Provider-abstraction pattern (see ARCHITECTURE.md / DECISIONS.md — same
// shape used for Payment/maps/email/SMS/search): call sites depend only on
// this interface, so wiring in a real vision provider later touches only
// this file's DI binding, never the ai-analysis processor/controller.
export interface AnalyzeImageParams {
  imageBuffer: Buffer;
  mimeType: string;
}

export interface AnalyzeImageResult {
  indicators: Record<AiIndicatorKey, number>;
  isSimulated: boolean;
}

export interface AIProvider {
  readonly name: string;
  analyze(params: AnalyzeImageParams): Promise<AnalyzeImageResult>;
}

export const AI_PROVIDER = Symbol("AI_PROVIDER");
