<script setup>
import ParameterStore from "@/lib/parameterStore";

const { radius } = ParameterStore.getInstance();
</script>

<template>
  <div class="row">
    <label for="radius" class="form-label col-5"
      ><strong>
        {{ $t("bufferSize") }}
        <i class="fa-solid fa-up-right-and-down-left-from-center"></i
      ></strong>
    </label>
    <input
      type="number"
      class="form-number"
      min="1"
      max="3000"
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
