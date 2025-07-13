import { ref, shallowRef, watch } from "vue";
import { getConnector } from "./connectors/utils";
import { useRoute, useRouter } from "vue-router";
import { parse, stringify } from "wellknown";
import { buffer, simplify } from "@turf/turf";
import { useI18n } from "vue-i18n";
import { TAXONLIST_DISPLAY_MODE, WIDGET_TYPE } from "./enums";

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

    this.initializeFromUrl(paramsFromUrl, locale, availableLocales);

    ParameterStore.instance = this;

    "radius wkt dateMin dateMax nbTaxonPerLine showFilters lang mode class connector mapEditable sourceGeometry widgetType hybridTaxonList"
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
      true
    );

    this.setParameterFromUrl("dateMin", (value) => value);
    this.setParameterFromUrl("dateMax", (value) => value);
    this.setParameterFromUrl("connector", (value) =>
      getConnector(value, { ...paramsFromUrl })
    );
    this.setParameterFromUrl("class", (value) =>
      Object.keys(this.connector.value.taxonClass2SourceID)?.includes(value)
        ? value
        : null
    );
    this.setParameterFromUrl("nbTaxonPerLine", (value) => parseInt(value));
    this.setParameterFromUrl("showFilters", (value) => value === "true");
    this.setParameterFromUrl("mapEditable", (value) => value === "true");
    this.setParameterFromUrl("hybridTaxonList", (value) => value === "true");
    this.setParameterFromUrl("lang", (value) => {
      if (availableLocales.includes(value)) {
        return value;
      }
    });
    this.setParameterFromUrl("mode", (value) =>
      Object.keys(TAXONLIST_DISPLAY_MODE).includes(value)
        ? value
        : TAXONLIST_DISPLAY_MODE.detailedList
    );
    this.setParameterFromUrl("widgetType", (value) =>
      Object.keys(WIDGET_TYPE).includes(value) ? value : "default"
    );
    this.setParameterFromUrl("x", (value) => {
      const x = parseInt(value);
      if (-180 < x < 180) {
        return x;
      }
      return null;
    });
    this.setParameterFromUrl("y", (value) => {
      const y = parseInt(value);
      if (-90 < y < 90) {
        return y;
      }
      return null;
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
    params["connector"] = this.connector.value.name;
    params = { ...params, ...this.connector.value.getParams() };

    if (params?.sourceGeometry != null && params?.wkt) {
      delete params["wkt"];
    }
    return params;
  }

  static clearParameters(route, router) {
    // TODO clean this up !
    router.replace({ path: route.path, query: {} });
    ParameterStore.instance.radius.value = 1;
    ParameterStore.instance.wkt.value = "";
    ParameterStore.instance.dateMin.value = null;
    ParameterStore.instance.dateMax.value = null;
    ParameterStore.instance.connector.value = getConnector(null, {});
    ParameterStore.instance.nbTaxonPerLine.value = null;
    ParameterStore.instance.showFilters.value = true;
    ParameterStore.instance.mapEditable.value = true;
    ParameterStore.instance.mode.value = "detailedList";
    ParameterStore.instance.sourceGeometry.value = null;
    ParameterStore.instance.class.value = null;
    ParameterStore.instance.initializeFromUrl();
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
    const buffered = simplify(buffer(parse(wkt), radius), {
      tolerance: 0.001,
      highQuality: true,
    });
    return stringify(buffered);
  }
  return wkt;
};

export default ParameterStore;
