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
    <div class="datasetsList">
      <span v-for="uuid in props.datasets">
        <a
          class="badge text-bg-warning link-light text-decoration-none"
          :href="connector.getDatasetUrl(uuid)"
          >{{ uuid }}</a
        >
      </span>
    </div>
  </BPopover>
</template>
