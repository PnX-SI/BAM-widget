<script setup>
// Leaflet
import L from "leaflet";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { restoreMapState, toWKT } from "@/lib/utils";
import { parse } from "wellknown";
import { LocateControl } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";

// Vue
import { computed, onMounted, ref, shallowRef, watch } from "vue";

// Draw config
import drawConfig from "./MapConfig";
import { booleanClockwise, rewind } from "@turf/turf";

import ParameterStore from "@/lib/parameterStore";
const { radius, wkt } = ParameterStore.getInstance();

const props = defineProps({
  height: {
    type: String,
    default: "100vh",
  },
  editable: {
    type: Boolean,
    default: true,
  },
});

// Component Attributes
const map = shallowRef(); // to store the Leaflet map
const geometry = shallowRef(new L.FeatureGroup()); // to store the displayed geometry
const editable = ref(props.editable);

const wktFromOutside = computed(() => {
  return wkt.value ? true : false;
});

const style = computed(() => {
  return "height: " + props.height + ";";
});

watch(wkt, () => {
  if (wkt.value) {
    let tmp = L.geoJSON().addTo(geometry.value);
    tmp.addData(parse(wkt.value));
  }
});

// Component Lifecycle
onMounted(() => {
  // Initialize map
  map.value = L.map("map");
  restoreMapState(map.value);

  // Add tile layer
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value);

  // if existing value in geometry
  map.value.addLayer(geometry.value);

  // If wkt given in input
  if (wktFromOutside.value) {
    map.value.fitBounds(geometry.value.getBounds());
  }

  // Add draw control
  if (editable.value) {
    map.value.addControl(new L.Control.Draw(drawConfig(geometry.value)));
    new LocateControl().addTo(map.value);
  }

  // Add event listener on geometry creation
  map.value.on(L.Draw.Event.CREATED, (event) => {
    let layer = event.layer;
    // Display the new geometry
    geometry.value.clearLayers();
    geometry.value.addLayer(layer);

    let geojson = layer.toGeoJSON();
    if (!booleanClockwise(geojson)) {
      geojson = rewind(geojson);
    }
    // Convert to WKT
    const WKT = toWKT(
      geojson,
      event.layerType == "circle" ? layer.getRadius() : null,
      event.layerType,
      radius.value
    );
    // If point or line, we buffer the geometry
    if (event.layerType == "marker" || event.layerType == "polyline") {
      let tmp = L.geoJSON().addTo(geometry.value);
      tmp.addData(parse(WKT));
    }

    wkt.value = WKT;
  });

  window.addEventListener("beforeunload", function (e) {
    const state = {
      center: map.value.getCenter(),
      zoom: map.value.getZoom(),
    };
    localStorage.setItem("mapState", JSON.stringify(state));
  });
});
</script>

<template>
  <div id="map" :style="style"></div>
</template>

<style scoped>
#map {
  border-radius: 10px;
}
@media screen and (max-width: 770px) {
  #map {
    height: 50vh !important;
    margin-bottom: 1em;
    margin-top: 1em;
  }
}
</style>
