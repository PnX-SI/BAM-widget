<script setup>
    // Components
    import TaxonList from '@/components/core/taxonList/TaxonList.vue';
    import Map from './core/map/Map.vue';

    const props = defineProps({
        height: {
            type: String,
            default: '100vh',
        },
    });
</script>

<template>
    <div class="container-fluid p-2">
        <div class="row">
            <div class="col-12 col-lg-6 col-md-6">
                <Map :height="props.height" />
            </div>
            <div class="col-12 col-lg-6 col-md-6">
                <TaxonList :style="'height:' + props.height" />
            </div>
        </div>
    </div>
</template>
