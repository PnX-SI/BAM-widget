import { scheduledFetch } from '../http/scheduler';
import {
    Connector,
    ConnectorOptions,
    IUCNCodeStatus,
    TaxonQuery,
} from './connector';
import { Dataset, SearchResult, Taxon } from '../models';
import ParameterStore from '../parameterStore';
import { NO_IMAGE_URL } from '@/assets/constant';
import { TAXON_REFERENTIAL } from '../taxonReferential';
import { getMediaSource, SOURCE_ } from '../media/media';
import { useI18n } from 'vue-i18n';
import { CONNECTORS } from './connectors';
import { GBIFSearchScoring } from './search/gbif';
import { removeHoles } from './utils';
import { parse, stringify } from 'wellknown';

const GBIF_ENDPOINT_DEFAULT = 'https://api.gbif.org/v1';
// const GBIF_ENDPOINT_DEFAULT = 'https://api.gbif-uat.org/v1';
const GBIF_DEFAULT_LIMIT = 300;
const GBIF_DEFAULT_NB_PAGES = 10;
/** Max taxa returned by a facet request (a 10 x 10 km area has ~3 700). */
const GBIF_FACET_LIMIT = 5000;

type OccurrenceParams = Record<string, any>;

interface GBIFStatus {
    category: string;
    usageKey: number;
    scientificName: string;
    taxonomicStatus: string;
    iucnTaxonID: string;
    code: IUCNCodeStatus;
}

function callOccurrenceApi(params: OccurrenceParams = {}): Promise<any> {
    const urlWithParams = new URL(`${GBIF_ENDPOINT_DEFAULT}/occurrence/search`);
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            for (const item of value) {
                urlWithParams.searchParams.append(key, item);
            }
        } else {
            urlWithParams.searchParams.append(key, value);
        }
    });

    return scheduledFetch(urlWithParams.toString()).then((response) => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 429) {
            console.error('Rate limit exceeded');
        }
    });
}

/**
 * Build the taxon and dataset lists from the facets of an occurrence search
 * (`speciesKey` and `datasetKey`). A facet is already ordered by count.
 * @param {any} data - response of `occurrence/search?limit=0&facet=...`
 */
export function facetsToSearchResult(data: any): SearchResult {
    const counts = (field: string): Array<{ name: string; count: number }> =>
        (data?.facets || []).find((facet: any) => facet.field === field)
            ?.counts || [];

    const taxons: Taxon[] = counts('SPECIES_KEY').map(({ name, count }) => ({
        taxonId: Number(name),
        acceptedScientificName: '',
        mediaUrl: NO_IMAGE_URL,
        nbObservations: count,
        description: '',
        lastSeenDate: null,
    }));
    const datasets: Dataset[] = counts('DATASET_KEY').map(
        ({ name, count }) => ({
            uuid: name,
            name,
            nbObservations: count,
        })
    );
    return { taxons, datasets };
}

/**
 * Merge one page of GBIF occurrences into the per-taxon and per-dataset
 * aggregates (mutates both records).
 * @param {any[]} observations - `results` of an occurrence search page
 * @param {Record<string, Taxon>} taxonsData - aggregates by taxonKey
 * @param {Record<string, Dataset>} datasetData - aggregates by datasetKey
 */
export function mergeOccurrencePage(
    observations: any[],
    taxonsData: Record<string, Taxon>,
    datasetData: Record<string, Dataset>
): void {
    observations.forEach((observation: any) => {
        if (!(observation.datasetKey in datasetData)) {
            datasetData[observation.datasetKey] = {
                uuid: observation.datasetKey,
                name: observation.datasetKey,
                nbObservations: 0,
            };
        }
        datasetData[observation.datasetKey].nbObservations += 1;

        if (!taxonsData[observation.taxonKey]) {
            taxonsData[observation.taxonKey] = {
                acceptedScientificName: observation.acceptedScientificName,
                vernacularName: observation.vernacularName,
                taxonId: observation.taxonKey,
                mediaUrl: NO_IMAGE_URL,
                taxonRank: observation.taxonRank,
                kingdom: observation.kingdom,
                class: observation.class,
                nbObservations: 0,
                description: '',
                lastSeenDate: new Date(observation.eventDate),
            };
        }
        const taxon = taxonsData[observation.taxonKey];
        taxon.nbObservations += 1;
        taxon.lastSeenDate = new Date(
            Math.max(
                new Date(observation.eventDate).getTime(),
                taxon.lastSeenDate.getTime()
            )
        );
    });
}

export class GbifConnector extends Connector {
    name: string;
    GBIF_ENDPOINT: string;
    LIMIT: number;
    NB_PAGES: number;

    constructor(options: ConnectorOptions) {
        super(options);
        this.name = CONNECTORS.GBIF;

        // specific parameters
        this.GBIF_ENDPOINT =
            this.options?.GBIF_ENDPOINT || GBIF_ENDPOINT_DEFAULT;
        this.LIMIT = this.options?.LIMIT || GBIF_DEFAULT_LIMIT;
        this.NB_PAGES = this.options?.NB_PAGES || GBIF_DEFAULT_NB_PAGES;

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

        // Counted by GBIF (facets) unless the raw aggregation is requested
        if (this.options?.AGGREGATION !== 'client') {
            this.capabilities = {
                aggregation: 'facet',
                lastSeenDate: 'lazy',
                taxonInfo: 'lazy',
                classFilter: 'server',
            };
        }
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
                default: GBIF_DEFAULT_LIMIT,
            },
            {
                name: 'NB_PAGES',
                label: t('nbPages'),
                type: Number,
                default: GBIF_DEFAULT_NB_PAGES,
            },
        ];
    }

    countOccurrence(params: OccurrenceParams = {}): Promise<number> {
        return callOccurrenceApi(params).then((data) => (data || []).count);
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
        const prefOrder = [
            'TAXREF',
            'EUNIS Biodiversity Database',
            'Catalogue of Life',
        ];
        const currentLanguage = ParameterStore.getInstance().lang.value;
        return scheduledFetch(
            `${this.GBIF_ENDPOINT}/species/${taxonID}/vernacularNames?limit=100`
        )
            .then((response) => response.json())
            .then((data) => {
                const nameData = data.results.filter(
                    (nameData: any) =>
                        nameData.language === mapping_language[currentLanguage]
                );
                const prefName = (nameData.sort(
                    (a, b) =>
                        prefOrder.indexOf(a.source) -
                        prefOrder.indexOf(b.source)
                ) || [])[0];
                return prefName
                    ? prefName.vernacularName.charAt(0).toUpperCase() +
                          prefName.vernacularName.slice(1)
                    : undefined;
            });
    }

    /**
     * GBIF search filters for a query: simplified geometry without holes,
     * observation types, period and class. Shared by every occurrence request.
     * @param {Record<string, any>} params - `geometry`, `dateMin`, `dateMax`, `class`
     */
    private buildFilter(params: Record<string, any>): Record<string, any> {
        const query = { ...params };
        // too many coordinates are rejected by the API
        super.fetchOccurrence(query);
        // Need to remove inner rings
        query.geometry = stringify(removeHoles(parse(query.geometry)));

        const filter: Record<string, any> = {
            geometry: query.geometry,
            occurrenceStatus: 'PRESENT',
            basisOfRecord: [
                'OBSERVATION',
                'HUMAN_OBSERVATION',
                'MACHINE_OBSERVATION',
                'OCCURRENCE',
            ],
            hasGeospatialIssue: false,
            hasCoordinate: true,
        };
        if (query.dateMin && query.dateMax) {
            filter.eventDate = `${query.dateMin},${query.dateMax}`;
        }
        if (query.class) {
            filter.classKey = this.taxonClass2SourceID[query.class];
        }
        return filter;
    }

    fetchOccurrence(params: any = {}): Promise<SearchResult> {
        const defaultParams = {
            limit: this.LIMIT,
            maxPage: this.NB_PAGES,
            ...this.buildFilter(params),
        };

        return this.countOccurrence(defaultParams).then((countOccurrence) => {
            let nbOfPages = Math.min(
                Math.ceil(countOccurrence / defaultParams.limit),
                defaultParams.maxPage
            );
            if (isNaN(nbOfPages)) {
                nbOfPages = 1;
            }
            const taxonsData: Record<string, Taxon> = {};
            const datasetData: Record<string, Dataset> = {};

            // Pages are independent: request them all and let the per-host
            // limiter in `scheduledFetch` bound the concurrency. Merging is
            // order independent (sums and max), so arrival order is free.
            const pageRequests = Array.from(
                { length: nbOfPages },
                (_, pageIndex) =>
                    callOccurrenceApi({
                        ...defaultParams,
                        offset: pageIndex * defaultParams.limit,
                    }).then((apiResult) =>
                        mergeOccurrencePage(
                            apiResult?.results || [],
                            taxonsData,
                            datasetData
                        )
                    )
            );

            return Promise.all(pageRequests).then(() => ({
                taxons: Object.values(taxonsData),
                datasets: Object.values(datasetData),
            }));
        });
    }

    /**
     * Taxa of the area counted by GBIF: one request with the `speciesKey` and
     * `datasetKey` facets covers every matching observation, where the raw
     * aggregation only sees the first LIMIT * NB_PAGES of them. Taxa come
     * most observed first with their identifier and count; names, class and
     * last observation are completed per displayed taxon.
     */
    fetchTaxa(query: TaxonQuery): Promise<SearchResult> {
        if (this.capabilities.aggregation !== 'facet') {
            return super.fetchTaxa(query);
        }
        return callOccurrenceApi({
            ...this.buildFilter(query),
            limit: 0,
            facet: ['speciesKey', 'datasetKey'],
            facetLimit: GBIF_FACET_LIMIT,
        }).then((data) => facetsToSearchResult(data));
    }

    /**
     * Last observation of a taxon: the most recent year first, then the
     * dates of that year. GBIF ignores sort on occurrence search, and a
     * facet is ordered by count, hence the two steps.
     */
    fetchLastSeenDate(
        taxonId: string | number,
        query: TaxonQuery
    ): Promise<Date | null> {
        const filter = {
            ...this.buildFilter(query),
            speciesKey: taxonId,
            limit: 0,
        };
        const facetNames = (data: any): string[] =>
            (data?.facets?.[0]?.counts || []).map((c: any) => c.name);

        return callOccurrenceApi({
            ...filter,
            facet: 'year',
            facetLimit: 200,
        })
            .then((data) => {
                const years = facetNames(data).map(Number).filter(Boolean);
                if (!years.length) return null;
                return callOccurrenceApi({
                    ...filter,
                    year: Math.max(...years),
                    facet: 'eventDate',
                    facetLimit: 1000,
                });
            })
            .then((data) => {
                const dates = facetNames(data)
                    .map((name) => new Date(name))
                    .filter((date) => !isNaN(date.getTime()));
                return dates.length
                    ? new Date(Math.max(...dates.map((d) => d.getTime())))
                    : null;
            });
    }

    fetchTaxonInfo(idTaxon: string): Promise<{
        scientificName: string;
        vernacularName: string;
        rank: string;
        taxonKey: number;
        class?: string;
        kingdom?: string;
    }> {
        const url = `${this.GBIF_ENDPOINT}/species/${idTaxon}`;
        return scheduledFetch(url)
            .then((response) => response.json())
            .then((json) => ({
                scientificName: json.scientificName,
                vernacularName: json.vernacularName,
                rank: json.rank,
                taxonKey: json.key,
                class: json.class,
                kingdom: json.kingdom,
            }));
    }

    searchTaxon(
        searchString: string = '',
        params: OccurrenceParams = {}
    ): Promise<Array<{ scientificName: string; taxonKey: number }>> {
        const url = `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&limit=20`;
        return scheduledFetch(url)
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

    sourceDetailMessage(): string | null {
        // facets count every observation: the sampling warning does not apply
        if (this.capabilities.aggregation === 'facet') {
            return null;
        }
        return useI18n().t('source.gbifWarning', {
            nbObs: this.LIMIT * this.NB_PAGES,
        });
    }

    howToContributeMessage(): string | null {
        return useI18n().t('gbif.howToContribute');
    }
    getSourceUrl(): string | null {
        return 'https://www.gbif.org';
    }

    getDatasetUrl(datasetID: any): string | null {
        return `${this.getSourceUrl()}/dataset/${datasetID}`;
    }

    searchOnAPI(searchString: string): Promise<any> {
        return scheduledFetch(
            `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&status=ACCEPTED&qField=VERNACULAR&limit=100`
        )
            .then((response) => response.json())
            .then((json) => json.results);
    }

    fetchTaxonStatus(taxonId: string | number): Promise<IUCNCodeStatus> {
        return scheduledFetch(
            `${this.GBIF_ENDPOINT}/species/${taxonId}/iucnRedListCategory`
        )
            .then((response) => response.json())
            .then((json: GBIFStatus) => json.code);
    }
}
