<script setup>
    import TaxonList from '@/components/core/taxonList/TaxonList.vue';
    import Map from './core/map/Map.vue';
    import { computed, ref } from 'vue';

    const props = defineProps({
        height: {
            type: String,
            default: '100vh',
        },
    });

    const windowWidth = ref(window.innerWidth);

    const showMap = ref(false);

    const isMobile = computed(() => {
        return windowWidth.value <= 768;
    });

    function onResize() {
        windowWidth.value = window.innerWidth;
    }

    window.addEventListener('resize', onResize);
</script>

<template>
    <div class="container-fluid position-relative">
        <!-- Bouton visible seulement sur mobile -->
        <button
            class="btn btn-primary d-lg-none d-md-none position-fixed"
            style="
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
            "
            @click="showMap = !showMap"
        >
            {{ showMap ? 'Voir la liste' : 'Voir la carte' }}
        </button>

        <div class="row">
            <!-- Carte -->
            <div class="col-12 col-lg-6 col-md-6" v-show="showMap || !isMobile">
                <Map
                    :height="isMobile ? '100vh !important' : props.height"
                    @update-geom="() => (showMap = false)"
                />
            </div>

            <!-- Liste -->
            <div
                class="col-12 col-lg-6 col-md-6"
                v-show="!showMap || !isMobile"
            >
                <TaxonList :style="'height:' + props.height" />
            </div>
        </div>
    </div>
</template>
