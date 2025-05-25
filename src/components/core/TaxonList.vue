<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Loading from "@/components/commons/Loading.vue";
import Taxon from "@/components/core/Taxon.vue";
import Pagination from "@/components/commons/Pagination.vue";
import SortBy from "../commons/SortBy.vue";
import SearchForm from "@/components/commons/SearchForm.vue";
import sortArray from "sort-array";
import ParameterStore from "@/lib/parameterStore";

const { t } = useI18n();
const config = ParameterStore.getInstance();

const props = defineProps({
  itemsPerPage: Number,
  nbTaxonPerLine: {
    type: Number,
    default: 1,
  },
  showFilters: {
    type: Boolean,
    default: true,
  },
  sortBy: {
    type: String,
    default: "lastSeenDate",
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
});

const speciesList = ref([]);
const loadingObservations = ref(false);
const loadingError = ref(false);
const noDataFound = ref(false);

const pageIndex = ref(0);
const itemsPerPage = ref(config.itemsPerPage);

const sortBy = ref(props.sortBy || "lastSeenDate");
const orderBy = ref(props.order || "desc");

const searchString = ref("");

const nbTaxonPerLine = config.nbTaxonPerLine.value ?? props.nbTaxonPerLine;
const showFilters = config.showFilters.value ?? props.showFilters;

const sortByAvailable = [
  { field_name: "vernacularName", label: t("taxon.vernacularName") },
  { field_name: "acceptedScientificName", label: t("taxon.scientificName") },
  { field_name: "nbObservations", label: t("taxon.nbObservations") },
  { field_name: "lastSeenDate", label: t("taxon.lastSeenDate") },
];

const classNames = computed(() => {
  const row_cols_md = nbTaxonPerLine === 1 ? 1 : nbTaxonPerLine / 2;
  return `row row-cols-1 row-cols-lg-${nbTaxonPerLine} row-cols-md-${row_cols_md} g-4`;
});

const speciesListShowed = computed(() => {
  let filteredSpecies = speciesList.value;
  if (searchString.value) {
    filteredSpecies = speciesList.value.filter((taxon) => {
      const data = taxon?.vernacularName
        ? `${taxon.vernacularName} ${taxon.acceptedScientificName}`
        : taxon.acceptedScientificName || "incertae sedis";
      return data.toLowerCase().includes(searchString.value.toLowerCase());
    });
  }
  return sortArray(filteredSpecies, {
    by: sortBy.value,
    order: orderBy.value,
  }).slice(
    pageIndex.value * itemsPerPage.value,
    (pageIndex.value + 1) * itemsPerPage.value
  );
});

const fetchSpeciesList = (wkt) => {
  if (!wkt.length) return;
  noDataFound.value = false;
  loadingObservations.value = true;
  loadingError.value = false;
  speciesList.value = [];
  config.connector.value
    .fetchOccurrence({
      geometry: wkt,
      dateMin: config.dateMin.value,
      dateMax: config.dateMax.value,
    })
    .then((response) => {
      speciesList.value = Object.values(response);
      noDataFound.value = !speciesList.value.length;
      loadingObservations.value = false;
      pageIndex.value = 0;
    })
    .catch(() => {
      loadingObservations.value = false;
      loadingError.value = true;
    });
};

watch(pageIndex, () => {
  document.getElementById("taxon-list-content").scrollTo({ top: 0, left: 0 });
});

watch(searchString, () => {
  pageIndex.value = 0;
});

watch([config.wkt, config.dateMin, config.dateMax], () => {
  if (config.wkt.value) {
    fetchSpeciesList(config.wkt.value);
  }
});

if (config.wkt.value) {
  fetchSpeciesList(config.wkt.value);
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
        @update:sortBy="(newsort) => (sortBy = newsort)"
        @update:orderBy="(neworder) => (orderBy = neworder)"
        :sortBy="sortBy"
        :orderBy="orderBy"
      />
    </div>
    <div class="card-body">
      <Loading id="loadingObs" :loadingStatus="loadingObservations" />
      <div
        id="no-geometry-message"
        class="col-6"
        v-if="!config.wkt.value.length && !loadingObservations && !loadingError"
      >
        <h5>{{ $t("drawGeometry") }}</h5>
        <h5>
          <i class="bi bi-square-fill"></i> <i class="bi bi-hexagon-fill"></i>
          <i class="bi bi-circle-fill"></i> <i class="bi bi-geo-fill"></i>
        </h5>
      </div>
      <div
        id="no-observations-message"
        v-if="
          config.wkt.value.length &&
          !loadingObservations &&
          !loadingError &&
          !speciesList.length
        "
      >
        {{ $t("noSpeciesObserved") }}
      </div>
      <div id="loading-error" class="col-6 bg-danger" v-if="loadingError">
        <h5><i class="bi bi-bug"></i> Erreur de chargement des données</h5>
      </div>
      <div id="taxon-list-content" :class="classNames">
        <Taxon
          v-for="observation in speciesListShowed"
          :key="observation.taxonId"
          :taxon="observation"
          :connector="config.connector.value"
        />
      </div>
    </div>
    <div v-if="speciesListShowed.length" class="card-footer">
      <Pagination
        :pageIndex="pageIndex"
        :total-items="speciesList.length"
        :itemPerPage="config.itemsPerPage.value"
        @update:page="(index) => (pageIndex = index)"
      />
    </div>
    <div id="data-source-credits">
      {{ $t("source.title") }} : {{ config.connector.value.name }}
    </div>
  </div>
</template>

<style scoped>
#taxon-list {
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

#taxon-list-content {
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1;
}

.card-body {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
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
  background: var(--bs-primary);
  color: white;
}
</style>
