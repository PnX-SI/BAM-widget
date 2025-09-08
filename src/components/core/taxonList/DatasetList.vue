<script setup>
import ParameterStore from "@/lib/parameterStore";

const { connector } = ParameterStore.getInstance();

const props = defineProps({
  datasets: Array,
});
</script>

<template>
  <BPopover
    v-if="props.datasets && props.datasets.length > 0"
    :click="true"
    :close-on-hide="true"
    :delay="{ show: 0, hide: 0 }"
  >
    <template #target>
      <a style="color: white; text-decoration: underline" class="ms-1"
        ><i class="bi bi-database-fill"></i
      ></a>
    </template>
    <h4>{{ $t("datasetList") }}</h4>
    <ul class="list-group datasetsList">
      <li v-for="dataset in props.datasets" class="list-group-item">
        <a
          class="link-primary text-decoration-none"
          :href="connector.getDatasetUrl(dataset.uuid)"
        >
          {{ dataset.name }}
        </a>
        <span class="badge bg-warning rounded-pill ms-1">
          {{ dataset.nbObservations }}
          {{ $t(dataset.nbObservations > 1 ? "observations" : "observation") }}
        </span>
      </li>
    </ul>
  </BPopover>
</template>
<style>
.datasetsList {
  height: 200px;
  overflow-y: scroll;
}
</style>
