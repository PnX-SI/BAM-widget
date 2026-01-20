<script setup lang="ts">
    import { ref, computed, watch } from 'vue';

    interface Props {
        isOpen: boolean;
        title: string;
        content: string;
    }

    const props = withDefaults(defineProps<Props>(), {
        isOpen: false,
        title: '',
        content: '',
    });

    const emit = defineEmits<{
        close: [];
    }>();

    const isVisible = ref(props.isOpen);

    watch(
        () => props.isOpen,
        (newValue) => {
            isVisible.value = newValue;
        }
    );

    const closeModal = () => {
        isVisible.value = false;
        emit('close');
    };

    const handleBackdropClick = (e: MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isVisible.value) {
            closeModal();
        }
    };
</script>

<template>
    <Teleport to="body">
        <transition name="modal-fade">
            <div
                v-if="isVisible"
                class="modal-overlay"
                @click="handleBackdropClick"
                @keydown="handleEscapeKey"
                tabindex="-1"
            >
                <div class="modal-content" @click.stop>
                    <!-- Header -->
                    <div class="modal-header">
                        <h5 class="modal-title">{{ props.title }}</h5>
                        <button
                            type="button"
                            class="close-button"
                            @click="closeModal"
                            aria-label="Close"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="modal-body">
                        <div
                            class="description-text"
                            v-html="props.content"
                        ></div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped>
    :root {
        --modal-bg-color: #ffffff;
        --modal-text-color: #333333;
        --modal-border-color: #f0f0f0;
        --modal-overlay-bg: rgba(0, 0, 0, 0.4);
        --modal-shadow-light: 0 1px 2px rgba(0, 0, 0, 0.04);
        --modal-shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.08);
        --modal-shadow-deep: 0 8px 24px rgba(0, 0, 0, 0.12);
        --modal-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1050;
        padding: 1rem;
    }

    .modal-content {
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(12px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Header */
    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid var(--modal-border-color);
        flex-shrink: 0;
    }

    .modal-title {
        font-size: 1.3rem;
        font-weight: 600;
        color: var(--modal-text-color);
        margin: 0;
        letter-spacing: -0.02em;
    }

    /* Close Button */
    .close-button {
        background: none;
        border: none;
        cursor: pointer;
        color: #999999;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: var(--modal-transition);
        margin: -0.5rem;
    }

    .close-button:hover {
        color: #666666;
        background-color: rgba(0, 0, 0, 0.04);
    }

    .close-button:active {
        color: #333333;
        background-color: rgba(0, 0, 0, 0.08);
    }

    /* Body */
    .modal-body {
        padding: 1.5rem;
        flex: 1;
        overflow-y: auto;
    }

    .description-text {
        color: var(--modal-text-color);
        line-height: 1.6;
        font-size: 0.95rem;
    }

    .description-text :deep(p) {
        margin-bottom: 1rem;
    }

    .description-text :deep(p:last-child) {
        margin-bottom: 0;
    }

    .description-text :deep(strong) {
        font-weight: 600;
        color: #222222;
    }

    .description-text :deep(em) {
        font-style: italic;
    }

    .description-text :deep(ul),
    .description-text :deep(ol) {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
    }

    .description-text :deep(li) {
        margin-bottom: 0.5rem;
    }

    .description-text :deep(a) {
        color: #0066cc;
        text-decoration: none;
        transition: var(--modal-transition);
    }

    .description-text :deep(a:hover) {
        text-decoration: underline;
        color: #0052a3;
    }

    /* Transitions */
    .modal-fade-enter-active,
    .modal-fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .modal-fade-enter-from,
    .modal-fade-leave-to {
        opacity: 0;
    }

    /* Scrollbar Styling */
    .modal-content::-webkit-scrollbar {
        width: 6px;
    }

    .modal-content::-webkit-scrollbar-track {
        background: transparent;
    }

    .modal-content::-webkit-scrollbar-thumb {
        background-color: #d0d0d0;
        border-radius: 3px;
    }

    .modal-content::-webkit-scrollbar-thumb:hover {
        background-color: #b0b0b0;
    }

    /* Responsive Design */
    @media (max-width: 640px) {
        .modal-overlay {
            padding: 0.5rem;
        }

        .modal-content {
            max-height: 90vh;
            border-radius: 8px;
        }

        .modal-header {
            padding: 1rem;
        }

        .modal-title {
            font-size: 1.1rem;
        }

        .modal-body {
            padding: 1rem;
        }

        .description-text {
            font-size: 0.9rem;
        }
    }
</style>
