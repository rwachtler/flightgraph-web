/**
 * Created by rwachtler on 22.06.15.
 */
var callsignArray = [];
if(localStorage.getItem("favourites") == null){
    //localStorage.setItem("favourites", JSON.stringify(favouritesArray));
} else{
    callsignArray = JSON.parse(localStorage.getItem("favourites"));
}
var planeObjects = [];
if(localStorage.getItem("planes") == null){

} else {
    planeObjects = JSON.parse(localStorage.getItem("planes"));
}

$(document).ready(function(){
    callsignArray.forEach(function(callsign){
        var curPlane = $.grep(planeObjects, function(e){return e.callsign == callsign});
        console.log(curPlane);
        $("#favouritesTable").append('<tr><td>'+curPlane[0].callsign+'</td>' +
        '<td>'+curPlane[0].departureAirport+'</td>' +
        '<td>'+curPlane[0].arrivalAirport+'</td>' +
        '<td>'+curPlane[0].departureLocal+'</td>' +
        '<td>'+curPlane[0].arrivalLocal+'</td>' +
        '<td>'+curPlane[0].delay+'</td>' +
        '<td>'+curPlane[0].speed+'</td>' +
        '<td>'+curPlane[0].altitude+'</td>' +
        '</tr>');
    });
});
