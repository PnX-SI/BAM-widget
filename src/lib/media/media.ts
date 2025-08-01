import { GBIFMediaSource } from "./Gbif";
import { TaxHubMediaSource } from "./TaxHub";
import { TaxrefODATA } from "./Taxref";
import { WikiDataImageSource } from "./Wikidata";
import { MediaSource } from "./MediaSource";
export enum SOURCE_ {
  GBIF = "gbif",
  TAXREF_ODATA = "taxref_odata",
  WIKIDATA = "wikidata",
  TAXHUB = "taxhub",
  // CUSTOM = "custom",
}

interface MediaSourceParams {
  [key: string]: any; // You can replace 'any' with more specific types if needed
}

export function getMediaSource(
  id: SOURCE_,
  params: MediaSourceParams = {}
): MediaSource {
  switch (id) {
    case SOURCE_.GBIF:
      return new GBIFMediaSource(params);
    case SOURCE_.TAXREF_ODATA:
      return new TaxrefODATA(params);
    case SOURCE_.WIKIDATA:
      return new WikiDataImageSource();
    case SOURCE_.TAXHUB:
      return new TaxHubMediaSource(params);
    // case SOURCE_.CUSTOM:
    //   return new UrlMediaSource(params);
    default:
      throw new Error("Unknown media source ID");
  }
}
