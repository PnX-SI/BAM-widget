<script setup>
import HTMLBuilder from "./HTMLBuilder.vue";
import { computed, ref, watchEffect } from "vue";

const props = defineProps({
  wkt: String,
  dateMin: String,
  dateMax: String,
  radius: Number,
  connector: Object,
});

const width = ref("100wv");
const height = ref("100vh");
const typeWidget = ref("");
const wkt = ref("");

const host = window.location.origin;
const pathName = window.location.pathname;
const route = computed(() => {
  switch (typeWidget.value) {
    case "list":
      return "/list";
    case "config":
      return "/config";
    default:
      return "/";
  }
});

watchEffect(() => {
  wkt.value = props.wkt;
});

const link = computed(() => {
  const paramsArray = Object.entries(props)
    .filter(
      ([key, value]) =>
        value !== undefined && value !== null && key !== "connector"
    )
    .map(([key, value]) => `${key}=${value}`);
  if (props.connector.params) {
    Object.entries(props.connector.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        paramsArray.push(`${key}=${value}`);
      }
    });
    paramsArray.push(`connector=${props.connector.name}`);
  }

  const params = paramsArray.length ? `?${paramsArray.join("&")}` : "";

  return `${host}${pathName}#${route.value}${params}`;
});

const copied = ref(false);
function copy() {
  navigator.clipboard.writeText(link.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3000);
}
</script>

<template>
  <BDropdown
    :text="$t('share')"
    variant="primary"
    class="me-2"
    auto-close="outside"
  >
    <template #button-content>
      <i class="bi bi-share"></i> {{ $t("share") }}</template
    >
    <div class="row justify-content-center" style="padding: 1em">
      <div class="col-12 col-lg-12 col-md-6 text-center">
        <label for="shareButton"> Partager un lien </label>
        <button
          class="btn btn-outline-secondary"
          id="shareButton"
          @click="copy()"
        >
          <div v-if="copied">
            <i class="bi bi-check2-circle"></i> {{ $t("copied") }} !
          </div>
          <div v-else><i class="bi bi-link-45deg"></i> {{ $t("copy") }}</div>
        </button>
        <br />
        <HTMLBuilder
          :link="link"
          @typeWidget="(new_type) => (typeWidget = new_type)"
          @width="(new_width) => (width = new_width)"
          @height="(new_height) => (height = new_height)"
        />
      </div>
    </div>
  </BDropdown>
</template>
<style scoped>
#shareButton {
  margin-left: 0.5em;
}
</style>
