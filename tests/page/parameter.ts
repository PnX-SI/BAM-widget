import { expect, type Locator, type Page } from '@playwright/test';

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

enum SOURCES {
    GEONATURE = 'GeoNature',
    GBIF = 'GBIF',
}

interface GeoNatureParams {
    API_ENDPOINT: string;
    ID_EXPORT: number;
    LIMIT: number;
}

interface GBIFParams {
    GBIF_ENDPOINT: string;
    LIMIT: number;
    NB_PAGES: number;
}

/**
 * Used to manually interact with parameter block in the config interface to change the parameter
 */
export class ParameterBlock {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }
    async goto() {
        await this.page.goto('/#/config');
    }

    async setBuffer(value: number) {
        await this.page
            .getByTestId('Buffer selection form')
            .fill(value.toString());
    }
    async setWKT(
        value: string = 'POLYGON ((-64.8 32.3, -65.5 18.3, -80.3 25.2, -64.8 32.3))'
    ) {
        const builder = new UrlBuilder(this.page);
        builder.setParameter({
            [Parameter.wkt]: value,
        });
    }
    async setDateMin(value) {
        await this.page.getByRole('textbox', { name: /Date min/ }).fill(value);
    }
    async setDateMax(value) {
        await this.page.getByRole('textbox', { name: /Date max/ }).fill(value);
    }
    async setNbTaxonPerLine(value: number) {
        await this.page
            .getByTestId('Number of taxon per line form')
            .fill(value.toString());
    }
    async toggleShowFilters(value = null) {
        const checkBox = await this.page.getByTestId(
            'Show/Hide results filters checkbox'
        );
        value ? await checkBox.check() : await checkBox.uncheck();
    }
    async toggleMapEditable(value: boolean = null) {
        const checkbox = await this.page.getByTestId(
            'Show/Hide drawing tools checkbox'
        );
        value ? await checkbox.check() : await checkbox.uncheck();
    }
    async setMode(modeOptionString: string) {
        const modeSelect = await this.page.getByTestId(
            'Widget type selection form'
        );
        await modeSelect.selectOption(modeOptionString);
    }
    async setGeometrySource(value: string) {
        await this.page.getByTestId('GeoJSON form').fill(value);
    }
    async setClass(value) {}
    async setWidgetType(value: ['list' | 'mapList']) {
        await this.page.getByTestId('Widget type selection form');
    }
    async toggleHybridTaxonList(value) {
        const checkBox = await this.page.getByTestId(
            'Show/Hide taxon list mode switch'
        );
        value ? await checkBox.check() : await checkBox.uncheck();
    }
    async setXY(x, y) {
        const builder = new UrlBuilder(this.page);
        builder.setParameter({ [Parameter.x]: 1, [Parameter.y]: 2 });
    }
    async setCustomDetailPage(value) {
        await this.page.getByTestId('Custom detail page form').fill(value);
    }
    async changeSource(
        connectorSelected: SOURCES,
        params: [GeoNatureParams, GBIFParams]
    ) {
        const builder = new UrlBuilder(this.page);
        builder.setParameter({
            ...params,
            [Parameter.connector]: connectorSelected,
        });
    }
}

/**
 * Used to set parameters in the URL
 */
export class UrlBuilder {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }
    async checkForParameterChange(key, value) {
        const currentUrl = await this.page.url();
        await expect(currentUrl).toContain(`${key}=${value}`);
    }

    async setParameter(params: Record<string, any>) {
        const url = await this.page.url();
        const urlWithParams = new URL(url);
        Object.entries(params).forEach(([key, value]) => {
            urlWithParams.searchParams.append(key, value);
        });
        await this.page.goto(urlWithParams.toString());
    } // change/add a parameter in the current url
}
