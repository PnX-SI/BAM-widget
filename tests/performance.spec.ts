import { test, expect, type Page, type Route } from '@playwright/test';
import { TaxonList } from './page/taxonlistcontroller';

/**
 * Network behaviour of the species list, on a simulated network: GBIF,
 * Wikidata and Commons are answered by the test, so the number and the kind
 * of requests are deterministic. Timings are read from the `bam:*` marks.
 */

const NB_TAXA = 30;
const taxonIds = Array.from({ length: NB_TAXA }, (_, i) => 1000 + i);

// 1x1 transparent PNG
const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
);

const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({
        status,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(body),
    });

interface Requests {
    facets: string[];
    occurrencePages: string[];
    lastSeen: string[];
    speciesInfo: string[];
    speciesSearch: string[];
    searchFacets: string[];
    sparql: string[];
    commonsInfo: string[];
    entityData: string[];
}

async function simulateNetwork(page: Page): Promise<Requests> {
    const requests: Requests = {
        facets: [],
        occurrencePages: [],
        lastSeen: [],
        speciesInfo: [],
        speciesSearch: [],
        searchFacets: [],
        sparql: [],
        commonsInfo: [],
        entityData: [],
    };

    await page.route('https://api.gbif.org/v1/occurrence/search**', (route) => {
        const url = new URL(route.request().url());
        const facets = url.searchParams.getAll('facet');
        const askedKeys = url.searchParams.getAll('taxonKey');
        if (askedKeys.length) {
            // which candidates of a name search were observed in the area
            requests.searchFacets.push(url.toString());
            return json(route, {
                facets: [
                    {
                        field: 'SPECIES_KEY',
                        counts: [1003, 1004]
                            .filter((id) => askedKeys.includes(String(id)))
                            .map((id) => ({ name: String(id), count: 10 })),
                    },
                ],
            });
        }
        if (facets.includes('speciesKey')) {
            requests.facets.push(url.toString());
            return json(route, {
                count: 1000,
                facets: [
                    {
                        field: 'SPECIES_KEY',
                        counts: taxonIds.map((id, i) => ({
                            name: String(id),
                            count: 100 - i,
                        })),
                    },
                    {
                        field: 'DATASET_KEY',
                        counts: [{ name: 'dataset-1', count: 1000 }],
                    },
                ],
            });
        }
        if (facets.includes('eventDate')) {
            requests.lastSeen.push(url.toString());
            return json(route, {
                facets: [
                    {
                        field: 'EVENT_DATE',
                        counts: [{ name: '2024-09-14', count: 3 }],
                    },
                ],
            });
        }
        requests.occurrencePages.push(url.toString());
        return json(route, { count: 0, results: [] });
    });

    await page.route('https://api.gbif.org/v1/species/**', (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith('/species/search')) {
            requests.speciesSearch.push(url.toString());
            return json(route, {
                results: [1003, 1004, 1005, 1006].map((nubKey) => ({
                    key: nubKey + 5_000_000,
                    nubKey,
                    scientificName: `Species ${nubKey}`,
                    rank: 'SPECIES',
                    class: 'Aves',
                })),
            });
        }
        const [, key, sub] = url.pathname.match(/species\/(\d+)\/?(.*)$/) || [];
        if (sub === 'vernacularNames') return json(route, { results: [] });
        if (sub === 'iucnRedListCategory') return json(route, { code: 'LC' });
        requests.speciesInfo.push(url.toString());
        return json(route, {
            key: Number(key),
            scientificName: `Species ${key}`,
            vernacularName: `Common ${key}`,
            class: 'Aves',
            kingdom: 'Animalia',
            rank: 'SPECIES',
        });
    });

    await page.route('https://query.wikidata.org/sparql**', (route) => {
        const url = new URL(route.request().url());
        requests.sparql.push(url.toString());
        const asked = [...url.searchParams.get('query')!.matchAll(/"(\d+)"/g)];
        return json(route, {
            results: {
                bindings: asked.map(([, id]) => ({
                    k: { value: id },
                    img: {
                        value: `http://commons.wikimedia.org/wiki/Special:FilePath/Bird%20${id}.jpg`,
                    },
                })),
            },
        });
    });

    await page.route(
        'https://www.wikidata.org/wiki/Special:EntityData/**',
        (route) => {
            requests.entityData.push(route.request().url());
            return json(route, { entities: {} });
        }
    );

    await page.route('https://commons.wikimedia.org/**', (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith('thumb.php')) {
            return route.fulfill({ contentType: 'image/png', body: PNG });
        }
        requests.commonsInfo.push(url.toString());
        const titles = url.searchParams.get('titles')!.split('|');
        const pages = Object.fromEntries(
            titles.map((title, i) => [
                i + 1,
                {
                    title,
                    imageinfo: [
                        {
                            url: 'https://upload.wikimedia.org/x.jpg',
                            extmetadata: {
                                Artist: { value: 'Someone' },
                                LicenseShortName: { value: 'CC BY' },
                            },
                        },
                    ],
                },
            ])
        );
        return json(route, { query: { pages } });
    });

    await page.route('https://upload.wikimedia.org/**', (route) =>
        route.fulfill({ contentType: 'image/png', body: PNG })
    );

    return requests;
}

const LIST_URL =
    '/#/?widgetType=list&wkt=POINT(5.7245%2045.1885)&buffer=500&lang=en&mode=detailedList';

async function readMarks(page: Page): Promise<Record<string, number>> {
    return page.evaluate(() =>
        Object.fromEntries(
            performance
                .getEntriesByType('mark')
                .filter((mark) => mark.name.startsWith('bam:'))
                .map((mark) => [mark.name, mark.startTime])
        )
    );
}

async function waitForFirstImage(page: Page) {
    await page.waitForFunction(
        () => performance.getEntriesByName('bam:first-image').length > 0
    );
}

test.describe('Species list network behaviour', () => {
    test('counts taxa with a single facet request, not occurrence pages', async ({
        page,
    }) => {
        const requests = await simulateNetwork(page);
        await page.goto(LIST_URL);

        await expect(page.getByTestId('Taxon detailed view')).toHaveCount(20);

        expect(requests.facets).toHaveLength(1);
        expect(requests.occurrencePages).toHaveLength(0);
    });

    test('completes names of displayed cards and the date of visible ones', async ({
        page,
    }) => {
        const requests = await simulateNetwork(page);
        await page.goto(LIST_URL);

        await expect(page.getByTestId('Scientific name').first()).toHaveText(
            /Species \d+/
        );
        await expect(page.getByTestId('Last seen date').first()).not.toHaveText(
            /–|…/
        );

        // 20 displayed cards out of 30 taxa
        await expect.poll(() => requests.speciesInfo.length).toBe(20);
        // the date is only asked for cards that come into view
        await expect.poll(() => requests.lastSeen.length).toBeGreaterThan(0);
        expect(requests.lastSeen.length).toBeLessThan(20);
    });

    test('resolves the pictures of the displayed cards in batches', async ({
        page,
    }) => {
        const requests = await simulateNetwork(page);
        await page.goto(LIST_URL);
        await waitForFirstImage(page);
        await page.waitForLoadState('networkidle');

        // one query per batch window instead of 3 requests per taxon
        expect(requests.sparql.length).toBeGreaterThan(0);
        expect(requests.sparql.length).toBeLessThanOrEqual(3);
        expect(requests.commonsInfo.length).toBeLessThanOrEqual(3);
        expect(requests.entityData).toHaveLength(0);
    });

    test('shows the list before the first picture', async ({ page }) => {
        await simulateNetwork(page);
        await page.goto(LIST_URL);
        await waitForFirstImage(page);

        const marks = await readMarks(page);

        expect(marks['bam:list:ready']).toBeGreaterThan(
            marks['bam:list:start']
        );
        expect(marks['bam:first-image']).toBeGreaterThanOrEqual(
            marks['bam:list:ready']
        );
    });

    test('does not ask for pictures again once they are cached', async ({
        page,
    }) => {
        const requests = await simulateNetwork(page);
        await page.goto(LIST_URL);
        await waitForFirstImage(page);
        await page.waitForLoadState('networkidle');
        // let the cache writes settle
        await page.waitForTimeout(500);
        const firstLoad = requests.sparql.length;

        await page.reload();
        await expect(page.getByTestId('Taxon detailed view')).toHaveCount(20);
        await page.waitForLoadState('networkidle');

        expect(firstLoad).toBeGreaterThan(0);
        expect(requests.sparql).toHaveLength(firstLoad);
    });

    test('sends the class filter to GBIF with a new facet request', async ({
        page,
    }) => {
        const requests = await simulateNetwork(page);
        await page.goto(LIST_URL);
        await expect(page.getByTestId('Taxon detailed view')).toHaveCount(20);
        expect(requests.facets).toHaveLength(1);

        await new TaxonList(page).setTaxonFilter('Birds');

        await expect.poll(() => requests.facets.length).toBe(2);
        const classKey = new URL(requests.facets[1]).searchParams.get(
            'classKey'
        );
        expect(classKey).toBe('212');
        expect(requests.occurrencePages).toHaveLength(0);
    });

    test('searches a common name with the source, limited to the area', async ({
        page,
    }) => {
        const requests = await simulateNetwork(page);
        await page.goto(`${LIST_URL}&showFilters=true`);
        const cards = page.getByTestId('Taxon detailed view');
        await expect(cards).toHaveCount(20);

        await new TaxonList(page).searchTaxon('merle');

        // 4 candidates found by name, 2 of them observed in the area
        await expect(cards).toHaveCount(2);
        expect(requests.speciesSearch).toHaveLength(2);
        expect(requests.searchFacets).toHaveLength(1);
        const url = new URL(requests.searchFacets[0]);
        expect(url.searchParams.getAll('taxonKey').sort()).toEqual([
            '1003',
            '1004',
            '1005',
            '1006',
        ]);
        expect(url.searchParams.get('geometry')).toContain('POLYGON');
    });

    test('shows the full list again when the search is cleared', async ({
        page,
    }) => {
        await simulateNetwork(page);
        await page.goto(`${LIST_URL}&showFilters=true`);
        const cards = page.getByTestId('Taxon detailed view');
        await expect(cards).toHaveCount(20);
        const list = new TaxonList(page);

        await list.searchTaxon('merle');
        await expect(cards).toHaveCount(2);
        await page.getByTestId('Search taxon input form').fill('');
        await page.waitForTimeout(600);

        await expect(cards).toHaveCount(20);
    });
});
