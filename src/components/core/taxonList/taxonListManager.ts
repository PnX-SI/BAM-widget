import sortArray from 'sort-array';
import { Taxon } from '@/lib/models';
import { Connector } from '@/lib/connectors/connector';
import { computed, ref, Ref } from 'vue';
import ParameterStore from '@/lib/parameterStore';

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
    public searchResult: Ref<SearchResult> = ref({ taxons: [], datasets: [] });
    public filteredSpecies: Ref<Taxon[]> = ref([]);
    public searchString: Ref<string> = ref('');
    public filterClass: Ref<string | null> = ref(null);
    public sortBy: Ref<string> = ref('');
    public orderBy: Ref<'asc' | 'desc'> = ref('desc');
    public pageIndex: Ref<number> = ref(0);
    public loadingObservations: Ref<boolean> = ref(false);
    public loadingError: Ref<boolean> = ref(false);
    public speciesListShowed: any;

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

            // Tri si pas de recherche texte en cours
            if (this.searchString.value === '') {
                arrayToSort = sortArray(arrayToSort, {
                    by: this.sortBy.value,
                    order: this.orderBy.value,
                });
            }

            // Limitation du nombre d'espèces affichées
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

        this.loadingObservations.value = true;
        this.loadingError.value = false;
        this.filteredSpecies.value = [];

        this.connector.value
            .fetchOccurrence({
                geometry: wktParam,
                dateMin: this.parameterStore.dateMin.value,
                dateMax: this.parameterStore.dateMax.value,
                class: this.parameterStore.class.value,
            })
            .then((response) => {
                this.searchResult.value = response;
                this.filteredSpecies.value = response.taxons;
                this.pageIndex.value = 0;
                this.loadingObservations.value = false;
            })
            .catch(() => {
                this.loadingError.value = true;
                this.loadingObservations.value = false;
            });
    }

    // Met à jour la liste des taxons filtrés (version callback)
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
            }

            // Filtrage par classe
            if (this.filterClass.value) {
                filtered = filtered.filter(
                    (taxon) => taxon.class === this.filterClass.value
                );
            }

            this.filteredSpecies.value = filtered;
        };

        if (this.searchString && this.connector.value.isSearchOnAPIAvailable) {
            this.connector.value
                .searchOnAPI(this.searchString.value)
                .then((data) => applyFilters(result, data))
                .catch(() => applyFilters(result));
        } else {
            applyFilters(result);
        }
    }

    // Gestion du scroll pour la pagination
    public onScroll(event: { target: HTMLElement }): void {
        const { scrollTop, clientHeight, scrollHeight } = event.target;
        const threshold = 50;
        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            this.pageIndex.value++;
        }
    }
}
