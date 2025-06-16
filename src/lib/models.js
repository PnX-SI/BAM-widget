class Taxon {
  constructor(taxonInfo) {
    // Required
    this.taxonId = taxonInfo.taxonId;
    this.acceptedScientificName = taxonInfo.acceptedScientificName;

    // Optional
    const {
      vernacularName = "",
      nbObservations = 0,
      mediaUrl = "",
      taxonRank = "",
      description = "",
      taxonSheetUrl = "",
      lastSeenDate = null,
      kingdom = "",
      class: taxonClass = "", // 'class' is a reserved word in JavaScript, so we use 'taxonClass'
    } = taxonInfo;

    this.vernacularName = vernacularName;
    this.nbObservations = nbObservations;
    this.mediaUrl = mediaUrl;
    this.taxonRank = taxonRank;
    this.description = description;
    this.taxonSheetUrl = taxonSheetUrl;
    this.lastSeenDate = lastSeenDate;
    this.kingdom = kingdom;
    this.class = taxonClass;
  }
}

class Media {
  constructor(mediaInfo) {
    // Required properties
    this.url = mediaInfo.url;
    this.source = mediaInfo.source;
    this.typeMedia=mediaInfo.typeMedia;

    // Optional properties with default values
    const { license = "", author = "" } = mediaInfo;

    this.license = license;
    this.author = author;
  }
}

export { Taxon, Media };
