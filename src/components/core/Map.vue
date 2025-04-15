<script setup>
// Leaflet
import L from "leaflet";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { restoreMapState, toWKT } from "@/lib/utils";
import { parse, stringify } from "wellknown";

// Vue
import { computed, onMounted, ref, shallowRef, watchEffect } from "vue";

// Draw config
import drawConfig from "./MapConfig";

const props = defineProps({
  radius: {
    type: Number,
    default: 1,
  },
  wkt: String,
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
const radius = ref(1); // in km
const wkt = ref(null);

const wktFromOutside = computed(() => {
  return props.wkt ? true : false;
});

const style = computed(() => {
  return "height: " + props.height + ";";
});

if (props.wkt) {
  wkt.value = props.wkt;
  let tmp = L.geoJSON().addTo(geometry.value);
  tmp.addData(parse(wkt.value));
}

radius.value = props.radius;

watchEffect(() => {
  radius.value = props.radius;
  wkt.value = props.wkt;
  if (wktFromOutside.value) {
    let tmp = L.geoJSON().addTo(geometry.value);
    tmp.addData(parse(wkt.value));
  }
});

// Component Events
const emit = defineEmits(["wkt", "geojson"]);

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
  if (props.editable) {
    map.value.addControl(new L.Control.Draw(drawConfig(geometry.value)));
  }

  // Add event listener on geometry creation
  map.value.on(L.Draw.Event.CREATED, (event) => {
    let layer = event.layer;
    // Display the new geometry
    geometry.value.clearLayers();
    geometry.value.addLayer(layer);

    // Convert to WKT
    const WKT = toWKT(layer, event.layerType, radius.value);
    // If point or line, we buffer the geometry
    if (event.layerType == "marker" || event.layerType == "polyline") {
      let tmp = L.geoJSON().addTo(geometry.value);
      tmp.addData(parse(WKT));
    }

    emit("wkt", WKT);
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
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
