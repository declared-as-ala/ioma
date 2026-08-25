import type {
  AvatarSessionData,
  AvatarSpeechTopic,
  TalkingAvatarResult,
} from "@ioma/types";

export interface CreateSpeechVideoParams {
  text: string;
  language: "en" | "ar";
  avatarId?: string;
  voiceId?: string;
  topic?: AvatarSpeechTopic;
  analysisId?: string;
}

export interface CreateAvatarSessionParams {
  language: "en" | "ar";
  avatarId?: string;
  voiceId?: string;
  quality?: "high" | "medium" | "low";
}

export interface AvatarSpeakParams {
  sessionId: string;
  text: string;
  language: "en" | "ar";
  taskType?: "talk" | "repeat";
}

export interface AvatarSpeakResult {
  taskId: string;
  durationSeconds: number;
}

export interface TalkingAvatarProvider {
  readonly name: string;
  createSpeechVideo(params: CreateSpeechVideoParams): Promise<TalkingAvatarResult>;
  createSession?(params: CreateAvatarSessionParams): Promise<AvatarSessionData>;
  speak?(params: AvatarSpeakParams): Promise<AvatarSpeakResult>;
  interrupt?(sessionId: string): Promise<void>;
  closeSession?(sessionId: string): Promise<void>;
}

export const TALKING_AVATAR_PROVIDER = Symbol("TALKING_AVATAR_PROVIDER");
