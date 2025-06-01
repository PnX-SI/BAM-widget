<script setup>
import "leaflet/dist/leaflet.css";
import Map from "@/components/core/Map.vue";
import TaxonList from "@/components/core/TaxonList.vue";
import Filters from "@/components/core/Filters.vue";
import Share from "./core/Share.vue";
import LanguageSwitch from "./commons/LanguageSwitch.vue";
import Intro from "./core/Intro.vue";
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
      <div class="col-12 col-lg-3 col-md-2">
        <Intro class="mb-2"></Intro>
        <Filters />
      </div>
      <!-- Map -->
      <div class="col-12 col-lg-6 col-md-6">
        <Map height="100vh" />
      </div>
      <!-- Taxon list -->
      <div class="col-12 col-lg-3 col-md-4">
        <TaxonList :nb-taxon-per-line="1" />
      </div>
    </div>
  </main>
</template>

<script type="module"></script>

<style scoped>
.row div {
  max-height: 80vh;
}
</style>
