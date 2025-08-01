import { test, expect } from "@playwright/test";

async function drawGeometry(page) {
  const map = await page.locator("#parameters").locator(".mapC");
  await map.scrollIntoViewIfNeeded();
  const box = await map.boundingBox();
  await map.getByRole("link", { name: "Draw a polygon" }).click();
  await expect(box).toBeDefined();
  // Calculate positions for polygon points
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const sideLength = Math.min(box.width, box.height) * 0.3; // Use 30% of the smaller dimension

  const squarePoints = [
    { x: centerX - sideLength / 2, y: centerY - sideLength / 2 },
    { x: centerX + sideLength / 2, y: centerY - sideLength / 2 },
    { x: centerX + sideLength / 2, y: centerY + sideLength / 2 },
    { x: centerX - sideLength / 2, y: centerY + sideLength / 2 },
  ];

  for (const point of squarePoints) {
    await page.mouse.click(point.x, point.y);
    await page.waitForTimeout(500); // Wait a bit between clicks
  }
  await page.mouse.click(squarePoints[0].x, squarePoints[0].y);
}

async function waitForLoading(page) {
  await page.getByText("Chargement en cours");
}

async function checkForParameterChange(page, key, value) {
  const currentUrl = await page.url();
  await expect(currentUrl).toContain(`${key}=${value}`);
}

test.describe("Form parameters testing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/config");
  });

  test("enable/disable filter", async ({ page }) => {
    const checkBox = page.getByRole("checkbox", {
      name: /Afficher les filtres/,
    });
    const filterBlock = page
      .locator("#taxon-list div")
      .filter({ hasText: "Nom vernaculaireNom" })
      .first();
    await checkBox.uncheck();
    await expect(filterBlock).toBeHidden();
    await checkBox.check();
    await expect(filterBlock).toBeVisible();
  });

  test("Search zone editable", async ({ page }) => {
    const checkBox = await page.getByRole("checkbox", {
      name: /Zone de recherche éditable/,
    });

    await checkBox.uncheck();
    const drawPolygonLink = await page
      .locator("#preview")
      .last()
      .getByRole("link", {
        name: "Draw a rectangle",
      });
    await expect(drawPolygonLink).toBeHidden();
    await checkBox.check();
    await expect(drawPolygonLink).toBeVisible();
  });

  test("BufferSize parameter", async ({ page }) => {
    await page.getByRole("slider", { name: /Taille du buffer/ }).fill("10");
    await page.waitForTimeout(500);
    checkForParameterChange(page, "radius", 10);
  });
  test("Change date parameter", async ({ page }) => {
    await page.getByRole("textbox", { name: /Date min/ }).fill("2025-07-17");
    await page.getByRole("textbox", { name: /Date max/ }).fill("2025-07-19");
    waitForLoading(page);
    await page.waitForTimeout(500);
    checkForParameterChange(page, "dateMin", "2025-07-17");
    checkForParameterChange(page, "dateMax", "2025-07-19");
  });

  test("Select taxon class", async ({ page }) => {
    const buttons = [
      { name: "Mammifères", param: "Mammalia" },
      { name: "Insectes", param: "Insecta" },
    ];

    for (const button of buttons) {
      await page.getByRole("button", { name: button.name }).click();
      await checkForParameterChange(page, "class", button.param);
    }
  });
  test("Set GeoJSON", async ({ page }) => {
    const urlGeoJSON = "http://test.com/fichier.geojson";
    await page
      .getByRole("textbox", { name: "Indiquer une URL vers un GeoJSON" })
      .fill(urlGeoJSON);
    await page.waitForTimeout(200);
    await checkForParameterChange(page, "sourceGeometry", urlGeoJSON);
  });
  test("Change url to taxon detail", async ({ page }) => {
    const urlTaxonDetail = "http://test.com/species/{taxonID}";
    await page
      .getByRole("textbox", { name: "https://<urlFicheDeTaxon>/" })
      .fill(urlTaxonDetail);
    await page.waitForTimeout(200);
    await checkForParameterChange(page, "customDetailPage", urlTaxonDetail);
  });

  test("Change display mode for the taxon list", async ({ page }) => {
    await drawGeometry(page);
    await page.waitForTimeout(10000);
    const modeSelect = await page.getByLabel("ModeSelection");
    await modeSelect.selectOption("gallery");
    //
    await modeSelect.selectOption("detailedList");
  });

  /**
   *
   * await page.getByLabel('widgetType')
   * await page.getByRole('spinbutton', { name: 'numberOfTaxonPerLine' })
   * await page.getByLabel('MediaSourceSelector_image')
   * getByLabel('MediaSourceSelector_sound')
   * getByRole('button', { name: /Modifier la source de données/ })
   * getByRole('button', { name: /Rafraichir les paramétres/ })
   */

  test("Draw a geometry", async ({ page }) => {
    await drawGeometry(page);
    waitForLoading(page);
  });
});
