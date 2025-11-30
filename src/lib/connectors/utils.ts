import { CONNECTORS } from './connectors';
import { GbifConnector } from './gbif';
import { GeoNatureConnector } from './geonature';
import { Connector } from './connector';
import { simplify } from '@turf/turf';

type ConnectorParams = Record<string, any>;

function getConnector(
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
 * Simplify a polygon by removing points while keeping the total number of points below a certain threshold (190).
 * The simplification is done by the turf.js simplify algorithm.
 * @param {Object} polygon - Polygon to be simplified.
 * @param {number} [tolerance=0.01] - Tolerance for simplification.
 * @param {number} [threshold=190] - Threshold for total number of points.
 * @returns {Object} - Simplified polygon.
 */
function simplifyPolygon(polygon, tolerance = 0.01, threshold = 190) {
    let simplified = simplify(polygon, { tolerance });
    let totalCoordinatesCount = getTotalCoordinatesCount(simplified);
    while (totalCoordinatesCount > threshold) {
        simplified = simplify(polygon, { tolerance });
        totalCoordinatesCount = getTotalCoordinatesCount(simplified);
    }
    return simplified;
}

function getTotalCoordinatesCount(polygon) {
    let totalCoordinatesCount = 0;
    if (polygon.type === 'MultiPolygon') {
        polygon.coordinates.forEach((multiPolygon) => {
            multiPolygon.forEach((polygon) => {
                totalCoordinatesCount += polygon.length;
            });
        });
    } else {
        totalCoordinatesCount += polygon.coordinates.length;
    }
    return totalCoordinatesCount;
}
export { getConnector, simplifyPolygon };
