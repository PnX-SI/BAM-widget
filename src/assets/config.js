import { WIDGET_TYPE, TAXONLIST_DISPLAY_MODE } from "@/lib/enums";

const config = {
  RADIUS: 500,
  WKT: "",
  dateMin: null,
  dateMax: null,
  showFilters: true,
  mapEditable: true,
  lang: "fr",
  mode: TAXONLIST_DISPLAY_MODE.detailedList,
  sourceGeometry: null,
  class: null,
  widgetType: WIDGET_TYPE.list,
  hybridTaxonList: true,
  x: null,
  y: null,
  customDetailPage: null,
  nbTaxonPerLine: 2,
};

export default config;
