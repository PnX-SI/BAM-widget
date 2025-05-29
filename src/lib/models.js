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

    // Optional properties with default values
    const { licence = "", author = "" } = mediaInfo;

    this.licence = licence;
    this.author = author;
  }
}

export { Taxon, Media };
