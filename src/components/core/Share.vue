<script setup>
import HTMLBuilder from "./HTMLBuilder.vue";
import { computed, ref } from "vue";
import ParameterStore from "@/lib/parameterStore";
const config = ParameterStore.getInstance();

const width = ref("100wv");
const height = ref("100vh");
const typeWidget = ref("");

const host = window.location.origin;
const pathName = window.location.pathname;

const route = computed(() => {
  const routes = {
    list: "/list",
    config: "/config",
  };
  return routes[typeWidget.value] || "/";
});

const link = computed(() => {
  const paramsArray = Object.entries(config.getParams()).map(
    ([key, value]) => `${key}=${value}`
  );

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
    menu-class="share_modal"
  >
    <template #button-content>
      <i class="bi bi-share"></i> {{ $t("share") }}
    </template>
    <div class="row justify-content-center p-3">
      <div class="col-12 col-lg-12 col-md-6 text-center">
        <label for="shareButton">{{ $t("shareLink") }}</label>
        <button
          class="btn btn-outline-secondary mb-3"
          id="shareButton"
          @click="copy"
        >
          <div v-if="copied">
            <i class="bi bi-check2-circle"></i> {{ $t("copied") }}!
          </div>
          <div v-else><i class="bi bi-link-45deg"></i> {{ $t("copy") }}</div>
        </button>
        <HTMLBuilder
          :link="link"
          @update:typeWidget="(new_type) => (typeWidget = new_type)"
          @update:width="(new_width) => (width = new_width)"
          @update:height="(new_height) => (height = new_height)"
        />
      </div>
    </div>
  </BDropdown>
</template>

<style>
#shareButton {
  margin-left: 0.5em;
}
.share_modal {
  min-width: 400px !important;
}
</style>
