<script setup>
    import { computed, ref, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import SortBy from '@/components/commons/SortBy.vue';
    import SearchForm from '@/components/commons/SearchForm.vue';
    import sortArray from 'sort-array';
    import ParameterStore from '@/lib/parameterStore';
    import TaxonView from './TaxonView.vue';
    import { TAXONLIST_DISPLAY_MODE } from '@/lib/enums';
    import TaxonClassFilterBadge from '@/components/commons/TaxonClassFilterBadge.vue';

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

    const searchResult = ref({ taxonList: [], datasets: [] });
    const speciesList = computed(() => searchResult.value.taxons);
    const datasets = computed(() => searchResult.value.datasets);
    const loadingObservations = ref(false);
    const loadingError = ref(false);
    const pageIndex = ref(0);

    const filterClass = ref(null);
    const searchString = ref('');
    const filteredSpecies = ref([]);

    const sortBy = ref(props.sortBy || 'lastSeenDate');
    const orderBy = ref(props.order || 'desc');

    const sortByAvailable = [
        { field_name: 'vernacularName', label: t('taxon.vernacularName') },
        {
            field_name: 'acceptedScientificName',
            label: t('taxon.scientificName'),
        },
        { field_name: 'nbObservations', label: t('taxon.nbObservations') },
        { field_name: 'lastSeenDate', label: t('taxon.lastSeenDate') },
    ];

    const classNames = computed(() => {
        const row_cols_lg = nbTaxonPerLine.value;
        const row_cols_md = row_cols_lg === 1 ? 1 : Math.round(row_cols_lg / 2);
        const row_cols_sm = Math.round(row_cols_md / 2);
        return `row row-cols-${row_cols_sm} row-cols-lg-${row_cols_lg} row-cols-md-${row_cols_md} g-4`;
    });

    /**
     * Updates the filtered species list based on the search string and the filter class.
     * If the search string is not empty and the connector supports search on API, it will fetch the search results from the API and apply the filters.
     * Otherwise, it will apply the filters directly to the search result.
     */
    function updateFilteredSpecies() {
        const result = searchResult.value.taxons;
        if (!result) {
            filteredSpecies.value = [];
            return;
        }

        const applyFilters = (list, data = []) => {
            let filtered = list;

            // Filtrage par texte
            if (searchString.value) {
                filtered = filtered.filter(
                    (taxon) =>
                        connector.value.scoringSearchClass.getScore(
                            taxon,
                            searchString.value,
                            data
                        ) > 0
                );
            }
            // Filtrage par classe
            if (filterClass.value) {
                filtered = filtered.filter(
                    (taxon) => taxon.class === filterClass.value
                );
            }

            filteredSpecies.value = filtered;
        };

        if (searchString.value && connector.value.isSearchOnAPIAvailable) {
            connector.value
                .searchOnAPI(searchString.value)
                .then((data) => applyFilters(result, data))
                .catch(() => applyFilters(result));
        } else {
            applyFilters(result);
        }
    }

    const speciesListShowed = computed(() => {
        if (!filteredSpecies.value.length) return [];

        let arrayToSort = [...filteredSpecies.value];
        if (searchString.value === '') {
            arrayToSort = sortArray(arrayToSort, {
                by: sortBy.value,
                order: orderBy.value,
            });
        }
        if (nbDisplayedSpecies.value && nbDisplayedSpecies.value > 0) {
            arrayToSort.slice(0, nbDisplayedSpecies.value);
        }
        return arrayToSort.slice(0, (pageIndex.value + 1) * 20);
    });

    function fetchSpeciesList(wktParam) {
        if (!wktParam.length) return;
        loadingObservations.value = true;
        loadingError.value = false;
        connector.value
            .fetchOccurrence({
                geometry: wktParam,
                dateMin: dateMin.value,
                dateMax: dateMax.value,
                class: class_.value,
            })
            .then((response) => {
                searchResult.value = response;
                loadingObservations.value = false;
                pageIndex.value = 0;
            })
            .catch(() => {
                loadingObservations.value = false;
                loadingError.value = true;
            });
    }

    function onScroll(event) {
        const { scrollTop, clientHeight, scrollHeight } = event.target;
        const threshold = 50;
        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            pageIndex.value++;
        }
    }
    watch([searchString, filterClass, searchResult], () => {
        updateFilteredSpecies();
        pageIndex.value = 0;
    });

    watch([wkt, class_, dateMin, dateMax, connector], () => {
        searchResult.value = { taxons: [], datasets: [] };
        if (wkt.value) fetchSpeciesList(wkt.value);
    });

    if (wkt.value) {
        searchResult.value = { taxons: [], datasets: [] };
        fetchSpeciesList(wkt.value);
    }
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
                <BTooltip>
                    <template #target>
                        <TaxonListModeSelection></TaxonListModeSelection>
                    </template>
                    {{ $t('TaxonListModeSelection') }}
                </BTooltip>
                <div class="filter-dropdown">
                    <TaxonClassFilterBadge
                        @select:class="(newClass) => (filterClass = newClass)"
                    ></TaxonClassFilterBadge>
                </div>
                <TaxonView
                    v-for="observation in speciesListShowed"
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

    /* Style des boutons de mode (si nécessaire) */
    .filter-dropdown button {
        padding: 5px 10px;
        width: 40px !important;
    }
</style>
