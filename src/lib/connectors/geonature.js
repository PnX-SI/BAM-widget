import { Connector } from "./connector";
import { Taxon } from "../models";

const NO_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/1024px-No_Image_Available.jpg";

class GeoNatureConnector extends Connector {
  GEONATURE_ENDPOINT;
  ID_EXPORT;

  constructor(options) {
    super(options);
    this.verifyOptions(["GEONATURE_ENDPOINT", "ID_EXPORT"]);
    this.GEONATURE_ENDPOINT = options?.GEONATURE_ENDPOINT;
    this.ID_EXPORT = options?.ID_EXPORT;
  }

  fetchOccurrence(params = {}) {
    let urlWithParams = new URL(
      `${this.GEONATURE_ENDPOINT}/exports/api/${this.ID_EXPORT}`
    );

    for (const [key, value] of Object.entries(params)) {
      urlWithParams.searchParams.append(key, value);
    }
    const url = urlWithParams.toString();
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        let taxonsData = {};
        json.items.features.forEach((item) => {
          item = item.properties;
          if (!taxonsData.hasOwnProperty(item.cd_ref)) {
            taxonsData[item.cd_ref] = new Taxon({
              acceptedScientificName: item.nom_scientifique,
              vernacularName: item.nom_vernaculaire,
              taxonId: item.cd_ref,
              taxonKey: item.cd_ref,
              mediaUrl: NO_IMAGE_URL,
              taxonRank: "", //this.fetchTaxonInfo(item.cd_ref),
              nbObservations: 0,
              description: "",
              lastSeenDate: new Date(item.date_max).getTime(),
            });
          }
          taxonsData[item.cd_ref].nbObservations += 1;
          taxonsData[item.cd_ref].lastSeenDate = new Date(
            Math.max(
              new Date(item.date_max).getTime(),
              new Date(taxonsData[item.cd_ref].lastSeenDate).getTime()
            )
          );
        });
        console.log(taxonsData);
        return taxonsData;
      });
  }

  fetchMedia(idTaxon) {
    const url = `https://odata-inpn.mnhn.fr/photos/taxa?taxrefId=${idTaxon}&visibility=PUBLIC`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        let mediaList = [];
        Object.values(json?._embedded?.photos).forEach((media) => {
          mediaList.push({
            url: media._links.thumbnail.href,
            licence: media.licence,
            source: media.copyright,
          });
        });
        return mediaList;
      });
  }
  fetchTaxonInfo(idTaxon) {
    const url = `https://odata-inpn.mnhn.fr/taxa/${idTaxon}`; //
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        return {
          scientificName: json.names.scientific,
          vernacularName: json.names.vernacular.fr[0],
          rank: json.rank,
          taxonKey: json.taxrefId,
        };
      });
  }
  fetchTaxonStatus(idTaxon) {
    const url = `https://taxref.mnhn.fr/api/taxa/${idTaxon}/status/columns`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json._embedded?.status;
      });
  }
}
export { GeoNatureConnector };
