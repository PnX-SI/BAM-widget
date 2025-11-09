<script setup>
    import ParameterStore from '@/lib/parameterStore';
    import DatasetList from './DatasetList.vue';
    const parameterStore = ParameterStore.getInstance();
    const { connector } = parameterStore;

    const props = defineProps({
        loadingDone: {
            type: Boolean,
        },
        numberOfSpecies: {
            type: Number,
        },
        datasets: {
            type: Array,
        },
    });
</script>

<template>
    <div id="data-source-credits" class="text-center">
        <div v-if="props.loadingDone">
            <a
                href="https://si.ecrins-parcnational.com/blog/2025-08-BAM-widget-en.html"
                target="_blank"
            >
                <img
                    src="https://geonature.fr/documents/autres/BAM/BAM-logo.png"
                    height="30px"
                    class="me-1"
                />
            </a>
            <strong
                >{{ props.numberOfSpecies }}
                {{ $t('taxon.taxonFound') }}</strong
            >
            {{ $t('in') }}
            <a
                :href="connector.getSourceUrl()"
                target="_blank"
                style="color: white; text-decoration: underline"
            >
                {{ connector.name }}
            </a>
            <BTooltip v-if="connector.sourceDetailMessage()">
                <template #target>
                    <a
                        style="color: white; text-decoration: underline"
                        class="ms-1"
                    >
                        <i class="bi bi-info-circle"></i>
                    </a>
                </template>
                {{ connector.sourceDetailMessage() }}
            </BTooltip>
            <DatasetList
                v-if="props.datasets.length > 0"
                :datasets="props.datasets"
            ></DatasetList>
        </div>
    </div>
</template>

<style>
    #data-source-credits {
        text-align: center;
        background: #aaa;
        color: white;
        border-radius: 0px 0px 5px 5px;
    }
</style>
