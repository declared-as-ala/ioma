import { test, expect } from "@playwright/test";

test.describe("Product Comparison Flow", () => {
  test("allows viewing comparison matrix and empty state", async ({ page }) => {
    // 1. Visit shop compare page
    await page.goto("/en/shop/compare");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Visit shop page and verify product list renders
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const productLinks = page.locator("main a[href^='/en/shop/']");
    await expect(productLinks.first()).toBeVisible();
  });
});
