<script setup>
import { ref } from "vue";
const visible = ref(false);
</script>

<template>
  <div class="card small">
    <div class="card-header">
      <h4>
        {{ $t("howto") }}
        <BButton v-b-toggle.collapse-howto variant="light">
          <i class="bi bi-chevron-down" v-if="!visible"></i>
          <i class="bi bi-chevron-up" v-else></i>
        </BButton>
      </h4>
    </div>
    <BCollapse id="collapse-howto" v-model="visible">
      <div
        class="card-body"
        style="overflow-y: scroll; height: 30vh"
        v-html="$t('intro')"
      ></div>
    </BCollapse>
  </div>
</template>
