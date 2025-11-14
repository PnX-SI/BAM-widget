import { WIDGET_TYPE, TAXONLIST_DISPLAY_MODE } from '@/lib/enums';

const config = {
    RADIUS: 500,
    WKT: '',
    dateMin: null,
    dateMax: null,
    showFilters: false,
    mapEditable: true,
    lang: 'fr',
    mode: TAXONLIST_DISPLAY_MODE.detailedList,
    sourceGeometry: null,
    class: null,
    widgetType: WIDGET_TYPE.mapList,
    modeSwitchAvailable: false,
    x: null,
    y: null,
    customDetailPage: null,
    nbTaxonPerLine: 2,
    nbDisplayedSpecies: null,
    footerColor: 'aaa',
    filterOnList: true,
};

export default config;
