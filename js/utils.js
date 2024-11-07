class SPARQLQueryDispatcher {
  /**
   * Class that enable to query a SPARQL endpoint
   */
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  query(sparqlQuery) {
    const fullUrl = this.endpoint + "?query=" + encodeURIComponent(sparqlQuery);
    const headers = { Accept: "application/sparql-results+json" };

    return fetch(fullUrl, { headers }).then((body) => body.json());
  }
}

/**
 * Fetch the TaxRef ID for a given GBIF ID using the Wikidata SPARQL endpoint.
 * @param {string} gbifID - The GBIF ID of the taxon.
 * @returns {Promise<string|null>} - A promise that resolves to the TaxRef ID,
 *   or null if no TaxRef ID is found.
 */
async function getTaxRefCdNom(gbifID) {
  const query = `PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/> 
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX v: <http://www.wikidata.org/prop/statement/>

SELECT ?item ?itemLabel ?taxrefID 
WHERE {
    ?item wdt:P846 "${gbifID}".
    ?item wdt:P3186 ?taxrefID
    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "fr" .
    }
}
    `;
  // query = encodeURIComponent(query)
  let sparql_endpoint = "https://query.wikidata.org/sparql";

  let idTaxRef = null;
  const dispatcher = new SPARQLQueryDispatcher(sparql_endpoint);
  await dispatcher.query(query).then((data) => {
    idTaxRef = data?.results?.bindings[0]?.taxrefID.value;
  });
  return idTaxRef;
}

/**
 * Get the parameters from the URL's query string.
 * @returns {Object} an object with the following properties:
 *   - {string} wkt - Well-Known Text representation of a polygon
 *   - {string} geolocation - the geolocation string
 *   - {number} x - the x coordinate of the center of the circle
 *   - {number} y - the y coordinate of the center of the circle
 *   - {number} radius - the radius of the circle
 *   - {boolean} use_gbif - whether to use GBIF or not
 *   - {boolean} use_gn2 - whether to use GN2 or not
 *   - {string} gn_2_url - the URL of the GN2 API
 *   - {number} nb_results - the number of results to return
 */
function getQueryParams() {
  const params = new URL(location).searchParams;

  return {
    wkt: params.get("wkt"),
    geolocation: params.get("geolocation"),
    x: parseFloat(params.get("x")),
    y: parseFloat(params.get("y")),
    radius: parseInt(params.get("radius")),
    use_gbif: JSON.parse(params.get("use_gbif")),
    use_gn2: JSON.parse(params.get("use_gn2")),
    gn_2_url: params.get("gn_2_url"),
    nb_results: parseInt(params.get("nb_results")),
  };
}

/**
 * Converts a GeoJSON feature to a Well-Known Text (WKT) string.
 * @param {Object} feature - A GeoJSON feature object with geometry containing coordinates.
 * @returns {string} - A WKT string representing the polygon.
 */
function convertGeoJsonToWkt(feature) {
  const coo = feature.geometry.coordinates
    .map(function (ring) {
      return (
        "(" +
        ring
          .map(function (p) {
            return p[0] + " " + p[1];
          })
          .join(", ") +
        ")"
      );
    })
    .join(", ");
  const wkt_str = "POLYGON(" + coo + ")";
  return wkt_str;
}

/**
 * Given a params object, returns a WKT string representing a localisation.
 * If params.wkt is defined, it is returned as is.
 * If params.x and params.y are defined, a buffer of radius params.radius
 * is created around the point and converted to WKT.
 * If neither wkt nor x/y are defined, this function returns undefined.
 * @param {Object} params - An object containing localisation parameters.
 * @returns {string|undefined} - A WKT string or undefined.
 */
function processLocalisation(params) {
  if (params.wkt) {
    return params.wkt;
  }
  if (params.x && params.x) {
    const point = turf.point([params.x, params.x]);
    const buffered = turf.buffer(point, params.radius | 100, {
      units: "meters",
    });
    //convert the json-input to WKT
    return convertGeoJsonToWkt(buffered);
  }
}

/**
 * Completes the data with the status and the picture of each taxon in the provided list.
 * @param {Array<Object>} taxonsData - An array of taxon data objects.
 * @returns {Promise<Array>} - A promise that resolves to an array of completed taxon data.
 */
function completeTaxonsData(taxonsData) {
  promises = [];
  taxonsData.forEach((taxon) => {
    promises.push(completeData(taxon));
  });
  console.log(promises);
  return Promise.all(promises);
}

/**
 * Completes a taxon data object by adding its TaxRef ID, status data, and
 * picture URL.
 * @param {Object} taxonData - A taxon data object with a `gbifId` property.
 * @returns {Promise<Object>} - A promise that resolves to the completed taxon
 *   data object.
 */
function completeData(taxonData) {
  let getCdRefPromise = null;
  if ("cdRef" in taxonData) {
    getCdRefPromise = Promise.resolve(taxonData["cdRef"]);
  } else {
    getCdRefPromise = getTaxRefCdNom(taxonData.gbifId);
  }
  return getCdRefPromise
    .then(async (taxrefId) => {
      // get cdRef
      if (taxrefId) {
        taxonData["cdRef"] = taxrefId;
        await getStatusForATaxon(taxonData).then((statusData) => {
          // use cdRef to get status of the taxon
          taxonData["status"] = statusData;
        });
      }
    })
    .then(async function () {
      await getMedias(taxonData.gbifId).then((mediaUrl) => {
        taxonData["mediaUrl"] = mediaUrl;
      });
    })
    .then(() => {
      return taxonData;
    });
}
