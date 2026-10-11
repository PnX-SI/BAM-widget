import sortArray from 'sort-array';
import { Taxon } from '@/lib/models';
import { Connector } from '@/lib/connectors/connector';
import { computed, ref, Ref } from 'vue';
import ParameterStore from '@/lib/parameterStore';
import { perfMark, perfReset } from '@/lib/perf';

interface SearchResult {
    taxons: Taxon[];
    datasets: any[];
}

interface TaxonListManagerProps {
    sortBy: string;
    order: 'asc' | 'desc';
    nbDisplayedSpecies?: number;
}

export class TaxonListManager {
    /**
     * Contains the taxons and datasets that match the search criteria
     * @type {Ref<SearchResult>}
     */
    public searchResult: Ref<SearchResult> = ref({ taxons: [], datasets: [] });
    /**
     * The list of species that match the search criteria and the class if selected
     * @type {Ref<Taxon[]>}
     */
    public filteredSpecies: Ref<Taxon[]> = ref([]);
    /**
     * The search string used to filter the species list
     * @type {Ref<string>}
     */
    public searchString: Ref<string> = ref('');
    /**
     * The class on which the species are filtered
     * @type {Ref<string>}
     */
    public filterClass: Ref<string | null> = ref(null);
    /**
     * The column on which the species are sorted
     * @type {Ref<string>}
     */
    public sortBy: Ref<string> = ref('');
    /**
     * The order in which the species are sorted
     * @type {Ref<'asc' | 'desc'>}
     */
    public orderBy: Ref<'asc' | 'desc'> = ref('desc');
    /**
     * The current page index
     * @type {Ref<number>}
     */
    public pageIndex: Ref<number> = ref(0);
    /**
     * A boolean that indicates if the observations are being loaded
     * @type {Ref<boolean>}
     */
    public loadingObservations: Ref<boolean> = ref(false);
    /**
     * A boolean that indicates if there was an error loading the observations
     * @type {Ref<boolean>}
     */
    public loadingError: Ref<boolean> = ref(false);
    /**
     * A computed property that returns the species list to be displayed
     * @type {any}
     */
    public speciesListShowed: any;
    /**
     * Identifier of the latest list request. A response that belongs to an
     * older request is dropped, so a slow query cannot overwrite a newer one.
     */
    private requestId = 0;

    constructor(
        public connector: Ref<Connector>,
        public props: TaxonListManagerProps,
        public parameterStore: {
            wkt: Ref<string>;
            dateMin: Ref<string>;
            dateMax: Ref<string>;
            class: Ref<string>;
        },
        nbDisplayedSpecies: Ref<number>
    ) {
        this.sortBy.value = props.sortBy;
        this.orderBy.value = props.order;
        this.speciesListShowed = computed(() => {
            if (!this.filteredSpecies.value.length) return [];

            let arrayToSort = [...this.filteredSpecies.value];

            // If no search string, sort by selected column
            if (this.searchString.value === '') {
                arrayToSort = sortArray(arrayToSort, {
                    by: this.sortBy.value,
                    order: this.orderBy.value,
                });
            }

            // if a a specific number of species is specified
            if (nbDisplayedSpecies.value > 0) {
                arrayToSort = arrayToSort.slice(0, nbDisplayedSpecies.value);
            }

            // Pagination
            return arrayToSort.slice(0, (this.pageIndex.value + 1) * 20);
        });
    }

    /**
     * Fetches the list of species that match the given WKT parameter,
     * and updates the searchResult and filteredSpecies properties accordingly.
     * @param {string} wktParam - The WKT parameter to fetch species for.
     */
    public fetchSpeciesList(wktParam: string): void {
        if (!wktParam.length) return;

        const requestId = ++this.requestId;
        perfReset();
        perfMark('list:start');
        this.loadingObservations.value = true;
        this.loadingError.value = false;
        this.filteredSpecies.value = [];

        const connector = this.connector.value;
        // a class filter chosen in the list is sent to sources that apply it
        const serverClass =
            connector.capabilities.classFilter === 'server'
                ? this.filterClass.value
                : null;

        connector
            .fetchTaxa({
                geometry: wktParam,
                dateMin: this.parameterStore.dateMin.value,
                dateMax: this.parameterStore.dateMax.value,
                class: serverClass ?? this.parameterStore.class.value,
            })
            .then((response) => {
                if (requestId !== this.requestId) return;
                perfMark('list:ready');
                this.searchResult.value = response;
                this.filteredSpecies.value = response.taxons;
                this.pageIndex.value = 0;
                this.loadingObservations.value = false;
                if (this.searchString.value) this.updateFilteredSpecies();
            })
            .catch(() => {
                if (requestId !== this.requestId) return;
                perfMark('list:error');
                this.loadingError.value = true;
                this.loadingObservations.value = false;
            });
    }

    /**
     * Updates the filteredSpecies property based on the search string and filterClass values.
     */
    public updateFilteredSpecies(): void {
        const result = this.searchResult.value.taxons;
        if (!result) {
            this.filteredSpecies.value = [];
            return;
        }

        /**
         * Applies filters to the given list of Taxon objects
         *
         * The filters applied are:
         * - A text filter based on the search string
         * - A class filter based on the filterClass value
         *
         * @param {Taxon[]} list - The list of Taxon objects to filter
         * @param {any[]} searchApiResponseData - Optional data to pass to the scoring function
         */
        const applyFilters = (
            list: Taxon[],
            searchApiResponseData: any[] = []
        ) => {
            let filtered = [...list];

            // Filtrage par texte
            if (this.searchString.value && this.searchString.value != '') {
                filtered = filtered.filter(
                    (taxon) =>
                        this.connector.value.scoringSearchClass.getScore(
                            taxon,
                            this.searchString.value,
                            searchApiResponseData
                        ) > 0
                );
                filtered.sort(
                    this.connector.value.scoringSearchClass.scoring(
                        this.searchString.value,
                        searchApiResponseData
                    )
                );
            }

            // if a taxon class is selected (sources with a server side class
            // filter already returned only that class)
            if (
                this.filterClass.value &&
                this.connector.value.capabilities.classFilter === 'client'
            ) {
                filtered = filtered.filter(
                    (taxon) => taxon.class === this.filterClass.value
                );
            }
            // finally, assign filtered taxon list
            this.filteredSpecies.value = filtered;
        };

        if (
            this.searchString.value &&
            this.connector.value.isSearchOnAPIAvailable
        ) {
            this.connector.value
                .searchOnAPI(this.searchString.value)
                .then((data) => applyFilters(result, data))
                .catch(() => applyFilters(result));
        } else {
            applyFilters(result);
        }
    }

    /**
     * Handles the scroll event and updates the pageIndex property accordingly.
     * @param {Event} event - The scroll event object.
     */
    public onScroll(event: { target: HTMLElement }): void {
        const { scrollTop, clientHeight, scrollHeight } = event.target;
        const threshold = 50;
        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            this.pageIndex.value++;
        }
    }
}
