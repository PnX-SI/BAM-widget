<script setup>
    import TaxonList from '@/components/core/taxonList/TaxonList.vue';
    import ParameterStore from '@/lib/parameterStore';
    const config = ParameterStore.getInstance();

    const props = defineProps({
        height: {
            type: String,
            default: '100vh',
        },
    });
</script>

<template>
    <div>
        <div v-if="config.wkt.value.length > 0">
            <TaxonList :style="'height:' + props.height" />
        </div>
        <div v-else>
            <h2 class="col-12 text-center m-3">Aucune géométrie fournie !</h2>
        </div>
    </div>
</template>
