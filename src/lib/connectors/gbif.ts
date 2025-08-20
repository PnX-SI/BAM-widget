import { Connector, ConnectorOptions } from "./connector";
import { Media, Taxon } from "../models";
import ParameterStore from "../parameterStore";
import { NO_IMAGE_URL } from "@/assets/constant";
import { TAXON_REFERENTIAL } from "../taxonReferential";
import { getMediaSource, SOURCE_ } from "../media/media";
import { useI18n } from "vue-i18n";
import { CONNECTORS } from "./connectors";

const GBIF_ENDPOINT_DEFAULT = "https://api.gbif.org/v1";
const GBIF_DEFAULT_LIMIT = 300;
const GBIF_DEFAULT_NB_PAGES = 10;

type OccurrenceParams = Record<string, any>;

function callOccurrenceApi(params: OccurrenceParams = {}): Promise<any> {
  const urlWithParams = new URL(`${GBIF_ENDPOINT_DEFAULT}/occurrence/search`);
  Object.entries(params).forEach(([key, value]) => {
    urlWithParams.searchParams.append(key, value);
  });
  return fetch(urlWithParams.toString()).then((response) => response.json());
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
    this.GBIF_ENDPOINT = this.options?.GBIF_ENDPOINT || GBIF_ENDPOINT_DEFAULT;
    this.LIMIT = this.options?.LIMIT || GBIF_DEFAULT_LIMIT;
    this.NB_PAGES = this.options?.NB_PAGES || GBIF_DEFAULT_NB_PAGES;

    this.referential = TAXON_REFERENTIAL.GBIF;

    this.imageSource = this.imageSource || getMediaSource(SOURCE_.wikidata);
    this.soundSource = this.soundSource || getMediaSource(SOURCE_.gbif);

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
  }

  getParamsSchema(): Array<Record<string, any>> {
    const { t } = useI18n();
    return [
      {
        name: "GBIF_ENDPOINT",
        label: "Adresse de l'API du GBIF",
        type: String,
        default: "https://api.gbif.org/v1",
      },
      {
        name: "LIMIT",
        label: t("limit"),
        type: Number,
        default: GBIF_DEFAULT_LIMIT,
      },
      {
        name: "NB_PAGES",
        label: t("nbPages"),
        type: Number,
        default: GBIF_DEFAULT_NB_PAGES,
      },
    ];
  }

  countOccurrence(params: OccurrenceParams = {}): Promise<number> {
    return callOccurrenceApi(params).then((data) => data.count);
  }

  fetchVernacularName(taxonID: string): Promise<string | undefined> {
    const mapping_language: Record<string, string> = {
      en: "eng",
      fr: "fra",
      es: "spa",
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

  fetchOccurrence(params: any = {}): Promise<Record<string, Taxon>> {
    let defaultParams = {
      limit: this.LIMIT,
      maxPage: this.NB_PAGES,
      ...params,
    };
    if (defaultParams.dateMin && defaultParams.dateMax) {
      defaultParams.eventDate = `${defaultParams.dateMin},${defaultParams.dateMax}`;
    }

    if (params?.class) {
      defaultParams = {
        ...defaultParams,
        classKey: this.taxonClass2SourceID[params?.class],
      };
    }

    return this.countOccurrence(defaultParams).then((countOccurrence) => {
      const nbOfPages = Math.min(
        Math.ceil(countOccurrence / defaultParams.limit),
        defaultParams.maxPage
      );
      const taxonsData: Record<string, Taxon> = {};

      const fetchPage = (pageIndex: number): Promise<void> => {
        if (pageIndex >= nbOfPages) {
          return Promise.resolve();
        }
        const offset = pageIndex * defaultParams.limit;
        return callOccurrenceApi({ ...defaultParams, offset }).then(
          (apiResult) => {
            apiResult.results.forEach((observation: any) => {
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
                  description: "",
                  lastSeenDate: new Date(observation.eventDate),
                };
              }
              taxonsData[observation.taxonKey].nbObservations += 1;
              taxonsData[observation.taxonKey].lastSeenDate = new Date(
                Math.max(
                  new Date(observation.eventDate).getTime(),
                  taxonsData[observation.taxonKey].lastSeenDate.getTime()
                )
              );
            });
            return fetchPage(pageIndex + 1);
          }
        );
      };

      return fetchPage(0).then(() => taxonsData);
    });
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
    searchString: string = "",
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
    return useI18n().t("source.gbifWarning");
  }
}
