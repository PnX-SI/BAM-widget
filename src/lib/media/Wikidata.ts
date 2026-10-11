import { scheduledFetch } from '../http/scheduler';
import { Connector } from '../connectors/connector';
import { Media, MediaType } from '../models';
import { TAXON_REFERENTIAL } from '../taxonReferential';
import { SOURCE_ } from './media';
import { MediaBatch, MediaSource } from './MediaSource';

const { GBIF, TAXREF } = TAXON_REFERENTIAL;

const SPARQL_URL = 'https://query.wikidata.org/sparql';
const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php';

/** Wikidata property holding the taxon identifier, by referential. */
const TAXON_ID_PROPERTY: Partial<Record<TAXON_REFERENTIAL, string>> = {
    [GBIF]: 'P846',
    [TAXREF]: 'P3186',
};

/** Max taxa per SPARQL query and max files per Commons query. */
const SPARQL_CHUNK = 50;
const COMMONS_CHUNK = 50;

interface WikidataFiles {
    image?: string;
    sound?: string;
}

interface SparqlBinding {
    k: { value: string };
    img?: { value: string };
    snd?: { value: string };
}

interface CommonsImageInfo {
    url: string;
    extmetadata?: Record<string, { value?: string }>;
}

function chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
}

/** `http://commons.wikimedia.org/wiki/Special:FilePath/My%20bird.jpg` -> `My bird.jpg` */
function fileNameFromUrl(url: string): string {
    return decodeURIComponent(url.split('/').pop() || '').replace(/_/g, ' ');
}

/**
 * One SPARQL query for several taxa: returns the image (P18) and sound (P51)
 * file names of each taxon that exists in Wikidata. An entity with several
 * files yields several rows, the first one wins.
 */
function queryWikidataFiles(
    idProperty: string,
    ids: string[]
): Promise<Map<string, WikidataFiles>> {
    // identifiers are interpolated in the query: keep only safe characters
    const values = ids
        .map((id) => `"${id.replace(/[^0-9A-Za-z_.-]/g, '')}"`)
        .join(' ');
    const query =
        `SELECT ?k ?img ?snd WHERE { VALUES ?k { ${values} } ` +
        `?item wdt:${idProperty} ?k . ` +
        `OPTIONAL { ?item wdt:P18 ?img } OPTIONAL { ?item wdt:P51 ?snd } }`;

    return scheduledFetch(
        `${SPARQL_URL}?format=json&query=${encodeURIComponent(query)}`
    )
        .then((response) => response.json())
        .then((data: { results: { bindings: SparqlBinding[] } }) => {
            const files = new Map<string, WikidataFiles>();
            data.results.bindings.forEach((binding) => {
                const entry = files.get(binding.k.value) ?? {};
                if (!entry.image && binding.img) {
                    entry.image = fileNameFromUrl(binding.img.value);
                }
                if (!entry.sound && binding.snd) {
                    entry.sound = fileNameFromUrl(binding.snd.value);
                }
                files.set(binding.k.value, entry);
            });
            return files;
        });
}

/**
 * One Commons query for several files: author, license and URL.
 * Files unknown to Commons are absent from the result.
 */
function queryCommonsInfo(
    fileNames: string[]
): Promise<Map<string, CommonsImageInfo>> {
    const titles = fileNames.map((name) => `File:${name}`).join('|');
    const url =
        `${COMMONS_API_URL}?action=query&titles=${encodeURIComponent(titles)}` +
        `&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

    return scheduledFetch(url)
        .then((response) => response.json())
        .then((data) => {
            const infos = new Map<string, CommonsImageInfo>();
            Object.values(data?.query?.pages || {}).forEach((page: any) => {
                const info = page?.imageinfo?.[0];
                if (info && typeof page.title === 'string') {
                    infos.set(page.title.replace(/^File:/, ''), info);
                }
            });
            return infos;
        });
}

function stripHtml(value?: string | null): string | null {
    return value ? value.replace(/<[^>]*>?/gm, '') : null;
}

function buildMedia(
    fileName: string,
    typeMedia: MediaType,
    info: CommonsImageInfo
): Media {
    const meta = info.extmetadata || {};
    const author = stripHtml(meta.Artist?.value);
    const license = meta.LicenseShortName?.value || null;

    return {
        url:
            typeMedia === MediaType.image
                ? `https://commons.wikimedia.org/w/thumb.php?width=700&f=${encodeURIComponent(fileName)}`
                : info.url,
        source: `${author ?? ''} - ${license}`,
        typeMedia,
        licenseUrl: meta.LicenseUrl?.value || null,
        license,
        author,
        urlSource: `https://commons.wikimedia.org/wiki/File:${fileName}`,
    } as Media;
}

export class WikiDataImageSource extends MediaSource {
    /** Files by taxon (`property:id`), shared by images and sounds. */
    private filesCache = new Map<string, Promise<WikidataFiles>>();
    /** Commons metadata by file name. */
    private commonsCache = new Map<string, Promise<CommonsImageInfo | null>>();

    constructor() {
        super('Wikidata', SOURCE_.wikidata);
    }

    isCompatible(connector: any): boolean {
        return [GBIF, TAXREF].includes(connector.referential);
    }

    fetchPicture(
        taxonID: string | number,
        connector: Connector
    ): Promise<Media[] | undefined> {
        return this.fetchBatch([taxonID], connector, 'image').then(
            (batch) => batch.get(String(taxonID)) ?? []
        );
    }

    fetchSound(
        taxonID: string | number,
        connector: Connector
    ): Promise<Media[] | undefined> {
        return this.fetchBatch([taxonID], connector, 'sound').then(
            (batch) => batch.get(String(taxonID)) ?? []
        );
    }

    fetchPictures(
        taxonIDs: Array<string | number>,
        connector: Connector
    ): Promise<MediaBatch> {
        return this.fetchBatch(taxonIDs, connector, 'image');
    }

    fetchSounds(
        taxonIDs: Array<string | number>,
        connector: Connector
    ): Promise<MediaBatch> {
        return this.fetchBatch(taxonIDs, connector, 'sound');
    }

    private async fetchBatch(
        taxonIDs: Array<string | number>,
        connector: Connector,
        kind: 'image' | 'sound'
    ): Promise<MediaBatch> {
        if (!this.isCompatible(connector)) {
            throw new Error(
                'Wikidata source is only compatible with GBIF and TAXREF connectors'
            );
        }
        const idProperty = TAXON_ID_PROPERTY[connector.referential!]!;
        const ids = [...new Set(taxonIDs.map(String))];

        const files = await Promise.all(this.resolveFiles(idProperty, ids));
        const fileByTaxon = new Map<string, string>();
        ids.forEach((id, index) => {
            const fileName = files[index][kind];
            if (fileName) fileByTaxon.set(id, fileName);
        });

        const infos = await Promise.all(
            this.resolveCommons([...new Set(fileByTaxon.values())])
        );
        const infoByFile = new Map<string, CommonsImageInfo>();
        [...new Set(fileByTaxon.values())].forEach((name, index) => {
            const info = infos[index];
            if (info) infoByFile.set(name, info);
        });

        const typeMedia = kind === 'image' ? MediaType.image : MediaType.sound;
        const batch: MediaBatch = new Map();
        ids.forEach((id) => {
            const fileName = fileByTaxon.get(id);
            const info = fileName ? infoByFile.get(fileName) : undefined;
            batch.set(
                id,
                fileName && info ? [buildMedia(fileName, typeMedia, info)] : []
            );
        });
        return batch;
    }

    /**
     * Files of each taxon, one promise per id. Ids that are not cached yet
     * are queried together (chunks of SPARQL_CHUNK).
     */
    private resolveFiles(
        idProperty: string,
        ids: string[]
    ): Array<Promise<WikidataFiles>> {
        const missing = ids.filter(
            (id) => !this.filesCache.has(`${idProperty}:${id}`)
        );
        chunk(missing, SPARQL_CHUNK).forEach((chunkIds) => {
            const query = queryWikidataFiles(idProperty, chunkIds);
            chunkIds.forEach((id) => {
                const key = `${idProperty}:${id}`;
                this.filesCache.set(
                    key,
                    query
                        .then((files) => files.get(id) ?? {})
                        .catch((error) => {
                            this.filesCache.delete(key);
                            throw error;
                        })
                );
            });
        });
        return ids.map((id) => this.filesCache.get(`${idProperty}:${id}`)!);
    }

    private resolveCommons(
        fileNames: string[]
    ): Array<Promise<CommonsImageInfo | null>> {
        const missing = fileNames.filter((n) => !this.commonsCache.has(n));
        chunk(missing, COMMONS_CHUNK).forEach((chunkNames) => {
            const query = queryCommonsInfo(chunkNames);
            chunkNames.forEach((name) => {
                this.commonsCache.set(
                    name,
                    query
                        .then((infos) => infos.get(name) ?? null)
                        .catch((error) => {
                            this.commonsCache.delete(name);
                            throw error;
                        })
                );
            });
        });
        return fileNames.map((name) => this.commonsCache.get(name)!);
    }
}
