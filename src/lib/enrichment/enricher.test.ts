import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Enricher } from './enricher';
import { createMemoryBackend, PersistentCache } from '../cache/persistentCache';

const media = (url: string) => ({ url, source: 'test', typeMedia: 'image' });

function fakeSource(
    fetchPictures = vi.fn(
        async (ids: Array<string | number>) =>
            new Map(ids.map((id) => [String(id), [media(`img-${id}`)]]))
    )
) {
    return { id: 'wikidata', fetchPictures, fetchSounds: vi.fn() } as any;
}

function fakeConnector(source: any, extra: Record<string, any> = {}) {
    return {
        name: 'GBIF',
        options: {},
        imageSource: source,
        soundSource: source,
        ...extra,
    } as any;
}

describe('Enricher', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const make = (backend = createMemoryBackend(), options = {}) =>
        new Enricher(new PersistentCache(backend), options);

    it('sends the pictures requested in the same window as one batch', async () => {
        const source = fakeSource();
        const connector = fakeConnector(source);
        const enricher = make();

        const results = Promise.all(
            [1, 2, 3, 4, 5].map((id) => enricher.getImages(id, connector))
        );
        await vi.runAllTimersAsync();
        const images = await results;

        expect(source.fetchPictures).toHaveBeenCalledTimes(1);
        expect(source.fetchPictures.mock.calls[0][0]).toEqual([
            '1',
            '2',
            '3',
            '4',
            '5',
        ]);
        expect(images[2][0].url).toBe('img-3');
    });

    it('shares the answer between callers asking for the same taxon', async () => {
        const source = fakeSource();
        const connector = fakeConnector(source);
        const enricher = make();

        const a = enricher.getImages(1, connector);
        const b = enricher.getImages('1', connector);
        await vi.runAllTimersAsync();
        await Promise.all([a, b]);
        await enricher.getImages(1, connector);

        expect(source.fetchPictures).toHaveBeenCalledTimes(1);
    });

    it('serves a later session from the persistent cache', async () => {
        const backend = createMemoryBackend();
        const source = fakeSource();
        const connector = fakeConnector(source);

        const first = make(backend).getImages(1, connector);
        await vi.runAllTimersAsync();
        await first;
        // let the cache write finish
        await vi.runAllTimersAsync();

        const second = fakeSource();
        const result = await make(backend).getImages(1, fakeConnector(second));

        expect(result[0].url).toBe('img-1');
        expect(second.fetchPictures).not.toHaveBeenCalled();
    });

    it('splits requests in batches of maxBatch taxa', async () => {
        const source = fakeSource();
        const connector = fakeConnector(source);
        const enricher = make(createMemoryBackend(), { maxBatch: 3 });

        const results = Promise.all(
            [1, 2, 3, 4, 5, 6, 7].map((id) => enricher.getImages(id, connector))
        );
        await vi.runAllTimersAsync();
        await results;

        expect(
            source.fetchPictures.mock.calls.map((c: any) => c[0].length)
        ).toEqual([3, 3, 1]);
    });

    it('resolves to an empty list on failure and retries next time', async () => {
        const fetchPictures = vi
            .fn()
            .mockRejectedValueOnce(new Error('network'))
            .mockImplementation(
                async (ids: string[]) =>
                    new Map(ids.map((id) => [id, [media(`img-${id}`)]]))
            );
        const connector = fakeConnector(fakeSource(fetchPictures));
        const enricher = make();

        const failed = enricher.getImages(1, connector);
        await vi.runAllTimersAsync();
        expect(await failed).toEqual([]);

        const retried = enricher.getImages(1, connector);
        await vi.runAllTimersAsync();
        expect((await retried)[0].url).toBe('img-1');
    });

    it('does not mix entries of two endpoints', async () => {
        const source = fakeSource();
        const enricher = make();

        const a = enricher.getImages(
            1,
            fakeConnector(source, { options: { API_ENDPOINT: 'https://a' } })
        );
        const b = enricher.getImages(
            1,
            fakeConnector(source, { options: { API_ENDPOINT: 'https://b' } })
        );
        await vi.runAllTimersAsync();
        await Promise.all([a, b]);

        expect(source.fetchPictures).toHaveBeenCalledTimes(2);
    });

    it('returns an empty list when the connector has no source', async () => {
        const enricher = make();
        const connector = fakeConnector(undefined);

        expect(await enricher.getImages(1, connector)).toEqual([]);
        expect(await enricher.getSound(1, connector)).toBeUndefined();
    });

    it('caches status and vernacular name per language', async () => {
        const connector = fakeConnector(fakeSource(), {
            fetchTaxonStatus: vi.fn().mockResolvedValue('LC'),
            fetchVernacularName: vi
                .fn()
                .mockImplementation(async (id: string) => `name-${id}`),
        });
        const enricher = make();

        const status = await Promise.all([
            enricher.getStatus(1, connector),
            enricher.getStatus(1, connector),
        ]);
        await enricher.getVernacularName(1, connector, 'fr');
        await enricher.getVernacularName(1, connector, 'fr');
        await enricher.getVernacularName(1, connector, 'en');

        expect(status).toEqual(['LC', 'LC']);
        expect(connector.fetchTaxonStatus).toHaveBeenCalledTimes(1);
        expect(connector.fetchVernacularName).toHaveBeenCalledTimes(2);
    });

    it('tolerates connectors without status or vernacular name support', async () => {
        const connector = fakeConnector(fakeSource(), {
            fetchTaxonStatus: () => null,
            fetchVernacularName: () => {
                throw new Error('Not implemented');
            },
        });
        const enricher = make();

        expect(await enricher.getStatus(1, connector)).toBeNull();
        expect(
            await enricher.getVernacularName(1, connector, 'fr')
        ).toBeUndefined();
    });

    it('caches the taxon info and shares it between callers', async () => {
        const connector = fakeConnector(fakeSource(), {
            fetchTaxonInfo: vi.fn().mockResolvedValue({
                scientificName: 'Turdus merula',
                class: 'Aves',
            }),
        });
        const enricher = make();

        const [a, b] = await Promise.all([
            enricher.getTaxonInfo(7, connector),
            enricher.getTaxonInfo('7', connector),
        ]);

        expect(a?.scientificName).toBe('Turdus merula');
        expect(b).toEqual(a);
        expect(connector.fetchTaxonInfo).toHaveBeenCalledTimes(1);
        expect(connector.fetchTaxonInfo).toHaveBeenCalledWith('7');
    });

    it('returns null when the taxon info cannot be loaded', async () => {
        const connector = fakeConnector(fakeSource(), {
            fetchTaxonInfo: () => {
                throw new Error('Not implemented');
            },
        });

        expect(await make().getTaxonInfo(1, connector)).toBeNull();
    });

    it('returns the last seen date as a Date, once per area', async () => {
        const connector = fakeConnector(fakeSource(), {
            fetchLastSeenDate: vi
                .fn()
                .mockResolvedValue(new Date('2024-09-14T00:00:00Z')),
        });
        const enricher = make();
        const area = { geometry: 'POINT(1 2)' };

        const first = await enricher.getLastSeenDate(1, connector, area);
        await enricher.getLastSeenDate(1, connector, area);
        await enricher.getLastSeenDate(1, connector, {
            ...area,
            dateMin: '2024-01-01',
        });

        expect(first).toBeInstanceOf(Date);
        expect(first?.toISOString()).toBe('2024-09-14T00:00:00.000Z');
        expect(connector.fetchLastSeenDate).toHaveBeenCalledTimes(2);
    });

    it('does not cache a last seen date that failed to load', async () => {
        const fetchLastSeenDate = vi
            .fn()
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce(new Date('2024-01-01T00:00:00Z'));
        const connector = fakeConnector(fakeSource(), { fetchLastSeenDate });
        const enricher = make();
        const area = { geometry: 'POINT(1 2)' };

        expect(await enricher.getLastSeenDate(1, connector, area)).toBeNull();
        expect(
            await enricher.getLastSeenDate(1, connector, area)
        ).toBeInstanceOf(Date);
    });
});
