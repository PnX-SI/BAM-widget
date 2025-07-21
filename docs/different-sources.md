# Different Sources

## GBIF

The **Global Biodiversity Information Facility (GBIF)** is an international network and research infrastructure aimed at providing open access to data about all types of life on Earth.

Thankfully, the GBIF allows anyone to query data through its [API](https://techdocs.gbif.org/en/openapi/).

### Use

Since there is only one endpoint, **no configuration is required**.

## GeoNature

[GeoNature](https://geonature.fr/) is an open-source software designed for managing and visualizing naturalist data. It is widely used for biodiversity data management and is particularly useful for natural parks, conservation organizations, and research institutions. GeoNature allows users to collect, store, and share data on species observations, habitats, and more.

### Compatibility

GeoNature is compatible with versions greater than or equal to 2.16.0.

### Setup Your GeoNature

To set up your GeoNature for use with the widget, follow these steps:

1. **Create an Export (Public):**

   You need to create a public view in your GeoNature database. This view will be used to export data for the widget.

   The data returned by your export must have the following fields:

   - `cd_ref`: Taxon id in the Taxref referential
   - `nom_vernaculaire`: Vernacular name
   - `nom_scientifique`: Scientific name
   - `date_min` `date_max`: Minimum and maximum date of an observation
   - `the_geom_4326`: the geometry of the observation (required to compare the selected area)

   You can use the following SQL code to create the view:

   ```sql
   CREATE OR REPLACE VIEW gn_synthese.export_widget_gtsi AS
   SELECT
       vsfwa.cd_ref AS cd_ref,
       vsfwa.nom_vern AS nom_vernaculaire,
       vsfwa.lb_nom AS nom_scientifique,
       vsfwa.date_min AS date_min,
       vsfwa.date_max AS date_max,
       vsfwa.the_geom_4326 AS the_geom_4326
   FROM gn_synthese.v_synthese_for_web_app vsfwa;
   ```

   **Notes** Be free to modify this view depending on your needs !

2. **Go to Admin:**

   Log in to your GeoNature admin panel.

3. **Create a Public Export:**

   Navigate to the section where you can create public exports. Fill in the necessary fields to set up the export. This typically involves specifying the view you created, setting permissions, and configuring any additional options required for the export.
