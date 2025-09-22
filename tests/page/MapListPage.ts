import { expect, type Locator, type Page } from '@playwright/test';

export class MapListWidgetPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }
    async goto() {
        await this.page.goto('/#/config');
    }

    async testTaxonList() {} // run tests defined in taxonList.ts to make sure the taxonList work as intended (same for ListWidget and Configurator)
    async testDrawGeometry() {} // test when the user choose to draw a new geom
    async testDrawDisabled() {} // test if the user can't draw a new geom when the parameter is correctly set
}
