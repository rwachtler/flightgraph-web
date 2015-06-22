/**
 * Created by rwachtler on 17.06.15.
 */


$("body").addClass("overlay");
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

d3.select(window).on("resize", throttle);
var width = window.screen.width;
var height = window.screen.height;
var worldMapTopo,airportTopo,projection,path,svg,g;
var scale = 0;
var planeCallsignArray = [];
var planeArray = [];
var airportArray = [];
var favouritesArray = [];
var callsigns = [];
//localStorage.clear();
if(localStorage.getItem("favourites") == null){
    localStorage.setItem("favourites", JSON.stringify(favouritesArray));
} else{
    favouritesArray = JSON.parse(localStorage.getItem("favourites"));

}
if(isMobile){
    scale = 2000;
}
else{
    scale = 3000;
}
var coordinates;
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 50])
    .center([width / 2, height / 2])
    .on("zoom", move);
var graticule = d3.geo.graticule();
var tooltip = d3.select("#content").append("div").attr("class", "tooltip hidden");

// Geolocation
var options = {
    enableHighAccuracy: true,
    maximumAge: 0
};
navigator.geolocation.getCurrentPosition(success, error, options);


function setup(width,height){
    projection = d3.geo.mercator()
        .translate([(width/2), (height/2)])
        .scale(scale)
        .center([coordinates.longitude, coordinates.latitude]);
    path = d3.geo.path().projection(projection);



    svg = d3.select("#content").append("svg")
        .attr("width", width)
        .attr("height", window.screen.height)
        .call(zoom)
        .on("click", click)
        .append("g");


    g = svg.append("g");
    setWorldData();

}

function setWorldData(){
    d3.json("data/world-topo-min.json", function(error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;
        worldMapTopo = countries;
        draw(worldMapTopo);
    });
}


function draw(topo) {
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);


    g.append("path")
        .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
        .attr("class", "equator")
        .attr("d", path);


    var country = g.selectAll(".country").data(topo);

    country.enter().insert("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("id", function(d,i) { return d.id; })
        .attr("title", function(d,i) { return d.properties.name; })
        .style("fill", function(d, i) { return "#ECECEC"; })
        .style("stroke", function(d, i) { return "#000000"; })
        .style("stroke-width", function(d, i) {return 0.5; });

    //offsets for tooltips
    var offsetL = document.getElementById('content').offsetLeft+20;
    var offsetT = document.getElementById('content').offsetTop+10;

    //remove overlay
    $("body").removeClass("overlay");
    //tooltips
    country
        .on("mousemove", function(d,i) {

            var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

            tooltip.classed("hidden", false)
                .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
                .html(d.properties.name);
        })
        .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true);
        });
    var userPositionText = "You're here!";
    addpoint(coordinates.longitude, coordinates.latitude,"user",userPositionText);
    setupAirports();

    loadLiveFlights();
}


function redraw() {
    width = document.getElementById('content').offsetWidth;
    height = width / 2;
    d3.select('svg').remove();
    setup(width,height);
    draw(worldMapTopo);
}


function move() {
    var t = d3.event.translate;
    var s = d3.event.scale;
    zscale = s;
    var h = height/4;


    t[0] = Math.min(
        (width/height)  * (s - 1),
        Math.max( width * (1 - s), t[0] )
    );

    t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(height  * (1 - s) - h * s, t[1])
    );

    zoom.translate(t);
    g.attr("transform", "translate(" + t + ")scale(" + s + ")");

    //adjust the country hover stroke width based on zoom level
    d3.selectAll(".country").style("stroke-width", 0.5 / s);

}



var throttleTimer;
function throttle() {
    window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
        redraw();
    }, 200);
}


//geo translation on mouse click in map
function click() {
    var latlon = projection.invert(d3.mouse(this));
}


//function to add points and text to the map (used in plotting capitals)
function addpoint(lat,lon,type) {


    var x = projection([lat,lon])[0];
    var y = projection([lat,lon])[1];
    var color = "#22a7f0";

    var rad = 4.0;
    if(isMobile){
        rad = 5.0;
    }
    if(x > 0 || y > 0){
        var gpoint = g.append("g").attr("class","gpoint");
        gpoint.append("svg:circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("class", "point")
            .attr("r", rad)
            .attr("onclick","flightClick(event)")
            .style("fill", color);
    }
}

function addPlane(lat,lon, callsign, speed, altitude, departureAirportCode, arrivalAirportCode, delay, arrivalLocal, departureLocal) {

    var x = projection([lat,lon])[0];
    var y = projection([lat,lon])[1];
    var rad = 4.0;
    if(isMobile){
        rad = 5.0;
    }
    if(x > 0 || y > 0){
        var gpoint = g.append("svg").attr("class","plane");
        if(callsign == getCookieByName("selectedFlight")){
            gpoint.append("svg:circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("id", callsign)
                .attr("r", rad)
                .attr("data-callsign", callsign)
                .attr("data-speed", speed)
                .attr("data-altitude", altitude)
                .attr("data-departureAirportCode", departureAirportCode)
                .attr("data-arrivalAirportCode", arrivalAirportCode)
                .attr("data-delay", delay)
                .attr("data-arrivalLocal", arrivalLocal)
                .attr("data-departureLocal", departureLocal)
                .attr("onclick", "flightClick(event)")
                .style("fill", "#000000");
        }
        else{
            gpoint.append("svg:circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("id", callsign)
                .attr("r", rad)
                .attr("data-callsign", callsign)
                .attr("data-speed", speed)
                .attr("data-altitude", altitude)
                .attr("data-departureAirportCode", departureAirportCode)
                .attr("data-arrivalAirportCode", arrivalAirportCode)
                .attr("data-delay", delay)
                .attr("data-arrivalLocal", arrivalLocal)
                .attr("data-departureLocal", departureLocal)
                .attr("onclick", "flightClick(evt)")
                .style("fill", "#F7CA18");
        }

    }
}

function addAirport(lat,lon, name, iata, size) {

    var x = projection([lat,lon])[0];
    var y = projection([lat,lon])[1];
    var rad = 4.0;
    if(isMobile){
        rad = 5.0;
    }
    if(x > 0 || y > 0){
        var gpoint = g.append("svg").attr("class","airport");
            gpoint.append("svg:circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("id", iata)
                .attr("r", rad)
                .attr("data-name", name)
                .attr("data-iata", iata)
                .attr("data-size", size)
                .attr("onclick", "airportClick(evt)")
                .style("fill", "#CF000F");
    }
}


function setupAirports(){
    $.getJSON("data/airports.topo.json", function(){})
        .done(function(airports){
            airports = airports.objects.airports;
            airportArray = airports;
            airports.forEach(function(airport){
                addAirport(airport.lon, airport.lat, airport.name, airport.iata, airport.size);
            });
        })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });

}

function loadLiveFlights(){
    $.getJSON("http://localhost:8080/flightgraph/rest/flights/area/49.05/12.5/46.35/17.226", function(){})
        .done(function(planes){
            planes = planes.data;
            planes.forEach(function(plane){
                //drawPlane(plane.lon, plane.lat);
                addPlane(plane.lon, plane.lat, plane.callsign, plane.speed, plane.altitude, plane.departureAirportCode, plane.arrivalAirportCode, plane.delay, plane.arrivalLocal, plane.departureLocal);
                planeCallsignArray.push(plane.callsign);
            });
        })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });
}


function success(pos) {
    coordinates = pos.coords;
    setup(width,height);
};

function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
};


setInterval(function(){
    $(".plane").fadeOut(1000,function(){
        $(this).remove();
    });
    loadLiveFlights();
}, 20000);

function manageFavourite(callsign){

    var curPlane = $.grep(favouritesArray, function(e){return e.callsign == callsign});
    if(favouritesArray.indexOf(callsign) < 0){
        favouritesArray.push(callsign);
        $(".actionButton").addClass("btn-danger");
        $(".actionButton").text("Remove from favourites");
        $(".actionButton").removeClass("btn-success");
    } else{
        favouritesArray = jQuery.grep(favouritesArray, function(value) {
            return value != callsign;
        });
        $(".actionButton").addClass("btn-success");
        $(".actionButton").text("Add to favourites");
        $(".actionButton").removeClass("btn-danger");
    }

    localStorage.setItem("favourites", JSON.stringify(favouritesArray));
}

function flightClick(event){
    if(event.target.id != ""){
        var selectedPlane = document.getElementById(event.target.id);
        var callsign = selectedPlane.getAttribute("data-callsign");
        var speedKT = selectedPlane.getAttribute("data-speed");
        var speedKMH = (speedKT * 1.85200).toFixed(2);
        var altitudeFT = selectedPlane.getAttribute("data-altitude");
        var altitudeKM = (altitudeFT / 3048).toFixed(2);
        var departureAirport = selectedPlane.getAttribute("data-departureAirportCode");
        var arrivalAirport = selectedPlane.getAttribute("data-arrivalAirportCode");
        var delay = selectedPlane.getAttribute("data-delay");
        var arrivalLocal = selectedPlane.getAttribute("data-arrivalLocal");
        var departureLocal = selectedPlane.getAttribute("data-departureLocal");

        $("#modalLabel").text(callsign);

        arrivalLocal = arrivalLocal.substr(11, 5);
        departureLocal = departureLocal.substr(11, 5);

        arrivalAirport = $.grep(airportArray, function(e){return e.iata == arrivalAirport});
        departureAirport = $.grep(airportArray, function(e){return e.iata == departureAirport});
        $(".modal-body").html('' +
        '<dl class="dl-horizontal">' +
            '<dt>Speed (kt)</dt>' +
                '<dd>'+speedKT+'</dd>' +
            '<dt>Speed (km/h)</dt>' +
                '<dd>'+speedKMH+'</dd>' +
            '<dt>Altitude (ft)</dt>' +
                '<dd>'+altitudeFT+'</dd>' +
            '<dt>Altitude (km)</dt>' +
                '<dd>'+altitudeKM+'</dd>' +
            '<dt>Departure airport</dt>' +
                '<dd>'+departureAirport[0].name+'</dd>' +
            '<dt>Arrival airport</dt>' +
                '<dd>'+arrivalAirport[0].name+'</dd>' +
            '<dt>Departure</dt>' +
                '<dd>'+departureLocal+'</dd>' +
            '<dt>Arrival</dt>' +
                '<dd>'+arrivalLocal+'</dd>' +
            '<dt>Delay</dt>' +
                '<dd>'+delay+' min.</dd>' +
        '</dl>');

        var planeObject = {};
        planeObject["callsign"] = callsign;
        planeObject["speed"] = speedKMH;
        planeObject["altitude"] = altitudeKM;
        planeObject["departureAirport"] = departureAirport[0].name;
        planeObject["arrivalAirport"] = arrivalAirport[0].name;
        planeObject["departureLocal"] = departureLocal;
        planeObject["arrivalLocal"] = arrivalLocal;
        planeObject["delay"] = delay;

        planeArray.push(planeObject);
        localStorage.setItem("planes",JSON.stringify(planeArray));
        $(".actionButton").remove();
        if(favouritesArray.indexOf(callsign) < 0){
            $(".modal-footer").append('<button onclick="manageFavourite(\''+callsign+'\')" type="button" class="actionButton btn btn-success">Add to favourites</button>');
        } else {
            $(".modal-footer").append('<button onclick="manageFavourite(\''+callsign+'\')" type="button" class="actionButton btn btn-danger">Remove from favourites</button>');
        }
            $("#objectModal").modal('show');
    }
    return false;
}

function airportClick(event){
    event = event || window.event;
    if(event.target.id != ""){
        var selectedAirport = document.getElementById(event.target.id);
        var name = selectedAirport.getAttribute("data-name");
        var iata = selectedAirport.getAttribute("data-iata");
        var size = selectedAirport.getAttribute("data-size");
        $(".actionButton").remove();
        $("#modalLabel").text(name);
        $(".modal-body").html('' +
        '<dl class="dl-horizontal">' +
        '<dt>Name</dt>' +
        '<dd>'+name+'</dd>' +
        '<dt>IATA</dt>' +
        '<dd>'+iata+'</dd>' +
        '<dt>Size</dt>' +
        '<dd>'+size+'</dd>' +
        '</dl>');
        $("#objectModal").modal('show');
    }
    return false;
}



function zoomPlane(plane) {
    var x = plane.attr("cx");
    var y = plane.attr("cy");

    var scale = 5;

    svg.transition().duration(3000)
        .call(zoom.translate([((x * -scale) + (width / 2)), ((y * -scale) + height / 2)])
            .scale(scale).event);

}
/* Typeahead methods*/

var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
        var matches, substringRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
                matches.push(str);
            }
        });

        cb(matches);
    };
};

$('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'planeBH',
        source: substringMatcher(planeCallsignArray)
    });

$('.typeahead').bind('typeahead:select', function(ev, planeID) {
    var oldFlight = d3.select(document.getElementById(getCookieByName("selectedFlight")));
    oldFlight.attr("class","");
    var selectedFlight = d3.select(document.getElementById(planeID));
    selectedFlight.attr("class","selected");
    document.cookie = "selectedFlight="+planeID;
    zoomPlane(selectedFlight);
});
$('.typeahead').keypress(function(e){
   if(e.which == 13){
       var oldFlight = d3.select(document.getElementById(getCookieByName("selectedFlight")));
       oldFlight.attr("class","");
       var planeID = $(this).val();
       var selectedFlight = d3.select(document.getElementById(planeID));
       selectedFlight.attr("class","selected");
       document.cookie = "selectedFlight="+planeID;
       zoomPlane(selectedFlight);
   }
});
$('.typeahead').click(function(){
   $(this).val('');
});
/* Cookies getter */
function getCookieByName(name) {
    if (!name) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
}
