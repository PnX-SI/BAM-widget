import { expect, type Locator, type Page } from '@playwright/test';

export class ListWidgetPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }
    async goto() {
        await this.page.goto('/#/list');
    }

    async changeSource(sourceName: string) {}
    async changeSorting(option: string, order: 'desc' | 'asc') {}
    async searchTaxon(searchString: string) {}
    async getEmbedLocator() {
        //drop the undefined
        return null;
    }
    async switchLanguage() {}
}
