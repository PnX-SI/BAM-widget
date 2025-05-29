<script setup>
// Imports
import L from "leaflet";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { restoreMapState, toWKT } from "@/lib/utils";
import { parse } from "wellknown";
import { LocateControl } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import { computed, onMounted, ref, shallowRef, watch } from "vue";
import drawConfig from "./MapConfig";
import { booleanClockwise, rewind } from "@turf/turf";
import ParameterStore from "@/lib/parameterStore";

// Constants
const DEFAULT_HEIGHT = "100vh";
const OPEN_STREET_MAP_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OPEN_STREET_MAP_ATTRIBUTION =
  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Component Props
const props = defineProps({
  height: {
    type: String,
    default: DEFAULT_HEIGHT,
  },
  editable: {
    type: Boolean,
    default: true,
  },
});

// Store
const { radius, wkt } = ParameterStore.getInstance();

// Component Attributes
const map = shallowRef();
const geometry = shallowRef(new L.FeatureGroup());
const editable = ref(props.editable);
let drawEventData = null;

// Computed Properties
const wktFromOutside = computed(() => !!wkt.value);
const style = computed(() => `height: ${props.height};`);

// Watchers
watch(wkt, updateGeometryFromWKT);
watch([radius, geometry], updateGeometry);

// Functions
function updateGeometryFromWKT() {
  if (wkt.value) {
    let tmp = L.geoJSON().addTo(geometry.value);
    tmp.addData(parse(wkt.value));
  }
}

function updateGeometry() {
  if (!drawEventData) return;

  geometry.value.clearLayers();
  let layer = drawEventData.layer;
  let geojson = layer.toGeoJSON();

  if (!booleanClockwise(geojson)) {
    geojson = rewind(geojson);
  }

  const WKT = toWKT(
    geojson,
    drawEventData.layerType === "circle" ? layer.getRadius() : null,
    drawEventData.layerType,
    radius.value
  );

  if (
    drawEventData.layerType === "marker" ||
    drawEventData.layerType === "polyline"
  ) {
    let tmp = L.geoJSON().addTo(geometry.value);
    tmp.addData(parse(WKT));
  }

  wkt.value = WKT;
}

function setupMap() {
  map.value = L.map("map");
  restoreMapState(map.value);

  L.tileLayer(OPEN_STREET_MAP_URL, {
    maxZoom: 19,
    attribution: OPEN_STREET_MAP_ATTRIBUTION,
  }).addTo(map.value);

  map.value.addLayer(geometry.value);

  if (wktFromOutside.value) {
    map.value.fitBounds(geometry.value.getBounds());
  }

  if (editable.value) {
    map.value.addControl(new L.Control.Draw(drawConfig(geometry.value)));
    new LocateControl().addTo(map.value);
  }

  map.value.on(L.Draw.Event.CREATED, handleGeometryCreation);
}

function handleGeometryCreation(event) {
  let layer = event.layer;
  drawEventData = event;
  geometry.value.clearLayers();
  geometry.value.addLayer(layer);
  updateGeometry();
}

function saveMapState() {
  const state = {
    center: map.value.getCenter(),
    zoom: map.value.getZoom(),
  };
  localStorage.setItem("mapState", JSON.stringify(state));
}

// Lifecycle Hooks
onMounted(() => {
  setupMap();
  window.addEventListener("beforeunload", saveMapState);
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
    min-height: 50vh !important;
    margin-bottom: 1em;
    margin-top: 1em;
  }
}
</style>
