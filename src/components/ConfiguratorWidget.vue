<script setup>
import "leaflet/dist/leaflet.css";
import { ref } from "vue";
import { useRoute } from "vue-router";
import Map from "@/components/core/Map.vue";
import TaxonList from "@/components/core/TaxonList.vue";
import Filters from "@/components/core/Filters.vue";

const radius = ref(1);
const wktSelected = ref("");
const dateMin = ref(null);
const dateMax = ref(null);

const route = useRoute();
const params = route.query;

if ("radius" in params) {
  radius.value = parseInt(params.get("radius"));
}
if ("wkt" in params) {
  wktSelected.value = params.wkt;
}
if ("dateMin" in params) {
  dateMin.value = params.get("dateMin");
}
if ("dateMax" in params) {
  dateMax.value = params.get("dateMax");
}
</script>

<template>
  <div class="container-fluid">
    <h1 id="title" class="col-12 text-center m-3">🐦{{ $t("title") }}🐛</h1>

    <div class="row">
      <div class="col m-2 mt-1 mb-3">
        <Filters
          :radius="radius"
          @dateMin="(newDateMin) => (dateMin = newDateMin)"
          @dateMax="(newDateMax) => (dateMax = newDateMax)"
          @radius="(newradius) => (radius = parseInt(newradius))"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map
          :radius="radius"
          height="70vh"
          :wkt="wktSelected"
          @wkt="(drawGeometryWKT) => (wktSelected = drawGeometryWKT)"
        />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <TaxonList
          :wkt="wktSelected"
          :dateMin="dateMin"
          :dateMax="dateMax"
          :itemPerPage="10"
          height="70vh"
        />
      </div>
    </div>
  </div>
</template>

<script type="module"></script>

<style scoped>
#liste-taxons {
  padding: 1em;
}
</style>
