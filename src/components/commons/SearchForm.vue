<script setup>
    import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
    import { debounce } from 'lodash-es';

    const isActive = ref(false);
    const inputRef = ref(null);

    const toggleSearch = () => {
        isActive.value = !isActive.value;
        if (isActive.value) {
            nextTick(() => inputRef.value?.focus());
        } else {
            if (inputRef.value) inputRef.value.value = '';
        }
    };

    const handleBlur = () => {
        if (!searchString.value.trim()) {
            isActive.value = false;
        }
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
            @mousedown.prevent
            :title="$t('search')"
        >
            <i class="bi bi-search"></i>
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
                @blur="handleBlur"
                v-prevent-zoom
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
