<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Loading from "@/components/commons/Loading.vue";
import SortBy from "../commons/SortBy.vue";
import SearchForm from "@/components/commons/SearchForm.vue";
import sortArray from "sort-array";
import ParameterStore from "@/lib/parameterStore";
import TaxonView from "./TaxonView.vue";

const { t } = useI18n();
const { wkt, dateMin, dateMax, nbTaxonPerLine, showFilters, connector, mode } =
  ParameterStore.getInstance();

const class_ = ParameterStore.getInstance().class;

const props = defineProps({
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
    validator: (value) => ["detailedList", "gallery"].includes(value),
  },
});

const speciesList = ref([]);
nbTaxonPerLine.value = props.nbTaxonPerLine ?? nbTaxonPerLine;
let loadingObservations = false;
let loadingError = false;
let noDataFound = false;

const pageIndex = ref(0);

const sortBy = ref(props.sortBy || "lastSeenDate");
const orderBy = ref(props.order || "desc");

const searchString = ref("");

const sortByAvailable = [
  { field_name: "vernacularName", label: t("taxon.vernacularName") },
  { field_name: "acceptedScientificName", label: t("taxon.scientificName") },
  { field_name: "nbObservations", label: t("taxon.nbObservations") },
  { field_name: "lastSeenDate", label: t("taxon.lastSeenDate") },
];

mode.value = props.mode ?? mode.value;
function toggleMode() {
  mode.value = mode.value == "gallery" ? "detailedList" : "gallery";
}

const classNames = computed(() => {
  const gallery_mode = mode.value === "gallery" ? 2 : 1;
  const row_cols_lg = nbTaxonPerLine.value * gallery_mode;
  const row_cols_md = nbTaxonPerLine.value === 1 ? 1 : row_cols_lg / 2;
  const row_cols_sm = gallery_mode;
  return `row row-cols-${row_cols_sm} row-cols-lg-${row_cols_lg} row-cols-md-${row_cols_md} g-4`;
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
  }).slice(0, (pageIndex.value + 1) * 20);
});

const fetchSpeciesList = (wkt) => {
  if (!wkt.length) return;
  noDataFound = false;
  loadingObservations = true;
  loadingError = false;
  speciesList.value = [];
  connector.value
    .fetchOccurrence({
      geometry: wkt,
      dateMin: dateMin.value,
      dateMax: dateMax.value,
      class: class_.value,
    })
    .then((response) => {
      speciesList.value = Object.values(response);
      noDataFound = !speciesList.value.length;
      loadingObservations = false;
      pageIndex.value = 0;
    })
    .catch(() => {
      loadingObservations = false;
      loadingError = true;
    });
};

watch(searchString, () => {
  pageIndex.value = 0;
});

function onScroll(event) {
  const container = event.target;
  const threshold = 50; // Seuil en pixels pour déclencher le chargement

  if (
    container.scrollTop + container.clientHeight >=
    container.scrollHeight - threshold
  ) {
    pageIndex.value++;
  }
}

watch([wkt, class_, dateMin, dateMax, connector], () => {
  speciesList.value = [];
  if (wkt.value) {
    fetchSpeciesList(wkt.value);
  }
});

if (wkt.value) {
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
        v-if="!wkt.length && !loadingObservations && !loadingError"
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
          wkt.length &&
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
      <div id="taxon-list-content" :class="classNames" @scroll="onScroll">
        <div class="justify-content-center toggleMode">
          <button class="btn btn-secondary" @click="toggleMode()">
            <i v-if="mode === 'gallery'" class="fa-solid fa-list"></i>
            <i v-else class="fa-solid fa-grip-vertical"></i>
          </button>
        </div>
        <TaxonView
          v-for="observation in speciesListShowed"
          :key="observation.taxonId"
          :taxon="observation"
        />
      </div>
    </div>

    <div id="data-source-credits">
      {{ $t("source.title") }} {{ connector.name }}
      <BTooltip>
        <template #target>
          <a style="color: white; text-decoration: underline"
            ><i class="bi bi-info-circle"></i
          ></a>
        </template>
        {{ connector.sourceDetailMessage() }}
      </BTooltip>
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
  background: var(--bs-primary);
  color: white;
}
.toggleMode {
  position: absolute;
  top: 0;
  left: 0;
}
.card-body {
  position: relative; /* Assurez-vous que le conteneur parent est positionné de manière relative */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.toggleMode {
  position: absolute;
  top: 10px; /* Ajustez selon vos besoins */
  left: 10px; /* Ajustez selon vos besoins */
  z-index: 10; /* Assurez-vous que le bouton est au-dessus des autres éléments */
}

.toggleMode button {
  padding: 5px 10px; /* Ajustez le padding selon vos besoins */
  width: 40px !important;
}
</style>
