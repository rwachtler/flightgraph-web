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
if(isMobile){
    scale = 2000;
}
else{
    scale = width / 2 / Math.PI;
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
        .attr("height", height)
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
function addpoint(lat,lon,type,text) {


    var x = projection([lat,lon])[0];
    var y = projection([lat,lon])[1];
    var gpoint = g.append("g").attr("class", "gpoint");

    var color = "";
    if(type == "user"){
        color = "#22a7f0";
    }
    else{
        color = "red";
    }

    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class","point")
        .attr("r", 2)
        .style("fill", color);

    //conditional in case a point has no associated text
    if(text.length>0){

    }

}

function setupAirports(){
    d3.json("data/airports.topo.json", function(error, airport) {
        var airports = topojson.feature(airport, airport.objects.airports).features;
        //airportTopo = airports;
        airports.forEach(function(airport){
            //console.log("0: " + airport.geometry.coordinates[0] + " 1: "+airport.geometry.coordinates[1])
            addpoint(airport.geometry.coordinates[0], airport.geometry.coordinates[1], "airport", "");
        });
    });
}

function success(pos) {
    coordinates = pos.coords;
    setup(width,height);
};

function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
};