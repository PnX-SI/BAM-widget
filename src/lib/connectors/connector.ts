import { toast } from "vue3-toastify";
import { getMediaSource, SOURCE_ } from "../media/media";
import { MediaSource } from "../media/MediaSource";

export interface ConnectorOptions {
  imageSource?: string | MediaSource;
  soundSource?: string | MediaSource;
  [key: string]: any;
}

export class Connector {
  name?: string;
  taxonClass2SourceID: Record<string, number> = {};
  referential?: string;
  options: ConnectorOptions;
  imageSource?: MediaSource;
  soundSource?: MediaSource;

  constructor(options: ConnectorOptions) {
    this.options = options;

    this.imageSource = this.parseMediaSource(options?.imageSource);
    this.soundSource = this.parseMediaSource(options?.soundSource);
  }

  parseMediaSource(
    mediaSource?: string | MediaSource
  ): MediaSource | undefined {
    if (typeof mediaSource === "string") {
      return getMediaSource(SOURCE_[mediaSource]);
    }
    return mediaSource;
  }

  verifyOptions(params_names: string[] = []): void {
    params_names.forEach((name) => {
      if (!this.options.hasOwnProperty(name)) {
        toast.error(`Please indicate the ${name} parameter`);
      }
    });
  }

  getParamsSchema(): Record<string, any> {
    return {};
  }

  /**
   * Returns specific parameters for a Connector
   * @returns {Object}
   */
  getParams(): Record<string, any> {
    const params: Record<string, any> = {};
    Object.entries(this)
      .filter(
        ([key, _]) =>
          ![
            "options",
            "params",
            "name",
            "taxonClass2SourceID",
            "referential",
            "soundSource",
            "imageSource",
          ].includes(key)
      )
      .filter(([_, value]) => typeof value !== "object")
      .forEach(([key, value]) => {
        params[key] = value;
      });

    if (this.soundSource) {
      params["soundSource"] = this.soundSource.id;
    }
    if (this.imageSource) {
      params["imageSource"] = this.imageSource.id;
    }
    return params;
  }

  /**
   * Fetches occurrences based on the given parameters.
   * @param {Object} params - The parameters for the occurrence query.
   * @returns {Promise<Object>} A promise that resolves to the taxons data.
   */
  fetchOccurrence(params: Record<string, any>): Promise<any> {
    throw new Error("Not implemented");
  }

  /**
   * Fetches taxon information for a given taxon ID.
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Object>} A promise that resolves to the taxon information.
   */
  fetchTaxonInfo(idTaxon: string): Promise<any> {
    throw new Error("Not implemented");
  }

  /**
   * Fetches the taxon status for a given taxon ID.
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Object>} A promise that resolves to the taxon status.
   */
  fetchTaxonStatus(idTaxon: string): Promise<any> {
    throw new Error("Not implemented");
  }

  /**
   * Searches for taxa based on a search string.
   * @param {string} searchString - The search string.
   * @param {Object} params - Additional parameters for the search.
   * @returns {Promise<Array>} A promise that resolves to the list of search results.
   */
  searchTaxon(
    searchString: string = "",
    params: Record<string, any> = {}
  ): Promise<any[]> | undefined {
    // Not implemented in original code
    return undefined;
  }

  /**
   * Gets the detail page URL for a given taxon ID.
   * @param {string} taxonId - The ID of the taxon.
   * @returns {string} The URL of the taxon detail page.
   */
  getTaxonDetailPage(taxonId: string): string {
    throw new Error("Not implemented");
  }

  /**
   * Fetches the vernacular name for a given taxon ID.
   * @param {string} taxonID - The ID of the taxon.
   * @returns {Promise<string|undefined>} A promise that resolves to the vernacular name if found.
   */
  fetchVernacularName(taxonID: string): Promise<string | undefined> {
    throw new Error("Not implemented");
  }

  /**
   * Return details concerning the data retrieved with this source
   * @returns source detail
   */
  sourceDetailMessage(): string | null {
    return null;
  }

  getCompatibleMediaSource(): Array<{ value: string; text: string }> {
    const availableSource: Array<{ value: string; text: string }> = [];
    Object.values(SOURCE_).forEach((idMediaSource) => {
      const mediaSource = getMediaSource(idMediaSource);
      if (mediaSource.isCompatible(this)) {
        availableSource.push({
          value: idMediaSource,
          text: mediaSource.name,
        });
      }
    });
    return availableSource;
  }
}
