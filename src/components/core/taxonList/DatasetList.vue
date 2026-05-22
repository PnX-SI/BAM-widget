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
    <div
        v-if="props.datasets && props.datasets.length > 0"
        class="datasets-container"
    >
        <h4 class="datasets-title">
            {{ sortedDatasets.length }} {{ $t('datasetList') }}
        </h4>
        <ul class="datasets-list">
            <li v-for="dataset in sortedDatasets" class="dataset-item">
                <a
                    class="dataset-link"
                    target="_blank"
                    :href="connector.getDatasetUrl(dataset.uuid)"
                >
                    {{ dataset.name }}
                </a>
                <span class="observation-count">
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
    </div>
</template>

<style scoped>
    .datasets-container {
        width: 100%;
    }

    .datasets-title {
        font-size: 1em;
        margin-bottom: 12px;
        font-weight: 600;
        color: inherit;
    }

    .datasets-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 200px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .dataset-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: #f8f9fa;
        border-radius: 6px;
        gap: 12px;
        transition: background 0.2s ease;
    }

    .dataset-item:hover {
        background: #e9ecef;
    }

    .dataset-link {
        color: inherit;
        text-decoration: none;
        flex: 1;
        font-weight: 500;
        transition: opacity 0.2s ease;
    }

    .dataset-link:hover {
        opacity: 0.7;
        text-decoration: underline;
    }

    .observation-count {
        font-size: 0.85em;
        color: #6c757d;
        white-space: nowrap;
        font-weight: 500;
    }

    /* Custom scrollbar */
    .datasets-list::-webkit-scrollbar {
        width: 6px;
    }

    .datasets-list::-webkit-scrollbar-track {
        background: transparent;
    }

    .datasets-list::-webkit-scrollbar-thumb {
        background: #dee2e6;
        border-radius: 3px;
    }

    .datasets-list::-webkit-scrollbar-thumb:hover {
        background: #adb5bd;
    }

    @media (max-width: 500px) {
        .datasets-title {
            font-size: 0.9em;
            margin-bottom: 10px;
        }

        .dataset-item {
            padding: 8px 12px;
            font-size: 0.9em;
            gap: 8px;
        }

        .observation-count {
            font-size: 0.8em;
        }
    }
</style>
