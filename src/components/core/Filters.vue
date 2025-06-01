<script setup>
import { ref, watch } from "vue";
import DateFilter from "./filters/DateFilter.vue";
import BufferSizeFilter from "./filters/BufferSizeFilter.vue";
import SourceFilter from "./filters/SourceFilter.vue";
import { getConnector } from "@/lib/connectors/utils";
import ParameterStore from "@/lib/parameterStore";
import TaxonClassFilter from "../commons/TaxonClassFilter.vue";
const config = ParameterStore.getInstance();

const { radius, dateMin, dateMax, connector, showFilters } = config;

const sourceName = ref(config.connector.value.name);
const sourceParams = ref(config.connector.value.params);

const updateConfig = () => {
  connector.value = getConnector(sourceName.value, sourceParams.value);
};
watch([radius, dateMin, dateMax, sourceName, sourceParams], updateConfig);
</script>

<template>
  <div class="card">
    <h4 class="card-header">
      {{ $t("parameters") }}
    </h4>
    <div class="card-body">
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
        <div class="col mt-3">
          <TaxonClassFilter></TaxonClassFilter>
        </div>
        <div class="col mt-3">
          <BFormCheckbox switch v-model="showFilters">{{
            $t("showFilters")
          }}</BFormCheckbox>
        </div>
      </div>
    </div>
  </div>
  <div class="col mt-3">
    <SourceFilter
      :sourceName="sourceName"
      @params="(params) => (sourceParams = params)"
      @source-name="(newSource) => (sourceName = newSource)"
    ></SourceFilter>
  </div>
</template>
<style>
#filters {
  background-color: white;
}
label {
  font-weight: bold;
}
</style>
