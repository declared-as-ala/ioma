import type { AvatarSpeechTopic, TalkingAvatarResult } from "@ioma/types";

export interface CreateSpeechVideoParams {
  text: string;
  language: "en" | "ar";
  avatarId?: string;
  voiceId?: string;
  topic?: AvatarSpeechTopic;
  analysisId?: string;
}

export interface TalkingAvatarProvider {
  readonly name: string;
  createSpeechVideo(params: CreateSpeechVideoParams): Promise<TalkingAvatarResult>;
}

export const TALKING_AVATAR_PROVIDER = Symbol("TALKING_AVATAR_PROVIDER");
