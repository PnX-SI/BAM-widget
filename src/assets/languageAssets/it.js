const messagesIT = {
    it: {
        title: 'BAM – Biodiversità intorno a me',
        discover: {
            title: 'Esplora',
        },
        subtitle: 'Cerca le specie intorno a me',
        howto: 'Come funziona?',
        introTitle: 'Che cos’è Biodiversità intorno a me?',

        intro: `*Biodiversità intorno a me* è un widget dedicato all’**esplorazione delle specie 🔍**!

Questa interfaccia permette di **cercare le specie osservate in una specifica area geografica 🌍**.

**Usa la mappa interattiva 🗺️** per selezionare l’area in cui desideri effettuare la ricerca.

L’**elenco delle specie 🥝🍃** trovate nell’area selezionata apparirà accanto alla mappa 📋.

Puoi anche **condividere i tuoi risultati 📤** per collaborare con altri utenti.
`,
        parameters: 'Parametri',
        nbDisplayedSpecies: 'Numero di specie visualizzate',
        filters: 'Filtri',
        showFilters: 'Mostra filtri',
        RefreshFilters: 'Aggiorna parametri',
        IndicateGeoJSONUrl: 'Indica un URL verso un GeoJSON',
        IndicateDetailTemplateUrl: 'https://<urlSchedaTaxon>/',
        TaxonListModeSelection:
            'Modalità di visualizzazione della lista delle specie',
        widgetTypeSelection: 'Modalità di visualizzazione del widget',
        UseGeoJSONSource: 'Usa una sorgente GeoJSON',
        UseCustomDetailPage:
            'Modifica il reindirizzamento del pulsante "Scopri di più"',
        filtersTitle: 'Filtri',
        filtersOnList: 'Mostra i filtri sulla lista',
        primaryColor: 'Cambia il colore principale',
        mapEditable: 'Area di ricerca modificabile',
        bufferSize: 'Dimensione del buffer (in metri)',
        dateMin: 'Data minima',
        dateMax: 'Data massima',
        search: 'Cerca',
        reset: 'Reimposta',
        limit: 'Limite',
        nbPages: 'Numero di pagine',
        searchResults: 'Risultati della ricerca',
        noResults: 'Nessun risultato',
        previousPage: 'Precedente',
        nextPage: 'Successivo',
        loading: 'Caricamento in corso',
        loadingError: 'Si è verificato un errore durante il caricamento',
        noObservations: 'Nessuna osservazione trovata',
        noSpeciesObserved: 'Nessuna specie osservata in quest’area!',
        emptySearch: 'Nessuna specie corrisponde alla tua ricerca',
        noGeometry: 'Nessuna geometria trovata',
        error404: {
            title: 'Pagina non trovata',
            subtitle: 'La pagina che cerchi non esiste',
        },
        browserIntegration: 'Integra il widget nel tuo sito',
        drawGeometry: 'Disegna un’area per visualizzare le specie',
        size: {
            width: 'Larghezza',
            height: 'Altezza',
        },
        embed: 'Codice HTML',
        typeWidget: {
            title: 'Tipo di widget',
            default: 'Mappa e lista',
            list: 'Lista delle specie',
            config: 'Configuratore',
        },
        sortBy: 'Ordina per',
        sortOrder: 'Ordine',
        copy: 'Copia',
        copied: 'Copiato',
        share: 'Condividi',
        shareLink: 'Condividi un link',
        shareDiscover: 'Condividi la tua ricerca',
        source: {
            title: 'Fonte dei dati',
            select: 'Seleziona una fonte',
            modify: 'Modifica la fonte dei dati delle osservazioni',
            gbifWarning:
                'Il numero di osservazioni e le loro date si basa su un’aggregazione delle ultime osservazioni effettuate nell’area selezionata e limitata a un massimo di {nbObs}.',
        },
        gbif: {
            apiEndpoint: 'Indirizzo API del GBIF',
        },
        geonature: {
            api_endpoint: 'Indirizzo API di GeoNature',
            id_export: 'Identificativo dell’esportazione',
        },
        desc: 'Decrescente',
        asc: 'Crescente',
        media: {
            source: 'Fonte dei media',
            image: 'Fonte delle immagini',
            sound: 'Fonte dei suoni',
            select: 'Seleziona una fonte multimediale',
            linkToOrigin: 'Fonte',
            licenseUnder: 'Sotto licenza ',
        },
        taxon: {
            scientificName: 'Nome scientifico',
            vernacularName: 'Nome comune',
            nbObservations: 'Numero di osservazioni',
            lastSeenDate: 'Data dell’ultima osservazione',
            taxonFilter: 'Filtro per specie',
            classFilter: 'Filtra per classe',
            learnMore: 'Scopri di più',
            class: 'Classe della specie',
            taxonFound: 'specie trovate',
        },
        mode: {
            galleryMode: 'Galleria',
            detailedList: 'Dettagliata',
            hybrid: 'Ibrida',
            isTaxonListHybrid: 'Modalità della lista delle specie modificabile',
        },
        widgetType: {
            list: 'Lista',
            default: 'Mappa e lista',
        },
        numberOfTaxonPerLine: 'Numero di specie per riga',
        widgetPreview: 'Anteprima',
        taxonsClass: {
            Animalia: {
                Mammalia: 'Mammiferi',
                Aves: 'Uccelli',
                Reptilia: 'Rettili',
                Amphibia: 'Anfibi',
                Insecta: 'Insetti',
                Arachnida: 'Aracnidi',
                Gastropoda: 'Gasteropodi',
                Bivalvia: 'Bivalvi',
            },
            Plantae: {
                Magnoliopsida: 'Magnoliopsida',
                Liliopsida: 'Monocotiledoni',
                Pinopsida: 'Conifere',
            },
        },
        Animalia: 'Animale',
        Plantae: 'Pianta',
        or: 'o',
        in: 'in',
        datasetList: 'set di dati associati',
        observation: 'osservazione',
        observations: 'osservazioni',
        searchPlace: {
            loadingText: 'Ricerca in corso',
            placeholder: 'Cerca un luogo',
            errorText: 'Errore durante la ricerca',
            noResultsText: 'Nessun risultato trovato',
        },
    },
};

export default messagesIT;
