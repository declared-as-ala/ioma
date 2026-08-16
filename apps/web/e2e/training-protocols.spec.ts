import { expect, test } from "@playwright/test";

test("Sprint 9: Professional Training & Protocols journey", async ({ page }) => {
  const time = Date.now();
  const proEmail = `pro-trainer-${time}@example.com`;
  const password = "Password123!";

  // 1. Register applicant
  await page.goto("/en/register");
  await page.getByLabel(/first name/i).fill("Trainer");
  await page.getByLabel(/last name/i).fill("Pro");
  await page.getByLabel(/^email$/i).fill(proEmail);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/en\/account$/);

  // 2. Submit application
  await page.goto("/en/professionals/apply");
  await page.getByLabel(/company name/i).fill("Trainer Clinic");
  await page.getByLabel(/contact person/i).fill("Trainer Pro");
  await page.getByLabel(/business type/i).click();
  await page.getByRole("option", { name: "Clinic" }).click();
  await page.getByLabel(/trade licence/i).fill(`TL-TRN-${time}`);
  await page.getByLabel(/^phone$/i).fill("+97149998877");
  await page.getByLabel(/address/i).fill("Downtown Dubai");
  await page.getByLabel(/emirate/i).click();
  await page.getByRole("option", { name: "Dubai" }).click();
  await page.getByLabel(/^city$/i).fill("Dubai");
  await page.locator("#locationsCount").fill("1");
  await page.locator("#expectedOrderVolume").fill("25k AED");
  await page.getByRole("button", { name: /submit application/i }).click();

  // 3. Admin sign in and approve
  await page.goto("/en/account");
  await page.getByRole("button", { name: /sign out/i }).click();

  await page.getByLabel(/^email$/i).fill("admin@ioma-dev.local");
  await page.getByLabel(/^password$/i).fill("ChangeMe123!");
  await page.getByRole("button", { name: /sign in/i }).click();

  await page.goto("/en/admin/professionals");
  await page
    .getByRole("button", { name: /approve/i })
    .first()
    .click();
  await page.getByRole("button", { name: /confirm approval/i }).click();

  await page.goto("/en/account");
  await page.getByRole("button", { name: /sign out/i }).click();

  // 4. Sign in as approved professional and visit trainings and protocols
  await page.getByLabel(/^email$/i).fill(proEmail);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Visit Portal Trainings
  await page.goto("/en/portal/trainings");
  await expect(
    page.getByRole("heading", { name: /training & certification/i }),
  ).toBeVisible();

  // Visit Portal Protocols
  await page.goto("/en/portal/protocols");
  await expect(page.getByRole("heading", { name: /treatment protocols/i })).toBeVisible();
});
