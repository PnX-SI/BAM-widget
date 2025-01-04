<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";

const width = ref("300px");
const height = ref("600px");
const url = ref("");

const props = defineProps({
  wkt: String,
  dateMin: String,
  dateMax: String,
});

const router = useRouter();
console.log(window.location.origin);
console.log(router.currentRoute.value.fullPath);

const host = window.location.origin;
const pathName = window.location.pathname;
const route = router.currentRoute.value.fullPath;

const embed = computed(() => {
  let paramsArray = [];
  if (props.wkt) {
    paramsArray.push(`wkt=${props.wkt}`);
  }
  if (props.dateMin) {
    paramsArray.push(`dateMin=${props.dateMin}`);
  }
  if (props.dateMax) {
    paramsArray.push(`dateMax=${props.dateMax}`);
  }

  const params = paramsArray.length ? `?${paramsArray.join("&")}` : "";

  const link = `${host}${pathName}#${route}${params}`;

  return `<embed src="${link}" type="" style="width: ${width.value}; height: ${height.value}" />`;
});

// console.log(url.value);
</script>

<template>
  <span class="input-group-text">{{ $t("embed") }}</span>
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
