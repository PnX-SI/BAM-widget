<script setup>
import { ref, watch } from "vue";
const props = defineProps({
  loadingStatus: Boolean,
});

watch(props, () => {
  loadingStatus.value = props.loadingStatus;
});
const loadingStatus = ref(
  props.loadingStatus != null ? props.loadingStatus : false
);
</script>

<template>
  <div v-if="loadingStatus">
    <div class="d-flex justify-content-center">
      <h3>{{ $t("loading") }}</h3>
    </div>
    <div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">{{ $t("loading") }}</span>
      </div>
    </div>
  </div>
</template>
