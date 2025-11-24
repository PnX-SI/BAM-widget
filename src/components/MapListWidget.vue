<script setup>
    import { ref, computed, onMounted } from 'vue';
    // Components
    import TaxonList from '@/components/core/taxonList/TaxonList.vue';
    import Map from './core/map/Map.vue';
    import ParameterStore from '@/lib/parameterStore';
    const { isMobile } = ParameterStore.getInstance();
    const props = defineProps({
        height: {
            type: String,
            default: '100vh',
        },
    });
    const showMap = ref(true);
</script>
<template>
    <div class="container-fluid position-relative px-0">
        <!-- Desktop -->
        <div v-if="!isMobile" class="row g-0">
            <div class="col-12 col-lg-6 col-md-6 padding">
                <Map :height="props.height" />
            </div>
            <div class="col-12 col-lg-6 col-md-6 padding">
                <TaxonList :style="'height:' + props.height" />
            </div>
        </div>
        <!-- Mobile -->
        <div
            v-else
            class="mobile-container"
            v-prevent-zoom
            data-testid="Mobile map list widget"
        >
            <Map
                :height="'100svh'"
                v-show="showMap"
                v-on:update:wkt="(wkt) => (showMap = false)"
            />
            <TaxonList :height="'100svh'" v-show="!showMap" />

            <button
                class="toggle-btn"
                @click="showMap = !showMap"
                data-testid="Mobile map list toggle"
            >
                <i v-if="showMap" class="fa-solid fa-list"></i>
                <i v-else class="fa-solid fa-map"></i>
                {{ showMap ? 'Liste' : 'Carte' }}
            </button>
        </div>
    </div>
</template>
<style scoped>
    .mobile-container {
        height: 100svh !important;
    }
    .toggle-btn {
        position: fixed;
        bottom: 70px;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        color: #333;
        border: none;
        border-radius: 50px;
        padding: 10px 24px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        z-index: 430;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .toggle-btn:hover {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
    .toggle-btn:active {
        transform: translateX(-50%) scale(0.95);
    }
</style>
