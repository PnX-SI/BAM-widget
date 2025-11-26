<script setup>
    import { ref, watch, nextTick } from 'vue';
    import { debounce } from 'lodash-es';
    import ParameterStore from '@/lib/parameterStore';

    // Store
    const { lang } = ParameterStore.getInstance();

    // Props
    const props = defineProps({
        placeholder: {
            type: String,
        },
        loadingText: {
            type: String,
        },
        errorText: {
            type: String,
        },
        noResultsText: {
            type: String,
        },
        maxResults: {
            type: Number,
            default: 5,
        },
        debounceDelay: {
            type: Number,
            default: 500,
        },
    });

    // Emits
    const emit = defineEmits(['location-selected']);

    // Reactive data
    const isFormVisible = ref(false);
    const searchQuery = ref('');
    const results = ref([]);
    const loading = ref(false);
    const error = ref(false);
    const showResults = ref(false);
    const searchInputRef = ref(null);

    // Debounced search function
    const debouncedSearch = debounce(() => {
        handleSearch();
    }, props.debounceDelay);

    // Methods
    function toggleForm() {
        isFormVisible.value = !isFormVisible.value;
        if (isFormVisible.value) {
            nextTick(() => {
                searchInputRef.value?.focus();
            });
        } else {
            closeForm();
        }
    }

    function handleBlur() {
        if (!searchQuery.value.trim() && !showResults.value) {
            setTimeout(() => {
                isFormVisible.value = false;
            }, 200);
        }
    }

    function closeForm() {
        isFormVisible.value = false;
        searchQuery.value = '';
        showResults.value = false;
        results.value = [];
        debouncedSearch.cancel();
    }

    async function handleSearch() {
        if (!searchQuery.value.trim()) return;

        loading.value = true;
        error.value = false;
        showResults.value = true;
        results.value = [];

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery.value
                )}&limit=${props.maxResults}&addressdetails=1&accept-language=${
                    lang.value
                }`,
                {
                    headers: {
                        'Accept-Language': lang.value,
                    },
                }
            );

            const data = await response.json();
            results.value = data;
        } catch (err) {
            error.value = true;
            console.error('Search error:', err);
        } finally {
            loading.value = false;
        }
    }

    function getLocationName(result) {
        return result.display_name.split(',')[0];
    }

    function selectLocation(location) {
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);

        emit('location-selected', {
            lat,
            lon,
            name: location.display_name,
            location,
        });

        closeForm();
    }

    defineExpose({
        clearResults: () => {
            showResults.value = false;
            results.value = [];
            debouncedSearch.cancel();
        },
        closeForm,
    });

    watch(searchQuery, (newValue) => {
        if (!newValue.trim()) {
            showResults.value = false;
            results.value = [];
            debouncedSearch.cancel();
            return;
        }

        // Lancer la recherche avec debounce
        debouncedSearch();
    });
</script>
<template>
    <div class="search-wrapper">
        <div class="search-container" :class="{ 'is-expanded': isFormVisible }">
            <button
                class="search-btn round-btn"
                @click="toggleForm"
                @mousedown.prevent
                type="button"
                :title="placeholder"
            >
                <i class="bi bi-search"></i>
            </button>

            <transition name="slide">
                <div v-if="isFormVisible" class="search-content">
                    <input
                        ref="searchInputRef"
                        type="text"
                        class="search-input"
                        v-model="searchQuery"
                        @keypress.enter="handleSearch"
                        @blur="handleBlur"
                        :placeholder="placeholder"
                        autocomplete="off"
                        v-prevent-zoom
                    />
                    <button
                        class="close-btn"
                        @click="closeForm"
                        @mousedown.prevent
                        type="button"
                    >
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </transition>
        </div>

        <!-- Résultats en dessous -->
        <transition name="results-fade">
            <div v-if="showResults && isFormVisible" class="results-dropdown">
                <div v-if="loading" class="loading">
                    {{ loadingText }}
                </div>
                <div v-else-if="error" class="error">
                    {{ errorText }}
                </div>
                <div v-else-if="results.length === 0" class="no-results">
                    {{ noResultsText }}
                </div>
                <div
                    v-else
                    v-for="result in results"
                    :key="result.place_id"
                    class="result-item"
                    @click="selectLocation(result)"
                >
                    <div class="result-name">{{ getLocationName(result) }}</div>
                    <div class="result-address">{{ result.display_name }}</div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
    .search-wrapper {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 500;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
    }

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

    .search-container.is-expanded {
        width: min(90vw, 200px);
    }

    .search-btn {
        background: #fff;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        font-size: 16px;
    }

    .search-content {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        gap: 8px;
    }

    .search-input {
        border: none;
        outline: none;
        flex: 1;
        margin-left: 10px;
        font-size: 14px;
        background: transparent;
        min-width: 0;
        color: #1a1a1a;
    }

    .search-input::placeholder {
        color: #999;
    }

    .close-btn {
        background: transparent;
        border: none;
        color: #999;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        font-size: 12px;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: #f5f5f5;
        color: #666;
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

    .results-dropdown {
        position: absolute;
        top: 50px;
        right: 0;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        max-height: 300px;
        overflow-y: auto;
        width: min(90vw, 200px);
    }

    .result-item {
        padding: 14px 16px;
        cursor: pointer;
        transition: background 0.2s ease;
        border-bottom: 1px solid #f5f5f5;
    }

    .result-item:last-child {
        border-bottom: none;
    }

    .result-item:hover {
        background: #f8f9ff;
    }

    .result-name {
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 4px;
        font-size: 14px;
    }

    .result-address {
        font-size: 12px;
        color: #666;
    }

    .loading,
    .no-results,
    .error {
        padding: 16px;
        text-align: center;
        font-size: 14px;
    }

    .loading {
        color: #666;
    }

    .no-results {
        color: #999;
    }

    .error {
        color: #e74c3c;
    }

    .results-fade-enter-active,
    .results-fade-leave-active {
        transition: all 0.3s ease;
    }

    .results-fade-enter-from {
        opacity: 0;
        transform: translateY(-10px);
    }

    .results-fade-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }

    .results-dropdown::-webkit-scrollbar {
        width: 6px;
    }

    .results-dropdown::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .results-dropdown::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
    }

    .results-dropdown::-webkit-scrollbar-thumb:hover {
        background: #999;
    }

    @media screen and (max-width: 576px) {
        .search-container.is-expanded {
            width: 70vw;
        }

        .results-dropdown {
            width: 70vw;
        }

        .search-input {
            font-size: 14px;
        }
    }
</style>
