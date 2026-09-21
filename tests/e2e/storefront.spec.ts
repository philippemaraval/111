import { expect, test } from "@playwright/test";

test("storefront and support routes render", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByText("Un peu vide, non ?")).toBeVisible();
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: /Connexion|Gérer la collection/ }).first()).toBeVisible();
});

test("SEO endpoints are valid", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("sitemap.xml");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("/quartier/");
});

test("mobile homepage keeps collection and voting sections compact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator("#collection article:visible")).toHaveCount(3);
  await page.getByRole("button", { name: "Découvrir le reste de la collection" }).click();
  await expect(page.locator("#collection article:visible")).toHaveCount(5);
  await page.getByRole("button", { name: "Réduire la collection" }).click();
  await expect(page.locator("#collection article:visible")).toHaveCount(3);

  await expect(page.getByTestId("neighborhood-map")).toHaveCSS("min-height", "380px");
  await expect(page.getByRole("heading", { name: "Les quartiers en tête" })).toBeVisible();
  const summary = await page.getByTestId("neighborhood-summary").boundingBox();
  expect(summary?.height).toBeLessThan(400);
});
