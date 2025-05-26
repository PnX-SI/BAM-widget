import { Connector } from "./connector";
import { Media, Taxon } from "../models";
import ParameterStore from "../parameterStore";

const NO_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/1024px-No_Image_Available.jpg";

const GBIF_ENDPOINT_DEFAULT = "https://api.gbif.org/v1";

/**
 * Calls the GBIF occurrence API with the given parameters.
 * @param {Object} params - The parameters to pass to the API.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the API.
 */
function callOccurrenceApi(params = {}) {
  const urlWithParams = new URL(`${GBIF_ENDPOINT_DEFAULT}/occurrence/search`);
  Object.entries(params).forEach(([key, value]) => {
    urlWithParams.searchParams.append(key, value);
  });
  return fetch(urlWithParams.toString()).then((response) => response.json());
}

/**
 * A connector class for interacting with the GBIF API.
 */
class GbifConnector extends Connector {
  /**
   * Creates an instance of GbifConnector.
   * @param {Object} options - The options for the connector.
   */
  constructor(options) {
    super(options);
    this.name = "GBIF";
    this.GBIF_ENDPOINT = this.options.GBIF_ENDPOINT || GBIF_ENDPOINT_DEFAULT;
  }

  /**
   * Counts the occurrences based on the given parameters.
   * @param {Object} params - The parameters for the occurrence query.
   * @returns {Promise<number>} A promise that resolves to the count of occurrences.
   */
  countOccurrence(params = {}) {
    return callOccurrenceApi(params).then((data) => data.count);
  }

  /**
   * Fetches the vernacular name for a given taxon ID.
   * @param {string} taxonID - The ID of the taxon.
   * @returns {Promise<string|undefined>} A promise that resolves to the vernacular name if found.
   */
  fetchVernacularName(taxonID) {
    const mapping_language = { en: "eng", fr: "fra" };
    const currentLanguage = ParameterStore.getInstance().lang.value;
    return fetch(
      `${this.GBIF_ENDPOINT}/species/${taxonID}/vernacularNames?limit=100`
    )
      .then((response) => response.json())
      .then((data) => {
        const nameData = data.results.find(
          (nameData) => nameData.language === mapping_language[currentLanguage]
        );
        return nameData ? nameData.vernacularName.capitalize() : undefined;
      });
  }
  /**
   * Fetches occurrences based on the given parameters.
   * @param {Object} params - The parameters for the occurrence query.
   * @returns {Promise<Object>} A promise that resolves to the taxons data.
   */
  fetchOccurrence(params) {
    const defaultParams = { limit: 300, maxPage: 10, ...params };
    if (defaultParams.dateMin && defaultParams.dateMax) {
      defaultParams.eventDate = `${defaultParams.dateMin},${defaultParams.dateMax}`;
    }

    return this.countOccurrence(defaultParams).then((countOccurrence) => {
      const nbOfPages = Math.min(
        Math.ceil(countOccurrence / defaultParams.limit),
        defaultParams.maxPage
      );

      const taxonsData = {};

      // Function to fetch page data
      // Use recursion to chain data fetching
      const fetchPage = (pageIndex) => {
        // Stop recursion when all pages are fetched
        if (pageIndex >= nbOfPages) {
          return Promise.resolve();
        }

        const offset = pageIndex * defaultParams.limit;
        return callOccurrenceApi({ ...defaultParams, offset }).then(
          (apiResult) => {
            apiResult.results.forEach((observation) => {
              if (!taxonsData[observation.taxonKey]) {
                taxonsData[observation.taxonKey] = new Taxon({
                  acceptedScientificName: observation.acceptedScientificName,
                  vernacularName: observation.vernacularName,
                  taxonId: observation.taxonKey,
                  mediaUrl: NO_IMAGE_URL,
                  taxonRank: observation.taxonRank,
                  kingdom: observation.kingdom,
                  class: observation.class,
                  nbObservations: 0,
                  description: "",
                  lastSeenDate: new Date(observation.eventDate).getTime(),
                });
              }
              taxonsData[observation.taxonKey].nbObservations += 1;
              taxonsData[observation.taxonKey].lastSeenDate = new Date(
                Math.max(
                  new Date(observation.eventDate).getTime(),
                  new Date(
                    taxonsData[observation.taxonKey].lastSeenDate
                  ).getTime()
                )
              );
            });

            // Fetch the next page
            return fetchPage(pageIndex + 1);
          }
        );
      };

      // Start fetching from the first page
      return fetchPage(0).then(() => taxonsData);
    });
  }

  /**
   * Fetches media for a given taxon ID.
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Array>} A promise that resolves to the list of media.
   */
  fetchMedia(idTaxon) {
    const url = `${this.GBIF_ENDPOINT}/species/${idTaxon}/media`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) => {
        let mediaList = this.processMedia(json.results);
        if (mediaList.length === 0) {
          return this.fetchMediaOccurence(idTaxon);
        }
        return mediaList;
      });
  }
  /**
   * Fetches media from occurrences of a taxon ID
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Array>} A promise that resolves to the list of media.
   */
  fetchMediaOccurence(idTaxon) {
    const url = `${this.GBIF_ENDPOINT}/occurrence/search?limit=10&mediaType=StillImage&speciesKey=${idTaxon}`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const medias = json.results.flatMap((element) => element.media);
        return this.processMedia(medias);
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
            licence: media.licence,
            source: `${media.rightsHolder} (${media.license})`,
          })
      );
  }

  /**
   * Fetches taxon information for a given taxon ID.
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Object>} A promise that resolves to the taxon information.
   */
  fetchTaxonInfo(idTaxon) {
    const url = `${this.GBIF_ENDPOINT}/species/${idTaxon}?language=${this.language}`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) => ({
        scientificName: json.scientificName,
        vernacularName: json.vernacularName,
        rank: json.rank,
        taxonKey: json.key,
      }));
  }

  /**
   * Fetches the taxon status for a given taxon ID.
   * @param {string} idTaxon - The ID of the taxon.
   * @returns {Promise<Object>} A promise that resolves to the taxon status.
   */
  fetchTaxonStatus(idTaxon) {
    const url = `${this.GBIF_ENDPOINT}/species/${idTaxon}/iucnRedListCategory`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) => ({
        iucnRedListCategory: json.category,
        code: json.code,
      }));
  }

  /**
   * Searches for taxa based on a search string.
   * @param {string} searchString - The search string.
   * @param {Object} params - Additional parameters for the search.
   * @returns {Promise<Array>} A promise that resolves to the list of search results.
   */
  searchTaxon(searchString = "", params = {}) {
    const url = `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&limit=20`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) =>
        json.results.map((element) => ({
          scientificName: element.scientificName,
          taxonKey: element.key,
        }))
      );
  }

  /**
   * Gets the detail page URL for a given taxon ID.
   * @param {string} taxonId - The ID of the taxon.
   * @returns {string} The URL of the taxon detail page.
   */
  getTaxonDetailPage(taxonId) {
    return `https://www.gbif.org/species/${taxonId}`;
  }

  sourceDetailMessage() {
    return "The number of observations and the last seen dates are aggragated based on the latest 30000 observations made in the selected area.";
  }
}

export { GbifConnector };
