import { Connector, ConnectorOptions } from './connector';
import { Dataset, SearchResult, Taxon } from '../models';
import ParameterStore from '../parameterStore';
import { NO_IMAGE_URL } from '@/assets/constant';
import { TAXON_REFERENTIAL } from '../taxonReferential';
import { getMediaSource, SOURCE_ } from '../media/media';
import { useI18n } from 'vue-i18n';
import { CONNECTORS } from './connectors';
import { GBIFSearchScoring } from './search/gbif';

const GBIF_ENDPOINT_DEFAULT = 'https://api.gbif.org/v1';
const GBIF_DEFAULT_TAXON_LIMIT = 1000;

type OccurrenceParams = Record<string, any>;

export class GbifFacetConnector extends Connector {
    name: string;
    GBIF_ENDPOINT: string;
    LIMIT: number;

    constructor(options: ConnectorOptions) {
        super(options);
        this.name = CONNECTORS.GBIF_FACET;

        // specific parameters
        this.GBIF_ENDPOINT =
            this.options?.GBIF_ENDPOINT || GBIF_ENDPOINT_DEFAULT;
        this.LIMIT = this.options?.LIMIT || GBIF_DEFAULT_TAXON_LIMIT;

        this.referential = TAXON_REFERENTIAL.GBIF;

        this.imageSource = this.imageSource || getMediaSource(SOURCE_.wikidata);
        this.soundSource = this.soundSource || getMediaSource(SOURCE_.wikidata);

        this.taxonClass2SourceID = {
            Aves: 212,
            Mammalia: 359,
            Reptilia: 358,
            Amphibia: 131,
            Insecta: 216,
            Arachnida: 367,
            Gastropoda: 225,
            Bivalvia: 137,
            Magnoliopsida: 220,
            Liliopsida: 196,
            Pinopsida: 194,
        };
        this.isSearchOnAPIAvailable = true;
        this.scoringSearchClass = new GBIFSearchScoring();
    }

    getParamsSchema(): Array<Record<string, any>> {
        const { t } = useI18n();
        return [
            {
                name: 'GBIF_ENDPOINT',
                label: "Adresse de l'API du GBIF",
                type: String,
                default: 'https://api.gbif.org/v1',
            },
            {
                name: 'LIMIT',
                label: t('limit'),
                type: Number,
                default: GBIF_DEFAULT_TAXON_LIMIT,
            },
        ];
    }

    fetchVernacularName(taxonID: string | number): Promise<string | undefined> {
        const mapping_language: Record<string, string> = {
            en: 'eng',
            fr: 'fra',
            es: 'spa',
            cs: 'ces',
            it: 'ita',
            de: 'deu',
        };
        const currentLanguage = ParameterStore.getInstance().lang.value;
        return fetch(
            `${this.GBIF_ENDPOINT}/species/${taxonID}/vernacularNames?limit=100`
        )
            .then((response) => response.json())
            .then((data) => {
                const nameData = data.results.find(
                    (nameData: any) =>
                        nameData.language === mapping_language[currentLanguage]
                );
                return nameData
                    ? nameData.vernacularName.charAt(0).toUpperCase() +
                          nameData.vernacularName.slice(1)
                    : undefined;
            });
    }

    fetchOccurrence(params: any = {}): Promise<SearchResult> {
        super.fetchOccurrence(params);

        const searchParams = this.buildSearchParams(params);
        const urlWithParams = this.buildSearchUrl(searchParams);

        return fetch(urlWithParams.toString())
            .then((response) => response.json())
            .then(async (data) => {
                const taxonsData: Record<string, Taxon> = {};
                const datasetData: Record<string, Dataset> = {};

                if (data.facets && data.facets.length > 0) {
                    await this.processTaxonFacets(data.facets, taxonsData);
                    this.processDatasetFacets(data.facets, datasetData);
                }

                return {
                    taxons: Object.values(taxonsData),
                    datasets: Object.values(datasetData),
                };
            });
    }

    /**
     * Builds search parameters for the GBIF API.
     * Merges default parameters with user-provided ones.
     * Handles date transformation and taxonomic class mapping.
     *
     * @param params - Custom search parameters
     * @returns Formatted parameters for the GBIF API
     */
    private buildSearchParams(params: any): OccurrenceParams {
        let searchParams = {
            occurrenceStatus: 'PRESENT',
            basisOfRecord: [
                'OBSERVATION',
                'HUMAN_OBSERVATION',
                'MACHINE_OBSERVATION',
                'OCCURRENCE',
            ],
            hasGeospatialIssue: false,
            hasCoordinate: true,
            facet: ['taxonKey', 'datasetKey'],
            facetLimit: this.LIMIT,
            limit: 0,
            ...params,
        };

        // Gestion de la plage de dates
        if (searchParams.dateMin && searchParams.dateMax) {
            searchParams.eventDate = `${searchParams.dateMin},${searchParams.dateMax}`;
            delete searchParams.dateMin;
            delete searchParams.dateMax;
        }

        // Gestion de la classe taxonomique
        if (params?.class) {
            searchParams.classKey = this.taxonClass2SourceID[params.class];
            delete searchParams.class;
        }

        return searchParams;
    }

    /**
     * Builds the complete URL for the GBIF search query.
     * Properly encodes simple parameters and arrays.
     *
     * @param params - Search parameters to encode in the URL
     * @returns Complete URL with all parameters
     */
    private buildSearchUrl(params: OccurrenceParams): URL {
        const url = new URL(`${this.GBIF_ENDPOINT}/occurrence/search`);

        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => url.searchParams.append(key, item));
            } else {
                url.searchParams.append(key, value);
            }
        });

        return url;
    }

    /**
     * Processes taxon facets returned by the GBIF API.
     * Retrieves detailed information for each taxon in parallel.
     * Filters taxa based on their taxonomic rank.
     *
     * @param facets - List of facets returned by the API
     * @param taxonsData - Object to store validated taxon data
     */
    private async processTaxonFacets(
        facets: any[],
        taxonsData: Record<string, Taxon>
    ): Promise<void> {
        const taxonFacet = facets.find((f: any) => f.field === 'TAXON_KEY');

        if (!taxonFacet?.counts) {
            return;
        }

        const taxonPromises = taxonFacet.counts.map((facetItem: any) =>
            this.processSingleTaxon(facetItem, taxonsData)
        );

        await Promise.all(taxonPromises); // TODO : watch out for performance
    }

    /**
     * Processes an individual taxon from the facet.
     * Retrieves its information from the GBIF API and validates its taxonomic rank.
     * If the rank is valid, adds the taxon to the collection.
     *
     * @param facetItem - Facet item containing the taxonKey and count
     * @param taxonsData - Collection to add the taxon to if valid
     */
    private async processSingleTaxon(
        facetItem: any,
        taxonsData: Record<string, Taxon>
    ): Promise<void> {
        const taxonKey = facetItem.name;
        const nbObservations = facetItem.count;

        try {
            const taxonInfo = await this.fetchTaxonInfo(taxonKey);

            if (!this.isValidTaxonRank(taxonInfo.rank)) {
                return;
            }

            taxonsData[taxonKey] = this.createTaxonObject(
                taxonKey,
                taxonInfo,
                nbObservations
            );
        } catch (error) {
            console.error(
                `Erreur lors de la récupération du taxon ${taxonKey}:`,
                error
            );
        }
    }

    /**
     * Creates a standardized Taxon object from retrieved information.
     *
     * @param taxonKey - Unique identifier of the taxon in GBIF
     * @param taxonInfo - Taxon information (scientific name, vernacular name, rank)
     * @param nbObservations - Number of observations for this taxon
     * @returns Formatted Taxon object
     */
    private createTaxonObject(
        taxonKey: string,
        taxonInfo: {
            scientificName: string;
            vernacularName: string;
            rank: string;
        },
        nbObservations: number
    ): Taxon {
        return {
            acceptedScientificName: taxonInfo.scientificName,
            vernacularName: taxonInfo.vernacularName || '',
            taxonId: taxonKey,
            mediaUrl: NO_IMAGE_URL,
            taxonRank: taxonInfo.rank,
            kingdom: '',
            class: '',
            nbObservations: nbObservations,
            description: '',
            // lastSeenDate: new Date(),
        };
    }

    /**
     * Processes dataset facets returned by the GBIF API.
     * Extracts information from each dataset (UUID, number of observations).
     *
     * @param facets - List of facets returned by the API
     * @param datasetData - Object to store dataset data
     */
    private processDatasetFacets(
        facets: any[],
        datasetData: Record<string, Dataset>
    ): void {
        const datasetFacet = facets.find((f: any) => f.field === 'DATASET_KEY');

        if (!datasetFacet?.counts) {
            return;
        }

        datasetFacet.counts.forEach((facetItem: any) => {
            datasetData[facetItem.name] = {
                uuid: facetItem.name,
                name: facetItem.name,
                nbObservations: facetItem.count,
            };
        });
    }

    /**
     * Checks if a taxonomic rank is specific enough.
     * Filters out ranks that are too high like family, order, class, etc.
     *
     * @param rank - Taxonomic rank to validate (e.g., 'SPECIES', 'GENUS', 'FAMILY')
     * @returns true if the rank is accepted, false otherwise
     */
    private isValidTaxonRank(rank: string): boolean {
        const acceptedRanks = ['SPECIES', 'SUBSPECIES'];
        return acceptedRanks.includes(rank.toUpperCase());
    }

    fetchTaxonInfo(idTaxon: string): Promise<{
        scientificName: string;
        vernacularName: string;
        rank: string;
        taxonKey: number;
    }> {
        const url = `${this.GBIF_ENDPOINT}/species/${idTaxon}`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => ({
                scientificName: json.scientificName,
                vernacularName: json.vernacularName,
                rank: json.rank,
                taxonKey: json.key,
            }));
    }

    fetchTaxonStatus(idTaxon: string): Promise<{
        iucnRedListCategory: string;
        code: string;
    }> {
        const url = `${this.GBIF_ENDPOINT}/species/${idTaxon}/iucnRedListCategory`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => ({
                iucnRedListCategory: json.category,
                code: json.code,
            }));
    }

    searchTaxon(
        searchString: string = '',
        params: OccurrenceParams = {}
    ): Promise<Array<{ scientificName: string; taxonKey: number }>> {
        const url = `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&limit=20`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) =>
                json.results.map((element: any) => ({
                    scientificName: element.scientificName,
                    taxonKey: element.key,
                }))
            );
    }

    getTaxonDetailPage(taxonId: string): string {
        return `https://www.gbif.org/species/${taxonId}`;
    }

    sourceDetailMessage(): string {
        return useI18n().t('source.gbifWarning', {
            nbObs: GBIF_DEFAULT_TAXON_LIMIT,
        });
    }
    getSourceUrl(): string | null {
        return 'https://www.gbif.org';
    }

    getDatasetUrl(datasetID: any): string | null {
        return `${this.getSourceUrl()}/dataset/${datasetID}`;
    }

    searchOnAPI(searchString: string): Promise<any> {
        return fetch(
            `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&status=ACCEPTED&qField=VERNACULAR&limit=100`
        )
            .then((response) => response.json())
            .then((json) => json.results);
    }
}
