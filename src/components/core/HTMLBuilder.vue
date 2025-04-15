<script setup>
import { computed, ref, watch, watchEffect } from "vue";

const width = ref("100wv");
const height = ref("100vh");
const typeWidget = ref("");

const props = defineProps({
  link: String,
});

const emit = defineEmits(["width", "height", "typeWidget"]);

watch([typeWidget, width, height], () => {
  emit("width", width.value);
  emit("height", height.value);
  emit("typeWidget", typeWidget.value);
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
    <span class="input-group-text">{{ $t("typeWidget.title") }}</span>
    <select class="form-select" v-model="typeWidget">
      <option value="">{{ $t("typeWidget.default") }}</option>
      <option value="list">{{ $t("typeWidget.list") }}</option>
      <option value="config">{{ $t("typeWidget.config") }}</option>
    </select>
  </div>
</template>
