/**
 * Created by Tomas on 7. 7. 2015.
 */

var ROUTE_COLOR = "#717171"; //2382FF
var BORDER_CLICKED_ROUTE_COLOR = "#6F9000";
var CLICKED_ROUTE_COLOR = "#90BB00";

var ROUTE_OPACITY = 0.5;
var CLICKED_ROUTE_OPACITY = 1;

var ROUTE_WEIGHT = 7;
var CLICKED_ROUTE_WEIGHT = 5;

var MAX_SEGMENT_DISTANCE = 50;

var ELEVATION_SEGMENTS = 0;
var SPEED_SEGMENTS = 1;


function getPlans() {
    if (destinationMarker.getLatLng() != null && startMarker.getLatLng() != null) {
        $.ajax({
            url: "http://its.felk.cvut.cz/cycle-planner-mc/api/v2/journeys/mc?startLat=" + startMarker.getLatLng().lat
            + "&startLon=" + startMarker.getLatLng().lng
            + "&endLat=" + destinationMarker.getLatLng().lat
            + "&endLon=" + destinationMarker.getLatLng().lng,

            success: handler
        });
    }
}

var elevationRoutes = L.layerGroup();
var speedRoutes = L.layerGroup();
var basicRoutes = L.layerGroup();
var segColoredClickedRoute;
var segColoredClickedRouteIndex;
var segChoice = ELEVATION_SEGMENTS;

function handler(obj) {
    if (segColoredClickedRoute != null) {
        map.removeLayer(segColoredClickedRoute);
    }
    document.getElementById("routes-panel").innerHTML = "";
    elevationRoutes.clearLayers();
    speedRoutes.clearLayers();
    basicRoutes.clearLayers();
    for (var i = 0; i < obj.plans.length; i++) {
        var oneElevationRoute = L.layerGroup();
        var oneSpeedRoute = L.layerGroup();
        var pathLatLngs = [];
        var oneBasicRouteLatLngs = [];
        var k = 0;
        var elevationA = obj.plans[i].steps[0].coordinate.elevation;
        var distance = 0;
        var time = 0;

        for (var j = 0; j < (obj.plans[i].steps.length); j++) {
            pathLatLngs[k] = L.latLng(obj.plans[i].steps[j].coordinate.latE6 / 1000000,
                obj.plans[i].steps[j].coordinate.lonE6 / 1000000);
            oneBasicRouteLatLngs[j] = pathLatLngs[k];

            if (distance > MAX_SEGMENT_DISTANCE || j == obj.plans[i].steps.length-1) {
                var clickedRouteOptions = {
                    color: CLICKED_ROUTE_COLOR,
                    weight: CLICKED_ROUTE_WEIGHT,
                    opacity: CLICKED_ROUTE_OPACITY,
                    lineJoin: 'round',
                    lineCap: 'butt', //"butt"
                    //dashArray: "5, 10",
                    smoothFactor: 1
                    //noClip: false
                }

                var oneElevationPath = L.polyline(pathLatLngs, clickedRouteOptions);
                var oneSpeedPath = L.polyline(pathLatLngs, clickedRouteOptions);

                var elevationB = obj.plans[i].steps[j].coordinate.elevation;
                var elevationPerc = 100*(elevationB - elevationA) / distance;

                if (elevationPerc > 10) {
                    oneElevationPath.setStyle({color: "#FF0000"});
                } else if (elevationPerc > 7) {
                    oneElevationPath.setStyle({color: "#FF5D54"});
                } else if (elevationPerc > 4) {
                    oneElevationPath.setStyle({color: "#FFC000"});
                }  else if (elevationPerc < -10){
                    oneElevationPath.setStyle({color: "#0040FF"});
                } else if (elevationPerc < -7) {
                    oneElevationPath.setStyle({color: "#0080FF"});
                } else if (elevationPerc < -4) {
                    oneElevationPath.setStyle({color: "#15B0FF"});
                }

                var speedInKmh = (distance/time) * 3.6;

                if (speedInKmh < 5) {
                    oneSpeedPath.setStyle({color: "#FF0000"});
                } else if (speedInKmh < 10) {
                    oneSpeedPath.setStyle({color: "#FF5D54"});
                } else if (speedInKmh < 15) {
                    oneSpeedPath.setStyle({color: "#FFC000"});
                }  else if (speedInKmh > 30){
                    oneSpeedPath.setStyle({color: "#0040FF"});
                } else if (speedInKmh > 25) {
                    oneSpeedPath.setStyle({color: "#0080FF"});
                } else if (speedInKmh > 20) {
                    oneSpeedPath.setStyle({color: "#15B0FF"});
                }


                oneElevationRoute.addLayer(oneElevationPath);
                oneSpeedRoute.addLayer(oneSpeedPath);

                elevationA = elevationB;
                distance = obj.plans[i].steps[j].distanceToNextStep;
                time = obj.plans[i].steps[j].travelTimeToNextStep;
                k = 1;
                pathLatLngs = [];
                pathLatLngs[0] = L.latLng(obj.plans[i].steps[j].coordinate.latE6 / 1000000,
                    obj.plans[i].steps[j].coordinate.lonE6 / 1000000);
            } else {
                distance += obj.plans[i].steps[j].distanceToNextStep;
                time += obj.plans[i].steps[j].travelTimeToNextStep;
                k++;
            }
        }
        elevationRoutes.addLayer(oneElevationRoute);
        speedRoutes.addLayer(oneSpeedRoute);

        var oneBasicRoute = L.polyline(oneBasicRouteLatLngs, {
            color: ROUTE_COLOR,
            weight: ROUTE_WEIGHT,
            opacity: ROUTE_OPACITY,
            lineJoin: 'round',
            lineCap: 'round', //"butt"
            //dashArray: "5, 10",
            smoothFactor: 1
            //noClip: false
        });
        oneBasicRoute.on('click', routeClick);
        basicRoutes.addLayer(oneBasicRoute);
        createButtonForRoute(obj, i);
        createPanelForRoute(obj, i);
    }
    basicRoutes.addTo(map);

    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            segColoredClickedRoute = elevationRoutes.getLayers()[0];
            segColoredClickedRouteIndex = 0;
            break;
        case SPEED_SEGMENTS:
            segColoredClickedRoute = speedRoutes.getLayers()[0];
            segColoredClickedRouteIndex = 0;
            break;
    }
    legend.addTo(map);
    changeLegend(segChoice);
}

function routeClick(e) {
    $(".routeBut").trigger("click");
    //routeButtonClick(basicRoutes.getLayers().indexOf(e.target));
}

function createButtonForRoute1(obj, routeIndex) {
    var div = document.getElementById("routes-panel");
    div.style.display = "block";
    var button = document.createElement("BUTTON");
    button.setAttribute("type", "button");
    button.setAttribute("id", "routeButton");
    button.setAttribute("onClick", "routeButtonClick(" + routeIndex + ")");
    var text = document.createTextNode(
        routeIndex + ". trasa: " +
        (obj.plans[routeIndex].length / 1000).toFixed(1) + " km, " +
        (obj.plans[routeIndex].duration / 60).toFixed(0) + " min, " +
        obj.plans[routeIndex].elevationGain + " m");
    div.appendChild(button);
    //document.getElementById("basicRoutes").innerHTML += button;
}

function createButtonForRoute(obj, routeIndex) {
    //document.getElementById("routes").innerHTML += "<button class='routeBut'>" +
    //    "        <table border='1' width='100%'>" +
    //    "        <tr>" +
    //    "        <td width='19%'><img src='' /></td>" +
    //    "        <td width='81%'>Under<hr> Construction</td>" +
    //    "    </tr>" +
    //    "    </table>" +
    //    "    </button>";

    var routeButton = $("<button>").addClass("btn btn-default routeBut col-md-4");
    var routeDiv = $("<div>").addClass("routeDesc");
    //var routeDiv = $("<div>").addClass("routeDiv");
    var routeSpan1 = $("<i>").text(" " + (obj.plans[routeIndex].length / 1000).toFixed(1) + " km");
    routeSpan1.addClass("fa fa-arrows-v");
    var routeSpan2 = $("<i>").text(" " + (obj.plans[routeIndex].duration / 60).toFixed(0) + " min");
    routeSpan2.addClass("fa fa-clock-o");
    var routeSpan3 = $("<i>").text(" " + obj.plans[routeIndex].elevationGain + " m");
    routeSpan3.addClass("fa fa-area-chart");

    routeSpan1.appendTo(routeDiv);
    $("<hr>").appendTo(routeDiv);
    routeSpan2.appendTo(routeDiv);
    $("<hr>").appendTo(routeDiv);
    routeSpan3.appendTo(routeDiv);
    routeDiv.appendTo(routeButton);
    routeButton.appendTo("#routes-panel");

    routeButton.attr("onClick", "routeButtonClick(" + routeIndex + ")")
    $(".routeBut").click(function() {
        $(".routeBut").removeClass("current");
        $(this).addClass("current");
        //$(this).prependTo("#routes-panel");
    });
    $("#routes-panel").show();

}



function routeButtonClick(routeIndex) {
    //map.removeLayer(basicRoutes);


    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            showSegments(elevationRoutes, routeIndex);
            break;
        case SPEED_SEGMENTS:
            showSegments(speedRoutes, routeIndex);
            break;
    }
}

function createPanelForRoute(obj, routeIndex) {
    $("#accordion").append(
        "<div class='panel panel-default'>" +
            "<div class='panel-heading' data-toggle='collapse' data-parent='#accordion' href='#collapse" + routeIndex + "'>" +
                "<p>Route " + routeIndex +"</p>" +
            "</div>" +
            "<div id='collapse" + routeIndex +"' class='panel-collapse collapse'>" +
                "<div class='panel-body'>Lorem ipsum dolor sit amet, consectetur adipisicing elit," +
                    "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam," +
                    "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." +
                "</div>" +
            "</div>" +
        "</div>");
}
//<div class="panel panel-default">
//    <div class="panel-heading" data-toggle="collapse" data-parent="#accordion" href="#collapse1">
//    <p >Collapsible Group 1</p>
//</div>
//<div id="collapse1" class="panel-collapse collapse in">
//    <div class="panel-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit,
//    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
//    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
//</div>
//</div>
//</div>

function changeSegment() {
    var form = document.getElementById("changeSegment");
    var value = form.elements["segment"].value;
    segChoice = parseInt(value);
    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            changeLegend(segChoice);
            var lastClicked = basicRoutes.getLayers()[segColoredClickedRouteIndex];
            lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
            map.removeLayer(segColoredClickedRoute);
            segColoredClickedRoute = elevationRoutes.getLayers()[0];
            segColoredClickedRouteIndex = 0;
            break;
        case SPEED_SEGMENTS:
            changeLegend(segChoice);
            var lastClicked = basicRoutes.getLayers()[segColoredClickedRouteIndex];
            lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
            map.removeLayer(segColoredClickedRoute);
            segColoredClickedRoute = speedRoutes.getLayers()[0];
            segColoredClickedRouteIndex = 0;
            break;
    }

}

function showSegments(segmentRoutes, routeIndex) {
    var lastClicked = basicRoutes.getLayers()[segmentRoutes.getLayers().indexOf(segColoredClickedRoute)];
    lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
    basicRoutes.getLayers()[routeIndex].bringToFront();
    basicRoutes.getLayers()[routeIndex].setStyle({color: BORDER_CLICKED_ROUTE_COLOR, opacity: 1, weight: ROUTE_WEIGHT})
    map.removeLayer(segColoredClickedRoute);
    map.addLayer(segmentRoutes.getLayers()[basicRoutes.getLayers().indexOf(basicRoutes.getLayers()[routeIndex])]);
    segColoredClickedRoute = segmentRoutes.getLayers()[basicRoutes.getLayers().indexOf(basicRoutes.getLayers()[routeIndex])];
    segColoredClickedRouteIndex = routeIndex;
}