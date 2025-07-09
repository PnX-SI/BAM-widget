const messagesFR = {
  fr: {
    title: "Biodiversité autour de moi",
    subtitle: "Rechercher des espèces autour de moi",
    howto: "Comment ça marche ?",
    intro: `<p>
        <em>Biodiversité autour de moi</em> est un widget dédié à
        <strong>l'exploration des espèces <i class="bi bi-search"></i></strong>
        ! Cette interface vous permet de
        <strong
          >rechercher les espèces observées dans une zone
          géographique spécifique <i class="bi bi-geo-alt"></i></strong
        >.
      </p>
      <p>
        <strong>Utilisez la carte interactive <i class="bi bi-map"></i></strong>
        pour sélectionner la zone où vous souhaitez effectuer votre recherche.
        La
        <strong
          ><i class="fa fa-kiwi-bird"></i> liste des espèces
          <i class="fa fa-leaf"></i
        ></strong>
        trouvées dans la zone sélectionnée s'affichera à côté de la carte
        <i class="bi bi-list-ul"></i>.
      </p>
      <p>
        Vous pouvez également
        <strong>partager vos résultats <i class="bi bi-share"></i></strong>
        pour collaborer avec d'autres utilisateurs.
      </p>`,
    parameters: "Paramètres",
    filters: "Filtres",
    showFilters: "Afficher les filtres",
    RefreshFilters: "Rafraichir les paramétres",
    IndicateGeoJSONUrl: "Indiquer une URL vers un GeoJSON",
    TaxonListModeSelection: "Mode d'affichage des taxons",
    widgetTypeSelection: "Mode d'affichage du widget",
    UseGeoJSONSource: "Utiliser une source GeoJSON",
    filtersTitle: "Filtres",
    mapEditable: "Carte éditable",
    radius: "Rayon",
    bufferSize: "Taille du buffer",
    dateMin: "Date Min",
    dateMax: "Date Max",
    search: "Rechercher",
    reset: "Réinitialiser",
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
    desc: "Décroissant",
    asc: "Croissant",
    media: {
      source: "Source de médias",
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
    galleryMode: "Galerie",
    detailedList: "Détaillé",
    widgetType:{
      list:"Liste",
      default:"Défaut"
    },
    numberOfTaxonPerLine: "Nombre de taxons par ligne",
    widgetPreview:"Prévisualisation du widget"
  },
};

export default messagesFR;
