<script setup>
    import ParameterStore from '@/lib/parameterStore';
    const parameterStore = ParameterStore.getInstance();
    const { hybridTaxonList, mode } = parameterStore;

    function toggleMode() {
        mode.value =
            mode.value === TAXONLIST_DISPLAY_MODE.gallery
                ? TAXONLIST_DISPLAY_MODE.detailedList
                : TAXONLIST_DISPLAY_MODE.gallery;
    }
</script>

<template>
    <div class="justify-content-center mode-dropdown" v-if="hybridTaxonList">
        <button class="btn btn-secondary" @click="toggleMode()">
            <i v-if="mode === 'gallery'" class="fa-solid fa-list"></i>
            <i v-else class="bi bi-grid-fill"></i>
        </button>
    </div>
</template>

<style>
    .mode-dropdown {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 9999;
        width: max-content;
    }
</style>
