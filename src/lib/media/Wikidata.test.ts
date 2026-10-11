import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WikiDataImageSource } from './Wikidata';
import { TAXON_REFERENTIAL } from '../taxonReferential';

const json = (body: unknown) =>
    Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

const commonsUrl = (name: string) =>
    `http://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}`;

/**
 * Fake Wikidata + Commons. `taxa` maps a taxon id to its files, an entity
 * with several files returns several rows like the real SPARQL endpoint.
 */
function installFetch(
    taxa: Record<string, { images?: string[]; sounds?: string[] }>
) {
    const calls: string[] = [];
    vi.stubGlobal(
        'fetch',
        vi.fn((url: string) => {
            calls.push(url);
            if (url.includes('query.wikidata.org')) {
                const query = decodeURIComponent(url.split('query=')[1]);
                const asked = [...query.matchAll(/"([^"]+)"/g)].map(
                    (m) => m[1]
                );
                const bindings: any[] = [];
                asked.forEach((k) => {
                    const t = taxa[k];
                    if (!t) return;
                    const images = t.images ?? [undefined];
                    const sounds = t.sounds ?? [undefined];
                    images.forEach((img) =>
                        sounds.forEach((snd) =>
                            bindings.push({
                                k: { value: k },
                                ...(img && { img: { value: commonsUrl(img) } }),
                                ...(snd && { snd: { value: commonsUrl(snd) } }),
                            })
                        )
                    );
                });
                return json({ results: { bindings } });
            }
            // Commons: answer one page per requested title
            const titles = decodeURIComponent(
                url.split('titles=')[1].split('&')[0]
            ).split('|');
            const pages: Record<string, any> = {};
            titles.forEach((title, i) => {
                pages[i + 1] = {
                    title,
                    imageinfo: [
                        {
                            url: `https://upload/${title}`,
                            extmetadata: {
                                Artist: { value: '<b>Someone</b>' },
                                LicenseShortName: { value: 'CC BY' },
                            },
                        },
                    ],
                };
            });
            return json({ query: { pages } });
        })
    );
    return calls;
}

const sparql = (calls: string[]) =>
    calls.filter((u) => u.includes('query.wikidata.org'));
const commons = (calls: string[]) =>
    calls.filter((u) => u.includes('commons.wikimedia.org/w/api.php'));

describe('WikiDataImageSource', () => {
    const connector: any = { referential: TAXON_REFERENTIAL.GBIF };

    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it('answers images of many taxa with one SPARQL and one Commons query', async () => {
        const taxa: Record<string, any> = {};
        for (let i = 1; i <= 20; i++)
            taxa[String(i)] = { images: [`Bird ${i}.jpg`] };
        const calls = installFetch(taxa);

        const batch = await new WikiDataImageSource().fetchPictures(
            Object.keys(taxa),
            connector
        );

        expect(batch.size).toBe(20);
        expect(batch.get('7')?.[0].url).toContain('Bird%207.jpg');
        expect(batch.get('7')?.[0].author).toBe('Someone');
        expect(sparql(calls)).toHaveLength(1);
        expect(commons(calls)).toHaveLength(1);
    });

    it('uses the right identifier property for the referential', async () => {
        const calls = installFetch({ '1': { images: ['A.jpg'] } });
        const source = new WikiDataImageSource();

        await source.fetchPictures(['1'], {
            referential: TAXON_REFERENTIAL.TAXREF,
        } as any);

        expect(decodeURIComponent(sparql(calls)[0])).toContain('wdt:P3186');
    });

    it('shares one SPARQL query between the image and the sound of a taxon', async () => {
        const calls = installFetch({
            '5': { images: ['Bird.jpg', 'Other.jpg'], sounds: ['Song.ogg'] },
        });
        const source = new WikiDataImageSource();

        const [pictures, sounds] = await Promise.all([
            source.fetchPicture('5', connector),
            source.fetchSound('5', connector),
        ]);

        expect(pictures).toHaveLength(1);
        expect(pictures?.[0].url).toContain('Bird.jpg');
        expect(sounds?.[0].url).toBe('https://upload/File:Song.ogg');
        expect(sparql(calls)).toHaveLength(1);
    });

    it('returns an empty list for taxa unknown to Wikidata', async () => {
        installFetch({ '1': { images: ['A.jpg'] } });

        const batch = await new WikiDataImageSource().fetchPictures(
            ['1', '999'],
            connector
        );

        expect(batch.get('999')).toEqual([]);
        expect(batch.get('1')).toHaveLength(1);
    });

    it('does not query again for taxa and files already resolved', async () => {
        const calls = installFetch({
            '1': { images: ['A.jpg'] },
            '2': { images: ['B.jpg'] },
        });
        const source = new WikiDataImageSource();

        await source.fetchPictures(['1'], connector);
        await source.fetchPictures(['1', '2'], connector);

        expect(sparql(calls)).toHaveLength(2);
        // second SPARQL only asks for taxon 2
        expect(decodeURIComponent(sparql(calls)[1])).not.toContain('"1"');
        expect(commons(calls)).toHaveLength(2);
    });

    it('splits large batches in chunks of 50 taxa', async () => {
        const taxa: Record<string, any> = {};
        for (let i = 1; i <= 120; i++)
            taxa[String(i)] = { images: [`B${i}.jpg`] };
        const calls = installFetch(taxa);

        await new WikiDataImageSource().fetchPictures(
            Object.keys(taxa),
            connector
        );

        expect(sparql(calls)).toHaveLength(3);
        expect(commons(calls)).toHaveLength(3);
    });
});
