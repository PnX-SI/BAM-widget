<script setup>
import { computed, ref, watch } from "vue";
import ParameterStore from "@/lib/parameterStore";

const width = ref("100wv");
const height = ref("100vh");

const props = defineProps({
  link: String,
  required: true,
});

const emit = defineEmits(["update:width", "update:height"]);

watch([width, height], () => {
  emit("update:width", width.value);
  emit("update:height", height.value);
});

const embed = computed(() => {
  return `<embed src="${props.link}" type="" style="width: ${width.value}; height: ${height.value}" />`;
});
</script>

<template>
  <span class="input-group-text"
    ><i class="bi bi-code-slash"></i> {{ $t("browserIntegration") }}</span
  >
  <textarea
    class="form-control"
    placeholder="Embed URL"
    aria-label=".form-control-lg example"
    :value="embed"
  />
  <div class="input-group mb-3">
    <span class="input-group-text">{{ $t("size.width") }}</span>
    <input
      class="form-control form-control-lg"
      type="text"
      placeholder="Width"
      aria-label=".form-control-lg example"
      v-model="width"
    />
    <span class="input-group-text">{{ $t("size.height") }}</span>
    <input
      class="form-control form-control-lg"
      type="text"
      placeholder="Height"
      aria-label=".form-control-lg example"
      v-model="height"
    />
  </div>
</template>
