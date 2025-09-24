import { Media, MediaType } from "../models";
import { MediaSource } from "./MediaSource";
import { TAXON_REFERENTIAL } from "../taxonReferential";
import { SOURCE_ } from "./media";
import { Connector } from "../connectors/connector";
import { validURL } from "../utils";

export class GBIFMediaSource extends MediaSource {
  constructor(parameters?: any) {
    super("GBIF", SOURCE_.gbif);
  }

  isCompatible(connector: Connector): boolean {
    return connector.referential === TAXON_REFERENTIAL.GBIF;
  }

  fetchPicture(
    taxonID: string,
    connector: Connector
  ): Promise<Media[] | undefined> {
    if (!this.isCompatible(connector)) {
      throw new Error(
        `The connector ${connector.name} is not available for the GBIF Media Source`
      );
    }
    const url = `${connector.GBIF_ENDPOINT}/species/${taxonID}/media`;
    return fetch(url)
      .then((response) => response.json())
      .then((json: any) => {
        let mediaList = this.processMedia(json.results);
        if (mediaList.length === 0) {
          return this.fetchMediaOccurence(taxonID, connector.GBIF_ENDPOINT);
        }
        return mediaList;
      });
  }

  fetchSound(
    taxonID: string,
    connector: Connector
  ): Promise<Media[] | undefined> {
    if (!this.isCompatible(connector)) {
      throw new Error(
        `The connector ${connector.name} is not available for the GBIF Media Source`
      );
    }
    const url = `${connector.GBIF_ENDPOINT}/occurrence/search?limit=10&mediaType=Sound&speciesKey=${taxonID}`;
    return fetch(url)
      .then((response) => response.json())
      .then((data: any) => {
        if (data.results.length > 0) {
          for (let occ of data.results) {
            for (let media of occ["media"]) {
              const ext = media.identifier.split(".").pop();
              if (!["png", "jpg", "jpeg", "bmp", "gif"].includes(ext)) {
                return [
                  {
                    url: media.identifier,
                    typeMedia: MediaType.sound,
                    license: media.license,
                    source: `${media.rightsHolder} (${media.license})`,
                  },
                ];
              }
            }
          }
        }
        return [];
      });
  }

  /**
   * Fetch medias with licence and rights holder informations
   * @param medias - The media data to process.
   * @returns The list of Media objects.
   */
  processMedia(medias: Array<any>): Media[] {
    return Object.values(medias)
      .filter(
        (media) =>
          media.hasOwnProperty("license") &&
          media.hasOwnProperty("rightsHolder")
      )
      .map((media) => {
        return {
          url: media.identifier,
          license: media.license, // corrected from licence to license
          source: `${media.rightsHolder} (${media.license})`,
          typeMedia: "image",
          author: media.rightsHolder,
          urlSource: validURL(media.source) ? media.source : media.identifier,
        };
      });
  }

  /**
   * Fetches media from occurrences of a taxon ID
   * @param idTaxon - The ID of the taxon.
   * @returns A promise that resolves to the list of media.
   */
  fetchMediaOccurence(idTaxon: string, ENDPOINT: string): Promise<Media[]> {
    const url = `${ENDPOINT}/occurrence/search?limit=10&mediaType=StillImage&speciesKey=${idTaxon}`;
    return fetch(url)
      .then((response) => response.json())
      .then((json: any) => {
        const medias = json.results.flatMap((element) => element.media);
        return this.processMedia(medias);
      });
  }
}
