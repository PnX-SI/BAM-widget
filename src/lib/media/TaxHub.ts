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

interface TypeMedia {
  desc_type_media: string;
  id_type: number;
  nom_type_media: string;
}

export class TaxHubMediaSource extends MediaSource {
  type: number;

  constructor(parameters) {
    super("TaxHub", SOURCE_.taxhub);
    this.type = -9999;
  }

  fetchTypeMedia(connector) {
    if (this.type > -1) {
      return Promise.resolve(this.type);
    } else if (this.type == -9999) {
      return fetch(`${connector.API_ENDPOINT}/taxhub/api/tmedias/types`)
        .then((response) => response.json())
        .then((types: TypeMedia[]) => {
          const type = types.filter(
            (type: TypeMedia) => type.nom_type_media == "Photo_principale"
          );
          this.type = type.length == 0 ? -1 : type[0].id_type;
        });
    } else {
      return Promise.resolve(null);
    }
  }

  fetchPicture(taxonID, connector) {
    const url = `${connector.API_ENDPOINT}/taxhub/api/taxref/${taxonID}?fields=medias`;
    return this.fetchTypeMedia(connector).then((type) => {
      return fetch(url)
        .then((response) => {
          return response.json();
        })
        .then(function (json) {
          let mediaList = [];
          try {
            const medias = Object.values(json?.medias);
            let filtered_medias = medias;
            if (type) {
              filtered_medias = filtered_medias.filter(
                (media) => media.id_type == type
              );
            }
            if (filtered_medias.length == 0) {
              filtered_medias = medias;
            }

            filtered_medias.forEach((media: any) => {
              if (media.is_public && isUrlImage(media.media_url)) {
                mediaList.push({
                  url: media.media_url,
                  license: media.licence ?? media.auteur,
                  source: media.auteur,
                  typeMedia: "image",
                  author: media.auteur,
                  urlSource: media.url,
                });
              }
            });
            return mediaList;
          } catch {
            return [];
          }
        });
    });
  }
  isCompatible(connector) {
    return connector.name == CONNECTORS.GeoNature ? true : false;
  }
}
