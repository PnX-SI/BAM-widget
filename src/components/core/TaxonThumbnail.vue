<script setup>
import { Media } from "@/lib/models";

const props = defineProps({
  media: { type: Media },
  vernacularName: { type: String },
  urlDetailPage: { type: String },
});
</script>
<template>
  <div class="col card thumbnail">
    <img
      class="card-img"
      :src="props.media?.url"
      :alt="props.media?.url"
      :title="'Source: ' + props.media?.source"
    />

    <div class="card-img-overlay">
      <div class="card-title h6">
        <a
          style="color: inherit; text-decoration: inherit"
          :href="props.urlDetailPage"
          target="_blank"
        >
          <span>{{ props.vernacularName }} </span></a
        >

        <BPopover
          v-if="props.media.source"
          :click="true"
          :close-on-hide="true"
          :delay="{ show: 0, hide: 0 }"
        >
          <template #target>
            <i class="bi bi-c-square-fill copyright-icon"></i>
          </template>
          {{ props.media.source }}
        </BPopover>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 0;
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

.copyright-icon {
  margin-left: 0.2em;
  position: absolute;
  bottom: 5px;
  right: 20px;
  color: #fff;
  text-shadow: none;
}
</style>
