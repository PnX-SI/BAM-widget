import { getMediaSource } from "../media/media";
import { CONNECTORS } from "./connectors";
import { GbifConnector } from "./gbif";
import { GeoNatureConnector } from "./geonature";

function getConnector(connectorName = "GBIF", params = {}) {
  if (params.hasOwnProperty("mediaSource")) {
    params["mediaSource"] = getMediaSource(params.mediaSource);
  }
  switch (connectorName) {
    case CONNECTORS.GBIF:
      return new GbifConnector(params);
    case CONNECTORS.GeoNature:
      return new GeoNatureConnector(params);
    default:
      return new GbifConnector(params);
  }
}

export { getConnector };
