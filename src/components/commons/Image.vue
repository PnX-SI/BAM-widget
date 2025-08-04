<script setup lang="ts">
import { NO_IMAGE_URL } from "@/assets/constant";
import { ref } from "vue";

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

const imageUrl = ref(props.imageUrl);

function checkImageExists() {
  // Use a simple GET request to check if the image exists
  fetch(imageUrl.value, {
    method: "HEAD",
  })
    .then((response) => {
      if (response.ok) {
        imageExists.value = true;
      } else {
        imageExists.value = false;
        imageUrl.value = NO_IMAGE_URL;
      }
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
    :src="props.imageUrl"
    :alt="props?.alt"
    :aria-label="props?.ariaLabel"
    :class="!imageLoaded ? 'placeholder placeholder-wave' : ''"
  />
  <!-- <div v-else class="col placeholder-glow">
    <div style="height: 300px; width: 100%" class="placeholder"></div>
  </div> -->
</template>
