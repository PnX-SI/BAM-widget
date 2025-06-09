import { Media } from "../models";
import { TAXON_REFERENTIAL } from "../taxonReferential";
import { MediaSource } from "./MediaSource";

const { GBIF, TAXREF } = TAXON_REFERENTIAL;

function fetchWikidataEntityByTaxrefId(cdNom) {
  const url = "https://query.wikidata.org/sparql";
  const query = `
    SELECT ?item WHERE {
      ?item wdt:P3186 "${cdNom}" .
    }`;

  return fetch(url + "?format=json&query=" + encodeURIComponent(query))
    .then((response) => response.json())
    .then((data) => {
      if (!data.results.bindings.length) {
        return null;
      }
      const entityId = data.results.bindings[0].item.value.split("/").pop();
      return entityId;
    });
}

function fetchWikidataEntityByGbifId(gbifId) {
  const url = "https://query.wikidata.org/sparql";
  const query = `
    SELECT ?item WHERE {
      ?item wdt:P846 "${gbifId}" .
    }`;

  return fetch(url + "?format=json&query=" + encodeURIComponent(query))
    .then((response) => response.json())
    .then((data) => {
      if (!data.results.bindings.length) {
        return null;
      }
      const entityId = data.results.bindings[0].item.value.split("/").pop();
      return entityId;
    });
}
function fetchImageFromWikidata(entityId) {
  if (!entityId) return;
  // Step 2: Retrieve the entity data from Wikidata
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Extract the image filename
      const entity = data.entities[entityId];
      const claims = entity.claims || {};
      const imageClaims = claims.P18 || [];

      if (!imageClaims.length) {
        return "No image found for this entity.";
      }

      // Get the filename from the first image claim
      const imageFilename = imageClaims[0].mainsnak.datavalue.value;
      // Step 3: Construct the URL to fetch the image from Wikimedia Commons
      const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${imageFilename}`;
      return [
        new Media({
          url: imageUrl,
          source: "Wikidata",
        }),
      ];
    });
}

function fetchWikidataImage(idTaxon, connector, wikidataEntryID = null) {
  if (!idTaxon) throw new Error("No taxonId given !");

  if (wikidataEntryID) {
    return fetchImageFromWikidata(wikidataEntryID);
  } else if (idTaxon) {
    let fetchIDPromise = null;
    switch (connector.referential) {
      case TAXON_REFERENTIAL.GBIF:
        fetchIDPromise = fetchWikidataEntityByGbifId(idTaxon);
        break;
      case TAXON_REFERENTIAL.TAXREF:
        fetchIDPromise = fetchWikidataEntityByTaxrefId(idTaxon);
        break;
      default:
        break;
    }
    if (!fetchIDPromise) return;

    return fetchIDPromise.then((idWikidata) => {
      if (idWikidata) return fetchImageFromWikidata(idWikidata);
    });
  }
}

class WikiDataImageSource extends MediaSource {
  constructor() {
    super("WikidataMediaSource");
  }
  fetchMedia(taxonID, connector) {
    if (!this.isCompatible(connector)) {
      throw new Error(
        `Wikidata Image source is only compatible with the GBIF and a TAXREF referential based connector `
      );
    }
    return fetchWikidataImage(taxonID, connector);
  }
  isCompatible(connector) {
    if ([GBIF, TAXREF].includes(connector.referential)) {
      return true;
    }
    return false;
  }
}

export { WikiDataImageSource };
