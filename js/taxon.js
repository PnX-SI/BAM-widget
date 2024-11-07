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

function getPgRestTaxon(wkt, limit = 10, offset = 0) {
  const geometry = wkt;
  return (
    fetch(
      `https://dev-gtsi.cevennes-parcnational.net/api/rpc/get_taxa_list?in_wkt=${geometry}&in_limit=${limit}`
    )
      .then((response) => {
        return response.json();
      })
      // Get total number of occurrences
      .then((data) => {
        return data.map(({
          count_occ: occCount,
          species_name: species,
          species_key: gbifId,
          ...rest
        }) => ({
          occCount,
          species,
          gbifId,
          ...rest
        }));
      })
  );
}

function getTopTaxon(wkt) {
  // let promiseTopTax = new Promise();
  let promises = [getPgRestTaxon(wkt, 10), getGbifTaxon(wkt, 20)];
  return Promise.all(promises).then((listOfData) => {
    const allData = [...listOfData[0], ...listOfData[1]]
    allData.sort(function (a, b) {
      return b["occCount"] - a["occCount"];
    });
    return Promise.resolve(allData.slice(0, 10))
  });
}

// getTopTaxon(wkt).then(data => {
//   console.log(data)
// })