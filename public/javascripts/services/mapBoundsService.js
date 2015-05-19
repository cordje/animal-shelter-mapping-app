/*
Uses the lat/lng coordinates obtained from the 's3ObjectService' (and if necessary, the geocodeService)
to set the icon markers, determine the bounds of the map and set the correct zoom level
*/

app.service('mapBoundsService', [ 'iconService', 's3ObjectService', 'leafletData', function(iconService, s3ObjectService, leafletData) {

	this.go = function(markerObj, map, latLngBounds) {

		var latLngBounds = L.latLngBounds(L.latLng(0,0));
	    var marker = L.marker([markerObj.lat, markerObj.lng], {icon: markerObj.icon});

	    marker.addTo(map).bindPopup(markerObj.message);

	    latLngBounds.extend(marker.getLatLng());
	    return map.fitBounds(latLngBounds,{padding: [20, 20]});

	};

}]);