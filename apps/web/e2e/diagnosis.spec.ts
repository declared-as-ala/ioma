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

test("guest can complete the standard questionnaire and add the routine to cart", async ({
  page,
}) => {
  await page.goto("/en/diagnosis");
  await page.getByTestId("start-standard-diagnosis").click();
  await expect(page).toHaveURL(/\/en\/diagnosis\/standard$/);

  // 5 questions: skinType, hydrationLevel, mainConcern, sunExposure, indoorClimateExposure.
  await page.getByTestId("diagnosis-option-skinType-oily").click();
  await page.getByTestId("diagnosis-option-hydrationLevel-comfortable").click();
  await page.getByTestId("diagnosis-option-mainConcern-shine-control").click();
  await page.getByTestId("diagnosis-option-sunExposure-high").click();
  await page.getByTestId("diagnosis-option-indoorClimateExposure-high").click();

  await expect(page).toHaveURL(/\/en\/diagnosis\/standard\/[a-f0-9]+$/);
  await expect(
    page.getByRole("heading", { name: /your recommended routine/i }),
  ).toBeVisible();
  await expect(page.getByText("Matte", { exact: true })).toBeVisible();

  await page.getByTestId("add-routine-to-cart").click();
  await expect(
    page.getByRole("status").filter({ hasText: /added to your bag/i }),
  ).toBeVisible();
});

test("back navigation preserves earlier answers in the standard questionnaire", async ({
  page,
}) => {
  await page.goto("/en/diagnosis/standard");
  await page.getByTestId("diagnosis-option-skinType-dry").click();
  await expect(
    page.getByTestId("diagnosis-option-hydrationLevel-tight_or_dry"),
  ).toBeVisible();

  await page.getByRole("button", { name: /back/i }).click();
  await expect(page.getByTestId("diagnosis-option-skinType-dry")).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("unauthenticated visitor sees an honest sign-in prompt for AI analysis, not a broken form", async ({
  page,
}) => {
  await page.goto("/en/diagnosis/ai");
  await expect(page.getByText(/sign in to use ai skin analysis/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /^sign in$/i })).toBeVisible();
});

test("signed-in customer can complete AI consent, upload, and see a simulated result", async ({
  page,
}) => {
  const email = `ai-e2e-${Date.now()}@example.com`;

  await page.goto("/en/register");
  await page.getByLabel(/first name/i).fill("Ai");
  await page.getByLabel(/last name/i).fill("Customer");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill("AiTest12345!");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/en\/account$/);

  await page.goto("/en/diagnosis/ai");
  await page.getByTestId("ai-consent-agree").click();

  const fileInput = page.getByTestId("ai-file-input");
  await fileInput.setInputFiles(FIXTURE_IMAGE);
  await page.getByTestId("ai-submit").click();

  await expect(page).toHaveURL(/\/en\/diagnosis\/ai\/[a-f0-9]+$/);
  await expect(page.getByTestId("ai-simulated-badge")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/not a medical diagnosis/i)).toBeVisible();

  // Delete flow — confirmation required before the destructive action fires.
  await page.getByTestId("delete-ai-analysis").click();
  await page.getByRole("button", { name: /delete permanently/i }).click();
  await expect(page).toHaveURL(/\/en\/diagnosis\/history$/);
});
