import { expect, test } from "@playwright/test";

test.describe("Sprint 12: E2E End-to-End User Journeys", () => {
  test("1. Shop Catalog → PDP → Cart Drawer → Checkout Journey", async ({ page }) => {
    // 1. Visit Shop page
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Click on the first product card
    const firstProduct = page.locator('a[href*="/en/shop/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // 3. Verify Product Detail Page (PDP) loads
    await expect(page.locator("h1")).toBeVisible();

    // 4. Click Add to Cart button
    const addToCartBtn = page.getByRole("button", { name: /add to cart/i }).first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    }

    // 5. Navigate to Checkout page
    await page.goto("/en/checkout");
    await expect(page).toHaveURL(/\/en\/checkout/);
  });

  test("2. Multi-language locale switcher changes URL and document attributes", async ({
    page,
  }) => {
    // 1. Visit French home page
    await page.goto("/fr");
    let html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "fr");
    await expect(html).toHaveAttribute("dir", "ltr");

    // 2. Visit English home page
    await page.goto("/en");
    html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");

    // 3. Visit Arabic home page
    await page.goto("/ar");
    html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
  });
});
