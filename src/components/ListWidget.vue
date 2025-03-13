<script setup>
import { ref } from "vue";
import TaxonList from "@/components/core/TaxonList.vue";
import { useRoute } from "vue-router";
import { fetchParams } from "@/lib/params";

const params = fetchParams();
</script>

<template>
  <div>
    <div v-if="params.wktSelected">
      <TaxonList
        :wkt="params.wktSelected"
        :dateMin="params.dateMin"
        :dateMax="params.dateMax"
        :itemPerPage="10"
      />
    </div>
    <div v-else>
      <h2 class="col-12 text-center m-3">Aucune géométrie fournie !</h2>
    </div>
  </div>
</template>

<style scoped></style>
