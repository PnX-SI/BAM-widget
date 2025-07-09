<script setup>
import ParameterStore from "@/lib/parameterStore";

const { radius } = ParameterStore.getInstance();
</script>

<template>
  <div class="row">
    <label for="radius" class="form-label col-8"
      ><strong>
        {{ $t("bufferSize") }}
        <i class="fa-solid fa-up-right-and-down-left-from-center"></i
      ></strong>
      {{ radius }} km</label
    >
    <input
      type="range"
      class="form-range"
      min="1"
      max="100"
      v-model="radius"
      id="radius"
    />
  </div>
</template>
<style scoped>
#radius {
  width: 30%;
}
</style>
