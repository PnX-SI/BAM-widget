<script setup>
// Components
import TaxonList from "@/components/core/TaxonList.vue";
import Map from "./core/Map.vue";
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map height="100vh" :editable="true" />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <TaxonList :nbTaxonPerLine="2" />
      </div>
    </div>
  </div>
</template>
