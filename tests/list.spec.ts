import { test, expect } from '@playwright/test';
import { Drawer } from './page/mapcontroller';
import { TaxonList } from './page/taxonlistcontroller';

test.describe('Simple list', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(
            'http://localhost:5173/#/?widgetType=list&x=6.076641082763673&y=44.55164823782743&GBIF_ENDPOINT=https://api.gbif-uat.org/v1/&showFilters=true&lang=en&switchModeAvailable=true'
        );
    });
    test('sort', async ({ page }) => {
        const taxonlist = new TaxonList(page);
        await taxonlist.waitForTaxonsToLoad();
        const initialCount = await taxonlist
            .getTaxonByIndex(0)
            .getByTestId('Number of observations')
            .textContent();
        await taxonlist.changeSorting('nbObservations', 'desc');
        await taxonlist
            .getTaxonByIndex(0)
            .getByTestId('Number of observations')
            .click();
        const sortedCount = await taxonlist
            .getTaxonByIndex(0)
            .getByTestId('Number of observations')
            .textContent();
        expect(parseInt(initialCount)).toBeGreaterThan(parseInt(sortedCount));
    });
    test('switchMode', async ({ page }) => {
        const taxonlist = new TaxonList(page);
        await taxonlist.waitForTaxonsToLoad();
        await taxonlist.changeMode('gallery');
        await taxonlist.waitForTaxonsToLoad();
        await taxonlist.changeMode('DetailedList');
        await taxonlist.waitForTaxonsToLoad();
    });
    const wkts = [
        'POLYGON((2.35 48.85, 2.36 48.85, 2.36 48.86, 2.35 48.86, 2.35 48.85))',
        'LINESTRING(2.35 48.85, 2.36 48.86)',
        'POINT(2.35 48.85)',
    ];
    const xandy = 'x=6.076641082763673&y=44.55164823782743';

    test('test with geojson', async ({ page }) => {
        await page.route('*/**/api/geojson', async (route: any) => {
            const geojson = {
                type: 'Polygon',
                coordinates: [
                    [
                        [2.35, 48.85],
                        [2.36, 48.85],
                        [2.36, 48.86],
                        [2.35, 48.86],
                        [2.35, 48.85],
                    ],
                ],
            };
            await route.fulfill({ geojson });
        });
        await page.goto(
            `http://localhost:5173/#/?widgetType=list&GBIF_ENDPOINT=https://api.gbif-uat.org/v1/&showFilters=true&lang=en&switchModeAvailable=true&sourceGeometry=http://api.com/api/geojson`
        );
        await new TaxonList(page).waitForTaxonsToLoad();
    });

    for (const wkt of wkts) {
        test(`test with WKT = ${wkt}`, async ({ page }) => {
            await page.goto(
                `http://localhost:5173/#/?widgetType=list&wkt=${wkt}&GBIF_ENDPOINT=https://api.gbif-uat.org/v1/&showFilters=true&lang=en&switchModeAvailable=true`
            );
            await new TaxonList(page).waitForTaxonsToLoad();
        });
    }
    test('with X and Y parameters', async ({ page }) => {
        await page.goto(
            `http://localhost:5173/#/?widgetType=list&${xandy}&GBIF_ENDPOINT=https://api.gbif-uat.org/v1/&showFilters=true&lang=en&switchModeAvailable=true`
        );
        await new TaxonList(page).waitForTaxonsToLoad();
    });
});
