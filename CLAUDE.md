# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BAM (Biodiversity Around Me) is a client-only Vue 3 + Vite widget that lists species observed in an area (point, line or polygon), using GBIF or a GeoNature instance as the data source. There is no backend: everything is fetched from public APIs in the browser. Deployed to GitHub Pages under the `/BAM-widget/` base path (production builds only; dev uses `/`).

## Commands

```sh
npm install
npm run dev              # Vite dev server on http://localhost:5173
npm run build            # production build into dist/
npm test                 # Vitest unit tests (vitest run; only looks in src/)
npx vitest run src/lib/connectors/utils.test.ts   # single unit test file
npx vitest run -t "name" # single test by name
npm run test:coverage
npx playwright test      # E2E (tests/); starts `npm run dev` automatically; chromium/firefox/webkit
npx playwright test tests/list.spec.ts --project=chromium
```

Prettier is enforced in CI (`.prettierrc`, 4-space indent, single quotes). Node version is in `.nvmrc`.

## Architecture

**Entry / routing** — [src/main.js](src/main.js) sets up i18n (en/fr/es/cs/de/it, files in `src/assets/languageAssets/`), bootstrap-vue-next, and a hash router with two routes: `/` → `Widget.vue` and `/config` → `Configurator.vue`. Widget configuration is carried entirely in URL query parameters (documented in the README table), which is how the widget is embedded via iframe.

**ParameterStore** ([src/lib/parameterStore.ts](src/lib/parameterStore.ts)) — singleton holding all widget state as Vue refs (wkt, buffer, dates, connector, mode, widget type, etc.). It parses/validates URL query params, falls back to defaults in [src/assets/config.js](src/assets/config.js), and writes state back to the route with `router.replace`. Components read/write config through it rather than via props; adding a widget parameter means touching the store, `config.js`, the Configurator, the README table and the docs.

**Connectors** ([src/lib/connectors/](src/lib/connectors/)) — `Connector` is the base class; `gbif.ts` and `geonature.ts` subclass it and are selected by name through `getConnector` in `utils.ts` (`CONNECTORS` enum in `connectors.ts`). A connector implements `fetchOccurrence`, `fetchTaxonInfo`, `searchTaxon`, vernacular names, IUCN status, detail-page URLs, etc., and declares its taxon-class → referential ID mapping and compatible media sources. Geometry sent to APIs is simplified/limited (`MAX_NB_POLYGON_COORDINATES`, inner rings removed) because most APIs reject large polygons. Search scoring lives in `connectors/search/`.

**Media sources** ([src/lib/media/](src/lib/media/)) — pluggable image/sound providers (GBIF, INPN/Taxref ODATA, Wikidata, TaxHub) behind the `MediaSource` interface, resolved by `getMediaSource` in `media.ts`. A connector's image/sound source is independent of its occurrence source.

**UI** — `Widget.vue` picks between `ListWidget` and `MapListWidget` (`WIDGET_TYPE`). Species list logic (filtering by class, search, sorting, pagination) is in `TaxonListManager` ([taxonListManager.ts](src/components/core/taxonList/taxonListManager.ts)), a plain class of Vue refs used by `TaxonList.vue`; display modes (gallery / detailed list) are `TAXONLIST_DISPLAY_MODE`. Map is Leaflet + leaflet-draw in `components/core/map/`. Components in `bootstrap-vue-next` are auto-imported via `unplugin-vue-components` (see `components.d.ts`).

**Build-time globals** — `__APP_VERSION__` (from the `VERSION` file) and `__COMMIT_HASH__` (git short hash) are injected via Vite `define`; the build therefore needs a git checkout.

## Testing notes

- Unit tests are colocated in `src/` as `*.test.ts` (Vitest, `dir: 'src'`).
- E2E tests in `tests/` use page-object helpers in `tests/page/` and mock geolocation at Brussels; they hit the dev server and, unless mocked, live external APIs.

## Docs

User docs (Docsify site) live in `docs/` and are published alongside the app; `CHANGELOG.md` is maintained manually per release. The service worker (PWA) excludes `/docs` paths from navigation fallback.
