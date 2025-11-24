import { expect, type Locator, type Page } from '@playwright/test';

export class TaxonList {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    exists() {
        return this.page.getByTestId('Taxon list').isVisible();
    }

    /**
     * Change the sorting order of the taxon list
     * @param option - The field to sort by (e.g., 'vernacularName', 'acceptedScientificName', 'nbObservations', 'lastSeenDate')
     * @param order - The sort order ('asc' or 'desc')
     */
    async changeSorting(option: string, order: 'desc' | 'asc') {
        // Open the sorting dropdown
        const sortButton = this.page.getByTestId('Sorting taxons input form');
        await sortButton.click();

        // Click on the desired sort option
        const sortOption = this.page.getByTestId(
            `Change sorting order button for ${option}`
        );
        await sortOption.click();

        // Check if we need to toggle the order
        // The first click selects the field, subsequent clicks on the same field toggle the order
        const currentOrderIcon = sortOption.locator('i');
        const iconClass = await currentOrderIcon.getAttribute('class');

        if (
            (order === 'asc' && iconClass?.includes('arrow-down-short')) ||
            (order === 'desc' && iconClass?.includes('arrow-up-short'))
        ) {
            // Need to toggle, so click again
            await sortButton.click();
            // await sortOption.click();
        }
    }

    /**
     * Search for a taxon using the search form
     * @param searchString - The text to search for
     */
    async searchTaxon(searchString: string) {
        // Click the search button to open the search input
        const searchButton = this.page.getByTestId('Search taxon button');
        await searchButton.click();

        // Type in the search input
        const searchInput = this.page.getByTestId('Search taxon input form');
        await searchInput.fill(searchString);

        // Wait for debounce (500ms as per SearchForm.vue)
        await this.page.waitForTimeout(600);
    }

    /**
     * Click on the "see more" / "learn more" link for a taxon
     * @param taxon - The taxon object or identifier (currently not used, clicks first available link)
     */
    async seeMore(taxon: any) {
        const detailLink = this.page
            .getByTestId('Taxon detail redirect link')
            .first();
        await detailLink.click();
    }

    /**
     * Hover over or click the info icon to show the data source tooltip
     */
    async sourceTooltip() {
        const tooltipTrigger = this.page
            .locator('#data-source-credits i.bi-info-circle')
            .first();
        await tooltipTrigger.hover();
    }

    /**
     * Set a taxon class filter (e.g., 'Aves', 'Mammalia', etc.)
     * @param class_ - The class name to filter by
     */
    async setTaxonFilter(class_: string) {
        // Open the filter dropdown
        const filterButton = this.page.getByTestId(
            'Filter results by class button'
        );
        await filterButton.click();

        // Determine if it's Animalia or Plantae and click the appropriate filter
        // The component uses testid "Animalia results filter" or "Plantae results filter"
        // We need to find the specific class within these sections
        const filterItem = this.page
            .locator('.taxon-item')
            .filter({ hasText: class_ });
        await filterItem.click();
    }

    /**
     * Change the display mode between gallery and detailed list
     * @param mode - The mode to switch to ('gallery' or 'detailedList')
     */
    async changeMode(mode: string) {
        const modeButton = this.page.getByTestId('Mode toggle button');

        // Click the mode toggle button
        await modeButton.click();

        // Verify the mode changed by checking the icon
        if (mode === 'gallery') {
            await expect(
                modeButton.locator('i.fa-solid.fa-list')
            ).toBeVisible();
        } else if (mode === 'detailedList') {
            await expect(modeButton.locator('i.bi-grid-fill')).toBeVisible();
        }
    }

    /**
     * Get the number of taxons currently displayed
     */
    async getTaxonCount(): Promise<number> {
        const taxons = this.page.locator(
            '[data-testid="Taxon detailed view"], [data-testid="Taxon thumbnail view"]'
        );
        return await taxons.count();
    }

    /**
     * Get a specific taxon element by index
     */
    getTaxonByIndex(index: number): Locator {
        return this.page
            .locator(
                '[data-testid="Taxon detailed view"], [data-testid="Taxon thumbnail view"]'
            )
            .nth(index);
    }

    /**
     * Wait for taxons to load
     */
    async waitForTaxonsToLoad() {
        await this.page.waitForSelector(
            '[data-testid="Taxon detailed view"], [data-testid="Taxon thumbnail view"]',
            { timeout: 20000 }
        );
    }

    /**
     * Check if the list is in loading state
     */
    async isLoading(): Promise<boolean> {
        const loadingIndicator = this.page.locator('.loading-message'); // Adjust selector as needed
        return await loadingIndicator.isVisible().catch(() => false);
    }
}
