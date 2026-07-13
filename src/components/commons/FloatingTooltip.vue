<script setup lang="ts">
    import {
        computed,
        nextTick,
        onBeforeUnmount,
        onMounted,
        ref,
        unref,
        watch,
    } from 'vue';
    import ParameterStore from '@/lib/parameterStore';

    const parameterStore = ParameterStore.getInstance();
    const { isMobile } = parameterStore;

    const props = withDefaults(
        defineProps<{
            show: boolean;
            anchor: HTMLElement | null;
            trigger?: 'hover' | 'click';
            hoverHideDelay?: number;
            offset?: number;
            viewportPadding?: number;
            zIndex?: number;
            textColor?: string;
            backgroundColor?: string;
        }>(),
        {
            trigger: 'hover',
            hoverHideDelay: 300,
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
        (e: 'update:show', value: boolean): void;
    }>();

    const tooltipElement = ref<HTMLElement | null>(null);
    const placement = ref<'top' | 'bottom'>('top');
    const tooltipStyle = ref<Record<string, string>>({});
    const isVisible = ref(props.show);

    let hideTimeout: ReturnType<typeof setTimeout> | null = null;

    const effectiveTrigger = computed(() =>
        unref(isMobile) ? 'click' : props.trigger
    );

    const resolvedStyle = computed(() => ({
        ...tooltipStyle.value,
        zIndex: String(props.zIndex),
    }));

    function clearHideTimeout() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }

    function setVisible(value: boolean) {
        if (isVisible.value === value) return;
        isVisible.value = value;
        emit('update:show', value);
    }

    function scheduleHide() {
        clearHideTimeout();
        hideTimeout = setTimeout(() => {
            setVisible(false);
        }, props.hoverHideDelay);
    }

    function handleAnchorClick(event: MouseEvent) {
        if (effectiveTrigger.value !== 'click') return;
        event.stopPropagation();
        setVisible(!isVisible.value);
    }

    function handleAnchorMouseEnter() {
        if (effectiveTrigger.value !== 'hover') return;
        clearHideTimeout();
        setVisible(true);
    }

    function handleAnchorMouseLeave() {
        if (effectiveTrigger.value !== 'hover') return;
        scheduleHide();
    }

    function handleTooltipMouseEnter() {
        if (effectiveTrigger.value === 'hover') {
            clearHideTimeout();
        }
        emit('mouseenter');
    }

    function handleTooltipMouseLeave() {
        if (effectiveTrigger.value === 'hover') {
            scheduleHide();
        }
        emit('mouseleave');
    }

    function handleDocumentClick(event: MouseEvent) {
        if (effectiveTrigger.value !== 'click' || !isVisible.value) return;

        const target = event.target as Node;
        const clickedAnchor = props.anchor?.contains(target);
        const clickedTooltip = tooltipElement.value?.contains(target);

        if (!clickedAnchor && !clickedTooltip) {
            setVisible(false);
        }
    }

    async function updatePosition() {
        if (!isVisible.value || !props.anchor) return;

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
        if (isVisible.value) {
            updatePosition();
        }
    }

    function attachAnchorListeners(el: HTMLElement) {
        el.addEventListener('click', handleAnchorClick);
        el.addEventListener('mouseenter', handleAnchorMouseEnter);
        el.addEventListener('mouseleave', handleAnchorMouseLeave);
    }

    function detachAnchorListeners(el: HTMLElement) {
        el.removeEventListener('click', handleAnchorClick);
        el.removeEventListener('mouseenter', handleAnchorMouseEnter);
        el.removeEventListener('mouseleave', handleAnchorMouseLeave);
    }

    watch(
        () => props.anchor,
        (newAnchor, oldAnchor) => {
            if (oldAnchor) detachAnchorListeners(oldAnchor);
            if (newAnchor) attachAnchorListeners(newAnchor);
            handleViewportChange();
        }
    );

    watch(
        () => props.show,
        (value) => {
            isVisible.value = value;
        }
    );

    watch(isVisible, () => {
        handleViewportChange();
    });

    onMounted(() => {
        if (props.anchor) attachAnchorListeners(props.anchor);
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);
        document.addEventListener('click', handleDocumentClick, true);
        handleViewportChange();
    });

    onBeforeUnmount(() => {
        if (props.anchor) detachAnchorListeners(props.anchor);
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('scroll', handleViewportChange, true);
        document.removeEventListener('click', handleDocumentClick, true);
        clearHideTimeout();
    });
</script>

<template>
    <Teleport to="body">
        <div
            v-show="isVisible"
            ref="tooltipElement"
            class="floating-tooltip"
            :class="{
                active: isVisible,
                'tooltip-below': placement === 'bottom',
            }"
            :style="resolvedStyle"
            @click.stop
            @mouseenter="handleTooltipMouseEnter"
            @mouseleave="handleTooltipMouseLeave"
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
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
