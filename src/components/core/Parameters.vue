<script setup>
    import ParameterStore from '@/lib/parameterStore';
    import TaxonClassFilter from '../commons/TaxonClassFilter.vue';
    import DateFilter from './filters/DateFilter.vue';
    import BufferSizeFilter from './filters/BufferSizeFilter.vue';
    import SourceFilter from './filters/SourceFilter.vue';
    import MediaSourceSelector from './filters/MediaSourceSelector.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useI18n } from 'vue-i18n';
    import { computed } from 'vue';
    import { TAXONLIST_DISPLAY_MODE, WIDGET_TYPE } from '@/lib/enums';
    import HTMLBuilder from './HTMLBuilder.vue';
    import { MediaType } from '@/lib/models';
    const { t } = useI18n();

    const {
        dateMin,
        dateMax,
        showFilters,
        mapEditable,
        sourceGeometry,
        mode,
        widgetType,
        nbTaxonPerLine,
        switchModeAvailable,
        connector,
        customDetailPage,
        getParams,
        nbDisplayedSpecies,
        footerColor,
        filtersOnList,
    } = ParameterStore.getInstance();

    const router = useRouter();
    const route = useRoute();

    const host = window.location.origin;
    const pathName = window.location.pathname;

    const link = computed(() => {
        const paramsArray = Object.entries(
            ParameterStore.getInstance().getParams()
        ).map(([key, value]) => `${key}=${value}`);

        const params = paramsArray.length ? `?${paramsArray.join('&')}` : '';

        return `${host}${pathName}#/${params}`;
    });

    const modeOptions = computed(() => {
        return [
            {
                value: TAXONLIST_DISPLAY_MODE.gallery,
                text: t('mode.galleryMode'),
            },
            {
                value: TAXONLIST_DISPLAY_MODE.detailedList,
                text: t('mode.detailedList'),
            },
        ];
    });

    const widgetTypeOptions = computed(() => {
        return [
            { value: WIDGET_TYPE.mapList, text: t('widgetType.default') },
            { value: WIDGET_TYPE.list, text: t('widgetType.list') },
        ];
    });

    const colorWithHash = computed({
        get: () => (footerColor.value ? `#${footerColor.value}` : '#000000'),
        set: (newValue) => {
            footerColor.value = newValue.replace('#', '');
        },
    });
</script>

<template>
    <div id="left-panel">
        <div class="card">
            <h3 class="card-header">
                <i class="bi bi-gear-fill"></i> {{ $t('parameters') }}
            </h3>
            <div class="card-body" id="parameters">
                <div class="col text-center p-2">
                    <label
                        >{{ $t('drawGeometry') }}
                        <i class="fa-solid fa-location-dot"></i
                    ></label>
                    <Map
                        :forceEditable="true"
                        :editable="true"
                        height="350px"
                        class="mt-2"
                    ></Map>
                </div>
                <div class="col text-center mt-3">
                    <h5>{{ $t('or') }}</h5>
                </div>
                <div class="parameter-section text-center">
                    <BFormInput
                        v-model="sourceGeometry"
                        :placeholder="$t('IndicateGeoJSONUrl')"
                    />
                </div>
                <hr />

                <div class="parameter-section">
                    <BFormCheckbox switch v-model="showFilters">
                        <strong
                            >{{ $t('showFilters') }}
                            <i class="bi bi-sort-down"></i
                        ></strong>
                    </BFormCheckbox>
                </div>

                <div
                    class="parameter-section"
                    v-if="widgetType === WIDGET_TYPE.mapList"
                >
                    <BFormCheckbox switch v-model="mapEditable">
                        <strong
                            >{{ $t('mapEditable') }}
                            <i class="fa-solid fa-map"></i
                        ></strong>
                    </BFormCheckbox>
                </div>

                <div class="parameter-section">
                    <BufferSizeFilter />
                </div>

                <div class="row">
                    <div class="col-6">
                        <DateFilter
                            id="startDate"
                            label="Date min."
                            :currentDate="dateMin"
                            @update:date="(newDate) => (dateMin = newDate)"
                        />
                    </div>
                    <div class="col-6">
                        <DateFilter
                            id="endDate"
                            label="Date max."
                            :currentDate="dateMax"
                            @update:date="(newDate) => (dateMax = newDate)"
                        />
                    </div>
                </div>

                <div class="parameter-section">
                    <TaxonClassFilter />
                </div>

                <div class="parameter-section">
                    <label
                        >{{ $t('UseCustomDetailPage') }}
                        <i class="fa-solid fa-link"></i
                    ></label>
                    <BFormInput
                        v-model="customDetailPage"
                        :placeholder="
                            $t('IndicateDetailTemplateUrl') + '{taxonID}'
                        "
                    />
                </div>

                <div class="parameter-section">
                    <label
                        >{{ $t('TaxonListModeSelection') }}
                        <span
                            ><i class="fa-solid fa-list"></i> |
                            <i class="fa-solid fa-grip-vertical"></i></span
                    ></label>
                    <BFormSelect
                        v-model="mode"
                        :options="modeOptions"
                        class="mt-1"
                    />
                </div>

                <div class="parameter-section">
                    <BFormCheckbox switch v-model="switchModeAvailable">
                        <strong>{{ $t('mode.isTaxonListHybrid') }} </strong>
                    </BFormCheckbox>
                </div>

                <div class="parameter-section">
                    <label
                        >{{ $t('widgetTypeSelection') }}
                        <i class="fa-solid fa-display"></i
                    ></label>
                    <BFormSelect
                        v-model="widgetType"
                        :options="widgetTypeOptions"
                        class="mt-1"
                    />
                </div>
                <div class="parameter-section">
                    <label
                        >{{ $t('numberOfTaxonPerLine') }}
                        <i class="bi bi-123"></i>
                    </label>
                    <BFormInput type="number" v-model="nbTaxonPerLine" />
                </div>
                <div class="parameter-section">
                    <label
                        >{{ $t('nbDisplayedSpecies') }}
                        <i class="bi bi-123"></i>
                    </label>
                    <BFormInput
                        type="number"
                        v-model="nbDisplayedSpecies"
                        min="0"
                    />
                </div>

                <div class="parameter-section">
                    <label
                        >{{ $t('footerColor') }}
                        <i class="bi bi-palette-fill"></i>
                    </label>
                    <div class="d-flex align-items-center gap-2 mt-1">
                        <BFormInput
                            type="color"
                            v-model="colorWithHash"
                            class="color-picker"
                        />
                        <BFormInput
                            type="text"
                            v-model="footerColor"
                            placeholder="FFFFFF"
                            maxlength="6"
                            class="flex-grow-1"
                        />
                    </div>
                </div>

                <div class="parameter-section">
                    <BFormCheckbox switch v-model="filtersOnList">
                        <strong
                            >{{ $t('filtersOnList') }}
                            <i class="bi bi-funnel-fill"></i
                        ></strong>
                    </BFormCheckbox>
                </div>

                <div class="parameter-section">
                    <MediaSourceSelector
                        :mediaSourceID="connector.imageSource.id"
                        :typeMedia="MediaType.image"
                    />
                </div>

                <div class="parameter-section">
                    <MediaSourceSelector
                        :mediaSourceID="connector.soundSource.id"
                        :typeMedia="MediaType.sound"
                    />
                </div>
                <div class="parameter-section">
                    <SourceFilter />
                </div>
                <div class="d-flex justify-content-center parameter-section">
                    <BButton
                        variant="danger"
                        @click="ParameterStore.clearParameters(route, router)"
                    >
                        <i class="bi bi-arrow-clockwise"></i>
                        {{ $t('RefreshFilters') }}
                    </BButton>
                </div>
            </div>
        </div>
        <div class="mt-2">
            <HTMLBuilder :link="link"></HTMLBuilder>
        </div>
    </div>
</template>

<style scoped>
    label {
        font-weight: bold;
    }

    #parameters {
        overflow-y: scroll;
        height: 50vh;
    }

    .parameter-section {
        margin-top: 1rem;
    }

    .color-picker {
        width: 60px;
        height: 38px;
        padding: 2px;
        cursor: pointer;
    }
</style>
