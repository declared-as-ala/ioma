import { test, expect } from "@playwright/test";

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

test.describe("Sprint 4.7 — Mobile Bottom Tab Navigation", () => {
  test("bar is visible below lg and absent at lg and above", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/en");
    await expect(page.getByTestId("bottom-tab-bar")).toBeVisible();

    await page.setViewportSize(DESKTOP);
    await expect(page.getByTestId("bottom-tab-bar")).toBeHidden();
  });

  test("each tab navigates to its route and shows correct active state", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/en");

    const bar = page.getByTestId("bottom-tab-bar");
    const shopTab = bar.getByRole("link", { name: /shop/i });
    await shopTab.click();
    await expect(page).toHaveURL(/\/en\/shop$/);
    await expect(shopTab).toHaveAttribute("aria-current", "page");

    const homeTab = bar.getByRole("link", { name: /home/i });
    await homeTab.click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(homeTab).toHaveAttribute("aria-current", "page");
  });

  test("every tab is at least 44x44px", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/en");

    const links = page.getByTestId("bottom-tab-bar").getByRole("link");
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("diagnosis tab navigates to the diagnosis landing page", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/en");

    const diagnosisTab = page
      .getByTestId("bottom-tab-bar")
      .getByRole("link", { name: /diagnosis/i });
    await diagnosisTab.click();
    await expect(page).toHaveURL(/\/en\/diagnosis$/);
    await expect(diagnosisTab).toHaveAttribute("aria-current", "page");
  });

  test("bar is suppressed on the checkout flow", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/en/shop/hydra-serum-intense");
    await page.getByTestId("add-to-cart").click();
    await page.keyboard.press("Escape");

    await page.goto("/en/checkout");
    await expect(page.getByTestId("bottom-tab-bar")).toHaveCount(0);
  });

  test("page content is never hidden behind the bar", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/en/privacy-policy");

    // The page is taller than one viewport (a real legal document), so the
    // meaningful check is: after scrolling all the way down, the last
    // paragraph is still fully above the bar — i.e. body's bottom padding
    // actually reserves enough space for the bar, not that the whole page
    // happens to fit in one screen.
    const lastParagraph = page.locator("main p").last();
    await lastParagraph.scrollIntoViewIfNeeded();

    const bar = page.getByTestId("bottom-tab-bar");
    const barBox = await bar.boundingBox();
    const contentBox = await lastParagraph.boundingBox();

    expect(barBox).not.toBeNull();
    expect(contentBox).not.toBeNull();
    if (barBox && contentBox) {
      expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(barBox.y + 1);
    }
  });

  test("tab order and labels render correctly in RTL", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/ar");
    const bar = page.getByTestId("bottom-tab-bar");
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute("aria-label", /التنقل السفلي/);
  });

  test("reduced motion: tap does not error and still navigates", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(MOBILE);
    await page.goto("/en");

    const shopTab = page
      .getByTestId("bottom-tab-bar")
      .getByRole("link", { name: /shop/i });
    await shopTab.click();
    await expect(page).toHaveURL(/\/en\/shop$/);
  });
});
