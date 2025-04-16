<script setup>
import { ref, watch } from "vue";
import DateFilter from "./filters/DateFilter.vue";
import BufferSizeFilter from "./filters/BufferSizeFilter.vue";
import SourceFilter from "./filters/SourceFilter.vue";
import TaxonResearch from "./filters/TaxonResearch.vue";
import { getConnector } from "@/lib/connectors/utils";
import ParameterStore from "@/lib/parameterStore";
const config = ParameterStore.getInstance();

const radius = ref(config.radius.value);
const dateMin = ref(config.dateMin.value);
const dateMax = ref(config.dateMax.value);
const sourceName = ref(config.connector.value.name);
const sourceParams = ref(config.connector.value.params);

watch([radius, dateMin, dateMax, sourceName, sourceParams], () => {
  config.radius.value = radius.value;
  config.dateMin.value = dateMin.value;
  config.dateMax.value = dateMax.value;
  config.connector.value = getConnector(sourceName.value, sourceParams.value);
});
</script>
<template>
  <div id="filters">
    <div class="col-lg-12">
      <BufferSizeFilter
        :radius="radius"
        @update:radius="(newRadius) => (radius = newRadius)"
      ></BufferSizeFilter>
    </div>
    <div class="row mt-3">
      <div class="col-6">
        <DateFilter
          id="startDate"
          label="Date min."
          :currentDate="dateMin"
          @update:date="(newDate) => (dateMin = newDate)"
        ></DateFilter>
      </div>
      <div class="col-6">
        <DateFilter
          id="endDate"
          label="Date max."
          :currentDate="dateMax"
          @update:date="(newDate) => (dateMax = newDate)"
        ></DateFilter>
      </div>
    </div>
    <div class="col-12 mt-3">
      <SourceFilter
        :sourceName="sourceName"
        @params="(params) => (sourceParams = params)"
        @source-name="(newSource) => (sourceName = newSource)"
      ></SourceFilter>
    </div>
    <div class="col-12 mt-3">
      <TaxonResearch></TaxonResearch>
    </div>
  </div>
</template>
<style>
#filters {
  background-color: white;
}
label {
  font-weight: bold;
}
#filtersTitle {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
