<script setup>
import { ref, computed, watchEffect } from "vue";

import { taxonClassIcons } from "@/assets/taxonclass2icon";
import { NO_IMAGE_URL } from "@/assets/constant";
import { Media, Taxon } from "@/lib/models";
import BadgeTaxon from "./BadgeTaxon.vue";
import ParameterStore from "@/lib/parameterStore";
import { randomChoice } from "@/lib/utils";
import { watch } from "vue";

const { lang, connector } = ParameterStore.getInstance();

const props = defineProps({
  taxon: Taxon,
});

const taxon = props.taxon;
const speciesPhoto = ref([]);
const vernacularName = ref(taxon.vernacularName);

function refreshVernacularName() {
  connector.value.fetchVernacularName(taxon.taxonId).then((name) => {
    if (name) {
      vernacularName.value = name;
    }
  });
}

function refreshTaxonImage() {
  speciesPhoto.value = [];
  if (taxon.taxonId) {
    connector.value.fetchMedia(taxon.taxonId).then((response) => {
      speciesPhoto.value = response;
    });
  }
}
const mediaDisplayed = computed(() => {
  return speciesPhoto.value.length == 0
    ? new Media({ url: NO_IMAGE_URL })
    : randomChoice(speciesPhoto.value);
});

const kingdomColor = computed(() => {
  return taxon.kingdom == "Plantae" ? "#27ae60" : "#e67e22";
});

const kingdomIcon = computed(() => {
  return taxon.kingdom == "Plantae"
    ? "fa-solid fa-seedling"
    : "fa-solid fa-paw";
});

const classIcon = computed(() => {
  try {
    return taxonClassIcons[taxon.kingdom][taxon.class]["Icon"];
  } catch (error) {
    return "";
  }
});

const pageLink = computed(() => {
  return connector.value.getTaxonDetailPage(taxon.taxonId);
});

watchEffect(() => {
  // if any of props changes
  refreshTaxonImage();
  refreshVernacularName();
});

watch(lang, () => {
  refreshVernacularName();
});
</script>
<template>
  <div class="col">
    <div class="card h-100 mb-2">
      <div class="taxon-photo">
        <!-- <BadgeTaxon
          :class-icon="kingdomIcon"
          id="badge-kingdom"
          :background-color="kingdomColor"
          :tooltip="taxon.kingdom"
        ></BadgeTaxon>
        <BadgeTaxon
          :class-icon="classIcon"
          id="badge-class"
          background-color="#8e44ad"
          :tooltip="taxon.class"
        ></BadgeTaxon> -->
        <img
          :src="mediaDisplayed?.url"
          :alt="mediaDisplayed?.url"
          :title="'Source: ' + mediaDisplayed?.source"
        />
        <span class="caption" v-if="mediaDisplayed.source">{{
          mediaDisplayed.source
        }}</span>
      </div>

      <div class="card-body">
        <div class="card-text">
          <h5 class="card-title text-wrap">
            {{ vernacularName || taxon.acceptedScientificName }}
          </h5>
          <small class="text-body-secondary"
            ><strong>{{ $t("taxon.scientificName") }} :</strong>
            {{ taxon.acceptedScientificName }}</small
          ><br />

          <small v-if="taxon.nbObservations" class="text-body-secondary">
            <strong>{{ $t("taxon.nbObservations") }} : </strong
            >{{ taxon.nbObservations }}
          </small>
          <br />

          <small class="text-body-secondary">
            <!-- prettier-ignore -->
            <a
              :href="pageLink"
              target="_blank"
              class="badge bg-light text-primary border border-primary text-decoration-none"
              ><strong>{{ $t("taxon.seeMore") }} <i class="bi bi-arrow-right"></i> </strong>
            </a>
          </small>
          <br />
        </div>
      </div>
      <div class="card-footer">
        <small class="text-body-secondary"
          >{{ $t("taxon.lastSeenDate") }} :
          {{ taxon?.lastSeenDate.toLocaleDateString() }}</small
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.taxon-photo {
  position: relative;
  display: inline-block;
}

.taxon-photo > img {
  object-fit: cover;
  height: 250px !important;
  border-radius: 0px !important;
  width: 100%;
}

#badge-kingdom.badgeTaxon {
  position: absolute;
  top: 10px;
  right: 10px;
}

#badge-class.badgeTaxon {
  position: absolute;
  top: 10px;
  right: 60px;
}

.caption {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px;
  border-radius: 3px;
}
</style>
