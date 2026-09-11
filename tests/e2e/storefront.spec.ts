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
