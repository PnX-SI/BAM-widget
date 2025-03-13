<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import TaxonList from "@/components/core/TaxonList.vue";
import Map from "./core/Map.vue";
import { fetchParams } from "@/lib/params";

const params = fetchParams();
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map
          :radius="params.radius"
          height="80vh"
          :wkt="params.wktSelected"
          :editable="false"
        />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <TaxonList
          :connector="params.connector"
          :wkt="params.wktSelected"
          height="80vh"
          :dateMin="params.dateMin"
          :dateMax="params.dateMax"
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
