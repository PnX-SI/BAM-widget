<script setup>
import "leaflet/dist/leaflet.css";
import Map from "@/components/core/Map.vue";
import TaxonList from "@/components/core/TaxonList.vue";
import Filters from "@/components/core/Filters.vue";
import Share from "./core/Share.vue";
import LanguageSwitch from "./commons/LanguageSwitch.vue";
import ParameterStore from "@/lib/parameterStore";

const config = ParameterStore.getInstance();
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
            <Share />
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
              :sourceName="config.connector.value.name"
              :radius="config.radius.value"
            />
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <Map
          :radius="config.radius.value"
          height="100vh"
          :wkt="config.wktSelected.value"
          @wkt="
            (drawGeometryWKT) => (config.wktSelected.value = drawGeometryWKT)
          "
        />
      </div>
      <div class="col-12 col-lg-3 col-md-4">
        <TaxonList :itemPerPage="10" height="80vh" />
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
