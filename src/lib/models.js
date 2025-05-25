class Taxon {
  constructor(taxonInfo) {
    // Required
    this.taxonId = taxonInfo.taxonId;
    this.acceptedScientificName = taxonInfo.acceptedScientificName;
    // Optional 
    this.vernacularName = taxonInfo?.vernacularName;
    this.nbObservations = taxonInfo?.nbObservations;
    this.mediaUrl = taxonInfo?.mediaUrl;
    this.taxonRank = taxonInfo?.taxonRank;
    this.description = taxonInfo?.description;
    this.taxonSheetUrl = taxonInfo?.taxonSheetUrl;
    this.lastSeenDate = taxonInfo?.lastSeenDate;
    this.kingdom = taxonInfo?.kingdom;
    this.class = taxonInfo?.class;
  }
}


class Media {
  constructor(mediaInfo){
    // Required
    this.url=mediaInfo.url
    this.source = mediaInfo.source;
    // Optional
    this.licence = mediaInfo?.licence;
    this.author = mediaInfo?.author;
  }
}

export { Taxon,Media };
