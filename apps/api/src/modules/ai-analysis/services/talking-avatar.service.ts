import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AvatarSpeechSubtitle,
  AvatarSpeechTopic,
  TalkingAvatarResult,
} from "@ioma/types";
import type {
  CreateSpeechVideoParams,
  TalkingAvatarProvider,
} from "../providers/avatar-provider.interface";

@Injectable()
export class TalkingAvatarService implements TalkingAvatarProvider {
  readonly name = "IOMA-MultiProvider-AvatarService";
  private readonly logger = new Logger(TalkingAvatarService.name);

  // In-memory cache for avatar results by text hash
  private readonly cache = new Map<string, TalkingAvatarResult>();

  constructor(private readonly configService: ConfigService) {}

  async createSpeechVideo(params: CreateSpeechVideoParams): Promise<TalkingAvatarResult> {
    const cacheKey = `${params.language}:${params.text.slice(0, 100)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const heygenKey = this.configService.get<string>("HEYGEN_API_KEY");
    const didKey = this.configService.get<string>("DID_API_KEY");
    const tavusKey = this.configService.get<string>("TAVUS_API_KEY");

    let result: TalkingAvatarResult;

    if (heygenKey) {
      result = await this.generateHeyGenAvatar(params, heygenKey);
    } else if (didKey) {
      result = await this.generateDidAvatar(params, didKey);
    } else if (tavusKey) {
      result = await this.generateTavusAvatar(params, tavusKey);
    } else {
      this.logger.log(
        "No external avatar API credentials found (HEYGEN_API_KEY / DID_API_KEY / TAVUS_API_KEY). Using high-fidelity IOMA Studio Fallback.",
      );
      result = this.generateStudioFallback(params);
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  private async generateHeyGenAvatar(
    params: CreateSpeechVideoParams,
    apiKey: string,
  ): Promise<TalkingAvatarResult> {
    try {
      this.logger.log(`Calling HeyGen API for ${params.language} speech synthesis...`);
      const defaultAvatar =
        this.configService.get<string>("HEYGEN_AVATAR_ID") ||
        "Eleonore_French_Skincare_Consultant_v2";
      const defaultVoice =
        params.language === "ar"
          ? this.configService.get<string>("HEYGEN_VOICE_ID_AR") || "ar-AE-FatimaNeural"
          : this.configService.get<string>("HEYGEN_VOICE_ID_EN") || "en-FR-CosetteNeural";

      const res = await fetch("https://api.heygen.com/v2/video/generate", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: "avatar",
                avatar_id: params.avatarId || defaultAvatar,
                avatar_style: "normal",
              },
              voice: {
                type: "text",
                input_text: params.text,
                voice_id: params.voiceId || defaultVoice,
                speed: 0.95,
              },
              background: {
                type: "color",
                value: "#121110",
              },
            },
          ],
          dimension: { width: 1280, height: 720 },
        }),
      });

      if (!res.ok) {
        throw new Error(`HeyGen returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as { data?: { video_id?: string } };
      const videoId = data.data?.video_id;

      return {
        jobId: videoId,
        videoUrl: videoId ? `https://api.heygen.com/v2/video/${videoId}` : undefined,
        posterUrl: "/images/ai-expert/eleonore-poster.webp",
        durationSeconds: this.estimateDuration(params.text, params.language),
        subtitles: this.generateTimedSubtitles(params.text, params.language),
        provider: "heygen",
        status: "ready",
      };
    } catch (err) {
      this.logger.warn(`HeyGen API call failed: ${(err as Error).message}. Falling back to Studio.`);
      return this.generateStudioFallback(params);
    }
  }

  private async generateDidAvatar(
    params: CreateSpeechVideoParams,
    apiKey: string,
  ): Promise<TalkingAvatarResult> {
    try {
      this.logger.log(`Calling D-ID API for ${params.language} speech synthesis...`);
      const sourceUrl =
        this.configService.get<string>("DID_SOURCE_URL") ||
        "https://ioma-paris.com/assets/ai-consultant-portrait.png";

      const voice =
        params.language === "ar"
          ? this.configService.get<string>("DID_VOICE_ID_AR") || "ar-AE-Fatima"
          : this.configService.get<string>("DID_VOICE_ID_EN") || "en-FR-Denise";

      const res = await fetch("https://api.d-id.com/talks", {
        method: "POST",
        headers: {
          Authorization: `Basic ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_url: sourceUrl,
          script: {
            type: "text",
            input: params.text,
            provider: {
              type: "microsoft",
              voice_id: params.voiceId || voice,
            },
          },
          config: { fluent: true, pad_audio: 0.2 },
        }),
      });

      if (!res.ok) {
        throw new Error(`D-ID returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as { id?: string; result_url?: string };

      return {
        jobId: data.id,
        videoUrl: data.result_url,
        posterUrl: "/images/ai-expert/eleonore-poster.webp",
        durationSeconds: this.estimateDuration(params.text, params.language),
        subtitles: this.generateTimedSubtitles(params.text, params.language),
        provider: "did",
        status: "ready",
      };
    } catch (err) {
      this.logger.warn(`D-ID API call failed: ${(err as Error).message}. Falling back to Studio.`);
      return this.generateStudioFallback(params);
    }
  }

  private async generateTavusAvatar(
    params: CreateSpeechVideoParams,
    apiKey: string,
  ): Promise<TalkingAvatarResult> {
    try {
      this.logger.log(`Calling Tavus API for ${params.language} speech synthesis...`);
      const replicaId =
        this.configService.get<string>("TAVUS_REPLICA_ID") || "r_ioma_eleonore_01";

      const res = await fetch("https://tavusapi.com/v2/videos", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          replica_id: replicaId,
          script: params.text,
          video_name: `ioma_consultation_${Date.now()}`,
        }),
      });

      if (!res.ok) throw new Error(`Tavus returned HTTP ${res.status}`);
      const data = (await res.json()) as { video_id?: string; download_url?: string };

      return {
        jobId: data.video_id,
        videoUrl: data.download_url,
        posterUrl: "/images/ai-expert/eleonore-poster.webp",
        durationSeconds: this.estimateDuration(params.text, params.language),
        subtitles: this.generateTimedSubtitles(params.text, params.language),
        provider: "tavus",
        status: "ready",
      };
    } catch (err) {
      this.logger.warn(`Tavus API call failed: ${(err as Error).message}. Falling back to Studio.`);
      return this.generateStudioFallback(params);
    }
  }

  private generateStudioFallback(params: CreateSpeechVideoParams): TalkingAvatarResult {
    const duration = this.estimateDuration(params.text, params.language);
    const subtitles = this.generateTimedSubtitles(params.text, params.language);

    return {
      posterUrl: "/images/ai-expert/eleonore-poster.webp",
      durationSeconds: duration,
      subtitles,
      provider: "browser_synth",
      status: "ready",
    };
  }

  private estimateDuration(text: string, language: "en" | "ar"): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    // English ~135 WPM (2.25 words/sec), Arabic ~125 WPM (2.08 words/sec)
    const wordsPerSec = language === "ar" ? 2.08 : 2.25;
    return Math.max(3, Math.ceil(words / wordsPerSec) + 1);
  }

  private generateTimedSubtitles(
    text: string,
    language: "en" | "ar",
  ): AvatarSpeechSubtitle[] {
    // Split sentences cleanly in English or Arabic
    const sentences = text
      .split(language === "ar" ? /(?<=[.!?؟،\n])\s+/ : /(?<=[.!?\n])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length === 0) {
      return [{ startMs: 0, endMs: 3000, text }];
    }

    const subtitles: AvatarSpeechSubtitle[] = [];
    let currentMs = 400; // Small initial pause for natural cadence

    for (const sentence of sentences) {
      const wordCount = sentence.split(/\s+/).length;
      const durationMs = Math.max(1600, Math.round(wordCount * (language === "ar" ? 480 : 440)));

      // Detect topic to trigger synchronized UI highlight
      let activeConcernKey: string | undefined;
      const lower = sentence.toLowerCase();

      if (lower.includes("hydrat") || lower.includes("ترطيب") || lower.includes("water") || lower.includes("dehydrat")) {
        activeConcernKey = "hydration";
      } else if (lower.includes("texture") || lower.includes("ملمس") || lower.includes("smooth") || lower.includes("rough")) {
        activeConcernKey = "texture";
      } else if (lower.includes("redness") || lower.includes("احمرار") || lower.includes("sensitiv") || lower.includes("calm")) {
        activeConcernKey = "redness";
      } else if (lower.includes("pore") || lower.includes("مسام") || lower.includes("t-zone") || lower.includes("shine")) {
        activeConcernKey = "pores";
      } else if (lower.includes("pigment") || lower.includes("تصبغ") || lower.includes("spot") || lower.includes("dark")) {
        activeConcernKey = "pigmentation";
      } else if (lower.includes("line") || lower.includes("خطوط") || lower.includes("wrinkle") || lower.includes("aging")) {
        activeConcernKey = "fineLines";
      } else if (lower.includes("serum") || lower.includes("cream") || lower.includes("سيروم") || lower.includes("كريم") || lower.includes("product") || lower.includes("routine")) {
        activeConcernKey = "recommendations";
      }

      subtitles.push({
        startMs: currentMs,
        endMs: currentMs + durationMs,
        text: sentence,
        activeConcernKey,
      });

      currentMs += durationMs + 250; // Breathing gap between sentences
    }

    return subtitles;
  }
}
