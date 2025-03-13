<script setup>
import { reactive, ref, watch, onMounted } from "vue";

const sources = {
  gbif: [
    {
      name: "API_ENPOINT",
      label: "Adresse de l'API du GBIF utilisée",
      type: String,
      default: "https://api.gbif.org/v1",
    },
  ],
  geonature: [
    {
      name: "EXPORT_API_ENDPOINT",
      label: "Adresse de l'API d'un export GN",
      type: String,
      default: "http://localhost:8000/exports/api/20",
    },
  ],
};

const props = defineProps({
  sourceName: {
    type: String,
    required: true,
  },
});

const sourceName = ref(props.sourceName);
let params = reactive(
  Object.fromEntries(
    sources[sourceName.value].map((form) => [form.name, form.default])
  )
);

watch([sourceName], () => {
  params = reactive(
    Object.fromEntries(
      sources[sourceName.value].map((form) => [form.name, form.default])
    )
  );
});

const emit = defineEmits(["sourceName", "params"]);

function updateSource() {
  emit("sourceName", sourceName.value);
  emit("params", params);
}
onMounted(() => {
  emit("sourceName", sourceName.value);
  emit("params", params);
});
</script>

<template>
  <div class="sourceParam">
    <h5>{{ $t("source.title") }}</h5>
    <label for="sourceName"> {{ $t("source.select") }}</label>
    <select v-model="sourceName" class="form-select">
      <option v-for="(source, sourceName) in sources" :value="sourceName">
        {{ sourceName }}
      </option>
    </select>
    <div class="parameters" v-for="form in sources[sourceName]">
      <label :for="form.name">{{ form.label }}</label>
      <input
        v-if="form.type === String"
        class="form-control"
        :placeholder="form.default"
        v-model="params[form.name]"
      />
      <input
        v-else-if="form.type === Number"
        :type="form.type"
        class="form-control"
        :placeholder="form.default"
        v-model="params[form.name]"
      />
      <select
        v-else-if="Array.isArray(form.type)"
        class="form-select"
        v-model="params[form.name]"
      >
        <option v-for="option in form.type" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <div v-else class="text-danger">Unsupported input type</div>
    </div>
    <div class="d-flex justify-content-center mt-3">
      <button class="btn btn-primary" @click="updateSource">
        Mettre à jour les paramètres
      </button>
    </div>
  </div>
</template>

<style>
.sourceParam {
  border: 1px #aaa solid;
  padding: 1em;
  margin-top: 1em;
  border-radius: 5px;
}
</style>
