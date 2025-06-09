import { reactive, ref, watch } from "vue";
import { getConnector } from "./connectors/utils";
import { useRoute, useRouter } from "vue-router";
import { parse, stringify } from "wellknown";
import { buffer } from "@turf/turf";
import { useI18n } from "vue-i18n";

class ParameterStore {
  static instance = null;

  constructor() {
    if (ParameterStore.instance) {
      return ParameterStore.instance;
    }

    const { locale, availableLocales } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const paramsFromUrl = route?.query;

    this.radius = ref(1);
    this.wkt = ref("");
    this.dateMin = ref(null);
    this.dateMax = ref(null);
    this.connector = reactive(getConnector(null, paramsFromUrl));
    this.itemsPerPage = ref(10);
    this.nbTaxonPerLine = ref(null);
    this.showFilters = ref(true);
    this.lang = locale;
    this.mode = ref("detailedList");
    this.sourceGeometry = ref(null);
    this.class = ref(null);

    this.initializeFromUrl(paramsFromUrl, locale, availableLocales);

    ParameterStore.instance = this;

    "radius wkt dateMin dateMax itemsPerPage nbTaxonPerLine showFilters lang mode class connector"
      .split(" ")
      .forEach((param) => {
        watch(this[param], () => {
          router.replace({ path: route.path, query: this.getParams() });
        });
      });
  }

  initializeFromUrl(paramsFromUrl, locale, availableLocales) {
    if (!paramsFromUrl) return;

    this.setParameterFromUrl("radius", (value) => parseInt(value));
    this.setParameterFromUrl("wkt", (value) =>
      validateWKT(value, this.radius.value)
    );
    this.setParameterFromUrl(
      "sourceGeometry",
      async (value) => {
        this.sourceGeometry.value = value;
        try {
          const response = await fetch(value);
          const geojson = await response.json();
          this.wkt.value = validateWKT(
            stringify(geojson.geometry),
            this.radius.value
          );
        } catch (err) {
          console.error(err);
        }
      },
      true
    );

    this.setParameterFromUrl("dateMin", (value) => value);
    this.setParameterFromUrl("dateMax", (value) => value);
    this.setParameterFromUrl("connector", (value) =>
      getConnector(value, { ...paramsFromUrl })
    );
    this.setParameterFromUrl("class", (value) =>
      Object.keys(this.connector.taxonClass2SourceID)?.includes(value)
        ? value
        : null
    );
    this.setParameterFromUrl("itemsPerPage", (value) => parseInt(value));
    this.setParameterFromUrl("nbTaxonPerLine", (value) => parseInt(value));
    this.setParameterFromUrl("showFilters", (value) => value === "true");
    this.setParameterFromUrl("lang", (value) => {
      if (availableLocales.includes(value)) {
        return value;
      }
    });
    this.setParameterFromUrl("mode", (value) =>
      ["detailedList", "gallery"].includes(value) ? value : "detailedList"
    );
  }

  setParameterFromUrl(paramName, transformFn, setValueInFunction = false) {
    if (paramName in useRoute().query) {
      const value = useRoute().query[paramName];
      if (!setValueInFunction) {
        this[paramName].value = transformFn(value);
      } else {
        transformFn(value);
      }
    }
  }

  getParams() {
    let params = {};
    Object.entries(this)
      .filter(
        ([_, value]) =>
          value.value !== undefined &&
          value.value !== null &&
          value.value !== ""
      )
      .forEach(([key, value]) => {
        params[key] = value.value;
      });

    params["connector"] = this.connector.name;
    params = { ...params, ...this.connector.getParams() };

    if (params?.sourceGeometry != null && params?.wkt) {
      delete params["wkt"];
    }
    return params;
  }

  static getInstance() {
    if (!ParameterStore.instance) {
      ParameterStore.instance = new ParameterStore();
    }
    return ParameterStore.instance;
  }
}

const validateWKT = (wkt, radius) => {
  if (wkt && (wkt.includes("POINT") || wkt.includes("LINESTRING"))) {
    const buffered = buffer(parse(wkt), radius);
    return stringify(buffered);
  }
  return wkt;
};

export default ParameterStore;
