<script setup>
import { ref, computed, watchEffect } from "vue";
const props = defineProps({
  taxonId: Number,
  scientificName: String,
  vernacularName: String,
  rank: String,
  kingdom: String,
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

const kingdomIcon = computed(() => {
  switch (props.kingdom.toLowerCase()) {
    case "plantae":
      return "fa-solid fa-seedling badge-plantae";
    case "animalia":
      return "fa-solid fa-paw badge-animalia";
  }
});

const pageLink = computed(() => {
  return props.connector.getTaxonDetailPage(props.taxonId);
});

watchEffect(() => {
  // if any of props changes
  refreshTaxonImage();
});
</script>

<template>
  <div class="col">
    <div class="card h-100">
      <div class="taxon-photo">
        <i :class="kingdomIcon + ' badge-kingdom '"></i>
        <img
          :src="speciesMediaShowed?.url"
          :alt="speciesMediaShowed?.url"
          :title="'Source: ' + speciesMediaShowed?.source"
        />
      </div>

      <div class="card-body">
        <div class="card-text">
          <h5 class="card-title text-wrap">
            {{ props.vernacularName || props.scientificName }}
          </h5>
          <small class="text-body-secondary"
            ><strong>{{ $t("taxon.scientificName") }} :</strong>
            {{ props.scientificName }}</small
          ><br />

          <small class="text-body-secondary">
            <strong>{{ $t("taxon.nbObservations") }} : </strong
            >{{ props.count }}
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
          {{ props?.observationDate.toLocaleDateString() }}</small
        >
      </div>
    </div>
  </div>
</template>

<style>
.taxon-photo > img {
  object-fit: cover;
  height: 250px !important;
  border-radius: 0px !important;
  width: 100%;
}

.badge-kingdom {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  border-radius: 50%;
  padding: 0.5em;
  font-size: 1.5em;
}

.badge-plantae {
  background-color: #27ae60;
}

.badge-animalia {
  background-color: #e67e22;
}
</style>
