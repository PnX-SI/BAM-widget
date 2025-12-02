import './assets/main.css';

import { createApp } from 'vue';
import { createBootstrap } from 'bootstrap-vue-next';

import App from './App.vue';

import Configurator from './components/Configurator.vue';
import Explorer from './components/Explorer.vue';
import Error404 from './components/commons/Error404.vue';
import { VueShowdown } from 'vue-showdown';

import { createWebHashHistory, createRouter } from 'vue-router';
import { createI18n } from 'vue-i18n';
import messagesFR from './assets/languageAssets/fr';
import messagesEN from './assets/languageAssets/en';
import messagesES from './assets/languageAssets/es';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import Widget from './components/Widget.vue';
import messagesCS from './assets/languageAssets/cs';
import messagesDE from './assets/languageAssets/de';
import messagesIT from './assets/languageAssets/it';
import preventZoom from './directives/preventZoom.js';

const browserLocale = window.navigator.language.split('-')[0];

const i18n = createI18n({
    locale: ['en', 'fr', 'es', 'cs', 'it', 'de'].includes(browserLocale)
        ? browserLocale
        : 'en',
    fallbackLocale: 'en',
    messages: {
        ...messagesFR,
        ...messagesEN,
        ...messagesES,
        ...messagesCS,
        ...messagesDE,
        ...messagesIT,
    },
});
const routes = [
    {
        path: '/',
        component: Widget,
    },
    {
        path: '/config',
        component: Configurator,
    },
    {
        path: '/explorer',
        component: Explorer,
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: Error404 },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false,
});

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(createBootstrap());
app.component('VueShowdown', VueShowdown);
app.directive('prevent-zoom', preventZoom);

app.config.errorHandler = (err, instance, info) => {
    console.group(
        '%c🔥 Vue Global Error Handler',
        'color:red; font-weight:bold;'
    );
    console.error('Erreur attrapée :', err);
    if (instance) {
        console.warn(
            'Instance du composant :',
            instance.$options.name || instance
        );
    }
    console.info('Contexte :', info);
    console.groupEnd();
};

app.mount('#app');
