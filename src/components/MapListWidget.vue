<script setup>
// Components
import TaxonList from "@/components/core/TaxonList.vue";
import Map from "./core/Map.vue";

const props = defineProps({
  height: {
    type: String,
    default: "100vh",
  },
});
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map :height="props.height" :editable="true" />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <TaxonList :nbTaxonPerLine="2" :style="'height:' + props.height" />
      </div>
    </div>
  </div>
</template>
