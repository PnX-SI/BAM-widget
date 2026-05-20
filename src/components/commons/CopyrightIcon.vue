<script setup lang="ts">
    import Credits from './Credits.vue';
    import { Media } from '@/lib/models';
    import { ref, onMounted, onBeforeUnmount } from 'vue';

    const props = withDefaults(
        defineProps<{
            media: Media;
            size?: number;
        }>(),
        {
            size: 32,
        }
    );

    const showTooltip = ref(false);

    function toggleTooltip(event: Event) {
        event.stopPropagation();
        showTooltip.value = !showTooltip.value;
    }

    function closeTooltip() {
        showTooltip.value = false;
    }

    onMounted(() => {
        window.addEventListener('click', closeTooltip);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('click', closeTooltip);
    });
</script>

<template>
    <div v-if="props.media?.source" class="copyright-icon-wrapper">
        <div
            class="copyright-icon"
            :style="{ width: size + 'px', height: size + 'px' }"
            @click="toggleTooltip"
        >
            <i class="bi bi-c-circle"></i>
        </div>
        <div
            class="copyright-tooltip"
            :class="{ active: showTooltip }"
            @click.stop
        >
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

    /* Invisible bridge to prevent tooltip from disappearing */
    .copyright-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        height: 10px;
    }

    .copyright-icon-wrapper:hover .copyright-tooltip,
    .copyright-tooltip:hover {
        opacity: 1;
        pointer-events: auto;
    }

    /* Active state for mobile/touch */
    .copyright-tooltip.active {
        opacity: 1;
        pointer-events: auto;
    }
</style>
