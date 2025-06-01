import { stringify } from "wellknown";
import { buffer } from "@turf/turf";
import L from "leaflet";

/**
 * Return a random element from a given array
 * @param {Array} choices
 * @returns {any} item selected
 */
function randomChoice(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function getBaseUrl() {
  // Utilisation de window.location pour obtenir l'URL de base
  return `${window.location.protocol}//${window.location.host}`;
}
/**
 * Return the WKT(Well-Know Text) version of a given geojson
 * @param {Object} geojson
 * @param {number} layerRadius
 * @param {String} typeLayer
 * @param {Number} radius
 * @returns {String} WKT
 */
function toWKT(geojson, layerRadius, typeLayer, radius) {
  let WKT = stringify(geojson);
  // If point or line, we buffer the geometry since API does not support them
  if (typeLayer == "marker" || typeLayer == "polyline") {
    var buffered = buffer(geojson, radius);
    WKT = stringify(buffered);
  }
  if (typeLayer == "circle") {
    var buffered = buffer(geojson, layerRadius / 1000); // divided by 1000 to get in km
    WKT = stringify(buffered);
  }
  return WKT;
}

/**
 * Restore a Leaflet map state stored in he localStorage
 * @param {*} map
 */
function restoreMapState(map) {
  const savedState = localStorage.getItem("mapState");
  if (savedState) {
    const state = JSON.parse(savedState);
    map.setView([state.center.lat, state.center.lng], state.zoom);
  } else {
    // Default view
    map.setView([48.8566, 2.3522], 13);
  }
}

export { toWKT, restoreMapState, randomChoice, getBaseUrl };
