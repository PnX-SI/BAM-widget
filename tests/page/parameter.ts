import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Used to manually interact with parameter block in the config interface to change the parameter
 */
export class ParameterBlock {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async goto() {
    await this.page.goto("/#/config");
  }

  async setRadius(value) {}
  async setWKT(value) {}
  async setDateMin(value) {}
  async setDateMax(value) {}
  //   async setConnector(value){}
  async setNbTaxonPerLine(value) {}
  async toggleShowFilters(value = null) {}
  async toggleMapEditable(value = null) {}
  async setMode(value) {}
  async setGeometrySource(value) {}
  async setClass(value) {}
  async setWidgetType(value) {}
  async toggleHybridTaxonList(value) {}
  async setXY(x, y) {}
  async setCustomDetailPage(value) {}
  async changeSource(value) {}
}
enum Parameter {
  radius,
  wkt,
  dateMin,
  dateMax,
  connector,
  nbTaxonPerLine,
  showFilters,
  mapEditable,
  lang,
  mode,
  sourceGeometry,
  class,
  widgetType,
  hybridTaxonList,
  x,
  y,
  customDetailPage,
}
/**
 * Used to set parameters in the URL
 */
export class ParameterUrl {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async setParameter(key: Parameter, value) {} // change/add a parameter in the current url
}
