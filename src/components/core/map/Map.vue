<script setup>
// Imports
import L from "leaflet";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geosearch/dist/geosearch.css";
import { restoreMapState, toWKT } from "@/lib/utils";
import { parse } from "wellknown";
import { LocateControl } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import { computed, onMounted, ref, shallowRef, watch } from "vue";
import drawConfig from "./MapConfig";
import { booleanClockwise, rewind } from "@turf/turf";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useI18n } from "vue-i18n";
import ParameterStore from "@/lib/parameterStore";

const { t } = useI18n();

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
  forceEditable: {
    // for parameters, we do not want to disable map edition
    type: Boolean,
    default: false,
  },
});

// Store
const { radius, wkt, sourceGeometry, mapEditable, lang, x, y } =
  ParameterStore.getInstance();

// Component Attributes
const map = shallowRef();
const geometry = shallowRef(new L.FeatureGroup());
let drawEventData = null;
const mapID = (Math.random() + 1).toString(36).substring(7);

// Computed Properties
const wktFromOutside = computed(() => !!wkt.value);
const style = computed(() => `height: ${props.height};`);
let locate = null;

// Functions
function updateGeometryFromWKT() {
  if (wkt.value) {
    geometry.value.clearLayers();
    let tmp = L.geoJSON().addTo(geometry.value);
    tmp.addData(parse(wkt.value));
    focusOnGeometry();
  }
}

function focusOnGeometry() {
  if (map.value) map.value.fitBounds(geometry.value.getBounds());
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
    radius.value / 1000
  );

  if (
    drawEventData.layerType === "marker" ||
    drawEventData.layerType === "polyline"
  ) {
    let tmp = L.geoJSON().addTo(geometry.value);
    tmp.addData(parse(WKT));
  }

  wkt.value = WKT;
  x.value = null;
  y.value = null;
  sourceGeometry.value = null;
}

function addSearchControl() {
  const provider = new OpenStreetMapProvider({
    params: { "accept-language": lang.value },
  });
  const searchControl = new GeoSearchControl({
    provider: provider,
    style: "bar",
    resetButton: "x",
    searchLabel: t("map.searchPlace"),
  });
  map.value.addControl(searchControl);
  map.value.on("geosearch/showlocation", (e) => {
    geometry.value.clearLayers();
    const marker = L.marker([e.location.y, e.location.x]);
    drawEventData = { layer: marker, layerType: "marker" };
    geometry.value.addLayer(marker);
    updateGeometry();
    focusOnGeometry();
  });
}

function handleGeolocation(event) {
  geometry.value.clearLayers();
  const marker = L.marker(event.latlng);
  drawEventData = { layer: marker, layerType: "marker" };
  geometry.value.addLayer(marker);
  updateGeometry();
  locate.stop();
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

function setupMap() {
  map.value = L.map(`map-${mapID}`);
  restoreMapState(map.value);

  L.tileLayer(OPEN_STREET_MAP_URL, {
    maxZoom: 19,
    attribution: OPEN_STREET_MAP_ATTRIBUTION,
  }).addTo(map.value);

  map.value.addLayer(geometry.value);

  if (wktFromOutside.value) {
    focusOnGeometry();
  }

  if (mapEditable.value) {
    /**
     * ADD DRAW GEOMETRY TOOLS
     */
    map.value.addControl(new L.Control.Draw(drawConfig(geometry.value)));

    /**
     * ADD GEOLOCATION TOOL
     */
    locate = new LocateControl({
      icon: "fa-solid fa-location-crosshairs fa-xl",
    }).addTo(map.value);

    /**
     * ADD SEARCH FORM
     */
    addSearchControl();
  }

  map.value.on(L.Draw.Event.CREATED, handleGeometryCreation);
  map.value.on("locationfound", handleGeolocation);
}

// Lifecycle Hooks
onMounted(() => {
  setupMap();
  window.addEventListener("beforeunload", saveMapState);
});

updateGeometryFromWKT();

// Watchers
watch(wkt, updateGeometryFromWKT);
watch([radius, geometry], updateGeometry);
if (!props.forceEditable) {
  watch(mapEditable, () => {
    map.value.off();
    map.value.remove();
    setupMap();
  });
}
</script>

<template>
  <div class="mapC" :id="`map-${mapID}`" :style="style"></div>
</template>

<style scoped>
.mapC {
  border-radius: 10px;
}

@media screen and (max-width: 770px) {
  .mapC {
    height: 50vh !important;
    margin-bottom: 1em;
    margin-top: 1em;
  }
}
</style>
