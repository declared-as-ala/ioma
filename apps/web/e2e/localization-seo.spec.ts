import { expect, test } from "@playwright/test";

test.describe("Sprint 11: Localization, SEO & Quality Assurance", () => {
  test("1. robots.txt is accessible and disallows admin/portal paths", async ({
    page,
  }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);

    const content = await page.content();
    expect(content).toContain("Disallow: /*/admin");
    expect(content).toContain("Disallow: /*/portal");
    expect(content).toContain("Sitemap:");
  });

  test("2. sitemap.xml is accessible and contains multi-locale URLs", async ({
    page,
  }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);

    const content = await page.content();
    expect(content).toContain("<loc>");
    expect(content).toContain("/en");
    expect(content).toContain("/fr");
    expect(content).toContain("/ar");
  });

  test("3. Arabic locale sets dir='rtl' and lang='ar'", async ({ page }) => {
    await page.goto("/ar");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");
  });

  test("4. Root page embeds Organization JSON-LD structured data", async ({ page }) => {
    await page.goto("/en");
    const script = page.locator('script[type="application/ld+json"]').first();
    await expect(script).toBeAttached();

    const jsonContent = await script.textContent();
    expect(jsonContent).toContain("IOMA Paris");
    expect(jsonContent).toContain("Organization");
  });
});
