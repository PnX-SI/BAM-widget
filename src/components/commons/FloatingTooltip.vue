<script setup lang="ts">
    import {
        computed,
        nextTick,
        onBeforeUnmount,
        onMounted,
        ref,
        watch,
    } from 'vue';

    const props = withDefaults(
        defineProps<{
            show: boolean;
            anchor: HTMLElement | null;
            offset?: number;
            viewportPadding?: number;
            zIndex?: number;
            textColor?: string;
            backgroundColor?: string;
        }>(),
        {
            offset: 8,
            viewportPadding: 8,
            zIndex: 2000,
            textColor: '#999',
            backgroundColor: '#fff',
        }
    );

    const emit = defineEmits<{
        (e: 'mouseenter'): void;
        (e: 'mouseleave'): void;
    }>();

    const tooltipElement = ref<HTMLElement | null>(null);
    const placement = ref<'top' | 'bottom'>('top');
    const tooltipStyle = ref<Record<string, string>>({});

    const resolvedStyle = computed(() => ({
        ...tooltipStyle.value,
        zIndex: String(props.zIndex),
    }));

    async function updatePosition() {
        if (!props.show || !props.anchor) return;

        await nextTick();

        if (!tooltipElement.value) return;

        const rect = props.anchor.getBoundingClientRect();
        const tooltipWidth = tooltipElement.value.offsetWidth;
        const tooltipHeight = tooltipElement.value.offsetHeight;
        const centerX = rect.left + rect.width / 2;
        const minLeft = tooltipWidth / 2 + props.viewportPadding;
        const maxLeft =
            window.innerWidth - tooltipWidth / 2 - props.viewportPadding;
        const left = Math.min(Math.max(centerX, minLeft), maxLeft);
        const showBelow = rect.top < tooltipHeight + props.viewportPadding * 2;

        placement.value = showBelow ? 'bottom' : 'top';
        tooltipStyle.value = {
            left: `${left}px`,
            top: showBelow
                ? `${rect.bottom + props.offset}px`
                : `${rect.top - props.offset}px`,
            transform: showBelow
                ? 'translateX(-50%)'
                : 'translate(-50%, -100%)',
        };
    }

    function handleViewportChange() {
        if (props.show) {
            updatePosition();
        }
    }

    watch(() => props.show, handleViewportChange);
    watch(() => props.anchor, handleViewportChange);

    onMounted(() => {
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);
        handleViewportChange();
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('scroll', handleViewportChange, true);
    });
</script>

<template>
    <Teleport to="body">
        <div
            v-show="show"
            ref="tooltipElement"
            class="floating-tooltip"
            :class="{
                active: show,
                'tooltip-below': placement === 'bottom',
            }"
            :style="resolvedStyle"
            @click.stop
            @mouseenter="emit('mouseenter')"
            @mouseleave="emit('mouseleave')"
        >
            <slot></slot>
        </div>
    </Teleport>
</template>

<style scoped>
    .floating-tooltip {
        position: fixed;
        top: 0;
        left: 0;
        background: v-bind('backgroundColor') !important;
        color: v-bind('textColor') !important;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.85rem;
        white-space: pre-line;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        text-align: center;
    }

    .floating-tooltip.active {
        opacity: 1;
        pointer-events: auto;
        cursor: default;
    }

    .floating-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        border: 5px solid transparent;
        transform: translateX(-50%);
    }

    .tooltip-below::after {
        top: auto;
        bottom: 100%;
        border-top-color: transparent;
    }
</style>
