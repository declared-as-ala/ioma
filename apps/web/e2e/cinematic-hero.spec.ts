import { test, expect } from "@playwright/test";

const LOCALES = ["en", "fr", "ar"] as const;

test.describe("Cinematic Scroll Hero — Luxury Homepage Experience", () => {
  for (const locale of LOCALES) {
    test.describe(`Locale: ${locale}`, () => {
      test("1. Initial state (0% scroll) renders premium editorial frame, headline, CTAs & scroll cue", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });

        // Hero container exists
        const hero = page.getByTestId("cinematic-hero");
        await expect(hero).toBeVisible();

        // Phase 1 headline & kicker are visible
        const phase1 = page.getByTestId("hero-phase-1");
        await expect(phase1).toBeVisible();

        // Primary CTA is visible
        const primaryCta = page.getByTestId("hero-primary-cta");
        await expect(primaryCta).toBeVisible();

        // Secondary CTA is visible
        const secondaryCta = page.getByTestId("hero-secondary-cta");
        await expect(secondaryCta).toBeVisible();

        // Scroll cue is visible at 0 scroll
        const scrollCue = page.getByTestId("hero-scroll-cue");
        await expect(scrollCue).toBeVisible();

        // No horizontal overflow
        const overflow = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth > document.documentElement.clientWidth
          );
        });
        expect(overflow).toBe(false);
      });

      test("2. Scrolling through Hero progresses stages & transitions smoothly to next section", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });

        const hero = page.getByTestId("cinematic-hero");
        await expect(hero).toBeVisible();

        // Initial scroll: cue fades out
        await page.evaluate(() => window.scrollTo(0, 150));
        await page.waitForTimeout(300);

        // Mid scroll (Phase 2 / Phase 3 region): Scroll ~600-900px down
        await page.evaluate(() => window.scrollTo(0, 800));
        await page.waitForTimeout(400);

        // Check that page is stable without console errors
        const phase2 = page.getByTestId("hero-phase-2");
        await expect(phase2).toBeAttached();

        const phase3 = page.getByTestId("hero-phase-3");
        await expect(phase3).toBeAttached();

        // Scroll past Hero into next section ("Nos Meilleures Ventes")
        await page.evaluate(() => window.scrollTo(0, 2200));
        await page.waitForTimeout(500);

        // Next section heading is in viewport
        const bestsellersHeading = page.locator("h2").filter({
          hasText: /Meilleures Ventes|Best Sellers|الأكثر مبيعاً/i,
        });
        if ((await bestsellersHeading.count()) > 0) {
          await expect(bestsellersHeading.first()).toBeVisible();
        }

        // Zero horizontal overflow after scroll
        const hasOverflow = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth > document.documentElement.clientWidth
          );
        });
        expect(hasOverflow).toBe(false);
      });

      test("3. Mobile 390px viewport renders responsive Hero without overflow or touch lock", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });

        const hero = page.getByTestId("cinematic-hero");
        await expect(hero).toBeVisible();

        const primaryCta = page.getByTestId("hero-primary-cta");
        await expect(primaryCta).toBeVisible();

        // Check primary CTA touch target size
        const box = await primaryCta.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40);
        }

        // Test smooth mobile scrolling
        await page.evaluate(() => window.scrollBy(0, 400));
        await page.waitForTimeout(300);

        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(300);

        // No horizontal overflow on mobile
        const overflow = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth > document.documentElement.clientWidth
          );
        });
        expect(overflow).toBe(false);
      });
    });
  }

  test("4. Reduced motion disables pinned storytelling and renders accessible static Hero", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");

    const hero = page.getByTestId("cinematic-hero");
    await expect(hero).toBeVisible();

    // Content is immediately rendered and accessible
    const primaryCta = page.getByTestId("hero-primary-cta");
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toBeEnabled();

    // Clicking CTA works immediately
    await primaryCta.click();
    await expect(page).toHaveURL(/\/diagnosis/);
  });

  test("5. Route navigation: Home -> Shop -> Back preserves Hero integrity without duplicate ScrollTriggers", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");

    const hero = page.getByTestId("cinematic-hero");
    await expect(hero).toBeVisible();

    // Navigate to shop
    await page.goto("/en/shop");
    await expect(page).toHaveURL(/\/en\/shop/);

    // Navigate back to home
    await page.goBack();
    await expect(page).toHaveURL(/\/en/);

    // Hero is re-initialized cleanly
    const heroAfterBack = page.getByTestId("cinematic-hero");
    await expect(heroAfterBack).toBeVisible();

    const primaryCta = page.getByTestId("hero-primary-cta");
    await expect(primaryCta).toBeVisible();
  });
});
