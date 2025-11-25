import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import Components from 'unplugin-vue-components/vite';
import { BootstrapVueNextResolver } from 'bootstrap-vue-next';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/BAM-widget/' : '/',
    plugins: [
        vue(),
        vueDevTools(),
        Components({
            resolvers: [BootstrapVueNextResolver()],
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'apple-touch-icon-180x180.png',
                'maskable-icon-512x512.png',
            ],
            manifest: {
                name: 'BAM (Biodiversity Around Me',
                short_name: 'BAM',
                description:
                    'BAM is an application for showing species seen nearby any location around the world',
                theme_color: '#ffffff',
                permissions: ['geolocation'],
                icons: [
                    {
                        src: 'manifest-icon-192.maskable.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'manifest-icon-192.maskable.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                    {
                        src: 'manifest-icon-512.maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'manifest-icon-512.maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                navigateFallbackDenylist: [
                    /\/docs?(\/.*)?$/, // exclut tout ce qui commence par /docs
                ],
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
