const messagesDE = {
    de: {
        title: 'BAM – Biodiversität um mich herum',
        discover: {
            title: 'Entdecken',
        },
        subtitle: 'Arten in meiner Umgebung suchen',
        howto: 'Wie funktioniert das?',
        introTitle: 'Was ist Biodiversität um mich herum?',

        intro: `*Biodiversität um mich herum* ist ein Widget zur **Erkundung von Arten 🔍**!

Mit dieser Oberfläche können Sie **Arten suchen, die in einem bestimmten geografischen Gebiet 🌍 beobachtet wurden**.

**Nutzen Sie die interaktive Karte 🗺️**, um das Gebiet auszuwählen, in dem Sie Ihre Suche durchführen möchten.

Die **Liste der Arten 🥝🍃**, die im ausgewählten Gebiet gefunden wurden, erscheint neben der Karte 📋.

Sie können Ihre Ergebnisse außerdem **teilen 📤**, um mit anderen Nutzern zusammenzuarbeiten.
`,
        parameters: 'Parameter',
        nbDisplayedSpecies: 'Anzahl der angezeigten Arten',
        filters: 'Filter',
        showFilters: 'Filter anzeigen',
        RefreshFilters: 'Parameter aktualisieren',
        IndicateGeoJSONUrl: 'Eine URL zu einem GeoJSON angeben',
        IndicateDetailTemplateUrl: 'https://<urlTaxonSteckbrief>/',
        TaxonListModeSelection: 'Anzeigemodus der Artenliste',
        widgetTypeSelection: 'Anzeigeart des Widgets',
        UseGeoJSONSource: 'GeoJSON-Quelle verwenden',
        UseCustomDetailPage:
            'Weiterleitung der Schaltfläche „Mehr erfahren“ anpassen',
        filtersTitle: 'Filter',
        filtersOnList: 'Filter auf der Liste anzeigen',
        primaryColor: 'Hauptfarbe ändern',
        mapEditable: 'Bearbeitbares Suchgebiet',
        bufferSize: 'Puffergröße (in Metern)',
        dateMin: 'Mindestdatum',
        dateMax: 'Höchstdatum',
        search: 'Suchen',
        reset: 'Zurücksetzen',
        limit: 'Limit',
        nbPages: 'Anzahl der Seiten',
        searchResults: 'Suchergebnisse',
        noResults: 'Keine Ergebnisse',
        previousPage: 'Zurück',
        nextPage: 'Weiter',
        loading: 'Ladevorgang läuft',
        loadingError: 'Beim Laden ist ein Fehler aufgetreten',
        noObservations: 'Keine Beobachtungen gefunden',
        noSpeciesObserved: 'In diesem Gebiet wurde keine Art beobachtet!',
        emptySearch: 'Keine Art entspricht Ihrer Suche',
        noGeometry: 'Keine Geometrie gefunden',
        error404: {
            title: 'Seite nicht gefunden',
            subtitle: 'Die gesuchte Seite existiert nicht',
        },
        browserIntegration: 'Widget in Ihre Website einbinden',
        drawGeometry: 'Zeichnen Sie ein Gebiet, um Arten anzuzeigen',
        size: {
            width: 'Breite',
            height: 'Höhe',
        },
        embed: 'HTML-Code',
        typeWidget: {
            title: 'Widget-Typ',
            default: 'Karte und Liste',
            list: 'Artenliste',
            config: 'Konfigurator',
        },
        sortBy: 'Sortieren nach',
        sortOrder: 'Reihenfolge',
        copy: 'Kopieren',
        copied: 'Kopiert',
        share: 'Teilen',
        shareLink: 'Link teilen',
        shareDiscover: 'Ihre Suche teilen',
        source: {
            title: 'Datenquelle',
            select: 'Quelle auswählen',
            modify: 'Beobachtungsdatenquelle ändern',
            gbifWarning:
                'Die Anzahl der Beobachtungen und deren Datum basieren auf einer Aggregation der letzten Beobachtungen im ausgewählten Gebiet und sind auf maximal {nbObs} begrenzt.',
        },
        gbif: {
            apiEndpoint: 'API-Adresse von GBIF',
        },
        geonature: {
            api_endpoint: 'API-Adresse von GeoNature',
            id_export: 'Export-Kennung',
        },
        desc: 'Absteigend',
        asc: 'Aufsteigend',
        media: {
            source: 'Medienquelle',
            image: 'Bildquelle',
            sound: 'Tonquelle',
            select: 'Medienquelle auswählen',
            linkToOrigin: 'Quelle',
            licenseUnder: 'Lizenziert unter ',
        },
        taxon: {
            scientificName: 'Wissenschaftlicher Name',
            vernacularName: 'Trivialname',
            nbObservations: 'Anzahl der Beobachtungen',
            lastSeenDate: 'Datum der letzten Beobachtung',
            taxonFilter: 'Art filtern',
            classFilter: 'Nach Klasse filtern',
            learnMore: 'Mehr erfahren',
            class: 'Artklasse',
            taxonFound: 'gefundene Arten',
        },
        mode: {
            galleryMode: 'Galerie',
            detailedList: 'Detailliert',
            hybrid: 'Hybrid',
            isTaxonListHybrid: 'Modus der Artenliste anpassbar',
        },
        widgetType: {
            list: 'Liste',
            default: 'Karte und Liste',
        },
        numberOfTaxonPerLine: 'Anzahl der Arten pro Zeile',
        widgetPreview: 'Vorschau',
        taxonsClass: {
            Animalia: {
                Mammalia: 'Säugetiere',
                Aves: 'Vögel',
                Reptilia: 'Reptilien',
                Amphibia: 'Amphibien',
                Insecta: 'Insekten',
                Arachnida: 'Spinnentiere',
                Gastropoda: 'Schnecken',
                Bivalvia: 'Muscheln',
            },
            Plantae: {
                Magnoliopsida: 'Magnoliopsida',
                Liliopsida: 'Einkäferblättrige',
                Pinopsida: 'Nadelbäume',
            },
        },
        Animalia: 'Tier',
        Plantae: 'Pflanze',
        or: 'oder',
        in: 'in',
        datasetList: 'zugehörige Datensätze',
        observation: 'Beobachtung',
        observations: 'Beobachtungen',
        searchPlace: {
            loadingText: 'Suche läuft',
            placeholder: 'Suchen Sie einen Ort',
            errorText: 'Fehler während der Suche',
            noResultsText: 'Keine Ergebnisse gefunden',
        },
        searchTaxon: 'Eine Art suchen',
    },
};

export default messagesDE;
