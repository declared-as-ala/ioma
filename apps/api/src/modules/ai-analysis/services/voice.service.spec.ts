import { VoiceService } from "./voice.service";
import { ConfigService } from "@nestjs/config";

describe("VoiceService", () => {
  let service: VoiceService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === "AI_VOICE_EN_ID") return "EXAVITQu4vr4xnSDxMaL"; // Sarah (Female)
        if (key === "AI_VOICE_AR_ID") return "ar-AE-FatimaNeural"; // Fatima (Female UAE)
        return null;
      }),
    };
    service = new VoiceService(mockConfigService as ConfigService);
  });

  it("configures female voice defaults for English and Arabic", async () => {
    const enResult = await service.synthesizeSpeech({
      text: "Welcome to IOMA Paris. Your skincare diagnosis is ready.",
      locale: "en",
    });

    expect(enResult.durationSeconds).toBeGreaterThan(0);
    expect(enResult.format).toBe("mp3");

    const arResult = await service.synthesizeSpeech({
      text: "أهلاً بكِ في إيوما باريس. تحليلكِ التجميلي جاهز للمشاهدة.",
      locale: "ar",
    });

    expect(arResult.durationSeconds).toBeGreaterThan(0);
    expect(arResult.format).toBe("mp3");
  });

  it("caches synthesized audio by text and locale", async () => {
    const text = "Your hydration level is well-balanced.";
    const first = await service.synthesizeSpeech({ text, locale: "en" });
    const second = await service.synthesizeSpeech({ text, locale: "en" });

    expect(first).toEqual(second);
  });
});
