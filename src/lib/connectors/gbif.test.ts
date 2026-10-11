import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../parameterStore', () => ({
    default: { getInstance: () => ({ lang: { value: 'fr' } }) },
}));
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

    it('reads the last observation date from one request when dates fit', async () => {
        const fetchMock = vi.fn(() =>
            json({
                facets: [
                    {
                        field: 'EVENT_DATE',
                        counts: [
                            { name: '2024-03-01', count: 30 },
                            { name: '2024-09-14T18:51:55', count: 1 },
                            { name: '2021-05-02', count: 4 },
                        ],
                    },
                ],
            })
        );
        vi.stubGlobal('fetch', fetchMock);

        const date = await new GbifConnector({}).fetchLastSeenDate(42, {
            geometry,
        });

        expect(date?.toISOString().slice(0, 10)).toBe('2024-09-14');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('goes through the most recent year when dates exceed one facet', async () => {
        const manyDates = Array.from({ length: 1000 }, (_, i) => ({
            name: `2019-01-01T00:00:${String(i).padStart(4, '0')}`,
            count: 5,
        }));
        const fetchMock = vi.fn((input: string) => {
            const url = new URL(input);
            if (url.searchParams.get('facet') === 'year') {
                return json({
                    facets: [
                        {
                            counts: [
                                { name: '2019', count: 900 },
                                { name: '2024', count: 2 },
                            ],
                        },
                    ],
                });
            }
            if (url.searchParams.get('year') === '2024') {
                return json({
                    facets: [{ counts: [{ name: '2024-09-14', count: 1 }] }],
                });
            }
            return json({ facets: [{ counts: manyDates }] });
        });
        vi.stubGlobal('fetch', fetchMock);

        const date = await new GbifConnector({}).fetchLastSeenDate(42, {
            geometry,
        });

        expect(date?.toISOString().slice(0, 10)).toBe('2024-09-14');
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('rejects instead of answering "no date" when GBIF is unavailable', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.resolve(new Response('{}', { status: 500 })))
        );

        await expect(
            new GbifConnector({}).fetchLastSeenDate(42, { geometry })
        ).rejects.toThrow();
    });

    it('rejects the taxon list when GBIF is unavailable', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.resolve(new Response('{}', { status: 500 })))
        );

        await expect(
            new GbifConnector({}).fetchTaxa({ geometry })
        ).rejects.toThrow();
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

describe('GbifConnector.searchTaxa', () => {
    afterEach(() => vi.unstubAllGlobals());

    const geometry =
        'POLYGON((2.35 48.85, 2.36 48.85, 2.36 48.86, 2.35 48.86, 2.35 48.85))';
    const json = (body: unknown) =>
        Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

    /** Fake GBIF: name search per qField and occurrence facet per keys. */
    function installGbif(options: {
        vernacular?: any[];
        scientific?: any[];
        present?: Record<string, number>;
    }) {
        const searches: URL[] = [];
        const facets: URL[] = [];
        vi.stubGlobal(
            'fetch',
            vi.fn((input: string) => {
                const url = new URL(input);
                if (url.pathname.endsWith('/species/search')) {
                    searches.push(url);
                    const field = url.searchParams.get('qField');
                    return json({
                        results:
                            (field === 'VERNACULAR'
                                ? options.vernacular
                                : options.scientific) ?? [],
                    });
                }
                facets.push(url);
                const asked = url.searchParams.getAll('taxonKey');
                const counts = Object.entries(options.present ?? {})
                    .filter(([key]) => asked.includes(key))
                    .map(([name, count]) => ({ name, count }));
                return json({ facets: [{ field: 'SPECIES_KEY', counts }] });
            })
        );
        return { searches, facets };
    }

    const species = (nubKey: number, scientificName: string, extra = {}) => ({
        key: nubKey + 1_000_000,
        nubKey,
        scientificName,
        rank: 'SPECIES',
        class: 'Aves',
        kingdom: 'Animalia',
        ...extra,
    });

    it('keeps the candidates observed in the area, with their counts', async () => {
        const { searches, facets } = installGbif({
            vernacular: [
                species(1, 'Turdus merula', {
                    vernacularNames: [
                        {
                            vernacularName: 'Eurasian Blackbird',
                            language: 'eng',
                        },
                        { vernacularName: 'Merle noir', language: 'fra' },
                    ],
                }),
                species(2, 'Turdus philomelos'),
                species(3, 'Merula merula'),
            ],
            present: { '1': 120, '3': 4 },
        });

        const taxa = await new GbifConnector({}).searchTaxa('merle', {
            geometry,
        });

        expect(
            searches.map((u) => u.searchParams.get('qField')).sort()
        ).toEqual(['SCIENTIFIC', 'VERNACULAR']);
        expect(facets).toHaveLength(1);
        expect(facets[0].searchParams.getAll('taxonKey').sort()).toEqual([
            '1',
            '2',
            '3',
        ]);
        expect(facets[0].searchParams.get('limit')).toBe('0');
        expect(facets[0].searchParams.get('geometry')).toContain('POLYGON');
        expect(taxa.map((t) => [t.taxonId, t.nbObservations])).toEqual([
            [1, 120],
            [3, 4],
        ]);
        expect(taxa[0].acceptedScientificName).toBe('Turdus merula');
        expect(taxa[0].vernacularName).toBe('Merle noir');
        expect(taxa[0].class).toBe('Aves');
    });

    it('does not count the same backbone taxon twice', async () => {
        const { facets } = installGbif({
            vernacular: [
                species(1, 'Turdus merula'),
                species(1, 'Turdus merula'),
            ],
            scientific: [species(1, 'Turdus merula')],
            present: { '1': 5 },
        });

        const taxa = await new GbifConnector({}).searchTaxa('merula', {
            geometry,
        });

        expect(facets[0].searchParams.getAll('taxonKey')).toEqual(['1']);
        expect(taxa).toHaveLength(1);
    });

    it('orders by name relevance, then by number of observations', async () => {
        installGbif({
            vernacular: [species(10, 'A'), species(11, 'B')],
            present: { '10': 2, '11': 90 },
        });

        const taxa = await new GbifConnector({}).searchTaxa('x', { geometry });

        expect(taxa.map((t) => t.taxonId)).toEqual([10, 11]);
    });

    it('splits many candidates in several occurrence requests', async () => {
        const many = Array.from({ length: 100 }, (_, i) =>
            species(i + 1, `S${i}`)
        );
        const more = Array.from({ length: 50 }, (_, i) =>
            species(i + 101, `T${i}`)
        );
        const { facets } = installGbif({
            vernacular: many,
            scientific: more,
            present: { '5': 1, '120': 1 },
        });

        const taxa = await new GbifConnector({}).searchTaxa('a', { geometry });

        expect(facets).toHaveLength(2);
        expect(taxa.map((t) => t.taxonId).sort((a, b) => a - b)).toEqual([
            5, 120,
        ]);
    });

    it('does not query occurrences when no name matches', async () => {
        const { facets } = installGbif({});

        const taxa = await new GbifConnector({}).searchTaxa('zzzz', {
            geometry,
        });

        expect(taxa).toEqual([]);
        expect(facets).toHaveLength(0);
    });

    it('returns nothing for an empty text without calling GBIF', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        expect(
            await new GbifConnector({}).searchTaxa('  ', { geometry })
        ).toEqual([]);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('applies the class of the query to the occurrence request', async () => {
        const { facets } = installGbif({
            vernacular: [species(1, 'Turdus merula')],
            present: { '1': 1 },
        });

        await new GbifConnector({}).searchTaxa('merle', {
            geometry,
            class: 'Aves',
        });

        expect(facets[0].searchParams.get('classKey')).toBe('212');
    });

    it('is offered by the facet strategy only', () => {
        expect(new GbifConnector({}).capabilities.search).toBe('remote');
        expect(
            new GbifConnector({ AGGREGATION: 'client' }).capabilities.search
        ).toBe('loaded');
    });
});
