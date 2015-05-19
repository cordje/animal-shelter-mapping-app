/*
Checks what content is available for each entity and constructs the html popup for map
*/

app.service('createHtmlMessageService', [ 's3ObjectService', function(s3ObjectService) {

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

        return html;

    };

}]);