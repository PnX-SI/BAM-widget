import { describe, it, expect, vi, afterEach } from 'vitest';
import { createLimiter, memoAsync, scheduledFetch } from './scheduler';

function response(status: number, headers: Record<string, string> = {}) {
    return new Response('{}', { status, headers });
}

describe('createLimiter', () => {
    it('never runs more than `max` tasks at once and keeps FIFO order', async () => {
        const limit = createLimiter(2);
        let active = 0;
        let peak = 0;
        const started: number[] = [];

        const task = (id: number) =>
            limit(async () => {
                started.push(id);
                active++;
                peak = Math.max(peak, active);
                await new Promise((r) => setTimeout(r, 5));
                active--;
                return id;
            });

        const results = await Promise.all([1, 2, 3, 4, 5].map(task));

        expect(results).toEqual([1, 2, 3, 4, 5]);
        expect(peak).toBe(2);
        expect(started).toEqual([1, 2, 3, 4, 5]);
    });

    it('keeps running queued tasks after a task fails', async () => {
        const limit = createLimiter(1);
        const failing = limit(() => Promise.reject(new Error('boom')));
        const next = limit(() => Promise.resolve('ok'));

        await expect(failing).rejects.toThrow('boom');
        await expect(next).resolves.toBe('ok');
    });
});

describe('scheduledFetch', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('retries on 429 and returns the first successful response', async () => {
        vi.useFakeTimers();
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(response(429))
            .mockResolvedValueOnce(response(200));
        vi.stubGlobal('fetch', fetchMock);

        const promise = scheduledFetch('https://api.test/a');
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('waits for Retry-After when provided', async () => {
        vi.useFakeTimers();
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(response(429, { 'Retry-After': '2' }))
            .mockResolvedValueOnce(response(200));
        vi.stubGlobal('fetch', fetchMock);

        const promise = scheduledFetch('https://api.test/b');
        await vi.advanceTimersByTimeAsync(1900);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(200);
        await promise;
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('gives back the last 429 once retries are exhausted', async () => {
        vi.useFakeTimers();
        const fetchMock = vi.fn().mockResolvedValue(response(429));
        vi.stubGlobal('fetch', fetchMock);

        const promise = scheduledFetch('https://api.test/c');
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result.status).toBe(429);
        expect(fetchMock).toHaveBeenCalledTimes(4); // 1 call + 3 retries
    });

    it('does not retry other statuses', async () => {
        const fetchMock = vi.fn().mockResolvedValue(response(404));
        vi.stubGlobal('fetch', fetchMock);

        const result = await scheduledFetch('https://api.test/d');

        expect(result.status).toBe(404);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('limits simultaneous requests on one host', async () => {
        let active = 0;
        let peak = 0;
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                active++;
                peak = Math.max(peak, active);
                await new Promise((r) => setTimeout(r, 5));
                active--;
                return response(200);
            })
        );

        await Promise.all(
            Array.from({ length: 20 }, (_, i) =>
                scheduledFetch(`https://busy.test/${i}`)
            )
        );

        expect(peak).toBeLessThanOrEqual(6);
        expect(peak).toBeGreaterThan(1);
    });
});

describe('memoAsync', () => {
    it('shares one promise between concurrent and later callers', async () => {
        const cache = new Map<string, Promise<number>>();
        const factory = vi.fn(() => Promise.resolve(42));

        const [a, b] = await Promise.all([
            memoAsync(cache, 'k', factory),
            memoAsync(cache, 'k', factory),
        ]);
        const c = await memoAsync(cache, 'k', factory);

        expect([a, b, c]).toEqual([42, 42, 42]);
        expect(factory).toHaveBeenCalledTimes(1);
    });

    it('evicts a rejected promise so the next call retries', async () => {
        const cache = new Map<string, Promise<string>>();
        const factory = vi
            .fn()
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce('ok');

        await expect(memoAsync(cache, 'k', factory)).rejects.toThrow('network');
        await expect(memoAsync(cache, 'k', factory)).resolves.toBe('ok');
        expect(factory).toHaveBeenCalledTimes(2);
    });
});
