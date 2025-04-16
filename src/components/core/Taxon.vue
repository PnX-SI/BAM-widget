<script setup>
import { ref, computed, watchEffect } from "vue";
const props = defineProps({
  taxonId: Number,
  scientificName: String,
  vernacularName: String,
  rank: String,
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
  <div class="col">
    <div class="card h-100">
      <img
        class="card-img-top"
        :src="speciesMediaShowed?.url"
        :alt="speciesMediaShowed?.url"
        :title="'Source: ' + speciesMediaShowed?.source"
      />
      <div class="card-body">
        <div class="card-text">
          <h5 class="card-title text-wrap">
            {{ props.vernacularName || props.scientificName }}
          </h5>
          <small class="text-body-secondary"
            ><strong>Nom scientifique :</strong>
            {{ props.scientificName }}</small
          ><br />

          <small class="text-body-secondary">
            <strong>Nombre d'observations : </strong>{{ props.count }}
          </small>
          <br />
        </div>
      </div>
      <div class="card-footer">
        <small class="text-body-secondary"
          >Date de la dernière observation :
          {{ props?.observationDate.toLocaleDateString() }}</small
        >
      </div>
    </div>
  </div>
</template>

<style>
.card-img-top {
  border-radius: 5px;
  height: 150px !important;
  /* width: 150px !important; */
  object-fit: cover;
}
.description {
  height: 10vh;
}
</style>
