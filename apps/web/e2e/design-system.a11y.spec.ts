import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const locales = ["en", "fr", "ar"] as const;

for (const locale of locales) {
  test(`/design-system has no serious or critical WCAG 2.2 AA violations (${locale})`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/design-system`);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    if (seriousOrCritical.length > 0) {
      console.log(JSON.stringify(seriousOrCritical, null, 2));
    }

    expect(seriousOrCritical).toEqual([]);
  });
}
