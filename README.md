# Animal Shelter Mapping Tool
MEAN stack mapping tool for local animal shelter

DEMO (for privacy reasons, the client's customer data is not presented on the datatable)

https://frozen-savannah-7715.herokuapp.com/

This is a project I worked on with another local developer. The goal of the project was to create
an application that would allow the board of a regional animal shelter to manage the shelters and
donors in their network and display this information dynamically on a map. This mapping functionality 
is a great asset to them in terms of presenting their cause and fundraising.

The app is built using the MEAN stack and incorporates a number of interesting elements that showcase
the effectiveness of a full-stack javascript application. Some highlights include:

- The board of the shelter are not technically savvy and wanted to be able to manager their information
from an excel spreadsheet. To that end, the source of data for the application is an xlsx document
that the board maintains on an amazon S3 bucket. On loading, this application retreieves the latest
copy of the file from the AWS bucket and parses the data to JSON so that it can be handled easily in javascript.

- Angular-leaflet is used for the mapping functionality. Upon application load, the map automatically
centers to fit all shelters and donors within the map bounds

- Shelter and donor data is presented on a table/legend using jquery datatables which is excellent!

- The most accurate way to map locations is using latitude and longitude coordinates. The board of the shelter
did not want to have to find or maintain this information, so a key feature of the app is that it will
geocode locations using standard address information. This app uses NOMINATUM to geocode shelter and donor
locations with great result.

- Promises and closures are used to handle application flow and asynchronous $http calls

- separated angular services for each major task the application completes

- jade templating for the front end

- UX features include:
    - markers for each shelter/donor that can be clicked to display popup information
    - a button to center the map and fit to bounds all the shelters/donors
    - each row of the datatable can be clicked to center the map on that shelter/donor and display their info
    
For more information please see extensive notes in the source code. The meat of the application can be found 
in the '/public/javascripts/index-client.js' file, the '/routes/index.js' file and the 'app.js' file.

Thanks!
