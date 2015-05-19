


var app = angular.module('app1', ['leaflet-directive']);

/*  Brief overview of Angular depency injections used in this project:
* 
*   '$q' is Angulars implementation of promises based off kris kowal's popular 
*   Javacsript promise library, 'q' (https://github.com/kriskowal/q) 
*
*   '$timeout' is only used as a placeholder until a better solution is found 
*   to load the Datatables table after the resolution of the $http async promises
*
*   -----------------------------------------------------------------------------
*
*   This app takes advantage of Angular's modular services to separate functionality.
*   After review, these services will be moved into separate files
*
*   The brack notation '[' and ']' used in the controller and service definitions is
*   there to protect those keywords during minification, so the reference is not lost
*/


app.controller('Controller', [ '$scope', '$http', '$q', '$timeout', 'leafletData', 'addMarkersService', 'formatExcelDateService', 'createDataTableService', 'createHtmlMessageService', 'geocodeService', 's3ObjectService', 'iconService', function($scope, $http, $q, $timeout, leafletData, addMarkersService, formatExcelDateService, createDataTableService, createHtmlMessageService, geocodeService, s3ObjectService, iconService) {


    // Using '$scope.init' with function definitions below is just a best practice
    // to ensure that all loading is complete before starting the app

    $scope.init = function() {

        // this is the core data object where we store the data from the excel file off S3
        // this will also store the updated data from the geocode and message services
        $scope.contents = [];

        // this is a store for the lat/lng values from all entities
        // having these in a separate leaflet object makes setting map bounds easy
        $scope.latLngBounds = new L.LatLngBounds([]);

        // generate the leaflet map
        $scope.setMap();

        // get the excel file off S3 and begin the data services
        $scope.getFile();

        // really sad, pathetic solution to loading the datatables AFTER the resolution
        // of the angular $http async calls. We need a better solution here!!
        $timeout(function() {createDataTableService.go($scope.contents)}, 3000);

        // zoom/center button on map
        $('#zoomdiv').click(function() {
            leafletData.getMap().then(function(map) {

                // close all open popups
                map.closePopup();

                // recenter map to fit bounds
                return map.fitBounds($scope.latLngBounds, {padding: [20, 20]});
            });
        });

    }

    // set the leaflet map
    $scope.setMap = function() {
        angular.extend($scope, {
            defaults: {
                tileLayer: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                //tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                zoomControlPosition: 'topright',
                tileLayerOptions: {
                    opacity: 0.9,
                    detectRetina: true,
                    reuseTiles: true
                }
            }
        });
    }

    // get the xlsx file from the S3 bucket
    $scope.getFile = function() {
        $http.get('/file').success(function(data, status) {

            leafletData.getMap().then(function(map) {

                // core data service from which the other services will be called
                // as necessary
                s3ObjectService.go(data.data, map, $http, $scope);

            });
        });
    }

    $scope.init();

}]);

app.service('s3ObjectService', [ '$http', '$q', 'createDataTableService', 'leafletData', 'geocodeService', 'formatExcelDateService', 'iconService', 'createHtmlMessageService', 'addMarkersService', function($http, $q, createDataTableService, leafletData, geocodeService, formatExcelDateService, iconService, createHtmlMessageService, addMarkersService) {

    var self = this;

    this.go = function(worksheetArray, map, $http, $scope) {

        // loop through xlsx doc and pull info into JSON
        for(var i = 1; i < worksheetArray.length; i++) {

            // using closures to create new execution contexts that we can reference
            // after the completion of the $http promises during the geocode service
            (function(i) {

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
                    dateOfService: formatExcelDateService.run(worksheetArray[i][15]) || "NA",
                    comments: worksheetArray[i][16]||"NA"
                };

                //determine the correct icon by type
                x.icon = iconService.icons[x.type] || iconService.icons[Object.keys(iconService.icons)[0]];

                // create/format the html popup messages
                x.message = createHtmlMessageService.generate(x);

                // get lat/lng values from nominatim if missing
                if(x.lat == 0 || x.lng == 0) {

                    // here the geocode service utilizes the angular promise implementation, '$q'
                    geocodeService.go(x, map, $http, $q)

                    // after the resolution of the promise, this function is called with the response
                    .then(function(res) {
                        if (res.length == 0) {
                            alert("Unable to geocode: " + x.street + " " + x.city + " " + x.state + " " + x.zip);
                        } else {

                            // set the lat/lng values from nominatum
                            x.lat = parseFloat(res[0].lat);
                            x.lng = parseFloat(res[0].lon);

                            // update data model with new lat/lng values
                            $scope.contents.push(x);

                            // update our leaflet bounds object
                            $scope.latLngBounds.extend([x.lat, x.lng]);

                            // set markers
                            addMarkersService.go(x, map, $scope);

                        }
                    }, function(err) {
                        alert("Http error when geocoding: " + x.street + ", " + x.city + " " + x.state + " " + x.zip + ": " + status + " - " + data);
                    });

                // if the lat/lng values are present from the xlsx file from S3, we proceed
                // directly, skipping the geocode service
                } else {

                    // update data model with contents
                    $scope.contents.push(x);

                    // update our leaflet bounds object
                    $scope.latLngBounds.extend([x.lat, x.lng]);

                    // set markers
                    addMarkersService.go(x, map, $scope);
                }
                
            // run our closure immediately to create the new execution context that
            // we can refer to later after promise fulfillment    
            })(i);

        }
    };

}]);


// store for our icons
app.service('iconService', function() {

    this.icons = {
            "A": L.icon({
                iconUrl: '/images/redPushpin.png',
                iconAnchor: [12, 25],
                iconSize: [16, 32],
                popupAnchor: [0, -20]
            }),
            "F": L.icon({
                iconUrl: '/images/house.png',
                iconAnchor: [12, 25],
                iconSize: [20, 30],
                popupAnchor: [0, -25]
            }),
            "T": L.icon({
                iconUrl: '/images/dollar.png',
                iconAnchor: [12, 25],
                iconSize: [30, 30],
                popupAnchor: [0, -20]
            })
    }
    
});


// convert excel date format to readable MM/DD/YYYY format
// returns an updated date string we can use in our html message service
app.service('formatExcelDateService', function() {

    this.run = function(excelDate) {
        var utc_days  = Math.floor(excelDate - 25569);
        var utc_value = utc_days * 86400;                                        
        var date_info = new Date(utc_value * 1000);

        var fractional_day = excelDate - Math.floor(excelDate) + 0.0000001;

        var total_seconds = Math.floor(86400 * fractional_day);

        var seconds = total_seconds % 60;

        total_seconds -= seconds;

        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;

        var fullDate = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);

        console.log("excel format service done!");
        return fullDate.toLocaleDateString();
    }

});

// create the html message for leaflet popup
// returns an html string
app.service('createHtmlMessageService', function() {

    this.generate = function(obj) {
        
        var html ="<div class='pushpinContent'><b>"+ obj.name +" " +obj.street+" "+obj.city+"<b>";
        
        if(obj.numberOfAnimals != 0)
            html+="<p>Animals: "+obj.numberOfAnimals+"</p>";
        if(obj.ageSexOfAnimals != "N/A")
            html+="<p>Age/sex: "+obj.ageSexOfAnimals+"</p>";
        if(obj.spayNeuter != "N/A")
            html+="<p>Spay/neuter: "+obj.spayNeuter+"</p>";
        if(obj.personsInvolved != "N/A")
            html+="<p>Persons involved: "+obj.personsInvolved+"</p>";
        if(obj.contactInfo != "N/A")
            html+="<p>Contact info: "+obj.contactInfo+"</p>";
        if(obj.serviceProvider != "N/A")
            html+="<p>Service provider: "+obj.serviceProvider+"</p>";
        if(obj.dateOfService != "N/A")
            html+="<p>Date of service: "+obj.dateOfService+"</p>";
        if(obj.comments != "N/A")
            html+="<p>Comments: "+obj.comments+"</p>";
        html+="</div>"

        console.log("Message service done!");
        return html;

    };

});


app.service('geocodeService', [ '$http', '$q', function($http, $q) {

    var geocode = this;

    geocode.go = function(x, map, $http, $q) {

        // here '$q.defer' is a function, so we run it, this is our promise
        var defer = $q.defer();

        // access the nominatum api using the object info we need
        var url = (window.location.protocol+"//nominatim.openstreetmap.org/search?format=json&limit=1&q=" + x.street + " " + x.city + " " + x.state + " " + x.zip).replace("null","");

        $http.get(url)
            .success(function (data, status) {

                // upon success we just resolve the promise and pass the response
                // the logic to handle this data is found in the core 's3ObjectService'
                defer.resolve(data);
            })
            .error(function(err, status) {

                // like above, we merely pass the error and handle outside
                defer.reject(err);
            })

        // 'defer.promise' is just a normal object that we return upon success/failure
        return defer.promise;
    }

}]);

// 
app.service('addMarkersService', [ 'leafletData', function(leafletData) {

    this.go = function(markerObj, map, $scope) {

        $(document).ready(function() {
            leafletData.getMap().then(function(map) {
                
                // set our lat/lng bounds from the $scope variable
                var latLngBounds = $scope.latLngBounds;

                // create a new markets from the passed in object
                var marker = L.marker([markerObj.lat, markerObj.lng], {icon: markerObj.icon});

                // add the marker to leaflet map and bind popup html
                marker.addTo(map).bindPopup(markerObj.message);

                // center the leaflet map with all markers within bounds
                return map.fitBounds(latLngBounds, {padding: [20, 20]});
            });
        });
    };

}]);

// legend using 'Datatables'. Key functionality:
// 1) loads rows dynamically from xlsx data on S3 bucket
// 2) able to sort all columns A-Z
// 3) click on any row to center the map on entity and display html popup
app.service('createDataTableService', [ 'leafletData', function(leafletData) {

    this.go = function(obj) {

        $(document).ready(function() {
            leafletData.getMap().then(function(map) {

                // instantiate new datatable refering to the 'index.jade'
                $('#datatable').DataTable({

                    // we define our data source as the entity object pass in to func
                    "data": obj,

                    // instantiate scroll feature for datata
                    "scrollY": "400px",
                    "scrollCollapse": true,

                    // no pagination
                    "paging": false,

                    //define our table columns
                    "columns": [
                        { "data": "name" },
                        { "data": "city" },
                        // center the type letter in column
                        { "data": "type", "className": "dt-center" }
                    ],

                    // callback function to set link to each row when generated
                    // 'nRow' is each row of the table
                    // 'aData' is the 'obj' data for each row
                    "fnRowCallback": function( nRow, aData, iDisplayIndex ) {

                        // when each row is click...
                        $(nRow).on('click', function() {

                            // center map on lat/lng for entity with default zoom of '12'
                            map.setView(new L.LatLng(parseFloat(aData.lat), parseFloat(aData.lng)), 12, {animate: true});

                            // re-create popup and display on row click (may be a better way to do this)
                            var popup = L.popup()
                                .setLatLng([parseFloat(aData.lat + .0075), parseFloat(aData.lng)])
                                .setContent(aData.message)
                                .openOn(map);                        
                        });
                    }
                });
            });
        });
    };

}]);











