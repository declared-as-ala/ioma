import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { VoiceSynthesisResult } from "@ioma/types";
import type {
  SynthesizeSpeechParams,
  VoiceProvider,
} from "../providers/voice-provider.interface";

@Injectable()
export class VoiceService implements VoiceProvider {
  readonly name = "IOMA-MultiProvider-VoiceService";
  private readonly logger = new Logger(VoiceService.name);

  // In-memory cache for audio synthesis keyed by locale + text hash
  private readonly cache = new Map<string, VoiceSynthesisResult>();

  constructor(private readonly configService: ConfigService) {}

  async synthesizeSpeech(params: SynthesizeSpeechParams): Promise<VoiceSynthesisResult> {
    const cleanText = params.text.replace(/[*#_~`]/g, "").trim();
    const cacheKey = `${params.locale}:${cleanText.slice(0, 120)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const elevenLabsKey =
      this.configService.get<string>("ELEVENLABS_API_KEY") ||
      process.env.ELEVENLABS_API_KEY;
    const azureSpeechKey =
      this.configService.get<string>("AZURE_SPEECH_KEY") || process.env.AZURE_SPEECH_KEY;
    const openAiKey =
      this.configService.get<string>("OPENAI_API_KEY") || process.env.OPENAI_API_KEY;

    let result: VoiceSynthesisResult;

    if (elevenLabsKey) {
      result = await this.synthesizeWithElevenLabs(cleanText, params, elevenLabsKey);
    } else if (azureSpeechKey) {
      result = await this.synthesizeWithAzure(cleanText, params, azureSpeechKey);
    } else if (openAiKey) {
      result = await this.synthesizeWithOpenAi(cleanText, params, openAiKey);
    } else {
      result = this.synthesizeWithFallback(cleanText, params);
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  private async synthesizeWithElevenLabs(
    text: string,
    params: SynthesizeSpeechParams,
    apiKey: string,
  ): Promise<VoiceSynthesisResult> {
    try {
      this.logger.log(`Synthesizing speech via ElevenLabs (${params.locale})...`);

      // Configurable female voice IDs:
      // EN default: Sarah (EXAVITQu4vr4xnSDxMaL)
      // AR default: Sarah (EXAVITQu4vr4xnSDxMaL) with eleven_multilingual_v2
      const defaultVoiceEn =
        this.configService.get<string>("AI_VOICE_EN_ID") || "EXAVITQu4vr4xnSDxMaL";
      const defaultVoiceAr =
        this.configService.get<string>("AI_VOICE_AR_ID") || "EXAVITQu4vr4xnSDxMaL";

      const voiceId =
        params.voiceId || (params.locale === "ar" ? defaultVoiceAr : defaultVoiceEn);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.75,
              style: 0.35,
              use_speaker_boost: true,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs returned HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const durationSeconds = this.estimateDuration(text, params.locale);

      return {
        audioBase64: `data:audio/mp3;base64,${base64}`,
        format: "mp3",
        durationSeconds,
        provider: "elevenlabs",
      };
    } catch (err) {
      this.logger.warn(
        `ElevenLabs synthesis failed: ${(err as Error).message}. Falling back.`,
      );
      return this.synthesizeWithFallback(text, params);
    }
  }

  private async synthesizeWithAzure(
    text: string,
    params: SynthesizeSpeechParams,
    apiKey: string,
  ): Promise<VoiceSynthesisResult> {
    try {
      const region =
        this.configService.get<string>("AZURE_SPEECH_REGION") ||
        process.env.AZURE_SPEECH_REGION ||
        "eastus";

      // Premium Female voices:
      // AR: ar-AE-FatimaNeural (UAE Modern Standard Arabic Female)
      // EN: en-US-JennyNeural / en-FR-DeniseNeural (Calm luxury female)
      const voiceName =
        params.voiceId ||
        (params.locale === "ar"
          ? this.configService.get<string>("AI_VOICE_AR_ID") || "ar-AE-FatimaNeural"
          : params.locale === "fr"
            ? "fr-FR-DeniseNeural"
            : this.configService.get<string>("AI_VOICE_EN_ID") || "en-US-JennyNeural");

      const ssml = `<speak version='1.0' xml:lang='${params.locale === "ar" ? "ar-AE" : "en-US"}'>
        <voice name='${voiceName}'>
          <prosody rate='-5%' pitch='0%'>${text}</prosody>
        </voice>
      </speak>`;

      const response = await fetch(
        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": apiKey,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
          },
          body: ssml,
        },
      );

      if (!response.ok) {
        throw new Error(`Azure Speech returned HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const durationSeconds = this.estimateDuration(text, params.locale);

      return {
        audioBase64: `data:audio/mp3;base64,${base64}`,
        format: "mp3",
        durationSeconds,
        provider: "azure",
      };
    } catch (err) {
      this.logger.warn(
        `Azure Speech synthesis failed: ${(err as Error).message}. Falling back.`,
      );
      return this.synthesizeWithFallback(text, params);
    }
  }

  private async synthesizeWithOpenAi(
    text: string,
    params: SynthesizeSpeechParams,
    apiKey: string,
  ): Promise<VoiceSynthesisResult> {
    try {
      this.logger.log(`Synthesizing speech via OpenAI TTS (${params.locale})...`);

      // Female voices: "nova" (warm & calm) or "shimmer" (clear & gentle)
      const voice = (this.configService.get<string>("AI_VOICE_EN_ID") || "nova") as
        "nova" | "shimmer" | "alloy";

      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice,
          speed: 0.95,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS returned HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const durationSeconds = this.estimateDuration(text, params.locale);

      return {
        audioBase64: `data:audio/mp3;base64,${base64}`,
        format: "mp3",
        durationSeconds,
        provider: "openai",
      };
    } catch (err) {
      this.logger.warn(`OpenAI TTS failed: ${(err as Error).message}. Falling back.`);
      return this.synthesizeWithFallback(text, params);
    }
  }

  private synthesizeWithFallback(
    text: string,
    params: SynthesizeSpeechParams,
  ): VoiceSynthesisResult {
    const durationSeconds = this.estimateDuration(text, params.locale);
    return {
      format: "mp3",
      durationSeconds,
      provider: "fallback",
    };
  }

  private estimateDuration(text: string, locale: "en" | "fr" | "ar"): number {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const wordsPerSecond = locale === "ar" ? 2.1 : 2.3;
    return Math.max(2, Math.ceil(wordCount / wordsPerSecond) + 1);
  }
}
