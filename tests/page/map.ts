import { type Page } from "@playwright/test";

export class Drawer {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  drawPolygon() {}
  drawRect() {}
  drawMarker() {}
  drawLine() {}
  drawCircle() {}
  useGeoLocation() {}
  drawTestGeometry() {} // draw a polygon for testing purposes
}
