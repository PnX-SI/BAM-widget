/**
 * Shared HTTP layer for connectors and media sources.
 *
 * - bounds the number of simultaneous requests per host (a card list would
 *   otherwise fire hundreds of requests at once and get throttled);
 * - backs off per host on 429/503: the whole host pauses for `Retry-After`
 *   and its concurrency is halved, then grows back while requests succeed;
 * - retries a throttled request, re-queued behind the pause;
 * - deduplicates identical in-flight/finished async work with `memoAsync`.
 */

/** Concurrency of hosts that are not listed below. */
const DEFAULT_HOST_LIMIT = { initial: 6, ceiling: 6 };
/**
 * Hosts that throttle: they start low and may grow to `ceiling`.
 * - GBIF occurrence/search answers 429 (Retry-After: 3) as soon as heavy
 *   queries overlap: 4 at once failed 12 times out of 20 in a measure,
 *   1 or 2 at once almost never.
 */
const HOST_LIMITS: Record<string, { initial: number; ceiling: number }> = {
    'query.wikidata.org': { initial: 3, ceiling: 3 },
    'api.gbif.org': { initial: 2, ceiling: 4 },
};
/** Successful requests in a row before a throttled host gets one slot back. */
const SUCCESSES_TO_GROW = 10;

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

/**
 * Runs tasks of one host with an adaptive number in flight and a pause
 * after throttling.
 */
export class HostGate {
    private active = 0;
    private queue: Array<() => void> = [];
    private pausedUntil = 0;
    private successes = 0;
    private wakeUp: ReturnType<typeof setTimeout> | null = null;

    constructor(
        private max: number,
        private ceiling: number = max
    ) {}

    get concurrency(): number {
        return this.max;
    }

    run<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(() => {
                this.active++;
                Promise.resolve()
                    .then(task)
                    .then(resolve, reject)
                    .finally(() => {
                        this.active--;
                        this.pump();
                    });
            });
            this.pump();
        });
    }

    /** The host throttled us: pause everything and slow down. */
    penalize(delayMs: number): void {
        this.pausedUntil = Math.max(this.pausedUntil, Date.now() + delayMs);
        this.max = Math.max(1, Math.floor(this.max / 2));
        this.successes = 0;
    }

    /** A request went through: slowly give concurrency back. */
    reward(): void {
        if (++this.successes >= SUCCESSES_TO_GROW && this.max < this.ceiling) {
            this.max++;
            this.successes = 0;
            this.pump();
        }
    }

    private pump(): void {
        const wait = this.pausedUntil - Date.now();
        if (wait > 0) {
            if (!this.wakeUp && this.queue.length) {
                this.wakeUp = setTimeout(() => {
                    this.wakeUp = null;
                    this.pump();
                }, wait);
            }
            return;
        }
        while (this.active < this.max && this.queue.length) {
            this.queue.shift()!();
        }
    }
}

const gates = new Map<string, HostGate>();

function getGate(url: string): HostGate {
    let host = '';
    try {
        host = new URL(url).host;
    } catch {
        // relative or invalid URL: share the default bucket
    }
    let gate = gates.get(host);
    if (!gate) {
        const limits = HOST_LIMITS[host] ?? DEFAULT_HOST_LIMIT;
        gate = new HostGate(limits.initial, limits.ceiling);
        gates.set(host, gate);
    }
    return gate;
}

function retryDelay(response: Response, attempt: number): number {
    const retryAfter = Number(response.headers?.get?.('Retry-After'));
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
        return Math.min(retryAfter * 1000, MAX_DELAY_MS);
    }
    return Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
}

/**
 * `fetch` with per-host concurrency, back-off and retry on 429/503.
 * After the last retry the last response is returned as is, so callers keep
 * their own status handling.
 */
export async function scheduledFetch(
    url: string,
    init?: RequestInit
): Promise<Response> {
    const gate = getGate(url);
    for (let attempt = 0; ; attempt++) {
        const response = await gate.run(() => fetch(url, init));
        const throttled = response.status === 429 || response.status === 503;
        if (!throttled) {
            gate.reward();
            return response;
        }
        gate.penalize(retryDelay(response, attempt));
        if (attempt >= MAX_RETRIES) return response;
    }
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
