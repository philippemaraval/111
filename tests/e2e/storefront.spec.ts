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

test("mobile homepage shows the full collection in a horizontal carousel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator("#collection article:visible")).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Découvrir le reste de la collection" })).toHaveCount(0);
  const collection = page.getByTestId("featured-collection");
  await expect(collection).toHaveCSS("overflow-x", "auto");
  expect(await collection.evaluate((element) => element.scrollWidth > element.clientWidth)).toBeTruthy();
  const edition = await page.getByTestId("edition-contents").boundingBox();
  expect(edition?.height).toBeLessThan(650);

  await expect(page.getByTestId("neighborhood-map")).toHaveCSS("min-height", "380px");
  await expect(page.getByRole("heading", { name: "Les quartiers en tête" })).toBeVisible();
  const summary = await page.getByTestId("neighborhood-summary").boundingBox();
  expect(summary?.height).toBeLessThan(400);
});

test("mobile visitors can open the vote form without leaving the map", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const search = page.getByRole("combobox", { name: "Trouve ton quartier" });
  await search.fill("Endoume");
  await page.getByRole("option", { name: /Endoume/ }).click();

  await expect(page.getByTestId("neighborhood-summary").getByRole("heading", { name: "Endoume" })).toBeVisible();
  await page.getByRole("button", { name: "Voter pour Endoume" }).click();

  const dialog = page.getByRole("dialog", { name: "Voter pour Endoume" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Ton e-mail" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Voter pour Endoume" })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});
