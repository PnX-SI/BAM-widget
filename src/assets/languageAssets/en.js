const messagesEN = {
    en: {
        title: 'BAM - Biodiversity around me',
        discover: {
            title: 'Explore',
        },
        subtitle: 'Search for species around me',
        howto: 'How does it work?',
        introTitle: 'What is Biodiversity around me ?',
        intro: `*Biodiversity Around Me* is a widget dedicated to **exploring species 🔍**!

This interface allows you to **search for species observed in a specific geographic area 🌍**.

**Use the interactive map 🗺️** to select the area where you want to conduct your search.

The **list of species 🥝🍃** found in the selected area will be displayed next to the map 📋.

You can also **share your results 📤** to collaborate with other users.

    `,
        parameters: 'Parameters',
        nbDisplayedSpecies: 'Number of species displayed',
        filters: 'Filters',
        showFilters: 'Show Filters',
        RefreshFilters: 'Refresh parameters',
        IndicateGeoJSONUrl: 'Indicate a URL towards a GeoJSON',
        IndicateDetailTemplateUrl: 'https://<urlTaxonSheet>/',
        TaxonListModeSelection: 'Species list display mode',
        widgetTypeSelection: 'Widget display mode',
        UseGeoJSONSource: 'Use a GeoJSON from the web',
        UseCustomDetailPage:
            'Change the redirection of the "Learn More" button',

        filtersTitle: 'Filters',
        filtersOnList: 'Show filters on list',
        primaryColor: 'Change the main color',
        mapEditable: 'Editable research zone',
        bufferSize: 'Buffer Size (in meter):',
        dateMin: 'Date Min',
        dateMax: 'Date Max',
        search: 'Search',
        reset: 'Reset',
        limit: 'Limite',
        nbPages: 'Number of pages',
        searchResults: 'Search results',
        noResults: 'No results',
        noSpeciesObserved: 'No species observed in this area !',
        previousPage: 'Previous',
        nextPage: 'Next',
        loading: 'Loading',
        loadingError: 'An error occurred while loading',
        noObservations: 'No observation found',
        emptySearch: 'No species match your search',
        noGeometry: 'No geometry found',
        error404: {
            title: 'Page not found',
            subtitle: 'The page you are looking for does not exist',
        },
        browserIntegration: 'Integrate the widget into your site',
        drawGeometry: 'Draw an area to display species',
        size: {
            width: 'Width',
            height: 'Height',
        },
        embed: 'Embed',
        typeWidget: {
            title: 'Type of widget',
            default: 'Map and List',
            list: 'List of species',
            config: 'Configuration',
        },
        sortBy: 'Sort by',
        sortOrder: 'Order',
        copy: 'Copy',
        copied: 'Copied',
        share: 'Share',
        shareLink: 'Share a link',
        shareDiscover: 'Share your research',
        source: {
            title: 'Data Source',
            select: 'Select a data source',
            modify: 'Change the observations data source',
            gbifWarning:
                'The number of observations and the dates of the latest sightings are based on an aggregation of the latest observations made within the selected area and limited to {nbObs} maximum.',
        },
        gbif: {
            apiEndpoint: 'API endpoint of the GBIF',
        },
        geonature: {
            api_endpoint: 'GeoNature  API endpoint',
            id_export: "Export's id",
        },
        desc: 'Décroissant',
        asc: 'Croissant',
        media: {
            source: 'Media source',
            image: 'Image Source',
            sound: 'Sound Source',
            select: 'Select a media source',
            linkToOrigin: 'Source',
            licenseUnder: 'Under license ',
        },
        taxon: {
            scientificName: 'Scientific Name',
            vernacularName: 'Vernacular name',
            nbObservations: 'Number of observations',
            lastSeenDate: 'Last observation date',
            taxonFilter: 'Filter by species',
            classFilter: 'Filter by class',
            learnMore: 'Learn more',
            class: "Species' class",
            taxonFound: 'species found',
        },
        mode: {
            galleryMode: 'Gallery',
            detailedList: 'Detailed',
            hybrid: 'Hybrid',
            isTaxonListHybrid: 'Species list mode customizable',
        },
        widgetType: {
            list: 'List',
            default: 'Map List',
        },
        numberOfTaxonPerLine: 'Number of species per line',
        widgetPreview: 'Preview',
        taxonsClass: {
            Animalia: {
                Mammalia: 'Mammals',
                Aves: 'Birds',
                Reptilia: 'Reptiles',
                Amphibia: 'Amphibians',
                Insecta: 'Insects',
                Arachnida: 'Arachnids',
                Gastropoda: 'Gastropods',
                Bivalvia: 'Bivalves',
            },
            Plantae: {
                Magnoliopsida: 'Magnoliopsida',
                Liliopsida: 'Monocotyledons',
                Pinopsida: 'Conifers',
            },
        },
        Animalia: 'Animal',
        Plantae: 'Plant',
        or: 'or',
        in: 'in',
        datasetList: 'associated datasets',
        observation: 'observation',
        observations: 'observations',
        searchPlace: {
            loadingText: 'Search in progress',
            placeholder: 'Search a place',
            errorText: 'Error while searching',
            noResultsText: 'No results found',
        },
    },
};

export default messagesEN;
