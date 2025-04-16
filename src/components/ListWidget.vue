<script setup>
import TaxonList from "@/components/core/TaxonList.vue";
import ParameterStore from "@/lib/parameterStore";
const config = ParameterStore.getInstance();
</script>

<template>
  <div>
    <div v-if="config.wktSelected.value.length > 0">
      <TaxonList :itemPerPage="10" :nbTaxonPerLine="4" />
    </div>
    <div v-else>
      <h2 class="col-12 text-center m-3">Aucune géométrie fournie !</h2>
    </div>
  </div>
</template>
