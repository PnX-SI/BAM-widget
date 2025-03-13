<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import Loading from "@/components/commons/Loading.vue";
import Taxon from "@/components/core/Taxon.vue";
import Pagination from "@/components/commons/Pagination.vue";
import { GeoNatureConnector } from "@/lib/connectors/geonature";
import { getConnector } from "@/lib/connectors/utils";

const WKT = ref(null);
const dateMin = ref(null);
const dateMax = ref(null);
const connector = ref(getConnector());

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
  connector: {
    type: Object,
    required: true,
  },
});

const height = computed(() => {
  return `height : ${props.height}`;
});
const heightSpeciesList = computed(() => {
  const heightInPx = parseFloat(props.height.match(/\d+(?:\.\d+)?/)[0]);
  const heightUnit = props.height.replace(/\d+(?:\.\d+)?/, "");
  const heightInPercentOfParent = heightInPx * 0.9 + heightUnit;

  return `height : ${heightInPercentOfParent}`;
});

if (props.wkt) {
  WKT.value = props.wkt;
}

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
  return speciesList.value
    .sort((a, b) => b.nbObservations - a.nbObservations)
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

  connector.value
    .fetchOccurrence({
      geometry: wkt,
    })
    .then((response) => {
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
    <Loading :loadingStatus="loadingObservations" />
    <div
      id="no-observation-message"
      class="col-6 offset-3"
      v-if="speciesListShowed.length == 0 && !loadingObservations"
    >
      <h5 class="col-12 text-center mb-3 mt-0 p-3">
        <i class="bi bi-pin-map"></i>{{ $t("drawGeometry") }}
      </h5>
    </div>
    <div id="species-listing" :style="heightSpeciesList">
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
  overflow: hidden;

  /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
}
#species-listing {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 80vh;
  padding-right: 1em;
}

#no-observation-message {
  background-color: #f2f2f2;
  border-radius: 5px;
  height: 100px;
}
#no-observation-message {
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
h5 {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
