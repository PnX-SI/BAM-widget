<script setup>
import { reactive, ref, watch } from "vue";

import ParameterStore from "@/lib/parameterStore";
import { getConnector } from "@/lib/connectors/utils";

const { connector } = ParameterStore.getInstance();

const sources = {
  GBIF: [
    {
      name: "API_ENPOINT",
      label: "Adresse de l'API du GBIF",
      type: String,
      default: "https://api.gbif.org/v1",
    },
  ],
  GeoNature: [
    {
      name: "EXPORT_API_ENDPOINT",
      label: "Adresse de l'API d'un export GeoNature",
      type: String,
      default: "http://localhost:8000/exports/api/20",
    },
  ],
};

const sourceName = ref(connector.value.name);
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

function updateSource(a) {
  connector.value = getConnector(sourceName.value, params);
}
</script>

<template>
  <div class="text-center col-12">
    <BButton
      v-b-modal.modal-center
      variant="primary"
      size="lg"
      class="col-12 mb-3"
      ><i class="fa fa-leaf"></i> <br />
      {{ $t("source.modify") }}</BButton
    >
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
