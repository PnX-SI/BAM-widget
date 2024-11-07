
class SPARQLQueryDispatcher {
	constructor( endpoint ) {
		this.endpoint = endpoint;
	}

	query( sparqlQuery ) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch( fullUrl, { headers } ).then( body => body.json() );
	}
}


async function getTaxRefCdNom(gbifID) {
  const query = `PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/> 
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX v: <http://www.wikidata.org/prop/statement/>

SELECT ?item ?itemLabel ?taxrefID 
WHERE {
    ?item wdt:P846 "${gbifID}".
    ?item wdt:P3186 ?taxrefID
    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "fr" .
    }
}
    `
    // query = encodeURIComponent(query)
    let sparql_endpoint = "https://query.wikidata.org/sparql"
    
    
    let idTaxRef = null;
    const dispatcher = new SPARQLQueryDispatcher(sparql_endpoint);
    await dispatcher.query(query).then(data => {
        idTaxRef = data?.results?.bindings[0]?.taxrefID.value
        })
    return idTaxRef
}

function getQueryParams() {

    const params = (new URL(location)).searchParams;

    return {
        wkt: params.get("wkt"),
        geolocation: params.get("geolocation"),
        x: parseFloat(params.get("x")),
        y: parseFloat(params.get("y")),
        radius: parseInt(params.get("radius")),
        use_gbif: JSON.parse(params.get("use_gbif")),
        use_gn2: JSON.parse(params.get("use_gn2")),
        gn_2_url: params.get("gn_2_url"),
        nb_results: parseInt(params.get("nb_results")),
    }
}

function convertGeoJsonToWkt(feature) {
    const coo = feature.geometry.coordinates.map(function (ring) {
        return '(' + ring.map(function (p) {
            return p[0] + ' ' + p[1];
        }).join(', ') + ')';
    }).join(', ');
    const wkt_str = 'POLYGON(' + coo + ')';
    return wkt_str;
}

function processLocalisation(params) {
    if (params.wkt) {
        return params.wkt;
    }
    if (params.x && params.x) {
        const point = turf.point([params.x, params.x]);
        const buffered = turf.buffer(point, params.radius | 100, { units: "meters" });
        //convert the json-input to WKT
        return convertGeoJsonToWkt(buffered)
    }
}