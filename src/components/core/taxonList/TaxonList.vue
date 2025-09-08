<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Loading from "@/components/commons/Loading.vue";
import SortBy from "@/components/commons/SortBy.vue";
import SearchForm from "@/components/commons/SearchForm.vue";
import sortArray from "sort-array";
import ParameterStore from "@/lib/parameterStore";
import TaxonView from "./TaxonView.vue";
import DatasetList from "./DatasetList.vue";
import { TAXONLIST_DISPLAY_MODE } from "@/lib/enums";
import TaxonClassFilterBadge from "@/components/commons/TaxonClassFilterBadge.vue";

const { t } = useI18n();
const parameterStore = ParameterStore.getInstance();
const {
  hybridTaxonList,
  wkt,
  dateMin,
  dateMax,
  nbTaxonPerLine,
  showFilters,
  connector,
  mode,
  class: class_,
} = parameterStore;

const props = defineProps({
  nbTaxonPerLine: { type: Number },
  showFilters: { type: Boolean, default: true },
  sortBy: {
    type: String,
    default: "nbObservations",
    validator: (value) =>
      [
        "vernacularName",
        "acceptedScientificName",
        "nbObservations",
        "lastSeenDate",
      ].includes(value),
  },
  order: {
    type: String,
    default: "desc",
    validator: (value) => ["asc", "desc"].includes(value),
  },
  mode: {
    type: String,
    validator: (value) => Object.keys(TAXONLIST_DISPLAY_MODE).includes(value),
  },
});

nbTaxonPerLine.value = props.nbTaxonPerLine ?? nbTaxonPerLine.value;
mode.value = props.mode ?? mode.value;

const searchResult = ref({ taxonList: [], datasets: [] });
const speciesList = computed(() => searchResult.value.taxons);
const datasets = computed(() => searchResult.value.datasets);
const loadingObservations = ref(false);
const loadingError = ref(false);
const pageIndex = ref(0);
const sortBy = ref(props.sortBy || "lastSeenDate");
const orderBy = ref(props.order || "desc");
const filterClass = ref(null);
const searchString = ref("");

const sortByAvailable = [
  { field_name: "vernacularName", label: t("taxon.vernacularName") },
  { field_name: "acceptedScientificName", label: t("taxon.scientificName") },
  { field_name: "nbObservations", label: t("taxon.nbObservations") },
  { field_name: "lastSeenDate", label: t("taxon.lastSeenDate") },
];

function toggleMode() {
  mode.value =
    mode.value === TAXONLIST_DISPLAY_MODE.gallery
      ? TAXONLIST_DISPLAY_MODE.detailedList
      : TAXONLIST_DISPLAY_MODE.gallery;
}

const classNames = computed(() => {
  const row_cols_lg = nbTaxonPerLine.value;
  const row_cols_md = row_cols_lg === 1 ? 1 : Math.round(row_cols_lg / 2);
  const row_cols_sm = Math.round(row_cols_md / 2);
  return `row row-cols-${row_cols_sm} row-cols-lg-${row_cols_lg} row-cols-md-${row_cols_md} g-4`;
});

const speciesListShowed = computed(() => {
  let filteredSpecies = speciesList.value;

  if (searchString.value) {
    filteredSpecies = filteredSpecies.filter((taxon) => {
      const data = taxon?.vernacularName
        ? `${taxon.vernacularName} ${taxon.acceptedScientificName}`
        : taxon.acceptedScientificName || "incertae sedis";
      return data.toLowerCase().includes(searchString.value.toLowerCase());
    });
  }

  if (filterClass.value) {
    filteredSpecies = filteredSpecies.filter(
      (taxon) => taxon.class === filterClass.value
    );
  }

  return sortArray(filteredSpecies, {
    by: sortBy.value,
    order: orderBy.value,
  }).slice(0, (pageIndex.value + 1) * 20);
});

const noDataFound = computed(
  () =>
    wkt.value.length &&
    !loadingObservations.value &&
    !loadingError.value &&
    (!speciesList.value.length || speciesListShowed.value.length === 0)
);

const fetchSpeciesList = (wktParam) => {
  if (!wktParam.length) return;

  loadingObservations.value = true;
  loadingError.value = false;
  speciesList.value = [];

  connector.value
    .fetchOccurrence({
      geometry: wktParam,
      dateMin: dateMin.value,
      dateMax: dateMax.value,
      class: class_.value,
    })
    .then((response) => {
      searchResult.value = response;
      loadingObservations.value = false;
      pageIndex.value = 0;
    })
    .catch(() => {
      loadingObservations.value = false;
      loadingError.value = true;
    });
};

watch(searchString, () => {
  pageIndex.value = 0;
});

function onScroll(event) {
  const { scrollTop, clientHeight, scrollHeight } = event.target;
  const threshold = 50;

  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    pageIndex.value++;
  }
}

watch([wkt, class_, dateMin, dateMax, connector], () => {
  searchResult.value = { taxons: [], datasets: [] };
  if (wkt.value) fetchSpeciesList(wkt.value);
});

if (wkt.value) {
  searchResult.value = { taxons: [], datasets: [] };
  fetchSpeciesList(wkt.value);
}
</script>

<template>
  <div id="taxon-list" class="card">
    <div class="card-header" v-if="showFilters">
      <SearchForm
        @update:searchString="
          (newSearchString) => (searchString = newSearchString)
        "
      />
      <SortBy
        :sort-by-available="sortByAvailable"
        @update:sortBy="(newSort) => (sortBy = newSort)"
        @update:orderBy="(newOrder) => (orderBy = newOrder)"
        :sortBy="sortBy"
        :orderBy="orderBy"
      />
    </div>
    <div class="card-body">
      <Loading id="loadingObs" :loadingStatus="loadingObservations" />
      <div
        id="no-geometry-message"
        class="col-6"
        v-if="!wkt.length && !loadingObservations && !loadingError"
      >
        <h5>{{ $t("drawGeometry") }}</h5>
        <h5>
          <i class="bi bi-square-fill"></i> <i class="bi bi-hexagon-fill"></i>
          <i class="bi bi-circle-fill"></i> <i class="bi bi-geo-fill"></i>
        </h5>
      </div>
      <div id="no-observations-message" v-if="noDataFound">
        {{ $t("noSpeciesObserved") }}
      </div>
      <div id="loading-error" class="col-6 bg-danger" v-if="loadingError">
        <h5><i class="bi bi-bug"></i> Erreur de chargement des données</h5>
      </div>
      <div id="taxon-list-content" :class="classNames" @scroll="onScroll">
        <BTooltip>
          <template #target>
            <div
              class="justify-content-center toggleMode"
              v-if="hybridTaxonList"
            >
              <button class="btn btn-secondary" @click="toggleMode()">
                <i v-if="mode === 'gallery'" class="fa-solid fa-list"></i>
                <i v-else class="bi bi-grid-fill"></i>
              </button>
            </div>
          </template>
          {{ $t("TaxonListModeSelection") }}
        </BTooltip>
        <div class="justify-content-center filterDropdown">
          <TaxonClassFilterBadge
            @select:class="(newClass) => (filterClass = newClass)"
          ></TaxonClassFilterBadge>
        </div>
        <TaxonView
          v-for="observation in speciesListShowed"
          :key="observation.taxonId"
          :taxon="observation"
        />
      </div>
    </div>
    <div id="data-source-credits" class="text-center">
      <div v-if="wkt.length && !loadingObservations">
        <a
          href="https://si.ecrins-parcnational.com/blog/2025-08-BAM-widget-en.html"
          target="_blank"
        >
          <img
            src="https://geonature.fr/documents/autres/BAM/BAM-logo.png"
            height="30px"
            class="me-1"
          />
        </a>
        <strong>{{ speciesList.length }} {{ $t("taxon.taxonFound") }}</strong>
        {{ $t("in") }}
        <a
          :href="connector.getSourceUrl()"
          target="_blank"
          style="color: white; text-decoration: underline"
        >
          {{ connector.name }}
        </a>
        <BTooltip v-if="connector.sourceDetailMessage()">
          <template #target>
            <a style="color: white; text-decoration: underline" class="ms-1">
              <i class="bi bi-info-circle"></i>
            </a>
          </template>
          {{ connector.sourceDetailMessage() }}
        </BTooltip>
        <DatasetList
          v-if="datasets.length > 0"
          :datasets="datasets"
        ></DatasetList>
      </div>
    </div>
  </div>
</template>

<style scoped>
#taxon-list {
  padding: 0;
  height: 80vh;
  display: flex;
  flex-direction: column;
}
#taxon-list-content {
  overflow-y: scroll;
  overflow-x: hidden;
  padding: var(--bs-card-spacer-y) var(--bs-card-spacer-x);
}
.card-body {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0 !important;
}
#loading-error,
#no-geometry-message,
#no-observations-message,
#loadingObs {
  border-radius: 10px;
  text-align: center;
  padding: 1em;
  width: 100%;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
#no-geometry-message,
#loadingObs {
  background-color: var(--bs-secondary-bg);
  color: var(--bs-secondary-color);
}
#no-observations-message {
  background-color: var(--bs-warning);
  color: white;
}
#loading-error {
  color: white;
}
#data-source-credits {
  text-align: center;
  background: #aaa;
  color: white;
}
.toggleMode {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  width: max-content;
}
.filterDropdown {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: max-content;
}
.card-body {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.toggleMode button {
  padding: 5px 10px;
  width: 40px !important;
}
</style>
