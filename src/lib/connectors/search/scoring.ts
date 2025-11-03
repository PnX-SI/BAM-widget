import { Taxon } from '@/lib/models';

export class SearchScoring {
    /**
     * Computes a score for a taxon given a search string and a list of search results
     * the score is computed as the difference between the score of the two taxa
     * @param {string} searchString - the search string
     * @param {any[]} searchApiResult - the list of search results
     * @returns {(a: Taxon, b: Taxon) => number} a function that takes two taxa and returns a score
     */
    scoring(searchString: string, searchApiResult: any[]) {
        return (a, b) => {
            const aScore = this.getScore(a, searchString, searchApiResult);
            const bScore = this.getScore(b, searchString, searchApiResult);
            return bScore - aScore;
        };
    }

    /**
     * Computes a score for a taxon given, a search string and a list of search results
     * @param {Taxon} taxon - the taxon to score
     * @param {string} searchString - the search string
     * @param {any[]} searchApiResult - the list of search results
     * @returns {number} the score of the taxon
     */
    getScore(
        taxon: Taxon,
        searchString: string,
        searchApiResult: any[]
    ): number {
        const data = taxon?.vernacularName
            ? `${taxon.vernacularName} ${taxon.acceptedScientificName}`
            : taxon.acceptedScientificName || 'incertae sedis';
        const searchStringLower = searchString.toLowerCase();
        const score = data.toLowerCase().includes(searchStringLower) ? 1 : 0;
        return score;
    }
}
