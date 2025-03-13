<script setup>
import "leaflet/dist/leaflet.css";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import Map from "@/components/core/Map.vue";
import TaxonList from "@/components/core/TaxonList.vue";
import Filters from "@/components/core/Filters.vue";
import Share from "./core/Share.vue";
import { fetchParams } from "@/lib/params";
import { getConnector } from "@/lib/connectors/utils";

const params = fetchParams();
const connector = ref(getConnector(null, {})); // default GBiF
</script>

<template>
  <div class="container-fluid">
    <h1 id="title" class="col-12 text-center m-3">🐦 {{ $t("title") }} 🐛</h1>
    <div class="row">
      <div class="col-12 col-lg-3 col-md-2">
        <Filters
          :sourceName="connector.name"
          :radius="params.radius"
          @dateMin="(newDateMin) => (params.dateMin = newDateMin)"
          @dateMax="(newDateMax) => (params.dateMax = newDateMax)"
          @radius="(newradius) => (params.radius = parseInt(newradius))"
          @connector-data="
            (dict) => (connector = getConnector(dict.name, dict.params))
          "
        />
        <br />
        <Share
          :wkt="params.wktSelected"
          :dateMin="params.dateMin"
          :dateMax="params.dateMax"
          :radius="params.radius"
          :connectorName="connector.name"
          :connectorParams="connector.params"
        />
      </div>
      <div class="col-12 col-lg-5 col-md-6">
        <Map
          :radius="params.radius"
          height="80vh"
          :wkt="params.wktSelected"
          @wkt="(drawGeometryWKT) => (params.wktSelected = drawGeometryWKT)"
        />
      </div>
      <div class="col-12 col-lg-4 col-md-4">
        <TaxonList
          :connector="connector"
          :wkt="params.wktSelected"
          :dateMin="params.dateMin"
          :dateMax="params.dateMax"
          :itemPerPage="10"
          height="80vh"
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
.row div {
  max-height: 80vh;
}
</style>
