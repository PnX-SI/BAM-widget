# CHANGELOG

## 1.1.0 (2025-09-16)

### ✨ New Features

- Add place search form on the map, based on OSM Nominatim (#28)
- Add datasets list in widget footer (#33)
- Add configuration file when self-hosting (#41)
- Trim media credits text length if superior to 200 characters (#49)
- Add BAM logo in widget footer (#50)
- Add source URL in footer (#51)
- Change map button for geolocation (#52)
- Move `embed` to `iframe` with `allow="geolocation"` setting (#53)
- Rename `radius` widget parameter to `buffer` (#61)
- X and Y parameters are now used and kept in URL when placing a point (#56)
- Improve documentation
- Improve widget integration examples

### 🐛 Fixes

- Fix X and Y decimals settings (#30)
- Fix Leaflet marker display (#60)

By @jacquesfize and @camillemonchicourt.

## 1.0.0 (2025-08-21)

This version brings a **complete redesign of the widget**, now powered by **Vue.js**, **Leaflet**, **Turf.js** and **Bootstrap** for a smoother and more modern experience.

### ✨ New Features

- 🎨 **Fresh, modern design**
- 🌍 **Multilingual support**
- 🌐 **Multiple observations data sources** supported
- 🦋 Now **works with GeoNature** data source
- 🖼️ Retrieve **species images** from _Wikidata_, _GBIF_, _INPN_, and _TaxHub_ APIs
- 🎶 Retrieve **species sounds** from _GBIF_ API
- 🔎 **Search & filter** and **Sortable species list** forms
- 🖥️ **Multiple display modes**
- ⚙️ **New customizable parameters** (display mode, media sources, etc.)
- 📏 **Automatic buffer** around points and lines
- 🔗 **Easier sharing**: use a link or an iframe the widget directly in an HTML page with an `<iframe>` tag

### 📚 Documentation

- [Full documentation](https://pnx-si.github.io/BAM-widget/docs/)
- Examples can be found in the [/docs/examples](/docs/examples/) directory

By @jacquesfize, @camillemonchicourt, @amandine-sahl and @babastienne.

## 0.1.0 (2025-01-03)

- First functional version of the widget with GBIF, Wikidata and Taxref APIs.
- Developed with Turf.js, OpenLayers, Bootstrap librairies.
- By @jacquesfize, @CynthiaBorotPNV, @EcMerc, @amandine-sahl and @SimonChevereau.
