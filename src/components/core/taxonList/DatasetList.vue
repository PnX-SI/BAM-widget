<script setup>
    import ParameterStore from '@/lib/parameterStore';
    import { computed } from 'vue';

    const { connector } = ParameterStore.getInstance();
    const props = defineProps({
        datasets: Array,
    });
    const sortedDatasets = computed(() => {
        if (!props.datasets) return [];
        return [...props.datasets].sort(
            (a, b) => b.nbObservations - a.nbObservations
        );
    });
</script>

<template>
    <BPopover
        v-if="props.datasets && props.datasets.length > 0"
        :close-on-hide="true"
        :delay="{ show: 0, hide: 0 }"
        style="z-index: 500"
    >
        <template #target>
            <a style="color: white; text-decoration: underline" class="ms-1"
                ><i class="bi bi-database-fill"></i
            ></a>
        </template>
        <h4>{{ sortedDatasets.length }} {{ $t('datasetList') }}</h4>
        <ul class="list-group datasetsList">
            <li v-for="dataset in sortedDatasets" class="list-group-item">
                <a
                    class="link-primary text-decoration-none"
                    target="_blank"
                    :href="connector.getDatasetUrl(dataset.uuid)"
                >
                    {{ dataset.name }}
                </a>
                <span class="badge bg-warning rounded-pill ms-1">
                    {{ dataset.nbObservations }}
                    {{
                        $t(
                            dataset.nbObservations > 1
                                ? 'observations'
                                : 'observation'
                        )
                    }}
                </span>
            </li>
        </ul>
    </BPopover>
</template>

<style>
    .datasetsList {
        height: 200px;
        overflow-y: scroll;
    }
</style>
