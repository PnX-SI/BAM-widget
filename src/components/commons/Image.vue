<script setup lang="ts">
import { NO_IMAGE_URL } from "@/assets/constant";
import { ref, useTemplateRef } from "vue";

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
    // TODO add an url validator
  },
  ariaLabel: String,
  alt: String,
});

const imageExists = ref(false);
const imageLoaded = ref(false);
function checkImageExists() {
  // Use a simple GET request to check if the image exists
  fetch(props.imageUrl, {
    method: "HEAD",
  })
    .then((response) => {
      if (response.ok) {
        imageExists.value = true;
      } else {
        imageExists.value = false;
      }
    })
    .catch((error) => {
      console.error("Error checking image:", error);
      this.imageExists = false;
    });
}
checkImageExists();
const imgHtmlTag = useTemplateRef("image");
</script>

<template>
  <img
    v-if="imageExists"
    ref="image"
    :src="props.imageUrl"
    :alt="props?.alt"
    :aria-label="props?.ariaLabel"
  />
  <img v-else :src="NO_IMAGE_URL" :alt="props?.alt" />
</template>
