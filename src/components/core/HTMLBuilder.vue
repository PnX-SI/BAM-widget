<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  link: String,
  required: true,
});
const width = ref("500px");
const height = ref("400px");

const copied = ref(false);
function copy() {
  navigator.clipboard.writeText(embed.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3000);
}

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
  <span class="input-group-text d-flex justify-content-start align-items-center"
    ><i class="bi bi-code-slash" style="margin-right: 0.5em"></i>
    {{ $t("browserIntegration") }}
    <button
      class="btn btn-outline-secondary mb-3"
      id="shareButton"
      @click="copy"
    >
      <div v-if="copied">
        <i class="bi bi-check2-circle"></i> {{ $t("copied") }}!
      </div>
      <div v-else><i class="bi bi-copy"></i> {{ $t("copy") }}</div>
    </button></span
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
      class="form-control"
      type="text"
      placeholder="Width"
      aria-label=".form-control-lg example"
      v-model="width"
    />
    <span class="input-group-text">{{ $t("size.height") }}</span>
    <input
      class="form-control"
      type="text"
      placeholder="Height"
      aria-label=".form-control-lg example"
      v-model="height"
    />
  </div>
</template>
