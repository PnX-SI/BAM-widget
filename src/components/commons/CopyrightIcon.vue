<script setup lang="ts">
    import Credits from './Credits.vue';
    import { Media } from '@/lib/models';
    import { ref, onMounted, onBeforeUnmount } from 'vue';
    import copyrightIcon from '@/assets/images/copyright.svg';
    import FloatingTooltip from './FloatingTooltip.vue';

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
    const iconWrapper = ref<HTMLElement | null>(null);
    let hoverTimer: number | null = null;

    function toggleTooltip(event: Event) {
        event.stopPropagation();
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        showTooltip.value = !showTooltip.value;
    }

    function showTooltipHandler() {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }

        showTooltip.value = true;
    }

    function hideTooltipHandler() {
        hoverTimer = window.setTimeout(() => {
            showTooltip.value = false;
        }, 200);
    }

    function keepTooltipVisible() {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
    }

    function closeTooltip() {
        showTooltip.value = false;
    }

    onMounted(() => {
        window.addEventListener('click', closeTooltip);
    });

    onBeforeUnmount(() => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }
        window.removeEventListener('click', closeTooltip);
    });
</script>

<template>
    <div
        v-if="props.media?.source"
        ref="iconWrapper"
        class="copyright-icon-wrapper"
    >
        <div
            class="copyright-icon"
            :style="{ width: size + 'px', height: size + 'px' }"
            @click="toggleTooltip"
            @mouseenter="showTooltipHandler"
            @mouseleave="hideTooltipHandler"
        >
            <img :src="copyrightIcon" class="copyright-svg" alt="Copyright" />
        </div>

        <FloatingTooltip
            :show="showTooltip"
            :anchor="iconWrapper"
            @mouseenter="keepTooltipVisible"
            @mouseleave="hideTooltipHandler"
        >
            <Credits :media="props.media" link-color="link-light"></Credits>
        </FloatingTooltip>
    </div>
</template>

<style scoped>
    .copyright-icon-wrapper {
        display: inline-block;
        position: relative;
    }

    .copyright-icon {
        background-color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    .copyright-icon:hover {
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
    }

    .copyright-svg {
        width: 70%;
        height: 70%;
        filter: invert(0.4) brightness(0.8);
    }
</style>
