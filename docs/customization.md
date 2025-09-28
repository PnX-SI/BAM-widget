# Widget customization

There is two ways of customizing the widget:

-   use the `Parameters` block in the configuration interface (available at https://pnx-si.github.io/BAM-widget/#/config)
    ![alt](images/parameters.png)
-   directly in the url of the existing `<iframe>` tag.

## Parameters reference

### `buffer` (**Type:** number)

Buffer size for the search area in meters.

**Example:** `1`

### `wkt` (**Type:** string)

[Well-Known Text](https://fr.wikipedia.org/wiki/Well-known_text) geometry that defines the search area.

You can easily generate WKT [here](https://wktmap.com/).

-   **Example :** `"POINT(2.35 48.85)"`

### `dateMin` and `dateMax` (**Type:** string)

Minimum observation date for filtering results.

-   **Example:** `"2024-01-01"`

### `connector` (**Type:** string)

Specifies the data source connector, such as GBIF, GeoNature, etc.

**Available values:** `[GBIF, GeoNature]`

### `nbTaxonPerLine` (**Type:** number)

Number of species displayed per line in the list view.

-   **Example:** `4`

### `nbDisplayedSpecies` (**Type:** number)

The number of species displayed. The `n` species are selected among the most frequently observed species. If `nbDisplayedSpecies` is null or inferior to 0, all species found will be displayed.

-   **Example:** `4`

### `showFilters` (**Type:** boolean)

Determines whether to show or hide filters in the taxon list.

![alt](images/customization/filter_switch.gif)

### `mapEditable` (**Type:** boolean)

Allows or prevents editing of the geometry on the map.

### `lang` (**Type:** string)

Language code for the user interface.

**Language available:** `"en"`, `"fr", "es"`

### `mode` (**Type:** string)

Display mode for the species list, either `gallery` or `detailedList`.

#### `gallery`

A simpler view focusing on the vernacular name, a picture and potentially a sound recorded of the animal.

![alt](images/first_result_gallery.png)

#### `detailedList`

A detailed view for each species.

![alt](images/first_result.png)

### `sourceGeometry` (**Type:** string)

A URL to a GeoJSON file that defines the selected area. The geometry is simplified due to URL character limits.

### `class` (**Type:** string)

Taxonomic class filter, such as Mammalia or Aves. For more details, check [taxonclass2icon.js](https://github.com/PnX-SI/BAM-widget/blob/main/src/assets/taxonclass2icon.js).

**Example / Values:** `"Mammalia"`

### `widgetType` (**Type:** string)

Display type for the widget, with `list` being the standard option.

**Available Values:** `[list, mapList]`

#### List type

![alt](images/first_result_gallery.png)

#### MapList type

![alt](images/maplist_mode.png)

### `hybridTaxonList` (**Type:** boolean)

Enables switching between list and gallery display modes for species list.

![hybrid_switch](images/customization/hybrid_switch.gif)

### `x` and `y` (**Type:** number)

Longitude and latitude for point geometry.

**Example:** `2.35`

### `customDetailPage` (**Type:** string)

Custom URL for redirecting to a taxon (species) detail page. The taxon ID part of the URL must be indicated by the string `{taxonID}` so it can be replaced dynamically by the actual taxon ID.

**Examples:**

-   `https://https://www.gbif.org/species/{taxonID}`
-   `https://inpn.mnhn.fr/espece/cd_nom/{taxonID}`

### `imageSource` (**Type:** string)

Name of the data source used to fetch species pictures.

**Available sources:**

-   `wikidata` GBIF and GeoNature compatible
-   `gbif` GBIF compatible
-   `inpn` GeoNature compatible
-   `taxhub` GeoNature compatible

### `soundSource` (**Type:** string)

Name of the data source used to fetch animal sounds.

-   `gbif` (GBIF compatible)

## Integration examples

Find widget integration examples [here](README?id=🚀-generate-your-widget).
