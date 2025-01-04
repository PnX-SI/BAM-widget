<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import TaxonList from "@/components/core/TaxonList.vue";
import Map from "./core/Map.vue";

const radius = ref(1);
const wktSelected = ref(null);
// "POLYGON ((-0.293568 51.481301, -0.334792 51.406792, -0.028364 51.403363, -0.048976 51.497557, -0.219366 51.537745, -0.293568 51.481301))"
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
    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map
          :radius="radius"
          height="100vh"
          :wkt="wktSelected"
          :editable="false"
        />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <TaxonList
          :wkt="wktSelected"
          :dateMin="dateMin"
          :dateMax="dateMax"
          :itemPerPage="10"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100vh !important;
}
</style>
