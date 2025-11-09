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
            mode === 'gallery' ? $t('taxon.listMode') : $t('taxon.galleryMode')
        "
    >
        <transition name="icon-fade" mode="out-in">
            <i
                :key="mode"
                :class="
                    mode === 'gallery' ? 'fa-solid fa-list' : 'bi bi-grid-fill'
                "
            ></i>
        </transition>
    </button>
</template>

<style scoped>
    /* Bouton arrondi avec ombre et effet hover */
    .mode-btn {
        background: #fff;
        border: none;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #afafaf;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        font-size: 1.2rem;
    }

    .mode-btn:hover {
        background: #f0f4ff;
        transform: scale(1.05);
    }

    /* Transition fluide entre les icônes */
    .icon-fade-enter-from,
    .icon-fade-leave-to {
        opacity: 0;
        transform: scale(0.8) rotate(-10deg);
    }
    .icon-fade-enter-active,
    .icon-fade-leave-active {
        transition: all 0.25s ease;
    }
</style>
