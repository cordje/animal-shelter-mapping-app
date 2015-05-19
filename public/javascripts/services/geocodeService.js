/*
Uses nominatim to determine lat/lng values for those missing in the root excel file
Uses the street, city, state and zip values required on the excel file on S3
*/

app.service('geocodeService', [ '$http', function($http) {

    this.go = function(x, map, latLngBounds, $http) {

        //if the lat/lng is not pre-resolved query nominatim
        var url = (window.location.protocol+"//nominatim.openstreetmap.org/search?format=json&limit=1&q=" + x.street + " " + x.city + " " + x.state + " " + x.zip).replace("null","");

        $http.get(url)
            .success(function (data, status) {
                if (data.length == 0) {
                    alert("Unable to geocode: " + x.street + " " + x.city + " " + x.state + " " + x.zip);
                } else {
                    x.lat = parseFloat(data[0].lat);
                    x.lng = parseFloat(data[0].lon);
                    mapBoundsService.go(x, map, latLngBounds);
                }
            }).error(function (data, status) {
                alert("Http error when geocoding: " + x.street + ", " + x.city + " " + x.state + " " + x.zip + ": " + status + " - " + data);
            });
    };

}]);