import {
  computeHydrationScore,
  computePriorityConcerns,
  evaluateRecommendationRules,
  type RecommendationRuleLike,
} from "./diagnosis-rules";

const concernRule = (slug: string, range: string): RecommendationRuleLike => ({
  id: `rule-${slug}`,
  conditions: [
    { questionKey: "mainConcern", operator: "equals", value: slug, values: [] },
  ],
  resultRangeSlug: range,
  resultConcernSlugs: [slug],
  priority: 50,
});

const sensitiveOverrideRule: RecommendationRuleLike = {
  id: "rule-sensitive-override",
  conditions: [
    { questionKey: "skinType", operator: "equals", value: "sensitive", values: [] },
  ],
  resultRangeSlug: "calm",
  resultConcernSlugs: ["sensitivity"],
  priority: 100,
};

const ALL_RULES: RecommendationRuleLike[] = [
  concernRule("dehydration", "hydra"),
  concernRule("fatigue-dullness", "energize"),
  concernRule("first-signs-of-aging", "renew"),
  concernRule("sensitivity", "calm"),
  concernRule("blemishes", "purete"),
  concernRule("shine-control", "matte"),
  concernRule("dark-spots", "illumine"),
  sensitiveOverrideRule,
];

describe("evaluateRecommendationRules", () => {
  it("matches the rule whose condition equals the submitted answer", () => {
    const result = evaluateRecommendationRules(ALL_RULES, [
      { questionKey: "skinType", value: "oily" },
      { questionKey: "mainConcern", value: "shine-control" },
    ]);
    expect(result?.resultRangeSlug).toBe("matte");
  });

  it("evaluates every one of the 7 concern-to-range mappings correctly", () => {
    const expected: Record<string, string> = {
      dehydration: "hydra",
      "fatigue-dullness": "energize",
      "first-signs-of-aging": "renew",
      sensitivity: "calm",
      blemishes: "purete",
      "shine-control": "matte",
      "dark-spots": "illumine",
    };
    for (const [concern, range] of Object.entries(expected)) {
      const result = evaluateRecommendationRules(ALL_RULES, [
        { questionKey: "skinType", value: "normal" },
        { questionKey: "mainConcern", value: concern },
      ]);
      expect(result?.resultRangeSlug).toBe(range);
    }
  });

  it("lets a higher-priority rule override a lower-priority match — sensitive skin always routes to calm, even if the stated main concern points elsewhere", () => {
    const result = evaluateRecommendationRules(ALL_RULES, [
      { questionKey: "skinType", value: "sensitive" },
      { questionKey: "mainConcern", value: "dark-spots" },
    ]);
    expect(result?.resultRangeSlug).toBe("calm");
  });

  it("returns null when no rule's conditions are satisfied", () => {
    const result = evaluateRecommendationRules(ALL_RULES, [
      { questionKey: "mainConcern", value: "not-a-real-concern" },
    ]);
    expect(result).toBeNull();
  });

  it("matches an 'in' operator rule against any listed value", () => {
    const rule: RecommendationRuleLike = {
      id: "rule-in-test",
      conditions: [
        {
          questionKey: "skinType",
          operator: "in",
          value: null,
          values: ["dry", "sensitive"],
        },
      ],
      resultRangeSlug: "calm",
      resultConcernSlugs: [],
      priority: 10,
    };
    expect(
      evaluateRecommendationRules([rule], [{ questionKey: "skinType", value: "dry" }]),
    ).not.toBeNull();
    expect(
      evaluateRecommendationRules([rule], [{ questionKey: "skinType", value: "oily" }]),
    ).toBeNull();
  });

  it("requires every condition in a multi-condition rule to match (AND, not OR)", () => {
    const rule: RecommendationRuleLike = {
      id: "rule-and-test",
      conditions: [
        { questionKey: "skinType", operator: "equals", value: "oily", values: [] },
        { questionKey: "sunExposure", operator: "equals", value: "high", values: [] },
      ],
      resultRangeSlug: "matte",
      resultConcernSlugs: [],
      priority: 10,
    };
    expect(
      evaluateRecommendationRules(
        [rule],
        [
          { questionKey: "skinType", value: "oily" },
          { questionKey: "sunExposure", value: "low" },
        ],
      ),
    ).toBeNull();
    expect(
      evaluateRecommendationRules(
        [rule],
        [
          { questionKey: "skinType", value: "oily" },
          { questionKey: "sunExposure", value: "high" },
        ],
      ),
    ).not.toBeNull();
  });
});

describe("computeHydrationScore", () => {
  it("scores higher for a well-hydrated self-report than a tight/dry one", () => {
    const dry = computeHydrationScore([
      { questionKey: "hydrationLevel", value: "tight_or_dry" },
    ]);
    const wellHydrated = computeHydrationScore([
      { questionKey: "hydrationLevel", value: "well_hydrated" },
    ]);
    expect(wellHydrated).toBeGreaterThan(dry);
  });

  it("applies a climate penalty for high sun and AC exposure, clamped to [0, 100]", () => {
    const base = computeHydrationScore([
      { questionKey: "hydrationLevel", value: "tight_or_dry" },
    ]);
    const withClimatePenalty = computeHydrationScore([
      { questionKey: "hydrationLevel", value: "tight_or_dry" },
      { questionKey: "sunExposure", value: "high" },
      { questionKey: "indoorClimateExposure", value: "high" },
    ]);
    expect(withClimatePenalty).toBeLessThan(base);
    expect(withClimatePenalty).toBeGreaterThanOrEqual(0);
  });
});

describe("computePriorityConcerns", () => {
  it("puts the user's stated main concern first, deduplicated against the matched rule's concerns", () => {
    const result = computePriorityConcerns(
      [{ questionKey: "mainConcern", value: "dehydration" }],
      ["dehydration"],
    );
    expect(result).toEqual(["dehydration"]);
  });

  it("prepends the main concern when the matched rule's concerns come from a different override (e.g. sensitivity override)", () => {
    const result = computePriorityConcerns(
      [{ questionKey: "mainConcern", value: "dark-spots" }],
      ["sensitivity"],
    );
    expect(result).toEqual(["dark-spots", "sensitivity"]);
  });
});
