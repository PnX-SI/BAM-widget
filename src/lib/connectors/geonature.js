import { Connector } from "./connector";
import { Taxon } from "../models";
import { NO_IMAGE_URL } from "@/assets/constant";
import parse from "wellknown";

class GeoNatureConnector extends Connector {
  EXPORT_API_ENDPOINT;

  constructor(options) {
    super(options);
    this.name = "GeoNature";
    // this.verifyOptions(["EXPORT_API_ENDPOINT"]);
    this.EXPORT_API_ENDPOINT = options?.EXPORT_API_ENDPOINT;
    this.OBSERVATIONS_ENDPOINT =
      "http://127.0.0.1:8000/synthese/observations/taxa";
  }

  fetchOccurrence(params = {}) {
    return fetch(this.OBSERVATIONS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "testkey",
      },
      body: JSON.stringify({
        format: "json",
        sort: "id_dataset",
        geoIntersection: {
          type: "Feature",
          properties: {},
          geometry: parse(params.geometry),
        },
      }),
    })
      .then((response) => response.json())
      .then((items) => {
        let taxonsData = {};
        items.forEach((observation) => {
          taxonsData[observation.cd_ref] = new Taxon({
            acceptedScientificName: observation.nom_valide,
            vernacularName: observation.nom_vern,
            taxonId: observation.cd_ref,
            mediaUrl: NO_IMAGE_URL,
            taxonRank: observation.id_rang,
            kingdom: observation.regne,
            class: observation.class,
            nbObservations: observation.nb_obs,
            lastSeenDate: new Date(observation.date_min),
          });
        });
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
        try {
          Object.values(json?._embedded?.photos).forEach((media) => {
            mediaList.push({
              url: media._links.thumbnail.href,
              licence: media.licence,
              source: media.copyright,
            });
          });
          return mediaList;
        } catch {
          return [];
        }
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

  getTaxonDetailPage(taxonId) {
    return `https://inpn.mnhn.fr/espece/cd_nom/${taxonId}`;
  }

  fetchVernacularName(taxonId) {
    return Promise.resolve(null);
  }
}
export { GeoNatureConnector };
