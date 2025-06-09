<script setup>
import ParameterStore from "@/lib/parameterStore";
import { ref, watch } from "vue";
import { getMediaSource } from "@/lib/media/media";
const { connector } = ParameterStore.getInstance();

const mediaSourceID = ref(connector.mediaSource.id);
watch(mediaSourceID, () => {
  connector.mediaSource = getMediaSource(mediaSourceID.value);
});
</script>
<template>
  <label for="mediaSourceSelect">{{ $t("media.source") }}</label>
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
