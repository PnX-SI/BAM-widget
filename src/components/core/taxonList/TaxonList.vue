<script setup>
    import { ref, computed, watch } from 'vue';
    import sortArray from 'sort-array';
    import { useI18n } from 'vue-i18n';
    import SortBy from '@/components/commons/SortBy.vue';
    import SearchForm from '@/components/commons/SearchForm.vue';
    import TaxonView from './TaxonView.vue';
    import { TAXONLIST_DISPLAY_MODE } from '@/lib/enums';
    import TaxonClassFilterBadge from '@/components/commons/TaxonClassFilterBadge.vue';
    import ParameterStore from '@/lib/parameterStore';
    import { TaxonListManager } from './taxonListManager'; // ✅ ta classe importée

    const { t } = useI18n();
    const parameterStore = ParameterStore.getInstance();

    const {
        wkt,
        dateMin,
        dateMax,
        nbTaxonPerLine,
        showFilters,
        connector,
        mode,
        class: class_,
        nbDisplayedSpecies,
    } = parameterStore;

    const props = defineProps({
        nbTaxonPerLine: { type: Number },
        showFilters: { type: Boolean, default: true },
        sortBy: {
            type: String,
            default: 'nbObservations',
            validator: (value) =>
                [
                    'vernacularName',
                    'acceptedScientificName',
                    'nbObservations',
                    'lastSeenDate',
                ].includes(value),
        },
        order: {
            type: String,
            default: 'desc',
            validator: (value) => ['asc', 'desc'].includes(value),
        },
        mode: {
            type: String,
            validator: (value) =>
                Object.keys(TAXONLIST_DISPLAY_MODE).includes(value),
        },
    });

    nbTaxonPerLine.value = props.nbTaxonPerLine ?? nbTaxonPerLine.value;
    mode.value = props.mode ?? mode.value;

    // ✅ Instanciation du manager
    const taxonManager = new TaxonListManager(
        connector,
        {
            sortBy: props.sortBy,
            order: props.order,
            nbDisplayedSpecies: nbDisplayedSpecies,
        },
        {
            wkt,
            dateMin,
            dateMax,
            class: class_,
        },
        nbDisplayedSpecies
    );

    const {
        searchResult,
        filteredSpecies,
        searchString,
        filterClass,
        sortBy,
        orderBy,
        pageIndex,
        loadingObservations,
        loadingError,
    } = taxonManager;

    const speciesList = computed(() => searchResult.value.taxons);
    const datasets = computed(() => searchResult.value.datasets);

    const classNames = computed(() => {
        const row_cols_lg = nbTaxonPerLine.value;
        const row_cols_md = row_cols_lg === 1 ? 1 : Math.round(row_cols_lg / 2);
        const row_cols_sm = Math.round(row_cols_md / 2);
        return `row row-cols-${row_cols_sm} row-cols-lg-${row_cols_lg} row-cols-md-${row_cols_md} g-4`;
    });

    function onScroll(event) {
        taxonManager.onScroll(event);
    }

    watch([searchString, filterClass], () => {
        taxonManager.updateFilteredSpecies();
        pageIndex.value = 0;
    });

    watch([wkt, class_, dateMin, dateMax, connector], () => {
        searchResult.value = { taxons: [], datasets: [] };
        if (wkt.value) taxonManager.fetchSpeciesList(wkt.value);
    });

    if (wkt.value) {
        searchResult.value = { taxons: [], datasets: [] };
        taxonManager.fetchSpeciesList(wkt.value);
    }

    // Liste des tris disponibles
    const sortByAvailable = [
        { field_name: 'vernacularName', label: t('taxon.vernacularName') },
        {
            field_name: 'acceptedScientificName',
            label: t('taxon.scientificName'),
        },
        { field_name: 'nbObservations', label: t('taxon.nbObservations') },
        { field_name: 'lastSeenDate', label: t('taxon.lastSeenDate') },
    ];
</script>

<template>
    <div id="taxon-list" class="card">
        <div class="card-header" v-if="showFilters">
            <SearchForm
                @update:searchString="
                    (newSearchString) => (searchString = newSearchString)
                "
            />
            <SortBy
                :sort-by-available="sortByAvailable"
                @update:sortBy="(newSort) => (sortBy = newSort)"
                @update:orderBy="(newOrder) => (orderBy = newOrder)"
                :sortBy="sortBy"
                :orderBy="orderBy"
            />
        </div>
        <div class="card-body">
            <TaxonListMessages
                :loading-error="loadingError"
                :loading-observations="loadingObservations"
                :species-list="speciesList"
                :filter-species-list="filteredSpecies"
            ></TaxonListMessages>

            <div id="taxon-list-content" :class="classNames" @scroll="onScroll">
                <div class="filter-dropdown">
                    <TaxonClassFilterBadge
                        @select:class="(newClass) => (filterClass = newClass)"
                    ></TaxonClassFilterBadge>
                </div>
                <TaxonView
                    v-for="observation in taxonManager.speciesListShowed.value"
                    :key="observation.taxonId"
                    :taxon="observation"
                />
            </div>
        </div>
        <TaxonListFooter
            :loading-done="wkt.length && !loadingObservations"
            :number-of-species="speciesList.length"
            :datasets="datasets"
        ></TaxonListFooter>
    </div>
</template>

<style scoped>
    #taxon-list {
        padding: 0;
        height: 80vh;
        display: flex;
        flex-direction: column;
    }

    #taxon-list-content {
        overflow-y: scroll;
        overflow-x: hidden;
        padding: var(--bs-card-spacer-y) var(--bs-card-spacer-x);
    }

    .card-body {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 0 !important;
        position: relative;
    }

    .filter-dropdown {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 9999;
        width: max-content;
    }

    /* Style des boutons de mode */
    .filter-dropdown button {
        padding: 5px 10px;
        width: 40px !important;
    }
</style>
