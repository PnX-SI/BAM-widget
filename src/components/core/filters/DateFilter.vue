<script setup>
import { ref, watch } from "vue";
const props = defineProps({
  label: { type: String, required: true },
  id: String,
  currentDate: Date,
});

const date = ref(null);

const emit = defineEmits(["update:date"]);

watch(date, () => {
  emit("update:date", date.value);
});
</script>
<template>
  <label :for="props.id">{{ props.label }}</label>
  <input :id="props.id" class="form-control" type="date" v-model="date" />
</template>
