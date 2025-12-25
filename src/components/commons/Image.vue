<script setup lang="ts">
    import { ref, watch, onMounted } from 'vue';
    import { NO_IMAGE_URL } from '@/assets/constant';

    const props = defineProps({
        imageUrl: {
            type: String,
            required: true,
        },
        ariaLabel: String,
        alt: String,
        class: String,
        testID: String,
    });

    const currentImageUrl = ref(NO_IMAGE_URL);
    const imageLoaded = ref(false);
    const fullScreenMode = ref(false);

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
            :data-testid="props?.testID"
            :class="imageLoaded ? 'loaded' : '' + '.img'"
            @click="fullScreenMode = !fullScreenMode"
        />
    </div>
    <Transition name="fullscreen">
        <div
            v-if="fullScreenMode && imageLoaded"
            class="fullScreenContainer"
            @click.stop="fullScreenMode = !fullScreenMode"
        >
            <button
                class="close-button"
                @click.stop="fullScreenMode = !fullScreenMode"
            >
                <i class="bi bi-x-lg"></i>
            </button>
            <img
                :src="currentImageUrl"
                :alt="alt"
                :aria-label="ariaLabel"
                :data-testid="props?.testID"
                class="fullscreenImage"
            />
        </div>
    </Transition>
</template>

<style scoped>
    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 2rem;
        color: #fff;
        background-color: transparent;
        border: none;
        cursor: pointer;
    }
    .fullScreenContainer {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1em;
        z-index: 1000;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }
    .fullscreenImage {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    /* Transitions pour le fullscreen */
    .fullscreen-enter-active,
    .fullscreen-leave-active {
        transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
    }

    .fullscreen-enter-active .fullscreenImage,
    .fullscreen-leave-active .fullscreenImage {
        transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .fullscreen-enter-from,
    .fullscreen-leave-to {
        opacity: 0;
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
    }

    .fullscreen-enter-from .fullscreenImage,
    .fullscreen-leave-to .fullscreenImage {
        transform: scale(0.8);
        opacity: 0;
    }

    .fullscreen-enter-to,
    .fullscreen-leave-from {
        opacity: 1;
    }

    .fullscreen-enter-to .fullscreenImage,
    .fullscreen-leave-from .fullscreenImage {
        transform: scale(1);
        opacity: 1;
    }

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
    .img {
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
    .img.loaded {
        opacity: 1;
    }

    /* Spinner animation */
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
