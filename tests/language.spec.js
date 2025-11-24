import { test, expect } from '@playwright/test';

[
    { language: 'fr', expectedTitle: 'BAM - Biodiversité autour de moi' },
    { language: 'en', expectedTitle: 'BAM - Biodiversity around me' },
].forEach(({ language, expectedTitle }) => {
    test.describe(`Language E2E tests ${language}`, () => {
        test('Change Language using the switch button', async ({ page }) => {
            //switch only in the config interface
            await page.goto('/#/config');
            await page.locator('#languageSelect').selectOption(language);
            const title = await page.title();
            expect(title).toContain(expectedTitle);
        });

        [
            { route: '/#/?widgetType=mapList&lang=', expected: expectedTitle },
            { route: '/#/config?lang=', expected: expectedTitle },
            { route: '/#/?lang=', expected: expectedTitle },
        ].forEach(({ route, expected }) => {
            test(`Change Language using the URL parameter for ${route}`, async ({
                page,
            }) => {
                const url = route + `${language}`;
                await page.goto(url);
                const title = await page.title();
                expect(title).toContain(expected);
            });
        });

        [
            {
                route: '/#/?widgetType=mapList',
                expected: ['.mapC', '#taxon-list'],
            },
            {
                route: '/#/config?widgetType=mapList',
                expected: ['#parameters', '.mapC', '#preview'],
            },
            {
                route: '/#/?wkt=POLYGON ((-64.8 32.3, -65.5 18.3, -80.3 25.2, -64.8 32.3))',
                expected: ['#taxon-list'],
            },
        ].forEach(({ route, expected }) => {
            test(`Check for block for route ${route}`, async ({ page }) => {
                await page.goto(route);
                // Use for...of instead of forEach to properly await async operations
                for (const block of expected) {
                    await expect(page.locator(block).first()).toBeVisible({
                        timeout: 10000,
                    });
                }
            });
        });
    });
});
