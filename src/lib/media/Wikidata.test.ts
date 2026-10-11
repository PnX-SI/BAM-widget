import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WikiDataImageSource } from './Wikidata';
import { TAXON_REFERENTIAL } from '../taxonReferential';

const json = (body: unknown) =>
    Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

function installFetch() {
    const calls: string[] = [];
    vi.stubGlobal(
        'fetch',
        vi.fn((url: string) => {
            calls.push(url);
            if (url.includes('query.wikidata.org')) {
                return json({
                    results: {
                        bindings: [{ item: { value: 'http://wd/entity/Q1' } }],
                    },
                });
            }
            if (url.includes('Special:EntityData')) {
                return json({
                    entities: {
                        Q1: {
                            claims: {
                                P18: [
                                    {
                                        mainsnak: {
                                            datavalue: { value: 'Bird.jpg' },
                                        },
                                    },
                                ],
                                P51: [
                                    {
                                        mainsnak: {
                                            datavalue: { value: 'Song.ogg' },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                });
            }
            // Commons
            return json({
                query: {
                    pages: {
                        1: {
                            imageinfo: [
                                {
                                    url: 'https://commons/file',
                                    extmetadata: {
                                        Artist: { value: 'Someone' },
                                        LicenseShortName: { value: 'CC BY' },
                                    },
                                },
                            ],
                        },
                    },
                },
            });
        })
    );
    return calls;
}

describe('WikiDataImageSource', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it('resolves the entity once for the image and the sound of a taxon', async () => {
        const calls = installFetch();
        const source = new WikiDataImageSource();
        const connector: any = { referential: TAXON_REFERENTIAL.GBIF };

        const [pictures, sounds] = await Promise.all([
            source.fetchPicture('2490719', connector),
            source.fetchSound('2490719', connector),
        ]);

        expect(pictures?.[0].url).toContain('Bird.jpg');
        expect(sounds?.[0].url).toBe('https://commons/file');
        expect(
            calls.filter((u) => u.includes('query.wikidata.org'))
        ).toHaveLength(1);
        expect(
            calls.filter((u) => u.includes('Special:EntityData'))
        ).toHaveLength(1);
        expect(
            calls.filter((u) => u.includes('commons.wikimedia.org/w/api.php'))
        ).toHaveLength(2);
    });
});
