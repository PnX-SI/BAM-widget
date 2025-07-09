<script setup>
import ParameterStore from "@/lib/parameterStore";
import { ref, watch } from "vue";
import { getMediaSource } from "@/lib/media/media";
const { connector } = ParameterStore.getInstance();

const mediaSourceID = ref(connector.value.mediaSource.id);
watch(connector, () => {
  mediaSourceID.value = connector.value.mediaSource.id;
});
watch(mediaSourceID, () => {
  connector.value = new connector.value.constructor({
    ...connector.value.getParams(),
    ...{ mediaSource: getMediaSource(mediaSourceID.value) },
  });
});
</script>
<template>
  <label for="mediaSourceSelect"><strong> {{ $t("media.source") }} <i class="fa-solid fa-photo-film"></i> </strong></label>
  <BFormSelect
    id="mediaSourceSelect"
    :options="connector.getCompatibleMediaSource()"
    v-model="mediaSourceID"
  >
    <template #first>
      <BFormSelectOption :value="null" disabled>{{
        $t("media.select")
      }}</BFormSelectOption>
    </template>
  </BFormSelect>
</template>
