const DEFAULT_NB_MAX_TAXONS = 10;

/**
 * Fetch a page of taxon data from GBIF given a WKT string
 * @param {string} wkt - Well-Known Text representation of a polygon
 * @param {number} limit - number of results to return
 * @param {number} offset - offset of the first result
 * @returns {Promise<import('gbif-types').GBIFSearchResponse>}
 */
function fetchApiTaxonGbif(wkt, limit, offset) {
  return fetch(
    `https://api.gbif.org/v1/occurrence/search?geometry=${wkt}&limit=${limit}&offset=${offset}`
  ).then((response) => {
    return response.json();
  });
}

/**
 * Fetch the list of taxons from GBIF given a WKT string
 * @param {string} wkt - Well-Known Text representation of a polygon
 * @param {number} [nbMaxTaxons=DEFAULT_NB_MAX_TAXONS] - maximum number of results to return
 * @param {Object} [params={ limit: 300 }] - parameters to pass to the API
 * @returns {Promise<Array<{gbifId: number, occCount: number, species: string}>>} - a list of taxons with their occurrence count and GBIF id
 */
function getGbifTaxon(
  wkt,
  nbMaxTaxons = DEFAULT_NB_MAX_TAXONS,
  params = { limit: 300 }
) {
  return (
    fetch(`https://api.gbif.org/v1/occurrence/search?geometry=${wkt}&limit=1`)
      .then((response) => {
        return response.json();
      })
      // Get total number of occurrences
      .then((data) => {
        return data.count;
      })
      .then(async function (countOccurrence) {
        // Compute the number of pages we need to query
        const nbOfPages = Math.ceil(countOccurrence / params.limit);

        // Create a promise for each page
        let promises = [];
        for (let pageIndex = 0; pageIndex < nbOfPages; pageIndex++) {
          const offset = pageIndex * params.limit;
          promises.push(fetchApiTaxonGbif(wkt, params.limit, offset));
        }
        let speciesList = {};
        // Run all promises and await for the responses
        await Promise.all(promises).then((listOfData) => {
          listOfData
            .map((apiResult) => {
              return apiResult.results;
            })
            // For each page
            .forEach((resultsPage) => {
              // For each occurrence retrieve the gbifID and increase occurrence count
              resultsPage.forEach((taxonData) => {
                occCount =
                  (speciesList[taxonData.species] || {})["occCount"] || 0;
                speciesList[taxonData.species] = {
                  gbifId: taxonData.taxonKey,
                  occCount: occCount + 1,
                };
              });
            });
        });
        return speciesList;
      })
      .then((taxonsData) => {
        let data = [];
        Object.keys(taxonsData).forEach((value) => {
          data.push([value, taxonsData[value]["occCount"]]);
        });
        data.sort(function (a, b) {
          return b[1] - a[1];
        });
        data = data.slice(0, nbMaxTaxons).map((x) => {
          return x[0];
        });
        let newTaxonsData = [];
        data.forEach((key) => {
          newTaxonsData.push({ ...taxonsData[key], species: key });
        });
        return newTaxonsData;
      })
  );
}

/**
 * Fetch a list of taxon data from the GTSI API given a WKT string
 * @param {string} wkt - Well-Known Text representation of a polygon
 * @param {number} [nbMaxTaxons=DEFAULT_NB_MAX_TAXONS] - number of results to return
 * @returns {Promise<import('gbif-types').GBIFTaxon[]>}
 */
function getPgRestTaxon(wkt, nbMaxTaxons = DEFAULT_NB_MAX_TAXONS) {
  const geometry = wkt;
  return (
    fetch(
      `https://dev-gtsi.cevennes-parcnational.net/api/rpc/get_taxa_list?in_wkt=${geometry}&in_limit=${nbMaxTaxons}`
    )
      .then((response) => {
        return response.json();
      })
      // Get total number of occurrences
      .then((data) => {
        return data.map(
          ({
            count_occ: occCount,
            species_name: species,
            species_key: gbifId,
            ...rest
          }) => ({
            occCount,
            species,
            gbifId,
            ...rest,
          })
        );
      })
  );
}

/**
 * Get the top N taxons from both the GTSI API and the GBIF API given a WKT string
 * @param {string} wkt - Well-Known Text representation of a polygon
 * @param {number} [nbMaxTaxons=DEFAULT_NB_MAX_TAXONS] - number of results to return
 * @returns {Promise<import('gbif-types').GBIFTaxon[]>} - a list of taxons with their occurrence count and GBIF id
 */
function getAllTopNTaxon(wkt, nbMaxTaxons = DEFAULT_NB_MAX_TAXONS) {
  let promises = [
    getPgRestTaxon(wkt, nbMaxTaxons),
    getGbifTaxon(wkt, nbMaxTaxons),
  ];
  return Promise.all(promises).then((listOfData) => {
    const allData = [...listOfData[0], ...listOfData[1]];
    allData.sort(function (a, b) {
      return b["occCount"] - a["occCount"];
    });
    return Promise.resolve(allData.slice(0, nbMaxTaxons));
  });
}
