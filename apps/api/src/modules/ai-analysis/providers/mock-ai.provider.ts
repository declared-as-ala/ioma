import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { AI_INDICATOR_KEYS, type AiIndicatorKey } from "@ioma/config";
import type {
  AIProvider,
  AnalyzeImageParams,
  AnalyzeImageResult,
} from "./ai-provider.interface";

// Default provider — see ENVIRONMENT.md `AI_PROVIDER=mock` and
// CLIENT_REQUIREMENTS.md (no real vision-AI vendor/credentials selected
// yet). Scores are derived from a deterministic hash of the uploaded
// image's bytes, not `Math.random()` — re-processing the exact same image
// always yields the exact same result, which keeps this genuinely testable
// and avoids the "meaningless random noise" feel a naive mock would have,
// while still being clearly and honestly a simulation (isSimulated: true,
// surfaced in the UI — see CLAUDE.md / SECURITY.md).
@Injectable()
export class MockAIProvider implements AIProvider {
  readonly name = "mock";

  async analyze(params: AnalyzeImageParams): Promise<AnalyzeImageResult> {
    const digest = createHash("sha256").update(params.imageBuffer).digest();

    const indicators = Object.fromEntries(
      AI_INDICATOR_KEYS.map((key, index) => {
        // Two bytes per indicator, spread across the digest, mapped to a
        // 15-85 range so results always read as a plausible mixed skin
        // profile rather than degenerate all-0/all-100 extremes.
        const byteA = digest[(index * 2) % digest.length] ?? 0;
        const byteB = digest[(index * 2 + 1) % digest.length] ?? 0;
        const raw = (byteA * 256 + byteB) % 71; // 0-70
        const score = 15 + raw; // 15-85
        return [key, score];
      }),
    ) as Record<AiIndicatorKey, number>;

    return { indicators, isSimulated: true };
  }
}
