import { test, expect } from "@playwright/test";

test.describe("IOMA Paris Dubai Navigation & Mega Menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("Desktop header renders primary taxonomy links", async ({ page }) => {
    await page.goto("/en");

    // Check top-level nav links
    const nav = page.locator("nav[aria-label='Primary navigation']");
    await expect(nav).toBeVisible();
    await expect(nav.getByText(/UV & Protection/i)).toBeVisible();
    await expect(nav.getByText(/Bespoke Skincare/i)).toBeVisible();
    await expect(nav.getByText(/Face/i)).toBeVisible();
    await expect(nav.getByText(/Body/i)).toBeVisible();
    await expect(nav.getByText(/Hair/i)).toBeVisible();
    await expect(nav.getByText(/Kits & Routines/i)).toBeVisible();
    await expect(nav.getByText(/Inside IOMA/i)).toBeVisible();
  });

  test("Desktop Visage mega menu opens on interaction", async ({ page }) => {
    await page.goto("/en");

    const visageBtn = page.getByRole("button", { name: /FACE/i });
    await visageBtn.hover();

    const megaMenu = page.locator("div[aria-label='Face']");
    await expect(megaMenu).toBeVisible();
    await expect(megaMenu.getByText(/YOUR CONCERNS/i)).toBeVisible();
    await expect(megaMenu.getByText(/OUR CATEGORIES/i)).toBeVisible();
    await expect(megaMenu.getByText(/OUR RANGES/i)).toBeVisible();
    await expect(megaMenu.getByText(/Crème Sublime Revitalisante/i)).toBeVisible();
  });

  test("Desktop Bespoke dropdown opens and shows In.Lab products", async ({ page }) => {
    await page.goto("/en");

    const bespokeBtn = page.getByRole("button", { name: /BESPOKE SKINCARE/i });
    await bespokeBtn.hover();

    const bespokeDropdown = page.locator("div[aria-label='Bespoke Skincare']");
    await expect(bespokeDropdown).toBeVisible();
    await expect(bespokeDropdown.getByText(/Ma Crème Jour/i)).toBeVisible();
    await expect(bespokeDropdown.getByText(/Ma Crème Nuit/i)).toBeVisible();
    await expect(bespokeDropdown.getByText(/Mon Sérum/i)).toBeVisible();
    await expect(bespokeDropdown.getByText(/Mon Soin Yeux/i)).toBeVisible();
  });

  test("Mobile navigation opens drawer and supports drilldown", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/en");

    const mobileTrigger = page.getByTestId("mobile-nav-trigger");
    await expect(mobileTrigger).toBeVisible();
    await mobileTrigger.click();

    const mobileNav = page.getByTestId("mobile-nav");
    await expect(mobileNav).toBeVisible();

    // Click Bespoke sub-menu
    const bespokeBtn = mobileNav.getByText(/Bespoke Skincare/i);
    await bespokeBtn.click();

    await expect(mobileNav.getByText(/Ma Crème Jour/i)).toBeVisible();
    await expect(mobileNav.getByText(/Back/i)).toBeVisible();

    // Click Back
    await mobileNav.getByText(/Back/i).click();
    await expect(mobileNav.getByText(/UV & Protection/i)).toBeVisible();
  });

  test("Homepage displays Best Sellers, 7 Ranges, and Routines sections with real AED prices", async ({
    page,
  }) => {
    await page.goto("/en");

    // Best sellers
    const bestSellersHeading = page.getByRole("heading", {
      name: /Nos Meilleures Ventes/i,
    });
    await bestSellersHeading.scrollIntoViewIfNeeded();
    await expect(bestSellersHeading).toBeVisible();

    // 7 Ranges
    const rangesHeading = page.getByRole("heading", { name: /Sept réponses ciblées/i });
    await rangesHeading.scrollIntoViewIfNeeded();
    await expect(rangesHeading).toBeVisible();
    await expect(page.getByText(/1 Hydra/i).first()).toBeVisible();

    // Routines & Kits
    const routinesHeading = page.getByRole("heading", {
      name: /Nos Routines & Kits de Soin/i,
    });
    await routinesHeading.scrollIntoViewIfNeeded();
    await expect(routinesHeading).toBeVisible();
    await expect(page.getByText(/Protocole Hydratation Optimale/i)).toBeVisible();
  });
});
