import { ref, shallowRef, watch, Ref, ShallowRef } from 'vue';
import { getConnector } from './connectors/utils';
import {
    useRoute,
    useRouter,
    RouteLocationNormalizedLoaded,
    Router,
} from 'vue-router';
import { parse, stringify } from 'wellknown';
import { booleanClockwise, buffer, rewind, simplify } from '@turf/turf';
import { useI18n } from 'vue-i18n';
import { TAXONLIST_DISPLAY_MODE, WIDGET_TYPE } from './enums';
import { Connector } from './connectors/connector';
import { CONNECTORS } from './connectors/connectors';

import config from '@/assets/config';
import { isRunningOnMobile } from './utils';

class ParameterStore {
    /**
     * @type {ParameterStore | null}
     */
    private static instance: ParameterStore | null = null;

    /**
     * If a marker or line is given, a buffer is applied.
     * @type {Ref<number>}
     */
    buffer: Ref<number>;

    /**
     * WKT (Well-Known Text Representation of the search zone).
     * @type {Ref<string>}
     */
    wkt: Ref<string>;

    /**
     * Dates that define the period of observations.
     * @type {Ref<Date | null>}
     */
    dateMin: Ref<Date | null>;

    /**
     * @type {Ref<Date | null>}
     */
    dateMax: Ref<Date | null>;

    /**
     * Connector used to fetch observations data.
     * @type {ShallowRef<Connector>}
     */
    connector: ShallowRef<Connector>;

    /**
     * Number of taxa per line.
     * @type {Ref<number | null>}
     */
    nbTaxonPerLine: Ref<number | null>;

    /**
     * Are filters of the taxa list shown.
     * @type {Ref<boolean>}
     */
    showFilters: Ref<boolean>;

    /**
     * Can the geometry be changed on the map.
     * @type {Ref<boolean>}
     */
    mapEditable: Ref<boolean>;

    /**
     * Language of the widget.
     * @type {any}
     */
    lang: any;

    /**
     * Display mode of the taxon list (gallery or detailed).
     * @type {Ref<string>}
     */
    mode: Ref<string>;

    /**
     * URL of a GeoJSON.
     * @type {Ref<string | null>}
     */
    sourceGeometry: Ref<string | null>;

    /**
     * Taxa's class selected.
     * @type {Ref<string | null>}
     */
    class: Ref<string | null>;

    /**
     * Widget display mode.
     * @type {Ref<string>}
     */
    widgetType: Ref<string>;

    /**
     * If the user can switch between different modes of display in the taxon list.
     * @type {Ref<boolean>}
     */
    hybridTaxonList: Ref<boolean>;

    /**
     * Longitude.
     * @type {Ref<number | null>}
     */
    x: Ref<number | null>;

    /**
     * Latitude.
     * @type {Ref<number | null>}
     */
    y: Ref<number | null>;

    /**
     * URL template to redirect the user to a page different from the default one indicated by the connector to a data source.
     * @type {Ref<string | null>}
     */
    customDetailPage: Ref<string | null>;

    /**
     * The number of the most frequently observed species that will be displayed.
     * @type {Ref<number | null>}
     */
    nbDisplayedSpecies: Ref<number | null>;

    /**
     * Color of the footer.
     * @type {Ref<string | null>}
     */
    footerColor: Ref<string | null>;

    /**
     * Is the widget displayed on a mobile device.
     * @type {Ref<boolean>}
     */
    isMobile: Ref<boolean>;

    private constructor() {
        const { locale, availableLocales } = useI18n();
        const route = useRoute();
        const router = useRouter();
        const paramsFromUrl = route?.query;

        this.buffer = ref(config.RADIUS);
        this.wkt = ref(config.WKT);
        this.dateMin = ref(config.dateMin);
        this.dateMax = ref(config.dateMax);
        this.connector = shallowRef(getConnector(null, paramsFromUrl));
        this.nbTaxonPerLine = ref(config.nbTaxonPerLine);
        this.showFilters = ref(config.showFilters);
        this.mapEditable = ref(config.mapEditable);
        this.lang = locale;
        this.mode = ref(config.mode);
        this.sourceGeometry = ref(config.sourceGeometry);
        this.class = ref(config.class);
        this.widgetType = ref(config.widgetType);
        this.hybridTaxonList = ref(config.hybridTaxonList);
        this.x = ref(config.x);
        this.y = ref(config.y);
        this.customDetailPage = ref(config.customDetailPage);
        this.nbDisplayedSpecies = ref(config.nbDisplayedSpecies);
        this.footerColor = ref(config.footerColor);

        this.initializeFromUrl(paramsFromUrl, locale, availableLocales);

        this.setupWatchers(router, route);

        this.isMobile = ref(isRunningOnMobile());

        window.addEventListener('resize', () => {
            this.isMobile.value = isRunningOnMobile();
        });
    }

    public static getInstance(): ParameterStore {
        if (!ParameterStore.instance) {
            ParameterStore.instance = new ParameterStore();
        }
        return ParameterStore.instance;
    }

    private setupWatchers(
        router: Router,
        route: RouteLocationNormalizedLoaded
    ) {
        const paramsToWatch = [
            'buffer',
            'wkt',
            'dateMin',
            'dateMax',
            'nbTaxonPerLine',
            'showFilters',
            'lang',
            'mode',
            'class',
            'connector',
            'mapEditable',
            'sourceGeometry',
            'widgetType',
            'hybridTaxonList',
            'customDetailPage',
            'footerColor',
        ];

        paramsToWatch.forEach((param) => {
            watch(this[param as keyof ParameterStore], () => {
                router.replace({ path: route.path, query: this.getParams() });
            });
        });
    }

    public initializeFromUrl(
        paramsFromUrl: any,
        locale: any,
        availableLocales: string[]
    ) {
        if (!paramsFromUrl) return;

        const paramHandlers: Record<string, (value: string) => any> = {
            buffer: (value: string) => parseInt(value),
            radius: (value: string) => {
                this.buffer.value = parseInt(value);
            },
            wkt: (value: string) => validateWKT(value, this.buffer.value),
            sourceGeometry: async (value: string) => {
                this.sourceGeometry.value = value;
                try {
                    const response = await fetch(decodeURI(value));
                    const geojson = await response.json();
                    this.wkt.value = validateWKT(
                        stringify(geojson.geometry),
                        this.buffer.value
                    );
                    this.sourceGeometry.value = value;
                } catch (err) {
                    console.error(err);
                }
            },
            dateMin: (value: string) => new Date(value),
            dateMax: (value: string) => new Date(value),
            connector: (value: string) =>
                getConnector(CONNECTORS[value], { ...paramsFromUrl }),
            class: (value: string) =>
                Object.keys(this.connector.value.taxonClass2SourceID)?.includes(
                    value
                )
                    ? value
                    : null,
            nbTaxonPerLine: (value: string) => parseInt(value),
            showFilters: (value: string) => value === 'true',
            mapEditable: (value: string) => value === 'true',
            hybridTaxonList: (value: string) => value === 'true',
            lang: (value: string) =>
                availableLocales.includes(value) ? value : locale,
            mode: (value: string) =>
                Object.keys(TAXONLIST_DISPLAY_MODE).includes(value)
                    ? value
                    : TAXONLIST_DISPLAY_MODE.detailedList,
            widgetType: (value: string) =>
                Object.keys(WIDGET_TYPE).includes(value)
                    ? value
                    : WIDGET_TYPE.mapList,
            x: (value: string) => {
                const x = parseFloat(value);
                return -180 < x && x < 180 ? x : null;
            },
            y: (value: string) => {
                const y = parseFloat(value);
                return -90 < y && y < 90 ? y : null;
            },
            customDetailPage: (value: string) => value,
            nbDisplayedSpecies: (value: string) => parseInt(value),
            footerColor: (value: string) => value,
        };

        Object.entries(paramHandlers).forEach(([paramName, transformFn]) => {
            if (paramName in paramsFromUrl) {
                const value = paramsFromUrl[paramName];
                const paramRef = this[paramName as keyof ParameterStore];
                if (
                    paramRef &&
                    typeof paramRef === 'object' &&
                    'value' in paramRef
                ) {
                    paramRef.value = transformFn(value);
                } else if (['sourceGeometry', 'radius'].includes(paramName)) {
                    transformFn(value);
                }
            }
        });

        if (this.x.value && this.y.value) {
            this.wkt.value = validateWKT(
                stringify({
                    type: 'Point',
                    coordinates: [this.x.value, this.y.value],
                }),
                this.buffer.value
            );
        }
    }

    public getParams(): Record<string, any> {
        const params: Record<string, any> = {};
        Object.entries(this).forEach(([key, value]) => {
            if (
                value?.value !== undefined &&
                value.value !== null &&
                value.value !== ''
            ) {
                params[key] = value.value;
            }
        });
        params['connector'] = this.connector.value.name;
        const connectorParams = this.connector.value.getParams();
        Object.assign(params, connectorParams);
        if (params?.wkt) {
            // if another way to indicate the geolocation was given in parameter, drop the WKT generated
            if (
                params.sourceGeometry != null ||
                (params.x != null && params.y != null)
            ) {
                delete params.wkt;
            }
        }

        return params;
    }

    public static clearParameters(
        route: RouteLocationNormalizedLoaded,
        router: Router
    ) {
        router.replace({ path: route.path, query: {} });
        ParameterStore.instance = new ParameterStore();
    }
}

const validateWKT = (wkt: string | null, bufferSize: number): string | null => {
    if (wkt && (wkt.includes('POINT') || wkt.includes('LINESTRING'))) {
        let buffered = buffer(parse(wkt), bufferSize / 1000);
        if (wkt.includes('LINESTRING')) {
            buffered = simplify(buffered, {
                tolerance: 0.001,
                highQuality: true,
            });
        }
        return stringify(buffered);
    }
    let geojson = parse(wkt);
    if (!booleanClockwise(geojson)) {
        geojson = rewind(geojson);
        wkt = stringify(geojson);
    }

    return wkt;
};

export default ParameterStore;
