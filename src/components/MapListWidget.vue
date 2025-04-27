<script setup>
import TaxonList from "@/components/core/TaxonList.vue";
import Map from "./core/Map.vue";

import ParameterStore from "@/lib/parameterStore";
const config = ParameterStore.getInstance();
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map
          :radius="config.radius.value"
          height="100vh"
          :wkt="config.wkt.value"
          :editable="false"
        />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <TaxonList :nbTaxonPerLine="2" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100vh !important;
}
</style>
