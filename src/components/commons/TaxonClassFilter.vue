<script setup>
import { taxonClassIcons } from "@/assets/taxonclass2icon";

import ParameterStore from "@/lib/parameterStore";

const class_ = ParameterStore.getInstance().class;

function updateClass(className) {
  class_.value = class_.value == className ? null : className;
}
</script>

<template>
  <label>{{ $t("taxon.class") }}</label>
  <div class="">
    <div class="row g-1" id="classTaxonFilters">
      <div
        v-for="value of Object.keys(taxonClassIcons.Animalia)"
        :key="value"
        class="col"
      >
        <BButton
          pill
          variant="outline-primary"
          :pressed="class_ == value"
          @click="updateClass(value)"
          >{{ value }}</BButton
        >
      </div>
      <div
        v-for="value of Object.keys(taxonClassIcons.Plantae)"
        :key="value"
        class="col"
      >
        <BButton
          pill
          variant="outline-success"
          :pressed="class_ == value"
          @click="updateClass(value)"
          >{{ value }}</BButton
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-container-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.row {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
}

/* Hide scrollbar for Chrome, Safari and Opera */
#classTaxonFilters::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
#classTaxonFilters {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  flex-wrap: nowrap;
}
</style>
