<script setup>
import HTMLBuilder from "./HTMLBuilder.vue";
import { computed, ref, watchEffect } from "vue";

const props = defineProps({
  wkt: String,
  dateMin: String,
  dateMax: String,
  radius: Number,
  connectorName: String,
  connectorParams: Object,
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
    .filter(([key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${value}`);
  if (props.connectorParams) {
    Object.entries(props.connectorParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        paramsArray.push(`${key}=${value}`);
      }
    });
    paramsArray.push(`connector=${props.connectorName}`);
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
  <div class="row justify-content-center">
    <div class="col-12 col-lg-12 col-md-6 text-center">
      <h4><i class="bi bi-share"></i> {{ $t("shareLink") }}</h4>
      <div class="input-group">
        <input class="form-control" type="text" :value="link" />
        <button class="btn btn-outline-secondary" @click="copy()">
          <div v-if="copied">
            <i class="bi bi-check2-circle"></i> {{ $t("copied") }} !
          </div>
          <div v-else><i class="bi bi-copy"></i> {{ $t("copy") }}</div>
        </button>
      </div>

      <h4 class="mt-3 text-center">
        <i class="bi bi-code-slash"></i> {{ $t("browserIntegration") }}
      </h4>
      <HTMLBuilder
        :link="link"
        @typeWidget="(new_type) => (typeWidget = new_type)"
        @width="(new_width) => (width = new_width)"
        @height="(new_height) => (height = new_height)"
      />
    </div>
  </div>
</template>
