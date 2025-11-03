import { Taxon } from '@/lib/models';
import { SearchScoring } from './scoring';

enum WeightScore {
    vernacularNameSimilarity = 1,
    scientificNameSimilarity = 1,
    presentInSearchApi = 2,
    partialMatch = 0.5,
    nbObservations = 0.5,
}

interface GBIFSearchSpecieResult {
    key: number;
    nameKey: number;
    datasetKey: string;
    constituentKey: string;
    nubKey: number;
    parentKey: number;
    parent: string;
    kingdom: string;
    phylum: string;
    family: string;
    genus: string;
    species: string;
    kingdomKey: number;
    phylumKey: number;
    classKey: number;
    familyKey: number;
    genusKey: number;
    speciesKey: number;
    scientificName: string;
    canonicalName: string;
    authorship: string;
    publishedIn: string;
    nameType: 'SCIENTIFIC' | string;
    taxonomicStatus: 'ACCEPTED' | string;
    rank: 'SPECIES' | string;
    origin: 'SOURCE' | string;
    numDescendants: number;
    numOccurrences: number;
    taxonID: string;
    habitats: any[];
    nomenclaturalStatus: any[];
    threatStatuses: string[];
    descriptions: any[];
    vernacularNames: any;
    synonym: boolean;
    higherClassificationMap: Record<number, string>;
    class: string;
}

export class GBIFSearchScoring extends SearchScoring {
    scoring(searchString: string, searchApiResult: GBIFSearchSpecieResult[]) {
        return (a, b) => {
            const aScore = this.getScore(a, searchString, searchApiResult);
            const bScore = this.getScore(b, searchString, searchApiResult);
            return bScore - aScore;
        };
    }

    getScore(
        taxon: Taxon,
        searchString: string,
        searchApiResult: GBIFSearchSpecieResult[]
    ): number {
        let score = 0;
        const searchLower = searchString.toLowerCase();
        const scientificName = taxon.acceptedScientificName.toLowerCase();
        const vernacularName = taxon?.vernacularName?.toLowerCase() || '';
        if (searchLower) {
            if (vernacularName == searchLower) {
                score += WeightScore.vernacularNameSimilarity;
            } else if (vernacularName.includes(searchLower)) {
                score += WeightScore.partialMatch;
            }

            if (scientificName == searchLower) {
                score += WeightScore.scientificNameSimilarity;
            } else if (scientificName.includes(searchLower)) {
                score += WeightScore.partialMatch;
            }
        }
        if (searchApiResult.length > 0) {
            searchApiResult.forEach((result, index) => {
                if (result.nubKey == taxon.taxonId) {
                    score += WeightScore.presentInSearchApi;
                }
                if (
                    taxon.acceptedScientificName.includes(result.scientificName)
                ) {
                    score += WeightScore.presentInSearchApi * (1 / (index + 1));
                }
                if (taxon.class == result.class) {
                    score += WeightScore.presentInSearchApi * (1 / (index + 1));
                }
            });
        }
        if (taxon.nbObservations) {
            score += WeightScore.nbObservations;
        }
        return score;
    }
}
