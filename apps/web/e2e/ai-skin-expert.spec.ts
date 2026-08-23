import path from "node:path";
import { expect, test } from "@playwright/test";

const FIXTURE_IMAGE = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "homepage",
  "diagnosis-device.png",
);

test.describe("IOMA AI Skin Expert 2.0 Consultation Journey", () => {
  test("guest can access /en/diagnosis and explore How It Works modal", async ({
    page,
  }) => {
    await page.goto("/en/diagnosis");

    await expect(
      page.getByRole("heading", {
        name: /discover a skincare ritual designed around your skin/i,
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: /how it works/i }).click();
    await expect(page.getByText(/the ioma skin science method/i)).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("full consultation flow: consent -> photo -> adaptive questions -> 3-tier routine & chat", async ({
    page,
  }) => {
    await page.goto("/en/diagnosis");

    // 1. Start consultation
    await page.getByTestId("start-ai-skin-expert").click();

    // 2. Consent step
    await expect(page.getByText(/privacy & consent/i)).toBeVisible();
    await page.getByTestId("ai-consent-agree").click();

    // 3. Photo Capture step (upload fixture)
    await page
      .getByTestId("upload-instead-button")
      .or(page.getByRole("button", { name: /upload photo file/i }))
      .click();
    const fileInput = page.getByTestId("ai-file-input");
    await fileInput.setInputFiles(FIXTURE_IMAGE);

    await expect(
      page.getByRole("heading", { name: /review your skin photograph/i }),
    ).toBeVisible();
    await page.getByTestId("use-photo-button").click();

    // 4. Staged Loading / Analysis -> Consultation Questions
    await expect(
      page.getByRole("heading", { name: /your adaptive consultation/i }),
    ).toBeVisible({ timeout: 15000 });

    // Step through adaptive questions
    const nextBtn = page.getByTestId("consultation-next-button");

    // Click through each question options
    const firstOption = page.locator("[data-testid^='consultation-option-']").first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await nextBtn.click();
    }

    // Enter routine text if prompted
    const routineInput = page.getByTestId("consultation-routine-input");
    if (await routineInput.isVisible()) {
      await routineInput.fill(
        "Gentle cleanser, Vitamin C serum in the morning, daily SPF 50",
      );
      await nextBtn.click();
    }

    // Complete remaining questions until finish
    while (await nextBtn.isVisible()) {
      const opt = page.locator("[data-testid^='consultation-option-']").first();
      if (await opt.isVisible()) {
        await opt.click();
      }
      await nextBtn.click();
      if (await page.getByRole("button", { name: /build my ioma ritual/i }).isVisible()) {
        await page.getByRole("button", { name: /build my ioma ritual/i }).click();
        break;
      }
    }

    // 5. Result Page Verification
    await expect(page).toHaveURL(/\/en\/diagnosis\/ai\/[a-f0-9]+$/, { timeout: 15000 });

    // Section 1: Your Skin Today
    await expect(page.getByRole("heading", { name: /your skin today/i })).toBeVisible();

    // Section 2 & 3: Skin Profile & Priorities
    await expect(page.getByRole("heading", { name: /your skin profile/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /your skin priorities/i }),
    ).toBeVisible();

    // Section 5: 3-tier Routine Selector Tabs
    await expect(page.getByTestId("routine-tier-tab-essential")).toBeVisible();
    await expect(page.getByTestId("routine-tier-tab-complete")).toBeVisible();
    await expect(page.getByTestId("routine-tier-tab-premium")).toBeVisible();

    // Switch to Essential Tab
    await page.getByTestId("routine-tier-tab-essential").click();
    await expect(page.getByText(/selected essential ritual/i)).toBeVisible();

    // Switch to Premium Tab
    await page.getByTestId("routine-tier-tab-premium").click();
    await expect(page.getByText(/selected haute skincare ritual/i)).toBeVisible();

    // Section 8: Interactive Chat Consultant
    await expect(
      page.getByRole("heading", { name: /ask your ioma skin expert/i }),
    ).toBeVisible();
    const chatInput = page.getByTestId("ai-chat-input");
    await chatInput.fill("Can I use my current Vitamin C with this ritual?");
    await page.getByTestId("ai-chat-send-button").click();

    await expect(page.getByText(/vitamin c/i)).toBeVisible({ timeout: 10000 });

    // Section 9: Add complete routine to bag
    await page.getByTestId("add-entire-routine-button").click();
  });

  test("multilingual Arabic RTL layout rendered correctly", async ({ page }) => {
    await page.goto("/ar/diagnosis");

    await expect(
      page.getByRole("heading", {
        name: /اكتشفي روتين عناية مصمم خصيصًا حول احتياجات بشرتك/i,
      }),
    ).toBeVisible();

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
});
