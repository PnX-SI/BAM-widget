<script setup lang="ts">
import { Media } from "@/lib/models";
import { computed, ref } from "vue";

const props = defineProps<{
  media: Media;
  linkColor: string;
}>();

const STRING_LIMIT = 200;

const creditsLicense = computed(() => {
  if (props.media.license && props.media.license.length > STRING_LIMIT) {
    return props.media.license.slice(0, STRING_LIMIT);
  }
  return props.media.license;
});

const creditsAuthor = computed(() => {
  if (props.media.author && props.media.author.length > STRING_LIMIT) {
    return props.media.author.slice(0, STRING_LIMIT);
  }
  return props.media.author;
});
</script>

<template>
  <span
    ><a
      :class="props.linkColor ? props.linkColor : 'link-light'"
      v-if="props.media.urlSource"
      :href="props.media.urlSource"
      target="_blank"
      >{{ creditsAuthor }}</a
    ></span
  >
  <span v-if="creditsLicense && creditsAuthor"> - </span>
  <span v-if="props.media.licenseUrl"
    ><a
      :class="props.linkColor ? props.linkColor : 'link-light'"
      :href="props.media.licenseUrl"
      target="_blank"
      style="margin-left: 0.3em"
      >{{ creditsLicense }}</a
    ></span
  >
  <span v-else>{{ creditsLicense }}</span>
</template>
<style scoped>
span {
  margin-right: 0.2em;
}
</style>
