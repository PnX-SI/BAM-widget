import { getMediaSource } from "../media/media";
import { GbifConnector } from "./gbif";
import { GeoNatureConnector } from "./geonature";

function getConnector(connectorName = "GBIF", params = {}) {
  if (params.hasOwnProperty("mediaSource")) {
    params["mediaSource"] = getMediaSource(params.mediaSource);
  }
  switch (connectorName) {
    case "GBIF":
      return new GbifConnector(params);
    case "GeoNature":
      return new GeoNatureConnector(params);
    default:
      return new GbifConnector(params);
  }
}

export { getConnector };
