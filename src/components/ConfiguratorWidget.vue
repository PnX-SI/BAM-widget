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
import LanguageSwitch from "./commons/LanguageSwitch.vue";

const params = fetchParams();
const connector = ref(getConnector(null, {})); // default GBiF
</script>

<template>
  <div class="container-fluid">
    <nav class="navbar bg-body-tertiary mb-3">
      <div class="container-fluid">
        <a class="navbar-brand">🐛 🐦 🌱{{ $t("title") }} </a>
        <div class="d-flex" role="search">
          <Share
            :wkt="params.wktSelected"
            :dateMin="params.dateMin"
            :dateMax="params.dateMax"
            :radius="params.radius"
            :connector="connector"
          />
          <LanguageSwitch></LanguageSwitch>
        </div>
      </div>
    </nav>

    <div class="row">
      <div class="col-12 col-lg-3 col-md-2">
        <div
          class="col-12 col-md-12 col-lg-12 text-center mb-3"
          id="filtersTitle"
        >
          <h3><i class="bi bi-sliders"></i> {{ $t("filtersTitle") }}</h3>
        </div>
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
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <Map
          :radius="params.radius"
          height="100vh"
          :wkt="params.wktSelected"
          @wkt="(drawGeometryWKT) => (params.wktSelected = drawGeometryWKT)"
        />
      </div>
      <div class="col-12 col-lg-3 col-md-4">
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
