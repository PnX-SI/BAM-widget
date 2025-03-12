<script setup>
import "leaflet/dist/leaflet.css";
import { ref } from "vue";
import { useRoute } from "vue-router";
import Map from "@/components/core/Map.vue";
import TaxonList from "@/components/core/TaxonList.vue";
import Filters from "@/components/core/Filters.vue";
import Share from "./core/Share.vue";
import { fetchParams } from "@/lib/params";

const params = fetchParams();
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col m-2 mt-1 mb-3">
        <Filters
          :radius="params.radius"
          @dateMin="(newDateMin) => (params.dateMin = newDateMin)"
          @dateMax="(newDateMax) => (params.dateMax = newDateMax)"
          @radius="(newradius) => (params.radius = parseInt(newradius))"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map
          :radius="params.radius"
          height="70vh"
          :wkt="params.wktSelected"
          @wkt="(drawGeometryWKT) => (params.wktSelected = drawGeometryWKT)"
        />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <TaxonList
          :wkt="params.wktSelected"
          :dateMin="params.dateMin"
          :dateMax="params.dateMax"
          :itemPerPage="10"
          height="70vh"
        />
      </div>
      <Share
        :wkt="params.wktSelected"
        :dateMin="params.dateMin"
        :dateMax="params.dateMax"
      />
    </div>
  </div>
</template>

<script type="module"></script>

<style scoped>
#liste-taxons {
  padding: 1em;
}
</style>
