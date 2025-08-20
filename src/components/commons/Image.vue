<script setup lang="ts">
import { NO_IMAGE_URL } from "@/assets/constant";
import { ref, watchEffect } from "vue";

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
    // TODO add an url validator
  },
  ariaLabel: String,
  alt: String,
  class: String,
});

const imageExists = ref(false);
const imageLoaded = ref(false);

const imageUrl = ref(props.imageUrl);

watchEffect(() => {
  imageUrl.value = props.imageUrl;
});

function checkImageExists() {
  // Use a simple GET request to check if the image exists
  fetch(imageUrl.value, {
    method: "HEAD",
  })
    .then((response) => {
      console.log(response);
      if (response.ok) {
        console.log("aaa");
        imageExists.value = true;
      } else {
        imageExists.value = false;
        imageUrl.value = NO_IMAGE_URL;
      }
      console.log(imageUrl.value);
    })
    .catch((error) => {
      console.error("Error checking image:", error);
      imageExists.value = false;
      imageUrl.value = NO_IMAGE_URL;
    });
}

function onImageLoaded() {
  imageLoaded.value = true;
}

checkImageExists();
</script>

<template>
  <img
    ref="image"
    @load="onImageLoaded"
    :src="imageUrl"
    :alt="props?.alt"
    :aria-label="props?.ariaLabel"
    :class="props?.class"
    :key="props.imageUrl"
  />
</template>
