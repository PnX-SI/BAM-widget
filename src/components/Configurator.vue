<script setup>
import "leaflet/dist/leaflet.css";
import Parameters from "@/components/core/Parameters.vue";
import ParameterStore from "@/lib/parameterStore";
import HeaderNav from "./commons/HeaderNav.vue";
import { WIDGET_TYPE } from "@/lib/enums";

const { widgetType } = ParameterStore.getInstance();
</script>

<template>
  <!-- TOP MENU -->
  <HeaderNav></HeaderNav>

  <!-- App -->
  <main class="container-fluid" data-testid="Configuration interface">
    <div class="row">
      <!-- Parameters -->
      <div
        class="col-12 col-lg-4 col-md-2"
        style="height: 80vh"
        data-testid="Parameter block"
      >
        <Parameters />
      </div>
      <div class="col">
        <div class="card">
          <h3 class="card-header">
            <i class="bi bi-easel"></i> {{ $t("widgetPreview") }}
          </h3>
          <div class="card-body" id="preview" data-testid="Preview area">
            <ListWidget
              height="70vh"
              v-if="widgetType == WIDGET_TYPE.list"
            ></ListWidget>
            <MapListWidget height="70vh" v-else></MapListWidget>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script type="module"></script>

<style scoped>
.row > div {
  max-height: 83vh;
}
</style>
