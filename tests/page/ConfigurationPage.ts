import { expect, type Locator, type Page } from "@playwright/test";

export class ConfigurationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async goto() {
    await this.page.goto("/#/config");
  }

  async getEmbedLocator() {
    //drop the undefined
    return null;
  }
  async switchLanguage() {}

  async runTaxonListTest() {}
  async runMapTest() {}
}
