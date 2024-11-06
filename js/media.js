async function addMedia2Json(speciesDict) {
	console.log("addMedia2Json");
	for(key in speciesDict) {
		url = 'https://api.gbif.org/v1/species/' + speciesDict[key].gbifId + '/media';

		await fetch(url,{method:'GET'})
		.then(function(response) {return response.json(); })
		.then(function(json) {
			// Media checking
			if (json.results.length > 0) {
				speciesDict[key].media = json.results[0].identifier;
				console.log(speciesDict[key].media + "<br>");
			}
		});
		console.log(key + "<br>");
		console.log(url + "<br>");
	}

	return speciesDict;
}
