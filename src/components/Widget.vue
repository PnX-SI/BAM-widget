<script setup>
import "leaflet/dist/leaflet.css";
import Parameters from "@/components/core/Parameters.vue";
import ParameterStore from "@/lib/parameterStore";
import { WIDGET_TYPE } from "@/lib/enums";
import TaxonSwipe from "./core/TaxonSwipe.vue";

const { widgetType } = ParameterStore.getInstance();
</script>

<template>
  <ListWidget height="100vh" v-if="widgetType == WIDGET_TYPE.list"></ListWidget>
  <MapListWidget height="100vh" v-else></MapListWidget>
  <TaxonSwipe></TaxonSwipe>
</template>
