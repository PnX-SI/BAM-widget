const messagesFR = {
    fr: {
        title: 'BAM - Biodiversité autour de moi',
        discover: {
            title: 'Explore',
        },
        subtitle: 'Rechercher des espèces autour de moi',
        howto: 'Comment ça marche ?',
        introTitle: "Qu'est-ce que Biodiversité autour de moi ?",

        intro: `*Biodiversité autour de moi* est un widget dédié à **l'exploration des espèces 🔍** !

Cette interface vous permet de **rechercher les espèces observées dans une zone géographique spécifique 🌍**.

**Utilisez la carte interactive 🗺️** pour sélectionner la zone où vous souhaitez effectuer votre recherche.

La **liste des espèces 🥝🍃** trouvées dans la zone sélectionnée s'affichera à côté de la carte 📋.

Vous pouvez également **partager vos résultats 📤** pour collaborer avec d'autres utilisateurs.
`,
        parameters: 'Paramètres',
        nbDisplayedSpecies: "Nombre d'espèces affichées",
        filters: 'Filtres',
        showFilters: 'Afficher les filtres',
        RefreshFilters: 'Rafraîchir les paramètres',
        IndicateGeoJSONUrl: 'Indiquer une URL vers un GeoJSON',
        IndicateDetailTemplateUrl: 'https://<urlFicheDeTaxon>/',
        TaxonListModeSelection: "Mode d'affichage des espèces",
        widgetTypeSelection: "Mode d'affichage du widget",
        UseGeoJSONSource: 'Utiliser une source GeoJSON',
        UseCustomDetailPage:
            'Modifier la redirection du bouton "En Savoir Plus" ',
        filtersTitle: 'Filtres',
        mapEditable: ' Zone de recherche éditable',
        bufferSize: 'Taille du buffer (en mètre)',
        dateMin: 'Date min',
        dateMax: 'Date max',
        search: 'Rechercher',
        reset: 'Réinitialiser',
        limit: 'Limite',
        nbPages: 'Nombre de pages',
        searchResults: 'Résultats de la recherche',
        noResults: 'Aucun résultat',
        previousPage: 'Précedent',
        nextPage: 'Suivant',
        loading: 'Chargement en cours ...',
        noObservations: 'Aucune observation trouvée',
        noSpeciesObserved: 'Aucune espèce observée dans cette zone !',
        noGeometry: 'Aucune géometrie trouvée',
        error404: {
            title: 'Page introuvable',
            subtitle: "La page que vous recherchez n'existe pas",
        },
        browserIntegration: 'Intégrer le widget dans votre site',
        drawGeometry: 'Dessiner une zone pour afficher les espèces',
        size: {
            width: 'Largeur',
            height: 'Hauteur',
        },
        embed: 'Code HTML',
        typeWidget: {
            title: 'Type de widget',
            default: 'Carte et liste',
            list: "Liste d'espèces",
            config: 'Configurateur',
        },
        copy: 'Copier',
        copied: 'Copié',
        share: 'Partager',
        shareLink: 'Partager un lien',
        shareDiscover: 'Partager votre recherche',
        source: {
            title: 'Source de données',
            select: 'Sélectionner une source',
            modify: 'Modifier la source de données des observations',
            gbifWarning:
                "Le nombre d'observations et leurs dates sont basés sur une agrégation des dernières observations effectuées dans la zone sélectionnée et limitée à {nbObs} maximum.",
        },
        gbif: {
            apiEndpoint: "Adresse de l'API du GBIF",
        },
        geonature: {
            api_endpoint: "Adresse de l'API de GeoNature",
            id_export: "Identifiant de l'export",
        },
        desc: 'Décroissant',
        asc: 'Croissant',
        media: {
            source: 'Source de médias',
            image: "Source d'image",
            sound: 'Source de son',
            select: 'Sélectionner une source de média',
            linkToOrigin: 'Source',
            licenseUnder: 'Sous licence ',
        },
        taxon: {
            scientificName: 'Nom scientifique',
            vernacularName: 'Nom vernaculaire',
            nbObservations: "Nombre d'observations",
            lastSeenDate: 'Date de la dernière observation',
            taxonFilter: 'Filtre par espèce',
            classFilter: 'Filtrer par classe',
            learnMore: 'En savoir plus',
            class: "Classe d'espèce",
            taxonFound: 'espèces trouvées',
        },
        mode: {
            galleryMode: 'Galerie',
            detailedList: 'Détaillé',
            hybrid: 'Hybride',
            isTaxonListHybrid: "Mode de la liste d'espèce modifiable",
        },
        widgetType: {
            list: 'Liste',
            default: 'Carte Liste',
        },
        numberOfTaxonPerLine: "Nombre d'espèces par ligne",
        widgetPreview: 'Prévisualisation',
        taxonsClass: {
            Animalia: {
                Mammalia: 'Mammifères',
                Aves: 'Oiseaux',
                Reptilia: 'Reptiles',
                Amphibia: 'Amphibiens',
                Insecta: 'Insectes',
                Arachnida: 'Arachnides',
                Gastropoda: 'Gastéropodes',
                Bivalvia: 'Bivalves',
            },
            Plantae: {
                Magnoliopsida: 'Magnoliopsida',
                Liliopsida: 'Monocotylédone',
                Pinopsida: 'Conifères',
            },
        },
        map: {
            searchPlace: 'Rechercher un lieu',
        },
        or: 'ou',
        in: 'dans',
        datasetList: 'jeux de données associés',
        observation: 'observation',
        observations: 'observations',
    },
};

export default messagesFR;
