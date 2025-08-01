import { Media } from "../models";
import { MediaSource } from "./MediaSource";
import { SOURCE_ } from "./media";
import { CONNECTORS } from "../connectors/connectors";
function isUrlImage(url) {
  const imageFormats = ["jpg", "png", "gif", "bmp", "png", "jpeg"];
  for (let format_ of imageFormats) {
    if (url.endsWith(format_)) {
      return true;
    }
  }
  return false;
}
export class TaxHubMediaSource extends MediaSource {
  constructor(parameters) {
    super("TaxHub", SOURCE_.TAXHUB);
  }

  fetchPicture(taxonID, connector) {
    const url = `${connector.API_ENDPOINT}/taxhub/api/taxref/${taxonID}?fields=medias`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        let mediaList = [];
        try {
          Object.values(json?.medias).forEach((media: any) => {
            if (media.is_public && isUrlImage(media.media_url)) {
              mediaList.push({
                url: media.media_url,
                license: media.licence,
                source: media.auteur,
                typeMedia: "image",
              });
            }
          });
          return mediaList;
        } catch {
          return [];
        }
      });
  }
  isCompatible(connector) {
    return connector.name == CONNECTORS.GeoNature ? true : false;
  }
}
