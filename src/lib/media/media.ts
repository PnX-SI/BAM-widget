import { GBIFMediaSource } from "./Gbif";
import { TaxHubMediaSource } from "./TaxHub";
import { TaxrefODATA } from "./Taxref";
import { WikiDataImageSource } from "./Wikidata";
import { MediaSource } from "./MediaSource";
export enum SOURCE_ {
  gbif = "gbif",
  taxref_odata = "taxref_odata",
  wikidata = "wikidata",
  taxhub = "taxhub",
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
    case SOURCE_.gbif:
      return new GBIFMediaSource(params);
    case SOURCE_.taxref_odata:
      return new TaxrefODATA(params);
    case SOURCE_.wikidata:
      return new WikiDataImageSource();
    case SOURCE_.taxhub:
      return new TaxHubMediaSource(params);
    // case SOURCE_.CUSTOM:
    //   return new UrlMediaSource(params);
    default:
      throw new Error("Unknown media source ID");
  }
}
