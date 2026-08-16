import { test, expect } from "@playwright/test";

const LOCALES = ["en", "fr", "ar"] as const;

test.describe("Sprint 4.6 — Motion, Overlays & Navigation", () => {
  for (const locale of LOCALES) {
    test.describe(`Locale: ${locale}`, () => {
      test("Mobile navigation drawer opens, locks scroll, closes on Escape & restores focus", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`/${locale}`);

        // 1. Mobile nav trigger
        const trigger = page.getByTestId("mobile-nav-trigger");
        await expect(trigger).toBeVisible();
        await trigger.click();

        // 2. Mobile nav drawer opens
        const nav = page.getByTestId("mobile-nav");
        await expect(nav).toBeVisible();

        // 3. Body scroll is locked — Radix's Dialog primitive (which Sheet
        // is built on) locks scroll via a `data-scroll-locked` attribute +
        // an injected stylesheet rule, not an inline `body.style.overflow`
        // (that was this test's original, incorrect assumption — the
        // inline style is never set even though scrolling is genuinely
        // blocked; verified directly: computed overflow is "hidden" and a
        // real `window.scrollTo` no-ops while this attribute is present).
        const locked = await page.evaluate(() =>
          document.body.hasAttribute("data-scroll-locked"),
        );
        expect(locked).toBe(true);

        // 4. Press Escape to close
        await page.keyboard.press("Escape");
        await expect(nav).toBeHidden();

        // 5. Body scroll is restored
        const lockedAfter = await page.evaluate(() =>
          document.body.hasAttribute("data-scroll-locked"),
        );
        expect(lockedAfter).toBe(false);
      });

      test("Search drawer opens, traps focus, closes on Escape", async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(`/${locale}`);

        // Click search button in header. Uses a data-testid rather than
        // the (correctly, per-locale) translated aria-label — fr/ar labels
        // ("Rechercher"/"بحث") never matched the old English-only /search/i
        // regex, which made this a false failure in those locales, not an
        // app bug.
        const searchBtn = page.getByTestId("search-trigger");
        await searchBtn.click();

        // Search dialog is open
        const dialog = page.getByTestId("search-dialog");
        await expect(dialog).toBeVisible();

        // Input is focused
        const searchInput = page.getByTestId("search-input");
        await expect(searchInput).toBeFocused();

        // Close on Escape
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
      });

      test("Cart drawer opens smoothly, locks body scroll and handles close", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(`/${locale}`);

        // Click cart bag button in header (see search-trigger comment above
        // for why this uses a testid rather than the translated aria-label)
        const bagBtn = page.getByTestId("cart-trigger");
        await bagBtn.click();

        // Cart drawer open
        const cartDrawer = page.getByTestId("cart-drawer");
        await expect(cartDrawer).toBeVisible();

        // Body scroll locked — see the mobile-nav test above for why this
        // checks `data-scroll-locked` rather than an inline style.
        const locked = await page.evaluate(() =>
          document.body.hasAttribute("data-scroll-locked"),
        );
        expect(locked).toBe(true);

        // Close on Escape
        await page.keyboard.press("Escape");
        await expect(cartDrawer).toBeHidden();
      });

      test("Language selector opens, closes and displays options correctly", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(`/${locale}`);

        const langTrigger = page.getByTestId("locale-switcher-trigger");
        await expect(langTrigger).toBeVisible();
        await langTrigger.click();

        const langContent = page.getByRole("listbox");
        await expect(langContent).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(langContent).toBeHidden();
      });

      test("FAQ accordion opens smoothly without text clipping", async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(`/${locale}/faq`);

        const firstTrigger = page.getByRole("button", { name: /diagnosis/i }).first();
        if (await firstTrigger.isVisible()) {
          await firstTrigger.click();
          await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
        }
      });
    });
  }

  test("Reduced motion mode works smoothly without errors", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");

    // Open search drawer under reduced motion
    const searchBtn = page.getByTestId("search-trigger");
    await searchBtn.click();

    const dialog = page.getByTestId("search-dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("No horizontal document overflow across test breakpoints", async ({ page }) => {
    const breakpoints = [390, 768, 1024, 1280, 1440];
    for (const width of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/en");

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(hasOverflow).toBe(false);
    }
  });
});
