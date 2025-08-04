/**
 * Interact with the taxon list
 */

import { expect, type Locator, type Page } from "@playwright/test";

export class TaxonList {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.page.goto("/#/list");
  }
  async changeSorting(option: string, order: "desc" | "asc") {} // use the sorting
  async searchTaxon(searchString: string) {} // use the search form
  async seeMore(taxon) {} // click on seeMore
  async sourceTooltip() {} // clink on the button to show tooltip for the current data source

  async setTaxonFilter(class_: string) {}
  async changeMode(mode: string) {}

  async runAllTest() {}
  // define all tests (use sort, use search, etc..)
}
