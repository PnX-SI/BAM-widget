<template>
  <div class="input-group">
    <label for="sortby" class="input-group-text">
      <i class="bi bi-funnel"></i
    ></label>

    <select v-model="sortBy" class="form-select" id="sortby">
      <option
        v-for="field in sortByAvailable"
        :key="`sort-${field}`"
        :value="field"
      >
        {{ field }}
      </option>
    </select>
    <button class="btn btn-outline-secondary" @click="changeOrder">
      <i v-if="orderBy === 'asc'" class="bi bi-sort-alpha-down"></i>
      <i v-else class="bi bi-sort-alpha-up"></i>
    </button>
  </div>
  <div></div>
</template>

<script setup>
import { ref, defineEmits, watch } from "vue";

const props = defineProps({
  sortByAvailable: { type: Array, required: true },
  sortBy: { type: String, required: true },
});

const sortByAvailable = props.sortByAvailable;
const sortBy = ref(props.sortBy);
const orderBy = ref("desc");
const emit = defineEmits(["sortBy", "orderBy"]);

function changeOrder() {
  if (orderBy.value === "asc") {
    orderBy.value = "desc";
  } else {
    orderBy.value = "asc";
  }
  emit("orderBy", orderBy.value);
  emit("sortBy", sortBy.value);
}

watch(sortBy, (newVal) => {
  emit("sortBy", newVal);
});
</script>
