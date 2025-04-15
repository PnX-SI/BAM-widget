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

function updateSource(a) {
  emit("sourceName", sourceName.value);
  emit("params", params);
}
onMounted(() => {
  emit("sourceName", sourceName.value);
  emit("params", params);
});
</script>

<template>
  <div class="text-center col-12">
    <div>
      <span><strong>Source </strong> : {{ sourceName }}</span
      ><BButton v-b-modal.modal-center variant="primary"
        ><i class="bi bi-pencil-square"></i
      ></BButton>
    </div>
  </div>

  <BModal
    id="modal-center"
    centered
    :title="$t('source.title')"
    @ok="updateSource"
  >
    <div class="sourceParam">
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
    </div>
  </BModal>
</template>

<style></style>
