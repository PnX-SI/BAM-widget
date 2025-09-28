import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});

function drawConfig(featureGroup) {
    return {
        _onZoomEnd: function () {
            if (this._markers != null) {
                this._updateGuide();
            }
        },
        position: 'topleft',
        draw: {
            polygon: {
                drawError: {
                    color: '#e1e100', // Color the shape will turn when intersects
                    message: "<strong>Oh snap!<strong> you can't draw that!", // Message that will show when intersect
                },
                shapeOptions: {},
            },
            marker: { icon: DefaultIcon },
            circlemarker: false,
            circle: true, // Turns off this drawing tool
            rectangle: true,
        },
        edit: {
            featureGroup: featureGroup,
            remove: false,
        },
    };
}

L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
    readableArea: function (area, isMetric, precision) {
        // Also defaultPrecision copied from the module closure
        var defaultPrecision = {
            km: 2,
            ha: 2,
            m: 0,
            mi: 2,
            ac: 2,
            yd: 0,
            ft: 0,
            nm: 2,
        };

        var areaStr,
            units,
            type,
            // ^ Note type variable is added here
            precision = L.Util.extend({}, defaultPrecision, precision);

        if (isMetric) {
            units = ['ha', 'm'];
            type = typeof isMetric;
            if (type === 'string') {
                units = [isMetric];
            } else if (type !== 'boolean') {
                units = isMetric;
            }

            if (area >= 1000000 && units.indexOf('km') !== -1) {
                areaStr =
                    L.GeometryUtil.formattedNumber(
                        area * 0.000001,
                        precision['km']
                    ) + ' km²';
            } else if (area >= 10000 && units.indexOf('ha') !== -1) {
                areaStr =
                    L.GeometryUtil.formattedNumber(
                        area * 0.0001,
                        precision['ha']
                    ) + ' ha';
            } else {
                areaStr =
                    L.GeometryUtil.formattedNumber(area, precision['m']) +
                    ' m²';
            }
        } else {
            area /= 0.836127; // Square yards in 1 meter

            if (area >= 3097600) {
                //3097600 square yards in 1 square mile
                areaStr =
                    L.GeometryUtil.formattedNumber(
                        area / 3097600,
                        precision['mi']
                    ) + ' mi²';
            } else if (area >= 4840) {
                //4840 square yards in 1 acre
                areaStr =
                    L.GeometryUtil.formattedNumber(
                        area / 4840,
                        precision['ac']
                    ) + ' acres';
            } else {
                areaStr =
                    L.GeometryUtil.formattedNumber(area, precision['yd']) +
                    ' yd²';
            }
        }

        return areaStr;
    },
});
export { drawConfig, DefaultIcon };
