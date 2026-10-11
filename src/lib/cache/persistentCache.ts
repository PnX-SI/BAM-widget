/**
 * Small key/value cache with expiry, persisted in IndexedDB when available
 * and kept in memory otherwise. It never throws: a storage failure behaves
 * like a cache miss, so callers do not need their own error handling.
 */
export interface CacheEntry {
    value: unknown;
    expiresAt: number;
}

export interface CacheBackend {
    get(key: string): Promise<CacheEntry | undefined>;
    set(key: string, entry: CacheEntry): Promise<void>;
}

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export function createMemoryBackend(): CacheBackend {
    const store = new Map<string, CacheEntry>();
    return {
        get: (key) => Promise.resolve(store.get(key)),
        set: (key, entry) => {
            store.set(key, entry);
            return Promise.resolve();
        },
    };
}

const DB_NAME = 'bam-cache';
const STORE_NAME = 'kv';

/** IndexedDB backend, or null when IndexedDB cannot be used. */
export function createIndexedDbBackend(): CacheBackend | null {
    if (typeof indexedDB === 'undefined') return null;

    let dbPromise: Promise<IDBDatabase> | null = null;
    const open = (): Promise<IDBDatabase> => {
        if (!dbPromise) {
            dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, 1);
                request.onupgradeneeded = () =>
                    request.result.createObjectStore(STORE_NAME);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
        return dbPromise;
    };

    return {
        get: (key) =>
            open().then(
                (db) =>
                    new Promise<CacheEntry | undefined>((resolve, reject) => {
                        const request = db
                            .transaction(STORE_NAME)
                            .objectStore(STORE_NAME)
                            .get(key);
                        request.onsuccess = () => resolve(request.result);
                        request.onerror = () => reject(request.error);
                    })
            ),
        set: (key, entry) =>
            open().then(
                (db) =>
                    new Promise<void>((resolve, reject) => {
                        const transaction = db.transaction(
                            STORE_NAME,
                            'readwrite'
                        );
                        transaction.objectStore(STORE_NAME).put(entry, key);
                        transaction.oncomplete = () => resolve();
                        transaction.onerror = () => reject(transaction.error);
                    })
            ),
    };
}

export class PersistentCache {
    constructor(
        private backend: CacheBackend,
        private now: () => number = Date.now
    ) {}

    /** The cached value, or undefined when missing, expired or unreadable. */
    async get<T>(key: string): Promise<T | undefined> {
        try {
            const entry = await this.backend.get(key);
            if (!entry || entry.expiresAt <= this.now()) return undefined;
            return entry.value as T;
        } catch {
            return undefined;
        }
    }

    async set(key: string, value: unknown, ttlMs: number): Promise<void> {
        try {
            await this.backend.set(key, {
                value,
                expiresAt: this.now() + ttlMs,
            });
        } catch {
            // storage full or blocked: the value is simply not persisted
        }
    }
}

export function createDefaultCache(): PersistentCache {
    return new PersistentCache(
        createIndexedDbBackend() ?? createMemoryBackend()
    );
}
