import { CONNECTORS } from './connectors';
import { GbifConnector } from './gbif';
import { GeoNatureConnector } from './geonature';
import { Connector } from './connector';
import { simplify } from '@turf/turf';
import { Feature, Polygon, MultiPolygon } from 'geojson';

type ConnectorParams = Record<string, any>;

export function getConnector(
    connectorName: keyof typeof CONNECTORS = 'GBIF',
    params: ConnectorParams = {}
): Connector {
    switch (connectorName) {
        case CONNECTORS.GBIF:
            return new GbifConnector(params);
        case CONNECTORS.GeoNature:
            return new GeoNatureConnector(params);
        default:
            return new GbifConnector(params);
    }
}

/**
 Simplify a polygon by removing points while keeping the total number of points below a certain threshold (190).
 * The simplification is done by the turf.js simplify algorithm.
 * Coordinates are rounded to 5 decimal places.
 * @param {Polygon | MultiPolygon} geometry - The geometry to simplify.
 * @param {number} [initialTolerance=0.001] - The initial tolerance for the simplification algorithm.
 * @param {number} [threshold=190] - The maximum number of coordinates in the simplified polygon.
 * @returns {Polygon | MultiPolygon} The simplified polygon or multi-polygon.
 */
export function simplifyPolygon(
    geometry: Polygon | MultiPolygon,
    initialTolerance = 0.001,
    threshold = 190
): Polygon | MultiPolygon {
    let tolerance = initialTolerance;

    const feature: Feature<Polygon | MultiPolygon> = {
        type: 'Feature',
        properties: {},
        geometry,
    };

    let simplifiedFeature = simplify(feature, {
        tolerance,
        highQuality: false,
    });

    let totalPoints = countCoordinates(simplifiedFeature.geometry);
    let iterations = 0;

    while (totalPoints > threshold && iterations < 20) {
        tolerance *= 1.5;

        simplifiedFeature = simplify(feature, {
            tolerance,
            highQuality: false,
        });

        totalPoints = countCoordinates(simplifiedFeature.geometry);
        iterations++;
    }

    return roundCoordinates(simplifiedFeature.geometry, 5);
}

/**
 * Count the total number of coordinates in a polygon or multi-polygon.
 * @param {Polygon | MultiPolygon} geometry - The polygon or multi-polygon to count the coordinates of.
 * @returns {number} The total number of coordinates in the polygon or multi-polygon.
 */
function countCoordinates(geometry: Polygon | MultiPolygon): number {
    if (geometry.type === 'Polygon') {
        return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
    }

    // MultiPolygon
    return geometry.coordinates.reduce(
        (sum, polygon) =>
            sum + polygon.reduce((ringSum, ring) => ringSum + ring.length, 0),
        0
    );
}

/**
 * Rounds the coordinates of a polygon or multi-polygon to a given number of decimals.
 * @param {T} geometry - The polygon or multi-polygon to round the coordinates of.
 * @param {number} decimals - The number of decimals to round to.
 * @returns {T} The polygon or multi-polygon with rounded coordinates.
 */
function roundCoordinates<T extends Polygon | MultiPolygon>(
    geometry: T,
    decimals: number
): T {
    const factor = Math.pow(10, decimals);
    const round = (n: number) => Math.round(n * factor) / factor;

    const clone: T = JSON.parse(JSON.stringify(geometry));

    const roundRing = (ring: number[][]) =>
        ring.map((coord) => [round(coord[0]), round(coord[1])]);

    if (clone.type === 'Polygon') {
        clone.coordinates = clone.coordinates.map(roundRing);
    } else {
        clone.coordinates = clone.coordinates.map((polygon) =>
            polygon.map(roundRing)
        );
    }

    return clone;
}
