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

class ParameterStore {
  private static instance: ParameterStore | null = null;

  radius: Ref<number>;
  wkt: Ref<string>;
  dateMin: Ref<Date | null>;
  dateMax: Ref<Date | null>;
  connector: ShallowRef<Connector>;
  nbTaxonPerLine: Ref<number | null>;
  showFilters: Ref<boolean>;
  mapEditable: Ref<boolean>;
  lang: any;
  mode: Ref<string>;
  sourceGeometry: Ref<string | null>;
  class: Ref<string | null>;
  widgetType: Ref<string>;
  hybridTaxonList: Ref<boolean>;
  x: Ref<number | null>;
  y: Ref<number | null>;
  customDetailPage: Ref<string | null>;

  private constructor() {
    const { locale, availableLocales } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const paramsFromUrl = route?.query;

    this.radius = ref(1);
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
      connector: (value: string) => getConnector(value, { ...paramsFromUrl }),
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
    const instance = ParameterStore.getInstance();
    instance.radius.value = 1;
    instance.wkt.value = "";
    instance.dateMin.value = null;
    instance.dateMax.value = null;
    instance.connector.value = getConnector(null, {});
    instance.nbTaxonPerLine.value = null;
    instance.showFilters.value = true;
    instance.mapEditable.value = true;
    instance.mode.value = TAXONLIST_DISPLAY_MODE.detailedList;
    instance.sourceGeometry.value = null;
    instance.class.value = null;
  }
}

const validateWKT = (wkt: string | null, radius: number): string | null => {
  if (wkt && (wkt.includes("POINT") || wkt.includes("LINESTRING"))) {
    const buffered = simplify(buffer(parse(wkt), radius), {
      tolerance: 0.001,
      highQuality: true,
    });
    return stringify(buffered);
  }
  return wkt;
};

export default ParameterStore;
