import { describe, it, expect, vi } from 'vitest';

vi.mock('../parameterStore', () => ({ default: { getInstance: () => ({}) } }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

// connector.ts <-> utils.ts <-> gbif.ts form an import cycle that only
// resolves when utils.ts is loaded first (same order as the app).
import './utils';
import { mergeOccurrencePage } from './gbif';
import { Dataset, Taxon } from '../models';

const obs = (taxonKey: number, eventDate: string, datasetKey = 'ds1') => ({
    taxonKey,
    datasetKey,
    eventDate,
    acceptedScientificName: `Taxon ${taxonKey}`,
    vernacularName: `Name ${taxonKey}`,
    taxonRank: 'SPECIES',
    kingdom: 'Animalia',
    class: 'Aves',
});

describe('mergeOccurrencePage', () => {
    const page1 = [
        obs(1, '2024-05-01'),
        obs(1, '2024-06-01'),
        obs(2, '2023-01-01', 'ds2'),
    ];
    const page2 = [obs(1, '2022-01-01'), obs(2, '2025-02-02', 'ds2')];

    function aggregate(pages: any[][]) {
        const taxons: Record<string, Taxon> = {};
        const datasets: Record<string, Dataset> = {};
        pages.forEach((page) => mergeOccurrencePage(page, taxons, datasets));
        return { taxons, datasets };
    }

    it('counts observations per taxon and per dataset', () => {
        const { taxons, datasets } = aggregate([page1, page2]);

        expect(taxons[1].nbObservations).toBe(3);
        expect(taxons[2].nbObservations).toBe(2);
        expect(datasets.ds1.nbObservations).toBe(3);
        expect(datasets.ds2.nbObservations).toBe(2);
    });

    it('keeps the most recent observation date', () => {
        const { taxons } = aggregate([page1, page2]);

        expect(taxons[1].lastSeenDate?.toISOString().slice(0, 10)).toBe(
            '2024-06-01'
        );
        expect(taxons[2].lastSeenDate?.toISOString().slice(0, 10)).toBe(
            '2025-02-02'
        );
    });

    it('gives the same result whatever the page arrival order', () => {
        const a = aggregate([page1, page2]);
        const b = aggregate([page2, page1]);

        const view = (r: ReturnType<typeof aggregate>) =>
            Object.values(r.taxons).map((t) => [
                t.taxonId,
                t.nbObservations,
                t.lastSeenDate?.getTime(),
            ]);
        expect(view(b)).toEqual(view(a));
        expect(b.datasets).toEqual(a.datasets);
    });
});
