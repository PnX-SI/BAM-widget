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

export interface Media {
  url: string;
  source: string;
  typeMedia: string;
  license?: string;
  author?: string;
  licenseUrl?: string;
  urlSource?: string;
}
