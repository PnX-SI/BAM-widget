<script setup lang="ts">
    import { ref } from 'vue';

    const props = defineProps({
        imageUrl: {
            type: String,
            required: true,
        },
        alt: String,
        ariaLabel: String,
        testID: String,
    });

    const isFullscreen = ref(false);

    function open() {
        isFullscreen.value = true;
    }

    function close() {
        isFullscreen.value = false;
    }

    defineExpose({ open });
</script>

<template>
    <div @click="open">
        <slot></slot>
    </div>

    <Transition name="fullscreen">
        <div
            v-if="isFullscreen"
            class="fullScreenContainer"
            @click.stop="close"
        >
            <button
                class="close-button"
                @click.stop="close"
                aria-label="Close fullscreen"
            >
                <i class="bi bi-x-lg"></i>
            </button>
            <img
                :src="imageUrl"
                :alt="alt"
                :aria-label="ariaLabel"
                :data-testid="testID"
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
        z-index: 1001;
    }

    .close-button:hover {
        opacity: 0.8;
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

    /* Transitions for fullscreen */
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
</style>
