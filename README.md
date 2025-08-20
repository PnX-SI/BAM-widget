![BAM logo](https://media.githubusercontent.com/media/PnX-SI/BAM-widget/refs/heads/main/docs/images/BAM-logo-full.png)

**BAM (Biodiversity around me)** is a web widget that retrieves and displays species observed within an area.  
It supports multiple sources of biodiversity data API such as [GBIF](https://www.gbif.org/) 🦋 or a [GeoNature](https://geonature.fr/) instance 🌱, with plans for additional sources.  
The widget provides several display modes, including map 🗺️, species list 📋.

The widget is built using Vue.js 3 ⚡, Turf.js ⿻, Leaflet🗺️, and Bootstrap 🅱.  
It supports multilingual interfaces 🌐 and a modern design.

## ✨ Features

- Display species found in a defined area using observations data from GBIF API or a GeoNature instance.
- Define specific point, line or polygon, or a GeoJSON, or dynamic geographic objects.
- GPS geolocation, point and line automatic buffer.
- Multiple display modes: map 🗺️, list 📋
- Sort 🔃 and filter species lists.
- Search 🔎 and filter species.
- Share research via link 🔗 or embed in your website 🖥️.
- Multilingual support 🌐.
- Based only on open API! No server required (except for self-hosting)!

## 🚀 Generate your widget !

- Generate your widget -> [https://pnx-si.github.io/BAM-widget/#/config](https://pnx-si.github.io/BAM-widget/#/config)
- Documentation: [https://pnx-si.github.io/BAM-widget/docs/](https://pnx-si.github.io/BAM-widget/docs/)
- Widget integration examples:
  - [Ecrins huts and biodiversity](https://pnx-si.github.io/BAM-widget/docs/examples/huts-biodiversity.html) / [Source code](/docs/examples/huts-biodiversity.html)
  - [Jamaican biodiversity](https://pnx-si.github.io/BAM-widget/docs/examples/jamaican-biodiversity.html) / [Source code](/docs/examples/jamaican-biodiversity.html)
  - [Corcovado treks](https://pnx-si.github.io/BAM-widget/docs/examples/corcovado-treks.html) / [Source code](/docs/examples/corcovado-treks.html)
  - [Geotrek trekking page](https://gtr3demo.ecrins-parcnational.fr/trek/2-Col-de-Font-Froide) / [Source code](https://github.com/PnX-SI/BAM-widget/blob/main/docs/examples/geotrek-detail-page.html)
- Test and explore: [https://pnx-si.github.io/BAM-widget/](https://pnx-si.github.io/BAM-widget/)

## 🔗 Data Sources

- **GBIF**: Global Biodiversity Information Facility API.
- **GeoNature**: A biodiversity data collect self-hosted platform

## 🖼️ Display Options

- Map view 🗺️
  <br/>
  <img style="width:400px" src="docs/images/maplist_mode.png"/>

- List of species 📋
  <br/>
  <img style="width:400px" src="docs/images/first_result_gallery.png"/>

## 🎛️ Widget customization

Each parameter can be set via URL query or through the widget’s configuration interface [/config](https://pnx-si.github.io/BAM-widget/#/config).

| Parameter          | Type    | Purpose / Usage                                                                                                                                                                                                              | Example / Values                 |
| ------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `radius`           | number  | Buffer radius for search area (m)                                                                                                                                                                                            | `500`                            |
| `wkt`              | string  | [Well-Know Text](https://fr.wikipedia.org/wiki/Well-known_text) geometry (search area)                                                                                                                                       | `"POINT(2.35 48.85)"`            |
| `dateMin`          | string  | Minimum observation date                                                                                                                                                                                                     | `"2024-01-01"`                   |
| `dateMax`          | string  | Maximum observation date                                                                                                                                                                                                     | `"2024-12-31"`                   |
| `connector`        | string  | Data source connector (GBIF, GeoNature, ...)                                                                                                                                                                                 | `"GBIF"`                         |
| `nbTaxonPerLine`   | number  | Number of species per line in the list view                                                                                                                                                                                  | `4`                              |
| `showFilters`      | boolean | Show/hide filters in the species list                                                                                                                                                                                        | `true` / `false`                 |
| `mapEditable`      | boolean | Allow editing geometry on the map                                                                                                                                                                                            | `true` / `false`                 |
| `lang`             | string  | Language code for UI                                                                                                                                                                                                         | `"en"`, `"fr"`                   |
| `mode`             | string  | Species list display mode (`gallery`, `detailedList`)                                                                                                                                                                        | `"detailedList"`                 |
| `sourceGeometry`   | string  | An URL to a GeoJSON that will be used to define the selected area. The given geometry is simplified due to the character limit of an URL.                                                                                    | `"https://..."`                  |
| `class`            | string  | Taxonomic class filter (e.g., Mammalia, Aves) Check [taxonclass2icon.js](https://github.com/PnX-SI/BAM-widget/blob/main/src/assets/taxonclass2icon.js) for more detail.                                                      | `"Mammalia"`                     |
| `widgetType`       | string  | Widget display mode (`default`, others)                                                                                                                                                                                      | `"default"`                      |
| `hybridTaxonList`  | boolean | Enable switching between list/gallery species display modes                                                                                                                                                                  | `true` / `false`                 |
| `x`                | number  | Longitude for point geometry                                                                                                                                                                                                 | `2.35`                           |
| `y`                | number  | Latitude for point geometry                                                                                                                                                                                                  | `48.85`                          |
| `customDetailPage` | string  | Custom URL for species detail redirection. The species ID part of the URL must be indicated by the string `{taxonID}` so it can be replaced by the actual species' ID. For example, `https://www.gbif.org/species/{taxonID}` | `"https://.../{taxonID}"`        |
| `soundSource`      | string  | Name of the data source use to fetch animal sounds.                                                                                                                                                                          | `[gbif]`                         |
| `imageSource`      | string  | Name of the data source use to fetch species pictures.                                                                                                                                                                       | `[wikidata, gbif, inpn, taxhub]` |

## ⚙️ Project Setup

BAM is a widget hosted on Github and directly usable without installation or server.  
But you can choose to install it locally or on your server to develop or host it.

Clone or download the source from this Github repository.

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

**Developed and conceived by**

- @jacquesfize (Parc National des Écrins)
- @amandine-sahl (Parc National des Cévennes)
- @camillemonchicourt (Parc National des Écrins)
- @CynthiaBorotPNV (Parc National de la Vanoise)
- @EcMerc (Parc National du Mercantour)
- Simon Chevreau (Office Français de la Biodiversité)

## 📄 License

This project is licensed under the [MIT](https://opensource.org/license/mit) License.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for features and updates.

## ❓ Issues

For questions or bug reports, please use [GitHub Issues](https://github.com/PnX-SI/BAM-widget/issues).
