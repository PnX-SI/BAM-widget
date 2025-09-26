export interface Taxon {
    taxonId: string;
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
