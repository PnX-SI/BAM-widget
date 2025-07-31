import { test, expect } from "@playwright/test";

[
  { language: "fr", expectedTitle: "Biodiversité autour de moi" },
  { language: "en", expectedTitle: "Biodiversity around me" },
].forEach(({ language, expectedTitle }) => {
  test.describe(`Language E2E tests ${language}`, () => {
    test("Change Language using the switch button", async ({ page }) => {
      //switch only in the config interface
      await page.goto("/#/config");
      await page.locator("#languageSelect").selectOption(language);
      const title = await page.title();
      expect(title).toContain(expectedTitle);
    });
    [
      { route: "/#/", expected: expectedTitle },
      { route: "/#/config", expected: expectedTitle },
      { route: "/#/list", expected: expectedTitle },
    ].forEach(({ route, expected }) => {
      test(`Change Language using the URL parameter for ${route}`, async ({
        page,
      }) => {
        const url = route + `?lang=${language}`;
        await page.goto(url);
        const title = await page.title();
        expect(title).toContain(expected);
      });
    });

    [
      { route: "/#/", expected: [".mapC", "#taxon-list"] },
      { route: "/#/config", expected: ["#parameters", ".mapC", "#preview"] },
      {
        route:
          "/#/list?wkt=POLYGON ((-64.8 32.3, -65.5 18.3, -80.3 25.2, -64.8 32.3))",
        expected: ["#taxon-list"],
      },
    ].forEach(({ route, expected }) => {
      test(`Check for block for route ${route}`, async ({ page }) => {
        await page.goto(route);
        expected.forEach(async (block) => {
          await expect(page.locator(block).first()).toBeVisible();
        });
      });
    });
  });
});
