/*
This service holds the different marker icons for the leaflet map and assigned the correct
market image to each entity depending on its type

This service is called in the 's3ObjectService' service
*/

app.service('iconService', function() {

	this.icons = {
            "A": L.icon({
                iconUrl: '/images/redPushpin.png',
                iconAnchor: [12, 25],
                iconSize: [16, 32],
                popupAnchor: [0, -20]
            }),
            "F": L.icon({
                iconUrl: '/images/catPushpin.png',
                iconAnchor: [12, 25],
                iconSize: [25, 22],
                popupAnchor: [0, -20]
            })
    }
	
});