<script setup>
import { reactive, ref, watch } from "vue";

import ParameterStore from "@/lib/parameterStore";
import { getConnector } from "@/lib/connectors/utils";
import { GeoNatureConnector } from "@/lib/connectors/geonature";
import { GbifConnector } from "@/lib/connectors/gbif";
import { CONNECTORS } from "@/lib/connectors/connectors";

const { connector } = ParameterStore.getInstance();

const sourcesParams = {
  [CONNECTORS.GBIF]: new GbifConnector().getParamsSchema(),
  [CONNECTORS.GeoNature]: new GeoNatureConnector().getParamsSchema(),
};

const sourceName = ref(connector.value.name);
let params = reactive(
  Object.fromEntries(
    sourcesParams[sourceName.value].map((form) => [
      form.name,
      connector.value[form.name] || form.default,
    ])
  )
);

watch([sourceName], () => {
  params = reactive(
    Object.fromEntries(
      sourcesParams[sourceName.value].map((form) => [form.name, form.default])
    )
  );
});

function updateSource(a) {
  // Object.assign(connector, getConnector(sourceName.value, params));
  // console.log(connector, sourceName.value);
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
        <option
          v-for="(source, sourceName) in sourcesParams"
          :value="sourceName"
        >
          {{ sourceName }}
        </option>
      </select>
      <div class="parameters" v-for="form in sourcesParams[sourceName]">
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
          <option v-for="option in form.values" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <div v-else class="text-danger">Unsupported input type</div>
      </div>
    </div>
  </BModal>
</template>

<style></style>
