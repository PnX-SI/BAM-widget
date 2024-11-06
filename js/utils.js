
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
