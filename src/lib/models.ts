export interface Taxon {
    taxonId: string | number;
    acceptedScientificName: string;
    vernacularName?: string;
    nbObservations?: number;
    mediaUrl?: string;
    taxonRank?: string;
    description?: string;
    taxonSheetUrl?: string;
    lastSeenDate?: Date | null;
    kingdom?: string;
    class?: string;
    status?: string;
}

export interface StatusInfo {
    code: string; // IUCN code: CR, EN, VU, NT, DD, LC, NE, NA, EX, EW
    group: string; // THREATENED, PROTECTED, NOT_EVALUATED, UNKNOWN
    color: string; // Hex color code
}
export enum MediaType {
    sound = 'sound',
    image = 'image',
}
export interface Media {
    url: string;
    source: string;
    typeMedia: MediaType;
    license?: string;
    author?: string;
    licenseUrl?: string;
    urlSource?: string;
}

export interface Dataset {
    uuid: string;
    name?: string;
    nbObservations: number;
}

export interface SearchResult {
    taxons: Taxon[];
    datasets: Dataset[];
}
