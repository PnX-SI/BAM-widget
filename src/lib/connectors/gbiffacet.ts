import { Connector, ConnectorOptions } from './connector';
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
import { fetchJson } from '../utils';

const GBIF_ENDPOINT_DEFAULT = 'https://api.gbif.org/v1';
const GBIF_DEFAULT_TAXON_LIMIT = 1000;
const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const INAT_API_ENDPOINT = 'https://api.inaturalist.org/v1/taxa';
const INAT_BATCH_SIZE = 30;

type OccurrenceParams = Record<string, any>;

interface TaxonWithAncestors extends Taxon {
    ancestors?: Array<{ id: number; name: string; rank: string }>;
    iconicTaxonName?: string;
    iNatId?: string;
}

interface WikidataBinding {
    gbifID: { value: string };
    iNatID?: { value: string };
    scientificName?: { value: string };
    commonName?: { value: string }; // nouveau
    image?: { value: string };
}

interface EnrichedTaxonData {
    scientificName?: string;
    commonName?: string;
    photo?: string;
    iNatId?: string;
    ancestors?: any[];
    kingdom?: string;
    phylum?: string;
    order?: string;
    family?: string;
    genus?: string;
    iconicTaxonName?: string;
}

function buildUrl(base: string, params: Record<string, any>): string {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, v));
        } else if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
        }
    });
    return url.toString();
}

function callOccurrenceApi(params: OccurrenceParams = {}): Promise<any> {
    return fetchJson<any>(
        buildUrl(`${GBIF_ENDPOINT_DEFAULT}/occurrence/search`, params)
    );
}

export class GbifFacetConnector extends Connector {
    name: string;
    GBIF_ENDPOINT: string;
    LIMIT: number;
    NB_PAGES: number = 1;
    private enrichTaxonomyCache: Map<string, EnrichedTaxonData> = new Map();

    taxonClass2SourceID = {
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

    constructor(options: ConnectorOptions) {
        super(options);
        this.name = CONNECTORS.GBIF_FACET;
        this.GBIF_ENDPOINT = options?.GBIF_ENDPOINT || GBIF_ENDPOINT_DEFAULT;
        this.LIMIT = options?.LIMIT || GBIF_DEFAULT_TAXON_LIMIT;

        this.referential = TAXON_REFERENTIAL.GBIF;
        this.imageSource = this.imageSource || getMediaSource(SOURCE_.wikidata);
        this.soundSource = this.soundSource || getMediaSource(SOURCE_.wikidata);

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
                default: GBIF_ENDPOINT_DEFAULT,
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

        return fetchJson(
            `${this.GBIF_ENDPOINT}/species/${taxonID}/vernacularNames?limit=100`
        ).then((data) => {
            const match = data.results.find(
                (r: any) => r.language === mapping_language[currentLanguage]
            );
            return match
                ? match.vernacularName.charAt(0).toUpperCase() +
                      match.vernacularName.slice(1)
                : undefined;
        });
    }

    private buildWikidataSparql(gbifIds: string[], lang: string): string {
        const values = gbifIds.map((id) => `"${id}"`).join(' ');
        return `
        SELECT ?gbifID ?iNatID ?scientificName ?commonName ?image
        WHERE {
            VALUES ?gbifID { ${values} }
            ?taxon wdt:P846 ?gbifID .
            OPTIONAL { ?taxon wdt:P3151 ?iNatID . }
            OPTIONAL { ?taxon wdt:P225 ?scientificName . }
            OPTIONAL { ?taxon p:P1843 ?commonNameStatement .
                       ?commonNameStatement ps:P1843 ?commonName .
                       FILTER(LANG(?commonName) = "${lang}")
            }
            OPTIONAL { ?taxon wdt:P18 ?image . }
        }
    `;
    }

    private async enrichTaxonomy(
        gbifIds: string[]
    ): Promise<Map<string, EnrichedTaxonData>> {
        const uncachedIds = gbifIds.filter(
            (id) => !this.enrichTaxonomyCache.has(id)
        );
        if (!uncachedIds.length) return this.enrichTaxonomyCache;

        const currentLang = ParameterStore.getInstance().lang.value;

        try {
            // Fetch all Wikidata IDs in a single POST
            const sparql = this.buildWikidataSparql(uncachedIds, currentLang);
            const wikidataResponse = await fetch(WIKIDATA_SPARQL_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/sparql-results+json',
                },
                body: new URLSearchParams({ query: sparql }),
            });
            if (!wikidataResponse.ok)
                throw new Error(
                    `Wikidata POST failed: ${wikidataResponse.status}`
                );
            const wikidataData = await wikidataResponse.json();

            // Process Wikidata results
            const gbifToINat: Record<string, string> = {};
            wikidataData.results.bindings.forEach((b: WikidataBinding) => {
                const gbifId = b.gbifID.value;
                const existing = this.enrichTaxonomyCache.get(gbifId) || {};
                this.enrichTaxonomyCache.set(gbifId, {
                    ...existing,
                    scientificName: b.scientificName?.value,
                    commonName: b.commonName?.value.replace(/^./, (char) =>
                        char.toUpperCase()
                    ),
                    photo: b.image?.value,
                });
                if (b.iNatID) gbifToINat[gbifId] = b.iNatID.value;
            });

            // iNaturalist
            const iNatIds = Object.values(gbifToINat);
            const iNatPromises: Promise<any>[] = [];
            for (let i = 0; i < iNatIds.length; i += INAT_BATCH_SIZE) {
                const batch = iNatIds.slice(i, i + INAT_BATCH_SIZE);
                if (!batch.length) continue;
                iNatPromises.push(
                    fetchJson(`${INAT_API_ENDPOINT}/${batch.join(',')}`)
                );
            }

            const iNatResults = await Promise.all(iNatPromises);

            // Merge iNaturalist data into cache
            iNatResults.forEach((iNatData) => {
                Object.entries(gbifToINat).forEach(([gbifId, iNatId]) => {
                    const taxon = iNatData.results.find(
                        (t: any) => t.id == iNatId
                    );
                    if (!taxon) return;
                    const existing = this.enrichTaxonomyCache.get(gbifId) || {};
                    this.enrichTaxonomyCache.set(gbifId, {
                        ...existing,
                        iNatId,
                        scientificName: taxon.name,
                        commonName:
                            existing.commonName || taxon.preferred_common_name,
                        ancestors: taxon.ancestors || [],
                        kingdom: taxon.ancestors?.find(
                            (a: any) => a.rank === 'kingdom'
                        )?.name,
                        phylum: taxon.ancestors?.find(
                            (a: any) => a.rank === 'phylum'
                        )?.name,
                        order: taxon.ancestors?.find(
                            (a: any) => a.rank === 'order'
                        )?.name,
                        family: taxon.ancestors?.find(
                            (a: any) => a.rank === 'family'
                        )?.name,
                        genus: taxon.ancestors?.find(
                            (a: any) => a.rank === 'genus'
                        )?.name,
                        iconicTaxonName: taxon.iconic_taxon_name, // equivalent of the functional group in INPN
                        photo:
                            taxon.default_photo?.medium_url || existing.photo,
                    });
                });
            });
        } catch (e) {
            console.error(`[${this.name}] enrichTaxonomy failed`, e);
        }

        return this.enrichTaxonomyCache;
    }

    /* ---------- fetchOccurrence ---------- */
    fetchOccurrence(params: any = {}): Promise<SearchResult> {
        super.fetchOccurrence(params);
        if (params.geometry)
            params.geometry = stringify(removeHoles(parse(params.geometry)));

        const defaultParams = {
            facet: ['speciesKey', 'datasetKey'],
            facetLimit: this.LIMIT,
            limit: 0,
            occurrenceStatus: 'PRESENT',
            basisOfRecord: [
                'OBSERVATION',
                'HUMAN_OBSERVATION',
                'MACHINE_OBSERVATION',
                'OCCURRENCE',
            ],
            hasGeospatialIssue: false,
            hasCoordinate: true,
            ...params,
        };

        if (defaultParams.dateMin && defaultParams.dateMax) {
            defaultParams.eventDate = `${defaultParams.dateMin},${defaultParams.dateMax}`;
            delete defaultParams.dateMin;
            delete defaultParams.dateMax;
        }

        if (params?.class) {
            defaultParams.classKey = this.taxonClass2SourceID[params?.class];
            delete defaultParams.class;
        }

        return callOccurrenceApi(defaultParams).then(async (gbifData) => {
            if (!gbifData.facets || gbifData.facets.length === 0)
                return { taxons: [], datasets: [] };

            const taxonFacet = gbifData.facets.find(
                (f: any) => f.field === 'SPECIES_KEY'
            );
            const datasetFacet = gbifData.facets.find(
                (f: any) => f.field === 'DATASET_KEY'
            );

            const datasets: Dataset[] =
                datasetFacet?.counts.map((facet: any) => ({
                    uuid: facet.name,
                    name: facet.name,
                    nbObservations: facet.count,
                })) || [];

            if (!taxonFacet || !taxonFacet.counts)
                return { taxons: [], datasets };

            const speciesIds = taxonFacet.counts.map((f: any) => f.name);
            const enrichmentMap = await this.enrichTaxonomy(speciesIds);

            const taxons: TaxonWithAncestors[] = taxonFacet.counts.map(
                (facet: any) => {
                    const gbifId = facet.name;
                    const enrichment = enrichmentMap.get(gbifId);

                    const taxon: Taxon = {
                        taxonId: gbifId,
                        acceptedScientificName:
                            enrichment?.scientificName || '',
                        vernacularName: enrichment?.commonName || '',
                        taxonRank: 'SPECIES',
                        nbObservations: facet.count,
                        mediaUrl: enrichment?.photo || NO_IMAGE_URL,
                        description: '',
                        lastSeenDate: new Date(),
                        kingdom: enrichment?.kingdom || '',
                        class: enrichment?.iconicTaxonName || '',
                    };

                    return taxon;
                }
            );

            return { taxons, datasets };
        });
    }

    fetchTaxonInfo(idTaxon: string) {
        return fetchJson<any>(`${this.GBIF_ENDPOINT}/species/${idTaxon}`).then(
            (json) => ({
                scientificName: json.scientificName,
                vernacularName: json.vernacularName,
                rank: json.rank,
                taxonKey: json.key,
            })
        );
    }

    fetchTaxonStatus(idTaxon: string) {
        return fetchJson<{ category: string; code: string }>(
            `${this.GBIF_ENDPOINT}/species/${idTaxon}/iucnRedListCategory`
        ).then((json) => ({
            iucnRedListCategory: json.category,
            code: json.code,
        }));
    }

    searchTaxon(searchString: string = '', params: OccurrenceParams = {}) {
        return fetchJson<any>(
            `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&limit=20`
        ).then((json) =>
            json.results.map((e: any) => ({
                scientificName: e.scientificName,
                taxonKey: e.key,
            }))
        );
    }

    getTaxonDetailPage(taxonId: string) {
        return `https://www.gbif.org/species/${taxonId}`;
    }

    sourceDetailMessage() {
        return useI18n().t('source.gbifWarning', {
            nbObs: this.LIMIT * this.NB_PAGES,
        });
    }

    getSourceUrl() {
        return 'https://www.gbif.org';
    }
    getDatasetUrl(datasetID: any) {
        return `${this.getSourceUrl()}/dataset/${datasetID}`;
    }

    searchOnAPI(searchString: string) {
        return fetchJson<any>(
            `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&status=ACCEPTED&qField=VERNACULAR&limit=100`
        ).then((json) => json.results);
    }
}

export default GbifFacetConnector;
