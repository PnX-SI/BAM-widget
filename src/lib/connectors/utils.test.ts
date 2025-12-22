import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getConnector, removeHoles, simplifyPolygon } from './utils';
import { Polygon, MultiPolygon } from 'geojson';
function circleCoords(numPoints: number): any {
    const radius = 5;
    const points = Array.from({ length: numPoints }, (_, i) => {
        const angle = (i / numPoints) * Math.PI * 2;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    });
    points.push(points[0]);
    return points;
}
function generatePolygon(numPoints: number): Polygon {
    return {
        type: 'Polygon',
        coordinates: [circleCoords(numPoints)],
    };
}

// Mock the connector classes
vi.mock('./gbif', () => ({
    GbifConnector: class {
        params: any;
        type: string;
        constructor(params: any) {
            this.params = params;
            this.type = 'GBIF';
        }
    },
}));

vi.mock('./geonature', () => ({
    GeoNatureConnector: class {
        params: any;
        type: string;
        constructor(params: any) {
            this.params = params;
            this.type = 'GeoNature';
        }
    },
}));

describe('getConnector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return GbifConnector when GBIF is specified', () => {
        const params = {};
        const connector = getConnector('GBIF', params);

        expect(connector).toBeDefined();
        expect(connector).toHaveProperty('type', 'GBIF');
    });

    it('should return GeoNatureConnector when GeoNature is specified', () => {
        const params = {};
        const connector = getConnector('GeoNature', params);

        expect(connector).toBeDefined();
        expect(connector).toHaveProperty('type', 'GeoNature');
    });

    it('should return GbifConnector as default when no connector name is provided', () => {
        const connector = getConnector();

        expect(connector).toBeDefined();
        expect(connector).toHaveProperty('type', 'GBIF');
    });

    it('should return GbifConnector as default when invalid connector name is provided', () => {
        const connector = getConnector('InvalidConnector' as any);

        expect(connector).toBeDefined();
        expect(connector).toHaveProperty('type', 'GBIF');
    });

    it('should pass empty params object if not provided', () => {
        const connector = getConnector('GBIF');

        expect(connector).toBeDefined();
        expect(connector).toHaveProperty('params', {});
    });
});

describe('Remove inner rings', () => {
    it('should remove inner rings', () => {
        const multiPolygon: Polygon = {
            type: 'Polygon',
            coordinates: [[circleCoords(100)], [circleCoords(100)]],
        };
        const result = removeHoles(multiPolygon);
        expect(result.type).toBe('Polygon');
        expect(result.coordinates.length).toBe(1);
    });
});

describe('simplifyPolygon', () => {
    describe('Polygon simplification', () => {
        it('should simplify a complex polygon to fewer coordinates', () => {
            const simplified = simplifyPolygon(generatePolygon(250));

            const coordCount = simplified.coordinates.reduce(
                (sum, ring) => sum + ring.length,
                0
            );
            expect(coordCount).toBeLessThanOrEqual(190);
            expect(coordCount).toBeGreaterThan(10);
        });

        it('should round coordinates to 5 decimal places', () => {
            const polygon: Polygon = {
                type: 'Polygon',
                coordinates: [
                    [
                        [0.123456789, 0.987654321],
                        [1.111111111, 1.222222222],
                        [2.333333333, 2.444444444],
                        [3.555555555, 3.666666666],
                        [4.777777777, 4.888888888],
                        [5.999999999, 5.111111111],
                        [6.222222222, 6.333333333],
                        [7.444444444, 7.555555555],
                        [8.666666666, 8.777777777],
                        [9.888888888, 9.999999999],
                        [0.123456789, 0.987654321],
                    ],
                ],
            };

            const simplified = simplifyPolygon(polygon);

            simplified.coordinates[0].forEach((coord) => {
                const decimalPlaces = (num: number) => {
                    const str = num.toString();
                    const decimalIndex = str.indexOf('.');
                    return decimalIndex === -1
                        ? 0
                        : str.length - decimalIndex - 1;
                };
                expect(decimalPlaces(coord[0])).toBeLessThanOrEqual(5);
                expect(decimalPlaces(coord[1])).toBeLessThanOrEqual(5);
            });
        });

        it('should keep polygon under threshold even with custom threshold', () => {
            const simplified = simplifyPolygon(
                generatePolygon(250),
                0.001,
                100
            );

            const coordCount = simplified.coordinates.reduce(
                (sum, ring) => sum + ring.length,
                0
            );
            expect(coordCount).toBeLessThanOrEqual(100);
            expect(coordCount).toBeGreaterThan(10);
        });

        it('should handle polygon already under threshold', () => {
            const simplePolygon: Polygon = {
                type: 'Polygon',
                coordinates: [
                    [
                        [0, 0],
                        [1, 0],
                        [1, 1],
                        [0, 1],
                        [0, 0],
                    ],
                ],
            };

            const simplified = simplifyPolygon(simplePolygon);

            expect(simplified.type).toBe('Polygon');
            expect(simplified.coordinates.length).toBe(1);
            const coordCount = simplified.coordinates.reduce(
                (sum, ring) => sum + ring.length,
                0
            );
            expect(coordCount).toBeGreaterThan(3);
        });

        it('should use custom initial tolerance', () => {
            const simplified = simplifyPolygon(generatePolygon(200), 0.01);

            const coordCount = simplified.coordinates.reduce(
                (sum, ring) => sum + ring.length,
                0
            );
            expect(coordCount).toBeLessThanOrEqual(190);
            expect(coordCount).toBeGreaterThan(10);
        });
    });

    describe('MultiPolygon simplification', () => {
        it('should simplify a MultiPolygon', () => {
            const multiPolygon: MultiPolygon = {
                type: 'MultiPolygon',
                coordinates: [[circleCoords(100)], [circleCoords(100)]],
            };

            const simplified = simplifyPolygon(multiPolygon);

            expect(simplified.type).toBe('MultiPolygon');
            const totalCoords = simplified.coordinates.reduce(
                (sum, polygon) =>
                    sum +
                    polygon.reduce((ringSum, ring) => ringSum + ring.length, 0),
                0
            );
            expect(totalCoords).toBeLessThanOrEqual(190);
            expect(totalCoords).toBeGreaterThan(10);
        });

        it('should round MultiPolygon coordinates to 5 decimal places', () => {
            const multiPolygon: MultiPolygon = {
                type: 'MultiPolygon',
                coordinates: [
                    [
                        [
                            [0.123456789, 0.987654321],
                            [1.111111111, 1.222222222],
                            [2.333333333, 2.444444444],
                            [3.555555555, 3.666666666],
                            [4.777777777, 4.888888888],
                            [5.999999999, 5.111111111],
                            [6.222222222, 6.333333333],
                            [7.444444444, 7.555555555],
                            [8.666666666, 8.777777777],
                            [9.888888888, 9.999999999],
                            [0.123456789, 0.987654321],
                        ],
                    ],
                ],
            };

            const simplified = simplifyPolygon(multiPolygon);

            simplified.coordinates[0][0].forEach((coord) => {
                expect(coord[0]).toBeCloseTo(
                    Math.round(coord[0] * 100000) / 100000
                );
                expect(coord[1]).toBeCloseTo(
                    Math.round(coord[1] * 100000) / 100000
                );
            });
        });
    });

    describe('Edge cases', () => {
        it('should stop after maximum iterations', () => {
            // Create a complex polygon with varied coordinates to avoid degeneracy

            const veryComplexPolygon: Polygon = {
                type: 'Polygon',
                coordinates: [circleCoords(500)],
            };

            const simplified = simplifyPolygon(veryComplexPolygon, 0.001);

            expect(simplified).toBeDefined();
            expect(simplified.type).toBe('Polygon');
            const coordCount = simplified.coordinates.reduce(
                (sum, ring) => sum + ring.length,
                0
            );
            expect(coordCount).toBeGreaterThan(3);
        });

        it('should preserve geometry type', () => {
            const polygon: Polygon = {
                type: 'Polygon',
                coordinates: [
                    [
                        [0, 0],
                        [0.5, 0],
                        [1, 0],
                        [1, 0.5],
                        [1, 1],
                        [0.5, 1],
                        [0, 1],
                        [0, 0.5],
                        [0, 0.25],
                        [0, 0.75],
                        [0, 0],
                    ],
                ],
            };

            const simplified = simplifyPolygon(polygon);
            expect(simplified.type).toBe('Polygon');

            const multiPolygon: MultiPolygon = {
                type: 'MultiPolygon',
                coordinates: [
                    [
                        [
                            [0, 0],
                            [0.5, 0],
                            [1, 0],
                            [1, 0.5],
                            [1, 1],
                            [0.5, 1],
                            [0, 1],
                            [0, 0.5],
                            [0, 0.25],
                            [0, 0.75],
                            [0, 0],
                        ],
                    ],
                ],
            };

            const simplifiedMulti = simplifyPolygon(multiPolygon);
            expect(simplifiedMulti.type).toBe('MultiPolygon');
        });
    });
});
