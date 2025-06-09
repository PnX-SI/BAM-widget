import { Media } from "../models";
import { MediaSource } from "./MediaSource";
import { TAXON_REFERENTIAL } from "../taxonReferential";

export class TaxrefODATA extends MediaSource {
  constructor(parameters) {
    super("Taxref");
  }
  fetchMedia(taxonID, connector) {
    const url = `https://odata-inpn.mnhn.fr/photos/taxa?taxrefId=${taxonID}&visibility=PUBLIC`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        let mediaList = [];
        try {
          Object.values(json?._embedded?.photos).forEach((media) => {
            mediaList.push(
              new Media({
                url: media._links.thumbnail.href,
                licence: media.licence,
                source: media.copyright,
              })
            );
          });
          return mediaList;
        } catch {
          return [];
        }
      });
  }
  isCompatible(connector) {
    return connector.referential == TAXON_REFERENTIAL.TAXREF ? true : false;
  }
}
