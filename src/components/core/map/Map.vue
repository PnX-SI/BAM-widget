<script setup>
    import ParameterStore from '@/lib/parameterStore';
    import { restoreMapState, toWKT } from '@/lib/utils';
    import { booleanClockwise, rewind } from '@turf/turf';
    import L from 'leaflet';
    import 'leaflet-draw';
    import 'leaflet-draw/dist/leaflet.draw.css';
    import { LocateControl } from 'leaflet.locatecontrol';
    import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
    import 'leaflet/dist/leaflet.css';
    import { computed, onMounted, ref, shallowRef, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { parse } from 'wellknown';
    import {
        DefaultIcon,
        drawConfig,
        hackForMapContainerResize,
    } from './MapConfig';

    import PlaceSearchForm from './PlaceSearchForm.vue';

    const { t } = useI18n();

    // Constants
    const DEFAULT_HEIGHT = '100vh';
    const OPEN_STREET_MAP_URL =
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const OPEN_STREET_MAP_ATTRIBUTION =
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    // Component Props
    const props = defineProps({
        height: {
            type: String,
            default: DEFAULT_HEIGHT,
        },
        editable: {
            type: Boolean,
            default: true,
        },
        forceEditable: {
            type: Boolean,
            default: false,
        },
    });

    const emit = defineEmits(['update:wkt']);

    // Store
    const { buffer, wkt, sourceGeometry, mapEditable, lang, x, y } =
        ParameterStore.getInstance();

    // Component Attributes
    const map = shallowRef();
    const locateControl = ref(null);
    const geometry = shallowRef(new L.FeatureGroup());
    const searchFormRef = ref(null);
    let drawEventData = null;
    const mapID = (Math.random() + 1).toString(36).substring(7);

    // Computed Properties
    const wktFromOutside = computed(() => !!wkt.value);
    const style = computed(() => `height: ${props.height} !important;`);
    let locate = null;

    function updateGeometryFromWKT() {
        if (wkt.value) {
            geometry.value.clearLayers();
            let tmp = L.geoJSON().addTo(geometry.value);
            tmp.addData(parse(wkt.value));
            focusOnGeometry();
            setTimeout(() => emit('update:wkt', wkt.value), 1000);
        }
    }

    function focusOnGeometry() {
        if (map.value) map.value.fitBounds(geometry.value.getBounds());
    }

    function updateGeometry() {
        if (!drawEventData) return;

        geometry.value.clearLayers();
        let layer = drawEventData.layer;
        let geojson = layer.toGeoJSON();

        if (!booleanClockwise(geojson)) {
            geojson = rewind(geojson);
        }

        const WKT = toWKT(
            geojson,
            drawEventData.layerType === 'circle' ? layer.getRadius() : null,
            drawEventData.layerType,
            buffer.value / 1000
        );

        if (
            drawEventData.layerType === 'marker' ||
            drawEventData.layerType === 'polyline'
        ) {
            let tmp = L.geoJSON().addTo(geometry.value);
            tmp.addData(parse(WKT));
        }

        wkt.value = WKT;

        const lat_long =
            drawEventData.layerType === 'marker' ? layer._latlng : null;
        x.value = lat_long?.lng ?? null;
        y.value = lat_long?.lat ?? null;

        sourceGeometry.value = null;
    }

    function handleLocationSelected(data) {
        geometry.value.clearLayers();
        const marker = L.marker([data.lat, data.lon], { icon: DefaultIcon });
        drawEventData = { layer: marker, layerType: 'marker' };
        geometry.value.addLayer(marker);
        updateGeometry();
        focusOnGeometry();
    }

    function handleGeolocation(event) {
        geometry.value.clearLayers();
        const marker = L.marker(event.latlng);
        drawEventData = { layer: marker, layerType: 'marker' };
        geometry.value.addLayer(marker);
        updateGeometry();
        locateControl.value.stop();
    }

    function handleGeometryCreation(event) {
        let layer = event.layer;
        drawEventData = event;
        geometry.value.clearLayers();
        geometry.value.addLayer(layer);
        updateGeometry();
    }

    function saveMapState() {
        const state = {
            center: map.value.getCenter(),
            zoom: map.value.getZoom(),
        };
        localStorage.setItem('mapState', JSON.stringify(state));
    }

    function setupMap() {
        map.value = L.map(`map-${mapID}`);
        restoreMapState(map.value);

        L.tileLayer(OPEN_STREET_MAP_URL, {
            maxZoom: 19,
            attribution: OPEN_STREET_MAP_ATTRIBUTION,
        }).addTo(map.value);

        hackForMapContainerResize(map.value, `map-${mapID}`);

        map.value.addLayer(geometry.value);

        if (wktFromOutside.value) {
            focusOnGeometry();
        }

        if (mapEditable.value) {
            /**
             * ADD DRAW GEOMETRY TOOLS
             */
            map.value.addControl(
                new L.Control.Draw(drawConfig(geometry.value))
            );

            /**
             * ADD GEOLOCATION TOOL
             */
            locateControl.value = new LocateControl({
                icon: 'fa-solid fa-location-crosshairs fa-xl',
            }).addTo(map.value);
        }

        map.value.on(L.Draw.Event.CREATED, handleGeometryCreation);
        map.value.on('locationfound', handleGeolocation);

        map.value.on('click', () => {
            if (searchFormRef.value) {
                searchFormRef.value.clearResults();
            }
        });
    }

    // Lifecycle Hooks
    onMounted(() => {
        setupMap();
        window.addEventListener('beforeunload', saveMapState);
        if (!wkt.value) {
            locateControl.value.start();
        }
    });

    updateGeometryFromWKT();

    // Watchers
    watch(wkt, updateGeometryFromWKT);
    watch([buffer, geometry], updateGeometry);
    if (!props.forceEditable) {
        watch(mapEditable, () => {
            map.value.off();
            map.value.remove();
            setupMap();
        });
    }
</script>

<template>
    <div style="position: relative">
        <PlaceSearchForm
            v-if="mapEditable"
            ref="searchFormRef"
            :placeholder="t('searchPlace.placeholder')"
            :loading-text="t('searchPlace.loadingText')"
            :error-text="t('searchPlace.errorText')"
            :no-results-text="t('searchPlace.noResultsText')"
            :language="lang"
            @location-selected="handleLocationSelected"
            :debounceDelay="300"
        />

        <div class="mapC" :id="`map-${mapID}`" :style="style"></div>
    </div>
</template>

<style scoped>
    .mapC {
        border-radius: 10px;
    }

    @media screen and (max-width: 770px) {
        .mapC {
            height: 50vh !important;
            margin-bottom: 1em;
            margin-top: 1em;
        }
    }
</style>
