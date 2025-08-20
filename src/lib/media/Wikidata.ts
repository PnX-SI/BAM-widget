import { Connector } from "../connectors/connector";
import { Media } from "../models";
import { TAXON_REFERENTIAL } from "../taxonReferential";
import { SOURCE_ } from "./media";
import { MediaSource } from "./MediaSource";

const { GBIF, TAXREF } = TAXON_REFERENTIAL;

interface WikidataResponse {
  results: {
    bindings: Array<{
      item: {
        value: string;
      };
    }>;
  };
}

interface WikidataEntity {
  entities: {
    [key: string]: {
      claims?: {
        P18?: Array<{
          mainsnak: {
            datavalue: {
              value: string;
            };
          };
        }>;
      };
    };
  };
}

function fetchWikidataEntityByTaxrefId(cdNom: string): Promise<string | null> {
  const url = "https://query.wikidata.org/sparql";
  const query = `
    SELECT ?item WHERE {
      ?item wdt:P3186 "${cdNom}" .
    }`;

  return fetch(url + "?format=json&query=" + encodeURIComponent(query))
    .then((response) => response.json() as Promise<WikidataResponse>)
    .then((data) => {
      if (!data.results.bindings.length) {
        return null;
      }
      const entityId = data.results.bindings[0].item.value.split("/").pop();
      return entityId || null;
    });
}

function fetchWikidataEntityByGbifId(gbifId: string): Promise<string | null> {
  const url = "https://query.wikidata.org/sparql";
  const query = `
    SELECT ?item WHERE {
      ?item wdt:P846 "${gbifId}" .
    }`;

  return fetch(url + "?format=json&query=" + encodeURIComponent(query))
    .then((response) => response.json() as Promise<WikidataResponse>)
    .then((data) => {
      if (!data.results.bindings.length) {
        return null;
      }
      const entityId = data.results.bindings[0].item.value.split("/").pop();
      return entityId || null;
    });
}

function fetchImageFromWikidata(entityId: string): Promise<Media[] | string> {
  if (!entityId) return Promise.resolve("No image found for this entity.");

  const url = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;

  return fetch(url)
    .then((response) => response.json() as Promise<WikidataEntity>)
    .then((data) => {
      const entity = data.entities[entityId];
      const claims = entity.claims || {};
      const imageClaims = claims.P18 || [];

      if (!imageClaims.length) {
        return "No image found for this entity.";
      }

      const imageFilename = imageClaims[0].mainsnak.datavalue.value; // e.g. "Panthera_leo_male.jpg"

      // Query Wikimedia Commons for image metadata (credit, license, author, etc.)
      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
        imageFilename
      )}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

      return fetch(commonsUrl)
        .then((res) => res.json())
        .then((commonsData) => {
          const pages = commonsData.query.pages;
          const page = Object.values(pages)[0] as any;
          if (!page?.imageinfo?.length) {
            return "No image metadata found on Commons.";
          }

          const info = page.imageinfo[0];
          const meta = info.extmetadata || {};
          const credit = {
            artist: meta.Artist?.value || null,
            license: meta.LicenseShortName?.value || null,
            creditLine: meta.Credit?.value || null,
            licenseUrl: meta.LicenseUrl?.value || null,
          };

          return [
            {
              url: info.url, // full image URL
              source: `${credit.artist.replace(/<[^>]*>?/gm, "")} - ${
                credit.license
              }`,
              typeMedia: "image",
              licenseUrl: credit.licenseUrl,
              license: credit.license,
              author: credit.artist.replace(/<[^>]*>?/gm, ""),
              urlSource: `https://commons.wikimedia.org/w/thumb.php?width=500&f=${imageFilename}`,
            },
          ] as Media[];
        });
    });
}

function fetchWikidataImage(
  idTaxon: string,
  connector: Connector,
  wikidataEntryID: string | null = null
): Promise<Media[] | undefined> {
  if (!idTaxon) throw new Error("No taxonId given!");

  if (wikidataEntryID) {
    return fetchImageFromWikidata(wikidataEntryID) as Promise<
      Media[] | undefined
    >;
  } else {
    let fetchIDPromise: Promise<string | null> | null = null;

    switch (connector.referential) {
      case TAXON_REFERENTIAL.GBIF:
        fetchIDPromise = fetchWikidataEntityByGbifId(idTaxon);
        break;
      case TAXON_REFERENTIAL.TAXREF:
        fetchIDPromise = fetchWikidataEntityByTaxrefId(idTaxon);
        break;
      default:
        break;
    }

    if (!fetchIDPromise) return Promise.resolve(undefined);

    return fetchIDPromise.then((idWikidata) => {
      if (idWikidata) return fetchImageFromWikidata(idWikidata);
      return "No image found for this entity.";
    });
  }
}

class WikiDataImageSource extends MediaSource {
  constructor() {
    super("WikidataMediaSource", SOURCE_.wikidata);
  }

  fetchPicture(
    taxonID: string,
    connector: Connector
  ): Promise<Media[] | undefined> {
    if (!this.isCompatible(connector)) {
      throw new Error(
        `Wikidata Image source is only compatible with the GBIF and a TAXREF referential based connector`
      );
    }
    return fetchWikidataImage(taxonID, connector);
  }

  isCompatible(connector: any): boolean {
    return [GBIF, TAXREF].includes(connector.referential);
  }
}

export { WikiDataImageSource };
