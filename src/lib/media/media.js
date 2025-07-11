import { GBIFMediaSource } from "./Gbif";
import { TaxHubMediaSource } from "./TaxHub";
import { TaxrefODATA } from "./Taxref";
import { UrlMediaSource } from "./UrlMediaSource";
import { WikiDataImageSource } from "./Wikidata";

export const SOURCE_ = Object.freeze({
  GBIF: "gbif",
  TAXREF_ODATA: "taxref_odata",
  WIKIDATA: "wikidata",
  TAXHUB: "taxhub",
  // CUSTOM: "custom",
});

export function getMediaSource(id, params = {}) {
  switch (id) {
    case SOURCE_.GBIF:
      return new GBIFMediaSource(params);
    case SOURCE_.TAXREF_ODATA:
      return new TaxrefODATA(params);
    case SOURCE_.WIKIDATA:
      return new WikiDataImageSource(params);
    case SOURCE_.TAXHUB:
      return new TaxHubMediaSource(params);
    // case SOURCE_.CUSTOM:
    //   return new UrlMediaSource(params);
  }
}
