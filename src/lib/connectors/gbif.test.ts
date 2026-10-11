import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../parameterStore', () => ({ default: { getInstance: () => ({}) } }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

// connector.ts <-> utils.ts <-> gbif.ts form an import cycle that only
// resolves when utils.ts is loaded first (same order as the app).
import './utils';
import {
    facetsToSearchResult,
    GbifConnector,
    mergeOccurrencePage,
} from './gbif';
import { Dataset, Taxon } from '../models';

const obs = (taxonKey: number, eventDate: string, datasetKey = 'ds1') => ({
    taxonKey,
    datasetKey,
    eventDate,
    acceptedScientificName: `Taxon ${taxonKey}`,
    vernacularName: `Name ${taxonKey}`,
    taxonRank: 'SPECIES',
    kingdom: 'Animalia',
    class: 'Aves',
});

describe('mergeOccurrencePage', () => {
    const page1 = [
        obs(1, '2024-05-01'),
        obs(1, '2024-06-01'),
        obs(2, '2023-01-01', 'ds2'),
    ];
    const page2 = [obs(1, '2022-01-01'), obs(2, '2025-02-02', 'ds2')];

    function aggregate(pages: any[][]) {
        const taxons: Record<string, Taxon> = {};
        const datasets: Record<string, Dataset> = {};
        pages.forEach((page) => mergeOccurrencePage(page, taxons, datasets));
        return { taxons, datasets };
    }

    it('counts observations per taxon and per dataset', () => {
        const { taxons, datasets } = aggregate([page1, page2]);

        expect(taxons[1].nbObservations).toBe(3);
        expect(taxons[2].nbObservations).toBe(2);
        expect(datasets.ds1.nbObservations).toBe(3);
        expect(datasets.ds2.nbObservations).toBe(2);
    });

    it('keeps the most recent observation date', () => {
        const { taxons } = aggregate([page1, page2]);

        expect(taxons[1].lastSeenDate?.toISOString().slice(0, 10)).toBe(
            '2024-06-01'
        );
        expect(taxons[2].lastSeenDate?.toISOString().slice(0, 10)).toBe(
            '2025-02-02'
        );
    });

    it('gives the same result whatever the page arrival order', () => {
        const a = aggregate([page1, page2]);
        const b = aggregate([page2, page1]);

        const view = (r: ReturnType<typeof aggregate>) =>
            Object.values(r.taxons).map((t) => [
                t.taxonId,
                t.nbObservations,
                t.lastSeenDate?.getTime(),
            ]);
        expect(view(b)).toEqual(view(a));
        expect(b.datasets).toEqual(a.datasets);
    });
});

describe('facetsToSearchResult', () => {
    it('turns speciesKey and datasetKey facets into taxa and datasets', () => {
        const result = facetsToSearchResult({
            facets: [
                {
                    field: 'DATASET_KEY',
                    counts: [{ name: 'ds-a', count: 9 }],
                },
                {
                    field: 'SPECIES_KEY',
                    counts: [
                        { name: '2490719', count: 5 },
                        { name: '7865305', count: 3 },
                    ],
                },
            ],
        });

        expect(result.taxons.map((t) => [t.taxonId, t.nbObservations])).toEqual(
            [
                [2490719, 5],
                [7865305, 3],
            ]
        );
        expect(result.taxons[0].acceptedScientificName).toBe('');
        expect(result.taxons[0].lastSeenDate).toBeNull();
        expect(result.datasets).toEqual([
            { uuid: 'ds-a', name: 'ds-a', nbObservations: 9 },
        ]);
    });

    it('gives empty lists when the request failed', () => {
        expect(facetsToSearchResult(undefined)).toEqual({
            taxons: [],
            datasets: [],
        });
    });
});

describe('GbifConnector facet strategy', () => {
    afterEach(() => vi.unstubAllGlobals());

    const geometry =
        'POLYGON((2.35 48.85, 2.36 48.85, 2.36 48.86, 2.35 48.86, 2.35 48.85))';
    const json = (body: unknown) =>
        Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

    it('counts taxa with one facet request and no occurrence page', async () => {
        const fetchMock = vi.fn(() =>
            json({
                count: 10,
                facets: [
                    {
                        field: 'SPECIES_KEY',
                        counts: [{ name: '1', count: 10 }],
                    },
                ],
            })
        );
        vi.stubGlobal('fetch', fetchMock);

        const result = await new GbifConnector({}).fetchTaxa({ geometry });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const url = new URL((fetchMock.mock.calls[0] as any)[0]);
        expect(url.searchParams.get('limit')).toBe('0');
        expect(url.searchParams.getAll('facet')).toEqual([
            'speciesKey',
            'datasetKey',
        ]);
        expect(url.searchParams.get('hasCoordinate')).toBe('true');
        expect(result.taxons).toHaveLength(1);
    });

    it('sends the class of the query as a classKey filter', async () => {
        const fetchMock = vi.fn(() => json({ facets: [] }));
        vi.stubGlobal('fetch', fetchMock);

        await new GbifConnector({}).fetchTaxa({ geometry, class: 'Aves' });

        const url = new URL((fetchMock.mock.calls[0] as any)[0]);
        expect(url.searchParams.get('classKey')).toBe('212');
    });

    it('falls back to the raw aggregation when asked', async () => {
        const connector = new GbifConnector({ AGGREGATION: 'client' });

        expect(connector.capabilities.aggregation).toBe('client');
        expect(connector.capabilities.taxonInfo).toBe('aggregated');
        expect(connector.getSortableFields()).toContain('lastSeenDate');
    });

    it('does not offer sorts the facet list cannot support', () => {
        const connector = new GbifConnector({});

        expect(connector.getSortableFields()).toEqual(['nbObservations']);
    });

    it('finds the last observation date in the most recent year', async () => {
        const fetchMock = vi.fn((input: string) => {
            const url = new URL(input);
            if (url.searchParams.get('facet') === 'year') {
                return json({
                    facets: [
                        {
                            field: 'YEAR',
                            counts: [
                                { name: '2021', count: 4 },
                                { name: '2024', count: 2 },
                            ],
                        },
                    ],
                });
            }
            return json({
                facets: [
                    {
                        field: 'EVENT_DATE',
                        counts: [
                            { name: '2024-03-01', count: 30 },
                            { name: '2024-09-14T18:51:55', count: 1 },
                        ],
                    },
                ],
            });
        });
        vi.stubGlobal('fetch', fetchMock);

        const date = await new GbifConnector({}).fetchLastSeenDate(42, {
            geometry,
        });

        expect(date?.toISOString().slice(0, 10)).toBe('2024-09-14');
        const second = new URL((fetchMock.mock.calls[1] as any)[0]);
        expect(second.searchParams.get('year')).toBe('2024');
        expect(second.searchParams.get('speciesKey')).toBe('42');
    });

    it('returns null when the taxon has no observation', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => json({ facets: [{ counts: [] }] }))
        );

        const date = await new GbifConnector({}).fetchLastSeenDate(42, {
            geometry,
        });

        expect(date).toBeNull();
    });
});
