import { ref } from "vue";
import { getConnector } from "./connectors/utils";
import { useRoute } from "vue-router";
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
    const paramsFromUrl = useRoute()?.query;

    this.radius = ref(1);
    this.wkt = ref("");
    this.dateMin = ref(null);
    this.dateMax = ref(null);
    this.connector = ref(getConnector(null, {}));
    this.itemsPerPage = ref(10);
    this.nbTaxonPerLine = ref(null);
    this.showFilters = ref(true);
    this.lang = locale;

    this.initializeFromUrl(paramsFromUrl, locale, availableLocales);

    ParameterStore.instance = this;
  }

  initializeFromUrl(paramsFromUrl, locale, availableLocales) {
    if (!paramsFromUrl) return;

    this.setParameterFromUrl("radius", (value) => parseInt(value));
    this.setParameterFromUrl("wkt", (value) =>
      validateWKT(value, this.radius.value)
    );
    this.setParameterFromUrl("sourceGeometry", (value) =>
      this.fetchAndSetGeometry(value)
    );
    this.setParameterFromUrl("dateMin", (value) => value);
    this.setParameterFromUrl("dateMax", (value) => value);
    this.setParameterFromUrl("connector", (value) =>
      getConnector(value, { ...paramsFromUrl })
    );
    this.setParameterFromUrl("itemsPerPage", (value) => parseInt(value));
    this.setParameterFromUrl("nbTaxonPerLine", (value) => parseInt(value));
    this.setParameterFromUrl("showFilters", (value) => value === "true");
    this.setParameterFromUrl("lang", (value) => {
      if (availableLocales.includes(value)) {
        locale.value = value;
      }
    });
  }

  setParameterFromUrl(paramName, transformFn) {
    if (paramName in useRoute().query) {
      const value = useRoute().query[paramName];
      this[paramName].value = transformFn(value);
    }
  }

  async fetchAndSetGeometry(url) {
    try {
      const response = await fetch(url);
      const geojson = await response.json();
      this.wkt.value = validateWKT(stringify(geojson), this.radius.value);
    } catch (err) {
      console.error(err);
    }
  }

  getParams() {
    const params = {};
    Object.entries(this)
      .filter(([_, value]) => value !== undefined && value !== null)
      .forEach(([key, value]) => {
        params[key] = value.value;
      });
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
