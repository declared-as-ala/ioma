import { AI_INDICATOR_KEYS } from "@ioma/config";
import { recommendRangeFromIndicators, type IndicatorScores } from "./ai-analysis-rules";

// A neutral 50 baseline for every indicator gives every range an equal
// need-score of 50 regardless of whether it's driven by lowIsBad or
// highIsBad indicators, so overriding a specific indicator cleanly isolates
// that one range's need score for the assertion.
function neutralIndicators(overrides: Partial<IndicatorScores> = {}): IndicatorScores {
  const base = Object.fromEntries(
    AI_INDICATOR_KEYS.map((k) => [k, 50]),
  ) as IndicatorScores;
  return { ...base, ...overrides };
}

describe("recommendRangeFromIndicators", () => {
  it("recommends hydra when hydration is the clear weak point", () => {
    const result = recommendRangeFromIndicators(neutralIndicators({ hydration: 10 }));
    expect(result.range).toBe("hydra");
  });

  it("recommends calm when redness is the clear weak point (a highIsBad indicator)", () => {
    const result = recommendRangeFromIndicators(neutralIndicators({ redness: 95 }));
    expect(result.range).toBe("calm");
  });

  it("recommends renew when firmness is low and fine lines/wrinkles are both high", () => {
    const result = recommendRangeFromIndicators(
      neutralIndicators({ firmness: 15, fineLines: 90, wrinkles: 90 }),
    );
    expect(result.range).toBe("renew");
  });

  it("recommends illumine when spots and unevenTone are both elevated", () => {
    const result = recommendRangeFromIndicators(
      neutralIndicators({ spots: 92, unevenTone: 88 }),
    );
    expect(result.range).toBe("illumine");
  });

  it("picks the single worst range when multiple are mildly off but one is clearly worst", () => {
    const result = recommendRangeFromIndicators(
      // hydration/radiance only mildly below the neutral baseline (mild
      // need); imperfections/pores clearly elevated (high need, since
      // these are highIsBad indicators — a high value is the bad case).
      neutralIndicators({ hydration: 60, radiance: 55, imperfections: 90, pores: 85 }),
    );
    expect(result.range).toBe("purete");
  });
});
