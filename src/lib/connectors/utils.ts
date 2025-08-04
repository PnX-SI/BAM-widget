import { getMediaSource } from "../media/media";
import { CONNECTORS } from "./connectors";
import { GbifConnector } from "./gbif";
import { GeoNatureConnector } from "./geonature";
import { Connector } from "./connector";

type ConnectorParams = Record<string, any>;

function getConnector(
  connectorName: keyof typeof CONNECTORS = "GBIF",
  params: ConnectorParams = {}
): Connector {
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
