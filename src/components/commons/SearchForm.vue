<script setup>
    import { ref, nextTick } from 'vue';
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
        <button class="search-btn" type="button" @click="toggleSearch">
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
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 2px;
        width: 44px;
        height: 44px;
        overflow: hidden;
        transition: width 0.4s ease;
    }

    /* When input is active, allow it to expand naturally up to max-width */
    .search-container:has(input) {
        width: min(90%, 250px);
    }

    /* Button */
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
        min-width: 0; /* Important for flexbox on small screens */
    }

    /* Slide transition */
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

    /* Responsive adjustments */
    @media (max-width: 500px) {
        .search-container:has(input) {
            width: 80%;
        }
        .search-input {
            font-size: 14px;
        }
    }
</style>
