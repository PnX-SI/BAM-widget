import { toast } from "vue3-toastify";
import { getMediaSource, SOURCE_ } from "../media/media";

class Connector {
  name;
  taxonClass2SourceID = {};
  referential;

  constructor(options) {
    this.options = options;

    this.mediaSource = options?.mediaSource;
  }
  verifyOptions(params_names = []) {
    params_names.forEach((name) => {
      if (!this.options.hasOwnProperty(name)) {
        toast.error(`Please indicate the ${name} parameter`);
      }
    });
  }

  getParams() {
    const params = {};
    Object.entries(this)
      .filter(
        ([key, _]) =>
          ![
            "options",
            "params",
            "name",
            "taxonClass2SourceID",
            "referential",
            "mediaSource",
          ].includes(key)
      )
      .filter(([key, value]) => typeof value != typeof {})
      .forEach(([key, value]) => {
        params[key] = value;
      });
    if (this.mediaSource) {
      params["mediaSource"] = this.mediaSource.id;
    }
    return params;
  }
  /**
   * Fetches occurrences based on the given parameters.
   * @param {Object} params - The parameters for the occurrence query.
   * @returns {Promise<Object>} A promise that resolves to the taxons data.
   */
  fetchOccurrence(params) {
    throw new Error("Not implemented");
  }

  /**
   * Fetches media for a given taxon ID.
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Array>} A promise that resolves to the list of media.
   */
  fetchMedia(idTaxon) {
    if (!this.mediaSource.isCompatible(this))
      throw new Error("Media Source incompatible");

    return this.mediaSource.fetchPicture(idTaxon, this);
  }

  /**
   * Fetches taxon information for a given taxon ID.
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Object>} A promise that resolves to the taxon information.
   */
  fetchTaxonInfo(idTaxon) {
    throw new Error("Not implemented");
  }

  /**
   * Fetches the taxon status for a given taxon ID.
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Object>} A promise that resolves to the taxon status.
   */
  fetchTaxonStatus(idTaxon) {
    throw new Error("Not implemented");
  }

  /**
   * Searches for taxa based on a search string.
   * @param {string} searchString - The search string.
   * @param {Object} params - Additional parameters for the search.
   * @returns {Promise<Array>} A promise that resolves to the list of search results.
   */
  searchTaxon(searchString = "", params = {}) {}

  /**
   * Gets the detail page URL for a given taxon ID.
   * @param {string} taxonId - The ID of the taxon.
   * @returns {string} The URL of the taxon detail page.
   */
  getTaxonDetailPage(taxonId) {
    throw new Error("Not implemented");
  }

  /**
   * Fetches the vernacular name for a given taxon ID.
   * @param {string} taxonID - The ID of the taxon.
   * @returns {Promise<string|undefined>} A promise that resolves to the vernacular name if found.
   */
  fetchVernacularName(taxonID) {
    throw new Error("Not implemented");
  }

  /**
   * Return details concerning the data retrieved with this source
   * @returns source detail
   */
  sourceDetailMessage() {
    return "";
  }
  getCompatibleMediaSource() {
    const availableSource = [];
    Object.values(SOURCE_)
      .filter((idMediaSource) =>
        getMediaSource(idMediaSource).isCompatible(this)
      )
      .forEach((idMediaSource) => {
        availableSource.push({
          value: idMediaSource,
          text: getMediaSource(idMediaSource).name,
        });
      });
    return availableSource;
  }
}

export { Connector };
