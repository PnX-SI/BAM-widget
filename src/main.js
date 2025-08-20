import "./assets/main.css";

import { createApp } from "vue";
import { createBootstrap } from "bootstrap-vue-next";

import App from "./App.vue";

import MapListWidget from "./components/MapListWidget.vue";
import ListWidget from "./components/ListWidget.vue";
import Configurator from "./components/Configurator.vue";
import Error404 from "./components/commons/Error404.vue";
import { VueShowdown } from "vue-showdown";

import { createWebHashHistory, createRouter } from "vue-router";
import { createI18n } from "vue-i18n";
import messagesFR from "./assets/languageAssets/fr";
import messagesEN from "./assets/languageAssets/en";

import "vue3-toastify/dist/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import Discover from "./components/Discover.vue";

const i18n = createI18n({
  locale: "fr",
  fallbackLocale: "en",
  messages: {
    ...messagesFR,
    ...messagesEN,
  },
});
const routes = [
  {
    path: "/",
    component: MapListWidget,
  },
  {
    path: "/list",
    component: ListWidget,
  },
  {
    path: "/config",
    component: Configurator,
  },
  {
    path: "/discover",
    component: Discover,
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: Error404 },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});

createApp(App)
  .use(router)
  .use(i18n)
  .use(createBootstrap())
  .component("VueShowdown", VueShowdown)
  .mount("#app");
