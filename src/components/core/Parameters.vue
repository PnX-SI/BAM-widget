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
</script>

<template>
  <div class="card">
    <h4 class="card-header">
      {{ $t("parameters") }}
    </h4>
    <div class="card-body">
      <div id="parameters">
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
          <BFormCheckbox switch v-model="showFilters">
            {{ $t("showFilters") }}
          </BFormCheckbox>
        </div>

        <div class="parameter-section">
          <BFormCheckbox switch v-model="mapEditable">
            {{ $t("mapEditable") }}
          </BFormCheckbox>
        </div>

        <div class="parameter-section">
          <label>{{ $t("UseGeoJSONSource") }}</label>
          <BFormInput
            v-model="sourceGeometry"
            :placeholder="$t('IndicateGeoJSONUrl')"
          />
        </div>

        <div class="parameter-section">
          <label>{{ $t("TaxonListModeSelection") }}</label>
          <BFormSelect v-model="mode" :options="modeOptions" class="mt-1" />
        </div>

        <div class="parameter-section">
          <label>{{ $t("numberOfTaxonPerLine") }}</label>
          <BFormInput type="number" v-model="nbTaxonPerLine" />
        </div>

        <div class="parameter-section">
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
  height: 50vh;
  overflow-y: scroll;
}

.parameter-section {
  margin-top: 1rem;
}
</style>
