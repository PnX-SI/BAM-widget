<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { NO_IMAGE_URL } from "@/assets/constant";

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  ariaLabel: String,
  alt: String,
  class: String,
});

const currentImageUrl = ref(NO_IMAGE_URL);
const imageLoaded = ref(false);

function checkImageExists(url: string) {
  const img = new Image();
  imageLoaded.value = false;

  img.onload = () => {
    currentImageUrl.value = url;
    imageLoaded.value = true;
  };
  img.onerror = () => {
    currentImageUrl.value = NO_IMAGE_URL;
    imageLoaded.value = true;
  };
  img.src = url;
}

onMounted(() => {
  checkImageExists(props.imageUrl);
});

watch(
  () => props.imageUrl,
  (newUrl) => {
    checkImageExists(newUrl);
  }
);
</script>

<template>
  <div class="image-wrapper">
    <!-- Loader -->
    <div v-if="!imageLoaded" class="loader"></div>

    <!-- Image -->
    <img
      :src="currentImageUrl"
      :alt="alt"
      :aria-label="ariaLabel"
      :class="imageLoaded ? 'loaded' : ''"
    />
  </div>
</template>

<style scoped>
.image-wrapper {
  position: relative;
  width: 100%; /* Fixe ou responsive selon ton besoin */
  aspect-ratio: 1 / 1; /* Maintient le carré */
  overflow: hidden;
}

/* Spinner loader */
.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Image style */
img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  border-radius: 5px;
}

/* When loaded */
img.loaded {
  opacity: 1;
}

/* Spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
