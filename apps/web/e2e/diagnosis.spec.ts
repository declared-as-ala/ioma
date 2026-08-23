import path from "node:path";
import { expect, test } from "@playwright/test";

test.describe("Diagnosis routing and navigation", () => {
  test("visiting /en/diagnosis displays the flagship AI Skin Expert 2.0 consultation", async ({
    page,
  }) => {
    await page.goto("/en/diagnosis");
    await expect(
      page.getByRole("heading", {
        name: /discover a skincare ritual designed around your skin/i,
      }),
    ).toBeVisible();
    await expect(page.getByTestId("start-ai-skin-expert")).toBeVisible();
  });

  test("/en/diagnosis/ai redirects smoothly to /en/diagnosis", async ({ page }) => {
    await page.goto("/en/diagnosis/ai");
    await expect(page).toHaveURL(/\/en\/diagnosis$/);
  });
});
