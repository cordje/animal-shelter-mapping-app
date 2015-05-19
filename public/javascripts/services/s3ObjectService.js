/*
Creates and returns data object from the client excel file hosted on the AWS S3 bucket

This service also calls the 'geocodeService' to get missing lat/lng values
and the 'createHtmlMessageService' to create the popup
and update the object
*/

app.service('s3ObjectService', [ '$http', 'geocodeService', 'iconService', function($http, geocodeService, iconService) {

    var self = this;

    this.go = function(worksheetArray, map, $http) {

    	self.objectArray = [];

    	// loop through xlsx doc and pull info into JSON
    	for(var i = 1; i < worksheetArray.length; i++) {
            var x = {
                name: worksheetArray[i][0],
                street: worksheetArray[i][1],
                city: worksheetArray[i][2],
                state: worksheetArray[i][3],
                zip: worksheetArray[i][4],
                lat: worksheetArray[i][5]||0,
                lng: worksheetArray[i][6]||0,
                type: worksheetArray[i][7]||0,
                numberOfAnimals: worksheetArray[i][8]||0,
                ageSexOfAnimals: worksheetArray[i][9]||"NA",
                vaccinations: worksheetArray[i][10]||"NA",
                spayNeuter: worksheetArray[i][11]||"NA",
                personsInvolved: worksheetArray[i][12]||"NA",
                contactInfo: worksheetArray[i][13]||"NA",
                serviceProvider: worksheetArray[i][14]||"NA",
                dateOfService: worksheetArray[i][15]||"NA",
                comments: worksheetArray[i][16]||"NA"
            };

            x.message = /*this.*/createHtmlMessageService.generate(x);

            //determine the correct icon by type
            x.icon = iconService.icons[x.type] || iconService.icons[Object.keys(iconService.icons)[0]];

            if(x.lat != 0 && x.lng != 0) {
                // build the markers, add to map and extend the bounds
                mapBoundsService.go(x, map, latLngBounds);
            } else {
                geocodeService.go(x, map, latLngBounds, $http);
            }
            self.objectArray.push(x);
        }
    };
}]);











