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

L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
  readableArea: function (area, isMetric, precision) {
    // Also defaultPrecision copied from the module closure
    var defaultPrecision = {
      km: 2,
      ha: 2,
      m: 0,
      mi: 2,
      ac: 2,
      yd: 0,
      ft: 0,
      nm: 2,
    };

    var areaStr,
      units,
      type,
      // ^ Note type variable is added here
      precision = L.Util.extend({}, defaultPrecision, precision);

    if (isMetric) {
      units = ["ha", "m"];
      type = typeof isMetric;
      if (type === "string") {
        units = [isMetric];
      } else if (type !== "boolean") {
        units = isMetric;
      }

      if (area >= 1000000 && units.indexOf("km") !== -1) {
        areaStr =
          L.GeometryUtil.formattedNumber(area * 0.000001, precision["km"]) +
          " km²";
      } else if (area >= 10000 && units.indexOf("ha") !== -1) {
        areaStr =
          L.GeometryUtil.formattedNumber(area * 0.0001, precision["ha"]) +
          " ha";
      } else {
        areaStr = L.GeometryUtil.formattedNumber(area, precision["m"]) + " m²";
      }
    } else {
      area /= 0.836127; // Square yards in 1 meter

      if (area >= 3097600) {
        //3097600 square yards in 1 square mile
        areaStr =
          L.GeometryUtil.formattedNumber(area / 3097600, precision["mi"]) +
          " mi²";
      } else if (area >= 4840) {
        //4840 square yards in 1 acre
        areaStr =
          L.GeometryUtil.formattedNumber(area / 4840, precision["ac"]) +
          " acres";
      } else {
        areaStr =
          L.GeometryUtil.formattedNumber(area, precision["yd"]) + " yd²";
      }
    }

    return areaStr;
  },
});

export { toWKT, restoreMapState, randomChoice };
