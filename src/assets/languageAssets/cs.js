﻿const messagesCS = {
    cs: {
        title: 'BAM - Biodiverzita kolem mě',
        discover: {
            title: 'Prozkoumat',
        },
        subtitle: 'Vyhledat druhy kolem mě',
        howto: 'Jak to funguje?',
        introTitle: 'Co je Biodiverzita kolem mě?',
        intro: `*Biodiverzita kolem mě* je widget věnovaný **prozkoumávání druhů 🔍**!

Toto rozhraní vám umožňuje **vyhledávat druhy pozorované v určité geografické oblasti 🌍**.

**Použijte interaktivní mapu 🗺️** k výběru oblasti, ve které chcete provést vyhledávání.

**Seznam druhů 🥝🍃** nalezených ve vybrané oblasti se zobrazí vedle mapy 📋.

Výsledky můžete také **sdílet 📤** a spolupracovat s ostatními uživateli.

    `,
        parameters: 'Parametry',
        nbDisplayedSpecies: 'Počet zobrazených druhů',
        filters: 'Filtry',
        showFilters: 'Zobrazit filtry',
        RefreshFilters: 'Obnovit parametry',
        IndicateGeoJSONUrl: 'Uveďte URL k GeoJSON',
        IndicateDetailTemplateUrl: 'https://<urlTaxonSheet>/',
        TaxonListModeSelection: 'Režim zobrazení seznamu druhů',
        widgetTypeSelection: 'Režim zobrazení widgetu',
        UseGeoJSONSource: 'Použít GeoJSON z webu',
        UseCustomDetailPage: 'Změnit přesměrování tlačítka "Více informací"',

        filtersTitle: 'Filtry',
        mapEditable: 'Editovatelná oblast vyhledávání',
        bufferSize: 'Velikost bufferu (v metrech):',
        dateMin: 'Minimální datum',
        dateMax: 'Maximální datum',
        search: 'Vyhledat',
        reset: 'Resetovat',
        limit: 'Limit',
        nbPages: 'Počet stránek',
        searchResults: 'Výsledky vyhledávání',
        noResults: 'Žádné výsledky',
        noSpeciesObserved: 'V této oblasti nebyly pozorovány žádné druhy!',
        previousPage: 'Předchozí',
        nextPage: 'Další',
        loading: 'Načítání...',
        noObservations: 'Nebyla nalezena žádná pozorování',
        noGeometry: 'Nebyla nalezena žádná geometrie',
        error404: {
            title: 'Stránka nenalezena',
            subtitle: 'Stránka, kterou hledáte, neexistuje',
        },
        browserIntegration: 'Integrujte widget do svého webu',
        drawGeometry: 'Nakreslete oblast pro zobrazení druhů',
        size: {
            width: 'Šířka',
            height: 'Výška',
        },
        embed: 'Vložit',
        typeWidget: {
            title: 'Typ widgetu',
            default: 'Mapa a seznam',
            list: 'Seznam druhů',
            config: 'Konfigurace',
        },
        copy: 'Kopírovat',
        copied: 'Zkopírováno',
        share: 'Sdílet',
        shareLink: 'Sdílet odkaz',
        shareDiscover: 'Sdílet svůj výzkum',
        source: {
            title: 'Datový zdroj',
            select: 'Vyberte datový zdroj',
            modify: 'Změnit datový zdroj pozorování',
            gbifWarning:
                'Počet pozorování a data posledních pozorování jsou založeny na agregaci posledních pozorování v rámci vybrané oblasti a jsou omezeny na maximálně {nbObs}.',
        },
        gbif: {
            apiEndpoint: 'API endpoint GBIF',
        },
        geonature: {
            api_endpoint: 'API endpoint GeoNature',
            id_export: 'ID exportu',
        },
        desc: 'Sestupně',
        asc: 'Vzestupně',
        media: {
            source: 'Zdroj médií',
            image: 'Zdroj obrázku',
            sound: 'Zdroj zvuku',
            select: 'Vyberte zdroj médií',
            linkToOrigin: 'Zdroj',
            licenseUnder: 'Pod licencí ',
        },
        taxon: {
            scientificName: 'Vědecký název',
            vernacularName: 'Obecný název',
            nbObservations: 'Počet pozorování',
            lastSeenDate: 'Datum posledního pozorování',
            taxonFilter: 'Filtrovat podle druhu',
            classFilter: 'Filtrovat podle třídy',
            learnMore: 'Více informací',
            class: 'Třída druhu',
            taxonFound: 'nalezené druhy',
        },
        mode: {
            galleryMode: 'Galerie',
            detailedList: 'Detailní',
            hybrid: 'Hybridní',
            isTaxonListHybrid: 'Režim seznamu druhů je přizpůsobitelný',
        },
        widgetType: {
            list: 'Seznam',
            default: 'Mapa a seznam',
        },
        numberOfTaxonPerLine: 'Počet druhů na řádek',
        widgetPreview: 'Náhled',
        taxonsClass: {
            Animalia: {
                Mammalia: 'Savci',
                Aves: 'Ptáci',
                Reptilia: 'Plazi',
                Amphibia: 'Obojživelníci',
                Insecta: 'Hmyz',
                Arachnida: 'Pavoukovci',
                Gastropoda: 'Plži',
                Bivalvia: 'Mlži',
            },
            Plantae: {
                Magnoliopsida: 'Dvouděložné',
                Liliopsida: 'Jednoděložné',
                Pinopsida: 'Jehličnany',
            },
        },
        map: {
            searchPlace: 'Vyhledat název místa',
        },
        or: 'nebo',
        in: 'v',
        datasetList: 'přiřazené datové sady',
        observation: 'pozorování',
        observations: 'pozorování',
    },
};

export default messagesCS;
