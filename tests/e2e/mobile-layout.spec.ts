import { expect, test } from "@playwright/test";

for (const width of [320, 390, 430]) {
  test(`support pages fit a ${width}px phone`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/contact", "/guide-des-tailles", "/confidentialite", "/admin/login"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1").first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBeLessThanOrEqual(width);
    }
    await page.goto("/contact");
    for (const field of ["name", "email", "subject", "message"]) {
      const input = page.locator(`[name="${field}"]`);
      await input.fill(field === "email" ? "visiteur@example.com" : "Une question sur mon quartier");
      const box = await input.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
  });
}
