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

function fetchTaxonImage() {
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
const vernacularName = ref(taxon.vernacularName);

function fetchVernacularName() {
  connector.value.fetchVernacularName(taxon.taxonId).then((name) => {
    if (name) {
      vernacularName.value = name.split(",")[0];
    }
  });
}
fetchTaxonImage();
fetchVernacularName();
</script>
<template>
  <a :href="connector.getTaxonDetailPage(taxon.taxonId)" target="_blank">
    <div class="col card thumbnail">
      <img
        class="card-img"
        :src="mediaDisplayed?.url"
        :alt="mediaDisplayed?.url"
        :title="'Source: ' + mediaDisplayed?.source"
      />

      <div class="card-img-overlay">
        <h5 class="card-title">{{ vernacularName ?? taxon.vernacularName }}</h5>
      </div>
    </div>
  </a>
</template>

<style scoped>
.card {
  border: 0;
  margin-bottom: 1em;
  align-content: space-around;
}
.card-img {
  object-fit: cover;
  width: 100%;
  aspect-ratio: 1/1;
}
.card-title {
  color: white;
  text-shadow: 2px 2px 2px #333;
}
</style>
