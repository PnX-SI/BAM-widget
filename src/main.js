import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";

import MapListWidget from "./components/MapListWidget.vue";
import ListWidget from "./components/ListWidget.vue";
import ConfiguratorWidget from "./components/ConfiguratorWidget.vue";
import Error404 from "./components/commons/Error404.vue";

import {
  createWebHistory,
  createWebHashHistory,
  createRouter,
} from "vue-router";
import { createI18n } from "vue-i18n";
import messagesFR from "./assets/languageAssets/fr";
import messagesEN from "./assets/languageAssets/en";

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
    component: ConfiguratorWidget,
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: Error404 },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

createApp(App).use(router).use(i18n).mount("#app");
