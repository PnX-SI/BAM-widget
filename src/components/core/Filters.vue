<script setup>
import { ref, watch, watchEffect } from "vue";
import DateFilter from "./filters/DateFilter.vue";
import BufferSizeFilter from "./filters/BufferSizeFilter.vue";
import SourceFilter from "./filters/SourceFilter.vue";

const radius = ref(10);
const dateMin = ref(null);
const dateMax = ref(null);
const sourceName = ref("geonature");
const sourceParams = ref({});
const occMaxRetrieved = ref(300);
const maxPage = ref(10);

const props = defineProps({
  radius: Number,
  dateMin: Date,
  dateMax: Date,
  sourceName: String,
});

watchEffect(() => {
  radius.value = props.radius;
  dateMin.value = props.dateMin;
  dateMax.value = props.dateMax;
  // sourceName.value = props.sourceName;
});

const emit = defineEmits(["radius", "dateMin", "dateMax", "connectorData"]);

watch([radius, dateMin, dateMax, sourceName, sourceParams], () => {
  emit("radius", radius.value);
  emit("dateMin", dateMin.value);
  emit("dateMax", dateMax.value);
  // emit("connectorData", { name: sourceName.value, params: sourceParams.value });
});
</script>
<template>
  <div id="filters">
    <div class="col-12 col-md-12 col-lg-12 text-center" id="filtersTitle">
      <h3><i class="bi bi-filter"></i> {{ $t("filtersTitle") }}</h3>
    </div>
    <div class="col-12 col-md-4 col-lg-12">
      <BufferSizeFilter
        :radius="radius"
        @update:radius="(newRadius) => (radius = newRadius)"
      ></BufferSizeFilter>
    </div>
    <div class="col-12 col-md-4 col-lg-12">
      <DateFilter
        id="startDate"
        label="Date minimum"
        :currentDate="dateMin"
        @update:date="(newDate) => (dateMin = newDate)"
      ></DateFilter>
    </div>
    <div class="col-12 col-md-4 col-lg-12">
      <DateFilter
        id="endDate"
        label="Date maximum"
        :currentDate="dateMax"
        @update:date="(newDate) => (dateMax = newDate)"
      ></DateFilter>
    </div>
    <div class="col-12 col-md-4 col-lg-12">
      <SourceFilter
        sourceName="geonature"
        @params="(params) => (sourceParams = params)"
        @source-name="(newSource) => (sourceName = newSource)"
      ></SourceFilter>
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
