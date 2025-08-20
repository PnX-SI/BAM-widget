<script setup lang="ts">
import { Media } from "@/lib/models";
import { ref } from "vue";

const props = defineProps<{
  media: Media;
  linkColor: String;
}>();
</script>

<template>
  <span
    ><a
      :class="props.linkColor ? props.linkColor : 'link-light'"
      v-if="props.media.urlSource"
      :href="props.media.urlSource"
      >{{ props.media.author }}</a
    ></span
  >
  -
  <!-- <span>{{ $t("media.licenseUnder") }}</span> -->
  <span v-if="props.media.licenseUrl"
    ><a
      :class="props.linkColor ? props.linkColor : 'link-light'"
      :href="props.media.licenseUrl"
      >{{ props.media.license }}</a
    ></span
  >
  <span v-else> {{ props.media.license }}</span>
</template>
<style scoped>
span {
  margin-right: 0.2em;
}
</style>
