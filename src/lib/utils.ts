import { stringify } from "wellknown";
import { buffer } from "@turf/turf";
import L from "leaflet";

/**
 * Return a random element from a given array
 * @param choices - The array of choices
 * @returns The randomly selected item
 */
function randomChoice(choices) {
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

/**
 * Return the base URL of the current window location
 * @returns The base URL as a string
 */
function getBaseUrl(): string {
  // Utilisation de window.location pour obtenir l'URL de base
  return `${window.location.protocol}//${window.location.host}`;
}

/**
 * Return the WKT (Well-Known Text) version of a given GeoJSON
 * @param geojson - The GeoJSON object
 * @param layerRadius - The radius for circle layers
 * @param typeLayer - The type of the layer
 * @param radius - The buffer radius
 * @returns The WKT string
 */
function toWKT(
  geojson: any,
  layerRadius: number,
  typeLayer: string,
  radius: number
): string {
  let WKT = stringify(geojson);
  // If point or line, we buffer the geometry since API does not support them
  if (typeLayer == "marker" || typeLayer == "polyline") {
    const buffered = buffer(geojson, radius);
    WKT = stringify(buffered);
  }
  if (typeLayer == "circle") {
    const buffered = buffer(geojson, layerRadius / 1000); // divided by 1000 to get in km
    WKT = stringify(buffered);
  }
  return WKT;
}

/**
 * Restore a Leaflet map state stored in the localStorage
 * @param map - The Leaflet map instance
 */
function restoreMapState(map: L.Map): void {
  const savedState: string = localStorage.getItem("mapState");
  if (savedState) {
    const state = JSON.parse(savedState);
    map.setView([state.center.lat, state.center.lng], state.zoom);
  } else {
    // Default view
    map.setView([48.8566, 2.3522], 13);
  }
}

function validURL(str): boolean {
  /**
   * Source https://stackoverflow.com/a/5717133/5807438
   */
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

export { toWKT, restoreMapState, randomChoice, getBaseUrl, validURL };
