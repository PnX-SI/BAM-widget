async function addMedia2Json(speciesDict) {
	console.log("addMedia2Json");
	for(key in speciesDict) {
		url = 'https://api.gbif.org/v1/species/' + speciesDict[key]["gbifId"] + '/media';
		console.log(url + "<br>");
		await fetch(url,{method:'GET'})
		.then(function(response) {return response.json(); })
		.then(function(json) {
			speciesDict[key]["media"] = json.results[0].identifier
		});
	}
	console.log(speciesDict);
	return speciesDict;
}
