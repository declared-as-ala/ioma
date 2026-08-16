import { expect, test } from "@playwright/test";

const locales = ["en", "fr", "ar"] as const;

const routes = [
  "/",
  "/maison",
  "/technology",
  "/treatments",
  "/treatments/diagnosis-consultation",
  "/treatments/hydra-protocol",
  "/treatments/renew-protocol",
  "/treatments/calm-protocol",
  "/professionals",
  "/contact",
  "/faq",
  "/journal",
  "/journal/dubai-summer-barrier-routine",
  "/journal/reading-a-diagnosis",
  "/privacy-policy",
  "/cookie-policy",
  "/shipping-policy",
  "/return-policy",
  "/terms-and-conditions",
  "/accessibility-statement",
  "/ai-consent",
];

// Sprint 3 acceptance criteria (SPRINTS.md): every public route reachable
// from nav, live in all 3 locales, no console errors, correct `dir` on `ar`.
for (const locale of locales) {
  for (const route of routes) {
    test(`${locale}${route} loads with no console errors and correct dir`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => pageErrors.push(err.message));

      const response = await page.goto(`/${locale}${route}`);
      expect(response?.status(), `HTTP status for /${locale}${route}`).toBe(200);

      const html = page.locator("html");
      await expect(html).toHaveAttribute("lang", locale);
      await expect(html).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");

      expect(consoleErrors, `console errors on /${locale}${route}`).toEqual([]);
      expect(pageErrors, `uncaught page errors on /${locale}${route}`).toEqual([]);
    });
  }
}
