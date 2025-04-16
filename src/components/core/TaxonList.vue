<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import Loading from "@/components/commons/Loading.vue";
import Taxon from "@/components/core/Taxon.vue";
import Pagination from "@/components/commons/Pagination.vue";
import SortBy from "../commons/SortBy.vue";
import { getConnector } from "@/lib/connectors/utils";
import sortArray from "sort-array";

const partsOfTheDay = ["twilight", "afternoon", "morning", "evening"];

const sortByAvailable = [
  "vernacularName",
  "acceptedScientificName",
  "nbObservations",
];
const WKT = ref(null);
const dateMin = ref(null);
const dateMax = ref(null);
const connector = ref(getConnector());

const speciesList = ref([]);
const loadingObservations = ref(false);

const pageIndex = ref(0);
const itemsPerPage = ref(10);

const sortBy = ref("nbObservations");
const order = ref("desc");

const props = defineProps({
  wkt: String,
  itemPerPage: Number,
  dateMin: String,
  dateMax: {
    type: String,
    default: "2025-01-01",
  },
  width: {
    type: String,
    default: "400px",
  },
  height: {
    type: String,
    default: "100vh",
  },
  connector: {
    type: Object,
    required: true,
  },
  nbTaxonPerLine: {
    type: Number,
    default: 1,
  },
  sortBy: {
    type: String,
    default: "vernacularName",
    validator(value) {
      return [
        "vernacularName",
        "acceptedScientificName",
        "nbObservations",
      ].includes(value);
    },
  },
  order: {
    type: String,
    default: "asc",
    validator(value) {
      return ["asc", "desc"].includes(value);
    },
  },
});

watchEffect(() => {
  if (props.sortBy) {
    sortBy.value = props.sortBy;
  }
  if (props.order) {
    order.value = props.order;
  }
});

const classNames = computed(() => {
  const row_cols_md = props.nbTaxonPerLine === 1 ? 1 : props.nbTaxonPerLine / 2;
  return `row row-cols-1 row-cols-lg-${props.nbTaxonPerLine} row-cols-md-${row_cols_md} g-4`;
});

if (props.wkt) {
  WKT.value = props.wkt;
}

watch(pageIndex, () => {
  document.getElementById("species-listing").scrollTo({
    top: 0,
    left: 0,
  });
});

watchEffect(() => {
  connector.value = props.connector;
  WKT.value = props.wkt;
  const date_changed =
    dateMin.value != props.dateMin || dateMax.value != props.dateMax;
  dateMin.value = props.dateMin;
  dateMax.value = props.dateMax;
  if (WKT.value || (date_changed && connector.value)) {
    refreshSpeciesList(WKT.value);
  }
  itemsPerPage.value = props.itemPerPage;
});

const speciesListShowed = computed(() => {
  let sorted = sortArray(speciesList.value, {
    by: sortBy.value,
    order: order.value,
  }).slice(
    pageIndex.value * itemsPerPage.value,
    (pageIndex.value + 1) * itemsPerPage.value
  );
  console.log("species list", sorted);
  return sorted;
});

function refreshSpeciesList(wkt) {
  if (wkt.length === 0) return;
  loadingObservations.value = true;
  speciesList.value = [];
  let paramsGBIF = {};
  if (dateMin.value && dateMax.value) {
    paramsGBIF = { eventDate: `${dateMin.value},${dateMax.value}` };
  }

  connector.value
    .fetchOccurrence({
      geometry: wkt,
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
watch([WKT, dateMin, dateMax], () => {
  if (WKT.value) {
    refreshSpeciesList(WKT.value);
  }
});
</script>
<template>
  <div id="liste-taxons" class="card mb-3 h-100 p-0">
    <div class="card-header">
      <SortBy
        :sort-by-available="sortByAvailable"
        @sortBy="(newsort) => (sortBy = newsort)"
        @orderBy="(neworder) => (order = neworder)"
        sortBy="acceptedScientificName"
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
          :connector="connector"
          :key="observation.taxonId"
        />
      </div>
    </div>
    <div v-if="speciesListShowed.length > 0" class="card-footer">
      <Pagination
        :pageIndex="pageIndex"
        :total-items="speciesList.length"
        :itemPerPage="itemsPerPage"
        @page="(index) => (pageIndex = index)"
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

/* h5 {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
} */
</style>
