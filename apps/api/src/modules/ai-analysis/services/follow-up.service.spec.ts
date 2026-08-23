import { FollowUpService } from "./follow-up.service";

describe("FollowUpService", () => {
  let service: FollowUpService;

  beforeEach(() => {
    service = new FollowUpService();
  });

  it("creates Day 7 checkin record with validation", () => {
    const checkin = service.createCheckin(7, {
      comfortRating: 5,
      tightnessAfterCleansing: false,
      irritationNoticed: false,
      notes: "Skin feels much more hydrated.",
    });

    expect(checkin.day).toBe(7);
    expect(checkin.comfortRating).toBe(5);
    expect(checkin.completedAt).toBeDefined();
  });

  it("compares two analyses and calculates cosmetic indicator evolution", () => {
    const prev = {
      id: "analysis-1",
      createdAt: new Date("2026-07-25"),
      indicators: {
        hydration: 40,
        fineLines: 50,
        wrinkles: 45,
        pores: 60,
        spots: 40,
        unevenTone: 45,
        redness: 50,
        imperfections: 40,
        texture: 45,
        radiance: 45,
        firmness: 50,
      },
    };

    const curr = {
      id: "analysis-2",
      createdAt: new Date("2026-08-22"),
      indicators: {
        hydration: 65,
        fineLines: 45,
        wrinkles: 40,
        pores: 50,
        spots: 35,
        unevenTone: 40,
        redness: 40,
        imperfections: 30,
        texture: 60,
        radiance: 65,
        firmness: 60,
      },
    };

    const comparison = service.compareAnalyses(prev as any, curr as any);

    expect(comparison.daySpan).toBe(28);
    const hydra = comparison.indicatorChanges.find((i) => i.key === "hydration");
    expect(hydra?.trend).toBe("improved");
    expect(hydra?.diff).toBe(25);
    expect(comparison.narrative.en).toContain("visible progress");
  });
});
