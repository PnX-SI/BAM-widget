<script setup>
import "leaflet/dist/leaflet.css";
import Parameters from "@/components/core/Parameters.vue";
import Intro from "./core/Intro.vue";
import ParameterStore from "@/lib/parameterStore";
import HeaderNav from "./commons/HeaderNav.vue";
import { WIDGET_TYPE } from "@/lib/enums";

const { widgetType } = ParameterStore.getInstance();
</script>

<template>
  <!-- TOP MENU -->
  <HeaderNav></HeaderNav>

  <!-- App -->
  <main class="container-fluid">
    <div class="row">
      <!-- Intro & Parameters -->
      <div class="col-12 col-lg-4 col-md-2" style="height: 80vh">
        <!-- <Intro class="mb-2"></Intro> -->
        <Parameters />
      </div>
      <div class="col" id="preview">
        <div>
          <h3><i class="bi bi-easel"></i> {{ $t("widgetPreview") }}</h3>
        </div>
        <ListWidget
          height="70vh"
          v-if="widgetType == WIDGET_TYPE.list"
        ></ListWidget>
        <MapListWidget height="70vh" v-else></MapListWidget>
      </div>
    </div>
  </main>
</template>

<script type="module"></script>

<style scoped>
.row > div {
  max-height: 83vh;
}
#preview {
  padding-top: 0.5em;
  background-color: #efefef;
  border-radius: 10px;
  margin-right: 0.5em;
  height: 82.5vh;

  h3 {
    /* color: #666; */
    width: max-content;
    padding: 0.3em;
    border-radius: 10px;
  }
}
@media screen and (max-width: 770px) {
  #preview {
    margin-top: 4em;
    margin-left: 0.5em;
  }
}
</style>
