/**
 * Shared HTTP layer for connectors and media sources.
 *
 * - bounds the number of simultaneous requests per host (a card list would
 *   otherwise fire hundreds of requests at once and get throttled);
 * - retries on 429/503, honouring `Retry-After`;
 * - deduplicates identical in-flight/finished async work with `memoAsync`.
 */

const DEFAULT_HOST_LIMIT = 6;
/** Hosts that throttle aggressively get a lower concurrency. */
const HOST_LIMITS: Record<string, number> = {
    'query.wikidata.org': 3,
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 5000;

export type Limiter = <T>(task: () => Promise<T>) => Promise<T>;

/**
 * Create a function that runs tasks with at most `max` of them in flight.
 * Tasks start in FIFO order.
 * @param {number} max - maximum number of simultaneous tasks
 */
export function createLimiter(max: number): Limiter {
    let active = 0;
    const queue: Array<() => void> = [];

    const release = () => {
        active--;
        const next = queue.shift();
        if (next) next();
    };

    return <T>(task: () => Promise<T>): Promise<T> =>
        new Promise<T>((resolve, reject) => {
            const run = () => {
                active++;
                Promise.resolve()
                    .then(task)
                    .then(resolve, reject)
                    .finally(release);
            };
            if (active < max) run();
            else queue.push(run);
        });
}

const limiters = new Map<string, Limiter>();

function getLimiter(url: string): Limiter {
    let host = '';
    try {
        host = new URL(url).host;
    } catch {
        // relative or invalid URL: share the default bucket
    }
    let limiter = limiters.get(host);
    if (!limiter) {
        limiter = createLimiter(HOST_LIMITS[host] ?? DEFAULT_HOST_LIMIT);
        limiters.set(host, limiter);
    }
    return limiter;
}

function retryDelay(response: Response, attempt: number): number {
    const retryAfter = Number(response.headers?.get?.('Retry-After'));
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
        return Math.min(retryAfter * 1000, MAX_DELAY_MS);
    }
    return Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * `fetch` with per-host concurrency limit and retry on 429/503.
 * After the last retry the last response is returned as is, so callers keep
 * their own status handling.
 */
export function scheduledFetch(
    url: string,
    init?: RequestInit
): Promise<Response> {
    return getLimiter(url)(async () => {
        let attempt = 0;
        for (;;) {
            const response = await fetch(url, init);
            const retryable =
                response.status === 429 || response.status === 503;
            if (!retryable || attempt >= MAX_RETRIES) return response;
            await sleep(retryDelay(response, attempt));
            attempt++;
        }
    });
}

/**
 * Run `factory` once per key and share the promise between callers
 * (in-flight and settled). A rejected promise is evicted so that the next
 * caller retries.
 */
export function memoAsync<T>(
    cache: Map<string, Promise<T>>,
    key: string,
    factory: () => Promise<T>
): Promise<T> {
    const cached = cache.get(key);
    if (cached) return cached;
    const promise = factory().catch((error) => {
        cache.delete(key);
        throw error;
    });
    cache.set(key, promise);
    return promise;
}
