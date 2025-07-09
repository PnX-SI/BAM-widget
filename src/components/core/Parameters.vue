<script setup>
import ParameterStore from "@/lib/parameterStore";
import TaxonClassFilter from "../commons/TaxonClassFilter.vue";
import DateFilter from "./filters/DateFilter.vue";
import BufferSizeFilter from "./filters/BufferSizeFilter.vue";
import SourceFilter from "./filters/SourceFilter.vue";
import MediaSourceSelector from "./filters/MediaSourceSelector.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
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
} = ParameterStore.getInstance();

const router = useRouter();
const route = useRoute();

const modeOptions = computed(() => {
  return [
    { value: "gallery", text: t("galleryMode") },
    { value: "detailedList", text: t("detailedList") },
  ];
});

const widgetTypeOptions = computed(() => {
  return [
    { value: "default", text: t("widgetType.default") },
    { value: "list", text: t("widgetType.list") },
  ];
});
</script>

<template>
  <div class="card">
    <h4 class="card-header">
      {{ $t("parameters") }}
    </h4>
    <div class="card-body">
      <div id="parameters">
        <div class="col text-center">
          <label>{{ $t('drawGeometry') }} <i class="fa-solid fa-location-dot"></i></label>
          <Map :forceEditable="true" :editable="true" height="40vh" class="mt-2"></Map>
        </div>

        <div class="parameter-section">
          <BFormCheckbox switch v-model="showFilters">
            <strong>{{ $t("showFilters") }} <i class="bi bi-sort-down"></i></strong>
          </BFormCheckbox>
        </div>

        <div class="parameter-section" v-if="widgetType === 'default'">
          <BFormCheckbox switch v-model="mapEditable">
            <strong>{{ $t("mapEditable") }} <i class="fa-solid fa-map"></i></strong>
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
          <label>{{ $t("UseGeoJSONSource") }} <i class="fa-solid fa-link"></i></label>
          <BFormInput
            v-model="sourceGeometry"
            :placeholder="$t('IndicateGeoJSONUrl')"
          />
        </div>

        <div class="parameter-section">
          
          <label>{{ $t("TaxonListModeSelection") }} <span><i class="fa-solid fa-list"></i> | 
            <i class="fa-solid fa-grip-vertical"></i></span></label>
          <BFormSelect v-model="mode" :options="modeOptions" class="mt-1" />
        </div>

        <div class="parameter-section">
          <label>{{ $t("widgetTypeSelection") }} <i class="fa-solid fa-display"></i></label>
          <BFormSelect v-model="widgetType" :options="widgetTypeOptions" class="mt-1" />
        </div>

        <div class="parameter-section">
          <label>{{ $t("numberOfTaxonPerLine") }} <i class="bi bi-123"></i> </label>
          <BFormInput type="number" v-model="nbTaxonPerLine" />
        </div>

        <div class="parameter-section" >
          <MediaSourceSelector />
        </div>

        <div class="d-flex justify-content-center parameter-section">
          <BButton
            variant="danger"
            @click="ParameterStore.clearParameters(route, router)"
          >
            <i class="bi bi-arrow-clockwise"></i> {{ $t("RefreshFilters") }}
          </BButton>
        </div>
      </div>
    </div>
  </div>

  <div class="parameter-section">
    <SourceFilter />
  </div>
</template>

<style scoped>
#parameters {
  background-color: white;
}

label {
  font-weight: bold;
}

.card-body {
  height: 60vh;
  overflow-y: scroll;
}

.parameter-section {
  margin-top: 1rem;
}
</style>
