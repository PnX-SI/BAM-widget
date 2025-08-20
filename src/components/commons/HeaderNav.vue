<script setup>
import LanguageSwitch from "./LanguageSwitch.vue";
</script>
<template>
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
            <LanguageSwitch></LanguageSwitch>
          </BNavForm>
          <BNavItem href="https://pnx-si.github.io/BAM-widget/docs/#/"
            ><i class="bi bi-file-text-fill"></i> Documentation</BNavItem
          >
        </BNavbarNav>
      </BCollapse>
    </BNavbar>
  </header>
</template>
