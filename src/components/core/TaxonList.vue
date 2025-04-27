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

const pageIndex = ref(0);
const itemsPerPage = ref(config.itemsPerPage);

const sortBy = ref("nbObservations");
const orderBy = ref("desc");

const searchString = ref("");

const props = defineProps({
  width: {
    type: String,
    default: "400px",
  },
  height: {
    type: String,
    default: "100vh",
  },
  itemsPerPage: {
    type: Number,
  },
  nbTaxonPerLine: {
    type: Number,
    default: 1,
  },
  sortBy: {
    type: String,
    default: "acceptedScientificName",
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
    validator(value) {
      return ["asc", "desc"].includes(value);
    },
  },
});

if (props.sortBy) {
  sortBy.value = props.sortBy;
}
if (props.order) {
  orderBy.value = props.order;
}
// if (props.itemsPerPage) itemsPerPage.value = props.itemsPerPage;

const classNames = computed(() => {
  const row_cols_md = props.nbTaxonPerLine === 1 ? 1 : props.nbTaxonPerLine / 2;
  return `row row-cols-1 row-cols-lg-${props.nbTaxonPerLine} row-cols-md-${row_cols_md} g-4`;
});

watch(pageIndex, () => {
  document.getElementById("species-listing").scrollTo({
    top: 0,
    left: 0,
  });
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

function fetchSpeciesList(wkt) {
  if (wkt.length === 0) return;
  loadingObservations.value = true;

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
    });
}
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
  <div id="liste-taxons" class="card mb-3 h-100 p-0">
    <div class="card-header">
      <div class="input-group mb-2">
        <label for="search" class="input-group-text"
          ><i class="bi bi-search"></i
        ></label>
        <input
          type="text"
          name=""
          class="form-control"
          id="search"
          v-model="searchString"
        />
      </div>
      <SortBy
        :sort-by-available="sortByAvailable"
        @update:sortBy="(newsort) => (sortBy = newsort)"
        @update:orderBy="(neworder) => (orderBy = neworder)"
        sortBy="acceptedScientificName"
        orderBy="desc"
      ></SortBy>
    </div>
    <div class="card-body">
      <Loading id="loadingObs" :loadingStatus="loadingObservations" />
      <div
        id="no-observation-message"
        class="col-6"
        v-if="speciesListShowed.length == 0 && !loadingObservations"
      >
        <h5>{{ $t("drawGeometry") }}</h5>
        <h5>
          <i class="bi bi-square-fill"></i> <i class="bi bi-hexagon-fill"></i>
          <i class="bi bi-circle-fill"></i> <i class="bi bi-geo-fill"></i>
        </h5>
      </div>
      <div id="species-listing" :class="classNames">
        <Taxon
          v-for="observation in speciesListShowed"
          :taxonId="observation.taxonId"
          :scientific-name="observation.acceptedScientificName"
          :vernacular-name="observation.vernacularName"
          :description="observation.acceptedScientificName"
          :observationDate="observation.lastSeenDate"
          :count="observation.nbObservations"
          :rank="observation.taxonRank"
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
#species-listing {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 80vh;
}
.card-body {
  overflow: hidden;
}

#no-observation-message,
#loadingObs {
  background-color: var(--bs-secondary-bg);
  color: var(--bs-secondary-color);
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
</style>
