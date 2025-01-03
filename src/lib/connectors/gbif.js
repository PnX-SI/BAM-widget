import { Connector } from "./connector";

class GbifConnector extends Connector {
  fetchOccurrence(params) {
    let url = `https://api.gbif.org/v1/occurrence/search?geometry=${wkt}`;
    url += limit ? `&limit=${limit}` : "";
    url += offset ? `&offset=${offset}` : "";
    for (const [key, value] of Object.entries(paramsGBIF)) {
      url += `&${key}=${value}`;
    }
    return fetch(url).then((response) => {
      return response.json();
    });
  }
  fetchMedia(idTaxon) {
    throw new Error("Not implemented");
  }
  fetchTaxonInfo(idTaxon) {
    throw new Error("Not implemented");
  }
  fetchTaxonStatus(idTaxon) {
    throw new Error("Not implemented");
  }
}
