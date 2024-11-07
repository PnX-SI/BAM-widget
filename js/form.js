//getTaxonList(1,2);
function getLocationConstant() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError);
    } else {
        alert("Your browser or device doesn't support Geolocation");
    }
}

// If we have a successful location update
function onGeoSuccess(event) {
    document.getElementById("Latitude").value = event.coords.latitude;
    document.getElementById("Longitude").value = event.coords.longitude;
    //document.getElementById("Position1").value = event.coords.latitude + ", "+ event.coords.longitude;

}

// If something has gone wrong with the geolocation request
function onGeoError(event) {
    alert("Error code " + event.code + ". " + event.message);
}


function handleEventMapChoices(event) {
    if (event.target.name == 'locChoice') {
        let curSel = document.querySelector('input[name="locChoice"]:checked').value;
        if (curSel == "geoloc") {

            document.getElementById('fieldsetGeoloc').style.display = "inline";
            document.getElementById('mapdiv').style.display = "none";

        };
        if (curSel == "map") {

            document.getElementById('fieldsetGeoloc').style.display = "none";
            document.getElementById('mapdiv').style.display = "block";

        };
    }
}

function initMap(markers) {
    map = new OpenLayers.Map("mapdiv");
    map.addLayer(new OpenLayers.Layer.OSM());

    var lonLat = new OpenLayers.LonLat(0, 45)
        .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            map.getProjectionObject() // to Spherical Mercator Projection
        );

    var zoom=4;
    map.setCenter (lonLat, zoom);
    var marker = new OpenLayers.Marker(new OpenLayers.LonLat(0, 45));
    markers.addMarker(marker);
    map.addLayer(markers);
     
    map.events.register('click', map, function handleMapClick(e) {
        var clickedLonLat = map.getLonLatFromViewPortPx(e.xy).transform(map.projection, map.displayProjection);
        map.panTo(clickedLonLat);
        markers.clearMarkers();
        var marker = new OpenLayers.Marker(clickedLonLat)
        marker.id = "marker"
        markers.addMarker(marker);       
    });

  }


function processFormParams() {
    queryParams = {}
    // on click submit
    queryParams["use_gbif"] = document.getElementById("switchGBIF").checked;
    queryParams["use_gn2"] = document.getElementById("switchGN2").checked;
    queryParams["gn_2_url"] = document.getElementById("inputUrlGN2").value;

    queryParams["radius"] = document.getElementById("inputBuffer").value;
    queryParams["nb_results"] = document.getElementById("inputNOCC").value;

    // Check radio button for stuff
    let finSel = document.querySelector('input[name="locChoice"]:checked').value;
    if (finSel == 'map') {
        //get marker lon lat
        queryParams["x"] = markers.markers[0]['lonlat'].transform("EPSG:3857", 'EPSG:4326')['lon'];
        queryParams["y"] =  markers.markers[0]['lonlat'].transform("EPSG:3857", 'EPSG:4326')['lon'];

    }
    else if (finSel == 'geoloc') {
        //get lon lat from geoloc
        queryParams["y"] = parseFloat(document.getElementById("Latitude").value);
        queryParams["x"] = parseFloat(document.getElementById("Longitude").value);
    }; 
    console.log(queryParams)
    queryDisplayTaxonList(queryParams);  
}