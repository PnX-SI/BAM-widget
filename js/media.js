function getMedias(gbifId) {
  url = "https://api.gbif.org/v1/species/" + gbifId + "/media";

  return fetch(url, { method: "GET" })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      // Media checking
      if (json.results.length > 0) {
        return json.results[0].identifier;
      }
    });
}
