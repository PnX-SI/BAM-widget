import { expect, type Locator, type Page } from '@playwright/test';

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

type Point = [number, number];

const rect: Point[] = [
    [0, 0],
    [20, 20],
];

const polygon: Point[] = [
    [0.5, 0],
    [0.85, 0.15],
    [1, 0.5],
    [0.85, 0.85],
    [0.5, 1],
    [0.15, 0.85],
    [0, 0.5],
    [0.15, 0.15],
    [0.5, 0],
];

const line: Point[] = [
    [0, 1 / 2],
    [0.3, 1 / 2],
    [0.4, 1 / 2],
    [0.5, 1 / 2],
];

const circle: Point[] = [
    [1 / 2, 1 / 2],
    [1 / 2 + 1 / 3, 1 / 2 + 1 / 3],
];

const marker: Point = [1 / 3, 1 / 3];

enum DrawingTypeIdentifier {
    POLYGON = 'Draw a polygon',
    RECT = 'Draw a rectangle',
    MARKER = 'Draw a marker',
    LINE = 'Draw a polyline',
    CIRCLE = 'Draw a circle',
    GEOLOCATION = 'Show me where I am',
}

export class Drawer {
    readonly page: Page;
    readonly mapContainer: Locator;
    private box: BoundingBox;

    constructor(page: Page, map: Locator) {
        this.page = page;
        this.mapContainer = map;
    }
    async init() {
        if (!this.box) {
            this.box = await this.getBoundingBox();
        }
    }
    async focusOnMap() {
        await this.mapContainer.scrollIntoViewIfNeeded();
    }
    async getBoundingBox(): Promise<BoundingBox> {
        const box = await this.mapContainer.boundingBox();
        await expect(box).toBeDefined();
        // Here we reduce the box size to avoid clicking on the right tools
        box.x += box.width / 5;
        box.y += box.height / 5;
        box.width -= (box.width / 5) * 2;
        box.height -= (box.height / 5) * 2;
        return box;
    }

    async selectDrawingTool(button: DrawingTypeIdentifier) {
        if (button == DrawingTypeIdentifier.GEOLOCATION) {
            await this.mapContainer
                .getByRole('button', { name: button })
                .click();
        } else {
            await this.mapContainer.getByRole('link', { name: button }).click();
        }
    }

    async clickCoordinates(points: Point[]) {
        await this.init();
        for (const point of points) {
            await this.page.mouse.click(
                this.box.x + point[0] * this.box.width,
                this.box.y + point[1] * this.box.height
            );
            await this.page.waitForTimeout(200); // Wait a bit between clicks
        }
    }
    async dragAndDropCoordinates(points: Point[]) {
        await this.init();
        await this.page.mouse.move(
            this.box.x + points[0][0],
            this.box.y + points[0][1]
        );
        await this.page.mouse.down();
        await this.page.mouse.move(
            this.box.x + points[1][0],
            this.box.y + points[1][1]
        );
        await this.page.mouse.up();
    }

    async drawPolygon() {
        await this.selectDrawingTool(DrawingTypeIdentifier.POLYGON);
        await this.clickCoordinates(polygon);
    }
    async drawRect() {
        await this.selectDrawingTool(DrawingTypeIdentifier.RECT);
        await this.dragAndDropCoordinates(rect);
    }
    async drawMarker() {
        await this.selectDrawingTool(DrawingTypeIdentifier.MARKER);
        await this.clickCoordinates([marker]);
    }
    async drawLine() {
        await this.selectDrawingTool(DrawingTypeIdentifier.LINE);
        await this.clickCoordinates(line);
        await this.page.getByRole('link', { name: 'Finish' }).click();
    }
    async drawCircle() {
        await this.selectDrawingTool(DrawingTypeIdentifier.CIRCLE);
        await this.dragAndDropCoordinates(circle);
    }
    async useGeoLocation() {
        await this.mapContainer.locator('.leaflet-control-locate').click();
        await this.page.waitForTimeout(1000);
    }
    async drawTestGeometry() {
        await this.selectDrawingTool(DrawingTypeIdentifier.POLYGON);
        this.drawPolygon();
    }
}
