<script setup>
import "leaflet/dist/leaflet.css";
import Map from "@/components/core/Map.vue";
import TaxonList from "@/components/core/TaxonList.vue";
import Parameters from "@/components/core/Parameters.vue";
import Share from "./core/Share.vue";
import LanguageSwitch from "./commons/LanguageSwitch.vue";
import Intro from "./core/Intro.vue";
import ParameterStore from "@/lib/parameterStore";

const {
  widgetType
} = ParameterStore.getInstance();
</script>

<template>
  <!-- TOP MENU -->
  <header>
    <BNavbar
      v-b-color-mode="'light'"
      toggleable="lg"
      variant="light"
      class="mb-3"
    >
      <BNavbarBrand href="#/config">🐛 🐦 🌱 {{ $t("title") }}</BNavbarBrand>
      <BNavbarToggle target="nav-collapse" />
      <BCollapse id="nav-collapse" is-nav>
        <BNavbarNav class="ms-auto mb-2 mb-lg-0">
          <BNavForm class="d-flex" right>
            <Share />
            <LanguageSwitch></LanguageSwitch>
          </BNavForm>
        </BNavbarNav>
      </BCollapse>
    </BNavbar>
  </header>

  <!-- App -->
  <main class="container-fluid">
    <div class="row">
      <!-- Intro & Parameters -->
      <div class="col-12 col-lg-3 col-md-2" style="height: 80vh;">
        <Intro class="mb-2"></Intro>
        <Parameters />
      </div>
      <div class="col" id="preview" >
        <h3>{{ $t("widgetPreview") }}</h3>
        <ListWidget height="70vh" v-if="widgetType == 'list'"></ListWidget>
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
#preview{
  padding-top: 0.5em;
  background-color: #efefef;
  border-radius: 10px;
  margin-right: 0.5em;
  height: 82.5vh;

  h3{
    color: #666;
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
