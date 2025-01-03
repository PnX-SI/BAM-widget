<script setup>
const props = defineProps({
  name: String,
  imageUrl: String,
  description: String,
  observationDate: String,
  count: Number,
});
</script>

<template>
  <div class="card mb-3">
    <div class="row">
      <div class="col-md-4 p-0">
        <img :src="props.imageUrl" class="card-img-top" :alt="props.imageUrl" />
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">{{ props.name }}</h5>
          <!-- <p class="description card-text">{{ props.description }}</p> -->
          <p class="card-text">
            <small class="text-body-secondary"
              >Observé le : {{ props.observationDate }}</small
            >
          </p>
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="col-12 col-sm-12 col-md-6 col-lg-3">
    <div class="card">
      <img :src="props.imageUrl" class="card-img-top" :alt="props.imageUrl" />
      <div class="card-body">
        <h5 class="card-title">{{ props.name }}</h5>
        <p class="description card-text">{{ props.description }}</p>
        <p class="card-text">Nombre d'observations : {{ props.count }}</p>
      </div>
      <div class="card-footer">
        <small class="text-body-secondary"
          >Observé le : {{ props.observationDate }}</small
        >
      </div>
    </div>
  </div> -->
</template>

<style>
img {
  border-radius: none !important;
  height: 20vh;
}
.description {
  height: 10vh;
}
</style>
