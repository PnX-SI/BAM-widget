<script setup>
import { Media } from "@/lib/models";

const props = defineProps({
  media: { type: Media },
  vernacularName: { type: String },
  acceptedScientificName: { type: String },
  urlDetailPage: { type: String },
  nbObservations: { type: Number },
  lastSeenDate: { type: Object },
});
</script>
<template>
  <div class="col">
    <div class="card h-100 mb-2">
      <div class="taxon-photo" :class="props.media.url ? '' : 'placeholder'">
        <img
          :src="props.media?.url"
          :alt="props.media?.url"
          :title="'Source: ' + props.media?.source"
        />
        <span class="caption" v-if="props.media.source">{{
          props.media.source
        }}</span>
      </div>

      <div class="card-body">
        <div class="card-text">
          <h5 class="card-title text-wrap">
            {{ props.vernacularName }}
          </h5>
          <small class="text-body-secondary"
            ><strong>{{ $t("taxon.scientificName") }} :</strong>
            {{ props.acceptedScientificName }}</small
          ><br />

          <small v-if="props.nbObservations" class="text-body-secondary">
            <strong>{{ $t("taxon.nbObservations") }} : </strong
            >{{ props.nbObservations }}
          </small>
          <br />

          <small class="text-body-secondary">
            <!-- prettier-ignore -->
            <a
              :href="props.urlDetailPage"
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
          {{ props?.lastSeenDate.toLocaleDateString() }}</small
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
