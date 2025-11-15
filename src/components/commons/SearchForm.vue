<script setup>
    import { ref, nextTick, onMounted, onUnmounted } from 'vue';
    import { debounce } from 'lodash-es';

    const isActive = ref(false);
    const inputRef = ref(null);
    const originalViewport = ref('');

    onMounted(() => {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            originalViewport.value = viewportMeta.getAttribute('content') || '';
        }
    });

    onUnmounted(() => {
        restoreViewport();
    });

    const preventZoom = () => {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.setAttribute(
                'content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
        }
    };

    const restoreViewport = () => {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta && originalViewport.value) {
            viewportMeta.setAttribute('content', originalViewport.value);
        } else if (viewportMeta) {
            viewportMeta.setAttribute(
                'content',
                'width=device-width, initial-scale=1.0'
            );
        }
    };

    const toggleSearch = () => {
        isActive.value = !isActive.value;
        if (isActive.value) {
            preventZoom();
            nextTick(() => inputRef.value?.focus());
        } else {
            if (inputRef.value) inputRef.value.value = '';
            restoreViewport();
        }
    };

    const handleBlur = () => {
        restoreViewport();

        if (!searchString.value.trim()) {
            isActive.value = false;
        }
    };

    const handleFocus = () => {
        preventZoom();
    };

    const searchString = ref('');
    const emit = defineEmits(['update:searchString']);

    const emitSearch = debounce(() => {
        emit('update:searchString', searchString.value);
    }, 500);

    const handleInput = () => {
        emitSearch();
    };
</script>

<template>
    <form class="search-container" @submit.prevent>
        <button
            class="search-btn"
            type="button"
            @click="toggleSearch"
            :title="$t('search')"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
            >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        </button>
        <transition name="slide">
            <input
                v-if="isActive"
                ref="inputRef"
                type="text"
                class="search-input"
                :placeholder="$t('search')"
                v-model="searchString"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
            />
        </transition>
    </form>
</template>

<style scoped>
    .search-container {
        display: flex;
        align-items: center;
        background: white;
        border-radius: 50px;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        padding: 2px;
        width: 44px;
        height: 44px;
        overflow: hidden;
        transition: width 0.4s ease;
    }

    .search-container:has(input) {
        width: min(90%, 250px);
    }

    .search-btn {
        background: #fff;
        border: none;
        color: #cfcfcf;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.3s;
        flex-shrink: 0;
    }

    .search-btn:hover {
        background: #efefef;
    }

    .search-input {
        border: none;
        outline: none;
        flex: 1;
        margin-left: 10px;
        font-size: 16px;
        background: transparent;
        min-width: 0;
    }

    .slide-enter-from {
        opacity: 0;
        transform: translateX(-20px);
    }

    .slide-enter-active {
        transition: all 0.4s ease;
    }

    .slide-enter-to {
        opacity: 1;
        transform: translateX(0);
    }

    .slide-leave-from {
        opacity: 1;
        transform: translateX(0);
    }

    .slide-leave-active {
        transition: all 0.3s ease;
    }

    .slide-leave-to {
        opacity: 0;
        transform: translateX(-20px);
    }

    .search-btn svg {
        width: 18px;
        height: 18px;
    }

    @media (max-width: 500px) {
        .search-container:has(input) {
            width: 80%;
        }
        .search-input {
            font-size: 14px;
        }
    }
</style>
