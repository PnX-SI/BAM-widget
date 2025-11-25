![GitHub branch check runs](https://img.shields.io/github/check-runs/PnX-SI/BAM-widget/main)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/PnX-SI/BAM-widget)
![GitHub top language](https://img.shields.io/github/languages/top/PnX-SI/BAM-widget)

**BAM (Biodiversity around me** AKA **Biodiversité autour de moi** AKA **Biodiversidad alrededor mío)** is a web widget that retrieves and displays species observed within an area, based on the GBIF data API (or alternative other biodiversity data sources).

Its main goal is to make open biodiversity data easily and simply accessible to everyone, everwhere.

![Biodiversity data accessible](https://geonature.fr/documents/autres/BAM/BAM-biodiversity-data-accessible.png)

BAM allows to easily integrate biodiversity species list in your website, around a point, a line, a polygon or your GPS location.

It supports various sources of biodiversity data API such as **[GBIF](https://www.gbif.org)** 🦋 or a **[GeoNature](https://geonature.fr)** instance 🌱, with plans for additional sources.  
It retrieves species pictures and sounds from GBIF, Wikidata, INPN or TaxHub API.

The widget is built using Vue.js 3 ⚡, Turf.js ⿻, Leaflet 🗺️, and Bootstrap 🅱.

![Widget preview](images/first_result.png)

## ✨ Features

-   Display species found in a defined area using observations data from GBIF API or from a GeoNature instance
-   Define area based on a specific point, line or polygon, or a GeoJSON, or dynamic geographic objects
-   GPS geolocation
-   Point and line automatic buffer
-   Multiple widget modes: list 📋, map 🗺️
-   Multiple species display mode: detailed or gallery
-   Sort 🔃 and filter species lists
-   Search 🔎 and filter species
-   Share research via link 🔗 or embed in your website 🖥️
-   Multilingual support (EN, FR, ES, CS, DE, IT) 🌐
-   Based only on open API! No server required (except for self-hosting)!

![BAM - How it works](https://geonature.fr/documents/autres/BAM/BAM-schema-01.png)

## 🚀 Generate your widget!

-   Generate your widget -> [https://pnx-si.github.io/BAM-widget/#/config](https://pnx-si.github.io/BAM-widget/#/config)
-   Widget integration examples:
    -   <a href="https://pnx-si.github.io/BAM-widget/docs/examples/basic-examples.html" target="_blank">Basic examples</a> / <a href="https://github.com/PnX-SI/BAM-widget/blob/main/docs/examples/basic-examples.html">Source code</a>
    -   <a href="https://pnx-si.github.io/BAM-widget/docs/examples/huts-biodiversity.html" target="_blank">Ecrins huts and biodiversity</a> / <a href="https://github.com/PnX-SI/BAM-widget/blob/main/docs/examples/huts-biodiversity.html">Source code</a>
    -   <a href="https://pnx-si.github.io/BAM-widget/docs/examples/falkensee-schools-biodiversity.html" target="_blank">Falkensee schools and biodiversity</a> / <a href="https://github.com/PnX-SI/BAM-widget/blob/main/docs/examples/falkensee-schools-biodiversity.html">Source code</a>
    -   <a href="https://pnx-si.github.io/BAM-widget/docs/examples/jamaican-biodiversity.html)" target="_blank">Jamaican biodiversity</a> / <a href="https://github.com/PnX-SI/BAM-widget/blob/main/docs/examples/jamaican-biodiversity.html">Source code</a>
    -   <a href="https://pnx-si.github.io/BAM-widget/docs/examples/corcovado-treks.html" target="_blank">Corcovado treks</a> / <a href="https://github.com/PnX-SI/BAM-widget/blob/main/docs/examples/corcovado-treks.html">Source code</a>
    -   <a href="https://gtr3demo.ecrins-parcnational.fr/trek/2-Col-de-Font-Froide" target="_blank">Geotrek trekking page</a> / <a href="https://github.com/PnX-SI/BAM-widget/blob/main/docs/examples/geotrek-detail-page.html">Source code</a>
    -   <a href="https://www.ecrins-parcnational.fr/actualite/retour-premieres-rencontres-nationales-geonature" target="_blank">Biodiversity observed around an event location</a>
    -   <a href="https://pnx-si.github.io/BAM-widget/docs/examples/geonature-demo-widget.html" target="_blank">GeoNature demo instance observations in South France</a> / <a href="https://github.com/PnX-SI/BAM-widget/blob/main/docs/examples/geonature-demo-widget.html">Source code</a>
-   Test and explore GBIF observed species: [https://pnx-si.github.io/BAM-widget/#/?widgetType=mapList](https://pnx-si.github.io/BAM-widget/#/?widgetType=mapList)

![BAM architecture](https://geonature.fr/documents/autres/BAM/BAM-schema-v2.png)

## 🎛️ Widget parameters

Each parameter can be set via URL query or through the widget configuration interface [/config](https://pnx-si.github.io/BAM-widget/#/config).

| Parameter            | Type    | Purpose / Usage                                                                                                                                                                                                              | Example / Values                       |
| -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `radius`             | number  | Buffer radius for search area (m)                                                                                                                                                                                            | `500`                                  |
| `wkt`                | string  | [Well-Know Text](https://fr.wikipedia.org/wiki/Well-known_text) geometry (search area)                                                                                                                                       | `"POINT(2.35 48.85)"`                  |
| `dateMin`            | string  | Minimum observation date                                                                                                                                                                                                     | `"2024-01-01"`                         |
| `dateMax`            | string  | Maximum observation date                                                                                                                                                                                                     | `"2024-12-31"`                         |
| `connector`          | string  | Data source connector (GBIF, GeoNature, ...)                                                                                                                                                                                 | `"GBIF"`                               |
| `nbTaxonPerLine`     | number  | Number of species per line in the list view                                                                                                                                                                                  | `4`                                    |
| `nbDisplayedSpecies` | number  | The number of species displayed. The `n` species are selected among the most frequently observed species.                                                                                                                    | `4`                                    |
| `showFilters`        | boolean | Show/hide filters in the species list                                                                                                                                                                                        | `true` / `false`                       |
| `mapEditable`        | boolean | Allow editing geometry on the map                                                                                                                                                                                            | `true` / `false`                       |
| `lang`               | string  | Language code for UI                                                                                                                                                                                                         | `"en"`, `"fr", "es", "cs", "de", "it"` |
| `mode`               | string  | Species list display mode (`gallery`, `detailedList`)                                                                                                                                                                        | `"detailedList"`                       |
| `sourceGeometry`     | string  | A URL to a GeoJSON that will be used to define the selected area. The given geometry is simplified due to the character limit of an URL.                                                                                     | `"https://..."`                        |
| `class`              | string  | Taxonomic class filter (e.g., Mammalia, Aves) Check [taxonclass2icon.js](https://github.com/PnX-SI/BAM-widget/blob/main/src/assets/taxonclass2icon.js) for more detail.                                                      | `"Mammalia"`                           |
| `widgetType`         | string  | Widget display mode (`list`, others)                                                                                                                                                                                         | `"list"`                               |
| `hybridTaxonList`    | boolean | Enable switching between list/gallery species display modes                                                                                                                                                                  | `true` / `false`                       |
| `x`                  | number  | Longitude for point geometry                                                                                                                                                                                                 | `2.35`                                 |
| `y`                  | number  | Latitude for point geometry                                                                                                                                                                                                  | `48.85`                                |
| `customDetailPage`   | string  | Custom URL for species detail redirection. The species ID part of the URL must be indicated by the string `{taxonID}` so it can be replaced by the actual species' ID. For example, `https://www.gbif.org/species/{taxonID}` | `"https://.../{taxonID}"`              |
| `soundSource`        | string  | Name of the data source use to fetch animal sounds.                                                                                                                                                                          | `[gbif]`                               |
| `imageSource`        | string  | Name of the data source use to fetch species pictures.                                                                                                                                                                       | `[wikidata, gbif, inpn, taxhub]`       |
| `primaryColor`       | string  | Hexadecimal color for footer background. Color must be in format `RRGGBB`.                                                                                                                                                   | 'aaa'                                  |
| `filterOnList`       | boolean | If filters are displayed on the species list or above. `true`.                                                                                                                                                               | `true` / `false`                       |

## ⚙️ Self-hosting

BAM is a widget hosted on Github and directly usable without installation or server.  
But you can choose to install it locally or on your server to develop or host it.

Clone or download the source code from this Github repository.

### 📦 Install packages

```sh
npm install
```

### 🛠️ Compile and Hot-Reload for Development

```sh
npm run dev
```

### 🏗️ Compile and Minify for Production

```sh
npm run build
```

## 👥 Contributors

**Conceived and developed by**

-   @jacquesfize (Parc national des Écrins)
-   @amandine-sahl (Parc national des Cévennes)
-   @camillemonchicourt (Parc national des Écrins)
-   @CynthiaBorotPNV (Parc national de la Vanoise)
-   @EcMerc (Parc national du Mercantour)
-   @SimonChevereau (Office Français de la Biodiversité)
-   @babastienne (Makina Corpus)
-   @trendspotter

[![image](https://geonature.fr/img/logo-pne.jpg)](https://www.ecrins-parcnational.fr)

[![image](https://geonature.fr/img/logo-pnc.jpg)](https://www.cevennes-parcnational.fr)

[![image](https://geonature.fr/img/logo-pnx.png)](https://www.parcsnationaux.fr)

## 📄 License

This project is licensed under the [MIT](https://opensource.org/license/mit) License.

## ❓ Issues

For questions or bug reports, please use [GitHub Issues](https://github.com/PnX-SI/BAM-widget/issues).
