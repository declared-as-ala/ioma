import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

test("Capture high-res visual screenshots across viewports & scroll phases", async ({
  page,
}) => {
  const outDir = path.resolve(__dirname, "../../../scratch/screenshots");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const viewports = [
    { name: "1440x900", width: 1440, height: 900 },
    { name: "1280x800", width: 1280, height: 800 },
    { name: "1024x768", width: 1024, height: 768 },
    { name: "768x1024", width: 768, height: 1024 },
    { name: "390x844", width: 390, height: 844 },
  ];

  const scrollPercents = [
    { name: "0pct", factor: 0 },
    { name: "25pct", factor: 0.25 },
    { name: "50pct", factor: 0.5 },
    { name: "75pct", factor: 0.75 },
    { name: "after-hero", factor: 1.15 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/fr", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);

    const hero = page.getByTestId("cinematic-hero");
    const heroBox = await hero.boundingBox();
    const heroHeight = heroBox?.height ?? vp.height * 2;

    for (const sp of scrollPercents) {
      const scrollY = sp.factor * (heroHeight - vp.height);
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(300);

      const filePath = path.join(outDir, `hero-${vp.name}-${sp.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${filePath}`);
    }
  }

  // Arabic RTL screenshot
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ar", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(outDir, `hero-1440x900-ar-0pct.png`),
    fullPage: false,
  });
  console.log("Saved Arabic RTL screenshot");
});
