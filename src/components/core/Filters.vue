<script setup>
import ParameterStore from "@/lib/parameterStore";

// Components
import TaxonClassFilter from "../commons/TaxonClassFilter.vue";
import DateFilter from "./filters/DateFilter.vue";
import BufferSizeFilter from "./filters/BufferSizeFilter.vue";
import SourceFilter from "./filters/SourceFilter.vue";

const { dateMin, dateMax, showFilters } = ParameterStore.getInstance();
</script>

<template>
  <div class="card">
    <h4 class="card-header">
      {{ $t("parameters") }}
    </h4>
    <div class="card-body">
      <div id="filters">
        <div class="col-lg-12">
          <BufferSizeFilter></BufferSizeFilter>
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
    <SourceFilter></SourceFilter>
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
