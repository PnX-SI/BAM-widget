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
        class="mode-btn"
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

<style scoped>
    /* Bouton arrondi avec ombre et effet hover */
    .mode-btn {
        background: #fff;
        border: none;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #afafaf;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        transition: all 0.3s ease;
        font-size: 1.2rem;
        padding: 2px;
    }

    .mode-btn i {
        border-radius: 50%;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .mode-btn i:hover {
        background: #efefef;
        transition: all 0.3s ease;
    }
</style>
