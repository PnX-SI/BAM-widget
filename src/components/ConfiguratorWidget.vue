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
    <BNavbar
      v-b-color-mode="'light'"
      toggleable="lg"
      variant="light"
      class="mb-3"
    >
      <BNavbarBrand href="#">🐛 🐦 🌱{{ $t("title") }}</BNavbarBrand>
      <BNavbarToggle target="nav-collapse" />
      <BCollapse id="nav-collapse" is-nav>
        <BNavbarNav class="ms-auto mb-2 mb-lg-0">
          <BNavForm class="d-flex" right>
            <Share
              :wkt="params.wktSelected"
              :dateMin="params.dateMin"
              :dateMax="params.dateMax"
              :radius="params.radius"
              :connector="connector"
            />
            <LanguageSwitch></LanguageSwitch>
          </BNavForm>
        </BNavbarNav>
      </BCollapse>
    </BNavbar>

    <div class="row">
      <div class="col-12 col-lg-3 col-md-2">
        <div class="card">
          <h4 class="card-header">
            {{ $t("filtersTitle") }}
          </h4>
          <div class="card-body">
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
        </div>
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
