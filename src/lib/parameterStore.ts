import { ref, shallowRef, watch, Ref, ShallowRef } from "vue";
import { getConnector } from "./connectors/utils";
import {
  useRoute,
  useRouter,
  RouteLocationNormalizedLoaded,
  Router,
} from "vue-router";
import { parse, stringify } from "wellknown";
import { buffer, simplify } from "@turf/turf";
import { useI18n } from "vue-i18n";
import { TAXONLIST_DISPLAY_MODE, WIDGET_TYPE } from "./enums";
import { Connector } from "./connectors/connector";
import { CONNECTORS } from "./connectors/connectors";

class ParameterStore {
  /**
   * @type {ParameterStore | null}
   */
  private static instance: ParameterStore | null = null;

  /**
   * If a marker or line is given, a buffer is applied with a given radius.
   * @type {Ref<number>}
   */
  radius: Ref<number>;

  /**
   * WKT (Well-Known Text Representation of the search zone).
   * @type {Ref<string>}
   */
  wkt: Ref<string>;

  /**
   * Dates that define the period of observations.
   * @type {Ref<Date | null>}
   */
  dateMin: Ref<Date | null>;

  /**
   * @type {Ref<Date | null>}
   */
  dateMax: Ref<Date | null>;

  /**
   * Connector used to fetch observations data.
   * @type {ShallowRef<Connector>}
   */
  connector: ShallowRef<Connector>;

  /**
   * Number of taxa per line.
   * @type {Ref<number | null>}
   */
  nbTaxonPerLine: Ref<number | null>;

  /**
   * Are filters of the taxa list shown.
   * @type {Ref<boolean>}
   */
  showFilters: Ref<boolean>;

  /**
   * Can the geometry be changed on the map.
   * @type {Ref<boolean>}
   */
  mapEditable: Ref<boolean>;

  /**
   * Language of the widget.
   * @type {any}
   */
  lang: any;

  /**
   * Display mode of the taxon list (gallery or detailed).
   * @type {Ref<string>}
   */
  mode: Ref<string>;

  /**
   * URL of a GeoJSON.
   * @type {Ref<string | null>}
   */
  sourceGeometry: Ref<string | null>;

  /**
   * Taxa's class selected.
   * @type {Ref<string | null>}
   */
  class: Ref<string | null>;

  /**
   * Widget display mode.
   * @type {Ref<string>}
   */
  widgetType: Ref<string>;

  /**
   * If the user can switch between different modes of display in the taxon list.
   * @type {Ref<boolean>}
   */
  hybridTaxonList: Ref<boolean>;

  /**
   * Longitude.
   * @type {Ref<number | null>}
   */
  x: Ref<number | null>;

  /**
   * Latitude.
   * @type {Ref<number | null>}
   */
  y: Ref<number | null>;

  /**
   * URL template to redirect the user to a page different from the default one indicated by the connector to a data source.
   * @type {Ref<string | null>}
   */
  customDetailPage: Ref<string | null>;

  private constructor() {
    const { locale, availableLocales } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const paramsFromUrl = route?.query;

    this.radius = ref(500);
    this.wkt = ref("");
    this.dateMin = ref(null);
    this.dateMax = ref(null);
    this.connector = shallowRef(getConnector(null, paramsFromUrl));
    this.nbTaxonPerLine = ref(null);
    this.showFilters = ref(true);
    this.mapEditable = ref(true);
    this.lang = locale;
    this.mode = ref(TAXONLIST_DISPLAY_MODE.detailedList);
    this.sourceGeometry = ref(null);
    this.class = ref(null);
    this.widgetType = ref(WIDGET_TYPE.default);
    this.hybridTaxonList = ref(true);
    this.x = ref(null);
    this.y = ref(null);
    this.customDetailPage = ref(null);

    this.initializeFromUrl(paramsFromUrl, locale, availableLocales);

    this.setupWatchers(router, route);
  }

  public static getInstance(): ParameterStore {
    if (!ParameterStore.instance) {
      ParameterStore.instance = new ParameterStore();
    }
    return ParameterStore.instance;
  }

  private setupWatchers(router: Router, route: RouteLocationNormalizedLoaded) {
    const paramsToWatch = [
      "radius",
      "wkt",
      "dateMin",
      "dateMax",
      "nbTaxonPerLine",
      "showFilters",
      "lang",
      "mode",
      "class",
      "connector",
      "mapEditable",
      "sourceGeometry",
      "widgetType",
      "hybridTaxonList",
      "customDetailPage",
    ];

    paramsToWatch.forEach((param) => {
      watch(this[param as keyof ParameterStore], () => {
        router.replace({ path: route.path, query: this.getParams() });
      });
    });
  }

  public initializeFromUrl(
    paramsFromUrl: any,
    locale: any,
    availableLocales: string[]
  ) {
    if (!paramsFromUrl) return;

    const paramHandlers: Record<string, (value: string) => any> = {
      radius: (value: string) => parseInt(value),
      wkt: (value: string) => validateWKT(value, this.radius.value),
      sourceGeometry: async (value: string) => {
        this.sourceGeometry.value = value;
        try {
          const response = await fetch(decodeURI(value));
          const geojson = await response.json();
          this.wkt.value = validateWKT(
            stringify(geojson.geometry),
            this.radius.value
          );
        } catch (err) {
          console.error(err);
        }
      },
      dateMin: (value: string) => new Date(value),
      dateMax: (value: string) => new Date(value),
      connector: (value: string) =>
        getConnector(CONNECTORS[value], { ...paramsFromUrl }),
      class: (value: string) =>
        Object.keys(this.connector.value.taxonClass2SourceID)?.includes(value)
          ? value
          : null,
      nbTaxonPerLine: (value: string) => parseInt(value),
      showFilters: (value: string) => value === "true",
      mapEditable: (value: string) => value === "true",
      hybridTaxonList: (value: string) => value === "true",
      lang: (value: string) =>
        availableLocales.includes(value) ? value : locale,
      mode: (value: string) =>
        Object.keys(TAXONLIST_DISPLAY_MODE).includes(value)
          ? value
          : TAXONLIST_DISPLAY_MODE.detailedList,
      widgetType: (value: string) =>
        Object.keys(WIDGET_TYPE).includes(value) ? value : WIDGET_TYPE.default,
      x: (value: string) => {
        const x = parseInt(value);
        return -180 < x && x < 180 ? x : null;
      },
      y: (value: string) => {
        const y = parseInt(value);
        return -90 < y && y < 90 ? y : null;
      },
      customDetailPage: (value: string) => value,
    };

    Object.entries(paramHandlers).forEach(([paramName, transformFn]) => {
      if (paramName in paramsFromUrl) {
        const value = paramsFromUrl[paramName];
        const paramRef = this[paramName as keyof ParameterStore];
        if (paramRef && typeof paramRef === "object" && "value" in paramRef) {
          paramRef.value = transformFn(value);
        } else if (paramName === "sourceGeometry") {
          transformFn(value);
        }
      }
    });

    if (this.x.value && this.y.value) {
      this.wkt.value = validateWKT(
        stringify({
          type: "Point",
          coordinates: [this.x.value, this.y.value],
        }),
        this.radius.value
      );
    }
  }

  public getParams(): Record<string, any> {
    const params: Record<string, any> = {};
    Object.entries(this).forEach(([key, value]) => {
      if (
        value?.value !== undefined &&
        value.value !== null &&
        value.value !== ""
      ) {
        params[key] = value.value;
      }
    });
    params["connector"] = this.connector.value.name;
    const connectorParams = this.connector.value.getParams();
    Object.assign(params, connectorParams);
    if (params.sourceGeometry != null && params.wkt) {
      delete params.wkt;
    }
    return params;
  }

  public static clearParameters(
    route: RouteLocationNormalizedLoaded,
    router: Router
  ) {
    router.replace({ path: route.path, query: {} });
    ParameterStore.instance = new ParameterStore();
  }
}

const validateWKT = (wkt: string | null, radius: number): string | null => {
  if (wkt && (wkt.includes("POINT") || wkt.includes("LINESTRING"))) {
    let buffered = buffer(parse(wkt), radius / 1000);
    if (wkt.includes("LINESTRING")) {
      buffered = simplify(buffered, { tolerance: 0.001, highQuality: true });
    }
    return stringify(buffered);
  }
  return wkt;
};

export default ParameterStore;
