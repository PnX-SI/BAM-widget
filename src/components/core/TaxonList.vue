<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import Loading from "@/components/commons/Loading.vue";
import { getGbifTaxon } from "@/lib/api/taxon";
import Taxon from "@/components/core/Taxon.vue";
import Pagination from "@/components/commons/Pagination.vue";

const WKT = ref(null);
const dateMin = ref(null);
const dateMax = ref(null);

const speciesList = ref([]);
const loadingObservations = ref(false);

const pageIndex = ref(0);
const itemsPerPage = ref(10);

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
});

const height = computed(() => {
  return `height : ${props.height}`;
});
const heightSpeciesList = computed(() => {
  const heightInPx = parseFloat(props.height.match(/\d+(?:\.\d+)?/)[0]);
  const heightUnit = props.height.replace(/\d+(?:\.\d+)?/, "");
  const heightInPercentOfParent = heightInPx * 0.7 + heightUnit;

  return `height : ${heightInPercentOfParent}`;
});

if (props.wkt) {
  WKT.value = props.wkt;
  refreshSpeciesList(WKT.value);
}

watchEffect(() => {
  WKT.value = props.wkt;
  const date_changed =
    dateMin.value != props.dateMin || dateMax.value != props.dateMax;
  dateMin.value = props.dateMin;
  dateMax.value = props.dateMax;
  if (WKT.value && date_changed) {
    refreshSpeciesList(WKT.value);
  }
  itemsPerPage.value = props.itemPerPage;
});

const speciesListShowed = computed(() => {
  return speciesList.value
    .sort((a, b) => b.occCount - a.occCount)
    .slice(
      pageIndex.value * itemsPerPage.value,
      (pageIndex.value + 1) * itemsPerPage.value
    );
});

function refreshSpeciesList(wkt) {
  loadingObservations.value = true;
  speciesList.value = [];
  let paramsGBIF = {};
  if (dateMin.value && dateMax.value) {
    paramsGBIF = { eventDate: `${dateMin.value},${dateMax.value}` };
  }
  getGbifTaxon(wkt, paramsGBIF, { maxPage: 2, limit: 300 }).then((response) => {
    Object.values(response).forEach((observation) => {
      speciesList.value.push(observation);
    });
    loadingObservations.value = false;
  });
}
watch(WKT, () => {
  if (WKT.value) {
    refreshSpeciesList(WKT.value);
  }
});
</script>
<template>
  <div id="liste-taxons" class="mb-3" :style="height">
    <h2 class="col-12 text-center mb-3 mt-0 p-3">
      <i class="bi bi-search"></i> {{ $t("searchResults") }}
    </h2>
    <Loading :loadingStatus="loadingObservations" />
    <div
      id="no-observation-message"
      v-if="speciesListShowed.length == 0 && !loadingObservations"
    >
      <h4 class="col-12 text-center mb-3 mt-0 p-3">
        <i class="bi bi-pin-map"></i>{{ $t("drawGeometry") }}
      </h4>
    </div>
    <div id="species-listing" :style="heightSpeciesList">
      <Taxon
        v-for="observation in speciesListShowed"
        :taxonId="observation.taxonId"
        :name="observation.acceptedScientificName"
        :description="observation.acceptedScientificName"
        :observationDate="observation.eventDate"
        :count="observation.occCount"
      />
    </div>

    <div class="d-flex justify-content-center m-3">
      <Pagination
        v-if="speciesListShowed.length > 0"
        :pageIndex="pageIndex"
        :total-items="speciesList.length"
        :itemPerPage="itemsPerPage"
        @page="(index) => (pageIndex = index)"
      />
    </div>
  </div>
</template>
<style>
#liste-taxons {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
#species-listing {
  overflow: scroll;
  max-height: 80vh;
}
#no-observation-message {
  background-color: #efefef;
  border-radius: 5px;
}
#no-observation-message h4 {
  border: 2px dashed #666;
  border-radius: 10px;
}
</style>
