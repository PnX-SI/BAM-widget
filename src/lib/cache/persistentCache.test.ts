import { describe, it, expect } from 'vitest';
import { createMemoryBackend, PersistentCache } from './persistentCache';

describe('PersistentCache', () => {
    it('returns what was stored until the entry expires', async () => {
        let now = 1_000;
        const cache = new PersistentCache(createMemoryBackend(), () => now);

        await cache.set('k', { a: 1 }, 500);

        expect(await cache.get('k')).toEqual({ a: 1 });
        now = 1_499;
        expect(await cache.get('k')).toEqual({ a: 1 });
        now = 1_500;
        expect(await cache.get('k')).toBeUndefined();
    });

    it('treats a failing backend as a miss', async () => {
        const failing = {
            get: () => Promise.reject(new Error('blocked')),
            set: () => Promise.reject(new Error('full')),
        };
        const cache = new PersistentCache(failing);

        await expect(cache.set('k', 1, 1000)).resolves.toBeUndefined();
        await expect(cache.get('k')).resolves.toBeUndefined();
    });

    it('keeps falsy values such as null and empty arrays', async () => {
        const cache = new PersistentCache(createMemoryBackend());

        await cache.set('null', null, 1000);
        await cache.set('empty', [], 1000);

        expect(await cache.get('null')).toBeNull();
        expect(await cache.get('empty')).toEqual([]);
    });
});
