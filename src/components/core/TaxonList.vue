<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import Loading from "@/components/commons/Loading.vue";
import Taxon from "@/components/core/Taxon.vue";
import Pagination from "@/components/commons/Pagination.vue";
import SortBy from "../commons/SortBy.vue";
import sortArray from "sort-array";
import { useI18n } from "vue-i18n";
import ParameterStore from "@/lib/parameterStore";

const { t } = useI18n();
const config = ParameterStore.getInstance();

const sortByAvailable = [
  { field_name: "vernacularName", label: t("taxon.vernacularName") },
  {
    field_name: "acceptedScientificName",
    label: t("taxon.scientificName"),
  },
  { field_name: "nbObservations", label: t("taxon.nbObservations") },
  { field_name: "lastSeenDate", label: t("taxon.lastSeenDate") },
];

const speciesList = ref([]);
const loadingObservations = ref(false);
const loadingError = ref(false);

const pageIndex = ref(0);
const itemsPerPage = ref(config.itemsPerPage);

const sortBy = ref("nbObservations");
const orderBy = ref("desc");

const searchString = ref("");

const props = defineProps({
  itemsPerPage: {
    type: Number,
  },
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
    default: "nbObservations",
    validator(value) {
      return [
        "vernacularName",
        "acceptedScientificName",
        "nbObservations",
        "lastSeenDate",
      ].includes(value);
    },
  },
  order: {
    type: String,
    default: "desc",
    validator(value) {
      return ["asc", "desc"].includes(value);
    },
  },
});

const nbTaxonPerLine =
  config.nbTaxonPerLine.value != undefined
    ? config.nbTaxonPerLine.value
    : props.nbTaxonPerLine;

if (props.sortBy) {
  sortBy.value = props.sortBy;
}
if (props.order) {
  orderBy.value = props.order;
}

const showFilters =
  config.showFilters.value != undefined
    ? config.showFilters.value
    : props.showFilters;

const classNames = computed(() => {
  const row_cols_md = nbTaxonPerLine === 1 ? 1 : nbTaxonPerLine / 2;
  return `row row-cols-1 row-cols-lg-${nbTaxonPerLine} row-cols-md-${row_cols_md} g-4`;
});

watch(pageIndex, () => {
  document.getElementById("taxon-list-content").scrollTo({
    top: 0,
    left: 0,
  });
});

watch(searchString, () => {
  pageIndex.value = 0;
});

const speciesListShowed = computed(() => {
  let filteredSpecies = speciesList.value;
  if (searchString.value !== "") {
    filteredSpecies = speciesList.value.filter(function (taxon) {
      const data =
        taxon?.vernacularName != undefined
          ? taxon.vernacularName + " " + taxon.acceptedScientificName
          : taxon.acceptedScientificName;
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

/**
 * Fetches the species list based on the given WKT geometry and populate the `speciesList` variable.
 * @param {string} wkt - The WKT geometry to filter by
 */

function fetchSpeciesList(wkt) {
  if (wkt.length === 0) return;
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
      speciesList.value = [];
      Object.values(response).forEach((observation) => {
        speciesList.value.push(observation);
      });
      loadingObservations.value = false;
      pageIndex.value = 0;
    })
    .catch((error) => {
      loadingObservations.value = false;
      loadingError.value = true;
    });
}
// Watch for geometry and parameters changes
watch([config.wkt, config.dateMin, config.dateMax], () => {
  if (config.wkt.value) {
    fetchSpeciesList(config.wkt.value);
  }
});

// If wkt given in the URL
if (config.wkt.value) {
  fetchSpeciesList(config.wkt.value);
}
</script>
<template>
  <div id="taxon-list" class="card">
    <div class="card-header" v-if="showFilters == true">
      <SearchForm
        @update:searchString="
          (newSearchString) => (searchString = newSearchString)
        "
      ></SearchForm>
      <SortBy
        :sort-by-available="sortByAvailable"
        @update:sortBy="(newsort) => (sortBy = newsort)"
        @update:orderBy="(neworder) => (orderBy = neworder)"
        :sortBy="sortBy"
        :orderBy="orderBy"
      ></SortBy>
    </div>
    <div class="card-body">
      <Loading id="loadingObs" :loadingStatus="loadingObservations" />
      <div
        id="no-observation-message"
        class="col-6"
        v-if="
          speciesListShowed.length == 0 && !loadingObservations && !loadingError
        "
      >
        <h5>{{ $t("drawGeometry") }}</h5>
        <h5>
          <i class="bi bi-square-fill"></i> <i class="bi bi-hexagon-fill"></i>
          <i class="bi bi-circle-fill"></i> <i class="bi bi-geo-fill"></i>
        </h5>
      </div>
      <div
        id="loading-error"
        class="col-6 bg-danger"
        v-if="loadingError == true"
      >
        <h5><i class="bi bi-bug"></i> Erreur de chargement des données</h5>
      </div>
      <div id="taxon-list-content" :class="classNames">
        <Taxon
          v-for="observation in speciesListShowed"
          :taxon="observation"
          :connector="config.connector.value"
          :key="observation.taxonId"
        />
      </div>
    </div>
    <div v-if="speciesListShowed.length > 0" class="card-footer">
      <Pagination
        :pageIndex="pageIndex"
        :total-items="speciesList.length"
        :itemPerPage="config.itemsPerPage.value"
        @update:page="(index) => (pageIndex = index)"
      />
    </div>
  </div>
</template>
<style scoped>
#taxon-list {
  margin-bottom: 3em;
  padding: 0;
  height: 100vh;
}
@media (max-width: 768px) {
  #taxon-list {
    margin-top: 2em;
  }
}

#taxon-list-content {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 80vh;
}
.card-body {
  overflow: hidden;
}

#loading-error,
#no-observation-message,
#loadingObs {
  border-radius: 10px;
  text-align: center;
  padding: 1em;
  width: 100%;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

#no-observation-message,
#loadingObs {
  background-color: var(--bs-secondary-bg);
  color: var(--bs-secondary-color);
}
#loading-error {
  color: white;
}
</style>
