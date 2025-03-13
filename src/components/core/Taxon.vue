<script setup>
import { onMounted, ref, computed, watchEffect, onUpdated } from "vue";
import { GbifConnector } from "@/lib/connectors/gbif.js";
import { lineChunk } from "@turf/turf";
import { GeoNatureConnector } from "@/lib/connectors/geonature";

const props = defineProps({
  taxonId: Number,
  scientificName: String,
  vernacularName: String,
  description: String,
  observationDate: Date,
  count: Number,
  connector: { type: Object, required: true },
});

const speciesMedia = ref([]);

const speciesMediaShowed = computed(() => {
  if (speciesMedia.value.length == 0) {
    return {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/1024px-No_Image_Available.jpg",
    };
  }
  return speciesMedia.value[0];
});

function refreshTaxonImage() {
  speciesMedia.value = [];
  if (props.taxonId) {
    props.connector.fetchMedia(props.taxonId).then((response) => {
      speciesMedia.value = response;
    });
  }
}

watchEffect(() => {
  // Quand props change
  refreshTaxonImage();
});
</script>

<template>
  <div class="card mb-3">
    <div class="row p-2" style="padding-left: 1.3em !important">
      <div class="col-md-4 p-0">
        <img
          :src="speciesMediaShowed?.url"
          class="card-img-top"
          :alt="speciesMediaShowed?.url"
        />
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title" style="justify-content: left">
            {{ props.vernacularName || props.scientificName }}
          </h5>
          <!-- <p class="description card-text">{{ props.description }}</p> -->
          <p class="card-text">
            <small class="text-body-secondary"
              ><strong>Nom scientifique :</strong>
              {{ props.scientificName }}</small
            ><br />
            <small class="text-body-secondary"
              ><strong>Date de la dernière observation :</strong>
              {{ props?.observationDate.toLocaleDateString() }}</small
            ><br />
            <small class="text-body-secondary">
              <strong>Nombre d'observations : </strong>{{ props.count }}
            </small>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.card-img-top {
  border-radius: 5px;
  height: 200px !important;
  width: 200px !important;
  object-fit: cover;
}
.description {
  height: 10vh;
}
</style>
