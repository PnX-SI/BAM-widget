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
    <div class="container-fluid position-relative">
        <!-- Desktop / Tablette : affichage côte à côte -->
        <div v-if="!isMobile" class="row">
            <div class="col-12 col-lg-6 col-md-6">
                <Map :height="props.height" />
            </div>
            <div class="col-12 col-lg-6 col-md-6">
                <TaxonList :style="'height:' + props.height" />
            </div>
        </div>

        <!-- Mobile : affichage switchable -->
        <div v-else class="mobile-container">
            <Map
                :height="'100vh !important'"
                v-show="showMap"
                v-on:update:wkt="(wkt) => (showMap = false)"
            />
            <TaxonList :height="'100vh !important'" v-show="!showMap" />

            <!-- Bouton flottant -->
            <button class="toggle-btn" @click="showMap = !showMap">
                <i v-if="showMap" class="fa-solid fa-list"></i>
                <i v-else class="fa-solid fa-map"></i>
                {{ showMap ? 'Liste' : 'Carte' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
    .mobile-container {
        height: 100vh;
    }

    .toggle-btn {
        position: fixed;
        bottom: 20px;
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
        z-index: 20000;
    }

    .toggle-btn:hover {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
</style>
