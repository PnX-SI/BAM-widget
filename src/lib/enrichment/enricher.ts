import { Connector, IUCNCodeStatus } from '../connectors/connector';
import { memoAsync } from '../http/scheduler';
import { Media } from '../models';
import { MediaBatch, MediaSource } from '../media/MediaSource';
import {
    createDefaultCache,
    DAY_MS,
    PersistentCache,
} from '../cache/persistentCache';

/** Pictures and sounds rarely change; "nothing found" is rechecked sooner. */
const TTL_FOUND_MS = 7 * DAY_MS;
const TTL_EMPTY_MS = 1 * DAY_MS;

type MediaKind = 'image' | 'sound';

interface Waiter {
    resolve: (medias: Media[]) => void;
    reject: (error: unknown) => void;
}

interface PendingBatch {
    kind: MediaKind;
    source: MediaSource;
    connector: Connector;
    waiters: Map<string, Waiter[]>;
    timer: ReturnType<typeof setTimeout>;
}

export interface EnricherOptions {
    /** Time to wait for more taxa before sending a batch. */
    windowMs?: number;
    /** Max taxa in one call of a media source. */
    maxBatch?: number;
}

/**
 * Single entry point for everything that is not in the taxon list itself
 * (pictures, sounds, names, conservation status).
 *
 * - requests for the same taxon are shared (in memory, then IndexedDB);
 * - media requests issued within a short window are sent as one batch to
 *   the media source, which can answer in bulk (see `MediaSource.fetchPictures`);
 * - failures resolve to an empty value and are not cached.
 */
export class Enricher {
    private memory = new Map<string, Promise<any>>();
    private pending = new Map<string, PendingBatch>();
    private windowMs: number;
    private maxBatch: number;

    constructor(
        private cache: PersistentCache,
        options: EnricherOptions = {}
    ) {
        this.windowMs = options.windowMs ?? 30;
        this.maxBatch = options.maxBatch ?? 50;
    }

    getImages(
        taxonId: string | number,
        connector: Connector
    ): Promise<Media[]> {
        return this.getMedia(
            'image',
            taxonId,
            connector,
            connector.imageSource
        );
    }

    async getSound(
        taxonId: string | number,
        connector: Connector
    ): Promise<Media | undefined> {
        const sounds = await this.getMedia(
            'sound',
            taxonId,
            connector,
            connector.soundSource
        );
        return sounds[0];
    }

    getStatus(
        taxonId: string | number,
        connector: Connector
    ): Promise<IUCNCodeStatus | null> {
        const key = `status|${this.scope(connector)}|${taxonId}`;
        return this.cached<IUCNCodeStatus | null>(
            key,
            () =>
                Promise.resolve(connector.fetchTaxonStatus(taxonId)).then(
                    (status) => status ?? null
                ),
            () => TTL_FOUND_MS
        ).catch(() => null);
    }

    getVernacularName(
        taxonId: string | number,
        connector: Connector,
        lang: string
    ): Promise<string | undefined> {
        const key = `name|${this.scope(connector)}|${lang}|${taxonId}`;
        return this.cached<string | null>(
            key,
            () =>
                Promise.resolve()
                    .then(() => connector.fetchVernacularName(taxonId))
                    .then((name) => name ?? null),
            (name) => (name ? TTL_FOUND_MS : TTL_EMPTY_MS)
        )
            .then((name) => name ?? undefined)
            .catch(() => undefined);
    }

    /** Memory, then persistent cache, then `load`. Failures are not kept. */
    private cached<T>(
        key: string,
        load: () => Promise<T>,
        ttl: (value: T) => number
    ): Promise<T> {
        return memoAsync(this.memory, key, async () => {
            const hit = await this.cache.get<T>(key);
            if (hit !== undefined) return hit;
            const value = await load();
            void this.cache.set(key, value, ttl(value));
            return value;
        });
    }

    /** Where the data comes from: two endpoints must not share cache entries. */
    private scope(connector: Connector): string {
        const options = connector.options ?? {};
        return [
            connector.name,
            options.GBIF_ENDPOINT ?? options.API_ENDPOINT ?? '',
        ].join('@');
    }

    private getMedia(
        kind: MediaKind,
        taxonId: string | number,
        connector: Connector,
        source?: MediaSource
    ): Promise<Media[]> {
        if (!source || taxonId === undefined || taxonId === null) {
            return Promise.resolve([]);
        }
        const id = String(taxonId);
        const groupKey = `${kind}|${source.id}|${this.scope(connector)}`;
        return this.cached<Media[]>(
            `${groupKey}|${id}`,
            () => this.enqueue(groupKey, kind, source, connector, id),
            (medias) => (medias.length ? TTL_FOUND_MS : TTL_EMPTY_MS)
        ).catch(() => []);
    }

    private enqueue(
        groupKey: string,
        kind: MediaKind,
        source: MediaSource,
        connector: Connector,
        id: string
    ): Promise<Media[]> {
        return new Promise((resolve, reject) => {
            let batch = this.pending.get(groupKey);
            if (!batch) {
                batch = {
                    kind,
                    source,
                    connector,
                    waiters: new Map(),
                    timer: setTimeout(
                        () => this.flush(groupKey),
                        this.windowMs
                    ),
                };
                this.pending.set(groupKey, batch);
            }
            const waiters = batch.waiters.get(id) ?? [];
            waiters.push({ resolve, reject });
            batch.waiters.set(id, waiters);

            if (batch.waiters.size >= this.maxBatch) {
                clearTimeout(batch.timer);
                this.flush(groupKey);
            }
        });
    }

    private flush(groupKey: string): void {
        const batch = this.pending.get(groupKey);
        if (!batch) return;
        this.pending.delete(groupKey);

        const ids = [...batch.waiters.keys()];
        const request: Promise<MediaBatch> =
            batch.kind === 'image'
                ? batch.source.fetchPictures(ids, batch.connector)
                : batch.source.fetchSounds(ids, batch.connector);

        request.then(
            (result) =>
                batch.waiters.forEach((waiters, id) =>
                    waiters.forEach((w) => w.resolve(result.get(id) ?? []))
                ),
            (error) =>
                batch.waiters.forEach((waiters) =>
                    waiters.forEach((w) => w.reject(error))
                )
        );
    }
}

let instance: Enricher | null = null;

export function getEnricher(): Enricher {
    if (!instance) {
        instance = new Enricher(createDefaultCache());
    }
    return instance;
}
