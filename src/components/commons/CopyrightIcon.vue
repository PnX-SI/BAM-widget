<script setup lang="ts">
    import Credits from './Credits.vue';
    import { Media } from '@/lib/models';

    const props = withDefaults(
        defineProps<{
            media: Media;
            size?: number;
        }>(),
        {
            size: 32,
        }
    );
</script>

<template>
    <div v-if="props.media?.source" class="copyright-icon-wrapper">
        <div
            class="copyright-icon"
            :style="{ width: size + 'px', height: size + 'px' }"
        >
            <i class="bi bi-c-circle"></i>
        </div>
        <div class="copyright-tooltip">
            <Credits :media="props.media" link-color="link-light"></Credits>
        </div>
    </div>
</template>

<style scoped>
    .copyright-icon-wrapper {
        display: inline-block;
        position: relative;
    }

    .copyright-icon {
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .copyright-icon:hover {
        background-color: rgba(0, 0, 0, 0.7);
    }

    .copyright-icon i {
        color: white;
        font-size: 0.9rem;
    }

    .copyright-tooltip {
        position: absolute;
        bottom: 110%;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
        font-size: 0.8rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        z-index: 3;
    }

    .copyright-icon-wrapper:hover .copyright-tooltip {
        opacity: 1;
    }
</style>
