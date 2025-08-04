<script setup>
    import { GbifConnector } from '@/lib/connectors/gbif';
    import { ref, watch } from 'vue';

    const typedSearch = ref('');
    const searchResults = ref([]);

    watch(typedSearch, (newVal) => {
        const connector = new GbifConnector({});
        connector
            .searchTaxon(typedSearch.value, {
                limit: 10,
                offset: 0,
            })
            .then((results) => {
                searchResults.value = results;
            });
    });
</script>

<template>
    <div class="input-group mb-3">
        <span class="input-group-text">{{ $t('taxon.taxonFilter') }}</span>
        <input
            type="text"
            class="form-control"
            v-model="typedSearch"
            list="my-list-id"
            data-testid="Name of taxon"
        />
    </div>
    <datalist id="my-list-id">
        <option v-for="species in searchResults" :key="species.taxonKey">
            {{ species.scientificName }}
        </option>
    </datalist>
</template>
