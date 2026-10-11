import { scheduledFetch, memoAsync } from '../http/scheduler';
import { Connector } from '../connectors/connector';
import { Media, MediaType } from '../models';
import { TAXON_REFERENTIAL } from '../taxonReferential';
import { SOURCE_ } from './media';
import { MediaSource } from './MediaSource';

const { GBIF, TAXREF } = TAXON_REFERENTIAL;

interface WikidataResponse {
    results: {
        bindings: Array<{
            item: { value: string };
        }>;
    };
}

interface WikidataEntity {
    entities: {
        [key: string]: {
            claims?: Record<
                string,
                Array<{ mainsnak: { datavalue: { value: string } } }>
            >;
        };
    };
}

/**
 * SPARQL query to fetch Wikidata entity ID by external property (GBIF, TAXREF…)
 */
const entityIdCache = new Map<string, Promise<string | null>>();
const entityMediaFilesCache = new Map<
    string,
    Promise<Record<string, string | undefined>>
>();

function fetchWikidataEntityByProperty(
    property: string,
    value: string
): Promise<string | null> {
    return memoAsync(entityIdCache, `${property}:${value}`, () =>
        queryWikidataEntityByProperty(property, value)
    );
}

function queryWikidataEntityByProperty(
    property: string,
    value: string
): Promise<string | null> {
    const url = 'https://query.wikidata.org/sparql';
    const query = `SELECT ?item WHERE { ?item wdt:${property} "${value}" . }`;

    return scheduledFetch(
        url + '?format=json&query=' + encodeURIComponent(query)
    )
        .then((response) => response.json() as Promise<WikidataResponse>)
        .then((data) => {
            if (!data.results.bindings.length) return null;
            return data.results.bindings[0].item.value.split('/').pop() || null;
        });
}

/**
 * Fetch metadata for a Commons file (image or audio)
 */
function fetchCommonsMedia(
    fileName: string,
    typeMedia: MediaType
): Promise<Media[]> {
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
        fileName
    )}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

    return scheduledFetch(commonsUrl)
        .then((res) => res.json())
        .then((commonsData) => {
            const pages = commonsData.query.pages;
            const page = Object.values(pages)[0] as any;

            if (!page?.imageinfo?.length) {
                return [];
            }

            const info = page.imageinfo[0];
            const meta = info.extmetadata || {};
            const credit = {
                artist: meta.Artist?.value || null,
                license: meta.LicenseShortName?.value || null,
                creditLine: meta.Credit?.value || null,
                licenseUrl: meta.LicenseUrl?.value || null,
            };

            return [
                {
                    url:
                        typeMedia === MediaType.image
                            ? `https://commons.wikimedia.org/w/thumb.php?width=700&f=${fileName}`
                            : info.url,
                    source: `${
                        credit.artist
                            ? credit.artist.replace(/<[^>]*>?/gm, '')
                            : ''
                    } - ${credit.license}`,
                    typeMedia,
                    licenseUrl: credit.licenseUrl,
                    license: credit.license,
                    author: credit.artist
                        ? credit.artist.replace(/<[^>]*>?/gm, '')
                        : credit.artist,
                    urlSource: `https://commons.wikimedia.org/wiki/File:${fileName}`,
                },
            ] as Media[];
        });
}

/** Properties read from an entity: P18 (image) and P51 (audio). */
const MEDIA_PROPERTIES = ['P18', 'P51'];

/**
 * Fetch the Commons file names of an entity. The (large) entity document is
 * requested once per entity and shared between image and sound lookups.
 */
function fetchEntityMediaFiles(
    entityId: string
): Promise<Record<string, string | undefined>> {
    return memoAsync(entityMediaFilesCache, entityId, () => {
        const url = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;
        return scheduledFetch(url)
            .then((response) => response.json() as Promise<WikidataEntity>)
            .then((data) => {
                const claims = data.entities[entityId]?.claims || {};
                const files: Record<string, string | undefined> = {};
                MEDIA_PROPERTIES.forEach((property) => {
                    files[property] =
                        claims[property]?.[0]?.mainsnak?.datavalue?.value;
                });
                return files;
            });
    });
}

/**
 * Generic fetcher for Wikidata media (image/audio)
 */
function fetchMediaFromWikidata(
    entityId: string,
    property: string,
    typeMedia: MediaType
): Promise<Media[]> {
    if (!entityId) {
        return Promise.resolve([]);
    }

    return fetchEntityMediaFiles(entityId).then((files) => {
        const fileName = files[property];
        if (!fileName) {
            return [];
        }
        return fetchCommonsMedia(fileName, typeMedia);
    });
}

/**
 * Resolve Wikidata ID from connector + fetch media
 */
function fetchWikidataMedia(
    idTaxon: string | number,
    connector: Connector,
    property: string,
    typeMedia: MediaType,
    wikidataEntryID: string | null = null
): Promise<Media[]> {
    if (!idTaxon) throw new Error('No taxonId given!');

    if (wikidataEntryID) {
        return fetchMediaFromWikidata(wikidataEntryID, property, typeMedia);
    }

    let fetchIDPromise: Promise<string | null> | null = null;

    switch (connector.referential) {
        case GBIF:
            fetchIDPromise = fetchWikidataEntityByProperty('P846', idTaxon);
            break;
        case TAXREF:
            fetchIDPromise = fetchWikidataEntityByProperty('P3186', idTaxon);
            break;
        default:
            break;
    }

    if (!fetchIDPromise) return Promise.resolve([]);

    return fetchIDPromise.then((idWikidata) => {
        if (idWikidata) {
            return fetchMediaFromWikidata(idWikidata, property, typeMedia);
        }
        return [];
    });
}

class WikiDataImageSource extends MediaSource {
    constructor() {
        super('Wikidata', SOURCE_.wikidata);
    }

    fetchPicture(
        taxonID: string | number,
        connector: Connector
    ): Promise<Media[] | undefined> {
        if (!this.isCompatible(connector)) {
            throw new Error(
                'Wikidata Image source is only compatible with GBIF and TAXREF connectors'
            );
        }
        return fetchWikidataMedia(
            taxonID,
            connector,
            'P18',
            MediaType.image
        ) as Promise<Media[] | undefined>;
    }

    fetchSound(
        taxonID: string,
        connector: Connector
    ): Promise<Media[] | undefined> {
        if (!this.isCompatible(connector)) {
            throw new Error(
                'Wikidata Sound source is only compatible with GBIF and TAXREF connectors'
            );
        }
        return fetchWikidataMedia(
            taxonID,
            connector,
            'P51',
            MediaType.sound
        ) as Promise<Media[] | undefined>;
    }

    isCompatible(connector: any): boolean {
        return [GBIF, TAXREF].includes(connector.referential);
    }
}

export { WikiDataImageSource };
