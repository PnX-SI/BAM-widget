import { Media } from "../models";
import { MediaSource } from "./MediaSource";
import { TAXON_REFERENTIAL } from "../taxonReferential";
import { SOURCE_ } from "./media";

interface Photo {
  _links: {
    thumbnail: {
      href: string;
    };
  };
  licence: string;
  copyright: string;
}

interface TaxrefODATAResponse {
  _embedded?: {
    photos: {
      [key: string]: Photo;
    };
  };
}

export class TaxrefODATA extends MediaSource {
  constructor(parameters) {
    super("Taxref", SOURCE_.TAXREF_ODATA);
  }

  fetchPicture(
    taxonID: string,
    connector: { referential: string }
  ): Promise<Media[]> {
    const url = `https://odata-inpn.mnhn.fr/photos/taxa?taxrefId=${taxonID}&visibility=PUBLIC`;

    return fetch(url)
      .then((response) => {
        return response.json() as Promise<TaxrefODATAResponse>;
      })
      .then((json) => {
        let mediaList: Media[] = [];

        try {
          const photos = json?._embedded?.photos;

          if (photos) {
            Object.values(photos).forEach((media: Photo) => {
              mediaList.push({
                url: media._links.thumbnail.href,
                license: media.licence,
                source: media.copyright,
                typeMedia: "image",
              });
            });
          }

          return mediaList;
        } catch (error) {
          console.error("Error parsing media data:", error);
          return [];
        }
      });
  }

  isCompatible(connector: any): boolean {
    return connector.referential === TAXON_REFERENTIAL.TAXREF;
  }
}
