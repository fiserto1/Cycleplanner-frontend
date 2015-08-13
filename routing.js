/**
 * Created by Tomas on 7. 7. 2015.
 */

var ROUTE_COLOR = "#717171"; //2382FF
var BORDER_ROUTE_COLOR = "#6F9000";
var CLICKED_ROUTE_COLOR = "#90BB00";

var ROUTE_OPACITY = 0.5;
var BORDER_ROUTE_OPACITY = 1;
var CLICKED_ROUTE_OPACITY = 1;

var ROUTE_WEIGHT = 7;
var BORDER_ROUTE_WEIGHT = 8;
var CLICKED_ROUTE_WEIGHT = 5;

var MAX_SEGMENT_DISTANCE = 50;

var ELEVATION_SEGMENTS = 0;
var SPEED_SEGMENTS = 1;
var SURFACE_SEGMENTS = 2;
var ROAD_TYPE_SEGMENTS = 3;

var basicRouteOptions;
var borderRouteOptions;
var segmentRouteOptions;

var segmentRoute;
var lastClickedRoute;
$(document).ready(function() {
    $(".legend-button").click(function(e) {
        segChoice = $(e.target).parent().index();
        var routeIndex = basicRoutes.getLayers().indexOf(lastClickedRoute);
        showSegments(routeIndex, response.plans[routeIndex])
    });
    basicRouteOptions = {
        color: ROUTE_COLOR,
        weight: ROUTE_WEIGHT,
        opacity: ROUTE_OPACITY,
        lineJoin: 'round',
        lineCap: 'round', //"butt"
        //dashArray: "5, 10",
        smoothFactor: 1
        //noClip: false
    };
    segmentRouteOptions = {
        color: CLICKED_ROUTE_COLOR,
        weight: CLICKED_ROUTE_WEIGHT,
        opacity: CLICKED_ROUTE_OPACITY,
        lineJoin: 'round',
        lineCap: 'butt', //"butt"
        //dashArray: "5, 10",
        smoothFactor: 1
        //noClip: false
    };
    borderRouteOptions = {
        color: BORDER_ROUTE_COLOR,
        weight: BORDER_ROUTE_WEIGHT,
        opacity: BORDER_ROUTE_OPACITY,
        lineJoin: 'round',
        lineCap: 'round', //"butt"
        //dashArray: "5, 10",
        smoothFactor: 1
        //noClip: false
    }
    segmentRoute = L.layerGroup();
});

function hidePanelsExceptSearch() {
    $("#routes-panel").html("").hide();
    $("#legend").hide();
    $("#chart-panel").hide();
    $("#error-panel").hide();
}

function removeSegmentRouteFromMap() {
    if (segmentRoute != null) {
        map.removeLayer(segmentRoute);
        segmentRoute.clearLayers();
    }
}
function removeAllRoutesFromMap() {
    removeSegmentRouteFromMap();
    map.removeLayer(basicRoutes);
    basicRoutes.clearLayers();
    elevationRoutes.clearLayers();
    speedRoutes.clearLayers();
    roadTypeRoutes.clearLayers();
    surfaceRoutes.clearLayers();
}

function getPlans() {
    if (destinationMarker.getLatLng() != null && startMarker.getLatLng() != null) {
        $.ajax({
            url: "http://its.felk.cvut.cz/cycle-planner-mc/api/v2/journeys/mc?startLat=" + startMarker.getLatLng().lat
            + "&startLon=" + startMarker.getLatLng().lng
            + "&endLat=" + destinationMarker.getLatLng().lat
            + "&endLon=" + destinationMarker.getLatLng().lng,

            success: handler,
            error: serverError
        });
    } else {
        removeAllRoutesFromMap();
        hidePanelsExceptSearch();
    }
}
function serverError(xhr,status,error) {
    removeAllRoutesFromMap();
    hidePanelsExceptSearch();
    //var text = xhr.responseText;
    //console.log(xhr.status);

    //BAD REQUEST
    var errorCode = xhr.status;
    if (errorCode == 400) {
        $("#error-panel").text("Zde není možné nalézt trasy.").show();
    } else if (errorCode >= 500 && errorCode < 510) {
        $("#error-panel").text("Server nyní není dostupný.").show();
    }
}

var allChartOptions = [];

var elevationRoutes = L.layerGroup();
var speedRoutes = L.layerGroup();
var roadTypeRoutes = L.layerGroup();
var surfaceRoutes = L.layerGroup();
var basicRoutes = L.layerGroup();
var segColoredClickedRoute;
var segColoredClickedRouteIndex;
var segChoice = ELEVATION_SEGMENTS;
var response;

function handler(obj) {
    response = obj;
    console.log(obj);
    allChartOptions = []; //TODO prepsat na lokalni promennou
    removeAllRoutesFromMap();
    hidePanelsExceptSearch();
    var plans = obj.plans;
    for (var i = 0; i < plans.length; i++) {
        var oneBasicRouteLatLngs = [];
        var distanceFromStart = 0;
        var XYData = []; //TODO graf bude taky lazy nacitanej
        var minElevation = Number.MAX_VALUE;
        var maxElevation = Number.MIN_VALUE;
        var steps = plans[i].steps;
        for (var j = 0; j < (steps.length); j++) {
            var coordinate = steps[j].coordinate;
            var lat = coordinate.latE6 / 1000000;
            var lng = coordinate.lonE6 / 1000000;
            XYData.push([distanceFromStart, coordinate.elevation]);
            maxElevation = Math.max(maxElevation, coordinate.elevation);
            minElevation = Math.min(minElevation, coordinate.elevation);
            distanceFromStart += steps[j].distanceToNextStep;
            oneBasicRouteLatLngs.push(L.latLng(lat, lng));
        }
        var chOptions = {
            max: maxElevation,
            min: minElevation,
            data: XYData
        };
        allChartOptions.push(chOptions);

        var oneBasicRoute = L.polyline(oneBasicRouteLatLngs, basicRouteOptions);
        oneBasicRoute.on('click', routeClick);
        basicRoutes.addLayer(oneBasicRoute);
        createButtonForRoute(plans[i], i);
    }
    basicRoutes.addTo(map);
    $("#routes-panel").show();

}

function routeClick(e) {
    var routeIndex = basicRoutes.getLayers().indexOf(e.target);
    var button = $("#route-but").eq(routeIndex);
    button.trigger("click").focus();
}

function createButtonForRoute(plan, routeIndex) {
    var routeButton = $("<button>").addClass("btn btn-default route-but col-md-4");
    var routeDiv = $("<div>").addClass("route-desc");
    var routeSpan1 = $("<i>").addClass("fa fa-arrows-v");
    var planLength = (plan.length / 1000).toFixed(1);
    var planDuration = (plan.duration / 60).toFixed(0);
    routeSpan1.text(" " + planLength + " km");
    var routeSpan2 = $("<i>").addClass("fa fa-clock-o");
    routeSpan2.text(" " + planDuration + " min");
    var routeSpan3 = $("<i>").addClass("fa fa-area-chart");
    routeSpan3.text(" " + plan.elevationGain + " m");

    routeSpan1.appendTo(routeDiv);
    $("<hr>").appendTo(routeDiv);
    routeSpan2.appendTo(routeDiv);
    $("<hr>").appendTo(routeDiv);
    routeSpan3.appendTo(routeDiv);
    routeDiv.appendTo(routeButton);
    routeButton.appendTo("#routes-panel");
    routeButton.click({param1: routeIndex, param2: plan}, routeButtonClick);
}



function routeButtonClick(e) {
    var routeIndex = e.data.param1;
    var plan = e.data.param2;
    showSegments(routeIndex, plan);

    $("#chart-panel").show();
    $("#legend").show();
    createChart(allChartOptions[routeIndex], routeIndex);
}




function changeSegment(choice, routeIndex) {
    segChoice = choice;
    showSegments(routeIndex, response.plans[routeIndex]);
    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            //changeLegend(segChoice);
            var lastClicked = basicRoutes.getLayers()[segColoredClickedRouteIndex];
            lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
            map.removeLayer(segColoredClickedRoute);
            segColoredClickedRoute = elevationRoutes.getLayers()[segColoredClickedRouteIndex].addTo(map);
            //segColoredClickedRouteIndex = 0;
            break;
        case SPEED_SEGMENTS:
            //changeLegend(segChoice);
            var lastClicked = basicRoutes.getLayers()[segColoredClickedRouteIndex];
            lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
            map.removeLayer(segColoredClickedRoute);
            segColoredClickedRoute = speedRoutes.getLayers()[segColoredClickedRouteIndex].addTo(map);
            //segColoredClickedRouteIndex = 0;
            break;
        case SURFACE_SEGMENTS:
            //changeLegend(segChoice);
            var lastClicked = basicRoutes.getLayers()[segColoredClickedRouteIndex];
            lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
            map.removeLayer(segColoredClickedRoute);
            segColoredClickedRoute = surfaceRoutes.getLayers()[segColoredClickedRouteIndex].addTo(map);
            //segColoredClickedRouteIndex = 0;
            break;
        case ROAD_TYPE_SEGMENTS:
            //changeLegend(segChoice);
            var lastClicked = basicRoutes.getLayers()[segColoredClickedRouteIndex];
            lastClicked.setStyle({color: ROUTE_COLOR, opacity: ROUTE_OPACITY, weight: ROUTE_WEIGHT});
            map.removeLayer(segColoredClickedRoute);
            segColoredClickedRoute = roadTypeRoutes.getLayers()[segColoredClickedRouteIndex].addTo(map);
            //segColoredClickedRouteIndex = 0;
            break;
    }

}

function showSegments(routeIndex, plan) {

    removeSegmentRouteFromMap();
    chooseTypeOfSegments(plan, routeIndex);

    if (lastClickedRoute != null) {
        L.setOptions(lastClickedRoute, basicRouteOptions); //TODO setOptions nefunguje
    }
    basicRoutes.getLayers()[routeIndex].bringToFront();
    L.setOptions(basicRoutes.getLayers()[routeIndex], borderRouteOptions); //TODO setOptions nefunguje
    lastClickedRoute = basicRoutes.getLayers()[routeIndex];
    segmentRoute.addTo(map);
}

function chooseTypeOfSegments(plan, routeIndex) {
    switch (segChoice) {
        case ELEVATION_SEGMENTS:
            showElevationSegments(plan, routeIndex);
            break;
        case SPEED_SEGMENTS:
            showSpeedSegments(plan, routeIndex);
            break;
        case SURFACE_SEGMENTS:
            showSurfaceSegments(plan, routeIndex);
            break;
        case ROAD_TYPE_SEGMENTS:
            showRoadTypeSegments(plan, routeIndex);
            break;
    }
}
function showElevationSegments(plan, routeIndex) {
    var pathLatLngs = [];
    var elevationA = plan.steps[0].coordinate.elevation;
    var segmentDistance = 0;
    var steps = plan.steps;
    for (var i = 0; i < steps.length; i++) {
        var coordinate = steps[i].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        pathLatLngs.push(L.latLng(lat, lng));

        if (segmentDistance > MAX_SEGMENT_DISTANCE || i == steps.length-1) {
            var oneElevationPath = L.polyline(pathLatLngs, segmentRouteOptions);
            var elevationB = coordinate.elevation;
            var elevationPerc = 100*(elevationB - elevationA) / segmentDistance;

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
            segmentRoute.addLayer(oneElevationPath);

            elevationA = elevationB;
            segmentDistance = steps[i].distanceToNextStep;
            pathLatLngs = [];
            pathLatLngs.push(L.latLng(lat, lng));
        } else {
            segmentDistance += steps[i].distanceToNextStep;
        }
    }
}

function showSpeedSegments(plan, routeIndex) {
    var pathLatLngs = [];
    var segmentDistance = 0;
    var time = 0;
    var steps = plan.steps;
    for (var i = 0; i < steps.length; i++) {
        var coordinate = steps[i].coordinate;
        var lat = coordinate.latE6 / 1000000;
        var lng = coordinate.lonE6 / 1000000;
        pathLatLngs.push(L.latLng(lat, lng));

        if (segmentDistance > MAX_SEGMENT_DISTANCE || i == steps.length-1) {
            var oneSpeedPath = L.polyline(pathLatLngs, segmentRouteOptions);


            var speedInKmh = (segmentDistance/time) * 3.6;

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
            segmentRoute.addLayer(oneSpeedPath);

            segmentDistance = steps[i].distanceToNextStep;
            time = plan.steps[i].travelTimeToNextStep;
            pathLatLngs = [];
            pathLatLngs.push(L.latLng(lat, lng));
        } else {
            segmentDistance += steps[i].distanceToNextStep;
            time += plan.steps[i].travelTimeToNextStep;
        }
    }
}

function showSurfaceSegments(plan, routeIndex) {
    //TODO se zmenou povrchu se obarvi segment (co kdyz bude pouze jeden bod mit odlisny povrch - zanedbat nebo vytvorit circle)
    // nebo zase pouzit stejne delky segmentu jako u rychlosti a stoupani, akorat vybrat nejcastejsi tag

    //var steps = plan.steps;
    //var previousSurface = null;
    //var segmentLatLngs = [];
    //for (var i = 0; i < steps.length; i++) {
    //    var coordinate = steps[i].coordinate;
    //    var lat = coordinate.latE6 / 1000000;
    //    var lng = coordinate.lonE6 / 1000000;
    //    segmentLatLngs.push(L.latLng(lat, lng));
    //    var currentSurface = plan.steps[i].surface;
    //    if (previousSurface != null) {
    //        while (currentSurface == previousSurface) {
    //
    //        }
    //        var oneSurfacePath = L.polyline(segmentLatLngs, segmentRouteOptions);
    //        if (currentSurface == "PAVED_SMOOTH") {
    //            oneSurfacePath.setStyle({color: "#15B0FF"});
    //        } else if (currentSurface == "PAVED_COBBLESTONE") {
    //            oneSurfacePath.setStyle({color: "#FF0000"});
    //        } else if (currentSurface == "UNPAVED") {
    //            oneSurfacePath.setStyle({color: "#FFC000"});
    //        } else if (currentSurface != null){
    //            console.log(currentSurface);
    //        }
    //        segmentRoute.addLayer(oneSurfacePath);
    //    }
    //    previousSurface = currentSurface;
    //}
}
function showRoadTypeSegments(plan, routeIndex) {
    //TODO stejny problem jako u surface segmentu
    //var steps = plan.steps;
    //for (var i = 0; i < steps.length; i++) {
    //    var coordinate = steps[i].coordinate;
    //    var lat = coordinate.latE6 / 1000000;
    //    var lng = coordinate.lonE6 / 1000000;
    //    var oneRoadTypePath = L.polyline(L.latLng(lat, lng), segmentRouteOptions);
    //    var currentRoadType = plan.steps[i].roadType;
    //
    //    if (currentRoadType == "PRIMARY") {
    //        oneRoadTypePath.setStyle({color: "#FF0000"});
    //    } else if (currentRoadType == "SECONDARY") {
    //        oneRoadTypePath.setStyle({color: "#FF5D54"});
    //    } else if (currentRoadType == "TERTIARY") {
    //        oneRoadTypePath.setStyle({color: "#FF8115"});
    //    } else if (currentRoadType == "ROAD") {
    //        oneRoadTypePath.setStyle({color: "#FFC000"});
    //    } else if (currentRoadType == "STEPS"){
    //        oneRoadTypePath.setStyle({color: "#0040FF"});
    //    } else if (currentRoadType == "FOOTWAY") {
    //        oneRoadTypePath.setStyle({color: "#0080FF"});
    //    } else if (currentRoadType == "CYCLEWAY") {
    //        oneRoadTypePath.setStyle({color: "#15B0FF"});
    //    } else if (currentRoadType != null) {
    //        console.log(currentRoadType);
    //    }
    //    segmentRoute.addLayer(oneRoadTypePath);
    //}
}