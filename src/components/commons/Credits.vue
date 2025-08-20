<script setup lang="ts">
import { Media } from "@/lib/models";
import { ref } from "vue";

const props = defineProps<{
  media: Media;
}>();
</script>

<template>
  <span> {{ props.media.author }}</span>
  -
  <span
    ><a v-if="props.media.urlSource" :href="props.media.urlSource"
      >{{ $t("media.linkToOrigin") }}
      <i class="bi bi-box-arrow-up-right"></i></a
  ></span>
  -
  <span>{{ $t("media.licenseUnder") }}</span>
  <span v-if="props.media.licenseUrl"
    ><a :href="props.media.licenseUrl">{{ props.media.license }}</a></span
  >
  <span v-else> {{ props.media.license }}</span>
</template>
<style scoped>
span {
  margin-left: 0.2em;
}
</style>
