import { WIDGET_TYPE, TAXONLIST_DISPLAY_MODE } from '@/lib/enums';

const config = {
    RADIUS: import.meta.env.RADIUS || 500,
    WKT: import.meta.env.WKT || '',
    dateMin: import.meta.env.DATE_MIN || null,
    dateMax: import.meta.env.DATE_MAX || null,
    showFilters: import.meta.env.SHOW_FILTERS || false,
    mapEditable: import.meta.env.MAP_EDITABLE || true,
    lang: import.meta.env.LANG || 'fr',
    mode: import.meta.env.MODE || TAXONLIST_DISPLAY_MODE.detailedList,
    sourceGeometry: null,
    class: null,
    widgetType: import.meta.env.WIDGET_TYPE || WIDGET_TYPE.mapList,
    switchModeAvailable: import.meta.env.SWITCH_MODE_AVAILABLE || false,
    x: import.meta.env.X || null,
    y: import.meta.env.Y || null,
    customDetailPage: import.meta.env.CUSTOM_DETAILED_PAGE || null,
    nbTaxonPerLine: import.meta.env.NB_TAXON_PER_LINE || 2,
    nbDisplayedSpecies: import.meta.env.NB_DISPLAYED_SPECIES || null,
    primaryColor: import.meta.env.PRIMARY_COLOR || '444',
    filtersOnList: import.meta.env.FILTERS_ON_LIST || true,
};

export default config;
