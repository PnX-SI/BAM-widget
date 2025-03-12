import { GbifConnector } from "./gbif";
import { GeoNatureConnector } from "./geonature";

function getConnector(connectorName, params) {
  switch (connectorName) {
    case "gbif":
      return new GbifConnector(params);
    case "geonature":
      return new GeoNatureConnector(params);
    default:
      return new GbifConnector(params);
  }
}

export { getConnector };
