import type { VoiceSynthesisResult } from "@ioma/types";

export interface SynthesizeSpeechParams {
  text: string;
  locale: "en" | "fr" | "ar";
  voiceId?: string;
  speed?: number;
}

export interface VoiceProvider {
  readonly name: string;
  synthesizeSpeech(params: SynthesizeSpeechParams): Promise<VoiceSynthesisResult>;
}

export const VOICE_PROVIDER = "VOICE_PROVIDER";
