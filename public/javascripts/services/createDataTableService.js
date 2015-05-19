/*
Uses 'Datatables' jQuery plugin to create a table over the map that can be used to view and filter
entities provided on the s3 bucket excel file (these might be shelters, donors, or other entities)

This service references the 's3ObjectService' to get the data needed
*/

app.service('createDataTableService', function() {

    this.go = function(obj) {

    	// var tableData = s3ObjectService.objectArray;

    	$(document).ready(function() {
            $('#datatable').DataTable({
                // pull in the 'tableData' object created above
                "data": obj,
                // instantiate scroll feature for datata
                "scrollY": "400px",
                "scrollCollapse": true,
                "paging": false,
                "aaSorting": [[2, "asc"]],
                "columns": [
                    { "data": "name" },
                    { "data": "city" },
                    { "data": "type", "class": "center" }
                ],
                // callback function to set map lat/lng link to each row when generated
                "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
                    $(nRow).on('click', function() {
                        // redirect lat/lng for entity with default zoom of '8'
                        map.setView(new L.LatLng(parseFloat(aData.lat), parseFloat(aData.lng)), 12);
                        openPopup("Hello!");
                    });
                }
            });
        });
    };

}]);