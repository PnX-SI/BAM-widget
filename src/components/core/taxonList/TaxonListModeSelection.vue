<script setup>
    import ParameterStore from '@/lib/parameterStore';
    import { TAXONLIST_DISPLAY_MODE } from '@/lib/enums';

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
    <button
        v-if="hybridTaxonList"
        class="round-btn"
        @click="toggleMode"
        :title="
            mode === 'gallery'
                ? $t('mode.detailedList')
                : $t('mode.galleryMode')
        "
    >
        <i
            :key="mode"
            :class="mode === 'gallery' ? 'fa-solid fa-list' : 'bi bi-grid-fill'"
        ></i>
    </button>
</template>
