const messagesFR = {
  fr: {
    title: "Biodiversité autour de moi",
    subtitle: "Rechercher des espèces autour de moi",
    howto: "Comment ça marche ?",
    intro: `*Biodiversité autour de moi* est un widget dédié à **l'exploration des espèces 🔍** !

Cette interface vous permet de **rechercher les espèces observées dans une zone géographique spécifique 🌍**.

**Utilisez la carte interactive 🗺️** pour sélectionner la zone où vous souhaitez effectuer votre recherche.

La **liste des espèces 🥝🍃** trouvées dans la zone sélectionnée s'affichera à côté de la carte 📋.

Vous pouvez également **partager vos résultats 📤** pour collaborer avec d'autres utilisateurs.
`,
    parameters: "Paramètres",
    filters: "Filtres",
    showFilters: "Afficher les filtres",
    RefreshFilters: "Rafraichir les paramétres",
    IndicateGeoJSONUrl: "Indiquer une URL vers un GeoJSON",
    IndicateDetailTemplateUrl: "https://<urlFicheDeTaxon>/\\{taxonID\\}",
    TaxonListModeSelection: "Mode d'affichage des taxons",
    widgetTypeSelection: "Mode d'affichage du widget",
    UseGeoJSONSource: "Utiliser une source GeoJSON",
    UseCustomDetailPage: 'Modifier la redirection du bouton "En Savoir Plus" ',
    filtersTitle: "Filtres",
    mapEditable: " Zone de recherche éditable",
    radius: "Rayon",
    bufferSize: "Taille du buffer",
    dateMin: "Date min",
    dateMax: "Date max",
    search: "Rechercher",
    reset: "Réinitialiser",
    limit: "Limite",
    nbPages: "Nombre de pages",
    searchResults: "Résultats de la recherche",
    noResults: "Aucun résultat",
    previousPage: "Précedent",
    nextPage: "Suivant",
    loading: "Chargement en cours ...",
    noObservations: "Aucune observation trouvée",
    noSpeciesObserved: "Aucune espèces observées dans cette zone !",
    noGeometry: "Aucune géometrie trouvée",
    error404: {
      title: "Page introuvable",
      subtitle: "La page que vous recherchez n'existe pas",
    },
    browserIntegration: "Intégrer le widget dans votre site",
    drawGeometry: "Dessiner une zone pour afficher les espèces",
    size: {
      width: "Largeur",
      height: "Hauteur",
    },
    embed: "Code HTML",
    typeWidget: {
      title: "Type de widget",
      default: "Carte et liste",
      list: "Liste d'espèces",
      config: "Configurateur",
    },
    copy: "Copier",
    copied: "Copié",
    share: "Partager",
    shareLink: "Partager un lien",
    source: {
      title: "Source de données",
      select: "Sélectionner une source",
      modify: "Modifier la source de données",
      gbifWarning:
        "Le nombre d'observations et leurs dates sont basés sur une agrégation des 30 000 dernières observations effectuées dans la zone sélectionnée.",
    },
    gbif: {
      apiEndpoint: "Adresse de l'API du GBIF",
    },
    geonature: {
      api_endpoint: "Adresse de l'API de GeoNature",
      id_export: "Identifiant de l'export",
    },
    desc: "Décroissant",
    asc: "Croissant",
    media: {
      source: "Source de médias",
      image: "Source d'image",
      sound: "Source de son",
      select: "Sélectionner une source de média",
    },
    taxon: {
      scientificName: "Nom scientifique",
      vernacularName: "Nom vernaculaire",
      nbObservations: "Nombre d'observations",
      lastSeenDate: "Date de la dernière observation",
      taxonFilter: "Filtre par taxon",
      seeMore: "En savoir plus",
      class: "Classe du Taxon",
    },
    mode: {
      galleryMode: "Galerie",
      detailedList: "Détaillé",
      hybrid: "Hybride",
      isTaxonListHybrid: "Mode de la liste de taxon modifiable",
    },
    widgetType: {
      list: "Liste",
      default: "Défaut",
    },
    numberOfTaxonPerLine: "Nombre de taxons par ligne",
    widgetPreview: "Prévisualisation du widget",
    taxonsClass: {
      Animalia: {
        Mammalia: "Mammifères",
        Aves: "Oiseaux",
        Reptilia: "Reptiles",
        Amphibia: "Amphibiens",
        Insecta: "Insectes",
        Arachnida: "Arachnides",
        Gastropoda: "Gastéropodes",
        Bivalvia: "Bivalves",
      },
      Plantae: {
        Magnoliopsida: "Magnoliopsida",
        Liliopsida: "Liliopsidées",
        Pinopsida: "Conifères",
      },
    },
  },
};

export default messagesFR;
