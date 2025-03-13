<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  radius: { type: Number, required: true },
});

const radius = ref(props?.radius);

const emit = defineEmits(["update:radius"]);

watch(radius, () => {
  emit("update:radius", radius.value);
});
</script>

<template>
  <label for="radius" class="form-label"
    >{{ $t("bufferSize") }} {{ radius }} km</label
  >
  <input
    type="range"
    class="form-range"
    min="1"
    max="100"
    v-model="radius"
    id="radius"
  />
</template>
