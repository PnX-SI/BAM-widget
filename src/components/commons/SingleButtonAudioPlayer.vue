<script setup lang="ts">
    import { Media } from '@/lib/models';
    import { ref, onMounted, onBeforeUnmount } from 'vue';
    import Credits from './Credits.vue';

    const props = defineProps<{
        audio: Media;
        size?: number;
    }>();

    const SIZE = props.size ?? 20;
    const play = ref(false);
    const progress = ref(0);

    const audio = new Audio(props.audio.url);
    let animationFrameId: number | null = null;

    function updateProgress() {
        if (audio.duration > 0) {
            progress.value = audio.currentTime / audio.duration;
        }
        if (play.value) {
            animationFrameId = requestAnimationFrame(updateProgress);
        }
    }

    function toggleAudio() {
        if (play.value) {
            audio.pause();
            play.value = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        } else {
            audio.play();
            play.value = true;
            updateProgress();
        }
    }

    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        progress.value = 0;
        play.value = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    });

    onBeforeUnmount(() => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    });
</script>

<template>
    <div
        class="audio-button-wrapper"
        :style="{ width: SIZE + 'px', height: SIZE + 'px' }"
    >
        <div
            class="audio-button"
            :style="{
                background: `conic-gradient(white ${
                    progress * 360
                }deg, rgba(255,255,255,0.2) 0deg)`,
                width: SIZE + 'px',
                height: SIZE + 'px',
            }"
            @click="toggleAudio"
            data-testid="Toggle to play animal sound"
        >
            <i
                :class="play ? 'bi bi-pause-circle' : 'bi bi-play-circle'"
                :style="`font-size: ${SIZE}px;`"
            ></i>
        </div>
        <div class="tooltip">
            <Credits :media="props.audio" link-color="link-light" />
        </div>
    </div>
</template>

<style scoped>
    .audio-button-wrapper {
        position: relative;
        display: inline-block;
    }

    .audio-button {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.1s linear;
    }

    .audio-button i {
        color: white;
        z-index: 2;
        text-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
    }

    .tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;

        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
        font-size: 0.8rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        z-index: 2;
        transform: translateY(-3px) translateX(-5px);
    }

    .audio-button-wrapper:hover .tooltip {
        opacity: 1;
    }
</style>
