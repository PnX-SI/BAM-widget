function fetchApiTaxonGbif(geometry, limit, offset) {
  return fetch(
    `https://api.gbif.org/v1/occurrence/search?geometry=${geometry}&limit=${limit}&offset=${offset}`
  ).then((response) => {
    return response.json();
  });
}

function getGbifTaxon(wkt, limit) {
  const geometry = wkt;
  return (
    fetch(
      `https://api.gbif.org/v1/occurrence/search?geometry=${geometry}&limit=1`
    )
      .then((response) => {
        return response.json();
      })
      // Get total number of occurrences
      .then((data) => {
        return data.count;
      })
      .then(async function (countOccurrence) {
        // Compute the number of pages we need to query
        const nbOfPages = Math.ceil(countOccurrence / limit);

        // Create a promise for each page
        let promises = [];
        for (let pageIndex = 0; pageIndex < nbOfPages; pageIndex++) {
          const offset = pageIndex * limit;
          promises.push(fetchApiTaxonGbif(geometry, limit, offset));
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
        data = data.slice(0, 10).map((x) => {
          return x[0];
        });
        let newTaxonsData = {};
        data.forEach((key) => {
          newTaxonsData[key] = taxonsData[key];
        });
        return newTaxonsData;
      })
  );
}
