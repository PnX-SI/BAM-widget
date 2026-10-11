/**
 * Lightweight timing marks, readable from DevTools or Playwright with
 * `performance.getEntriesByType('mark')` (names are prefixed with `bam:`).
 *
 *   bam:list:start   a taxon list request begins (clears the marks below)
 *   bam:list:ready   the taxon list is available
 *   bam:list:error   the taxon list request failed
 *   bam:first-image  the first taxon picture was resolved
 */
const PREFIX = 'bam:';

export function perfMark(name: string): void {
    try {
        performance.mark(PREFIX + name);
    } catch {
        // Performance API unavailable
    }
}

/** Mark only once since the last `perfReset()`. */
export function perfMarkOnce(name: string): void {
    try {
        if (performance.getEntriesByName(PREFIX + name).length === 0) {
            performance.mark(PREFIX + name);
        }
    } catch {
        // Performance API unavailable
    }
}

export function perfReset(): void {
    try {
        ['list:ready', 'list:error', 'first-image'].forEach((n) =>
            performance.clearMarks(PREFIX + n)
        );
    } catch {
        // Performance API unavailable
    }
}
