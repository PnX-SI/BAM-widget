import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    createLimiter,
    HostGate,
    memoAsync,
    scheduledFetch,
} from './scheduler';

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

        const promise = scheduledFetch('https://a-host.test/x');
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

        const promise = scheduledFetch('https://b-host.test/x');
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

        const promise = scheduledFetch('https://c-host.test/x');
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result.status).toBe(429);
        expect(fetchMock).toHaveBeenCalledTimes(4); // 1 call + 3 retries
    });

    it('does not retry other statuses', async () => {
        const fetchMock = vi.fn().mockResolvedValue(response(404));
        vi.stubGlobal('fetch', fetchMock);

        const result = await scheduledFetch('https://d-host.test/x');

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

describe('scheduledFetch on api.gbif.org', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('starts with 2 requests in flight and grows to 4 while it succeeds', async () => {
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
            Array.from({ length: 30 }, (_, i) =>
                scheduledFetch(`https://api.gbif.org/v1/species/${i}`)
            )
        );

        expect(peak).toBe(4);
    });
});

describe('HostGate', () => {
    afterEach(() => vi.useRealTimers());

    it('pauses every task of the host after penalize', async () => {
        vi.useFakeTimers();
        const gate = new HostGate(2);
        gate.penalize(1000);
        const task = vi.fn().mockResolvedValue('ok');

        const result = gate.run(task);
        await vi.advanceTimersByTimeAsync(900);
        expect(task).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(200);

        await expect(result).resolves.toBe('ok');
        expect(task).toHaveBeenCalledTimes(1);
    });

    it('halves its concurrency when penalized and recovers on success', () => {
        const gate = new HostGate(2, 4);

        gate.penalize(0);
        expect(gate.concurrency).toBe(1);
        for (let i = 0; i < 10; i++) gate.reward();
        expect(gate.concurrency).toBe(2);
        for (let i = 0; i < 100; i++) gate.reward();
        expect(gate.concurrency).toBe(4);
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
