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
});
