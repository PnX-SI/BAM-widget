<script setup>
import TaxonList from "@/components/core/TaxonList.vue";
import Map from "./core/Map.vue";
import HeaderNav from "./commons/HeaderNav.vue";
</script>

<template>
  <HeaderNav></HeaderNav>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map height="85vh" :force-editable="true" />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <TaxonList :nbTaxonPerLine="2" :style="'height:85vh'" />
      </div>
    </div>
  </div>
</template>
