<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';

    const props = withDefaults(
        defineProps<{
            click?: boolean;
            closeOnHide?: boolean;
            delay?: { show: number; hide: number };
        }>(),
        {
            click: true,
            closeOnHide: true,
            delay: () => ({ show: 0, hide: 0 }),
        }
    );

    const isOpen = ref(false);
    const popoverRef = ref<HTMLElement | null>(null);
    const targetRef = ref<HTMLElement | null>(null);

    const toggle = (event: Event) => {
        event.stopPropagation();
        isOpen.value = !isOpen.value;
    };

    const close = () => {
        if (props.closeOnHide) {
            isOpen.value = false;
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            popoverRef.value &&
            targetRef.value &&
            !popoverRef.value.contains(event.target as Node) &&
            !targetRef.value.contains(event.target as Node)
        ) {
            close();
        }
    };

    onMounted(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside);
    });
</script>

<template>
    <div class="custom-popover-wrapper">
        <div ref="targetRef" @click="toggle" class="popover-target">
            <slot name="target"></slot>
        </div>

        <Transition name="popover-fade">
            <div
                v-if="isOpen"
                ref="popoverRef"
                class="custom-popover"
                @click.stop
            >
                <slot></slot>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
    .custom-popover-wrapper {
        position: relative;
        display: inline-block;
    }

    .popover-target {
        cursor: pointer;
    }

    .custom-popover {
        position: absolute;
        bottom: 100%;
        right: 0;
        margin-bottom: 8px;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 0.375rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        padding: 0.5rem 0.75rem;
        z-index: 1060;
        min-width: 200px;
        max-width: 276px;
    }

    .popover-fade-enter-active,
    .popover-fade-leave-active {
        transition: opacity 0.15s ease;
    }

    .popover-fade-enter-from,
    .popover-fade-leave-to {
        opacity: 0;
    }
</style>
