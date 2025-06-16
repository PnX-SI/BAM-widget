import { Media } from "../models";
import { MediaSource } from "./MediaSource";
import { TAXON_REFERENTIAL } from "../taxonReferential";
import { SOURCE_ } from "./media";

export class GBIFMediaSource extends MediaSource {
  constructor(parameters) {
    super("GBIFMediaSource", SOURCE_.GBIF);
  }
  isCompatible(connector) {
    return connector.referential == TAXON_REFERENTIAL.GBIF ? true : false;
  }
  fetchPicture(taxonID, connector) {
    if (!this.isCompatible(connector)) {
      throw new Error(
        `The connector ${connector.name} is not available for the GBIF Media Source`
      );
    }
    const url = `${connector.GBIF_ENDPOINT}/species/${taxonID}/media`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) => {
        let mediaList = this.processMedia(json.results);
        if (mediaList.length === 0) {
          return this.fetchMediaOccurence(taxonID, connector.GBIF_ENDPOINT);
        }
        return mediaList;
      });
  }

  fetchSound(taxonID, connector) {
    if (!this.isCompatible(connector)) {
      throw new Error(
        `The connector ${connector.name} is not available for the GBIF Media Source`
      );
    }
    const url = `${connector.GBIF_ENDPOINT}/occurrence/search?limit=10&mediaType=Sound&speciesKey=${taxonID}`;
    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.results.length > 0) {
          const media = data.results[0].media[0];
          for (let occ of data.results) {
            for (let media of occ["media"]) {
              if (
                !["png", "jpg", "jpeg", "bmp", "gif"].includes(
                  media.identifier.split(".").pop()
                )
              )
                return new Media({
                  url: media.identifier,
                  typeMedia: "sound",
                  license: media.license,
                  source: `${media.rightsHolder} (${media.license})`,
                });
            }
          }
        }
      });
  }

  /**
   * Fetch medias with licence and rights holder informations
   * @param {Array} medias - The media data to process.
   * @returns {Array} The list of Media objects.
   */
  processMedia(medias) {
    return Object.values(medias)
      .filter(
        (media) =>
          media.hasOwnProperty("license") &&
          media.hasOwnProperty("rightsHolder")
      )
      .map(
        (media) =>
          new Media({
            url: media.identifier,
            license: media.licence,
            source: `${media.rightsHolder} (${media.license})`,
            typeMedia: "image",
          })
      );
  }

  /**
   * Fetches media from occurrences of a taxon ID
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Array>} A promise that resolves to the list of media.
   */
  fetchMediaOccurence(idTaxon, ENDPOINT) {
    const url = `${ENDPOINT}/occurrence/search?limit=10&mediaType=StillImage&speciesKey=${idTaxon}`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const medias = json.results.flatMap((element) => element.media);
        return this.processMedia(medias);
      });
  }
}
