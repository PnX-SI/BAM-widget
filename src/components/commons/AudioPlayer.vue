<script setup lang="ts">
    import { Media } from '@/lib/models';
    import { ref, onBeforeUnmount } from 'vue';
    import Credits from './Credits.vue';

    const props = withDefaults(
        defineProps<{
            audio: Media;
            variant?: 'button' | 'player';
            size?: number;
            showCredits?: boolean;
        }>(),
        {
            variant: 'player',
            size: 20,
            showCredits: true,
        }
    );

    const play = ref(false);
    const progress = ref(0);
    const audioInstance = ref<HTMLAudioElement | null>(null);
    let animationFrameId: number | null = null;

    function updateProgress() {
        if (audioInstance.value && audioInstance.value.duration > 0) {
            progress.value =
                audioInstance.value.currentTime / audioInstance.value.duration;
        }
        if (play.value) {
            animationFrameId = requestAnimationFrame(updateProgress);
        }
    }

    function seekAudio(event: MouseEvent) {
        if (!audioInstance.value) return;

        const progressBar = event.currentTarget as HTMLElement;
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;

        if (audioInstance.value.duration > 0) {
            audioInstance.value.currentTime =
                percentage * audioInstance.value.duration;
            progress.value = percentage;
        }
    }

    function toggleAudio() {
        if (!audioInstance.value) {
            audioInstance.value = new Audio(props.audio.url);

            audioInstance.value.addEventListener('ended', () => {
                if (audioInstance.value) {
                    audioInstance.value.currentTime = 0;
                    progress.value = 0;
                    play.value = false;
                    if (animationFrameId)
                        cancelAnimationFrame(animationFrameId);
                }
            });

            audioInstance.value.addEventListener('pause', () => {
                audioInstance.value.currentTime = 0;
                progress.value = 0;
                play.value = false;
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
            });

            audioInstance.value.addEventListener('play', () => {
                play.value = true;
                updateProgress();
            });
        }

        play.value ? audioInstance.value.pause() : audioInstance.value.play();
    }

    onBeforeUnmount(() => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (audioInstance.value) {
            audioInstance.value.pause();
            audioInstance.value = null;
        }
    });
</script>

<template>
    <!-- Circular button variant -->
    <div
        v-if="variant === 'button'"
        class="audio-button-wrapper"
        :style="{ width: size + 'px', height: size + 'px' }"
    >
        <div
            class="audio-button"
            :style="{
                background: `
                conic-gradient(#efefef ${progress * 360}deg, #afafaf ${
                    progress * 360
                }deg)
                   
                    
                `,
                width: size + 'px',
                height: size + 'px',
            }"
            @click.stop="toggleAudio"
            data-testid="Toggle to play animal sound"
        >
            <i
                :class="play ? 'bi bi-pause-circle' : 'bi bi-play-circle'"
                :style="`font-size: ${size}px;`"
            ></i>
        </div>

        <div v-if="showCredits" class="tooltip">
            <Credits :media="audio" link-color="link-light" />
        </div>
    </div>

    <!-- Standard player variant -->
    <div v-else class="audio-player-wrapper">
        <div class="audio-player" data-testid="animal sound">
            <button @click="toggleAudio" class="play-button" type="button">
                <i :class="play ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
            </button>

            <div class="progress-bar" @click="seekAudio">
                <div
                    class="progress-fill"
                    :style="{ width: progress * 100 + '%' }"
                ></div>
            </div>
        </div>

        <Credits
            v-if="showCredits"
            class="small"
            link-color="text-muted"
            :media="audio"
        />
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
        transition: filter 0.15s linear;
    }

    .audio-button:hover {
        filter: brightness(1.1);
    }

    .audio-button i {
        color: white;
        z-index: 2;
        text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
    }

    /* Tooltip */
    .tooltip {
        position: absolute;
        bottom: 110%;
        left: 50%;
        transform: translateX(-50%);
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
    }

    .audio-button-wrapper:hover .tooltip {
        opacity: 1;
    }

    /* Player variant */
    .audio-player-wrapper {
        margin-top: 0.5rem;
        width: 100%;
    }

    .audio-player {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 0.375rem;
        border: 1px solid #dee2e6;
    }

    .play-button {
        background: #afafaf;
        border: none;
        color: white;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;
        flex-shrink: 0;
    }

    .play-button:hover {
        background: #bfbfbf;
    }

    .play-button i {
        font-size: 1.1rem;
    }

    .progress-bar {
        flex: 1;
        height: 0.5rem;
        background: #e9ecef;
        border-radius: 0.25rem;
        overflow: hidden;
        cursor: pointer;
    }

    .progress-bar:hover {
        height: 0.625rem;
    }

    .progress-fill {
        height: 100%;
        background: #afafaf;
        transition: width 0.1s linear;
    }
</style>
