import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { AI_INDICATOR_KEYS, type AiIndicatorKey } from "@ioma/config";
import type {
  AIProvider,
  AnalyzeImageParams,
  AnalyzeImageResult,
} from "./ai-provider.interface";

@Injectable()
export class GeminiAIProvider implements AIProvider {
  readonly name = "gemini";
  private readonly logger = new Logger(GeminiAIProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async analyze(params: AnalyzeImageParams): Promise<AnalyzeImageResult> {
    const apiKey =
      this.configService.get<string>("AI_PROVIDER_API_KEY") ||
      this.configService.get<string>("GEMINI_API_KEY") ||
      process.env.GEMINI_API_KEY ||
      process.env.AI_PROVIDER_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        "No Gemini API key supplied. Falling back to deterministic simulation.",
      );
      return this.fallbackAnalysis(params.imageBuffer);
    }

    try {
      const base64Data = params.imageBuffer.toString("base64");
      const mimeType = params.mimeType || "image/jpeg";

      const promptText = `You are a professional skincare diagnosis vision AI. Analyze this face image for digital skin evaluation.
Return a valid JSON object containing numerical scores (0 to 100) for these 11 skin indicators:
- hydration
- radiance
- firmness
- fineLines
- wrinkles
- spots
- redness
- pores
- texture
- barrier
- sensitivity

Format strictly as JSON:
{
  "hydration": number,
  "radiance": number,
  "firmness": number,
  "fineLines": number,
  "wrinkles": number,
  "spots": number,
  "redness": number,
  "pores": number,
  "texture": number,
  "barrier": number,
  "sensitivity": number
}
Do not include any explanation or markdown formatting outside the JSON object.`;

      // Using Google Gemini 3.6 Flash vision model endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.2,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API returned status ${response.status}: ${errorText}`);
        return this.fallbackAnalysis(params.imageBuffer);
      }

      const responseData = (await response.json()) as any;
      const textOutput = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        this.logger.error("Gemini API response did not contain candidates content.");
        return this.fallbackAnalysis(params.imageBuffer);
      }

      const parsed = JSON.parse(textOutput.trim());
      const indicators = {} as Record<AiIndicatorKey, number>;

      for (const key of AI_INDICATOR_KEYS) {
        const val = Number(parsed[key]);
        indicators[key] = !isNaN(val) && val >= 0 && val <= 100 ? Math.round(val) : 50;
      }

      this.logger.log("Successfully analyzed skin photo using real Gemini Vision AI!");
      return { indicators, isSimulated: false };
    } catch (error) {
      this.logger.error("Error executing Gemini Vision AI analysis:", error);
      return this.fallbackAnalysis(params.imageBuffer);
    }
  }

  private fallbackAnalysis(imageBuffer: Buffer): AnalyzeImageResult {
    const digest = createHash("sha256").update(imageBuffer).digest();
    const indicators = Object.fromEntries(
      AI_INDICATOR_KEYS.map((key, index) => {
        const byteA = digest[(index * 2) % digest.length] ?? 0;
        const byteB = digest[(index * 2 + 1) % digest.length] ?? 0;
        const raw = (byteA * 256 + byteB) % 71;
        const score = 15 + raw;
        return [key, score];
      }),
    ) as Record<AiIndicatorKey, number>;

    return { indicators, isSimulated: true };
  }
}
