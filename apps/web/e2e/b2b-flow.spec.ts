import { expect, test } from "@playwright/test";

test("B2B journey: register → submit application → admin approve → portal access & catalog", async ({
  page,
}) => {
  const time = Date.now();
  const proEmail = `b2b-applicant-${time}@example.com`;
  const password = "Password123!";

  // 1. Register a new user account
  await page.goto("/en/register");
  await page.getByLabel(/first name/i).fill("Professional");
  await page.getByLabel(/last name/i).fill("Owner");
  await page.getByLabel(/^email$/i).fill(proEmail);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/en\/account$/);

  // 2. Unapproved user navigating to /portal is redirected or shown access required
  await page.goto("/en/portal");
  await expect(
    page.getByText(/professional portal access/i).or(page.getByText(/access required/i)),
  ).toBeVisible();

  // 3. Submit Professional Application
  await page.goto("/en/professionals/apply");
  await page.getByLabel(/company name/i).fill("Palace Spa Dubai");
  await page.getByLabel(/contact person/i).fill("Professional Owner");

  await page.getByLabel(/business type/i).click();
  await page.getByRole("option", { name: "Spa" }).click();

  await page.getByLabel(/trade licence/i).fill(`TL-DXB-${time}`);
  await page.getByLabel(/^phone$/i).fill("+97141234567");
  await page.getByLabel(/address/i).fill("Palm Jumeirah");

  await page.getByLabel(/emirate/i).click();
  await page.getByRole("option", { name: "Dubai" }).click();

  await page.getByLabel(/^city$/i).fill("Dubai");
  await page.locator("#locationsCount").fill("2");
  await page.locator("#expectedOrderVolume").fill("50k AED");

  await page.getByRole("button", { name: /submit application/i }).click();
  await expect(page.getByText(/application submitted/i)).toBeVisible();

  // 4. Admin logs in and approves application
  // Sign out applicant
  await page.goto("/en/account");
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/en\/login$/);

  // Sign in as admin (seed admin)
  await page.getByLabel(/^email$/i).fill("admin@ioma-dev.local");
  await page.getByLabel(/^password$/i).fill("ChangeMe123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/en\/account$/);

  // Navigate to Admin Professionals management
  await page.goto("/en/admin/professionals");
  await expect(page.getByText("Palace Spa Dubai")).toBeVisible();

  // Approve application
  await page
    .getByRole("button", { name: /approve/i })
    .first()
    .click();
  await page.getByRole("button", { name: /confirm approval/i }).click();
  await expect(page.getByText("Palace Spa Dubai")).not.toBeVisible();

  // Sign out admin
  await page.goto("/en/account");
  await page.getByRole("button", { name: /sign out/i }).click();

  // 5. Sign in back as approved professional
  await page.getByLabel(/^email$/i).fill(proEmail);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Access B2B Portal
  await page.goto("/en/portal");
  await expect(page.getByRole("heading", { name: /professional portal/i })).toBeVisible();

  // Browse B2B Catalog
  await page.goto("/en/portal/catalog");
  await expect(
    page.getByRole("heading", { name: /professional catalog/i }),
  ).toBeVisible();
  await expect(
    page
      .getByText(/wholesale/i)
      .or(page.getByText(/moq/i))
      .first(),
  ).toBeVisible();
});
